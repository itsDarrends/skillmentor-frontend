import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { CalendarDays, Star, ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getMyEnrollments, submitReview } from "@/lib/api";
import type { Enrollment } from "@/types";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const router = useNavigate();

  const fetchEnrollments = async () => {
    if (!user) return;
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    try {
      const data = await getMyEnrollments(token);
      setEnrollments(data);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEnrollments();
    }
  }, [isLoaded, isSignedIn, user]);

  const handleSubmitReview = async () => {
    if (!reviewingId) return;
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    setSubmitting(true);
    try {
      await submitReview(token, reviewingId, reviewText, reviewRating);
      setReviewingId(null);
      setReviewText("");
      setReviewRating(5);
      fetchEnrollments();
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router("/login");
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>

      {enrollments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No courses enrolled yet.</p>
          <Link to="/">
            <Button>Browse Mentors</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="rounded-2xl p-6 relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-600"
            >
              <div className="absolute top-4 right-4">
                <StatusPill status={enrollment.paymentStatus} />
              </div>

              <div className="size-24 rounded-full bg-white/10 mb-4">
                {enrollment.mentorProfileImageUrl ? (
                  <img
                    src={enrollment.mentorProfileImageUrl}
                    alt={enrollment.mentorName}
                    className="w-full h-full rounded-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {enrollment.mentorName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">
                  {enrollment.subjectName}
                </h2>
                <p className="text-blue-100/80">Mentor: {enrollment.mentorName}</p>
                <div className="flex items-center text-blue-100/80 text-sm mt-2">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Next Session: {new Date(enrollment.sessionAt).toLocaleDateString()}
                </div>

                {enrollment.meetingLink && enrollment.sessionStatus === "accepted" && (
                  
                    href={enrollment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white text-sm mt-2 underline"
                  >
                    <ExternalLink className="size-3" /> Join Meeting
                  </a>
                )}

                {enrollment.sessionStatus === "completed" && !enrollment.studentReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 bg-white/10 text-white border-white/30 hover:bg-white/20"
                    onClick={() => {
                      setReviewingId(enrollment.id);
                      setReviewText("");
                      setReviewRating(5);
                    }}
                  >
                    Write Review
                  </Button>
                )}

                {enrollment.studentReview && (
                  <div className="mt-2 text-xs text-blue-100/70 italic">
                    Your review: "{enrollment.studentReview}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reviewingId} onOpenChange={() => setReviewingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)}>
                    <Star
                      className={`size-6 ${
                        star <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Your Review</p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReviewingId(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submitting || !reviewText}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}