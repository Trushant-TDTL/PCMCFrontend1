"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
// FIX 1: Changed to a named import for the Chatbot component.
import { Chatbot } from "@/components/chatbot/chatbot";
// FIX 2: Replaced the non-existent 'CarCrash' icon with 'Siren'.
import { Bus, Clock, Zap, Siren, Footprints, Bike, ParkingCircle, Truck } from "lucide-react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";

// --- API Endpoint ---
const API_BASE_URL = "https://tdtlworld.com/pcmc-backend/api"; // Assuming local development
const ENDPOINTS = {
  transportMobility: `${API_BASE_URL}/transport-mobility/`,
};

// --- MOCK DATA FOR SECTIONS WITHOUT LIVE API DATA ---
const mockData = {
    nmt: {
        dailyUsage: [
            { day: "Mon", cyclists: 450, pedestrians: 2200 },
            { day: "Tue", cyclists: 520, pedestrians: 2400 },
            { day: "Wed", cyclists: 550, pedestrians: 2550 },
            { day: "Thu", cyclists: 530, pedestrians: 2450 },
            { day: "Fri", cyclists: 610, pedestrians: 2800 },
            { day: "Sat", cyclists: 750, pedestrians: 3500 },
            { day: "Sun", cyclists: 820, pedestrians: 3800 },
        ],
        infraStatus: [
            { name: "Well-Lit Walkways", value: 85 },
            { name: "Dedicated Cycle Tracks", value: 65 },
            { name: "Needs Maintenance", value: 15 },
        ],
    },
    parking: {
        occupancy: [
            { location: "Mall A", occupancy: 92 },
            { location: "Hospital B", occupancy: 85 },
            { location: "Station C", occupancy: 95 },
            { location: "Market D", occupancy: 78 },
        ],
        revenue: [
            { date: "09-01", revenue: 45000 },
            { date: "09-02", revenue: 48000 },
            { date: "09-03", revenue: 52000 },
            { date: "09-04", revenue: 49500 },
            { date: "09-05", revenue: 55000 },
        ],
    },
    logistics: {
        truckMovement: [
            { hour: "00:00", count: 120 },
            { hour: "02:00", count: 150 },
            { hour: "04:00", count: 180 },
            { hour: "06:00", count: 90 }, // Morning ban starts
            { hour: "22:00", count: 110 }, // Evening ban lifts
        ],
        pollutionLoad: [
            { corridor: "NH-48", load: 78 },
            { corridor: "Old Highway", load: 92 },
            { corridor: "Ring Road", load: 65 },
        ]
    }
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

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];
type Section = "Public Transport Efficiency" | "Traffic Management & Road Safety" | "Non-Motorized Transport" | "Electric Mobility & Charging Infrastructure" | "Parking & Smart Infra" | "Logistics & Freight Movement";

