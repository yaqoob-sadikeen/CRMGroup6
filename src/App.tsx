import { useState, useRef, useEffect, useCallback } from "react";
import altriumLogo from "@/imports/Altrium-logo-1-1024x268.png";
import {
  setToken, getToken,
  apiLogin, apiForgotPassword, apiResetPassword,
  apiGetLeads, apiCreateLead, apiUpdateLead, apiDeleteLead,
  apiGetAssessments, apiCreateAssessment, apiSubmitAssessment, apiReviewAssessment, apiSaveDraft, apiLoadDraft, apiDeleteDraft, apiRequestInfo, apiInfoResponse,
  apiGetDeals, apiCreateDeal,
  apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser,
  apiGetActivity, apiLogActivity,
  apiAddInteraction, apiGetInteractions,
  apiAddFollowUp, apiGetFollowUps, apiUpdateFollowUp,
  apiAddNote, apiGetNotes,
} from "@/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "Sales Manager" | "Sales Rep" | "Tech Lead" | "Finance Officer" | "Admin" | "Executive";
type View = "dashboard" | "leads" | "deals" | "users" | "assessments" | "resources";

const ROLES: Role[] = ["Sales Manager", "Sales Rep", "Tech Lead", "Finance Officer", "Admin", "Executive"];

const ROLE_COLORS: Record<Role, string> = {
  "Sales Manager": "#F9A800",
  "Sales Rep": "#34d399",
  "Tech Lead": "#1a6fe8",
  "Finance Officer": "#a78bfa",
  "Admin": "#fc4f37",
  "Executive": "#f59e0b",
};

const ROLE_INITIALS: Record<Role, string> = {
  "Sales Manager": "SM",
  "Sales Rep": "SR",
  "Tech Lead": "TL",
  "Finance Officer": "FO",
  "Admin": "AD",
  "Executive": "EX",
};

// ─── Nav config per role ──────────────────────────────────────────────────────

type NavItem = { label: string; view: View; icon: string };

const ROLE_NAV: Record<Role, NavItem[]> = {
  "Sales Manager": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Leads",        view: "leads",        icon: "◎" },
    { label: "Assessments",  view: "assessments",  icon: "◉" },
    { label: "Deals",        view: "deals",        icon: "◈" },
  ],
  "Sales Rep": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "My Leads",     view: "leads",        icon: "◎" },
  ],
  "Tech Lead": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Assessments",  view: "assessments",  icon: "◉" },
  ],
  "Finance Officer": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Assessments",  view: "assessments",  icon: "◉" },
  ],
  "Admin": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Users",        view: "users",        icon: "◎" },
  ],
  "Executive": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Deals",        view: "deals",        icon: "◈" },
  ],
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const SALES_REPS = ["Ishara Fonseka", "Nadeesha Perera", "Ruwani Peris", "Kamal Jayasuriya", "Sithara Mendis", "Dinesh Weerasinghe"];

const LEADS = [
  {
    id: 1, name: "Meridian Holdings", contact: "Hashmath Fazli", email: "hashmath@meridian.io", phone: "0771234567",
    industry: "IT Services", source: "Referral", value: "$124,000", status: "New",
    assigned: "Yaqoob S.", rep: "Ishara Fonseka", date: "Aug 12",
    leadName: "Meridian Holdings ERP Development", leadDescription: "Client requires a full ERP solution covering HR, Finance, and CRM modules.",
    jobTitle: "CFO", preferredContact: "Email", companySize: "250–500", website: "meridianholdings.lk",
    initialRequirement: "End-to-end ERP system with HR, Finance, and CRM integration.",
    businessNeed: "Current operations run on disconnected spreadsheets causing reporting delays.",
    expectedSolution: "A centralized cloud ERP platform with role-based access.", projectTimeline: "12 months",
    estimatedBudget: "$120,000", currency: "USD",
    detailedRequirements: "The client needs a system that handles payroll, leave management, financial reporting, and customer relationship tracking in a single platform.",
    requiredFeatures: "Payroll module, leave management, financial dashboards, CRM, role-based access control.",
    numberOfUsers: "Approximately 200 internal users across 3 departments.",
    technicalRequirements: "REST API integration with existing HRMS. .NET preferred backend.",
    platformRequirements: "Web application, cloud-hosted.",
    integrationRequirements: "Existing HRMS (SAP), Microsoft Outlook, and accounting software.",
    securityRequirements: "Role-based access, audit trails, encrypted data at rest.",
    performanceRequirements: "Support 200 concurrent users with sub-2s response time.",
    otherConstraints: "Must comply with Sri Lanka data protection regulations.",
    budgetConfirmation: "Confirmed", paymentTerms: "30% advance, 40% mid-project, 30% on delivery.",
    additionalFinancial: "Client open to phased payment with milestone-based invoicing.",
    additionalRequirements: "Bilingual interface (English/Sinhala) required.",
  },
  {
    id: 2, name: "Vantage Systems", contact: "Leo Chen", email: "leo.chen@vantage.sg", phone: "0812345678",
    industry: "Cybersecurity", source: "Cold Outreach", value: "$87,500", status: "Contacted",
    assigned: "Yaqoob S.", rep: "Nadeesha Perera", date: "Aug 10",
    leadName: "Vantage Systems Security Audit Platform", leadDescription: "Client needs an automated security audit and compliance tracking platform.",
    jobTitle: "CISO", preferredContact: "Meeting", companySize: "50–100", website: "vantage.sg",
    initialRequirement: "Automated security audit and vulnerability scanning tool.",
    businessNeed: "Manual audits are time-consuming and error-prone.", expectedSolution: "SaaS security audit platform with dashboard reporting.",
    projectTimeline: "6 months", estimatedBudget: "$85,000", currency: "USD",
  },
  {
    id: 3, name: "Orbit Retail Ltd", contact: "Michelle Tran", email: "m.tran@orbitretail.com", phone: "0123456789",
    industry: "Retail", source: "Website", value: "$210,000", status: "Assessment",
    assigned: "Yaqoob S.", rep: "Ishara Fonseka", date: "Aug 8",
    leadName: "Orbit Retail POS & Inventory System", leadDescription: "End-to-end POS and inventory management system for a retail chain.",
    jobTitle: "IT Director", preferredContact: "Email", companySize: "500+", website: "orbitretail.com",
    initialRequirement: "POS system integrated with inventory and e-commerce platform.",
    businessNeed: "Current POS is outdated and does not sync with online store.", expectedSolution: "Unified POS, inventory, and e-commerce system.",
    projectTimeline: "9 months", estimatedBudget: "$200,000", currency: "USD",
    detailedRequirements: "Retail chain with 15 branches requires a centralized inventory and POS platform.",
    requiredFeatures: "POS, inventory tracking, barcode scanning, e-commerce integration, analytics dashboard.",
    numberOfUsers: "500+ staff across 15 branches.",
    platformRequirements: "Web + native mobile app (iOS and Android).",
    integrationRequirements: "Shopify integration, existing accounting package.",
    budgetConfirmation: "Confirmed", paymentTerms: "Milestone-based, 4 phases.",
  },
  {
    id: 4, name: "Apex Dynamics", contact: "Farhan Ali", email: "farhan@apexdyn.ae", phone: "0501234567",
    industry: "Manufacturing", source: "Trade Show", value: "$45,000", status: "Assessment",
    assigned: "Yaqoob S.", rep: "Ruwani Peris", date: "Aug 5",
    leadName: "Apex Dynamics DevOps Pipeline", leadDescription: "CI/CD pipeline and infrastructure automation for manufacturing software.",
    jobTitle: "Head of Engineering", preferredContact: "Phone", companySize: "100–250", website: "apexdyn.ae",
    initialRequirement: "Set up DevOps pipeline with automated testing and deployment.", businessNeed: "Manual deployments causing frequent production issues.",
    expectedSolution: "CI/CD pipeline using GitHub Actions and AWS.", projectTimeline: "4 months", estimatedBudget: "$40,000", currency: "USD",
  },
  {
    id: 5, name: "CloudBridge Inc.", contact: "Ananya Roy", email: "ananya@cloudbridge.io", phone: "0987654321",
    industry: "Cloud Services", source: "Partner", value: "$330,000", status: "Assessment",
    assigned: "Yaqoob S.", rep: "Nadeesha Perera", date: "Aug 3",
    leadName: "CloudBridge Infrastructure Migration", leadDescription: "Large-scale cloud migration from on-premise to AWS multi-region setup.",
    jobTitle: "VP Engineering", preferredContact: "Meeting", companySize: "500+", website: "cloudbridge.io",
    initialRequirement: "Migrate all on-premise infrastructure to AWS with zero downtime.",
    businessNeed: "On-premise infra reaching end-of-life with high maintenance costs.", expectedSolution: "AWS multi-region cloud architecture with DR setup.",
    projectTimeline: "18 months", estimatedBudget: "$320,000", currency: "USD",
    detailedRequirements: "30 microservices to be containerized and migrated. Requires blue-green deployment strategy.",
    requiredFeatures: "Container orchestration (EKS), CI/CD, monitoring, auto-scaling, WAF.",
    numberOfUsers: "Internal: 800 engineers. External: 50,000+ end users.",
    technicalRequirements: "Kubernetes, Terraform, Datadog monitoring.",
    platformRequirements: "Cloud-native, AWS.",
    integrationRequirements: "Existing CI/CD (Jenkins), Slack, PagerDuty.",
    securityRequirements: "SOC 2 compliance, encrypted secrets management (Vault).",
    performanceRequirements: "99.99% uptime SLA, <500ms API response.",
    budgetConfirmation: "Confirmed", paymentTerms: "Quarterly billing over 18 months.",
    additionalFinancial: "Budget may scale to $400K if DR region added.",
  },
  {
    id: 6, name: "NexGen Pharma", contact: "Ravidu Pasan", email: "rpasan@nexgen.lk", phone: "0713456789",
    industry: "Healthcare", source: "Referral", value: "$178,000", status: "Assessment",
    assigned: "Yaqoob S.", rep: "Ishara Fonseka", date: "Jul 30",
    leadName: "NexGen Pharma CRM Implementation", leadDescription: "Custom CRM for pharmaceutical sales force management and compliance tracking.",
    jobTitle: "COO", preferredContact: "Email", companySize: "100–250", website: "nexgen.lk",
    initialRequirement: "CRM tailored for pharma sales reps with compliance tracking.", businessNeed: "No centralized system for tracking sales rep visits and regulatory compliance.",
    expectedSolution: "Custom CRM with visit tracking, compliance modules, and reporting.", projectTimeline: "8 months",
    estimatedBudget: "$170,000", currency: "USD",
  },
  {
    id: 7, name: "Solaris Energy", contact: "Senula Silva", email: "senula@solaris.lk", phone: "0765432109",
    industry: "Energy", source: "Inbound", value: "$95,000", status: "Closed",
    assigned: "Yaqoob S.", rep: "Ruwani Peris", date: "Jul 28",
    leadName: "Solaris Energy Dashboard", leadDescription: "Real-time energy monitoring dashboard for solar installation management.",
    jobTitle: "CTO", preferredContact: "Email", companySize: "50–100", website: "solaris.lk",
    initialRequirement: "Real-time solar panel monitoring and reporting dashboard.", businessNeed: "No visibility into energy generation across 200+ installations.",
    expectedSolution: "IoT dashboard with real-time data, alerts, and reporting.", projectTimeline: "5 months",
    estimatedBudget: "$90,000", currency: "USD",
  },
];

const DEALS = [
  { id: 1, name: "Meridian ERP Rollout",    client: "Meridian Holdings", value: "$124,000", rep: "Ishara Fonseka",   date: "Aug 12" },
  { id: 2, name: "CloudBridge Migration",   client: "CloudBridge Inc.", value: "$330,000", rep: "Nadeesha Perera",  date: "Aug 3"  },
  { id: 3, name: "NexGen CRM Setup",        client: "NexGen Pharma",    value: "$178,000", rep: "Ishara Fonseka",   date: "Jul 30" },
  { id: 4, name: "Orbit Analytics Suite",   client: "Orbit Retail Ltd", value: "$210,000", rep: "Ishara Fonseka",   date: "Aug 8"  },
  { id: 5, name: "Apex DevOps Pipeline",    client: "Apex Dynamics",    value: "$45,000",  rep: "Ruwani Peris",     date: "Aug 5"  },
  { id: 6, name: "Vantage Security Audit",  client: "Vantage Systems",  value: "$87,500",  rep: "Nadeesha Perera",  date: "Aug 10" },
];


const USERS = [
  { id: 1,  name: "Yaqoob Sadikeen",    email: "yaqoob.s@altrium.io",    role: "Sales Manager",   status: "Active",   lastLogin: "Today",     password: "Sales@123"   },
  { id: 2,  name: "Ishara Fonseka",     email: "ishara.f@altrium.io",    role: "Sales Rep",       status: "Active",   lastLogin: "Today",     password: "Rep@123"     },
  { id: 3,  name: "Nadeesha Perera",    email: "nadeesha.p@altrium.io",  role: "Sales Rep",       status: "Active",   lastLogin: "Yesterday", password: "Rep@456"     },
  { id: 4,  name: "Ruwani Peris",       email: "ruwani.p@altrium.io",    role: "Sales Rep",       status: "Active",   lastLogin: "Aug 18",    password: "Rep@789"     },
  { id: 5,  name: "Kamal Jayasuriya",   email: "kamal.j@altrium.io",     role: "Sales Rep",       status: "Active",   lastLogin: "Today",     password: "Rep@321"     },
  { id: 6,  name: "Sithara Mendis",     email: "sithara.m@altrium.io",   role: "Sales Rep",       status: "Active",   lastLogin: "Aug 17",    password: "Rep@654"     },
  { id: 7,  name: "Dinesh Weerasinghe", email: "dinesh.w@altrium.io",    role: "Sales Rep",       status: "Inactive", lastLogin: "Aug 12",    password: "Rep@000"     },
  { id: 8,  name: "Ravidu Pasan",       email: "ravidu.p@altrium.io",    role: "Tech Lead",       status: "Active",   lastLogin: "Today",     password: "Tech@123"    },
  { id: 9,  name: "Hashmath Fazli",     email: "hashmath.f@altrium.io",  role: "Finance Officer", status: "Active",   lastLogin: "Aug 17",    password: "Finance@123" },
  { id: 10, name: "Natalia Dilshani",   email: "natalia.d@altrium.io",   role: "Admin",           status: "Active",   lastLogin: "Yesterday", password: "Admin@123"   },
  { id: 11, name: "Inshiraff Thaseem",  email: "inshiraff.t@altrium.io", role: "Executive",       status: "Active",   lastLogin: "Today",     password: "Exec@123"    },
];

type AssessmentRecord = {
  id: number;
  leadName: string;
  type: "Technical" | "Financial";
  status: "Pending" | "In Review" | "Submitted" | "Info Required";
  infoRequest?: string;
  risk: "Low" | "Medium" | "High";
  assessor: string;
  date: string;
  notes: string;
  document?: string;
  documentData?: string;
  documents?: { name: string; data: string }[];
  techData?: Record<string, string>;
  finData?: Record<string, string>;
};

const ASSESSMENTS: AssessmentRecord[] = [
  { id: 1,  leadName: "Apex Dynamics",    type: "Technical",  status: "Submitted",  risk: "Low",    assessor: "Ravidu Pasan",   date: "Aug 6",  notes: "Clean requirements. Straightforward implementation." },
  { id: 2,  leadName: "Apex Dynamics",    type: "Financial",  status: "Pending",    risk: "Low",    assessor: "Hashmath Fazli", date: "—",      notes: "" },
  { id: 3,  leadName: "CloudBridge Inc.", type: "Technical",  status: "In Review",  risk: "High",   assessor: "Ravidu Pasan",   date: "Aug 4",  notes: "Reviewing cloud migration complexity and infra dependencies." },
  { id: 4,  leadName: "CloudBridge Inc.", type: "Financial",  status: "Submitted",  risk: "High",   assessor: "Hashmath Fazli", date: "Aug 5",  notes: "Revenue projections reviewed. High value, acceptable margins." },
  { id: 5,  leadName: "NexGen Pharma",    type: "Technical",  status: "Submitted",  risk: "Low",    assessor: "Ravidu Pasan",   date: "Aug 27", notes: "Reviewing integration requirements." },
  { id: 6,  leadName: "NexGen Pharma",    type: "Financial",  status: "Pending",    risk: "Low",    assessor: "Hashmath Fazli", date: "—",      notes: "" },
  { id: 7,  leadName: "Orbit Retail Ltd", type: "Technical",  status: "Pending",    risk: "Low",    assessor: "Ravidu Pasan",   date: "—",      notes: "" },
  { id: 8,  leadName: "Orbit Retail Ltd", type: "Financial",  status: "Submitted",  risk: "Low",    assessor: "Hashmath Fazli", date: "Aug 8",  notes: "Margins acceptable. Recommend proceeding." },
];


// ─── Chips ────────────────────────────────────────────────────────────────────

function LeadStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    New:         "bg-[#F9A80020] text-[#F9A800] border-[#F9A80030]",
    Contacted:   "bg-[#1a6fe820] text-[#60a5fa] border-[#1a6fe830]",
    Qualified:   "bg-[#a78bfa20] text-[#a78bfa] border-[#a78bfa30]",
    Assessment:  "bg-[#f59e0b20] text-[#f59e0b] border-[#f59e0b30]",
    Closed:      "bg-[#22222e] text-[#7a7a90] border-[#22222e]",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}


function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "#F9A800",
    Inactive: "#7a7a90",
    "In Progress": "#1a6fe8",
    "To Do": "#7a7a90",
    Done: "#22c55e",
    "On Hold": "#fc4f37",
    Planning: "#f59e0b",
    Completed: "#22c55e",
    Submitted: "#1a6fe8",
    Pending: "#f59e0b",
    "In Review": "#a78bfa",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: map[status] ?? "#7a7a90" }} />
      <span className="text-sm text-[var(--foreground)]">{status}</span>
    </span>
  );
}

