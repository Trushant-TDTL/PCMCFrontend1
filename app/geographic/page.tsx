"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { ClipboardList, TrendingUp, IndianRupee, Target, Megaphone, CheckCircle, Clock, XCircle, Goal } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";

// --- API Endpoint ---
const API_BASE_URL = "https://tdtlworld.com/pcmc-backend/api"; // Assuming local development
const ENDPOINTS = {
  projectMonitoring: `${API_BASE_URL}/project-monitoring/`,
};

// --- MOCK DATA FOR SECTIONS WITHOUT LIVE API DATA ---
const mockData = {
    engagement: {
        feedback: [
            { name: "Positive Feedback", value: 450 },
            { name: "Suggestions", value: 280 },
            { name: "Grievances", value: 120 },
        ],
        publicMeetings: [
            { project: "Smart Water Meters", meetings: 12 },
            { project: "Green Public Parks", meetings: 25 },
            { project: "Affordable Housing", meetings: 18 },
            { project: "Waste-to-Energy", meetings: 8 },
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
const STATUS_COLORS: { [key: string]: string } = {
  Ongoing: '#ffc658', // Yellow
  Completed: '#82ca9d', // Green
  Delayed: '#ff7300', // Red
};

type Section = "Project Planning & Pipeline" | "Execution & Progress Tracking" | "Financial Tracking & Utilization" | "Impact Evaluation & SDG Alignment" | "Transparency, Accountability & Citizen Engagement";

// --- Main Dashboard Component ---
export default function Page() {
    const [projectData, setProjectData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Project Planning & Pipeline");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const monitoringData = await fetcher(ENDPOINTS.projectMonitoring);
                const sortedData = monitoringData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setProjectData(sortedData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // --- Data Processing & Aggregation for Live APIs ---

    // Overall Project Status Count
    const statusCounts = projectData.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    const projectStatusData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status],
    }));

    // Budget Allocated per Project Type
    const budgetByProject = projectData.reduce((acc, project) => {
        const name = project.project_name;
        acc[name] = (acc[name] || 0) + parseFloat(project.budget_allocated_cr);
        return acc;
    }, {});
    const budgetAllocationData = Object.keys(budgetByProject).map(name => ({
        name,
        'Budget (Cr)': budgetByProject[name],
    }));
    
    // Financial Utilization per Project Type
    const financialData = Object.keys(budgetByProject).map(name => {
        const projectsInType = projectData.filter(p => p.project_name === name);
        const totalBudget = projectsInType.reduce((sum, p) => sum + parseFloat(p.budget_allocated_cr), 0);
        const weightedUtilizationSum = projectsInType.reduce((sum, p) => sum + (parseFloat(p.budget_allocated_cr) * (parseFloat(p.utilization)/100)), 0);
        const avgUtilization = (weightedUtilizationSum / totalBudget) * 100;

        return {
            name,
            'Budget (Cr)': totalBudget,
            'Utilization (%)': avgUtilization,
        }
    });

    // Average On-Time performance and SDG score per Project Type
    const performanceData = Object.keys(budgetByProject).map(name => {
        const projectsInType = projectData.filter(p => p.project_name === name);
        const avgOntime = projectsInType.reduce((sum, p) => sum + parseFloat(p.ontime), 0) / projectsInType.length;
        const avgSdgScore = projectsInType.reduce((sum, p) => sum + p.sdg_alignment_score, 0) / projectsInType.length;

        return {
            name,
            'On-Time Performance (%)': avgOntime,
            'Average SDG Score': avgSdgScore,
        }
    });

    // --- Aggregate Stats for Top Cards ---
    const totalBudget = projectData.reduce((sum, item) => sum + parseFloat(item.budget_allocated_cr || 0), 0);
    const completedProjects = projectData.filter(p => p.status === 'Completed').length;
    const ongoingProjects = projectData.filter(p => p.status === 'Ongoing').length;
    const delayedProjects = projectData.filter(p => p.status === 'Delayed').length;
    const avgSdg = projectData.reduce((sum, item) => sum + (item.sdg_alignment_score || 0), 0) / (projectData.length || 1);

    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading Project Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check the API connection.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Project Planning & Pipeline", icon: ClipboardList },
        { name: "Execution & Progress Tracking", icon: TrendingUp },
        { name: "Financial Tracking & Utilization", icon: IndianRupee },
        { name: "Impact Evaluation & SDG Alignment", icon: Target },
        { name: "Transparency, Accountability & Citizen Engagement", icon: Megaphone },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Project Planning & Pipeline":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Project Status Distribution" description="Current status of all monitored projects.">
                           <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{projectStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Total Budget Allocation by Project Type" description="Aggregated budget (in Crores) for each category of projects.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={budgetAllocationData} layout="vertical" margin={{ left: 150, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={140} interval={0} /><Tooltip formatter={(value: number) => `₹${formatNumber(value, 2)} Cr`} /><Legend /><Bar dataKey="Budget (Cr)" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Execution & Progress Tracking":
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="On-Time Performance by Project Type" description="Average on-time completion percentage for each project category.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={performanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis unit="%" /><Tooltip /><Legend /><Bar dataKey="On-Time Performance (%)" fill={CHART_COLORS[1]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Overall Project Status" description="Total count of projects by their current status.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={projectStatusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="value" name="Project Count">{projectStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />))}</Bar></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Financial Tracking & Utilization":
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Budget Utilization by Project Type" description="Comparing allocated budget with average fund utilization rate.">
                           <ResponsiveContainer width="100%" height={300}><ComposedChart data={financialData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis yAxisId="left" unit=" Cr" /><YAxis yAxisId="right" orientation="right" unit="%" /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="Budget (Cr)" fill={CHART_COLORS[0]} /><Line yAxisId="right" dataKey="Utilization (%)" stroke={CHART_COLORS[3]} /></ComposedChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Top 10 Budgeted Projects" description="Individual projects with the highest budget allocation.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={projectData.sort((a,b) => b.budget_allocated_cr - a.budget_allocated_cr).slice(0,10)} layout="vertical" margin={{ left: 150, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="project_name" type="category" width={140} interval={0} /><Tooltip formatter={(value: number) => `₹${formatNumber(value, 2)} Cr`} /><Bar dataKey="budget_allocated_cr" name="Budget (Cr)" fill={CHART_COLORS[4]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Impact Evaluation & SDG Alignment":
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Average SDG Alignment Score" description="Average score (out of 100) for projects contributing to Sustainable Development Goals.">
                           <ResponsiveContainer width="100%" height={300}><BarChart data={performanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[50, 100]} /><Tooltip /><Legend /><Bar dataKey="Average SDG Score" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Return on Investment (ROI) Index" description="ROI index for the top 10 budgeted projects.">
                             <ResponsiveContainer width="100%" height={300}><LineChart data={projectData.sort((a,b) => b.budget_allocated_cr - a.budget_allocated_cr).slice(0,10)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="project_name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="roi_index" name="ROI Index" stroke={CHART_COLORS[2]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
             case "Transparency, Accountability & Citizen Engagement":
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Public Feedback Categories (Mock)" description="Breakdown of citizen feedback received for all projects.">
                           <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={mockData.engagement.feedback} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{mockData.engagement.feedback.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Public Consultation Meetings (Mock)" description="Number of public meetings held for key projects.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.engagement.publicMeetings}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="project" /><YAxis /><Tooltip /><Bar dataKey="meetings" name="Meetings Held" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer>
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
                    <h1 className="text-3xl font-bold tracking-tight">PCMC Project Monitoring & Evaluation</h1>
                    <p className="text-muted-foreground">A unified view of project performance, financials, and impact.</p>
                </div>

                {/* --- Top Stats Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Total Project Budget" value={`₹${formatNumber(totalBudget, 2)} Cr`} icon={IndianRupee} description="Across all projects"/>
                     <StatsCard title="Completed Projects" value={formatNumber(completedProjects, 0)} icon={CheckCircle} description="Successfully delivered"/>
                     <StatsCard title="Ongoing Projects" value={formatNumber(ongoingProjects, 0)} icon={Clock} description="Currently in execution"/>
                     <StatsCard title="Delayed Projects" value={formatNumber(delayedProjects, 0)} icon={XCircle} description="Requiring attention"/>
                     <StatsCard title="Avg. SDG Alignment" value={formatNumber(avgSdg, 1)} icon={Goal} description="Score out of 100"/>
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
            <Chatbot dashboardContext="PCMC Project Monitoring & Evaluation" />
        </DashboardLayout>
    );
}