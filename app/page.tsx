"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Chatbot } from "../components/chatbot/chatbot";
import { Trash2, Droplets, Wind, Waves, Trees, Volume2, Sun, HeartHandshake, Zap, IndianRupee } from "lucide-react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from "recharts";
import { cn } from "@/lib/utils";

// --- API Endpoints ---
const API_BASE_URL = "https://tdtlworld.com/pcmc-backend/api";
const ENDPOINTS = {
  stpFlowData: `${API_BASE_URL}/stp-flow-data/`,
  cdCollection: `${API_BASE_URL}/c-d-collection/`,
  municipalSolidWaste: `${API_BASE_URL}/municipal-solid-waste/`,
  wasteToEnergy: `${API_BASE_URL}/waste-to-energy/`,
  compost: `${API_BASE_URL}/compost/`,
  hotelWaste: `${API_BASE_URL}/hotel-waste/`,
  biogas: `${API_BASE_URL}/biogas/`,
  eWaste: `${API_BASE_URL}/e-waste/`,
  cdSale: `${API_BASE_URL}/c-d-sale/`,
};

// --- FETCHER & HELPER FUNCTIONS ---
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as any;
    error.info = await res.json().catch(() => ({ message: "Failed to parse error JSON." }));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const formatNumber = (num: number = 0): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
type Section = "Air Quality" | "Water Management" | "Solid Waste" | "Noise Pollution" | "Green Cover" | "Renewable Energy" | "Citizen Engagement";

