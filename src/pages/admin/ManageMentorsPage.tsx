import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminGetAllMentors, adminDeleteMentor, adminUpdateMentor } from "@/lib/api";

interface Mentor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  profession: string;
  experienceYears: number;
  positiveReviews: number;
  totalEnrollments: number;
  isCertified: boolean;
  startYear: string;
  bio: string;
  profileImageUrl: string;
}

export default function ManageMentorsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Mentor>>({});
  const [search, setSearch] = useState("");

  const fetchMentors = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    try {
      const data = await adminGetAllMentors(token);
      setMentors(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMentors(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminDeleteMentor(token, id);
    fetchMentors();
  };

  const handleEdit = (mentor: Mentor) => {
    setEditingId(mentor.id);
    setEditForm(mentor);
  };

  const handleUpdate = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token || !editingId) return;
    await adminUpdateMentor(token, editingId, editForm);
    setEditingId(null);
    fetchMentors();
  };

  const filtered = mentors.filter((m) =>
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Mentors</h1>
        <Button onClick={() => navigate("/admin/mentors/create")}>+ Create Mentor</Button>
      </div>
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs mb-6"
      />
      {loading ? (
        <p className="text-muted-foreground">Loading mentors...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No mentors found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Experience</th>
                <th className="px-4 py-3 text-left">Reviews</th>
                <th className="px-4 py-3 text-left">Certified</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((mentor) => (
                editingId === mentor.id ? (
                  <tr key={mentor.id} className="bg-yellow-50">
                    <td className="px-4 py-3">{mentor.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Input value={editForm.firstName ?? ""} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="h-7 text-xs w-24" />
                        <Input value={editForm.lastName ?? ""} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="h-7 text-xs w-24" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input value={editForm.email ?? ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-7 text-xs w-40" />
                    </td>
                    <td className="px-4 py-3">
                      <Input value={editForm.company ?? ""} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="h-7 text-xs w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" value={editForm.experienceYears ?? 0} onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })} className="h-7 text-xs w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" value={editForm.positiveReviews ?? 0} onChange={(e) => setEditForm({ ...editForm, positiveReviews: Number(e.target.value) })} className="h-7 text-xs w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={editForm.isCertified ?? false} onChange={(e) => setEditForm({ ...editForm, isCertified: e.target.checked })} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleUpdate}>Save</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={mentor.id} className="bg-background hover:bg-muted/50">
                    <td className="px-4 py-3">{mentor.id}</td>
                    <td className="px-4 py-3">{mentor.firstName} {mentor.lastName}</td>
                    <td className="px-4 py-3">{mentor.email}</td>
                    <td className="px-4 py-3">{mentor.company ?? "—"}</td>
                    <td className="px-4 py-3">{mentor.experienceYears} yrs</td>
                    <td className="px-4 py-3">{mentor.positiveReviews}%</td>
                    <td className="px-4 py-3">{mentor.isCertified ? "✅" : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEdit(mentor)}>Edit</Button>
                        <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(mentor.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}