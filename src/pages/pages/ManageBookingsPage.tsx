import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminGetAllSessions, adminUpdateSessionStatus, adminUpdateMeetingLink } from "@/lib/api";

interface AdminSession {
  id: number;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: string;
  paymentStatus: string;
  meetingLink: string | null;
}

export default function ManageBookingsPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [meetingLinkInput, setMeetingLinkInput] = useState<{ [id: number]: string }>({});

  const fetchSessions = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    try {
      const data = await adminGetAllSessions(token);
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleConfirmPayment = async (id: number) => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminUpdateSessionStatus(token, id, "accepted", undefined);
    fetchSessions();
  };

  const handleMarkComplete = async (id: number) => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminUpdateSessionStatus(token, id, undefined, "completed");
    fetchSessions();
  };

  const handleAddMeetingLink = async (id: number) => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    const link = meetingLinkInput[id];
    if (!link) return;
    await adminUpdateMeetingLink(token, id, link);
    fetchSessions();
  };

  const filtered = sessions.filter((s) => {
    if (filter !== "all" && s.paymentStatus !== filter) return false;
    return true;
  });

  const statusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "accepted") return "bg-green-100 text-green-800";
    if (status === "completed") return "bg-blue-100 text-blue-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading sessions...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No sessions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Session Date</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Meeting Link</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((session) => (
                <tr key={session.id} className="bg-background hover:bg-muted/50">
                  <td className="px-4 py-3">{session.id}</td>
                  <td className="px-4 py-3">
                    {new Date(session.sessionAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{session.durationMinutes} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(session.paymentStatus)}`}>
                      {session.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(session.sessionStatus ?? "")}`}>
                      {session.sessionStatus ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="https://meet.google.com/..."
                        value={meetingLinkInput[session.id] ?? session.meetingLink ?? ""}
                        onChange={(e) =>
                          setMeetingLinkInput({ ...meetingLinkInput, [session.id]: e.target.value })
                        }
                        className="h-7 text-xs w-48"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleAddMeetingLink(session.id)}
                      >
                        Save
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {session.paymentStatus === "pending" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleConfirmPayment(session.id)}
                        >
                          Confirm Payment
                        </Button>
                      )}
                      {session.paymentStatus === "accepted" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleMarkComplete(session.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}