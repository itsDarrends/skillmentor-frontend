import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getMentorProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SchedulingModal } from "@/components/SchedulingModel";
import {
  Building2, Calendar, ShieldCheck, Star, Users,
  BookOpen, ThumbsUp, ArrowLeft, GraduationCap,
} from "lucide-react";
import type { MentorProfile, Mentor, Subject } from "@/types";
import { useAuth } from "@clerk/clerk-react";

export default function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!mentorId) return;
    getMentorProfile(Number(mentorId))
      .then(setProfile)
      .catch(() => setError("Failed to load mentor profile"))
      .finally(() => setLoading(false));
  }, [mentorId]);

  const handleBookSubject = (subject: Subject) => {
    if (!isSignedIn) { navigate("/login"); return; }
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">Loading mentor profile...</p>
    </div>
  );

  if (error || !profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-destructive">{error || "Mentor not found"}</p>
    </div>
  );

  const {
    mentor,
    totalStudentsTaught,
    averageRating,
    totalReviews,
    reviews,
    subjectEnrollments,
  } = profile;

  const mentorName = `${mentor.firstName} ${mentor.lastName}`;
  const mentorForModal: Mentor = selectedSubject
    ? { ...mentor, subjects: [selectedSubject] }
    : mentor;

  return (
    <div className="container py-10 max-w-5xl">
      <Link
        to="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to Mentors
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-shrink-0">
          {mentor.profileImageUrl ? (
            <img
              src={mentor.profileImageUrl}
              alt={mentorName}
              className="w-40 h-40 rounded-2xl object-cover object-top"
            />
          ) : (
            <div className="w-40 h-40 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold">
              {mentor.firstName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{mentorName}</h1>
            {mentor.isCertified && (
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                <ShieldCheck className="size-3" /> Certified Teacher
              </Badge>
            )}
          </div>
          <p className="text-xl text-muted-foreground mb-1">{mentor.title}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Building2 className="size-4" />{mentor.company}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-4" />Since {mentor.startYear}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-4" />{mentor.positiveReviews}% positive
            </span>
            {averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                {averageRating} ({totalReviews} reviews)
              </span>
            )}
          </div>
          <Button
            onClick={() => mentor.subjects[0] && handleBookSubject(mentor.subjects[0])}
            size="lg"
            disabled={mentor.subjects.length === 0}
          >
            Schedule a Session
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Students Taught", value: totalStudentsTaught, icon: Users },
          { label: "Years Experience", value: mentor.experienceYears, icon: Calendar },
          { label: "Positive Reviews", value: `${mentor.positiveReviews}%`, icon: ThumbsUp },
          { label: "Subjects Taught", value: mentor.subjects.length, icon: BookOpen },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <stat.icon className="size-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* About */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{mentor.profession}</Badge>
          <Badge variant="outline">{mentor.company}</Badge>
          <Badge variant="outline">{mentor.experienceYears} years experience</Badge>
        </div>
      </div>

      {/* Subjects */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Subjects Taught</h2>
        {mentor.subjects.length === 0 ? (
          <p className="text-muted-foreground">No subjects available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentor.subjects.map((subject) => {
              const enrollmentCount = subjectEnrollments?.[subject.id] ?? 0;
              return (
                <Card key={subject.id} className="overflow-hidden">
                  {subject.courseImageUrl && (
                    <img
                      src={subject.courseImageUrl}
                      alt={subject.subjectName}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-1">{subject.subjectName}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="size-3" />
                        {enrollmentCount} students enrolled
                      </span>
                      <Button size="sm" onClick={() => handleBookSubject(subject)}>
                        Book Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{review.studentName}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`size-4 ${
                            j < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.review}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <SchedulingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSubject(null); }}
        mentor={mentorForModal}
      />
    </div>
  );
}