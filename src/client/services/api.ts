// Campus360 portal service layer. All calls go to the Campus360 scripted REST API on the SAME
// instance, using the user's existing ServiceNow session (X-UserToken = window.g_ck).
// No credentials, secrets or privileged tokens exist in the frontend; the server enforces ACLs.

declare global {
    interface Window { g_ck?: string }
}

const BASE = '/api/x_774308_campus360/portal'

export class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(BASE + path, {
        ...init,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-UserToken': window.g_ck || '', ...(init.headers || {}) },
    })
    const json = await res.json().catch(() => ({}))
    const payload = json && json.result ? json.result : json
    if (!res.ok) {
        const msg = (payload && payload.error && payload.error.message) || (json && json.error && json.error.message) || `Request failed (${res.status})`
        throw new ApiError(res.status, msg)
    }
    return (payload && payload.data !== undefined ? payload.data : payload) as T
}

export const api = {
    me: () => request<any>('/me'),
    catalog: () => request<any>('/catalog'),
    createRequest: (body: any) => request<any>('/requests', { method: 'POST', body: JSON.stringify(body) }),
    myRequests: () => request<any[]>('/requests/mine'),
    record: (table: string, id: string) => request<any>(`/records/${encodeURIComponent(table)}/${encodeURIComponent(id)}`),
    queue: () => request<any>('/queue'),
    issueAction: (id: string, body: any) => request<any>(`/issues/${id}/action`, { method: 'POST', body: JSON.stringify(body) }),
    assignToMe: (id: string) => request<any>(`/issues/${id}/assign-me`, { method: 'POST', body: '{}' }),
    hostel: () => request<any>('/hostel'),
    complaintAction: (id: string, body: any) => request<any>(`/complaints/${id}/action`, { method: 'POST', body: JSON.stringify(body) }),
    maintenance: () => request<any[]>('/maintenance'),
    classes: () => request<any>('/classes'),
    roster: (sessionId: string) => request<any>(`/sessions/${sessionId}/roster`),
    saveAttendance: (sessionId: string, marks: any[]) => request<any>(`/sessions/${sessionId}/attendance`, { method: 'POST', body: JSON.stringify({ marks }) }),
    registrations: () => request<any[]>('/registrations'),
    reviewRegistration: (id: string, body: any) => request<any>(`/registrations/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
    stats: () => request<any>('/stats'),
    adminOverview: () => request<any>('/admin/overview'),
    browseCatalog: () => request<any[]>('/browse'),
    browseModule: (key: string) => request<any>(`/browse/${encodeURIComponent(key)}`),
}
