"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { IndianRupee, PieChart, Rocket, FileText, Users, Landmark, Scale, Lightbulb, Handshake, Globe } from "lucide-react";
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
  financeInnovation: `${API_BASE_URL}/finance-innovation/`,
};

// --- MOCK DATA FOR SECTIONS WITHOUT LIVE API DATA ---
const mockData = {
    taxation: {
        revenueSources: [
            { name: "Property Tax", value: 450 },
            { name: "Water Tax", value: 210 },
            { name: "Development Fees", value: 180 },
            { name: "State Grants", value: 320 },
        ],
        collectionTrend: [
            { month: "Jan", "Digital Collection": 65, "Offline Collection": 35 },
            { month: "Feb", "Digital Collection": 70, "Offline Collection": 30 },
            { month: "Mar", "Digital Collection": 72, "Offline Collection": 28 },
            { month: "Apr", "Digital Collection": 75, "Offline Collection": 25 },
        ]
    },
    ppp: {
        partnerInvestment: [
            { partner: "Global Infra Ltd.", investment: 120 },
            { partner: "Eco Solutions Inc.", investment: 95 },
            { partner: "Urban Dev Corp.", investment: 80 },
        ],
        projectSectors: [
            { name: "Smart Waste Mgmt", value: 40 },
            { name: "Public Transport", value: 25 },
            { name: "Renewable Energy", value: 35 },
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
type Section = "Green Finance & ESG Investments" | "Municipal Budget & Resource Allocation" | "Smart Taxation & Revenue Innovation" | "Innovation Ecosystem & Startups" | "PPP (Public–Private Partnerships) & Global Collaborations";

// --- Main Dashboard Component ---
export default function Page() {
    const [financeData, setFinanceData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Green Finance & ESG Investments");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const innovationData = await fetcher(ENDPOINTS.financeInnovation);
                const sortedData = innovationData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setFinanceData(sortedData);
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
    const chartData = financeData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Funds Raised (Cr)': parseFloat(item.funds_raised_cr),
        'Utilization (%)': item.utilization,
        'Green Bonds Issued': item.green_bonds_issued,
        'Startups Supported': item.startups_supported,
        'Patents Filed': item.patents_filed,
        'Jobs Created': item.jobs_created,
    }));

    // --- Aggregate Stats for Top Cards ---
    const totalFundsRaised = financeData.reduce((sum, item) => sum + parseFloat(item.funds_raised_cr || 0), 0);
    const avgUtilization = financeData.reduce((sum, item) => sum + (item.utilization || 0), 0) / (financeData.length || 1);
    const totalStartups = financeData.reduce((sum, item) => sum + (item.startups_supported || 0), 0);
    const totalPatents = financeData.reduce((sum, item) => sum + (item.patents_filed || 0), 0);
    const totalJobsCreated = financeData.reduce((sum, item) => sum + (item.jobs_created || 0), 0);

    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading Finance & Innovation Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check the API connection.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Green Finance & ESG Investments", icon: Landmark },
        { name: "Municipal Budget & Resource Allocation", icon: Scale },
        { name: "Smart Taxation & Revenue Innovation", icon: Lightbulb },
        { name: "Innovation Ecosystem & Startups", icon: Rocket },
        { name: "PPP (Public–Private Partnerships) & Global Collaborations", icon: Handshake },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Green Finance & ESG Investments":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Funds Raised for Green Initiatives" description="Total funds raised (in Cr) over time for sustainable projects.">
                             <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value: number) => `₹${value.toFixed(1)} Cr`} /><Legend /><Area type="monotone" dataKey="Funds Raised (Cr)" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Green Bonds Issued Trend" description="Number of new green bonds issued over time.">
                             <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="Green Bonds Issued" stroke={CHART_COLORS[5]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Municipal Budget & Resource Allocation":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Fund Utilization vs. Funds Raised" description="Comparing funds raised (Cr) against their utilization rate (%).">
                            <ResponsiveContainer width="100%" height={300}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" label={{ value: 'Cr (₹)', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" unit="%" label={{ value: 'Utilization', angle: 90, position: 'insideRight' }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="Funds Raised (Cr)" fill={CHART_COLORS[0]} /><Line yAxisId="right" type="monotone" dataKey="Utilization (%)" stroke={CHART_COLORS[3]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Budget Allocation by Sector (Mock)" description="Estimated breakdown of municipal budget allocation.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.taxation.revenueSources}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value: number) => `₹${value} Cr`} /><Legend /><Bar dataKey="value" name="Allocation (Cr)" fill={CHART_COLORS[4]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
             case "Smart Taxation & Revenue Innovation":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Revenue Sources Breakdown (Mock)" description="Sources of municipal revenue in Crores.">
                           <ResponsiveContainer width="100%" height={300}><BarChart layout="vertical" data={mockData.taxation.revenueSources} margin={{ left: 120, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={110} /><Tooltip formatter={(value: number) => `₹${value} Cr`} /><Bar dataKey="value" name="Revenue (Cr)" fill={CHART_COLORS[2]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Digital vs. Offline Tax Collection (Mock)" description="Percentage trend of tax collection methods.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={mockData.taxation.collectionTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis unit="%" /><Tooltip /><Legend /><Area type="monotone" dataKey="Digital Collection" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} /><Area type="monotone" dataKey="Offline Collection" stackId="1" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Innovation Ecosystem & Startups":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Innovation Indicators: Startups & Patents" description="Tracking startups supported and patents filed over time.">
                             <ResponsiveContainer width="100%" height={300}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Startups Supported" fill={CHART_COLORS[4]} /><Line type="monotone" dataKey="Patents Filed" stroke={CHART_COLORS[5]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Jobs Created Through Innovation" description="Number of new jobs created from supported startups and projects.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="Jobs Created" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "PPP (Public–Private Partnerships) & Global Collaborations":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Top PPP Partner Investments (Mock)" description="Investment contribution from private partners in Crores.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.ppp.partnerInvestment}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="partner" /><YAxis /><Tooltip formatter={(value: number) => `₹${value} Cr`} /><Bar dataKey="investment" name="Investment (Cr)" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="PPP Project Distribution by Sector (Mock)" description="Breakdown of PPP projects across different sectors.">
                             <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.ppp.projectSectors}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis unit="%" /><Tooltip /><Bar dataKey="value" name="Project Share (%)" fill={CHART_COLORS[2]} /></BarChart></ResponsiveContainer>
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
                    <h1 className="text-3xl font-bold tracking-tight">CMC Sustainable Finance & Innovation</h1>
                    <p className="text-muted-foreground">An overview of financial health, investments, and innovation growth.</p>
                </div>

                {/* --- Top Stats Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Total Funds Raised" value={`₹${formatNumber(totalFundsRaised)} Cr`} icon={IndianRupee} description="For sustainable projects"/>
                     <StatsCard title="Avg. Fund Utilization" value={`${avgUtilization.toFixed(1)}%`} icon={PieChart} description="Efficiency of capital spent"/>
                     <StatsCard title="Startups Supported" value={formatNumber(totalStartups)} icon={Rocket} description="Total incubated startups"/>
                     <StatsCard title="Patents Filed" value={formatNumber(totalPatents)} icon={FileText} description="From supported innovations"/>
                     <StatsCard title="Jobs Created" value={formatNumber(totalJobsCreated)} icon={Users} description="Via innovation ecosystem"/>
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
           <Chatbot dashboardContext="Sustainable Finance & Innovation" />
        </DashboardLayout>
    );
}