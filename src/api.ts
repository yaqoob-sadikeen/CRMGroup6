// Central API client for Altrium backend

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

let _token: string | null = localStorage.getItem("altriumToken");

export function setToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem("altriumToken", t);
  else localStorage.removeItem("altriumToken");
}
export function getToken() { return _token; }

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiLogin(email: string, password: string) {
  return req<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
    "POST", "/api/auth/login", { email, password }
  );
}

export async function apiForgotPassword(email: string) {
  return req<{ message: string }>("POST", "/api/auth/forgot-password", { email });
}

export async function apiResetPassword(token: string, password: string) {
  return req<{ message: string }>("POST", "/api/auth/reset-password", { token, password });
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function apiGetUsers() {
  return req<any[]>("GET", "/api/users");
}
export async function apiCreateUser(u: any) {
  return req<{ id: number }>("POST", "/api/users", u);
}
export async function apiUpdateUser(id: number, u: any) {
  return req<{ ok: boolean }>("PATCH", `/api/users/${id}`, u);
}
export async function apiDeleteUser(id: number) {
  return req<{ ok: boolean }>("DELETE", `/api/users/${id}`);
}

// ── Leads ─────────────────────────────────────────────────────────────────────
export async function apiGetLeads() {
  return req<any[]>("GET", "/api/leads");
}
export async function apiCreateLead(data: any) {
  return req<{ id: number }>("POST", "/api/leads", data);
}
export async function apiUpdateLead(id: number, data: any) {
  return req<{ ok: boolean }>("PATCH", `/api/leads/${id}`, data);
}
export async function apiDeleteLead(id: number) {
  return req<{ ok: boolean }>("DELETE", `/api/leads/${id}`);
}

// ── Interactions ──────────────────────────────────────────────────────────────
export async function apiGetInteractions(leadId: number) {
  return req<any[]>("GET", `/api/leads/${leadId}/interactions`);
}
export async function apiAddInteraction(leadId: number, data: any) {
  return req<{ id: number }>("POST", `/api/leads/${leadId}/interactions`, data);
}

// ── Follow-ups ────────────────────────────────────────────────────────────────
export async function apiGetFollowUps(leadId: number) {
  return req<any[]>("GET", `/api/leads/${leadId}/followups`);
}
export async function apiAddFollowUp(leadId: number, data: any) {
  return req<{ id: number }>("POST", `/api/leads/${leadId}/followups`, data);
}
export async function apiUpdateFollowUp(leadId: number, fuId: number, data: any) {
  return req<{ ok: boolean }>("PATCH", `/api/leads/${leadId}/followups/${fuId}`, data);
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export async function apiGetNotes(leadId: number) {
  return req<any[]>("GET", `/api/leads/${leadId}/notes`);
}
export async function apiAddNote(leadId: number, data: any) {
  return req<{ id: number }>("POST", `/api/leads/${leadId}/notes`, data);
}

// ── Assessments ───────────────────────────────────────────────────────────────
export async function apiGetAssessments() {
  return req<any[]>("GET", "/api/assessments");
}
export async function apiCreateAssessment(data: any) {
  return req<{ id: number }>("POST", "/api/assessments", data);
}
export async function apiSubmitAssessment(id: number, data: any) {
  return req<{ ok: boolean }>("PATCH", `/api/assessments/${id}/submit`, data);
}
export async function apiSaveDraft(id: number, data: any) {
  return req<{ ok: boolean }>("PUT", `/api/assessments/${id}/draft`, data);
}
export async function apiLoadDraft(id: number) {
  return req<{ draft: any }>("GET", `/api/assessments/${id}/draft`);
}
export async function apiDeleteDraft(id: number) {
  return req<{ ok: boolean }>("DELETE", `/api/assessments/${id}/draft`);
}
export async function apiReviewAssessment(id: number) {
  return req<{ ok: boolean }>("PATCH", `/api/assessments/${id}/review`, {});
}
export async function apiRequestInfo(id: number, request: string) {
  return req<{ ok: boolean }>("PATCH", `/api/assessments/${id}/request-info`, { request });
}
export async function apiInfoResponse(leadName: string) {
  return req<{ ok: boolean }>("PATCH", `/api/assessments/by-lead/${encodeURIComponent(leadName)}/info-response`, {});
}

// ── Deals ─────────────────────────────────────────────────────────────────────
export async function apiGetDeals() {
  return req<any[]>("GET", "/api/deals");
}
export async function apiCreateDeal(data: any) {
  return req<{ id: number }>("POST", "/api/deals", data);
}
export async function apiDeleteDeal(id: number) {
  return req<{ ok: boolean }>("DELETE", `/api/deals/${id}`);
}

// ── Activity ──────────────────────────────────────────────────────────────────
export async function apiGetActivity() {
  return req<any[]>("GET", "/api/activity");
}
export async function apiLogActivity(event: string, type: string) {
  return req<{ id: number }>("POST", "/api/activity", { event, type });
}