// --- Main Dashboard Component ---
export default function Page() {
    const [transportData, setTransportData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Public Transport Efficiency");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const mobilityData = await fetcher(ENDPOINTS.transportMobility);
                // Sort data by date to ensure charts are chronological
                const sortedData = mobilityData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setTransportData(sortedData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // --- Data Processing for Live APIs ---
    const chartData = transportData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Bus Punctuality (%)': item.bus_punctuality,
        'Average Ridership': item.avg_ridership,
        'Average Travel Time (Min)': item.avg_travel_time_min,
        'EV Charging Sessions': item.ev_charging_sessions,
        'Accidents Reported': item.accidents_reported,
    }));

    // --- Aggregate Stats for Top Cards ---
    const totalRidership = transportData.reduce((sum, item) => sum + (item.avg_ridership || 0), 0);
    const avgPunctuality = transportData.reduce((sum, item) => sum + (item.bus_punctuality || 0), 0) / (transportData.length || 1);
    const avgTravelTime = transportData.reduce((sum, item) => sum + (item.avg_travel_time_min || 0), 0) / (transportData.length || 1);
    const totalEvSessions = transportData.reduce((sum, item) => sum + (item.ev_charging_sessions || 0), 0);
    const totalAccidents = transportData.reduce((sum, item) => sum + (item.accidents_reported || 0), 0);

    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading Mobility Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check the API connection.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Public Transport Efficiency", icon: Bus },
        // FIX 3: Using the valid 'Siren' icon here.
        { name: "Traffic Management & Road Safety", icon: Siren },
        { name: "Non-Motorized Transport", icon: Bike },
        { name: "Electric Mobility & Charging Infrastructure", icon: Zap },
        { name: "Parking & Smart Infra", icon: ParkingCircle },
        { name: "Logistics & Freight Movement", icon: Truck },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Public Transport Efficiency":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Average Daily Ridership Trend" description="Daily passenger count on public transport.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="Average Ridership" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Bus Punctuality Over Time" description="Percentage of on-time bus arrivals.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[60, 100]} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="Bus Punctuality (%)" stroke={CHART_COLORS[1]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Traffic Management & Road Safety":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Daily Reported Accidents" description="Count of traffic accidents reported each day.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false}/><Tooltip /><Legend /><Bar dataKey="Accidents Reported" fill={CHART_COLORS[3]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Average Travel Time Trend" description="Average time taken in minutes for key city routes.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis unit=" min" /><Tooltip /><Legend /><Line type="monotone" dataKey="Average Travel Time (Min)" stroke={CHART_COLORS[2]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Non-Motorized Transport":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Daily NMT Usage (Mock)" description="Estimated number of cyclists and pedestrians.">
                             <ResponsiveContainer width="100%" height={300}><ComposedChart data={mockData.nmt.dailyUsage}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Legend /><Bar dataKey="pedestrians" name="Pedestrians" fill={CHART_COLORS[4]} /><Line type="monotone" dataKey="cyclists" name="Cyclists" stroke={CHART_COLORS[5]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                         <ChartCard title="NMT Infrastructure Status (Mock)" description="Percentage of safe & available infrastructure.">
                             <ResponsiveContainer width="100%" height={300}><BarChart layout="vertical" data={mockData.nmt.infraStatus} margin={{ left: 120, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" unit="%" /><YAxis dataKey="name" type="category" width={110} /><Tooltip /><Bar dataKey="value" fill={CHART_COLORS[1]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Electric Mobility & Charging Infrastructure":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Daily EV Charging Sessions" description="Total charging sessions logged across the city.">
                             <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="EV Charging Sessions" stroke={CHART_COLORS[5]} fill={CHART_COLORS[5]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="EV Sessions vs. Travel Time" description="Correlating EV usage with city traffic conditions.">
                             <ResponsiveContainer width="100%" height={300}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" label={{ value: 'Minutes', angle: 90, position: 'insideRight' }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="EV Charging Sessions" fill={CHART_COLORS[4]} /><Line yAxisId="right" type="monotone" dataKey="Average Travel Time (Min)" stroke={CHART_COLORS[2]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Parking & Smart Infra":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Peak Parking Occupancy (Mock)" description="Occupancy percentage at key locations.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.parking.occupancy}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="location" /><YAxis domain={[60, 100]} unit="%" /><Tooltip /><Bar dataKey="occupancy" name="Occupancy %" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Daily Parking Revenue (Mock)" description="Estimated daily revenue from smart parking.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={mockData.parking.revenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value: number) => `₹${formatNumber(value)}`} /><Line type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS[2]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Logistics & Freight Movement":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Night-Time Truck Movement (Mock)" description="Volume of trucks during off-peak hours.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.logistics.truckMovement}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" /><YAxis /><Tooltip /><Bar dataKey="count" name="Truck Count" fill={CHART_COLORS[3]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Freight Corridor Pollution Load (Mock)" description="Relative pollution index on major freight routes.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.logistics.pollutionLoad}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="corridor" /><YAxis /><Tooltip /><Bar dataKey="load" name="Pollution Index" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            default:
                return <div className="text-center p-8 bg-gray-50 rounded-lg">Select a section to view analytics.</div>;
        }
    };
    
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <BreadcrumbNav />
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sustainable Transport & Mobility Dashboard</h1>
                    <p className="text-muted-foreground">Monitoring key mobility metrics for a smarter, greener city.</p>
                </div>

                {/* --- Top Stats Cards with refined data --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Total Public Ridership" value={formatNumber(totalRidership)} icon={Bus} description="Across all recorded days"/>
                     <StatsCard title="Avg. Bus Punctuality" value={`${avgPunctuality.toFixed(1)}%`} icon={Clock} description="On-time performance"/>
                     <StatsCard title="Avg. Travel Time" value={`${avgTravelTime.toFixed(1)} min`} icon={Clock} description="Across key routes"/>
                     <StatsCard title="Total EV Sessions" value={formatNumber(totalEvSessions)} icon={Zap} description="Total charging events logged"/>
                     {/* FIX 4: Using the valid 'Siren' icon here for the stats card. */}
                     <StatsCard title="Total Accidents" value={formatNumber(totalAccidents)} icon={Siren} description="Total incidents reported"/>
                </div>

                {/* --- Horizontal Section Navigation --- */}
                <div className="border-b border-gray-200">
                     <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {sections.map((section) => (
                            <button key={section.name} onClick={() => setActiveSection(section.name)} className={cn('whitespace-nowrap group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm', activeSection === section.name ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
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
            <Chatbot dashboardContext="Sustainable Transport & Mobility" />
        </DashboardLayout>
    );
}