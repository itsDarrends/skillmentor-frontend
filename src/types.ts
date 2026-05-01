export interface Subject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
}

export interface Mentor {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  profession: string;
  company: string;
  experienceYears: number;
  bio: string;
  profileImageUrl: string;
  positiveReviews: number;
  totalEnrollments: number;
  isCertified: boolean;
  startYear: string;
  subjects: Subject[];
}

export interface MentorProfile {
  mentor: Mentor;
  totalStudentsTaught: number;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  subjectEnrollments: Record<number, number>;
}

export interface Review {
  studentName: string;
  review: string;
  rating: number;
  date: string;
}

export interface Enrollment {
  id: number;
  mentorName: string;
  mentorProfileImageUrl: string;
  subjectName: string;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: string;
  paymentStatus: "pending" | "accepted" | "completed" | "cancelled";
  meetingLink: string | null;
  studentReview: string | null;
  studentRating: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Stats {
  totalMentors: number;
  totalStudents: number;
  totalSubjects: number;
  totalSessions: number;
  pendingSessions: number;
  completedSessions: number;
}

export interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  learningGoals: string;
  createdAt: string;
}

export interface AdminMentor {
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

export interface AdminSubject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
  mentor: { id: number; firstName: string; lastName: string };
}

export interface AdminSession {
  id: number;
  studentName: string;
  studentEmail: string;
  mentorName: string;
  subjectName: string;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: string;
  paymentStatus: "pending" | "accepted" | "completed" | "cancelled";
  meetingLink: string | null;
}
