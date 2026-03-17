import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminGetAllStudents, adminDeleteStudent } from "@/lib/api";

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  learningGoals: string;
  createdAt: string;
}

export default function ManageStudentsPage() {
  const { getToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    try {
      const data = await adminGetAllStudents(token);
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    await adminDeleteStudent(token, id);
    fetchStudents();
  };

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Students</h1>
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs mb-6"
      />
      {loading ? (
        <p className="text-muted-foreground">Loading students...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No students found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((student) => (
                <tr key={student.id} className="bg-background hover:bg-muted/50">
                  <td className="px-4 py-3">{student.id}</td>
                  <td className="px-4 py-3">{student.firstName} {student.lastName}</td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </Button>
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