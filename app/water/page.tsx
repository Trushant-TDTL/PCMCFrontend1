"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Chatbot } from "@/components/chatbot/chatbot";
// FIX: Removed the conflicting 'BarChart' import from lucide-react. It is not a valid icon name.
import { Siren, ShieldAlert, Ambulance, HeartHandshake, Users, Clock, ShieldCheck, UserCheck } from "lucide-react";
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
  disasterResilience: `${API_BASE_URL}/disaster-resilience/`,
};

// --- MOCK DATA FOR SECTIONS WITHOUT FULL LIVE API DATA ---
const mockData = {
    response: {
        resourceAvailability: [
            { resource: "Shelters", capacity: 85 },
            { resource: "Ambulances", readiness: 95 },
            { resource: "Food Stock", level: 75 },
            { resource: "Medical Kits", level: 90 },
        ],
    },
    recovery: {
        infraRestoration: [
            { month: "Jan", progress: 15 },
            { month: "Feb", progress: 35 },
            { month: "Mar", progress: 60 },
            { month: "Apr", progress: 85 },
            { month: "May", progress: 100 },
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
type Section = "Hazard Monitoring & Early Warning" | "Vulnerability & Risk Assessment" | "Response Readiness & Resource Allocation" | "Recovery & Rehabilitation" | "Training, Awareness & Community Engagement";

// --- Main Dashboard Component ---
export default function Page() {
    const [disasterData, setDisasterData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Hazard Monitoring & Early Warning");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const resilienceData = await fetcher(ENDPOINTS.disasterResilience);
                const sortedData = resilienceData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setDisasterData(sortedData);
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
    const chartData = disasterData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Warning Coverage (%)': item.warning_coverage,
        'Average Response Time (Min)': item.avg_response_time_min,
        'Relief Beneficiaries': item.relief_beneficiaries,
        'Risk Index': parseFloat(item.risk_index),
        'Volunteers Trained': item.volunteers_trained,
        'Citizen Trust (%)': item.citizen_trust,
    }));

    // --- Aggregate Stats for Top Cards ---
    const avgWarningCoverage = disasterData.reduce((sum, item) => sum + (item.warning_coverage || 0), 0) / (disasterData.length || 1);
    const avgResponseTime = disasterData.reduce((sum, item) => sum + (item.avg_response_time_min || 0), 0) / (disasterData.length || 1);
    const totalBeneficiaries = disasterData.reduce((sum, item) => sum + (item.relief_beneficiaries || 0), 0);
    const latestRiskIndex = disasterData.length > 0 ? parseFloat(disasterData[disasterData.length - 1].risk_index) : 0;
    const totalVolunteers = disasterData.reduce((sum, item) => sum + (item.volunteers_trained || 0), 0);

    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading Disaster Resilience Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check the API connection.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Hazard Monitoring & Early Warning", icon: Siren },
        { name: "Vulnerability & Risk Assessment", icon: ShieldAlert },
        { name: "Response Readiness & Resource Allocation", icon: Ambulance },
        { name: "Recovery & Rehabilitation", icon: HeartHandshake },
        { name: "Training, Awareness & Community Engagement", icon: Users },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Hazard Monitoring & Early Warning":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Early Warning System Coverage" description="Percentage of the population covered by early warning systems.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[50, 100]} unit="%" /><Tooltip /><Legend /><Area type="monotone" dataKey="Warning Coverage (%)" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Warning Coverage vs. Citizen Trust" description="Correlating the reach of warnings with public trust in the system.">
                            <ResponsiveContainer width="100%" height={300}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" unit="%" label={{ value: 'Coverage', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" unit="%" label={{ value: 'Trust', angle: 90, position: 'insideRight' }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="Warning Coverage (%)" fill={CHART_COLORS[4]} /><Line yAxisId="right" type="monotone" dataKey="Citizen Trust (%)" stroke={CHART_COLORS[3]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Vulnerability & Risk Assessment":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="City-Wide Risk Index" description="Overall vulnerability score. A lower index indicates better resilience.">
                           <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[0, 1]} /><Tooltip /><Legend /><Line type="monotone" dataKey="Risk Index" stroke={CHART_COLORS[3]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Risk Index vs. Response Time" description="Analyzing if higher risk correlates with faster response.">
                            <ResponsiveContainer width="100%" height={300}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" unit=" min" label={{ value: 'Response Time', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" label={{ value: 'Risk Index', angle: 90, position: 'insideRight' }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="Average Response Time (Min)" fill={CHART_COLORS[2]} /><Line yAxisId="right" type="monotone" dataKey="Risk Index" stroke={CHART_COLORS[3]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Response Readiness & Resource Allocation":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Average Emergency Response Time" description="Average time taken (in minutes) for first responders to arrive.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis unit=" min" /><Tooltip /><Legend /><Line type="monotone" dataKey="Average Response Time (Min)" stroke={CHART_COLORS[2]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Emergency Resource Readiness (Mock)" description="Availability and readiness of key disaster response resources.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.response.resourceAvailability}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="resource" /><YAxis unit="%" /><Tooltip /><Bar dataKey="capacity" name="Capacity/Readiness %" fill={CHART_COLORS[4]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Recovery & Rehabilitation":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Relief Beneficiaries Reached" description="Number of citizens who received relief aid after an event.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Relief Beneficiaries" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Infrastructure Restoration Progress (Mock)" description="Percentage of critical infrastructure restored post-disaster.">
                           <ResponsiveContainer width="100%" height={300}><AreaChart data={mockData.recovery.infraRestoration}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis unit="%" /><Tooltip /><Legend /><Area type="monotone" dataKey="progress" name="Restoration %" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Training, Awareness & Community Engagement":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Community Volunteers Trained" description="Cumulative number of citizens trained in disaster response.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="Volunteers Trained" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Citizen Trust in Disaster Management" description="Public confidence level (%) in the city's disaster preparedness.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[50, 100]} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="Citizen Trust (%)" stroke={CHART_COLORS[0]} /></LineChart></ResponsiveContainer>
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
                    <h1 className="text-3xl font-bold tracking-tight">PCMC Disaster Resilience Dashboard</h1>
                    <p className="text-muted-foreground">Monitoring the city's preparedness, response, and recovery capabilities.</p>
                </div>

                {/* --- Top Stats Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Avg. Warning Coverage" value={`${formatNumber(avgWarningCoverage, 1)}%`} icon={Siren} description="Population reached"/>
                     <StatsCard title="Avg. Response Time" value={`${formatNumber(avgResponseTime, 1)} Min`} icon={Clock} description="For first responders"/>
                     <StatsCard title="Total Relief Beneficiaries" value={formatNumber(totalBeneficiaries, 0)} icon={HeartHandshake} description="Citizens aided"/>
                     <StatsCard title="Latest Risk Index" value={formatNumber(latestRiskIndex, 2)} icon={ShieldAlert} description="Lower is better"/>
                     <StatsCard title="Total Volunteers Trained" value={formatNumber(totalVolunteers, 0)} icon={UserCheck} description="Community readiness"/>
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
            <Chatbot dashboardContext="Disaster Resilience" />
        </DashboardLayout>
    );
}