import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicMentors, createSubject } from "@/lib/api";
import type { Mentor } from "@/types";

export default function CreateSubjectPage() {
  const { getToken } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    subjectName: "",
    description: "",
    courseImageUrl: "",
    mentorId: "",
  });

  useEffect(() => {
    getPublicMentors().then((data) => setMentors(data.content));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.subjectName.length < 5) {
      setError("Subject name must be at least 5 characters.");
      return;
    }
    if (!form.mentorId) {
      setError("Please select a mentor.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) throw new Error("Not authenticated");
      await createSubject(token, {
        subjectName: form.subjectName,
        description: form.description,
        courseImageUrl: form.courseImageUrl,
        mentorId: Number(form.mentorId),
      });
      setSuccess(true);
      setForm({ subjectName: "", description: "", courseImageUrl: "", mentorId: "" });
    } catch (err) {
      setError("Failed to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-8">Create Subject</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input
                id="subjectName"
                value={form.subjectName}
                onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                placeholder="e.g. AWS Developer Associate Exam Prep"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the subject..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseImageUrl">Course Image URL</Label>
              <Input
                id="courseImageUrl"
                value={form.courseImageUrl}
                onChange={(e) => setForm({ ...form, courseImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentorId">Assign to Mentor *</Label>
              <select
                id="mentorId"
                value={form.mentorId}
                onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a mentor...</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.firstName} {mentor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">Subject created successfully!</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Subject"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}