import type {
  Enrollment,
  Mentor,
  MentorProfile,
  Stats,
  Student,
  AdminMentor,
  AdminSubject,
  AdminSession,
} from "@/types";

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

export async function getMentorProfile(id: number): Promise<MentorProfile> {
  const res = await fetch(`${API_BASE_URL}/api/v1/mentors/${id}`);
  if (!res.ok) throw new Error("Failed to fetch mentor profile");
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

export async function submitReview(
  token: string,
  sessionId: number,
  review: string,
  rating: number,
): Promise<Enrollment> {
  const res = await fetchWithAuth(
    `/api/v1/sessions/${sessionId}/review`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ review, rating }),
    },
  );
  return res.json();
}

export async function adminGetStats(token: string): Promise<Stats> {
  const res = await fetchWithAuth("/api/v1/admin/stats", token);
  return res.json();
}

export async function adminGetAllSessions(
  token: string,
): Promise<AdminSession[]> {
  const res = await fetchWithAuth("/api/v1/admin/sessions", token);
  return res.json();
}

export async function adminUpdateSessionStatus(
  token: string,
  id: number,
  status?: string,
  sessionStatus?: string,
): Promise<AdminSession> {
  const res = await fetchWithAuth(
    `/api/v1/admin/sessions/${id}/status`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ status, sessionStatus }),
    },
  );
  return res.json();
}

export async function adminUpdateMeetingLink(
  token: string,
  id: number,
  meetingLink: string,
): Promise<AdminSession> {
  const res = await fetchWithAuth(
    `/api/v1/admin/sessions/${id}/meeting-link`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ meetingLink }),
    },
  );
  return res.json();
}

export async function adminDeleteSession(
  token: string,
  id: number,
): Promise<void> {
  await fetchWithAuth(`/api/v1/admin/sessions/${id}`, token, {
    method: "DELETE",
  });
}

export async function adminGetAllMentors(
  token: string,
): Promise<AdminMentor[]> {
  const res = await fetchWithAuth("/api/v1/admin/mentors", token);
  return res.json();
}

export async function adminUpdateMentor(
  token: string,
  id: number,
  data: Partial<AdminMentor>,
): Promise<AdminMentor> {
  const res = await fetchWithAuth(`/api/v1/admin/mentors/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteMentor(
  token: string,
  id: number,
): Promise<void> {
  await fetchWithAuth(`/api/v1/admin/mentors/${id}`, token, {
    method: "DELETE",
  });
}

export async function adminGetAllSubjects(
  token: string,
): Promise<AdminSubject[]> {
  const res = await fetchWithAuth("/api/v1/admin/subjects", token);
  return res.json();
}

export async function adminUpdateSubject(
  token: string,
  id: number,
  data: Partial<AdminSubject> & { mentorId?: string },
): Promise<AdminSubject> {
  const res = await fetchWithAuth(`/api/v1/admin/subjects/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteSubject(
  token: string,
  id: number,
): Promise<void> {
  await fetchWithAuth(`/api/v1/admin/subjects/${id}`, token, {
    method: "DELETE",
  });
}

export async function adminGetAllStudents(token: string): Promise<Student[]> {
  const res = await fetchWithAuth("/api/v1/admin/students", token);
  return res.json();
}

export async function adminDeleteStudent(
  token: string,
  id: number,
): Promise<void> {
  await fetchWithAuth(`/api/v1/admin/students/${id}`, token, {
    method: "DELETE",
  });
}

export async function createMentor(
  token: string,
  data: Partial<AdminMentor>,
): Promise<AdminMentor> {
  const res = await fetchWithAuth("/api/v1/mentors", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createSubject(
  token: string,
  data: {
    subjectName: string;
    description: string;
    courseImageUrl: string;
    mentorId: number;
  },
): Promise<AdminSubject> {
  const res = await fetchWithAuth("/api/v1/subjects", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function uploadPaymentSlip(
  token: string,
  sessionId: number,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    `${API_BASE_URL}/api/v1/sessions/${sessionId}/payment-slip`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
}