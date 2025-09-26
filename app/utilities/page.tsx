"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Chatbot } from "@/components/chatbot/chatbot";
// FIX: Replaced the non-existent 'BuildingLandmark' icon with the correct 'Landmark' icon.
import { Trees, Waves, LayoutGrid, Shield, Landmark, Ruler, Droplets, Cpu, Smile } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// --- API Endpoint ---
const API_BASE_URL = "https://tdtlworld.com/pcmc-backend/api"; // Assuming local development
const ENDPOINTS = {
  urbanLandscape: `${API_BASE_URL}/urban-landscape/`,
};

// --- MOCK DATA FOR SECTIONS WITHOUT FULL LIVE API DATA ---
const mockData = {
    water: {
        wetlandBiodiversity: [
            { name: "Bird Species", value: 85 },
            { name: "Aquatic Life", value: 72 },
            { name: "Flora Density", value: 68 },
        ],
    },
    landUse: {
        distribution: [
            { name: "Residential", value: 45 },
            { name: "Commercial", value: 20 },
            { name: "Industrial", value: 15 },
            { name: "Green Spaces", value: 12 },
            { name: "Other", value: 8 },
        ]
    },
    resilience: {
        floodProneReduction: [
            { year: 2022, reduction: 5 },
            { year: 2023, reduction: 8 },
            { year: 2024, reduction: 12 },
            { year: 2025, reduction: 18 },
        ],
        adaptationFunds: [
            { initiative: "Stormwater Drains", allocation: 45 },
            { initiative: "Green Roofs", allocation: 25 },
            { initiative: "Urban Forests", allocation: 30 },
        ]
    },
    heritage: {
        visitors: [
            { site: "Historic Fort", visitors: 85000 },
            { site: "City Museum", visitors: 62000 },
            { site: "Public Library", visitors: 110000 },
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

const formatNumber = (num: number = 0, decimals: number = 1): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(decimals);
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];
type Section = "Green Cover & Open Spaces" | "Water Bodies & Urban Wetlands" | "Land Use, Zoning & Smart Infrastructure" | "Urban Resilience & Climate Adaptation" | "Heritage, Culture & Livability";

// --- Main Dashboard Component ---
export default function Page() {
    const [urbanData, setUrbanData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Green Cover & Open Spaces");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const landscapeData = await fetcher(ENDPOINTS.urbanLandscape);
                const sortedData = landscapeData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setUrbanData(sortedData);
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
    const chartData = urbanData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Green Cover (%)': item.green_cover,
        'Per Capita Open Space (sqm)': parseFloat(item.percapita_open_space_sqm),
        'Water Quality Index': item.water_quality_index,
        'Smart Infra Score': item.smartinfra,
        'Livability Index': parseFloat(item.livability_index),
    }));

    // --- Aggregate Stats for Top Cards ---
    const avgGreenCover = urbanData.reduce((sum, item) => sum + (item.green_cover || 0), 0) / (urbanData.length || 1);
    const avgOpenSpace = urbanData.reduce((sum, item) => sum + parseFloat(item.percapita_open_space_sqm || 0), 0) / (urbanData.length || 1);
    const latestWaterQuality = urbanData.length > 0 ? urbanData[urbanData.length - 1].water_quality_index : 0;
    const latestSmartInfra = urbanData.length > 0 ? urbanData[urbanData.length - 1].smartinfra : 0;
    const avgLivability = urbanData.reduce((sum, item) => sum + parseFloat(item.livability_index || 0), 0) / (urbanData.length || 1);

    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading Urban Landscape Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check the API connection.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Green Cover & Open Spaces", icon: Trees },
        { name: "Water Bodies & Urban Wetlands", icon: Waves },
        { name: "Land Use, Zoning & Smart Infrastructure", icon: LayoutGrid },
        { name: "Urban Resilience & Climate Adaptation", icon: Shield },
        // FIX: Using the valid 'Landmark' icon here.
        { name: "Heritage, Culture & Livability", icon: Landmark },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Green Cover & Open Spaces":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Green Cover vs. Per Capita Open Space" description="Tracking green cover (%) and open space (sqm) per person.">
                           <ResponsiveContainer width="100%" height={300}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" unit="%" label={{ value: 'Green Cover', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" unit="sqm" label={{ value: 'Open Space', angle: 90, position: 'insideRight' }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="Green Cover (%)" fill={CHART_COLORS[1]} /><Line yAxisId="right" type="monotone" dataKey="Per Capita Open Space (sqm)" stroke={CHART_COLORS[0]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Green Cover Trend" description="Percentage of the city's area covered by greenery.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis unit="%" /><Tooltip /><Legend /><Area type="monotone" dataKey="Green Cover (%)" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Water Bodies & Urban Wetlands":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Water Quality Index (WQI)" description="WQI score for major water bodies (higher is better).">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[50, 100]} /><Tooltip /><Legend /><Line type="monotone" dataKey="Water Quality Index" stroke={CHART_COLORS[4]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Wetland Biodiversity Index (Mock)" description="Health assessment of urban wetland ecosystems.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.water.wetlandBiodiversity}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis unit="/100" /><Tooltip /><Bar dataKey="value" name="Biodiversity Score" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Land Use, Zoning & Smart Infrastructure":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Smart Infrastructure Adoption Score" description="Index showing the integration of smart technologies in urban planning.">
                           <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="Smart Infra Score" stroke={CHART_COLORS[2]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Land Use Distribution (Mock)" description="Percentage breakdown of urban land use.">
                            <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={mockData.landUse.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{mockData.landUse.distribution.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => `${value}%`} /><Legend /></PieChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Urban Resilience & Climate Adaptation":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Flood Prone Area Reduction (Mock)" description="Year-on-year reduction in areas vulnerable to flooding.">
                             <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.resilience.floodProneReduction}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis unit="%" /><Tooltip /><Legend /><Bar dataKey="reduction" name="Reduction (%)" fill={CHART_COLORS[3]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Climate Adaptation Fund Allocation (Mock)" description="Budget allocation in Crores for resilience projects.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.resilience.adaptationFunds}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="initiative" /><YAxis /><Tooltip formatter={(value: number) => `₹${value} Cr`} /><Legend /><Bar dataKey="allocation" name="Allocation (Cr)" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Heritage, Culture & Livability":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Citizen Livability Index" description="Overall livability score (out of 100) from citizen feedback and metrics.">
                             <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[50, 100]} /><Tooltip /><Legend /><Line type="monotone" dataKey="Livability Index" stroke={CHART_COLORS[1]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Visitors to Public/Cultural Spaces (Mock)" description="Annual visitor count at key public and heritage sites.">
                             <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.heritage.visitors}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="site" /><YAxis /><Tooltip formatter={(value: number) => `${formatNumber(value, 0)}`} /><Legend /><Bar dataKey="visitors" name="Annual Visitors" fill={CHART_COLORS[4]} /></BarChart></ResponsiveContainer>
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
                    <h1 className="text-3xl font-bold tracking-tight">PCMC Sustainable Urban Landscape</h1>
                    <p className="text-muted-foreground">Analyzing green infrastructure, water bodies, and livability metrics.</p>
                </div>

                {/* --- Top Stats Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Average Green Cover" value={`${formatNumber(avgGreenCover, 1)}%`} icon={Trees} description="City-wide average"/>
                     <StatsCard title="Avg. Open Space" value={`${formatNumber(avgOpenSpace, 1)} sqm`} icon={Ruler} description="Per capita"/>
                     <StatsCard title="Latest Water Quality" value={formatNumber(latestWaterQuality, 0)} icon={Droplets} description="WQI Score"/>
                     <StatsCard title="Smart Infra Score" value={formatNumber(latestSmartInfra, 0)} icon={Cpu} description="Latest adoption index"/>
                     <StatsCard title="Avg. Livability Index" value={formatNumber(avgLivability, 1)} icon={Smile} description="Score out of 100"/>
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
            <Chatbot dashboardContext="Sustainable Urban Landscape" />
        </DashboardLayout>
    );
}