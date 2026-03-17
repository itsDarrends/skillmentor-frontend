import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container py-16 max-w-4xl">
      <h1 className="text-5xl font-bold mb-6">About SkillMentor</h1>
      <p className="text-xl text-muted-foreground mb-8">
        SkillMentor is an online mentoring platform that connects students with
        expert mentors for specialised subjects like AWS certifications,
        Microsoft Azure, DevOps, and more.
      </p>
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="text-2xl font-bold text-primary mb-2">150+</h3>
          <p className="text-muted-foreground">Students certified</p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="text-2xl font-bold text-primary mb-2">6+</h3>
          <p className="text-muted-foreground">Expert mentors</p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="text-2xl font-bold text-primary mb-2">98%</h3>
          <p className="text-muted-foreground">Positive reviews</p>
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
      <p className="text-muted-foreground mb-4">
        We believe everyone deserves access to world-class mentorship.
        Our platform makes it easy to find, book, and learn from industry
        experts who have real-world experience in cloud computing,
        cybersecurity, and software engineering.
      </p>
      <p className="text-muted-foreground mb-8">
        Whether you are preparing for your AWS Developer Associate exam,
        looking to break into DevOps, or want to master Microsoft Azure,
        our certified mentors are here to guide you every step of the way.
      </p>
      <h2 className="text-3xl font-bold mb-4">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-xl border bg-card">
          <div className="text-3xl font-bold text-primary mb-3">1</div>
          <h3 className="font-semibold text-lg mb-2">Browse Mentors</h3>
          <p className="text-sm text-muted-foreground">
            Explore our curated list of expert mentors and their specialisations.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <div className="text-3xl font-bold text-primary mb-3">2</div>
          <h3 className="font-semibold text-lg mb-2">Book a Session</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred date, time, and subject for your one-on-one session.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <div className="text-3xl font-bold text-primary mb-3">3</div>
          <h3 className="font-semibold text-lg mb-2">Learn & Grow</h3>
          <p className="text-sm text-muted-foreground">
            Attend your session, get personalised guidance, and track your progress.
          </p>
        </div>
      </div>
      <Link to="/">
        <Button size="lg">Find a Mentor</Button>
      </Link>
    </div>
  );
}