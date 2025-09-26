"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Stethoscope, GraduationCap, Users, Home, Smile, ShieldCheck, BookOpen, Venus, HandHelping, Trophy } from "lucide-react";
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
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// --- API Endpoint ---
const API_BASE_URL = "https://tdtlworld.com/pcmc-backend/api"; // Assuming local development
const ENDPOINTS = {
  socialDevelopment: `${API_BASE_URL}/social-development/`,
};

// --- MOCK DATA FOR SECTIONS WITHOUT FULL LIVE API DATA ---
const mockData = {
    education: {
        skillDevelopmentGraduates: [
            { trade: "IT & Digital", graduates: 450 },
            { trade: "Healthcare", graduates: 320 },
            { trade: "Manufacturing", graduates: 550 },
            { trade: "Hospitality", graduates: 280 },
        ],
    },
    genderEquity: {
        womenInLeadership: [
            { year: 2022, percentage: 28 },
            { year: 2023, percentage: 32 },
            { year: 2024, percentage: 35 },
            { year: 2025, percentage: 38 },
        ]
    },
    welfare: {
        beneficiaries: [
            { scheme: "Senior Citizen", count: 12500 },
            { scheme: "Disability Aid", count: 8750 },
            { scheme: "Student Grants", count: 15200 },
        ]
    },
    community: {
        eventParticipation: [
            { event: "Sports Fest", attendees: 12000 },
            { event: "Cultural Fair", attendees: 18500 },
            { event: "Music Concert", attendees: 9500 },
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
type Section = "Healthcare & Public Health" | "Education & Skill Development" | "Gender Equity & Social Inclusion" | "Social Welfare & Housing" | "Culture, Sports & Community Engagement";

// --- Main Dashboard Component ---
export default function Page() {
    const [socialData, setSocialData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>("Healthcare & Public Health");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const developmentData = await fetcher(ENDPOINTS.socialDevelopment);
                // Correctly map the date from 'unnamed_0' and sort
                const processedData = developmentData.map((item: any) => ({ ...item, date: item.unnamed_0 }));
                const sortedData = processedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setSocialData(sortedData);
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
    const chartData = socialData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Infant Mortality Rate (IMR)': parseFloat(item.imr),
        'Vaccination Coverage (%)': item.vaccination_coverage,
        'School Enrolment (%)': item.school_enrolment,
        'Female Workforce (%)': item.female_workforce,
        'Housing Units Delivered': item.housing_units_delivered,
        'Happiness Index': parseFloat(item.happiness_index),
    }));

    // --- Aggregate Stats for Top Cards ---
    const latestData = socialData[socialData.length - 1] || {};
    const avgImr = socialData.reduce((sum, item) => sum + parseFloat(item.imr || 0), 0) / (socialData.length || 1);
    const avgEnrollment = socialData.reduce((sum, item) => sum + (item.school_enrolment || 0), 0) / (socialData.length || 1);
    const totalHousing = socialData.reduce((sum, item) => sum + (item.housing_units_delivered || 0), 0);
    const avgHappiness = socialData.reduce((sum, item) => sum + parseFloat(item.happiness_index || 0), 0) / (socialData.length || 1);

    // --- Loading and Error States ---
    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-screen">Loading Social Development Data...</div></DashboardLayout>;
    if (isError) return <DashboardLayout><div className="flex items-center justify-center h-screen text-red-500">Error loading data. Please check the API connection.</div></DashboardLayout>;

    const sections: { name: Section; icon: React.ElementType }[] = [
        { name: "Healthcare & Public Health", icon: Stethoscope },
        { name: "Education & Skill Development", icon: GraduationCap },
        { name: "Gender Equity & Social Inclusion", icon: Users },
        { name: "Social Welfare & Housing", icon: Home },
        { name: "Culture, Sports & Community Engagement", icon: Smile },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case "Healthcare & Public Health":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Infant Mortality Rate (IMR) Trend" description="IMR per 1,000 live births. A lower value is better.">
                            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="Infant Mortality Rate (IMR)" stroke={CHART_COLORS[3]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Vaccination Coverage Trend" description="Percentage of target population vaccinated.">
                            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[60, 100]} unit="%" /><Tooltip /><Legend /><Area type="monotone" dataKey="Vaccination Coverage (%)" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} /></AreaChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Education & Skill Development":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="School Enrolment Rate" description="Percentage of eligible children enrolled in schools.">
                             <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[60, 100]} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="School Enrolment (%)" stroke={CHART_COLORS[4]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Skill Program Graduates (Mock)" description="Number of graduates from various skill development programs.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.education.skillDevelopmentGraduates}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="trade" /><YAxis /><Tooltip /><Legend /><Bar dataKey="graduates" name="Graduates" fill={CHART_COLORS[5]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Gender Equity & Social Inclusion":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Female Workforce Participation" description="Percentage of the total workforce identified as female.">
                           <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[20, 60]} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="Female Workforce (%)" stroke={CHART_COLORS[0]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Women in Leadership Roles (Mock)" description="Percentage of leadership positions held by women.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.genderEquity.womenInLeadership}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis unit="%" /><Tooltip /><Legend /><Bar dataKey="percentage" name="Leadership %" fill={CHART_COLORS[1]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Social Welfare & Housing":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Affordable Housing Units Delivered" description="Number of new housing units delivered to beneficiaries.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Housing Units Delivered" fill={CHART_COLORS[2]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                         <ChartCard title="Welfare Scheme Beneficiaries (Mock)" description="Total beneficiaries across major social welfare schemes.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.welfare.beneficiaries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="scheme" /><YAxis /><Tooltip /><Legend /><Bar dataKey="count" name="Beneficiaries" fill={CHART_COLORS[3]} /></BarChart></ResponsiveContainer>
                        </ChartCard>
                    </div>
                );
            case "Culture, Sports & Community Engagement":
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Citizen Happiness Index" description="Overall happiness score (out of 10) based on citizen surveys.">
                           <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[4, 10]} /><Tooltip /><Legend /><Line type="monotone" dataKey="Happiness Index" stroke={CHART_COLORS[5]} /></LineChart></ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Cultural & Sports Event Participation (Mock)" description="Estimated attendance at major community events.">
                            <ResponsiveContainer width="100%" height={300}><BarChart data={mockData.community.eventParticipation}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="event" /><YAxis /><Tooltip /><Legend /><Bar dataKey="attendees" name="Attendees" fill={CHART_COLORS[0]} /></BarChart></ResponsiveContainer>
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
                    <h1 className="text-3xl font-bold tracking-tight">PCMC Social Development Dashboard</h1>
                    <p className="text-muted-foreground">Tracking the well-being and development of our citizens.</p>
                </div>

                {/* --- Top Stats Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                     <StatsCard title="Avg. Infant Mortality Rate" value={avgImr.toFixed(1)} icon={Stethoscope} description="Per 1,000 live births"/>
                     <StatsCard title="Avg. School Enrolment" value={`${avgEnrollment.toFixed(1)}%`} icon={GraduationCap} description="Eligible age group"/>
                     <StatsCard title="Latest Female Workforce" value={`${latestData.female_workforce || 0}%`} icon={Users} description="Participation rate"/>
                     <StatsCard title="Total Housing Delivered" value={formatNumber(totalHousing)} icon={Home} description="Affordable housing units"/>
                     <StatsCard title="Avg. Happiness Index" value={avgHappiness.toFixed(1)} icon={Smile} description="Score out of 10"/>
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
            <Chatbot dashboardContext="PCMC Social Development" />
        </DashboardLayout>
    );
}