import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMentor } from "@/lib/api";

export default function CreateMentorPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    mentorId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    title: "",
    profession: "",
    company: "",
    experienceYears: "",
    bio: "",
    profileImageUrl: "",
    positiveReviews: "",
    totalEnrollments: "",
    isCertified: false,
    startYear: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.firstName || !form.lastName || !form.email) {
      setError("First name, last name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) throw new Error("Not authenticated");
      await createMentor(token, {
        ...form,
        experienceYears: Number(form.experienceYears),
        positiveReviews: Number(form.positiveReviews),
        totalEnrollments: Number(form.totalEnrollments),
      });
      setSuccess(true);
      setForm({
        mentorId: "", firstName: "", lastName: "", email: "",
        phoneNumber: "", title: "", profession: "", company: "",
        experienceYears: "", bio: "", profileImageUrl: "",
        positiveReviews: "", totalEnrollments: "",
        isCertified: false, startYear: "",
      });
    } catch {
      setError("Failed to create mentor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    id, label, required = false, type = "text",
  }: {
    id: keyof typeof form;
    label: string;
    required?: boolean;
    type?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && " *"}</Label>
      <Input
        id={id}
        type={type}
        value={form[id] as string}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        required={required}
      />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create Mentor</h1>
      <Card>
        <CardHeader><CardTitle>New Mentor</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field id="firstName" label="First Name" required />
              <Field id="lastName" label="Last Name" required />
            </div>
            <Field id="email" label="Email" required type="email" />
            <Field id="mentorId" label="Mentor ID (Clerk User ID)" required />
            <Field id="phoneNumber" label="Phone Number" />
            <Field id="title" label="Title" />
            <Field id="profession" label="Profession" />
            <Field id="company" label="Company" />
            <Field id="experienceYears" label="Experience Years" type="number" />
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Field id="profileImageUrl" label="Profile Image URL" />
            <Field id="positiveReviews" label="Positive Reviews %" type="number" />
            <Field id="totalEnrollments" label="Total Enrollments" type="number" />
            <Field id="startYear" label="Start Year" />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCertified"
                checked={form.isCertified}
                onChange={(e) => setForm({ ...form, isCertified: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="isCertified">Is Certified Teacher</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-green-600">Mentor created successfully!</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Mentor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}