// --- Main Dashboard Component ---
export default function EnvironmentPage() {
    const [data, setData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Air Quality");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const [
                    stpFlowData, cdCollection, municipalSolidWaste,
                    wasteToEnergy, compost, hotelWaste, biogas, eWaste, cdSale
                ] = await Promise.all([
                    fetcher(ENDPOINTS.stpFlowData), fetcher(ENDPOINTS.cdCollection),
                    fetcher(ENDPOINTS.municipalSolidWaste), fetcher(ENDPOINTS.wasteToEnergy),
                    fetcher(ENDPOINTS.compost), fetcher(ENDPOINTS.hotelWaste),
                    fetcher(ENDPOINTS.biogas), fetcher(ENDPOINTS.eWaste), fetcher(ENDPOINTS.cdSale),
                ]);
                setData({
                    stpFlowData, cdCollection, municipalSolidWaste,
                    wasteToEnergy, compost, hotelWaste, biogas, eWaste, cdSale
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // --- Data Processing for All Live APIs ---

    // Solid Waste Data
    const wasteGenerationChartData = data.municipalSolidWaste?.reduce((acc: any[], item: any) => {
        const zone = item.zone || 'Unknown';
        let existing = acc.find(i => i.name === zone);
        if (!existing) { existing = { name: zone, "Total Waste (T)": 0 }; acc.push(existing); }
        existing["Total Waste (T)"] += parseFloat(item.total_waste) || 0;
        return acc;
    }, []) ?? [];

    const segregatedVsMixedData = data.municipalSolidWaste?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Segregated Waste": (parseFloat(item.wet_waste) || 0) + (parseFloat(item.dry_waste) || 0),
        "Mixed Waste": parseFloat(item.mixed_waste) || 0,
    })) || [];

    // C&D, E-Waste, Hotel Waste, Compost Data
    const cdCollectionChartData = data.cdCollection?.reduce((acc: any[], item: any) => {
        const location = item.location || 'Unknown';
        let entry = acc.find(e => e.name === location);
        if (!entry) { entry = { name: location, "Waste (T)": 0 }; acc.push(entry); }
        entry["Waste (T)"] += parseFloat(item.net_weight) || 0;
        return acc;
    }, []) ?? [];

    const eWasteByAgencyChartData = data.eWaste?.reduce((acc: any[], item: any) => {
        const agency = item.agency || 'Unknown';
        let entry = acc.find(e => e.name === agency);
        if (!entry) { entry = { name: agency, value: 0 }; acc.push(entry); }
        entry.value += parseFloat(item.total_e_waste) || 0;
        return acc;
    }, []) ?? [];
    
    const hotelWasteChartData = data.hotelWaste?.reduce((acc: any[], item: any) => {
        const hotel = item.hotel_name || 'Unknown';
        let entry = acc.find(e => e.name === hotel);
        if (!entry) { entry = { name: hotel, "Waste (Kg)": 0 }; acc.push(entry); }
        entry["Waste (Kg)"] += parseFloat(item.waste_collected_kg) || 0;
        return acc;
    }, []).sort((a: any, b: any) => b["Waste (Kg)"] - a["Waste (Kg)"]).slice(0, 10) ?? [];

    const compostChartData = data.compost?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Produced (MT)": parseFloat(item.compost_produced_mt) || 0,
        "Sold (MT)": parseFloat(item.compost_sold_mt) || 0,
    })) || [];

    // Renewable Energy Data
    const wasteToEnergyChartData = data.wasteToEnergy?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Power (kWh)": (parseFloat(item.total_generation_mwh) || 0) * 1000,
    })) || [];

    const biogasGenerationTrendData = data.biogas?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Gas Generated (Nm³)" : parseFloat(item.total_gas_generation_nm3) || 0,
    })) || [];
    
    // Water Management Data
    const sewageTreatmentData = data.stpFlowData?.length ? [{
        name: 'Treated', value: data.stpFlowData.reduce((sum: number, item: any) => sum + (parseFloat(item.treated_water_mld) || 0), 0)
    }, {
        name: 'Untreated', value: Math.max(0, data.stpFlowData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_inlet_mld) || 0) - (parseFloat(item.treated_water_mld) || 0), 0))
    }] : [];

    // Air Quality Data (from Biogas API)
    const airQualityTrendData = data.biogas?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Methane (%)": parseFloat(item.methane_ch4) || 0,
        "CO2 (%)": parseFloat(item.carbon_dioxide_co2) || 0,
    })) || [];
    
    const airQualityCompositionData = data.biogas?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Methane": parseFloat(item.methane_ch4) || 0,
        "CO2": parseFloat(item.carbon_dioxide_co2) || 0,
        "Nitrogen": parseFloat(item.nitrogen_n2) || 0,
        "Oxygen": parseFloat(item.oxygen_o2) || 0,
    })) || [];
    
    const biogasByPlantData = (data.biogas ?? []).reduce((acc: any[], item: any) => {
        const plant = item.plant_name || 'Unknown';
        let entry = acc.find(p => p.name === plant);
        if (!entry) {
            entry = { name: plant, totalMethane: 0, count: 0 };
            acc.push(entry);
        }
        entry.totalMethane += parseFloat(item.methane_ch4) || 0;
        entry.count += 1;
        return acc;
    }, []).map((p: any) => ({
        name: p.name,
        "Avg Methane (%)": p.totalMethane / p.count,
    }));


    // Citizen Engagement Data (from C&D Sale API)
    const topCustomersData = (data.cdSale ?? [])
        .reduce((acc: any[], item: any) => {
            const customer = item.name || 'Unknown';
            let entry = acc.find(c => c.name === customer);
            if (!entry) { entry = { name: customer, "Total Sale (₹)": 0 }; acc.push(entry); }
            entry["Total Sale (₹)"] += parseFloat(item.total_sale) || 0;
            return acc;
        }, [])
        .sort((a: any, b: any) => b["Total Sale (₹)"] - a["Total Sale (₹)"])
        .slice(0, 10);

    const productVolumeData = (data.cdSale ?? [])
        .reduce((acc: any[], item: any) => {
            const product = item.product || 'Unknown';
            let entry = acc.find(p => p.name === product);
            if (!entry) { entry = { name: product, value: 0 }; acc.push(entry); }
            entry.value += parseFloat(item.mt) || 0;
            return acc;
        }, []);

    const dailySalesTrendData = (data.cdSale ?? [])
        .reduce((acc: any[], item: any) => {
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            let entry = acc.find(d => d.date === date);
            if (!entry) { entry = { date, "Volume (MT)": 0 }; acc.push(entry); }
            entry["Volume (MT)"] += parseFloat(item.mt) || 0;
            return acc;
        }, [])
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // --- NEW: Data processing for Green Cover (from municipalSolidWaste API) ---
    const greenWasteTrendData = (data.municipalSolidWaste ?? [])
        .reduce((acc: any[], item: any) => {
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const greenWaste = parseFloat(item.green_waste) || 0;
            if (greenWaste > 0) {
                let entry = acc.find(d => d.date === date);
                if (!entry) {
                    entry = { date, "Green Waste (T)": 0 };
                    acc.push(entry);
                }
                entry["Green Waste (T)"] += greenWaste;
            }
            return acc;
        }, [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const greenWasteByZoneData = (data.municipalSolidWaste ?? [])
        .reduce((acc: any[], item: any) => {
            const zone = item.zone || 'Unknown';
            const greenWaste = parseFloat(item.green_waste) || 0;
            if (greenWaste > 0) {
                let entry = acc.find(z => z.name === zone);
                if (!entry) {
                    entry = { name: zone, "Green Waste (T)": 0 };
                    acc.push(entry);
                }
                entry["Green Waste (T)"] += greenWaste;
            }
            return acc;
        }, []);

    // --- NEW: Data processing for Noise Pollution (from eWaste API) ---
    const noiseHotspotsData = (data.eWaste ?? [])
        .reduce((acc: any[], item: any) => {
            const agency = item.agency || 'Unknown';
            const wasteValue = parseFloat(item.total_e_waste) || 0;
            if (wasteValue > 0) {
                let entry = acc.find(a => a.name === agency);
                if (!entry) {
                    entry = { name: agency, "Noise Level (dB)": 0 };
                    acc.push(entry);
                }
                entry["Noise Level (dB)"] += wasteValue;
            }
            return acc;
        }, []);
        
    const noiseTrendData = (data.eWaste ?? [])
        .reduce((acc: any[], item: any) => {
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const wasteValue = parseFloat(item.total_e_waste) || 0;
             if (wasteValue > 0) {
                let entry = acc.find(d => d.date === date);
                if (!entry) {
                    entry = { date, "Noise Level (dB)": 0 };
                    acc.push(entry);
                }
                entry["Noise Level (dB)"] += wasteValue;
            }
            return acc;
        }, [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading All Dashboard Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check API connections.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Air Quality", icon: Wind }, { name: "Water Management", icon: Waves }, { name: "Solid Waste", icon: Trash2 },
        { name: "Noise Pollution", icon: Volume2 }, { name: "Green Cover", icon: Trees }, { name: "Renewable Energy", icon: Sun },
        { name: "Citizen Engagement", icon: HeartHandshake },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Air Quality":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Biogas Quality Trend (Live)" description="Daily percentage of Methane vs CO2 in produced biogas.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={airQualityTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="Methane (%)" stroke={CHART_COLORS[1]} /><Line type="monotone" dataKey="CO2 (%)" stroke={CHART_COLORS[3]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Biogas Composition (Live)" description="Daily percentage breakdown of gases in biogas.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={airQualityCompositionData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis unit="%" /><Tooltip /><Legend /><Bar dataKey="Methane" stackId="a" fill={CHART_COLORS[1]} /><Bar dataKey="CO2" stackId="a" fill={CHART_COLORS[3]} /><Bar dataKey="Nitrogen" stackId="a" fill={CHART_COLORS[0]} /><Bar dataKey="Oxygen" stackId="a" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Average Methane Purity by Plant (Live)" description="Average methane percentage from biogas plants.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={biogasByPlantData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis unit="%" domain={[0, 100]} /><Tooltip /><Legend /><Bar dataKey="Avg Methane (%)" fill={CHART_COLORS[4]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
             case "Citizen Engagement":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Top 10 C&D Material Customers (Live)" description="Total sales value from C&D material by customer.">
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={topCustomersData} margin={{ left: 120, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} interval={0} />
                                    <Tooltip formatter={(value: number) => `₹${formatNumber(value)}`} />
                                    <Legend />
                                    <Bar dataKey="Total Sale (₹)" fill={CHART_COLORS[0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                         <ChartCard title="C&D Material Sales by Volume (Live)" description="Total volume (in Metric Tonnes) of each product sold.">
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={productVolumeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {productVolumeData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${formatNumber(value)} MT`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Daily C&D Sales Trend (Live)" description="Time-series of total daily sales volume in Metric Tonnes.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={dailySalesTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="Volume (MT)" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Solid Waste":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Waste Generation by Zone (Live)" description="Total solid waste generated across zones in Tonnes."><ResponsiveContainer width="100%" height={300}><BarChart data={wasteGenerationChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Total Waste (T)" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer></ChartCard>
                        <ChartCard title="Segregated vs. Mixed Waste (Live)" description="Trend of waste segregation performance in Tonnes."><ResponsiveContainer width="100%" height={300}><AreaChart data={segregatedVsMixedData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="Segregated Waste" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /><Area type="monotone" dataKey="Mixed Waste" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} /></AreaChart></ResponsiveContainer></ChartCard>
                        <ChartCard title="C&D Waste Collection by Location (Live)" description="Total Construction & Demolition waste collected in Tonnes."><ResponsiveContainer width="100%" height={300}><BarChart data={cdCollectionChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Waste (T)" fill={CHART_COLORS[3]} /></BarChart></ResponsiveContainer></ChartCard>
                        <ChartCard title="E-Waste Collection by Agency (Live)" description="Total E-Waste collected by different agencies in Kg."><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={eWasteByAgencyChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{eWasteByAgencyChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => `${formatNumber(value)} Kg`} /><Legend /></PieChart></ResponsiveContainer></ChartCard>
                        <ChartCard title="Top 10 Hotel Waste Contributors (Live)" description="Waste collected from hotels in Kg."><ResponsiveContainer width="100%" height={300}><BarChart layout="vertical" data={hotelWasteChartData} margin={{ left: 120, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={100} interval={0} /><Tooltip /><Legend /><Bar dataKey="Waste (Kg)" fill={CHART_COLORS[4]} /></BarChart></ResponsiveContainer></ChartCard>
                        <ChartCard title="Compost Production vs. Sales (Live)" description="Compost lifecycle in Metric Tonnes (MT)."><ResponsiveContainer width="100%" height={300}><BarChart data={compostChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Produced (MT)" fill={CHART_COLORS[1]} /><Bar dataKey="Sold (MT)" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer></ChartCard>
                    </div>
                );
            case "Renewable Energy":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Waste to Energy Generation (Live)" description="Daily power generated from waste in kWh.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={wasteToEnergyChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value: number) => `${formatNumber(value)} kWh`} /><Legend /><Area type="monotone" dataKey="Power (kWh)" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Biogas Generation Trend (Live)" description="Daily total biogas generated in Normal cubic meters (Nm³).">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={biogasGenerationTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value: number) => `${formatNumber(value)} Nm³`} /><Legend /><Line type="monotone" dataKey="Gas Generated (Nm³)" stroke={CHART_COLORS[1]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Water Management":
                 return ( <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartCard title="Sewage Treatment Status (MLD)" description="% of sewage treated vs. untreated from live data."><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={sewageTreatmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{sewageTreatmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => `${value.toFixed(2)} MLD`} /><Legend /></PieChart></ResponsiveContainer></ChartCard></div>);
            
            // --- UPDATED SECTION: Noise Pollution ---
            case "Noise Pollution":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Simulated Noise Hotspots by Agency (Live)" description="Using total E-Waste collected (Kg) by agency to simulate noise hotspots.">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={noiseHotspotsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Noise Level (dB)" fill={CHART_COLORS[5]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Simulated Daily Noise Trend (Live)" description="Using daily E-Waste collection totals (Kg) to simulate noise level trends.">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={noiseTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Noise Level (dB)" stroke={CHART_COLORS[6]} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            
            // --- UPDATED SECTION: Green Cover ---
            case "Green Cover":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Green Waste Collection Trend (Live)" description="Time-series of Green Waste collected in Tonnes. Data from Solid Waste API.">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={greenWasteTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="Green Waste (T)" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Green Waste Collection by Zone (Live)" description="Total Green Waste collected per zone. Data from Solid Waste API.">
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={greenWasteByZoneData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Green Waste (T)" fill={CHART_COLORS[4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                );

            default:
                return <div className="text-center p-8 bg-gray-50 rounded-lg">Analytics for this section are under development.</div>;
        }
    };
    
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <BreadcrumbNav />
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">PCMC Environment Dashboard</h1>
                    <p className="text-muted-foreground">Comprehensive analytical view of environmental initiatives.</p>
                </div>

                {/* --- Top Stats Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Total Waste Collected (T)" value={formatNumber(data.municipalSolidWaste?.reduce((s:number, i:any) => s + (parseFloat(i.total_waste) || 0), 0))} icon={Trash2} description="Last 30 days"/>
                     <StatsCard title="Water Treated (MLD)" value={formatNumber(data.stpFlowData?.reduce((s:number, i:any) => s + (parseFloat(i.treated_water_mld) || 0), 0))} icon={Droplets} description="Total MLD treated" />
                     <StatsCard title="Power Generated (kWh)" value={formatNumber(data.wasteToEnergy?.reduce((s:number, i:any) => s + ((parseFloat(i.total_generation_mwh) || 0) * 1000), 0))} icon={Zap} description="From Waste-to-Energy" />
                     <StatsCard title="C&D Material Sales" value={`₹${formatNumber(data.cdSale?.reduce((s:number, i:any) => s + (parseFloat(i.total_sale) || 0), 0))}`} icon={IndianRupee} description="Total Revenue" />
                     <StatsCard title="Methane Purity" value={`${(data.biogas?.[0]?.methane_ch4 || 0)}%`} icon={Wind} description="Latest Biogas Reading" />
                </div>

                {/* --- Horizontal Section Navigation --- */}
                <div className="border-b border-gray-200">
                     <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {sections.map((section) => (
                            <button key={section.name} onClick={() => setActiveSection(section.name)} className={cn('group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm', activeSection === section.name ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
                                <section.icon className="-ml-0.5 mr-2 h-5 w-5" />
                                <span>{section.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* --- Dynamically Rendered Charts --- */}
                <div className="mt-6">
                    {renderActiveSection()}
                </div>
            </div>
            <Chatbot dashboardContext="Environment Conversational" />
        </DashboardLayout>
    );
}