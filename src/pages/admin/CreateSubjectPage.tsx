import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicMentors, createSubject } from "@/lib/api";
import type { Mentor } from "@/types";

const subjectSchema = z.object({
  subjectName: z.string().min(5, "Subject name must be at least 5 characters"),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional(),
  courseImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  mentorId: z.string().min(1, "Please select a mentor"),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function CreateSubjectPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subjectName: "",
      description: "",
      courseImageUrl: "",
      mentorId: "",
    },
  });

  useEffect(() => {
    getPublicMentors().then((data) => setMentors(data.content));
  }, []);

  const onSubmit = async (data: SubjectFormData) => {
    setServerError("");
    setSuccess(false);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) throw new Error("Not authenticated");
      await createSubject(token, {
        subjectName: data.subjectName,
        description: data.description ?? "",
        courseImageUrl: data.courseImageUrl ?? "",
        mentorId: Number(data.mentorId),
      });
      setSuccess(true);
      reset();
      setTimeout(() => navigate("/admin/subjects"), 1500);
    } catch {
      setServerError("Failed to create subject. Please try again.");
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Subject Name */}
            <div className="space-y-1">
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input
                id="subjectName"
                placeholder="e.g. AWS Developer Associate Exam Prep"
                {...register("subjectName")}
                className={errors.subjectName ? "border-destructive" : ""}
              />
              {errors.subjectName && (
                <p className="text-xs text-destructive">{errors.subjectName.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe the subject..."
                className={`w-full min-h-[100px] rounded-md border px-3 py-2 text-sm bg-background ${
                  errors.description ? "border-destructive" : "border-input"
                }`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Course Image URL */}
            <div className="space-y-1">
              <Label htmlFor="courseImageUrl">Course Image URL</Label>
              <Input
                id="courseImageUrl"
                placeholder="https://..."
                {...register("courseImageUrl")}
                className={errors.courseImageUrl ? "border-destructive" : ""}
              />
              {errors.courseImageUrl && (
                <p className="text-xs text-destructive">{errors.courseImageUrl.message}</p>
              )}
            </div>

            {/* Mentor Select */}
            <div className="space-y-1">
              <Label htmlFor="mentorId">Assign to Mentor *</Label>
              <select
                id="mentorId"
                className={`w-full rounded-md border px-3 py-2 text-sm bg-background ${
                  errors.mentorId ? "border-destructive" : "border-input"
                }`}
                {...register("mentorId")}
              >
                <option value="">Select a mentor...</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.firstName} {mentor.lastName}
                  </option>
                ))}
              </select>
              {errors.mentorId && (
                <p className="text-xs text-destructive">{errors.mentorId.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            {/* Success */}
            {success && (
              <p className="text-sm text-green-600">
                Subject created successfully! Redirecting...
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Subject"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}