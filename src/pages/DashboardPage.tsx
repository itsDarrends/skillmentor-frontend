import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getMyEnrollments, submitReview } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import type { Enrollment } from "@/types";
import { Calendar, Clock, ExternalLink, Star } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

function ReviewForm({
  sessionId,
  onSubmitted,
}: {
  sessionId: number;
  onSubmitted: () => void;
}) {
  const { getToken } = useAuth();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      await submitReview(token, sessionId, review, rating);
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <p className="text-sm font-medium">Leave a Review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setRating(s)}>
            <Star
              className={`size-5 ${
                s <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your experience..."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={submitting || !review.trim()}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const fetchEnrollments = async () => {
    const token = await getToken({ template: "skillmentor-auth" });
    if (!token) return;
    try {
      const data = await getMyEnrollments(token);
      setEnrollments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const firstName = user?.firstName ?? "there";

  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          Here are your booked mentoring sessions.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading your sessions...</p>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground text-lg">
            You haven't booked any sessions yet.
          </p>
          <Link to="/">
            <Button>Browse Mentors</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {enrollment.mentorProfileImageUrl && (
                      <img
                        src={enrollment.mentorProfileImageUrl}
                        alt={enrollment.mentorName}
                        className="size-10 rounded-full object-cover object-top"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {enrollment.subjectName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        with {enrollment.mentorName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                      statusColors[enrollment.paymentStatus] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {enrollment.paymentStatus}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {new Date(enrollment.sessionAt).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {enrollment.durationMinutes} minutes
                  </span>
                </div>

                {enrollment.meetingLink && (
                  <a
                    href={enrollment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" />
                    Join Meeting
                  </a>
                )}

                {enrollment.paymentStatus === "pending" && (
                  <Link to={`/payment/${enrollment.id}`}>
                    <Button size="sm" variant="outline" className="mt-2">
                      Upload Payment Slip
                    </Button>
                  </Link>
                )}

                {enrollment.paymentStatus === "completed" &&
                  !enrollment.studentReview &&
                  reviewingId !== enrollment.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setReviewingId(enrollment.id)}
                    >
                      Write a Review
                    </Button>
                  )}

                {enrollment.studentReview && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Your Review
                    </p>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < (enrollment.studentRating ?? 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.studentReview}
                    </p>
                  </div>
                )}

                {reviewingId === enrollment.id && (
                  <ReviewForm
                    sessionId={enrollment.id}
                    onSubmitted={() => {
                      setReviewingId(null);
                      fetchEnrollments();
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}