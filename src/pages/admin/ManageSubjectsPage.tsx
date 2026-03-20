import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminGetAllSubjects, adminDeleteSubject, adminUpdateSubject, getPublicMentors } from "@/lib/api";
import type { Mentor } from "@/types";

interface Subject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
  mentor: { id: number; firstName: string; lastName: string };
}

export default function ManageSubjectsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subject> & { mentorId?: string }>({});
  const [search, setSearch] = useState("");

  const fetchSubjects = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    try {
      const data = await adminGetAllSubjects(token);
      setSubjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    getPublicMentors().then((data) => setMentors(data.content));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminDeleteSubject(token, id);
    fetchSubjects();
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditForm({
      ...subject,
      mentorId: String(subject.mentor?.id ?? ""),
    });
  };

  const handleUpdate = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token || !editingId) return;
    await adminUpdateSubject(token, editingId, {
      subjectName: editForm.subjectName,
      description: editForm.description,
      courseImageUrl: editForm.courseImageUrl,
      mentorId: editForm.mentorId,
    });
    setEditingId(null);
    fetchSubjects();
  };

  const filtered = subjects.filter((s) =>
    s.subjectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Subjects</h1>
        <Button onClick={() => navigate("/admin/subjects/create")}>+ Create Subject</Button>
      </div>
      <Input
        placeholder="Search by subject name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs mb-6"
      />
      {loading ? (
        <p className="text-muted-foreground">Loading subjects...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No subjects found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Subject Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Mentor</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((subject) =>
                editingId === subject.id ? (
                  <tr key={subject.id} className="bg-yellow-50">
                    <td className="px-4 py-3">{subject.id}</td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.subjectName ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })}
                        className="h-7 text-xs w-48"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.description ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="h-7 text-xs w-48"
                      />
                    </td>
                    {/*edit mentor dropdown*/}
                    <td className="px-4 py-3">
                      <select
                        value={editForm.mentorId ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, mentorId: e.target.value })}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs w-40"
                      >
                        <option value="">Select mentor...</option>
                        {mentors.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleUpdate}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={subject.id} className="bg-background hover:bg-muted/50">
                    <td className="px-4 py-3">{subject.id}</td>
                    <td className="px-4 py-3">{subject.subjectName}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{subject.description ?? "—"}</td>
                    <td className="px-4 py-3">
                      {subject.mentor?.firstName} {subject.mentor?.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleEdit(subject)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDelete(subject.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}