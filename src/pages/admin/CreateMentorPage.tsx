import { useAuth } from "@clerk/clerk-react";
import { useForm, useWatch, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMentor } from "@/lib/api";
import {
  Building2,
  Calendar,
  GraduationCap,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";

const mentorSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Must be a valid email address"),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
  title: z.string().max(100).optional().or(z.literal("")),
  profession: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  experienceYears: z
    .string()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Must be a valid number",
    })
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional().or(z.literal("")),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  positiveReviews: z
    .string()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100), {
      message: "Must be between 0 and 100",
    })
    .optional()
    .or(z.literal("")),
  totalEnrollments: z
    .string()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Must be a valid number",
    })
    .optional()
    .or(z.literal("")),
  isCertified: z.boolean().optional(),
  startYear: z.string().max(10).optional().or(z.literal("")),
});

type MentorFormData = z.infer<typeof mentorSchema>;

// ─── Live Preview Card ─────────────────────────────────────────────
// useWatch is INSIDE this component so only the preview re-renders
// on each keystroke, not the entire form
function MentorPreviewCard({ control }: { control: Control<MentorFormData> }) {
  const data = useWatch({ control }); // 👈 moved here
  const [imgError, setImgError] = useState(false);

  const fullName =
    data.firstName || data.lastName
      ? `${data.firstName} ${data.lastName}`.trim()
      : "Mentor Name";

  return (
    <Card className="flex flex-col h-full sticky top-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Profile image + name */}
        <div className="flex items-center gap-3">
          {data.profileImageUrl && !imgError ? (
            <img
              src={data.profileImageUrl}
              alt={fullName}
              onError={() => setImgError(true)}
              className="size-16 rounded-full object-cover object-top border"
            />
          ) : (
            <div className="size-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border">
              {data.firstName?.charAt(0) || "?"}
            </div>
          )}
          <div>
            <p className="font-semibold text-base">{fullName}</p>
            {data.title && (
              <p className="text-sm text-muted-foreground">{data.title}</p>
            )}
            {data.isCertified && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1">
                <ShieldCheck className="size-3" /> Certified Teacher
              </span>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {data.company && (
            <div className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" />
              <span>{data.company}</span>
            </div>
          )}
          {data.startYear && (
            <div className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              <span>Tutor since {data.startYear}</span>
            </div>
          )}
          {data.positiveReviews && (
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-4 shrink-0" />
              <span>{data.positiveReviews}% positive reviews</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {data.bio && (
          <p className="text-sm text-muted-foreground line-clamp-4 border-t pt-3">
            {data.bio}
          </p>
        )}

        {/* Highlights */}
        <div className="bg-blue-50 rounded-md p-3 space-y-2 mt-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Highlights
          </p>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="size-4" />
            <span>
              {data.totalEnrollments
                ? `${data.totalEnrollments} Enrollments`
                : "0 Enrollments"}
            </span>
          </div>
          {data.isCertified && (
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4" />
              <span>Certified Teacher</span>
            </div>
          )}
        </div>

        {/* Profession badge */}
        {data.profession && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {data.profession}
            </span>
            {data.experienceYears && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {data.experienceYears} yrs experience
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function CreateMentorPage() {
  const { getToken } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MentorFormData>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: MentorFormData) => {
    setServerError("");
    setSuccess(false);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) throw new Error("Not authenticated");
      await createMentor(token, {
        ...data,
        experienceYears: Number(data.experienceYears) || 0,
        positiveReviews: Number(data.positiveReviews) || 0,
        totalEnrollments: Number(data.totalEnrollments) || 0,
      });
      setSuccess(true);
      reset();
    } catch {
      setServerError("Failed to create mentor. Please try again.");
    }
  };

  const fieldClass = (hasError: boolean) =>
    hasError ? "border-destructive" : "";

  return (
    <div className="flex gap-8 items-start">
      {/* ── Form (left) ── */}
      <div className="flex-1 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Create Mentor</h1>
        <Card>
          <CardHeader>
            <CardTitle>New Mentor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={fieldClass(!!errors.firstName)}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={fieldClass(!!errors.lastName)}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={fieldClass(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Mentor ID */}
              <div className="space-y-1">
                <Label htmlFor="mentorId">Mentor ID (Clerk User ID) *</Label>
                <Input
                  id="mentorId"
                  {...register("mentorId")}
                  className={fieldClass(!!errors.mentorId)}
                />
                {errors.mentorId && (
                  <p className="text-xs text-destructive">
                    {errors.mentorId.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...register("phoneNumber")} />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Software Engineer"
                  {...register("title")}
                />
              </div>

              {/* Profession */}
              <div className="space-y-1">
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" {...register("profession")} />
              </div>

              {/* Company */}
              <div className="space-y-1">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} />
              </div>

              {/* Experience Years */}
              <div className="space-y-1">
                <Label htmlFor="experienceYears">Experience Years</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min={0}
                  {...register("experienceYears")}
                  className={fieldClass(!!errors.experienceYears)}
                />
                {errors.experienceYears && (
                  <p className="text-xs text-destructive">
                    {errors.experienceYears.message}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className={`w-full min-h-[100px] rounded-md border px-3 py-2 text-sm bg-background ${
                    errors.bio ? "border-destructive" : "border-input"
                  }`}
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {/* Profile Image URL */}
              <div className="space-y-1">
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <Input
                  id="profileImageUrl"
                  placeholder="https://..."
                  {...register("profileImageUrl")}
                  className={fieldClass(!!errors.profileImageUrl)}
                />
                {errors.profileImageUrl && (
                  <p className="text-xs text-destructive">
                    {errors.profileImageUrl.message}
                  </p>
                )}
              </div>

              {/* Positive Reviews */}
              <div className="space-y-1">
                <Label htmlFor="positiveReviews">Positive Reviews %</Label>
                <Input
                  id="positiveReviews"
                  type="number"
                  min={0}
                  max={100}
                  {...register("positiveReviews")}
                  className={fieldClass(!!errors.positiveReviews)}
                />
                {errors.positiveReviews && (
                  <p className="text-xs text-destructive">
                    {errors.positiveReviews.message}
                  </p>
                )}
              </div>

              {/* Total Enrollments */}
              <div className="space-y-1">
                <Label htmlFor="totalEnrollments">Total Enrollments</Label>
                <Input
                  id="totalEnrollments"
                  type="number"
                  min={0}
                  {...register("totalEnrollments")}
                  className={fieldClass(!!errors.totalEnrollments)}
                />
                {errors.totalEnrollments && (
                  <p className="text-xs text-destructive">
                    {errors.totalEnrollments.message}
                  </p>
                )}
              </div>

              {/* Start Year */}
              <div className="space-y-1">
                <Label htmlFor="startYear">Start Year</Label>
                <Input
                  id="startYear"
                  placeholder="e.g. 2018"
                  {...register("startYear")}
                />
              </div>

              {/* Is Certified */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCertified"
                  className="rounded border-input"
                  {...register("isCertified")}
                />
                <Label htmlFor="isCertified">Is Certified Teacher</Label>
              </div>

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}
              {success && (
                <p className="text-sm text-green-600">
                  Mentor created successfully!
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Mentor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── Live Preview (right) ── */}
      <div className="w-80 shrink-0 hidden lg:block">
        <MentorPreviewCard control={control} />
      </div>
    </div>
  );
}