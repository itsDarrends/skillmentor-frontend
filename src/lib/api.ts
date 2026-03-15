// Admin API calls
export async function adminGetAllSessions(token: string) {
  const res = await fetchWithAuth("/api/v1/admin/sessions", token);
  return res.json();
}

export async function adminUpdateSessionStatus(
  token: string,
  id: number,
  status?: string,
  sessionStatus?: string
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
  meetingLink: string
) {
  const res = await fetchWithAuth(`/api/v1/admin/sessions/${id}/meeting-link`, token, {
    method: "PATCH",
    body: JSON.stringify({ meetingLink }),
  });
  return res.json();
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