function PriorityChip({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    High: { bg: "#fc4f3720", color: "#fc4f37" },
    Medium: { bg: "#f59e0b20", color: "#f59e0b" },
    Low: { bg: "#7a7a9020", color: "#7a7a90" },
  };
  const { bg, color } = map[priority] ?? map.Medium;
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: bg, color }}>{priority}</span>;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: accent }} />
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </span>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color = "var(--primary)" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function DashboardView({ role, userName, activityLog, users, leads, deals, assessments }: {
  role: Role;
  userName: string;
  activityLog: { time: string; event: string; type: string }[];
  users?: typeof USERS;
  leads?: typeof LEADS;
  deals?: typeof DEALS;
  assessments?: AssessmentRecord[];
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const allLeads = leads ?? LEADS;
  const allDeals = deals ?? DEALS;
  const allAssessments = assessments ?? [];

  const activeLeads = allLeads.filter((l) => l.status !== "Closed").length;
  const closedDeals = allDeals.length;
  const qualifiedLeads = allLeads.filter((l) => l.status === "Qualified").length;
  const inAssessment = allLeads.filter((l) => l.status === "Assessment").length;
  const pendingAssess = allAssessments.filter((a) => a.status === "Pending" || a.status === "In Review").length;
  const totalAssessValue = allAssessments
    .map((a) => allLeads.find((l) => l.name === a.leadName))
    .filter(Boolean)
    .reduce((s, l) => s + parseInt((l!.value ?? "0").replace(/[^0-9]/g, "") || "0"), 0);

  const kpiSets: Record<Role, { label: string; value: string; sub: string; accent: string }[]> = {
    "Sales Manager": [
      { label: "Active Leads",     value: String(activeLeads),    sub: `${qualifiedLeads} qualified`, accent: "#F9A800" },
      { label: "In Assessment",    value: String(inAssessment),   sub: `${pendingAssess} pending review`, accent: "#f59e0b" },
      { label: "Won Deals",        value: String(closedDeals),    sub: "converted from leads",     accent: "#1a6fe8" },
      { label: "Closed Leads",     value: String(allLeads.filter((l) => l.status === "Closed").length), sub: "not converted", accent: "#7a7a90" },
    ],
    "Tech Lead": [
      { label: "Pending Assessments", value: String(allAssessments.filter((a) => a.type === "Technical" && ["Pending","In Review"].includes(a.status)).length), sub: "technical reviews", accent: "#1a6fe8" },
      { label: "Active Projects", value: "3", sub: "1 at risk", accent: "#fc4f37" },
      { label: "Skills Gaps Flagged", value: "7", sub: "across 2 projects", accent: "#f59e0b" },
      { label: "Docs Uploaded", value: "23", sub: "this month", accent: "#F9A800" },
    ],
    "Finance Officer": [
      { label: "Pending Reviews",  value: String(allAssessments.filter((a) => a.type === "Financial" && ["Pending","In Review"].includes(a.status)).length), sub: "financial assessments", accent: "#a78bfa" },
      { label: "Assessments Done", value: String(allAssessments.filter((a) => a.type === "Financial" && a.status === "Submitted").length), sub: "submitted", accent: "#22c55e" },
      { label: "Pending Approvals", value: String(allAssessments.filter((a) => a.type === "Financial" && a.status === "Submitted").length), sub: "awaiting SM approval", accent: "#f59e0b" },
      { label: "Total Assessed",   value: "$" + Math.round(totalAssessValue / 1000) + "K", sub: "in reviewed leads", accent: "#1a6fe8" },
    ],
    "Admin": [
      { label: "Total Users",      value: String((users ?? USERS).length), sub: `${(users ?? USERS).filter((u) => u.status === "Inactive").length} inactive`, accent: "#fc4f37" },
      { label: "Active Users",     value: String((users ?? USERS).filter((u) => u.status === "Active").length), sub: "currently active", accent: "#F9A800" },
      { label: "Roles Assigned",   value: "100%", sub: "all users have a role", accent: "#1a6fe8" },
      { label: "Password Resets",  value: "3", sub: "last 30 days", accent: "#f59e0b" },
    ],
    "Sales Rep": (() => {
      const myLeads = allLeads.filter((l) => l.rep === userName);
      const myOpen = myLeads.filter((l) => l.status !== "Closed").length;
      const myAssessment = myLeads.filter((l) => l.status === "Assessment").length;
      const myClosed = myLeads.filter((l) => l.status === "Closed").length;
      const myPipelineValue = myLeads.filter((l) => l.status !== "Closed").reduce((s, l) => s + parseInt(l.value.replace(/[^0-9]/g, "") || "0"), 0);
      return [
        { label: "My Open Leads",    value: String(myOpen),    sub: `${myAssessment} in assessment`, accent: "#34d399" },
        { label: "My Pipeline Value", value: "$" + Math.round(myPipelineValue / 1000) + "K", sub: "active lead value", accent: "#1a6fe8" },
        { label: "Qualified",        value: String(myLeads.filter((l) => l.status === "Qualified").length), sub: "leads qualified", accent: "#a78bfa" },
        { label: "Closed Leads",     value: String(myClosed), sub: "converted or closed", accent: "#f59e0b" },
      ];
    })(),
    "Executive": [
      { label: "Total Pipeline Value", value: "$" + Math.round(allLeads.filter((l) => l.status !== "Closed").reduce((s, l) => s + parseInt(l.value.replace(/[^0-9]/g, "") || "0"), 0) / 1000) + "K", sub: "active lead value", accent: "#f59e0b" },
      { label: "Deals Won",         value: String(closedDeals), sub: "converted deals", accent: "#F9A800" },
      { label: "Conversion Rate",   value: allLeads.length > 0 ? Math.round((closedDeals / allLeads.length) * 100) + "%" : "0%", sub: "leads → deals", accent: "#a78bfa" },
      { label: "Active Leads",      value: String(activeLeads), sub: "in pipeline", accent: "#60a5fa" },
    ],
  };

  const kpis = kpiSets[role];

  const actColor: Record<string, string> = {
    lead: "#22c55e", deal: "#1a6fe8", assess: "#a78bfa", user: "#f59e0b", project: "#fc4f37",
  };

  const PIPELINE_STATUSES = ["New", "Contacted", "Qualified", "Assessment", "Closed"] as const;
  const pipelineStatusColors: Record<string, string> = {
    New: "#F9A800", Contacted: "#60a5fa", Qualified: "#a78bfa", Assessment: "#f59e0b", Closed: "#7a7a90",
  };
  const pipelineLeads = role === "Sales Rep" ? allLeads.filter((l) => l.rep === userName) : allLeads;
  const maxLeadCount = Math.max(1, ...PIPELINE_STATUSES.map((s) => pipelineLeads.filter((l) => l.status === s).length));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">{greeting} 👋</h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Here's what's happening across your pipeline today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {role === "Admin" ? (
        /* ── Admin-specific bottom section ── */
        <div className="flex flex-col gap-4">
          {/* Role breakdown */}
          <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>
              Users by Role
            </h3>
            {(["Sales Manager", "Sales Rep", "Tech Lead", "Finance Officer", "Admin"] as Role[]).map((r) => {
              const count = (users ?? USERS).filter((u) => u.role === r).length;
              const total = (users ?? USERS).length;
              const pct = total ? Math.round((count / total) * 100) : 0;
              const rColor = ROLE_COLORS[r];
              return (
                <div key={r} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{r}</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: rColor }}>{count} user{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: rColor }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* User roster */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>All Users</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {(users ?? USERS).map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: ROLE_COLORS[u.role as Role] + "20", color: ROLE_COLORS[u.role as Role] }}>
                          {u.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--muted-foreground)" }}>{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: ROLE_COLORS[u.role as Role] + "18", color: ROLE_COLORS[u.role as Role] }}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: u.status === "Active" ? "#F9A80018" : "#7a7a9018", color: u.status === "Active" ? "#F9A800" : "#7a7a90" }}>{u.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>Last login: {u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User activity log */}
          <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>User Activity</h3>
            <div className="flex flex-col gap-4">
              {activityLog.filter((a) => a.type === "user").length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No user activity recorded yet.</p>
              ) : (
                activityLog.filter((a) => a.type === "user").map((a, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#f59e0b" }} />
                    <div>
                      <p className="text-sm leading-snug">{a.event}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Lead pipeline by status (live) */}
          <div className="lg:col-span-2 rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>
              Lead Pipeline
            </h3>
            {PIPELINE_STATUSES.map((status) => {
              const count = pipelineLeads.filter((l) => l.status === status).length;
              const pct = Math.round((count / maxLeadCount) * 100);
              const color = pipelineStatusColors[status];
              return (
                <div key={status} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{status}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color }}>{count} lead{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity feed */}
          <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>
              Recent Activity
            </h3>
            <div className="flex flex-col gap-4">
              {activityLog.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No activity yet.</p>
              ) : activityLog.slice(0, 9).map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: actColor[a.type] ?? "#7a7a90" }} />
                  <div>
                    <p className="text-sm leading-snug">{a.event}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type CommEntry = { id: number; type: "Call" | "Meeting" | "Email" | "Info Response"; summary: string; time: string; document?: string; documentData?: string; documents?: { name: string; data: string }[] };
type FollowUp = { id: number; date: string; time?: string; purpose: string; status: "Upcoming" | "Completed" | "Cancelled" };
type LeadNote = { id: number; text: string; time: string };

// ── localStorage helpers ──────────────────────────────────────────────────────
function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const leadCommsMap: Record<number, CommEntry[]>    = lsGet("altriumComms", {});
const leadFollowUpsMap: Record<number, FollowUp[]> = lsGet("altriumFollowUps", {});
const leadNotesMap: Record<number, LeadNote[]>     = lsGet("altriumNotes", {});

function LeadDetailPanel({
  lead,
  onClose,
  isSalesRep,
  isSalesManager,
  onQualifyLead,
  onSubmitForAssessment,
  onContactLead,
  assessments,
  onInfoResponse,
  onUpdateDetails,
}: {
  lead: typeof LEADS[number] | null;
  onClose: () => void;
  isSalesRep?: boolean;
  isSalesManager?: boolean;
  onQualifyLead?: (leadId: number) => void;
  onSubmitForAssessment?: (leadId: number) => void;
  onContactLead?: (leadId: number) => void;
  assessments?: AssessmentRecord[];
  onInfoResponse?: (leadName: string) => void;
  onUpdateDetails?: (leadId: number, data: Record<string, string>) => void;
}) {
  const [tab, setTab] = useState<"overview" | "activity" | "notes">("overview");
  const [comms, setComms] = useState<CommEntry[]>(() => leadCommsMap[lead?.id ?? 0] ?? []);
  const [notes, setNotes] = useState<LeadNote[]>(() => leadNotesMap[lead?.id ?? 0] ?? []);

  const [newCommType, setNewCommType] = useState<"Call" | "Meeting" | "Email" | "Info Response">("Call");
  const [newCommText, setNewCommText] = useState("");
  const [newCommDocs, setNewCommDocs] = useState<{ name: string; data: string }[]>([]);
  const [addingComm, setAddingComm] = useState(false);
  const commDocRef = useRef<HTMLInputElement>(null);
  const [newNote, setNewNote] = useState("");

  // Edit mode state (replaces update tab)
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editSaved, setEditSaved] = useState(false);

  // Keep backward compat alias
  const updateForm = editForm;
  const setUpdateForm = setEditForm;
  const [updateSaved, setUpdateSaved] = useState(false);

  useEffect(() => {
    if (lead) {
      const la = lead as any;
      setTab("overview");
      setEditMode(false);
      setEditSaved(false);
      setAddingComm(false);
      setNewCommText("");
      setNewCommType("Call");
      setNewNote("");
      setUpdateSaved(false);
      setEditForm({
        leadName: la.leadName ?? "", source: la.source ?? "", leadDescription: la.leadDescription ?? "",
        companyName: la.name ?? "", industry: la.industry ?? "", companySize: la.companySize ?? "",
        website: la.website ?? "", contactName: la.contact ?? "", jobTitle: la.jobTitle ?? "",
        contactEmail: la.email ?? "", contactPhone: la.phone ?? "", preferredContact: la.preferredContact ?? "",
        detailedRequirements: la.detailedRequirements ?? "", businessNeed: la.businessNeed ?? "",
        expectedSolution: la.expectedSolution ?? "", requiredFeatures: la.requiredFeatures ?? "",
        numberOfUsers: la.numberOfUsers ?? "", technicalRequirements: la.technicalRequirements ?? "",
        platformRequirements: la.platformRequirements ?? "", integrationRequirements: la.integrationRequirements ?? "",
        securityRequirements: la.securityRequirements ?? "", performanceRequirements: la.performanceRequirements ?? "",
        otherConstraints: la.otherConstraints ?? "", projectTimeline: la.projectTimeline ?? "",
        estimatedBudget: la.estimatedBudget ?? "", currency: la.currency ?? "USD",
        budgetConfirmation: la.budgetConfirmation ?? "", paymentTerms: la.paymentTerms ?? "",
        additionalFinancial: la.additionalFinancial ?? "", additionalRequirements: la.additionalRequirements ?? "",
      });
      apiGetInteractions(lead.id).then((rows) => {
        const mapped: CommEntry[] = rows.map((r: any) => ({
          id: r.id, type: r.type, summary: r.summary, time: r.time,
          document: r.document ?? undefined, documentData: r.document_data ?? undefined,
        }));
        setComms(mapped);
        leadCommsMap[lead.id] = mapped;
      }).catch(() => setComms(leadCommsMap[lead.id] ?? []));
      apiGetNotes(lead.id).then((rows) => {
        const mapped: LeadNote[] = rows.map((r: any) => ({ id: r.id, text: r.text, time: r.time }));
        setNotes(mapped);
        leadNotesMap[lead.id] = mapped;
      }).catch(() => setNotes(leadNotesMap[lead.id] ?? []));
    }
  }, [lead?.id]);

  if (!lead) return null;

  const statusColors: Record<string, string> = {
    New: "#F9A800", Contacted: "#60a5fa", Qualified: "#a78bfa", Assessment: "#f59e0b", Closed: "#7a7a90",
  };
  const color = statusColors[lead.status] ?? "#7a7a90";

  const nowStr = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const PIPELINE_STEPS = ["New", "Contacted", "Qualified", "Assessment", "Closed"];
  const canEdit = !!isSalesRep;
  const currentStep = PIPELINE_STEPS.indexOf(lead.status);

  function addComm() {
    if (!newCommText.trim()) return;
    const entry: CommEntry = { id: Date.now(), type: newCommType, summary: newCommText.trim(), time: nowStr(), documents: newCommDocs.length > 0 ? newCommDocs : undefined };
    const updated = [entry, ...comms];
    setComms(updated);
    leadCommsMap[lead!.id] = updated;
    setNewCommText("");
    setNewCommDocs([]);
    setAddingComm(false);
    if (lead!.status === "New" && onContactLead) onContactLead(lead!.id);
    if (entry.type === "Info Response" && onInfoResponse) onInfoResponse(lead!.name);
    apiAddInteraction(lead!.id, { type: entry.type, summary: entry.summary, document: entry.documents?.[0]?.name, document_data: entry.documents?.[0]?.data })
      .catch(() => {});
  }

  function addNote() {
    if (!newNote.trim()) return;
    const entry: LeadNote = { id: Date.now(), text: newNote.trim(), time: nowStr() };
    const updated = [entry, ...notes];
    setNotes(updated);
    leadNotesMap[lead!.id] = updated;
    setNewNote("");
    apiAddNote(lead!.id, { text: entry.text }).catch(() => {});
  }

  const commColors: Record<string, string> = { Call: "#F9A800", Meeting: "#1a6fe8", Email: "#a78bfa", "Info Response": "#fc4f37" };
  const l = lead as any;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div
        className="ml-auto h-full w-full flex flex-col"
        style={{ maxWidth: 760, background: "var(--card)", borderLeft: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="px-7 py-6 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold shrink-0"
                style={{ background: "#1f2937", color: "var(--primary)", border: "1px solid #2d3748" }}
              >
                {lead.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{lead.name}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded font-semibold" style={{ background: "#1f2937", color: "var(--muted-foreground)" }}>
                    L-00{lead.id}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: color + "18", color, border: `1px solid ${color}35` }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
                    {lead.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Sales Rep: qualify the lead */}
              {isSalesRep && onQualifyLead && lead.status === "Contacted" && (
                <button
                  onClick={() => { onQualifyLead(lead.id); onClose(); }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ background: "#a78bfa", color: "#fff" }}
                >
                  Forward to Sales Manager
                </button>
              )}
              {/* Sales Manager: send qualified lead to assessment */}
              {isSalesManager && onSubmitForAssessment && lead.status === "Qualified" && (
                <button
                  onClick={() => { onSubmitForAssessment(lead.id); onClose(); }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Submit for Assessment
                </button>
              )}
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10] transition-colors" style={{ color: "var(--muted-foreground)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex px-7 pt-0 shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid var(--border)" }}>
          {([
            ["overview", "Overview"],
            ["activity", "Interaction Log"],
            ["notes", "Notes"],
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-all"
              style={{
                color: tab === t ? "var(--foreground)" : "var(--muted-foreground)",
                borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              {/* Edit button for Sales Rep / Sales Manager */}
              {(isSalesRep || isSalesManager) && !editMode && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Edit mode form */}
              {editMode && (isSalesRep || isSalesManager) && (() => {
                const inp = (label: string, field: string, required = false, type = "text") => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                      {label}{required && <span style={{ color: "#fc4f37" }}> *</span>}
                    </label>
                    <input
                      type={type}
                      value={editForm[field] ?? ""}
                      onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                      maxLength={field === "contactPhone" ? 10 : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                );
                const ta = (label: string, field: string, rows = 3) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                    <textarea
                      value={editForm[field] ?? ""}
                      onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                      rows={rows}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                );
                const sel = (label: string, field: string, opts: string[]) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                    <select
                      value={editForm[field] ?? ""}
                      onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="">— Select —</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                );
                const divider = (title: string) => (
                  <div key={title} className="pt-2 pb-1" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>{title}</p>
                  </div>
                );
                const ro = (label: string, value: string | undefined) => (
                  <div key={label} className="flex flex-col gap-1">
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                    <p className="text-sm font-medium">{value || "—"}</p>
                  </div>
                );
                function handleSaveEdit() {
                  if (!onUpdateDetails) return;
                  onUpdateDetails(lead!.id, { ...editForm });
                  setEditSaved(true);
                  setTimeout(() => { setEditSaved(false); setEditMode(false); }, 1500);
                }
                return (
                  <div className="flex flex-col gap-4">
                    {/* Sales Manager fields */}
                    {isSalesManager && (
                      <>
                        {divider("Lead Information")}
                        <div className="grid grid-cols-2 gap-4">
                          {inp("Lead Name", "leadName", true)}
                          {sel("Lead Source", "source", ["Website", "Referral", "Cold Outreach", "Trade Show", "Partner", "Inbound", "Phone Call", "Social Media", "Email"])}
                        </div>
                        {ta("Lead Description", "leadDescription", 2)}
                        {divider("Organisation & Contact")}
                        <div className="grid grid-cols-2 gap-4">
                          {inp("Company Name", "companyName", true)}
                          {sel("Industry", "industry", ["IT Services", "Cybersecurity", "Cloud Services", "Healthcare", "Retail", "Manufacturing", "Energy", "Finance", "Education", "Other"])}
                          {inp("Company Size", "companySize")}
                          {inp("Website", "website")}
                          {inp("Contact Person Name", "contactName", true)}
                          {inp("Job Title", "jobTitle")}
                          {inp("Email Address", "contactEmail", true, "email")}
                          {inp("Phone Number", "contactPhone")}
                          {sel("Preferred Contact Method", "preferredContact", ["Email", "Phone", "Meeting", "Video Call", "Other"])}
                        </div>
                        {divider("Initial Requirements")}
                        {ta("Initial Requirement", "initialRequirement", 2)}
                        {ta("Business Need", "businessNeed", 2)}
                        {ta("Expected Solution", "expectedSolution", 2)}
                        {divider("Commercial")}
                        <div className="grid grid-cols-2 gap-4">
                          {inp("Estimated Budget", "estimatedBudget")}
                          {sel("Currency", "currency", ["USD", "LKR", "EUR", "GBP", "AED", "INR", "SGD"])}
                        </div>
                        {inp("Expected Project Timeline", "projectTimeline")}
                        {ta("Notes", "notes", 2)}
                      </>
                    )}
                    {/* Sales Rep fields */}
                    {isSalesRep && (
                      <>
                        {divider("Detailed Project Requirements")}
                        {ta("Detailed Requirements", "detailedRequirements", 3)}
                        {ta("Required Features", "requiredFeatures", 2)}
                        {inp("Number of Users / Scale", "numberOfUsers")}
                        {ta("Technical Requirements", "technicalRequirements", 2)}
                        {ta("Platform Requirements", "platformRequirements", 2)}
                        {ta("Integration Requirements", "integrationRequirements", 2)}
                        {ta("Security Requirements", "securityRequirements", 2)}
                        {ta("Performance Requirements", "performanceRequirements", 2)}
                        {ta("Other Constraints", "otherConstraints", 2)}
                        {divider("Financial")}
                        {sel("Budget Confirmation", "budgetConfirmation", ["Confirmed", "Tentative", "Not Discussed"])}
                        {ta("Payment Terms", "paymentTerms", 2)}
                        {ta("Additional Financial Info", "additionalFinancial", 2)}
                        {ta("Additional Requirements", "additionalRequirements", 2)}
                      </>
                    )}
                    {/* Read-only fields for context */}
                    {isSalesRep && (
                      <>
                        {divider("Lead Info (read-only)")}
                        <div className="grid grid-cols-2 gap-4">
                          {ro("Lead Name", editForm["leadName"])}
                          {ro("Source", editForm["source"])}
                          {ro("Company", editForm["companyName"])}
                          {ro("Industry", editForm["industry"])}
                        </div>
                      </>
                    )}
                    <div className="flex gap-3 justify-end pt-2">
                      {editSaved && (
                        <span className="text-sm font-semibold self-center" style={{ color: "#22c55e" }}>✓ Saved</span>
                      )}
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Read-only overview (when not editing) */}
              {!editMode && (<>
              {/* Info Required banners for Sales Rep */}
              {isSalesRep && assessments && (() => {
                const infoRequested = assessments.filter((a) => a.leadName === lead.name && a.status === "Info Required" && a.infoRequest);
                if (infoRequested.length === 0) return null;
                return (
                  <div className="flex flex-col gap-2 mb-1">
                    {infoRequested.map((a) => (
                      <div key={a.id} className="rounded-xl px-4 py-3 flex gap-3 items-start" style={{ background: "#fc4f3712", border: "1px solid #fc4f3740" }}>
                        <span className="text-lg shrink-0">⚠️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#fc4f37" }}>
                            {a.type} Assessor — Additional Information Required
                          </p>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{a.infoRequest}</p>
                          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                            Please respond by logging an <span className="font-semibold" style={{ color: "#fc4f37" }}>Info Response</span> in the Interaction Log tab.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Pipeline Progress */}
              <div className="rounded-2xl p-5" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>Pipeline Progress</p>
                <div className="flex items-center">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const done = idx < currentStep;
                    const active = idx === currentStep;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{ background: done ? "var(--primary)" : active ? "transparent" : "#1f2937", border: active ? "2px solid var(--primary)" : done ? "none" : "2px solid #374151", color: done ? "var(--primary-foreground)" : active ? "var(--primary)" : "#4b5563" }}>
                            {done ? <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <span>{idx + 1}</span>}
                          </div>
                          <span className="text-xs font-medium whitespace-nowrap" style={{ color: active ? "var(--primary)" : done ? "var(--foreground)" : "var(--muted-foreground)" }}>{step}</span>
                        </div>
                        {idx < PIPELINE_STEPS.length - 1 && <div className="flex-1 h-px mx-2 mb-5" style={{ background: done ? "var(--primary)" : "#1f2937" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lead info grid */}
              {(() => {
                const section = (title: string, fields: { label: string; value: string | undefined }[]) => {
                  const visible = fields.filter(f => f.value && f.value !== "—");
                  if (visible.length === 0) return null;
                  return (
                    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{title}</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {visible.map(f => (
                          <div key={f.label}>
                            <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{f.label}</p>
                            <p className="text-sm font-medium break-words">{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                };
                const textBlock = (title: string, value: string | undefined) => !value ? null : (
                  <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{title}</p>
                    <p className="text-sm leading-relaxed">{value}</p>
                  </div>
                );
                return (
                  <>
                    {section("Lead Information", [
                      { label: "Lead Name", value: l.leadName },
                      { label: "Source", value: l.source },
                      { label: "Created", value: l.date },
                      { label: "Assigned Rep", value: l.rep || "Unassigned" },
                    ])}
                    {textBlock("Lead Description", l.leadDescription)}
                    {section("Organisation & Contact", [
                      { label: "Company Name", value: lead.name },
                      { label: "Industry", value: l.industry },
                      { label: "Company Size", value: l.companySize },
                      { label: "Website", value: l.website },
                      { label: "Contact Person", value: lead.contact },
                      { label: "Job Title", value: l.jobTitle },
                      { label: "Email", value: l.email },
                      { label: "Phone", value: l.phone },
                      { label: "Preferred Contact", value: l.preferredContact },
                    ])}
                    {section("Commercial", [
                      { label: "Est. Deal Value", value: lead.value },
                      { label: "Est. Budget", value: l.estimatedBudget },
                      { label: "Currency", value: l.currency },
                      { label: "Project Timeline", value: l.projectTimeline },
                      { label: "Budget Confirmation", value: l.budgetConfirmation },
                      { label: "Payment Terms", value: l.paymentTerms },
                    ])}
                    {textBlock("Initial Requirement", l.initialRequirement)}
                    {textBlock("Business Need", l.businessNeed)}
                    {textBlock("Expected Solution", l.expectedSolution)}
                    {l.detailedRequirements && section("Detailed Project Requirements", [
                      { label: "Required Features", value: l.requiredFeatures },
                      { label: "No. of Users / Scale", value: l.numberOfUsers },
                      { label: "Platform Requirements", value: l.platformRequirements },
                      { label: "Project Timeline", value: l.projectTimeline },
                    ])}
                    {l.detailedRequirements && textBlock("Detailed Requirements", l.detailedRequirements)}
                    {l.technicalRequirements && textBlock("Technical Requirements", l.technicalRequirements)}
                    {l.integrationRequirements && textBlock("Integration Requirements", l.integrationRequirements)}
                    {l.securityRequirements && textBlock("Security Requirements", l.securityRequirements)}
                    {l.performanceRequirements && textBlock("Performance Requirements", l.performanceRequirements)}
                    {l.otherConstraints && textBlock("Other Technical Constraints", l.otherConstraints)}
                    {l.additionalFinancial && textBlock("Additional Financial Info", l.additionalFinancial)}
                    {l.additionalRequirements && textBlock("Additional Requirements", l.additionalRequirements)}
                  </>
                );
              })()}
              </>)}
            </>
          )}

          {/* ── INTERACTION LOG ── */}
          {tab === "activity" && (
            <>
              {canEdit && (
                <button onClick={() => setAddingComm(true)} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: "#F9A80015", color: "#F9A800", border: "1px solid #F9A80030" }}>
                  + Record Client Interaction
                </button>
              )}

              {/* Log interaction form */}
              {addingComm && (
                <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F9A800" }}>Log Interaction</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["Call", "Meeting", "Email", "Info Response"] as const).filter((t) => {
                      if (t !== "Info Response") return true;
                      return assessments?.some((a) => a.leadName === lead!.name && a.status === "Info Required") ?? false;
                    }).map((t) => (
                      <button key={t} onClick={() => setNewCommType(t)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: newCommType === t ? commColors[t] + "20" : "transparent", color: newCommType === t ? commColors[t] : "var(--muted-foreground)", border: newCommType === t ? `1px solid ${commColors[t]}40` : "1px solid var(--border)" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea placeholder="Summarise the interaction…" value={newCommText} onChange={(e) => setNewCommText(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                  {/* Document attach (multiple) */}
                  <input ref={commDocRef} type="file" multiple className="hidden" onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    const fileArray = Array.from(files);
                    const fileCount = fileArray.length;
                    e.target.value = "";
                    const newDocs: { name: string; data: string }[] = [];
                    fileArray.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        newDocs.push({ name: file.name, data: ev.target?.result as string });
                        if (newDocs.length === fileCount) {
                          setNewCommDocs((prev) => [...prev, ...newDocs]);
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }} />
                  <div className="flex flex-col gap-1.5">
                    {newCommDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--card)", border: "1px solid #F9A80030" }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#F9A800" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#F9A800" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        <span className="text-xs flex-1 truncate" style={{ color: "#F9A800" }}>{doc.name}</span>
                        <button onClick={() => setNewCommDocs(prev => prev.filter((_, i) => i !== idx))} className="text-xs" style={{ color: "var(--muted-foreground)" }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => commDocRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs w-fit transition-opacity hover:opacity-80" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 7v4M6 9l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {newCommDocs.length > 0 ? "Add more documents" : "Attach document(s) (optional)"}
                    </button>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setAddingComm(false); setNewCommDocs([]); }} className="px-3 py-1.5 text-xs rounded-lg" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
                    <button onClick={addComm} disabled={!newCommText.trim()} className="px-4 py-1.5 text-xs rounded-lg font-semibold disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Log</button>
                  </div>
                </div>
              )}


              {/* Comm log */}
              {comms.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Interaction Log</p>
                  <div className="flex flex-col gap-2">
                    {comms.map((c) => (
                      <div key={c.id} className="rounded-xl p-4" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: commColors[c.type] + "20", color: commColors[c.type] }}>{c.type}</span>
                          <span className="text-xs ml-auto" style={{ color: "var(--muted-foreground)" }}>{c.time}</span>
                        </div>
                        <p className="text-sm">{c.summary}</p>
                        {(() => {
                          const allDocs = c.documents ?? (c.document ? [{ name: c.document, data: c.documentData ?? "" }] : []);
                          return allDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                              <span className="text-xs flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>{doc.name}</span>
                              {doc.data && (
                                <a href={doc.data} download={doc.name} className="text-xs font-semibold shrink-0 transition-opacity hover:opacity-70" style={{ color: "#60a5fa" }}>Download</a>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comms.length === 0 && (
                <p className="text-sm text-center py-12" style={{ color: "var(--muted-foreground)" }}>No interactions logged yet.</p>
              )}
            </>
          )}

          {/* ── NOTES ── */}
          {tab === "notes" && (
            <>
              {canEdit && (
                <div className="flex flex-col gap-2">
                  <textarea
                    placeholder="Add an observation or note about this lead…"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  <button onClick={addNote} disabled={!newNote.trim()} className="self-end px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    Add Note
                  </button>
                </div>
              )}
              {notes.length === 0 ? (
                <p className="text-sm text-center py-12" style={{ color: "var(--muted-foreground)" }}>No notes yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-xl p-4" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                      <p className="text-sm leading-relaxed">{n.text}</p>
                      <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* update tab removed - now inline in overview */}

        </div>
      </div>
    </div>
  );
}

function LeadsView({
  leads,
  onNewLead,
  onAssignRep,
  onDeleteLead,
  onConvertLead,
  onRejectLead,
  isSalesRep,
  isSalesManager,
  repName,
  onQualifyLead,
  onSubmitForAssessment,
  onUpdateStatus,
  onContactLead,
  assessments,
  onInfoResponse,
  onUpdateLeadDetails,
  users,
  onViewProfile,
}: {
  leads: typeof LEADS;
  onNewLead: () => void;
  onAssignRep: (leadId: number, rep: string) => void;
  onDeleteLead?: (id: number) => void;
  onConvertLead?: (lead: typeof LEADS[number]) => void;
  onRejectLead?: (leadId: number) => void;
  isSalesRep?: boolean;
  isSalesManager?: boolean;
  repName?: string;
  onQualifyLead?: (leadId: number) => void;
  onSubmitForAssessment?: (leadId: number) => void;
  onUpdateStatus?: (leadId: number, status: string) => void;
  onContactLead?: (leadId: number) => void;
  assessments?: AssessmentRecord[];
  onInfoResponse?: (leadName: string) => void;
  onUpdateLeadDetails?: (leadId: number, data: Record<string, string>) => void;
  users?: UserRecord[];
  onViewProfile?: (user: UserRecord) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [repFilter, setRepFilter] = useState("All");
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [detailLead, setDetailLead] = useState<typeof LEADS[number] | null>(null);

  const statuses = ["All", "New", "Contacted", "Qualified", "Assessment", "Closed"];

  function bothAssessmentsDone(leadName: string) {
    if (!assessments) return false;
    const leadAssessments = assessments.filter((a) => a.leadName === leadName);
    const tech = leadAssessments.find((a) => a.type === "Technical");
    const fin = leadAssessments.find((a) => a.type === "Financial");
    return (
      tech && fin &&
      tech.status === "Submitted" &&
      fin.status === "Submitted"
    );
  }

  const visibleLeads = isSalesRep ? leads.filter((l) => l.rep === repName) : leads;
  const filtered = visibleLeads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchRep = repFilter === "All" || l.rep === repFilter;
    return matchSearch && matchStatus && matchRep;
  });

  return (
    <>
    <LeadDetailPanel lead={detailLead ? (leads.find(l => l.id === detailLead.id) ?? detailLead) : null} onClose={() => setDetailLead(null)} isSalesRep={isSalesRep} isSalesManager={isSalesManager} onQualifyLead={onQualifyLead} onSubmitForAssessment={onSubmitForAssessment} onContactLead={onContactLead} assessments={assessments} onInfoResponse={onInfoResponse} onUpdateDetails={onUpdateLeadDetails} />
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isSalesRep ? "My Leads" : "Leads"}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {isSalesRep
              ? `${filtered.length} leads assigned to you`
              : `${leads.length} total leads in pipeline`}
          </p>
        </div>
        {isSalesManager && (
          <button
            onClick={onNewLead}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            + New Lead
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by company or contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", minWidth: 220 }}
        />
        {isSalesManager && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: statusFilter === "All" ? "var(--muted-foreground)" : "var(--foreground)" }}
            >
              {statuses.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: repFilter === "All" ? "var(--muted-foreground)" : "var(--foreground)" }}
            >
              <option value="All">All Reps</option>
              {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {(statusFilter !== "All" || repFilter !== "All") && (
              <button
                onClick={() => { setStatusFilter("All"); setRepFilter("All"); }}
                className="text-xs px-3 py-2.5 rounded-lg font-medium transition-colors hover:opacity-80"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                Clear filters
              </button>
            )}
          </>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {(isSalesRep
                ? ["Company", "Contact", "Value", "Status", "Assigned Rep", "Date"]
                : ["Company", "Contact", "Value", "Status", "Sales Rep", "Date", "Action"]
              ).map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr
                key={l.id}
                className="transition-colors hover:bg-[#F9A80008] cursor-pointer"
                style={{
                  background: i % 2 === 0 ? "var(--card)" : "var(--background)",
                  borderBottom: "1px solid var(--border)",
                }}
                onClick={() => setDetailLead(l)}
              >
                <td className="px-5 py-4 font-medium">{l.name}</td>
                <td className="px-5 py-4" style={{ color: "var(--muted-foreground)" }}>{l.contact}</td>
                <td className="px-5 py-4 font-mono font-semibold" style={{ color: "var(--primary)" }}>{l.value}</td>
                <td className="px-5 py-4">
                  <LeadStatusChip status={l.status} />
                </td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  {isSalesRep ? (
                    <span style={{ color: "var(--muted-foreground)" }}>{l.rep}</span>
                  ) : onViewProfile ? (
                    <div className="relative">
                      {assigningId === l.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            autoFocus
                            defaultValue={l.rep}
                            onChange={(e) => { onAssignRep(l.id, e.target.value); setAssigningId(null); }}
                            onBlur={() => setAssigningId(null)}
                            className="text-xs px-2 py-1.5 rounded-lg outline-none"
                            style={{ background: "var(--muted)", border: "1px solid var(--primary)", color: "var(--foreground)" }}
                          >
                            {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setAssigningId(l.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-[#34d39920]"
                            style={{ color: l.rep ? "#34d399" : "var(--muted-foreground)", border: "1px solid", borderColor: l.rep ? "#34d39940" : "var(--border)" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.rep ? "#34d399" : "var(--border)" }} />
                            {l.rep || "Assign rep"}
                          </button>
                          {l.rep && onViewProfile && (
                            <button onClick={(e) => { e.stopPropagation(); const u = (users ?? []).find((u) => u.name === l.rep); if (u) onViewProfile(u); }} className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#34d39920", color: "#34d399" }} title={"View " + l.rep + "'s profile"}>
                              {l.rep.split(" ").map((n: string) => n[0]).join("").slice(0, 1)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      {assigningId === l.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            autoFocus
                            defaultValue={l.rep}
                            onChange={(e) => { onAssignRep(l.id, e.target.value); setAssigningId(null); }}
                            onBlur={() => setAssigningId(null)}
                            className="text-xs px-2 py-1.5 rounded-lg outline-none"
                            style={{ background: "var(--muted)", border: "1px solid var(--primary)", color: "var(--foreground)" }}
                          >
                            {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningId(l.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-[#34d39920]"
                          style={{
                            color: l.rep ? "#34d399" : "var(--muted-foreground)",
                            border: "1px solid",
                            borderColor: l.rep ? "#34d39940" : "var(--border)",
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.rep ? "#34d399" : "var(--border)" }} />
                          {l.rep || "Assign rep"}
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{l.date}</td>
                {!isSalesRep && (
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {/* Approve to Deal + Reject Lead: only when Assessment status AND both assessments done */}
                      {isSalesManager && l.status === "Assessment" && bothAssessmentsDone(l.name) && (
                        <>
                          {onConvertLead && (
                            <button
                              onClick={() => onConvertLead(l)}
                              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:opacity-80"
                              style={{ background: "#F9A80015", color: "#F9A800", border: "1px solid #F9A80030" }}
                            >
                              Approve to Deal
                            </button>
                          )}
                          {onRejectLead && (
                            <button
                              onClick={() => onRejectLead(l.id)}
                              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:opacity-80"
                              style={{ background: "#fc4f3715", color: "#fc4f37", border: "1px solid #fc4f3730" }}
                            >
                              Reject Lead
                            </button>
                          )}
                        </>
                      )}
                      {/* Waiting indicator when in Assessment but not both done yet */}
                      {isSalesManager && l.status === "Assessment" && !bothAssessmentsDone(l.name) && (
                        <span className="text-xs px-2.5 py-1 rounded-lg" style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                          Awaiting
                        </span>
                      )}
                      {isSalesManager && onDeleteLead && (
                        confirmDeleteId === l.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onDeleteLead(l.id); setConfirmDeleteId(null); }}
                              className="text-xs px-2 py-1 rounded-lg font-semibold"
                              style={{ background: "#fc4f37", color: "#fff" }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded-lg"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(l.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-[#fc4f3720] hover:text-[#fc4f37]"
                            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                            title="Delete lead"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 2.5h7M4 2.5V2a1 1 0 0 1 2 0v.5M8 2.5l-.5 6a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5L2 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

function DealsView({
  deals,
  isSalesRep,
  canDownloadCert,
}: {
  deals: typeof DEALS;
  isSalesRep?: boolean;
  canDownloadCert?: boolean;
}) {
  const totalValue = deals.reduce((sum, d) => sum + (parseInt(d.value.replace(/[^0-9]/g, "")) || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{isSalesRep ? "My Won Deals" : "Won Deals"}</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {deals.length} {isSalesRep ? "deals assigned to you" : "won deals"} · ${totalValue > 0 ? (totalValue / 1000).toFixed(0) + "K" : "0"} total value
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {["Deal Name", "Client", "Value", "Sales Rep", "Date Won", "Certificate"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No deals yet. Convert a qualified lead to create one.
                </td>
              </tr>
            ) : deals.map((d, i) => (
              <tr
                key={d.id}
                className="transition-colors hover:bg-[#F9A80008]"
                style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderBottom: "1px solid var(--border)" }}
              >
                <td className="px-5 py-4 font-semibold">{d.name}</td>
                <td className="px-5 py-4" style={{ color: "var(--muted-foreground)" }}>{d.client}</td>
                <td className="px-5 py-4 font-mono font-bold" style={{ color: "var(--primary)" }}>{d.value}</td>
                <td className="px-5 py-4">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#F9A80018", color: "#F9A800" }}>
                    {(d as any).rep || "—"}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{(d as any).date || "—"}</td>
                <td className="px-5 py-4">
                  {(d as any).certificate ? (
                    <div className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 1.5h5.5L10 4v6.5H2V1.5z" stroke="#60a5fa" strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 1.5V4h2.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                      <span className="text-xs font-medium truncate" style={{ color: "#60a5fa", maxWidth: 120 }}>{(d as any).certificate}</span>
                      {canDownloadCert && (d as any).certificateData && (
                        <a
                          href={(d as any).certificateData}
                          download={(d as any).certificate}
                          className="text-xs font-semibold shrink-0 hover:opacity-70 transition-opacity"
                          style={{ color: "#60a5fa" }}
                        >
                          Download
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Not uploaded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type UserRecord = typeof USERS[number];

function UsersView({
  users,
  onAddUser,
  onToggleStatus,
  onUpdateUser,
  onDeleteUser,
  onChangePassword,
  currentUserEmail,
}: {
  users: UserRecord[];
  onAddUser: () => void;
  onToggleStatus: (id: number) => void;
  onUpdateUser: (id: number, data: { name: string; email: string; role: string; status: string }) => void;
  onDeleteUser?: (id: number) => void;
  onChangePassword?: (id: number, newPassword: string) => void;
  currentUserEmail?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [editingUser, setEditingUser] = useState<{ name: string; email: string; role: string; status: string } | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<UserRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const credOverlayRef = useRef<HTMLDivElement>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {users.length} registered users · {users.filter((u) => u.status === "Active").length} active
          </p>
        </div>
        <button
          onClick={onAddUser}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + Add User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, role or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm outline-none"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
      />

      <div className="flex flex-col gap-2">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-4 px-5 py-4 rounded-xl transition-colors cursor-pointer hover:border-[#ffffff20]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            onClick={() => { setSelectedUser(u); setEditingUser({ name: u.name, email: u.email, role: u.role, status: u.status }); }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: (ROLE_COLORS[u.role as Role] ?? "#7a7a90") + "20",
                color: ROLE_COLORS[u.role as Role] ?? "#7a7a90",
              }}
            >
              {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{u.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-end gap-1">
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: (ROLE_COLORS[u.role as Role] ?? "#7a7a90") + "20",
                    color: ROLE_COLORS[u.role as Role] ?? "#7a7a90",
                  }}
                >
                  {u.role}
                </span>
                <span className="text-xs" style={{ color: u.status === "Active" ? "#F9A800" : "#7a7a90" }}>
                  ● {u.status}
                </span>
              </div>
              {/* Deactivate / Activate / Delete — not for self */}
              {u.email !== currentUserEmail && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); u.status === "Active" ? setConfirmDeactivate(u) : onToggleStatus(u.id); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                    style={u.status === "Active"
                      ? { background: "#f59e0b18", color: "#f59e0b", border: "1px solid #f59e0b30" }
                      : { background: "#22c55e18", color: "#22c55e", border: "1px solid #22c55e30" }
                    }
                  >
                    {u.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(u); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "#fc4f3718", color: "#fc4f37", border: "1px solid #fc4f3730" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>No users match your search.</p>
        )}
      </div>

      {/* User detail panel */}
      {selectedUser && (() => {
        const eu = editingUser ?? { name: selectedUser.name, email: selectedUser.email, role: selectedUser.role, status: selectedUser.status };
        return (
          <div
            ref={credOverlayRef}
            className="fixed inset-0 z-50 flex justify-end"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === credOverlayRef.current) { setSelectedUser(null); setEditingUser(null); } }}
          >
            <div className="w-full max-w-md h-full flex flex-col shadow-2xl" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: (ROLE_COLORS[selectedUser.role as Role] ?? "#7a7a90") + "25", color: ROLE_COLORS[selectedUser.role as Role] ?? "#7a7a90" }}>
                    {selectedUser.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">{selectedUser.name}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{selectedUser.role}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedUser(null); setEditingUser(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
                {/* Account Information */}
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Account Information</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Full Name</label>
                      <input value={eu.name} onChange={(e) => setEditingUser({ ...eu, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Email Address</label>
                      <input value={eu.email} onChange={(e) => setEditingUser({ ...eu, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Role</label>
                      <select value={eu.role} onChange={(e) => setEditingUser({ ...eu, role: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                      <span className="text-sm font-medium" style={{ color: eu.status === "Active" ? "#F9A800" : "#7a7a90" }}>● {eu.status}</span>
                      {selectedUser.email !== currentUserEmail && (
                        <button
                          onClick={() => setEditingUser({ ...eu, status: eu.status === "Active" ? "Inactive" : "Active" })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                          style={eu.status === "Active"
                            ? { background: "#f59e0b18", color: "#f59e0b", border: "1px solid #f59e0b30" }
                            : { background: "#22c55e18", color: "#22c55e", border: "1px solid #22c55e30" }
                          }
                        >
                          {eu.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                {onChangePassword && selectedUser.email !== currentUserEmail && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>Change Password</p>
                    <div className="flex flex-col gap-2">
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); setPasswordSaved(false); }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={newPasswordConfirm}
                        onChange={(e) => { setNewPasswordConfirm(e.target.value); setPasswordError(""); setPasswordSaved(false); }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                      {passwordError && <p className="text-xs" style={{ color: "#fc4f37" }}>{passwordError}</p>}
                      {passwordSaved && <p className="text-xs" style={{ color: "#22c55e" }}>✓ Password updated</p>}
                      <button
                        onClick={() => {
                          if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters."); return; }
                          if (newPassword !== newPasswordConfirm) { setPasswordError("Passwords do not match."); return; }
                          onChangePassword(selectedUser.id, newPassword);
                          setNewPassword(""); setNewPasswordConfirm(""); setPasswordSaved(true);
                        }}
                        disabled={!newPassword || !newPasswordConfirm}
                        className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}

                {/* System Information */}
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>System Information</p>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <span className="text-sm font-medium">Last Login</span>
                    <span className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>{selectedUser.lastLogin}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedUser(null); setEditingUser(null); setNewPassword(""); setNewPasswordConfirm(""); setPasswordSaved(false); }} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
                    Cancel
                  </button>
                  {onDeleteUser && selectedUser.email !== currentUserEmail && (
                    <button onClick={() => setConfirmDelete(selectedUser)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "#fc4f3718", color: "#fc4f37", border: "1px solid #fc4f3730" }}>
                      Delete User
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (!editingUser) return;
                    onUpdateUser(selectedUser.id, editingUser);
                    setSelectedUser(null);
                    setEditingUser(null);
                  }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Deactivation confirmation dialog */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-6 flex flex-col gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base">Deactivate User?</h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                <strong>{confirmDeactivate.name}</strong> will no longer be able to log in. You can reactivate them at any time.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDeactivate(null)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button
                onClick={() => { onToggleStatus(confirmDeactivate.id); setConfirmDeactivate(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#f59e0b", color: "#fff" }}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-6 flex flex-col gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base" style={{ color: "#fc4f37" }}>Delete User?</h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                This will permanently remove <strong>{confirmDelete.name}</strong> from the system. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button
                onClick={() => {
                  if (onDeleteUser) onDeleteUser(confirmDelete.id);
                  setConfirmDelete(null);
                  setSelectedUser(null);
                  setEditingUser(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#fc4f37", color: "#fff" }}
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── New User Panel ───────────────────────────────────────────────────────────

function NewUserPanel({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (u: Omit<UserRecord, "id" | "lastLogin">) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Sales Rep" as Role, status: "Active" });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setForm({ name: "", email: "", password: "", role: "Sales Rep", status: "Active" }); setSaved(false); setShowPw(false); }
  }, [open]);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name: form.name, email: form.email, password: form.password, role: form.role, status: form.status });
    setSaved(true);
    setTimeout(onClose, 1100);
  }

  if (!open) return null;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };
  const labelCls = "text-xs font-semibold uppercase tracking-widest block mb-1.5";
  const labelStyle = { color: "var(--muted-foreground)" };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="w-full max-w-md h-full flex flex-col shadow-2xl"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Add User</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Create a new account and assign a role</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Identity</p>
            <div>
              <label className={labelCls} style={labelStyle}>Full Name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kamal Jayasuriya" className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Email Address *</label>
              <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="name@altrium.io" className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Password *</label>
              <div className="relative">
                <input required type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 6 characters" className={inputCls} style={{ ...inputStyle, paddingRight: "2.5rem" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Role & Access</p>
            <div>
              <label className={labelCls} style={labelStyle}>Role *</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button key={r} type="button" onClick={() => set("role", r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.role === r ? ROLE_COLORS[r] + "25" : "var(--muted)",
                      color: form.role === r ? ROLE_COLORS[r] : "var(--muted-foreground)",
                      border: `1px solid ${form.role === r ? ROLE_COLORS[r] + "50" : "transparent"}`,
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Status</label>
              <div className="flex gap-2">
                {["Active", "Inactive"].map((s) => (
                  <button key={s} type="button" onClick={() => set("status", s)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.status === s ? (s === "Active" ? "#F9A80025" : "#7a7a9025") : "var(--muted)",
                      color: form.status === s ? (s === "Active" ? "#F9A800" : "#7a7a90") : "var(--muted-foreground)",
                      border: `1px solid ${form.status === s ? (s === "Active" ? "#F9A80040" : "#7a7a9040") : "transparent"}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.name && (
            <div className="p-4 rounded-xl" style={{ background: "#F9A80010", border: "1px solid #F9A80030" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: ROLE_COLORS[form.role] + "25", color: ROLE_COLORS[form.role] }}>
                  {form.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{form.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{form.email || "no email yet"}</p>
                </div>
                <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: ROLE_COLORS[form.role] + "20", color: ROLE_COLORS[form.role] }}>
                  {form.role}
                </span>
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saved || !form.name || !form.email || form.password.length < 6}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: saved ? "#F9A80030" : "var(--primary)", color: saved ? "var(--primary)" : "var(--primary-foreground)" }}>
            {saved ? "✓ User Added" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssessmentsView({
  assessments,
  role,
  leads = [],
  users = [],
  onSubmitAssessment,
  onRequestInfo,
  onSetInReview,
  onViewProfile,
}: {
  assessments: AssessmentRecord[];
  role: Role;
  leads?: typeof LEADS;
  users?: UserRecord[];
  onSubmitAssessment: (id: number, notes: string, risk: "Low" | "Medium" | "High", docs: { name: string; data: string }[], structuredData?: Record<string, string>) => void;
  onRequestInfo: (id: number, request: string) => void;
  onSetInReview?: (id: number) => void;
  onViewProfile?: (user: UserRecord) => void;
}) {
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [risk, setRisk] = useState<"Low" | "Medium" | "High">("Low");
  const [docs, setDocs] = useState<{ name: string; data: string }[]>([]);
  const [search, setSearch] = useState("");
  const [logLead, setLogLead] = useState<typeof LEADS[number] | null>(null);
  const [requestingId, setRequestingId] = useState<number | null>(null);
  const [infoRequestText, setInfoRequestText] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const logOverlayRef = useRef<HTMLDivElement>(null);

  // Extended assessment form fields
  const [techForm, setTechForm] = useState<Record<string, string>>({});
  const [finForm, setFinForm] = useState<Record<string, string>>({});
  const tf = (key: string, val: string) => setTechForm((p) => ({ ...p, [key]: val }));
  const ff = (key: string, val: string) => setFinForm((p) => ({ ...p, [key]: val }));

  // Draft helpers — persisted to Supabase KV so any device can resume
  function loadDraft(id: number) {
    apiLoadDraft(id)
      .then(({ draft }) => {
        if (!draft) return;
        if (draft.techForm) setTechForm(draft.techForm);
        if (draft.finForm) setFinForm(draft.finForm);
        if (draft.notes !== undefined) setNotes(draft.notes);
        if (draft.risk) setRisk(draft.risk);
        if (draft.docs) setDocs(draft.docs);
      })
      .catch(() => {
        // Fall back to localStorage if server unreachable
        try {
          const raw = localStorage.getItem(`draft_assess_${id}`);
          if (!raw) return;
          const d = JSON.parse(raw);
          if (d.techForm) setTechForm(d.techForm);
          if (d.finForm) setFinForm(d.finForm);
          if (d.notes !== undefined) setNotes(d.notes);
          if (d.risk) setRisk(d.risk);
          if (d.docs) setDocs(d.docs);
        } catch {}
      });
  }
  function saveDraft(id: number) {
    const payload = { techForm, finForm, notes, risk, docs };
    apiSaveDraft(id, payload)
      .then(() => {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
        if (onSetInReview) onSetInReview(id);
        // Mirror to localStorage as offline fallback
        try { localStorage.setItem(`draft_assess_${id}`, JSON.stringify(payload)); } catch {}
      })
      .catch(() => {
        // Offline: save only locally
        try {
          localStorage.setItem(`draft_assess_${id}`, JSON.stringify(payload));
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 2000);
          if (onSetInReview) onSetInReview(id);
        } catch {}
      });
  }

  const isTechLead = role === "Tech Lead";
  const isFinance = role === "Finance Officer";
  const isManager = role === "Sales Manager";

  const riskColor: Record<string, string> = { High: "#fc4f37", Medium: "#f59e0b", Low: "#F9A800" };
  const typeColor: Record<string, string> = { Technical: "#1a6fe8", Financial: "#a78bfa" };
  const statusColor: Record<string, string> = {
    Pending: "#f59e0b", "In Review": "#a78bfa", Submitted: "#1a6fe8", "Info Required": "#fc4f37",
  };

  const visible = assessments.filter((a) => {
    if (isTechLead) return a.type === "Technical";
    if (isFinance) return a.type === "Financial";
    return true;
  });

  const filtered = search.trim()
    ? visible.filter((a) => a.leadName.toLowerCase().includes(search.toLowerCase()) || a.assessor.toLowerCase().includes(search.toLowerCase()))
    : visible;

  const title = isTechLead ? "Technical Assessments" : isFinance ? "Financial Assessments" : "All Assessments";
  const pendingCount = visible.filter((a) => a.status === "Pending" || a.status === "In Review" || a.status === "Info Required").length;

  const companiesWithAssessments: string[] = isManager
    ? Array.from(new Set(filtered.map((a) => a.leadName)))
    : [];

  function cancelSubmit() {
    setSubmittingId(null);
    setNotes("");
    setDocs([]);
    setTechForm({});
    setFinForm({});
    setDraftSaved(false);
    setSubmitErrors([]);
  }

  const TECH_LABELS: Record<string, string> = {
    feasibility: "Technical Feasibility", requirementAssessment: "Requirement Assessment",
    technologyAssessment: "Technology Assessment", platformAssessment: "Platform Assessment",
    integrationAssessment: "Integration Assessment", securityAssessment: "Security Assessment",
    performanceAssessment: "Performance Assessment", resourceRequirements: "Resource Requirements",
    technicalRisks: "Technical Risks", technicalConstraints: "Technical Constraints / Conditions",
    recommendation: "Technical Recommendation", technicalComments: "Technical Comments",
  };
  const FIN_LABELS: Record<string, string> = {
    resourceCost: "Resource Cost", infraCost: "Infrastructure Cost", otherCosts: "Other Costs",
    projectCost: "Estimated Project Cost", expectedProfit: "Expected Profit", profitMargin: "Profit Margin (%)",
    paymentTermsAssessment: "Payment Terms Assessment", budgetAssessment: "Budget Assessment",
    financialRisks: "Financial Risks", financialConditions: "Financial Conditions",
    recommendation: "Financial Recommendation", financialComments: "Financial Comments",
  };

  function AssessmentRow({ a }: { a: AssessmentRecord }) {
    const structData = a.type === "Technical" ? a.techData : a.finData;
    const labelMap = a.type === "Technical" ? TECH_LABELS : FIN_LABELS;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: typeColor[a.type] + "20", color: typeColor[a.type] }}>
              {a.type}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusColor[a.status] + "20", color: statusColor[a.status] }}>
              {a.status}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: riskColor[a.risk] }}>
              {a.risk} risk
            </span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium">{a.assessor}</p>
            {a.date !== "—" && <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{a.date}</p>}
          </div>
        </div>
        {/* Structured assessment data */}
        {structData && Object.keys(structData).length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            {Object.entries(structData).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="px-3 py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <p className="text-xs mb-0.5 font-semibold" style={{ color: "var(--muted-foreground)" }}>{labelMap[k] ?? k}</p>
                <p className="text-xs leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
        )}
        {/* Summary notes */}
        {a.notes && (
          <div className="px-3 py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
            <p className="text-xs mb-0.5 font-semibold" style={{ color: "var(--muted-foreground)" }}>Summary Notes</p>
            <p className="text-xs leading-relaxed">{a.notes}</p>
          </div>
        )}
        {/* Document chips */}
        {(() => {
          const allDocs = [...(a.documents ?? []), ...(a.document ? [{ name: a.document, data: a.documentData ?? "" }] : [])];
          return allDocs.map((d, idx) => (
            <div key={idx} className="flex items-center gap-2 mt-1 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              <span className="text-xs flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>{d.name}</span>
              {d.data && <a href={d.data} download={d.name} className="text-xs font-semibold shrink-0 hover:opacity-70" style={{ color: "#60a5fa" }}>Download</a>}
            </div>
          ));
        })()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {pendingCount} pending · {visible.length} total
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#7a7a90" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="#7a7a90" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by company or assessor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none w-64"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Sales Manager: merged view per company */}
        {isManager && companiesWithAssessments.map((company) => {
          const companyAssessments = filtered.filter((a) => a.leadName === company);
          const tech = companyAssessments.find((a) => a.type === "Technical");
          const fin = companyAssessments.find((a) => a.type === "Financial");
          const techDone = tech?.status === "Submitted";
          const finDone = fin?.status === "Submitted";
          const bothDone = techDone && finDone;
          const anySubmitted = companyAssessments.some((a) => a.status === "Submitted");

          // Pending labels
          const pendingLabels: string[] = [];
          if (!techDone) pendingLabels.push("Technical assessment pending");
          if (!finDone) pendingLabels.push("Financial assessment pending");
          const infoRequiredAssessments = companyAssessments.filter((a) => a.status === "Info Required");

          return (
            <div
              key={company}
              className="rounded-xl p-5"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <button
                    onClick={() => { const l = leads?.find((x) => x.name === company); if (l) setLogLead(l); }}
                    className="font-semibold text-base text-left hover:underline underline-offset-2 transition-all"
                    style={{ color: "var(--foreground)" }}
                    title="View interaction log"
                  >{company}</button>
                  {pendingLabels.length > 0 && !bothDone && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {pendingLabels.map((lbl) => (
                        <span key={lbl} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b30" }}>
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                  {infoRequiredAssessments.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1.5">
                      {infoRequiredAssessments.map((a) => (
                        <div key={a.id} className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "#fc4f3712", border: "1px solid #fc4f3730" }}>
                          <span className="text-xs shrink-0">⚠️</span>
                          <div>
                            <span className="text-xs font-semibold" style={{ color: "#fc4f37" }}>{a.type} assessor needs info: </span>
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{a.infoRequest}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {bothDone && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#F9A80015", color: "#F9A800", border: "1px solid #F9A80030" }}>
                      Both Complete
                    </span>
                  )}
                  {anySubmitted && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#1a6fe815", color: "#60a5fa", border: "1px solid #1a6fe830" }}>
                      Review Needed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {tech && (
                  <div className="rounded-lg p-4" style={{ background: "#1a6fe808", border: "1px solid #1a6fe820" }}>
                    <AssessmentRow a={tech} />
                  </div>
                )}
                {fin && (
                  <div className="rounded-lg p-4" style={{ background: "#a78bfa08", border: "1px solid #a78bfa20" }}>
                    <AssessmentRow a={fin} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Tech Lead / Finance Officer: individual cards with doc upload */}
        {!isManager && filtered.map((a) => {
          const cardLead = leads?.find((l) => l.name === a.leadName) ?? null;
          return (
          <div
            key={a.id}
            className="rounded-xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <button
                  onClick={() => cardLead && setLogLead(cardLead)}
                  className="font-semibold text-base text-left hover:underline underline-offset-2 transition-all"
                  style={{ color: "var(--foreground)" }}
                  title="View interaction log"
                >{a.leadName}</button>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: typeColor[a.type] + "20", color: typeColor[a.type] }}>
                    {a.type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: statusColor[a.status] + "20", color: statusColor[a.status] }}>
                    {a.status}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: riskColor[a.risk] }}>
                    {a.risk} risk
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Assessor</p>
                {onViewProfile ? (
                  <button
                    onClick={() => { const u = users.find((u) => u.name === a.assessor); if (u) onViewProfile(u); }}
                    className="text-sm font-medium hover:underline underline-offset-2"
                    style={{ color: "var(--foreground)" }}
                  >{a.assessor}</button>
                ) : (
                  <p className="text-sm font-medium">{a.assessor}</p>
                )}
                {a.date !== "—" && <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.date}</p>}
              </div>
            </div>

            {/* Submitted: show full structured assessment view */}
            {a.status === "Submitted" ? (
              <div className="mt-1 rounded-lg p-4" style={{ background: a.type === "Technical" ? "#1a6fe808" : "#a78bfa08", border: `1px solid ${a.type === "Technical" ? "#1a6fe820" : "#a78bfa20"}` }}>
                <AssessmentRow a={a} />
              </div>
            ) : (
              <>
                {a.notes && (
                  <p className="text-sm px-4 py-3 rounded-lg mb-3" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {a.notes}
                  </p>
                )}
                {(() => {
                  const allDocs = [...(a.documents ?? []), ...(a.document ? [{ name: a.document, data: a.documentData ?? "" }] : [])];
                  return allDocs.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                      <span className="text-xs flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>{d.name}</span>
                      {d.data && <a href={d.data} download={d.name} className="text-xs font-semibold shrink-0 hover:opacity-70" style={{ color: "#60a5fa" }}>Download</a>}
                    </div>
                  ));
                })()}
              </>
            )}

            {/* Info request banner on the card */}
            {(isTechLead || isFinance) && a.status === "Info Required" && a.infoRequest && (
              <div className="mt-3 px-3 py-2.5 rounded-lg flex gap-2 items-start" style={{ background: "#fc4f3715", border: "1px solid #fc4f3730" }}>
                <span className="text-sm shrink-0">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold mb-0.5" style={{ color: "#fc4f37" }}>Info requested from Sales Rep</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{a.infoRequest}</p>
                </div>
              </div>
            )}

            {(isTechLead || isFinance) && a.status === "Submitted" && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#1a6fe810", border: "1px solid #1a6fe830" }}>
                <span className="text-xs" style={{ color: "#60a5fa" }}>✓</span>
                <p className="text-xs font-medium" style={{ color: "#60a5fa" }}>Assessment submitted — read only. Contact your Sales Manager to reopen if changes are needed.</p>
              </div>
            )}

            {(isTechLead || isFinance) && (a.status === "Pending" || a.status === "In Review" || a.status === "Info Required") && (
              requestingId === a.id ? (
                <div className="flex flex-col gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#fc4f37" }}>Request Additional Information</p>
                  <textarea
                    placeholder="Describe what additional information you need from the Sales Rep…"
                    value={infoRequestText}
                    onChange={(e) => setInfoRequestText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#fc4f37")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setRequestingId(null); setInfoRequestText(""); }} className="px-3 py-1.5 text-xs rounded-lg" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
                    <button
                      onClick={() => { onRequestInfo(a.id, infoRequestText.trim()); setRequestingId(null); setInfoRequestText(""); }}
                      disabled={!infoRequestText.trim()}
                      className="px-4 py-1.5 text-xs rounded-lg font-semibold disabled:opacity-50"
                      style={{ background: "#fc4f37", color: "#fff" }}
                    >Send Request</button>
                  </div>
                </div>
              ) : submittingId === a.id ? (
                <div className="flex flex-col gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {/* Tech Lead assessment form */}
                  {isTechLead && (() => {
                    const TECH_REQUIRED = ["feasibility", "requirementAssessment", "technologyAssessment", "securityAssessment", "resourceRequirements", "technicalRisks", "recommendation"];
                    const inp = (label: string, key: string, ph: string, required = false, applicable = false, rows = 2) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium" style={{ color: required ? "var(--foreground)" : "var(--muted-foreground)" }}>
                            {label}{required && <span style={{ color: "#fc4f37" }}> *</span>}
                          </p>
                          {applicable && (
                            <button type="button" onClick={() => tf(key, "Not Applicable (N/A)")}
                              className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                              N/A
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={rows}
                          placeholder={ph}
                          value={techForm[key] ?? ""}
                          onChange={(e) => tf(key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                          style={{ background: "var(--muted)", border: `1px solid ${required && submitErrors.includes(key) ? "#fc4f37" : "var(--border)"}`, color: "var(--foreground)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#1a6fe8")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = required && submitErrors.includes(key) ? "#fc4f37" : "var(--border)")}
                        />
                      </div>
                    );
                    return (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a6fe8" }}>Technical Assessment</p>
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Technical Feasibility <span style={{ color: "#fc4f37" }}>*</span></p>
                          <select value={techForm.feasibility ?? ""} onChange={(e) => tf("feasibility", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--muted)", border: `1px solid ${submitErrors.includes("feasibility") ? "#fc4f37" : "var(--border)"}`, color: "var(--foreground)" }}>
                            <option value="">— Select —</option>
                            <option>Technically Feasible</option>
                            <option>Feasible with Conditions</option>
                            <option>Technically Not Feasible</option>
                          </select>
                        </div>
                        {inp("Requirement Assessment", "requirementAssessment", "Review each requirement and state whether it is feasible…", true)}
                        {inp("Technology Assessment", "technologyAssessment", "Suitability of required technologies, frameworks, databases…", true)}
                        {inp("Platform Assessment", "platformAssessment", "Web, mobile, desktop, cloud or on-premises platform suitability…", false, true)}
                        {inp("Integration Assessment", "integrationAssessment", "Can existing systems/APIs/third-party services be integrated?", false, true)}
                        {inp("Security Assessment", "securityAssessment", "Evaluation of security requirements implementation…", true)}
                        {inp("Performance Assessment", "performanceAssessment", "System capacity, response time, user load capability…", false, true)}
                        {inp("Resource Requirements", "resourceRequirements", "Developers, testers, DevOps, specialists required…", true)}
                        {inp("Technical Risks", "technicalRisks", "Possible risks, likelihood, impact, mitigation…", true)}
                        {inp("Technical Constraints / Conditions", "technicalConstraints", "Limitations, dependencies or conditions to consider…", false, true)}
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Technical Recommendation <span style={{ color: "#fc4f37" }}>*</span></p>
                          <select value={techForm.recommendation ?? ""} onChange={(e) => tf("recommendation", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--muted)", border: `1px solid ${submitErrors.includes("recommendation") ? "#fc4f37" : "var(--border)"}`, color: "var(--foreground)" }}>
                            <option value="">— Select —</option>
                            <option>Recommend to Proceed</option>
                            <option>Proceed with Conditions</option>
                            <option>Do Not Proceed</option>
                          </select>
                        </div>
                        {inp("Technical Comments", "technicalComments", "Explanations, assumptions, additional information…", false, false, 3)}
                        {/* suppress unused var warning */ void TECH_REQUIRED}
                      </div>
                    );
                  })()}

                  {/* Finance Officer assessment form */}
                  {isFinance && (() => {
                    const FIN_REQUIRED = ["resourceCost", "budgetAssessment", "financialRisks", "recommendation"];
                    const inp = (label: string, key: string, ph: string, required = false, applicable = false, rows = 2) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium" style={{ color: required ? "var(--foreground)" : "var(--muted-foreground)" }}>
                            {label}{required && <span style={{ color: "#fc4f37" }}> *</span>}
                          </p>
                          {applicable && (
                            <button type="button" onClick={() => ff(key, "Not Applicable (N/A)")}
                              className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                              N/A
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={rows}
                          placeholder={ph}
                          value={finForm[key] ?? ""}
                          onChange={(e) => ff(key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                          style={{ background: "var(--muted)", border: `1px solid ${required && submitErrors.includes(key) ? "#fc4f37" : "var(--border)"}`, color: "var(--foreground)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = required && submitErrors.includes(key) ? "#fc4f37" : "var(--border)")}
                        />
                      </div>
                    );
                    const numInp = (label: string, key: string, ph: string, required = false) => (
                      <div key={key}>
                        <p className="text-xs font-medium mb-1" style={{ color: required ? "var(--foreground)" : "var(--muted-foreground)" }}>
                          {label}{required && <span style={{ color: "#fc4f37" }}> *</span>}
                        </p>
                        <input type="number" min="0" placeholder={ph} value={finForm[key] ?? ""} onChange={(e) => ff(key, e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--muted)", border: `1px solid ${required && submitErrors.includes(key) ? "#fc4f37" : "var(--border)"}`, color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                      </div>
                    );
                    // Auto-calculations
                    const resC = parseFloat(finForm.resourceCost || "0") || 0;
                    const infC = parseFloat(finForm.infraCost || "0") || 0;
                    const othC = parseFloat(finForm.otherCosts || "0") || 0;
                    const projCost = resC + infC + othC;
                    const dealValRaw = parseFloat((cardLead?.value ?? "").replace(/[^0-9.]/g, "")) || 0;
                    const profit = dealValRaw - projCost;
                    const margin = dealValRaw > 0 ? ((profit / dealValRaw) * 100).toFixed(1) : "0.0";
                    const currency = (cardLead as any)?.currency || "USD";
                    return (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Financial Assessment</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#a78bfa20", color: "#a78bfa" }}>Currency: {currency}</span>
                        </div>
                        {cardLead && (
                          <div className="px-3 py-2 rounded-lg" style={{ background: "#a78bfa10", border: "1px solid #a78bfa30" }}>
                            <p className="text-xs font-semibold" style={{ color: "#a78bfa" }}>Expected Deal Value: {cardLead.value}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {numInp("Resource Cost", "resourceCost", "e.g. 14000", true)}
                          {numInp("Infrastructure Cost", "infraCost", "e.g. 3000")}
                          {numInp("Other Costs", "otherCosts", "e.g. 1000")}
                        </div>
                        {/* Auto-calculated fields */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Project Cost", value: projCost.toLocaleString() },
                            { label: "Expected Profit", value: profit.toLocaleString() },
                            { label: "Profit Margin", value: margin + "%" },
                          ].map(({ label, value }) => (
                            <div key={label} className="px-3 py-2 rounded-lg text-center" style={{ background: "var(--muted)", border: "1px solid #a78bfa30" }}>
                              <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                              <p className="text-sm font-bold font-mono" style={{ color: "#a78bfa" }}>{value}</p>
                              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>auto-calculated</p>
                            </div>
                          ))}
                        </div>
                        {inp("Payment Terms Assessment", "paymentTermsAssessment", "Client's expected payment schedule or conditions…", false, true)}
                        {inp("Budget Assessment", "budgetAssessment", "Is the client's budget sufficient for the proposed project?", true)}
                        {inp("Financial Risks", "financialRisks", "Insufficient budget, payment delays, unexpected costs…", true)}
                        {inp("Financial Conditions", "financialConditions", "Conditions such as advance payment or scope revision…", false, true)}
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Financial Recommendation <span style={{ color: "#fc4f37" }}>*</span></p>
                          <select value={finForm.recommendation ?? ""} onChange={(e) => ff("recommendation", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--muted)", border: `1px solid ${submitErrors.includes("recommendation") ? "#fc4f37" : "var(--border)"}`, color: "var(--foreground)" }}>
                            <option value="">— Select —</option>
                            <option>Financially Viable</option>
                            <option>Viable with Conditions</option>
                            <option>Not Financially Viable</option>
                          </select>
                        </div>
                        {inp("Financial Comments", "financialComments", "Explain the financial assessment and recommendation…", false, false, 3)}
                        {/* suppress unused var warning */ void FIN_REQUIRED}
                      </div>
                    );
                  })()}

                  {/* Summary notes (both roles) */}
                  <textarea
                    placeholder="Assessment summary notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  {/* Document upload (multiple) */}
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const fileArray = Array.from(files);
                      const fileCount = fileArray.length;
                      e.target.value = "";
                      const newDocs: { name: string; data: string }[] = [];
                      fileArray.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          newDocs.push({ name: file.name, data: ev.target?.result as string });
                          if (newDocs.length === fileCount) {
                            setDocs((prev) => [...prev, ...newDocs]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    {docs.map((d, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#F9A800" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#F9A800" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        <span className="text-xs flex-1 truncate" style={{ color: "#F9A800" }}>{d.name}</span>
                        <button onClick={() => setDocs((prev) => prev.filter((_, i) => i !== idx))} className="text-xs" style={{ color: "var(--muted-foreground)" }}>✕</button>
                      </div>
                    ))}
                    <button
                      onClick={() => docInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-fit transition-opacity hover:opacity-80"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 1h5.5L13 4.5V15H4V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M8 7v4M6 9l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Attach document(s) (optional)
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={risk}
                      onChange={(e) => setRisk(e.target.value as "Low" | "Medium" | "High")}
                      className="px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                    </select>
                    {(() => {
                      const TECH_REQUIRED = ["feasibility", "requirementAssessment", "technologyAssessment", "securityAssessment", "resourceRequirements", "technicalRisks", "recommendation"];
                      const FIN_REQUIRED = ["resourceCost", "budgetAssessment", "financialRisks", "recommendation"];
                      const TECH_LABELS_LOCAL: Record<string, string> = { feasibility: "Technical Feasibility", requirementAssessment: "Requirement Assessment", technologyAssessment: "Technology Assessment", securityAssessment: "Security Assessment", resourceRequirements: "Resource Requirements", technicalRisks: "Technical Risks", recommendation: "Technical Recommendation" };
                      const FIN_LABELS_LOCAL: Record<string, string> = { resourceCost: "Resource Cost", budgetAssessment: "Budget Assessment", financialRisks: "Financial Risks", recommendation: "Financial Recommendation" };
                      return (
                        <div className="flex flex-col gap-2">
                          {submitErrors.length > 0 && (
                            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#fc4f3715", border: "1px solid #fc4f3740", color: "#fc4f37" }}>
                              <p className="font-semibold mb-1">Please complete the required fields before submitting:</p>
                              <ul className="list-disc list-inside">
                                {submitErrors.map((k) => (
                                  <li key={k}>{(isTechLead ? TECH_LABELS_LOCAL : FIN_LABELS_LOCAL)[k] ?? k}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex gap-2 ml-auto flex-wrap">
                            <button onClick={cancelSubmit} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--muted-foreground)" }}>
                              Cancel
                            </button>
                            {(() => {
                              const activeForm = isTechLead ? techForm : finForm;
                              const hasFormData = Object.values(activeForm).some((v) => v && String(v).trim() !== "");
                              return (
                                <button
                                  onClick={() => saveDraft(a.id)}
                                  disabled={!hasFormData}
                                  title={!hasFormData ? "Fill at least one field to save a draft" : undefined}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                                  style={{ background: draftSaved ? "#22c55e20" : "var(--muted)", color: draftSaved ? "#22c55e" : "var(--muted-foreground)", border: "1px solid var(--border)" }}
                                >
                                  {draftSaved ? "✓ Draft Saved" : "Save Draft"}
                                </button>
                              );
                            })()}
                            <button
                              onClick={() => {
                                const activeForm = isTechLead ? techForm : finForm;
                                const required = isTechLead ? TECH_REQUIRED : FIN_REQUIRED;
                                const missing = required.filter((k) => !activeForm[k]?.trim());
                                if (missing.length > 0) { setSubmitErrors(missing); return; }
                                setSubmitErrors([]);
                                const submitFinForm = isFinance ? (() => {
                                  const resC = parseFloat(finForm.resourceCost || "0") || 0;
                                  const infC = parseFloat(finForm.infraCost || "0") || 0;
                                  const othC = parseFloat(finForm.otherCosts || "0") || 0;
                                  const projCost = resC + infC + othC;
                                  const dealValRaw = parseFloat((cardLead?.value ?? "").replace(/[^0-9.]/g, "")) || 0;
                                  const profit = dealValRaw - projCost;
                                  const margin = dealValRaw > 0 ? ((profit / dealValRaw) * 100).toFixed(1) : "0.0";
                                  return { ...finForm, projectCost: String(projCost), expectedProfit: String(profit), profitMargin: margin + "%" };
                                })() : finForm;
                                const structuredData = isTechLead ? techForm : isFinance ? submitFinForm : undefined;
                                onSubmitAssessment(a.id, notes, risk, docs, structuredData);
                                apiDeleteDraft(a.id).catch(() => {});
                                try { localStorage.removeItem(`draft_assess_${a.id}`); } catch {}
                                cancelSubmit();
                              }}
                              className="px-4 py-2 rounded-lg text-sm font-semibold"
                              style={{ background: "var(--secondary)", color: "#fff" }}
                            >
                              Submit Assessment
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button
                    onClick={() => { setSubmittingId(a.id); setNotes(a.notes); setRisk(a.risk); setDocs([]); loadDraft(a.id); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "#1a6fe815", color: "#60a5fa", border: "1px solid #1a6fe830" }}
                  >
                    {a.status === "In Review" || a.status === "Info Required" ? "Continue Assessment" : "Start Assessment"}
                  </button>
                  <button
                    onClick={() => { setRequestingId(a.id); setInfoRequestText(a.infoRequest ?? ""); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "#fc4f3715", color: "#fc4f37", border: "1px solid #fc4f3730" }}
                  >
                    Request Info
                  </button>
                </div>
              )
            )}
          </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: "var(--muted-foreground)" }}>
            {search ? (
              <>
                <p className="text-lg mb-1">No results for "{search}"</p>
                <p className="text-sm">Try a different company or assessor name.</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-1">No assessments</p>
                <p className="text-sm">Assessments will appear here when leads are submitted.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Interaction Log Panel */}
      {logLead && (
        <div
          ref={logOverlayRef}
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === logOverlayRef.current) setLogLead(null); }}
        >
          <div className="w-full max-w-md h-full flex flex-col shadow-2xl" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{logLead.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {logLead.industry} · {logLead.source}
                </p>
              </div>
              <button onClick={() => setLogLead(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>

            {/* Scrollable body: lead details + assessment docs + interaction log */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

            {/* Full lead details — role-specific */}
            {(isTechLead || isFinance || isManager) && (() => {
              const la = logLead as any;
              const textBlock = (label: string, value: string | undefined) => value ? (
                <div key={label} className="px-3 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                  <p className="text-xs leading-relaxed">{value}</p>
                </div>
              ) : null;
              const chip = (label: string, value: string | undefined) => value ? (
                <div key={label} className="px-3 py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                  <p className="text-xs font-semibold truncate">{value}</p>
                </div>
              ) : null;
              const sectionHeader = (title: string, color: string) => (
                <p key={title} className="text-xs font-bold uppercase tracking-widest pt-2" style={{ color }}>{title}</p>
              );
              return (
                <div className="mx-6 mt-5 flex flex-col gap-2">
                  {/* 1. Opportunity Summary */}
                  {sectionHeader("Opportunity Summary", "#F9A800")}
                  {textBlock("Lead Description", la.leadDescription)}
                  <div className="grid grid-cols-2 gap-2">
                    {chip("Timeline", la.projectTimeline)}
                    {chip("Lead Status", logLead.status)}
                    {chip("Assigned Sales Rep", logLead.rep || "—")}
                  </div>

                  {/* 2. Organisation Context */}
                  {sectionHeader("Organisation Context", "#60a5fa")}
                  <div className="grid grid-cols-2 gap-2">
                    {chip("Industry", logLead.industry)}
                    {chip("Company Size", la.companySize)}
                    {chip("No. of Users", la.numberOfUsers)}
                    {chip("Website", la.website)}
                  </div>

                  {/* 3. Project Requirements */}
                  {sectionHeader("Project Requirements", "#a78bfa")}
                  {textBlock("Business Need", la.businessNeed)}
                  {textBlock("Expected Solution", la.expectedSolution)}
                  {textBlock("Initial Requirement", la.initialRequirement)}
                  {textBlock("Detailed Requirements", la.detailedRequirements)}
                  {textBlock("Required Features", la.requiredFeatures)}

                  {/* 4. Technical Requirements — Tech Lead & Manager */}
                  {(isTechLead || isManager) && (
                    <>
                      {sectionHeader("Technical Requirements", "#1a6fe8")}
                      {textBlock("Technology Requirements", la.technicalRequirements)}
                      {textBlock("Platform Requirements", la.platformRequirements)}
                      {textBlock("Integration Requirements", la.integrationRequirements)}
                      {textBlock("Security Requirements", la.securityRequirements)}
                      {textBlock("Performance Requirements", la.performanceRequirements)}
                      {textBlock("Other Technical Constraints", la.otherConstraints)}
                    </>
                  )}

                  {/* 5. Financial Information — Finance Officer & Manager */}
                  {(isFinance || isManager) && (
                    <>
                      {sectionHeader("Commercial & Financial", "#34d399")}
                      <div className="grid grid-cols-2 gap-2">
                        {chip("Est. Budget", la.estimatedBudget)}
                        {chip("Currency", la.currency)}
                        {chip("Deal Value", logLead.value)}
                        {chip("Budget Confirmed", la.budgetConfirmation)}
                      </div>
                      {textBlock("Payment Terms", la.paymentTerms)}
                      {textBlock("Additional Financial Info", la.additionalFinancial)}
                    </>
                  )}

                  {textBlock("Additional Requirements", la.additionalRequirements)}
                </div>
              );
            })()}

            {/* Assessment documents — Sales Manager only */}
            {isManager && (() => {
              const companyAssessments = assessments.filter((a) => a.leadName === logLead.name);
              const docEntries: { aType: string; name: string; data: string }[] = [];
              companyAssessments.forEach((a) => {
                (a.documents ?? []).forEach((d) => docEntries.push({ aType: a.type, name: d.name, data: d.data }));
                if (a.document) docEntries.push({ aType: a.type, name: a.document, data: a.documentData ?? "" });
              });
              if (docEntries.length === 0) return null;
              return (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Assessment Documents</p>
                  {docEntries.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                      <span className="text-xs shrink-0 font-medium" style={{ color: d.aType === "Technical" ? "#60a5fa" : "#a78bfa" }}>{d.aType}</span>
                      <span className="text-xs flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>{d.name}</span>
                      {d.data && <a href={d.data} download={d.name} className="text-xs font-semibold shrink-0 hover:opacity-70" style={{ color: "#60a5fa" }}>Download</a>}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Interaction log */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted-foreground)" }}>Interaction Log</p>
              {(() => {
                const comms = leadCommsMap[logLead.id] ?? [];
                const typeIcon: Record<string, string> = { Call: "📞", Meeting: "🤝", Email: "✉️", "Info Response": "📋" };
                const typeColor: Record<string, string> = { Call: "#F9A800", Meeting: "#1a6fe8", Email: "#a78bfa", "Info Response": "#fc4f37" };
                if (comms.length === 0) {
                  return (
                    <div className="py-10 text-center" style={{ color: "var(--muted-foreground)" }}>
                      <p className="text-sm">No interactions logged yet.</p>
                      <p className="text-xs mt-1">The Sales Rep will log calls, meetings and emails here.</p>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col gap-3">
                    {comms.map((c) => (
                      <div key={c.id} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: typeColor[c.type] + "20" }}>
                          {typeIcon[c.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold" style={{ color: typeColor[c.type] }}>{c.type}</span>
                            <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{c.time}</span>
                          </div>
                          <p className="text-sm leading-snug">{c.summary}</p>
                          {c.document && (
                            <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 1h5.5L13 4.5V15H4V1z" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v4h4" stroke="#7a7a90" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                              <span className="text-xs flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>{c.document}</span>
                              {c.documentData && (
                                <a href={c.documentData} download={c.document} className="text-xs font-semibold shrink-0 hover:opacity-70" style={{ color: "#60a5fa" }}>
                                  Download
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            </div>{/* end scrollable body */}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Executive Dashboard ─────────────────────────────────────────────────────

function ExecutiveDashboard({ leads, deals, assessments }: { leads: typeof LEADS; deals: typeof DEALS; assessments: AssessmentRecord[] }) {
  const [execLead, setExecLead] = useState<typeof LEADS[number] | null>(null);
  const execOverlayRef = useRef<HTMLDivElement>(null);

  const totalPipelineValue = leads.filter((l) => l.status !== "Closed").reduce((sum, l) => {
    const v = parseInt(l.value.replace(/[^0-9]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const dealsWon = deals.length;
  const conversionRate = leads.length > 0 ? Math.round((deals.length / leads.length) * 100) : 0;

  // Assessment / Decision Overview counts
  const awaitingTech = assessments.filter((a) => a.type === "Technical" && a.status !== "Submitted").length;
  const awaitingFin = assessments.filter((a) => a.type === "Financial" && a.status !== "Submitted").length;
  const awaitingDecision = leads.filter((l) => {
    if (l.status === "Closed") return false;
    const la = assessments.filter((a) => a.leadName === l.name);
    const tech = la.find((a) => a.type === "Technical");
    const fin = la.find((a) => a.type === "Financial");
    return tech?.status === "Submitted" && fin?.status === "Submitted";
  }).length;

  // Sales performance
  const totalWonValue = deals.reduce((s, d) => s + parseInt(d.value.replace(/[^0-9]/g, "") || "0"), 0);
  const avgDealValue = deals.length > 0 ? Math.round(totalWonValue / deals.length) : 0;
  const repMap: Record<string, { count: number; total: number }> = {};
  deals.forEach((d) => {
    const rep = (d as any).rep || "Unknown";
    if (!repMap[rep]) repMap[rep] = { count: 0, total: 0 };
    repMap[rep].count++;
    repMap[rep].total += parseInt(d.value.replace(/[^0-9]/g, "") || "0");
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Exec Lead Detail Panel */}
      {execLead && (
        <div
          ref={execOverlayRef}
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === execOverlayRef.current) setExecLead(null); }}
        >
          <div className="w-full max-w-md h-full flex flex-col shadow-2xl" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 className="text-base font-bold tracking-tight">{execLead.name}</h2>
                <LeadStatusChip status={execLead.status} />
              </div>
              <button onClick={() => setExecLead(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {(() => {
                const la = execLead as any;
                const chip = (label: string, value: string | undefined) => value ? (
                  <div key={label} className="px-3 py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                    <p className="text-xs font-semibold">{value}</p>
                  </div>
                ) : null;
                const tb = (label: string, value: string | undefined) => value ? (
                  <div key={label} className="rounded-xl p-4" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                    <p className="text-sm leading-relaxed">{value}</p>
                  </div>
                ) : null;
                const techA = assessments.find((a) => a.leadName === execLead.name && a.type === "Technical");
                const finA = assessments.find((a) => a.leadName === execLead.name && a.type === "Financial");
                return (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {chip("Sales Rep", execLead.rep || "Unassigned")}
                      {chip("Expected Deal Value", execLead.value)}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#60a5fa" }}>Organisation</p>
                    <div className="grid grid-cols-2 gap-2">
                      {chip("Company", execLead.name)}
                      {chip("Industry", la.industry)}
                      {chip("Company Size", la.companySize)}
                      {chip("Website", la.website)}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Requirements</p>
                    {tb("Business Need", la.businessNeed)}
                    {tb("Expected Solution", la.expectedSolution)}
                    {tb("Detailed Requirements", la.detailedRequirements)}
                    {chip("Expected Timeline", la.projectTimeline)}
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>Commercial</p>
                    <div className="grid grid-cols-2 gap-2">
                      {chip("Estimated Budget", la.estimatedBudget)}
                      {chip("Currency", la.currency)}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a6fe8" }}>Technical Assessment</p>
                    {chip("Tech Status", techA?.status ?? "Not Started")}
                    {techA?.notes && tb("Tech Notes", techA.notes)}
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Financial Assessment</p>
                    {chip("Fin Status", finA?.status ?? "Not Started")}
                    {finA?.notes && tb("Fin Notes", finA.notes)}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Dashboard</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Business performance at a glance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pipeline Value", value: `$${totalPipelineValue.toLocaleString()}`, sub: "active leads", accent: "#f59e0b" },
          { label: "Deals Won", value: String(dealsWon), sub: "converted deals", accent: "#F9A800" },
          { label: "Lead Conversion Rate", value: `${conversionRate}%`, sub: "leads → deals", accent: "#a78bfa" },
          { label: "Active Leads", value: String(leads.filter((l) => l.status !== "Closed").length), sub: "in pipeline", accent: "#60a5fa" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: k.accent }}>{k.label}</p>
            <p className="text-3xl font-bold tracking-tight">{k.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Assessment / Decision Overview */}
      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-bold mb-4">Assessment / Decision Overview</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Awaiting Technical Assessment", count: awaitingTech, color: "#1a6fe8" },
            { label: "Awaiting Financial Assessment", count: awaitingFin, color: "#a78bfa" },
            { label: "Awaiting Sales Manager Decision", count: awaitingDecision, color: "#f59e0b" },
            { label: "In Negotiation", count: 0, color: "#34d399" },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3 rounded-xl flex flex-col gap-1" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-medium leading-snug" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active leads — clickable */}
      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-bold mb-4">Active Leads</p>
        <div className="flex flex-col gap-2">
          {leads.filter((l) => l.status !== "Closed").map((l) => (
            <button
              key={l.id}
              onClick={() => setExecLead(l)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors hover:bg-[#ffffff08] w-full"
              style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <LeadStatusChip status={l.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{l.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{(l as any).industry} · Rep: {l.rep || "Unassigned"}</p>
              </div>
              <span className="font-mono text-sm font-bold shrink-0" style={{ color: "#f59e0b" }}>{l.value}</span>
            </button>
          ))}
          {leads.filter((l) => l.status !== "Closed").length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted-foreground)" }}>No active leads.</p>
          )}
        </div>
      </div>

      {/* Sales Performance */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Sales Performance</p>
          <div className="flex flex-col gap-3">
            {[
              { label: "Deals Won This Month", value: String(deals.length) },
              { label: "Total Won Deal Value", value: `$${totalWonValue.toLocaleString()}` },
              { label: "Average Deal Value", value: `$${avgDealValue.toLocaleString()}` },
              { label: "Lead Conversion Rate", value: `${conversionRate}%` },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                <span className="text-sm font-bold font-mono" style={{ color: "var(--foreground)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Performance by Rep */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Sales Performance by Representative</p>
          <div className="flex flex-col gap-2">
            {Object.entries(repMap).map(([rep, stats]) => (
              <div key={rep} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "#F9A80020", color: "#F9A800" }}>
                  {rep.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rep}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stats.count} deal{stats.count !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-sm font-bold font-mono shrink-0" style={{ color: "#F9A800" }}>${stats.total.toLocaleString()}</span>
              </div>
            ))}
            {Object.keys(repMap).length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "var(--muted-foreground)" }}>No deals yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Lead pipeline by status */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold mb-4">Lead Pipeline Breakdown</p>
          <div className="flex flex-col gap-3">
            {Object.entries((() => { const byStatus: Record<string, number> = {}; leads.forEach((l) => { byStatus[l.status] = (byStatus[l.status] ?? 0) + 1; }); return byStatus; })()).map(([status, count]) => {
              const pct = Math.round((count / leads.length) * 100);
              const statusColors: Record<string, string> = { New: "#60a5fa", Contacted: "#a78bfa", Qualified: "#f59e0b", Assessment: "#1a6fe8", Closed: "#F9A800" };
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{status}</span>
                    <span className="text-xs font-semibold" style={{ color: statusColors[status] ?? "#7a7a90" }}>{count} ({pct}%)</span>
                  </div>
                  <ProgressBar value={pct} color={statusColors[status] ?? "#7a7a90"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Won deals list */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold mb-4">Recent Deals</p>
          <div className="flex flex-col gap-3">
            {deals.slice(0, 6).map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{d.client} · {d.date}</p>
                </div>
                <span className="text-sm font-bold font-mono shrink-0" style={{ color: "#F9A800" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ──────────────────────────────────────────────────────────────

let DEMO_CREDENTIALS: { email: string; password: string; role: Role; name: string }[] = [
  { email: "yaqoob.s@altrium.io",   password: "Sales@123",   role: "Sales Manager",  name: "Yaqoob Sadikeen" },
  { email: "ishara.f@altrium.io",   password: "Rep@123",     role: "Sales Rep",      name: "Ishara Fonseka" },
  { email: "ravidu.p@altrium.io",   password: "Tech@123",    role: "Tech Lead",      name: "Ravidu Pasan" },
  { email: "hashmath.f@altrium.io", password: "Finance@123", role: "Finance Officer", name: "Hashmath Fazli" },
  { email: "natalia.d@altrium.io",  password: "Admin@123",   role: "Admin",          name: "Natalia Dilshani" },
  { email: "inshiraff.t@altrium.io", password: "Exec@123",  role: "Executive",      name: "Inshiraff Thaseem" },
];

function ResetPasswordPage({ token, onDone }: { token: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#fc4f37", "#f59e0b", "#60a5fa", "#22c55e"][strength];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);
    apiResetPassword(token, password)
      .then(() => {
        setDone(true);
        // Remove token from URL without a reload
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch((err: Error) => {
        setError(err.message || "Reset failed. The link may have expired.");
        setLoading(false);
      });
  }

  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };
  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "var(--primary)");
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "var(--border)");

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>

        {/* Logo */}
        <div className="text-center">
          <img src={altriumLogo} alt="Altrium" className="h-6 object-contain mx-auto mb-5" style={{ filter: "invert(1) hue-rotate(180deg)" }} />
          <h2 className="text-2xl font-bold tracking-tight">Set New Password</h2>
          {!done && (
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
              Choose a strong password for your account.
            </p>
          )}
        </div>

        {done ? (
          <div className="flex flex-col gap-5 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl" style={{ background: "#22c55e20", border: "1px solid #22c55e40" }}>
              ✓
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Your password has been updated. You can now log in with your new password.
            </p>
            <button
              onClick={onDone}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>New Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-11"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : "var(--muted)" }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Confirm Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ ...inputStyle, ...(confirm && confirm !== password ? { borderColor: "#fc4f37" } : {}) }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
              {confirm && confirm !== password && (
                <span className="text-xs" style={{ color: "#fc4f37" }}>Passwords do not match</span>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#fc4f3718", color: "#fc4f37", border: "1px solid #fc4f3730" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ForgotPasswordPage({ onBack }: { onBack: () => void }) {
  const [fpEmail, setFpEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    apiForgotPassword(fpEmail)
      .then(() => setSent(true))
      .catch(() => setSent(true)) // always show success to avoid enumeration
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--background)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
          {!sent && (
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
              Enter your email address and we will send you a link to reset your password.
            </p>
          )}
        </div>

        {sent ? (
          <>
            <div
              className="px-4 py-4 rounded-xl text-sm text-center leading-relaxed"
              style={{ background: "#F9A80018", color: "#F9A800", border: "1px solid #F9A80030" }}
            >
              If an account with that email exists, we have sent a password reset link. Please check your inbox.
            </div>
            <button
              onClick={onBack}
              className="text-sm text-center font-medium hover:underline transition-all"
              style={{ color: "var(--secondary)" }}
            >
              Return to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="you@altrium.io"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--secondary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !fpEmail}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--secondary)", color: "#ffffff" }}
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-center font-medium hover:underline transition-all"
              style={{ color: "var(--secondary)" }}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (role: Role, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) return <ForgotPasswordPage onBack={() => setShowForgot(false)} />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    apiLogin(email, password)
      .then(({ token, user }) => {
        setToken(token);
        onLogin(user.role as Role, user.name);
      })
      .catch((err: Error) => {
        // Backend unreachable — fall back to demo credentials so the app
        // stays usable without a running server
        if (err.message === "Failed to fetch" || err.message.includes("fetch")) {
          const match = DEMO_CREDENTIALS.find(
            (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
          );
          if (match) {
            // Check if user has been deactivated
            const liveUser = (window as any).__altriumUsers?.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
            const isInactive = (liveUser && liveUser.status === "Inactive") || (match as any).status === "Inactive";
            if (isInactive) {
              setError("Your account has been deactivated. Please contact your administrator.");
              setLoading(false);
              return;
            }
            onLogin(match.role, match.name);
            return;
          }
          setError("Invalid email or password.");
        } else {
          setError(err.message || "Invalid email or password.");
        }
        setLoading(false);
      });
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        <div>
          <div className="mb-16">
            <img src={altriumLogo} alt="Altrium" className="h-8 object-contain" style={{ display: "block", filter: "invert(1) hue-rotate(180deg)" }} />
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
            Your leads.<br />
            Your team.<br />
            <span style={{ color: "var(--primary)" }}>One place.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Manage leads, track deals through technical and financial assessments, coordinate project delivery, and monitor your pipeline — all from a single platform built for the way your team actually works.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-col gap-4">
          {[
            { icon: "◎", label: "Lead & Deal Pipeline", desc: "From first contact to signed deal" },
            { icon: "◉", label: "Technical & Financial Assessments", desc: "Structured review workflows" },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-base mt-0.5" style={{ color: "var(--primary)" }}>{f.icon}</span>
              <div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          © 2026 Altrium. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <img src={altriumLogo} alt="Altrium" className="h-7 object-contain" style={{ display: "block", filter: "invert(1) hue-rotate(180deg)" }} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nexcrm.io"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  Password
                </label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-[#ffffff10]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ background: "#fc4f3718", color: "#fc4f37", border: "1px solid #fc4f3730" }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] mt-2"
              style={{
                background: loading ? "var(--muted)" : "var(--primary)",
                color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-8">
            <button
              onClick={() => setHintOpen(!hintOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors hover:bg-[#ffffff08]"
              style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            >
              <span>Demo credentials</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: hintOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {hintOpen && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--card)" }}
              >
                <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                    Click a row to auto-fill
                  </p>
                </div>
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => { setEmail(c.email); setPassword(c.password); setError(""); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#ffffff08] transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="text-xs font-medium">{c.name}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{c.email}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: ROLE_COLORS[c.role] + "20", color: ROLE_COLORS[c.role] }}
                    >
                      {c.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Lead Slide-over ──────────────────────────────────────────────────────

type NewLeadData = {
  // Lead info
  leadName: string;
  source: string;
  leadDescription: string;
  // Organisation
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  // Contact
  contactName: string;
  jobTitle: string;
  contactEmail: string;
  contactPhone: string;
  preferredContact: string;
  // Requirements
  initialRequirement: string;
  businessNeed: string;
  expectedSolution: string;
  projectTimeline: string;
  // Commercial
  estimatedBudget: string;
  currency: string;
  dealValue: string;
  // Assignment & extra
  assignedTo: string;
  notes: string;
};

const EMPTY_LEAD: NewLeadData = {
  leadName: "",
  source: "",
  leadDescription: "",
  companyName: "",
  industry: "",
  companySize: "",
  website: "",
  contactName: "",
  jobTitle: "",
  contactEmail: "",
  contactPhone: "",
  preferredContact: "",
  initialRequirement: "",
  businessNeed: "",
  expectedSolution: "",
  projectTimeline: "",
  estimatedBudget: "",
  currency: "USD",
  dealValue: "",
  assignedTo: "",
  notes: "",
};

function NewLeadPanel({
  open,
  onClose,
  onSave,
  existingLeads = [],
}: {
  open: boolean;
  onClose: () => void;
  onSave: (lead: NewLeadData) => void;
  existingLeads?: { name: string; contact: string; email: string; phone: string; website?: string; leadName?: string; status: string; rep?: string }[];
}) {
  const [form, setForm] = useState<NewLeadData>(EMPTY_LEAD);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxStep, setMaxStep] = useState<1 | 2 | 3 | 4>(1);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<typeof existingLeads>([]);
  const [showDupeWarning, setShowDupeWarning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setForm(EMPTY_LEAD); setStep(1); setMaxStep(1); setSaved(false); setFieldErrors({}); setDuplicates([]); setShowDupeWarning(false); }
  }, [open]);

  function set(field: keyof NewLeadData, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    // Clear field error on change
    if (fieldErrors[field]) setFieldErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const webRe = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
    if (!emailRe.test(form.contactEmail)) errs.contactEmail = "Please enter a valid email address (e.g. name@company.com)";
    if (form.website && !webRe.test(form.website)) errs.website = "Please enter a valid website URL (e.g. https://company.com)";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function checkDuplicates(): typeof existingLeads {
    const normName = form.companyName.trim().toLowerCase();
    const normEmail = form.contactEmail.trim().toLowerCase();
    const normPhone = form.contactPhone.trim().replace(/\D/g, "");
    const normWebsite = form.website.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const normLead = form.leadName.trim().toLowerCase();

    return existingLeads.filter((l) => {
      const lName = l.name.toLowerCase();
      const lEmail = l.email.toLowerCase();
      const lPhone = (l.phone ?? "").replace(/\D/g, "");
      const lWebsite = (l.website ?? "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
      const lLead = (l.leadName ?? "").toLowerCase();

      const sameCompany = lName === normName;
      const sameEmail = normEmail && lEmail === normEmail;
      const samePhone = normPhone.length >= 7 && lPhone === normPhone;
      const sameWebsite = normWebsite && lWebsite && lWebsite === normWebsite;
      const sameLead = normLead && lLead && lLead === normLead;

      // Trigger warning: same company + (same email OR same phone), OR same company + same lead name
      return sameCompany && (sameEmail || samePhone || sameWebsite || sameLead);
    });
  }

  function handleNextFromStep2() {
    if (!validateStep2()) return;
    const dupes = checkDuplicates();
    if (dupes.length > 0) { setDuplicates(dupes); setShowDupeWarning(true); return; }
    setStep(3);
    setMaxStep((m) => Math.max(m, 3) as 1 | 2 | 3 | 4);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.assignedTo) {
      setSaveError("Please assign a Sales Rep before saving.");
      return;
    }
    setSaveError("");
    onSave(form);
    setSaved(true);
    setTimeout(onClose, 1200);
  }

  if (!open) return null;

  // Duplicate lead warning overlay
  if (showDupeWarning) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
        <div className="w-full max-w-lg mx-4 rounded-2xl shadow-2xl flex flex-col" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-5 flex items-start gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-base">Possible Duplicate Lead Found</h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {duplicates.length} similar lead{duplicates.length > 1 ? "s" : ""} already exist{duplicates.length === 1 ? "s" : ""} with matching company or contact information. Please review before continuing.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
            {duplicates.map((d, i) => (
              <div key={i} className="px-4 py-3 rounded-xl flex flex-col gap-1" style={{ background: "#f59e0b10", border: "1px solid #f59e0b30" }}>
                <p className="text-sm font-semibold">{d.name}{d.leadName ? ` — ${d.leadName}` : ""}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Contact: {d.contact} · {d.email}</p>
                {d.phone && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Phone: {d.phone}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#f59e0b20", color: "#f59e0b" }}>{d.status}</span>
                  {d.rep && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rep: {d.rep}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => { setShowDupeWarning(false); setStep(3); }} className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Continue Creating New Lead
            </button>
            <button onClick={() => setShowDupeWarning(false)} className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              Go Back &amp; Review
            </button>
            <button onClick={() => { setShowDupeWarning(false); onClose(); }} className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ color: "var(--muted-foreground)" }}>
              Cancel Lead Creation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };
  const labelCls = "text-xs font-semibold uppercase tracking-widest block mb-1.5";
  const labelStyle = { color: "var(--muted-foreground)" };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold tracking-tight">New Lead</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Step {step} of 4 — {["Lead Info", "Organisation & Contact", "Requirements", "Commercial & Assignment"][step - 1]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#ffffff10]"
            style={{ color: "var(--muted-foreground)" }}
          >
            ✕
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex px-6 pt-4 gap-1.5 shrink-0">
          {([1, 2, 3, 4] as const).map((s) => {
            const labels = ["Lead Info", "Organisation", "Requirements", "Commercial"];
            const locked = s > maxStep;
            return (
              <button
                key={s}
                onClick={() => !locked && setStep(s as 1|2|3|4)}
                disabled={locked}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: step === s ? "var(--primary)" : "var(--muted)",
                  color: step === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  opacity: locked ? 0.4 : 1,
                  cursor: locked ? "not-allowed" : "pointer",
                }}
              >
                {labels[s - 1]}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Step 1: Lead Info ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Lead Information</p>
                <div>
                  <label className={labelCls} style={labelStyle}>Lead Name *</label>
                  <input required value={form.leadName} onChange={(e) => set("leadName", e.target.value)} placeholder="e.g. Meridian Holdings CRM Development" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Lead Source *</label>
                  <select required value={form.source} onChange={(e) => set("source", e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                    <option value="">Select…</option>
                    {["Website", "Referral", "Email", "Phone Call", "Social Media", "Trade Show", "Partner", "Cold Outreach", "Other"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Lead Description *</label>
                  <textarea required value={form.leadDescription} onChange={(e) => set("leadDescription", e.target.value)} placeholder="A brief summary of what this opportunity is about…" rows={3} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none" style={{ ...inputStyle, lineHeight: "1.6" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Organisation & Contact ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a6fe8" }}>Organisation</p>
                <div>
                  <label className={labelCls} style={labelStyle}>Company Name *</label>
                  <input required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Meridian Holdings" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={labelStyle}>Industry</label>
                    <select value={form.industry} onChange={(e) => set("industry", e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                      <option value="">Select…</option>
                      {["Technology", "Finance", "Healthcare", "Retail", "Energy", "Manufacturing", "Logistics", "Education", "Cloud Services", "Other"].map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Company Size</label>
                    <input type="text" value={form.companySize} onChange={(e) => set("companySize", e.target.value)} placeholder="e.g. 150 employees" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Website</label>
                  <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://company.com" className={inputCls} style={{ ...inputStyle, borderColor: fieldErrors.website ? "#fc4f37" : "var(--border)" }} onFocus={(e) => (e.currentTarget.style.borderColor = fieldErrors.website ? "#fc4f37" : "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.website ? "#fc4f37" : "var(--border)")} />
                  {fieldErrors.website && <p className="text-xs mt-1" style={{ color: "#fc4f37" }}>{fieldErrors.website}</p>}
                </div>
              </div>
              <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Primary Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={labelStyle}>Full Name *</label>
                    <input required value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="e.g. Hashmath Fazli" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Job Title *</label>
                    <input required value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. CTO" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Email Address *</label>
                  <input required type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="contact@company.com" className={inputCls} style={{ ...inputStyle, borderColor: fieldErrors.contactEmail ? "#fc4f37" : "var(--border)" }} onFocus={(e) => (e.currentTarget.style.borderColor = fieldErrors.contactEmail ? "#fc4f37" : "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.contactEmail ? "#fc4f37" : "var(--border)")} />
                  {fieldErrors.contactEmail && <p className="text-xs mt-1" style={{ color: "#fc4f37" }}>{fieldErrors.contactEmail}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={labelStyle}>Phone Number</label>
                    <input type="tel" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="0771234567" maxLength={10} className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Preferred Contact Method</label>
                    <select value={form.preferredContact} onChange={(e) => set("preferredContact", e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                      <option value="">Select…</option>
                      {["Email", "Phone", "Meeting", "WhatsApp", "Other"].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Requirements ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F9A800" }}>Initial Requirements</p>
                <div>
                  <label className={labelCls} style={labelStyle}>{"Client's Initial Requirement *"}</label>
                  <textarea required value={form.initialRequirement} onChange={(e) => set("initialRequirement", e.target.value)} placeholder="What does the client say they need?" rows={3} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none" style={{ ...inputStyle, lineHeight: "1.6" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Problem / Business Need</label>
                  <textarea value={form.businessNeed} onChange={(e) => set("businessNeed", e.target.value)} placeholder="What problem is the client trying to solve?" rows={2} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none" style={{ ...inputStyle, lineHeight: "1.6" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Expected Solution / Service</label>
                  <textarea value={form.expectedSolution} onChange={(e) => set("expectedSolution", e.target.value)} placeholder="What product or service is the client interested in?" rows={2} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none" style={{ ...inputStyle, lineHeight: "1.6" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Expected Project Timeline</label>
                  <input value={form.projectTimeline} onChange={(e) => set("projectTimeline", e.target.value)} placeholder="e.g. Q1 2026, 6 months from now…" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Commercial & Assignment ── */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              {saveError && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#fc4f3718", color: "#fc4f37", border: "1px solid #fc4f3730" }}>
                  {saveError}
                </div>
              )}
              <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Commercial Information</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls} style={labelStyle}>Estimated Budget</label>
                    <input type="number" min="0" value={form.estimatedBudget} onChange={(e) => set("estimatedBudget", e.target.value)} placeholder="e.g. 100000" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Currency</label>
                    <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                      {["USD", "LKR", "EUR", "GBP", "AED", "INR", "SGD"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Expected Deal Value</label>
                  <input type="number" min="0" value={form.dealValue} onChange={(e) => set("dealValue", e.target.value)} placeholder="e.g. 125000" className={inputCls} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
              </div>
              <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>Assignment & Notes</p>
                <div>
                  <label className={labelCls} style={labelStyle}>Assign to Sales Rep</label>
                  <select value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                    <option value="">— Select a Sales Rep —</option>
                    {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Additional Notes</label>
                  <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any extra context — key stakeholders, special requirements…" rows={3} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none" style={{ ...inputStyle, lineHeight: "1.6" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
              </div>
              {(form.companyName || form.dealValue) && (
                <div className="p-4 rounded-xl" style={{ background: "#F9A80010", border: "1px solid #F9A80030" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>Preview</p>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{form.companyName || "—"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{form.contactName || "No contact"}{form.jobTitle ? ` · ${form.jobTitle}` : ""}</p>
                    </div>
                    {form.dealValue && <span className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>{form.currency} {parseInt(form.dealValue).toLocaleString()}</span>}
                  </div>
                  <div className="mt-2.5">
                    <LeadStatusChip status="New" />
                  </div>
                </div>
              )}
            </div>
          )}

        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          {step === 1 ? (
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
          ) : (
            <button type="button" onClick={() => setStep((step - 1) as 1|2|3|4)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>← Back</button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => { if (step === 2) { handleNextFromStep2(); } else { const next = (step + 1) as 1|2|3|4; setStep(next); setMaxStep((m) => Math.max(m, next) as 1|2|3|4); } }}
              disabled={
                (step === 1 && (!form.leadName.trim() || !form.source || !form.leadDescription.trim())) ||
                (step === 2 && (!form.companyName.trim() || !form.contactName.trim() || !form.jobTitle.trim() || !form.contactEmail.trim()))
              }
              className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saved || !form.initialRequirement.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              style={{ background: saved ? "#F9A80030" : "var(--primary)", color: saved ? "var(--primary)" : "var(--primary-foreground)" }}
            >
              {saved ? "✓ Lead Created" : "Create Lead"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Convert Lead → Deal Panel ───────────────────────────────────────────────

function ConvertLeadPanel({
  lead,
  onClose,
  onConfirm,
}: {
  lead: typeof LEADS[number] | null;
  onClose: () => void;
  onConfirm: (deal: typeof DEALS[number]) => void;
}) {
  const [dealName, setDealName] = useState("");
  const [certName, setCertName] = useState("");
  const [certData, setCertData] = useState("");
  const [saved, setSaved] = useState(false);
  const [dealCurrency, setDealCurrency] = useState("USD");
  const [dealAmount, setDealAmount] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lead) {
      setDealName(`${lead.name} — Deal`);
      setCertName("");
      setCertData("");
      setSaved(false);
      // Parse existing value e.g. "$124,000" or "LKR 500,000"
      const raw = lead.value ?? "";
      const currencySymbols: Record<string, string> = { "$": "USD", "€": "EUR", "£": "GBP" };
      const symMatch = raw.match(/^([$€£])/);
      if (symMatch) {
        setDealCurrency(currencySymbols[symMatch[1]] ?? "USD");
        setDealAmount(raw.replace(/[$€£,]/g, "").trim());
      } else {
        const codeMatch = raw.match(/^([A-Z]{2,3})\s*/);
        setDealCurrency(codeMatch ? codeMatch[1] : "USD");
        setDealAmount(raw.replace(/^[A-Z]{2,3}\s*/, "").replace(/,/g, "").trim());
      }
    }
  }, [lead]);

  if (!lead) return null;

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const symMap: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
    const prefix = symMap[dealCurrency] ?? dealCurrency + " ";
    const formattedValue = (symMap[dealCurrency] ? prefix : prefix) +
      (parseFloat(dealAmount.replace(/,/g, "")) || 0).toLocaleString();
    if (!certName) return;
    onConfirm({
      id: Date.now(),
      name: dealName,
      client: lead.name,
      value: formattedValue,
      rep: lead.rep || "—",
      date: today,
      certificate: certName,
      certificateData: certData,
    } as any);
    setSaved(true);
    setTimeout(onClose, 1100);
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="w-full max-w-md h-full flex flex-col shadow-2xl"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Convert to Deal</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Creates a deal record from <strong>{lead.name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Lead summary */}
          <div className="p-4 rounded-xl" style={{ background: "#1a6fe812", border: "1px solid #1a6fe830" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#60a5fa" }}>From Lead</p>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{lead.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Contact: {lead.contact}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rep: {lead.rep || "Unassigned"}</p>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>{lead.value}</span>
            </div>
          </div>

          {/* Deal details */}
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Deal Details</p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Deal Name *</label>
              <input required value={dealName} onChange={(e) => setDealName(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Confirmed Value *
                <span className="ml-2 normal-case font-normal tracking-normal" style={{ color: "var(--muted-foreground)" }}>
                  — pre-filled from lead, adjust if negotiated
                </span>
              </label>
              <div className="flex gap-2">
                <select
                  value={dealCurrency}
                  onChange={(e) => setDealCurrency(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none shrink-0"
                  style={{ ...inputStyle, width: "96px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {["USD", "LKR", "EUR", "GBP", "AED", "INR", "SGD"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className={`${inputCls} flex-1`}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              {lead.value && dealAmount && dealAmount !== lead.value.replace(/[$€£,A-Z\s]/g, "") && (
                <p className="text-xs mt-1.5" style={{ color: "#f59e0b" }}>
                  Changed from original lead value: {lead.value}
                </p>
              )}
            </div>
          </div>

          {/* Certificate upload (required) */}
          <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "var(--background)", border: `1px solid ${certName ? "#22c55e40" : "var(--border)"}` }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Deal Certificate *</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#ef444420", color: "#ef4444" }}>Required</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              A signed deal certificate is required to convert this lead into a deal.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setCertName(f.name);
                const reader = new FileReader();
                reader.onload = (ev) => setCertData(ev.target?.result as string ?? "");
                reader.readAsDataURL(f);
              }}
            />
            {certName ? (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid #1a6fe840" }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#60a5fa", flexShrink: 0 }}>
                    <path d="M2 1.5h6.5L12 5v7.5H2V1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M8 1.5V5h4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs truncate font-medium" style={{ color: "#60a5fa" }}>{certName}</span>
                </div>
                <button type="button" onClick={() => { setCertName(""); setCertData(""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="text-xs shrink-0 ml-2" style={{ color: "var(--muted-foreground)" }}>✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-colors hover:border-[#1a6fe860]"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span className="text-sm font-medium">Click to upload</span>
                <span className="text-xs">PDF, DOC, PNG, JPG</span>
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={saved || !dealName || !dealAmount || !certName}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: saved ? "#F9A80030" : "var(--primary)", color: saved ? "var(--primary)" : "var(--primary-foreground)" }}>
            {saved ? "✓ Deal Created" : "Convert to Deal →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Profile Modal ───────────────────────────────────────────────────────

function UserProfileModal({ user, onClose, leads = [], deals = [], assessments = [] }: {
  user: UserRecord;
  onClose: () => void;
  leads?: typeof LEADS;
  deals?: typeof DEALS;
  assessments?: AssessmentRecord[];
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const roleColor = ROLE_COLORS[user.role as Role] ?? "#7a7a90";
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  // Role-specific stats
  const myLeads = leads.filter((l) => l.rep === user.name);
  const myDeals = deals.filter((d) => d.rep === user.name);
  const myAssessments = assessments.filter((a) => a.assessor === user.name);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md h-full flex flex-col shadow-2xl" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
              style={{ background: roleColor + "25", color: roleColor }}>
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">{user.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: roleColor + "20", color: roleColor }}>{user.role}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {/* Status & last login */}
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 rounded-xl flex flex-col gap-1" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Status</p>
              <p className="text-sm font-semibold" style={{ color: user.status === "Active" ? "#F9A800" : "#7a7a90" }}>● {user.status}</p>
            </div>
            <div className="px-4 py-3 rounded-xl flex flex-col gap-1" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Last Login</p>
              <p className="text-sm font-mono font-semibold">{user.lastLogin}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Contact</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs w-14 shrink-0" style={{ color: "var(--muted-foreground)" }}>Email</span>
                <span className="text-sm font-mono truncate">{user.email}</span>
              </div>
            </div>
            {/* Change Password */}
            {!changePwOpen ? (
              <button
                onClick={() => { setChangePwOpen(true); setPwError(""); setPwSuccess(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}
                className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                Change Password
              </button>
            ) : (
              <div className="flex flex-col gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Change Password</p>
                {pwSuccess ? (
                  <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>Password updated successfully.</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Current Password</label>
                      <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>New Password</label>
                      <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Confirm New Password</label>
                      <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    {pwError && <p className="text-xs" style={{ color: "#fc4f37" }}>{pwError}</p>}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setChangePwOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
                      <button
                        onClick={() => {
                          if (!newPw || !confirmPw) { setPwError("Please fill in all fields."); return; }
                          if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
                          setPwError("");
                          setPwSuccess(true);
                          setTimeout(() => { setChangePwOpen(false); setPwSuccess(false); }, 1800);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                      >
                        Update Password
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Role-specific activity */}
          {(user.role === "Sales Rep") && (
            <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>Lead Activity</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Total Leads", value: myLeads.length },
                  { label: "Active", value: myLeads.filter((l) => l.status !== "Closed").length },
                  { label: "Closed", value: myLeads.filter((l) => l.status === "Closed").length },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-2.5 rounded-lg text-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {myLeads.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {myLeads.slice(0, 4).map((l) => (
                    <div key={l.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--muted)" }}>
                      <LeadStatusChip status={l.status} />
                      <span className="text-xs flex-1 truncate font-medium">{l.name}</span>
                      <span className="text-xs font-mono shrink-0" style={{ color: "var(--muted-foreground)" }}>{l.value}</span>
                    </div>
                  ))}
                  {myLeads.length > 4 && <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>+{myLeads.length - 4} more leads</p>}
                </div>
              )}
            </div>
          )}

          {(user.role === "Tech Lead" || user.role === "Finance Officer") && (
            <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a6fe8" }}>Assessment Activity</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Total", value: myAssessments.length },
                  { label: "Pending", value: myAssessments.filter((a) => a.status === "Pending" || a.status === "In Review").length },
                  { label: "Submitted", value: myAssessments.filter((a) => a.status === "Submitted").length },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-2.5 rounded-lg text-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.role === "Sales Manager" && (
            <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F9A800" }}>Pipeline Overview</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Active Leads", value: leads.filter((l) => l.status !== "Closed").length },
                  { label: "Won Deals", value: myDeals.length },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-2.5 rounded-lg text-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // ── all hooks unconditionally, in stable order ─────────────────────────────
  const [authed, setAuthed] = useState(() => !!getToken());
  const [bellOpen, setBellOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<{ time: string; event: string; type: string }[]>([
    { time: "2h ago",    event: "Lead qualified — Orbit Retail Ltd",             type: "lead" },
    { time: "4h ago",    event: "Deal moved to Negotiation — NexGen Pharma",     type: "deal" },
    { time: "Yesterday", event: "Technical assessment submitted — Meridian ERP", type: "assess" },
    { time: "Yesterday", event: "New user onboarded — Senula Silva",             type: "user" },
    { time: "Aug 17",    event: "Project created — CloudBridge Migration",       type: "project" },
    { time: "Aug 16",    event: "Deal closed won — Apex DevOps Pipeline",        type: "deal" },
  ]);
  const [userName, setUserName] = useState("Yaqoob Sadikeen");
  const [role, setRole] = useState<Role>("Sales Manager");
  const [view, setView] = useState<View>("dashboard");
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<typeof LEADS[number] | null>(null);
  const [leads, setLeads] = useState(LEADS);
  const [deals, setDeals] = useState(DEALS);
  const [users, setUsers] = useState(USERS);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(ASSESSMENTS);
  const [profileUser, setProfileUser] = useState<UserRecord | null>(null);

  // Load all data from API after authentication
  const loadData = useCallback(() => {
    Promise.all([
      apiGetLeads().then((rows) => setLeads(rows.map(dbRowToLead))).catch(() => {}),
      apiGetDeals().then((rows) => setDeals(rows.map(dbRowToDeal))).catch(() => {}),
      apiGetAssessments().then((rows) => setAssessments(rows.map(dbRowToAssessment))).catch(() => {}),
      apiGetUsers().then((rows) => setUsers(rows.map(dbRowToUser))).catch(() => {}),
      apiGetActivity().then((rows) => setActivityLog(rows.map((r: any) => ({ time: r.time, event: r.event, type: r.type })))).catch(() => {}),
    ]);
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);
  // Expose users for offline login check
  useEffect(() => { (window as any).__altriumUsers = users; }, [users]);

  // ── DB row → app shape adapters ─────────────────────────────────────────────
  function dbRowToLead(r: any) {
    return {
      id: r.id, name: r.name, contact: r.contact, email: r.email ?? "", phone: r.phone ?? "—",
      industry: r.industry ?? "—", source: r.source ?? "—", value: r.value ?? "—",
      status: r.status, assigned: r.assigned ?? "—", rep: r.rep ?? "", date: r.date ?? "—",
      leadName: r.lead_name, leadDescription: r.lead_description, jobTitle: r.job_title,
      preferredContact: r.preferred_contact, companySize: r.company_size, website: r.website,
      initialRequirement: r.initial_requirement, businessNeed: r.business_need,
      expectedSolution: r.expected_solution, projectTimeline: r.project_timeline,
      estimatedBudget: r.estimated_budget, currency: r.currency ?? "USD",
    };
  }
  function dbRowToDeal(r: any) {
    return { id: r.id, name: r.name, client: r.client, value: r.value, rep: r.rep, date: r.date, certificate: r.certificate };
  }
  function dbRowToAssessment(r: any): AssessmentRecord {
    return {
      id: r.id, leadName: r.lead_name, type: r.type, status: r.status,
      infoRequest: r.info_request ?? undefined, risk: r.risk, assessor: r.assessor,
      date: r.date, notes: r.notes, document: r.document ?? undefined, documentData: r.document_data ?? undefined,
      documents: r.documents ?? undefined,
    };
  }
  function dbRowToUser(r: any) {
    return { id: r.id, name: r.name, email: r.email, role: r.role, status: r.status, lastLogin: r.last_login, password: "" };
  }

  // const (not function declaration) so closure is never ambiguous
  const logActivity = (event: string, type: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setActivityLog((prev) => [{ time, event, type }, ...prev]);
    apiLogActivity(event, type).catch(() => {});
  };

  if (!authed) {
    const resetToken = new URLSearchParams(window.location.search).get("token");
    if (resetToken) {
      return (
        <ResetPasswordPage
          token={resetToken}
          onDone={() => window.history.replaceState({}, document.title, window.location.pathname)}
        />
      );
    }
    return (
      <LoginPage
        onLogin={(r, name) => {
          setRole(r);
          setUserName(name);
          setAuthed(true);
        }}
      />
    );
  }

  function handleNewLead(data: NewLeadData) {
    const symMap: Record<string, string> = { USD: "$", LKR: "LKR ", EUR: "€", GBP: "£", AED: "AED ", INR: "₹", SGD: "S$" };
    const fmtVal = (v: string) => v ? `${symMap[data.currency] ?? data.currency + " "}${parseInt(v).toLocaleString()}` : "—";
    const newLead = {
      id: Date.now(),
      name: data.companyName,
      contact: data.contactName,
      email: data.contactEmail || (data.contactName.toLowerCase().replace(/\s+/g, ".") + "@" + data.companyName.toLowerCase().replace(/\s+/g, "") + ".com"),
      phone: data.contactPhone || "—",
      industry: data.industry || "—",
      source: data.source || "Inbound",
      value: fmtVal(data.dealValue),
      status: "New",
      assigned: userName,
      rep: data.assignedTo || "",
      date: "Today",
      leadName: data.leadName,
      leadDescription: data.leadDescription,
      jobTitle: data.jobTitle,
      preferredContact: data.preferredContact,
      companySize: data.companySize,
      website: data.website,
      initialRequirement: data.initialRequirement,
      businessNeed: data.businessNeed,
      expectedSolution: data.expectedSolution,
      projectTimeline: data.projectTimeline,
      estimatedBudget: fmtVal(data.estimatedBudget),
      currency: data.currency,
    };
    setLeads((prev) => [newLead, ...prev]);
    logActivity(`New lead created — ${data.companyName}`, "lead");
    apiCreateLead({
      name: data.companyName, contact: data.contactName,
      email: newLead.email, phone: newLead.phone,
      industry: newLead.industry, source: newLead.source, value: newLead.value,
      status: "New", assigned: userName,
      lead_name: data.leadName, lead_description: data.leadDescription,
      job_title: data.jobTitle, preferred_contact: data.preferredContact,
      company_size: data.companySize, website: data.website,
      initial_requirement: data.initialRequirement, business_need: data.businessNeed,
      expected_solution: data.expectedSolution, project_timeline: data.projectTimeline,
      estimated_budget: newLead.estimatedBudget, currency: data.currency,
    }).then(() => apiGetLeads().then((rows) => setLeads(rows.map(dbRowToLead)))).catch(() => {});
  }

  function handleAssignRep(leadId: number, rep: string) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, rep } : l));
    apiUpdateLead(leadId, { assigned: rep }).catch(() => {});
  }

  function handleDeleteLead(id: number) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    apiDeleteLead(id).catch(() => {});
  }

  function handleConvertLead(deal: typeof DEALS[number]) {
    setDeals((prev) => [deal, ...prev]);
    setLeads((prev) => prev.map((l) => l.name === deal.client ? { ...l, status: "Closed" } : l));
    apiCreateDeal({ name: deal.name, client: deal.client, value: deal.value, rep: deal.rep, certificate: (deal as any).certificate }).catch(() => {});
    apiUpdateLead(leads.find((l) => l.name === deal.client)?.id ?? 0, { status: "Closed" }).catch(() => {});
    setConvertingLead(null);
    logActivity(`Lead converted to deal — ${deal.name}`, "deal");
  }

  function handleAddUser(u: Omit<typeof USERS[number], "id" | "lastLogin">) {
    const optimistic = { ...u, id: Date.now(), lastLogin: "Just now" };
    setUsers((prev) => [...prev, optimistic]);
    // Allow offline login for newly added users
    DEMO_CREDENTIALS.push({ email: u.email, password: u.password, role: u.role as Role, name: u.name });
    logActivity(`New user added — ${u.name} (${u.role})`, "user");
    apiCreateUser({ name: u.name, email: u.email, password: u.password, role: u.role })
      .then(() => apiGetUsers().then((rows) => setUsers(rows.map(dbRowToUser))))
      .catch(() => {});
  }

  function handleRemoveUser(id: number) {
    setUsers((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target) logActivity(`User removed — ${target.name}`, "user");
      return prev.filter((u) => u.id !== id);
    });
    apiDeleteUser(id).catch(() => {});
  }

  function handleToggleUserStatus(id: number) {
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id !== id) return u;
        const newStatus = u.status === "Active" ? "Inactive" : "Active";
        logActivity(`User ${newStatus === "Active" ? "activated" : "deactivated"} — ${u.name}`, "user");
        // Keep DEMO_CREDENTIALS status in sync for offline fallback
        const cred = DEMO_CREDENTIALS.find((c) => c.email.toLowerCase() === u.email.toLowerCase());
        if (cred) (cred as any).status = newStatus;
        return { ...u, status: newStatus };
      });
      (window as any).__altriumUsers = updated;
      return updated;
    });
  }

  function handleUpdateUser(id: number, data: { name: string; email: string; role: string; status: string }) {
    setUsers((prev) => {
      const updated = prev.map((u) => u.id === id ? { ...u, ...data } : u);
      (window as any).__altriumUsers = updated;
      return updated;
    });
    logActivity(`User updated — ${data.name}`, "user");
    apiUpdateUser(id, data).catch(() => {});
  }

  function handleChangePassword(id: number, newPassword: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, password: newPassword } : u));
    // Update DEMO_CREDENTIALS for offline fallback
    const user = users.find((u) => u.id === id);
    if (user) {
      const cred = DEMO_CREDENTIALS.find((c) => c.email.toLowerCase() === user.email.toLowerCase());
      if (cred) cred.password = newPassword;
    }
    apiUpdateUser(id, { password: newPassword }).catch(() => {});
    logActivity(`Password changed — ${users.find((u) => u.id === id)?.name ?? "user"}`, "user");
  }


  function handleContactLead(leadId: number) {
    setLeads((prev) => prev.map((l) => l.id === leadId && l.status === "New" ? { ...l, status: "Contacted" } : l));
    apiUpdateLead(leadId, { status: "Contacted" }).catch(() => {});
  }

  function handleQualifyLead(leadId: number) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: "Qualified" } : l));
    logActivity(`Lead qualified — ${lead.name}`, "lead");
    apiUpdateLead(leadId, { status: "Qualified" }).catch(() => {});
  }

  function handleSubmitForAssessment(leadId: number) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status !== "Qualified") return;
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: "Assessment" } : l));
    setAssessments((prev) => [
      ...prev,
      { id: Date.now(), leadName: lead.name, type: "Technical", status: "Pending", risk: "Low", assessor: "Ravidu Pasan", date: "—", notes: "" },
      { id: Date.now() + 1, leadName: lead.name, type: "Financial", status: "Pending", risk: "Low", assessor: "Hashmath Fazli", date: "—", notes: "" },
    ]);
    logActivity(`Lead submitted for assessment — ${lead.name}`, "assess");
    apiUpdateLead(leadId, { status: "Assessment" })
      .then(() => Promise.all([
        apiCreateAssessment({ lead_name: lead.name, type: "Technical", status: "Pending", risk: "Low", assessor: "Ravidu Pasan", date: "—", notes: "" }),
        apiCreateAssessment({ lead_name: lead.name, type: "Financial", status: "Pending", risk: "Low", assessor: "Hashmath Fazli", date: "—", notes: "" }),
      ]))
      .then(() => apiGetAssessments().then((rows) => setAssessments(rows.map(dbRowToAssessment))))
      .catch(() => {});
  }

  function handleSubmitAssessment(id: number, notes: string, risk: "Low" | "Medium" | "High", docs: { name: string; data: string }[], structuredData?: Record<string, string>) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setAssessments((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const extra = structuredData ? (a.type === "Technical" ? { techData: structuredData } : { finData: structuredData }) : {};
      return { ...a, status: "Submitted", notes, risk, date: dateStr, documents: docs, ...extra };
    }));
    const assessment = assessments.find((a) => a.id === id);
    logActivity(`${assessment?.type} assessment submitted — ${assessment?.leadName}`, "assess");
    apiSubmitAssessment(id, { notes, risk, document: docs[0]?.name, document_data: docs[0]?.data }).catch(() => {});
  }

  function handleSetInReview(id: number) {
    setAssessments((prev) => prev.map((a) => a.id === id && a.status === "Pending" ? { ...a, status: "In Review" } : a));
    apiReviewAssessment(id).catch(() => {});
  }

  function handleInfoResponse(leadName: string) {
    setAssessments((prev) => prev.map((a) =>
      a.leadName === leadName && a.status === "Info Required"
        ? { ...a, status: "In Review", infoRequest: undefined }
        : a
    ));
    logActivity(`Additional info provided — ${leadName}`, "assess");
    apiInfoResponse(leadName).catch(() => {});
  }

  function handleRequestInfo(id: number, request: string) {
    const assessment = assessments.find((a) => a.id === id);
    setAssessments((prev) => prev.map((a) => a.id === id ? { ...a, status: "Info Required", infoRequest: request } : a));
    logActivity(`Additional info requested — ${assessment?.leadName} (${assessment?.type})`, "assess");
    apiRequestInfo(id, request).catch(() => {});
  }

  function handleRejectLead(leadId: number) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: "Closed" } : l));
    logActivity(`Lead rejected — ${lead.name}`, "lead");
    apiUpdateLead(leadId, { status: "Closed" }).catch(() => {});
  }

  function handleUpdateLeadStatus(leadId: number, status: string) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
    logActivity(`Lead status updated to ${status}`, "lead");
    apiUpdateLead(leadId, { status }).catch(() => {});
  }

  function handleUpdateLeadDetails(leadId: number, data: Record<string, string>) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, ...data } : l));
    logActivity("Lead details updated", "lead");
    apiUpdateLead(leadId, data).catch(() => {});
  }

  const nav = ROLE_NAV[role];

  // Reset to dashboard if current view isn't in nav
  const validViews = nav.map((n) => n.view);
  const activeView = validViews.includes(view) ? view : "dashboard";

  return (
    <>
    <NewLeadPanel open={newLeadOpen} onClose={() => setNewLeadOpen(false)} onSave={handleNewLead} existingLeads={leads.map((l) => ({ name: l.name, contact: l.contact, email: l.email, phone: l.phone, website: l.website, leadName: l.leadName, status: l.status, rep: l.rep }))} />
    <NewUserPanel open={newUserOpen} onClose={() => setNewUserOpen(false)} onSave={handleAddUser} />
    <ConvertLeadPanel lead={convertingLead} onClose={() => setConvertingLead(null)} onConfirm={handleConvertLead} />
    {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} leads={leads} deals={deals} assessments={assessments} />}
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col h-full"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <img src={altriumLogo} alt="Altrium" className="h-6 object-contain" style={{ display: "block", filter: "invert(1) hue-rotate(180deg)" }} />
          <div style={{ display: "none" }}> {/* keep old closing structure */}
          </div>
        </div>

        {/* Signed-in user chip */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-opacity hover:opacity-80 text-left"
            style={{ background: "var(--muted)" }}
            onClick={() => { const me = users.find((u) => u.name === userName); if (me) setProfileUser(me); }}
            title="View my profile"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: ROLE_COLORS[role] + "30", color: ROLE_COLORS[role] }}
            >
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{userName}</p>
              <p className="text-xs truncate font-medium" style={{ color: ROLE_COLORS[role] }}>{role}</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.view === activeView;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                style={{
                  background: active ? ROLE_COLORS[role] + "18" : "transparent",
                  color: active ? ROLE_COLORS[role] : "var(--muted-foreground)",
                  border: active ? `1px solid ${ROLE_COLORS[role]}28` : "1px solid transparent",
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="px-3 pb-2">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
              {DEMO_CREDENTIALS.find((c) => c.name === userName)?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group"
            style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#fc4f3718";
              (e.currentTarget as HTMLButtonElement).style.color = "#fc4f37";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#fc4f3730";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13H6M10 10.5l3.5-3-3.5-3M13.5 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{
            background: "var(--background)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span>{role}</span>
            <span>/</span>
            <span style={{ color: "var(--foreground)" }} className="font-medium capitalize">{activeView}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell with activity dropdown */}
            <div className="relative">
              <button
                onClick={() => setBellOpen((v) => !v)}
                className="relative p-2 rounded-lg transition-colors hover:bg-[#ffffff08]"
                style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5A4.5 4.5 0 003.5 6v2.5L2 10.5h12l-1.5-2V6A4.5 4.5 0 008 1.5zM6 12a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {(role === "Admin" ? activityLog.filter((a) => a.type === "user") : activityLog).length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                )}
              </button>
              {bellOpen && (() => {
                const bellLog = role === "Admin" ? activityLog.filter((a) => a.type === "user") : activityLog;
                return (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span className="text-sm font-semibold">{role === "Admin" ? "User Activity" : "Recent Activity"}</span>
                      <button onClick={() => setBellOpen(false)} style={{ color: "var(--muted-foreground)" }} className="text-xs hover:opacity-70">✕</button>
                    </div>
                    <div className="flex flex-col max-h-80 overflow-y-auto">
                      {bellLog.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>No activity yet</p>
                      ) : (
                        bellLog.map((a, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-start px-4 py-3"
                            style={{ borderBottom: i < bellLog.length - 1 ? "1px solid var(--border)" : "none" }}
                          >
                            <span
                              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                              style={{ background: ({ lead: "#F9A800", deal: "#1a6fe8", project: "#fc4f37", assess: "#a78bfa", user: "#f59e0b" } as Record<string,string>)[a.type] ?? "#7a7a90" }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-snug">{a.event}</p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: ROLE_COLORS[role] + "25", color: ROLE_COLORS[role] }}
            >
              {ROLE_INITIALS[role]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-8 py-8 max-w-6xl">
          {activeView === "dashboard" && role === "Executive" && <ExecutiveDashboard leads={leads} deals={deals} assessments={assessments} />}
          {activeView === "dashboard" && role !== "Executive" && <DashboardView role={role} userName={userName} activityLog={activityLog} users={users} leads={leads} deals={deals} assessments={assessments} />}
          {activeView === "leads" && (
            <LeadsView
              leads={leads}
              onNewLead={() => setNewLeadOpen(true)}
              onAssignRep={handleAssignRep}
              onDeleteLead={handleDeleteLead}
              onConvertLead={role === "Sales Manager" ? (l) => setConvertingLead(l) : undefined}
              onRejectLead={role === "Sales Manager" ? handleRejectLead : undefined}
              isSalesRep={role === "Sales Rep"}
              isSalesManager={role === "Sales Manager"}
              repName={userName}
              onQualifyLead={role === "Sales Rep" ? handleQualifyLead : undefined}
              onSubmitForAssessment={role === "Sales Manager" ? handleSubmitForAssessment : undefined}
              onUpdateStatus={role === "Sales Rep" ? handleUpdateLeadStatus : undefined}
              onContactLead={role === "Sales Rep" ? handleContactLead : undefined}
              assessments={assessments}
              onInfoResponse={role === "Sales Rep" ? handleInfoResponse : undefined}
              onUpdateLeadDetails={handleUpdateLeadDetails}
              users={users}
              onViewProfile={setProfileUser}
            />
          )}
          {activeView === "deals" && (
            <DealsView
              deals={deals}
              isSalesRep={role === "Sales Rep"}
              canDownloadCert={role === "Sales Manager" || role === "Executive"}
            />
          )}
          {activeView === "users" && <UsersView users={users} onAddUser={() => setNewUserOpen(true)} onToggleStatus={handleToggleUserStatus} onUpdateUser={handleUpdateUser} onDeleteUser={handleRemoveUser} onChangePassword={handleChangePassword} currentUserEmail={DEMO_CREDENTIALS.find((c) => c.name === userName)?.email} />}
          {activeView === "assessments" && (
            <AssessmentsView
              assessments={assessments}
              role={role}
              leads={leads}
              users={users}
              onSubmitAssessment={handleSubmitAssessment}
              onRequestInfo={handleRequestInfo}
              onSetInReview={handleSetInReview}
              onViewProfile={setProfileUser}
            />
          )}
        </div>
      </main>
    </div>
    </>
  );
}
