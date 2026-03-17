import type { Enrollment, Mentor } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res;
}

export async function getPublicMentors(
  page = 0,
  size = 10,
): Promise<{ content: Mentor[]; totalElements: number; totalPages: number }> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/mentors?page=${page}&size=${size}`,
  );
  if (!res.ok) throw new Error("Failed to fetch mentors");
  return res.json();
}

export async function enrollInSession(
  token: string,
  data: {
    mentorId: number;
    subjectId: number;
    sessionAt: string;
    durationMinutes?: number;
  },
): Promise<Enrollment> {
  const res = await fetchWithAuth("/api/v1/sessions/enroll", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyEnrollments(token: string): Promise<Enrollment[]> {
  const res = await fetchWithAuth("/api/v1/sessions/my-sessions", token);
  return res.json();
}

// ─── ADMIN ────────────────────────────────────────────────────────

export async function adminGetStats(token: string) {
  const res = await fetchWithAuth("/api/v1/admin/stats", token);
  return res.json();
}

export async function adminGetAllSessions(token: string) {
  const res = await fetchWithAuth("/api/v1/admin/sessions", token);
  return res.json();
}

export async function adminUpdateSessionStatus(
  token: string,
  id: number,
  status?: string,
  sessionStatus?: string,
) {
  const res = await fetchWithAuth(`/api/v1/admin/sessions/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status, sessionStatus }),
  });
  return res.json();
}

export async function adminUpdateMeetingLink(
  token: string,
  id: number,
  meetingLink: string,
) {
  const res = await fetchWithAuth(`/api/v1/admin/sessions/${id}/meeting-link`, token, {
    method: "PATCH",
    body: JSON.stringify({ meetingLink }),
  });
  return res.json();
}

export async function adminDeleteSession(token: string, id: number) {
  await fetchWithAuth(`/api/v1/admin/sessions/${id}`, token, { method: "DELETE" });
}

export async function adminGetAllMentors(token: string) {
  const res = await fetchWithAuth("/api/v1/admin/mentors", token);
  return res.json();
}

export async function adminUpdateMentor(token: string, id: number, data: object) {
  const res = await fetchWithAuth(`/api/v1/admin/mentors/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteMentor(token: string, id: number) {
  await fetchWithAuth(`/api/v1/admin/mentors/${id}`, token, { method: "DELETE" });
}

export async function adminGetAllSubjects(token: string) {
  const res = await fetchWithAuth("/api/v1/admin/subjects", token);
  return res.json();
}

export async function adminUpdateSubject(token: string, id: number, data: object) {
  const res = await fetchWithAuth(`/api/v1/admin/subjects/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteSubject(token: string, id: number) {
  await fetchWithAuth(`/api/v1/admin/subjects/${id}`, token, { method: "DELETE" });
}

export async function adminGetAllStudents(token: string) {
  const res = await fetchWithAuth("/api/v1/admin/students", token);
  return res.json();
}

export async function adminDeleteStudent(token: string, id: number) {
  await fetchWithAuth(`/api/v1/admin/students/${id}`, token, { method: "DELETE" });
}

export async function createMentor(token: string, data: object) {
  const res = await fetchWithAuth("/api/v1/mentors", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createSubject(token: string, data: object) {
  const res = await fetchWithAuth("/api/v1/subjects", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}