import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminGetAllSessions,
  adminUpdateSessionStatus,
  adminUpdateMeetingLink,
} from "@/lib/api";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { AdminSession } from "@/types";

type SortField = "id" | "studentName" | "mentorName" | "sessionAt" | "paymentStatus" | "sessionStatus";
type SortDirection = "asc" | "desc" | null;

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function ManageBookingsPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [meetingLinkInput, setMeetingLinkInput] = useState<{ [id: number]: string }>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, dateFrom, dateTo, sortField, sortDirection]);

  const handleConfirmPayment = async (id: number) => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminUpdateSessionStatus(token, id, "accepted", undefined);
    fetchSessions();
  };

  const handleMarkComplete = async (id: number) => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminUpdateSessionStatus(token, id, "completed", "completed");
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else setSortDirection("asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronsUpDown className="inline size-3 ml-1 opacity-40" />;
    if (sortDirection === "asc")
      return <ChevronUp className="inline size-3 ml-1" />;
    return <ChevronDown className="inline size-3 ml-1" />;
  };

  const statusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "accepted") return "bg-green-100 text-green-800";
    if (status === "completed") return "bg-blue-100 text-blue-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Filter
  const filtered = sessions.filter((s) => {
    if (filter !== "all" && s.paymentStatus !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.studentName?.toLowerCase().includes(q) &&
        !s.mentorName?.toLowerCase().includes(q)
      )
        return false;
    }
    if (dateFrom) {
      const sessionDate = new Date(s.sessionAt);
      if (sessionDate < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const sessionDate = new Date(s.sessionAt);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      if (sessionDate > toDate) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aVal: string | number = a[sortField] ?? "";
    let bVal: string | number = b[sortField] ?? "";
    if (sortField === "id") {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else if (sortField === "sessionAt") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortField(null);
    setSortDirection(null);
    setCurrentPage(1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search by student or mentor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">From:</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">To:</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
          />
        </div>
        {(search || filter !== "all" || dateFrom || dateTo) && (
          <Button variant="outline" onClick={clearFilters} className="text-sm">
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results count + page size */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          {sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}{" "}
          results
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading sessions...</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">No sessions found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th
                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-muted/80"
                    onClick={() => handleSort("id")}
                  >
                    ID <SortIcon field="id" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-muted/80"
                    onClick={() => handleSort("studentName")}
                  >
                    Student <SortIcon field="studentName" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-muted/80"
                    onClick={() => handleSort("mentorName")}
                  >
                    Mentor <SortIcon field="mentorName" />
                  </th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-muted/80"
                    onClick={() => handleSort("sessionAt")}
                  >
                    Date <SortIcon field="sessionAt" />
                  </th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-muted/80"
                    onClick={() => handleSort("paymentStatus")}
                  >
                    Payment <SortIcon field="paymentStatus" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-muted/80"
                    onClick={() => handleSort("sessionStatus")}
                  >
                    Status <SortIcon field="sessionStatus" />
                  </th>
                  <th className="px-4 py-3 text-left">Meeting Link</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map((session) => (
                  <tr
                    key={session.id}
                    className="bg-background hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">{session.id}</td>
                    <td className="px-4 py-3">{session.studentName ?? "—"}</td>
                    <td className="px-4 py-3">{session.mentorName ?? "—"}</td>
                    <td className="px-4 py-3">{session.subjectName ?? "—"}</td>
                    <td className="px-4 py-3">
                      {new Date(session.sessionAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{session.durationMinutes} min</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(session.paymentStatus)}`}
                      >
                        {session.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(session.sessionStatus ?? "")}`}
                      >
                        {session.sessionStatus ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="https://meet.google.com/..."
                          value={
                            meetingLinkInput[session.id] ??
                            session.meetingLink ??
                            ""
                          }
                          onChange={(e) =>
                            setMeetingLinkInput({
                              ...meetingLinkInput,
                              [session.id]: e.target.value,
                            })
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
                        {/* show when accepted AND not already completed */}
                        {session.paymentStatus === "accepted" &&
                          session.sessionStatus !== "completed" && (
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

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹ Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}