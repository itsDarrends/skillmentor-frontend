import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { adminGetStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, BarChart3, Clock, CheckCircle } from "lucide-react";
import type { Stats } from "@/types";


export default function StatsPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken({ template: "skillmentor-auth" }).then(async (token) => {
      if (!token) return;
      try {
        const data = await adminGetStats(token);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const cards = stats ? [
    { label: "Total Mentors", value: stats.totalMentors, icon: Users, color: "text-blue-600" },
    { label: "Total Students", value: stats.totalStudents, icon: GraduationCap, color: "text-green-600" },
    { label: "Total Subjects", value: stats.totalSubjects, icon: BookOpen, color: "text-purple-600" },
    { label: "Total Sessions", value: stats.totalSessions, icon: BarChart3, color: "text-yellow-600" },
    { label: "Pending Sessions", value: stats.pendingSessions, icon: Clock, color: "text-orange-600" },
    { label: "Completed Sessions", value: stats.completedSessions, icon: CheckCircle, color: "text-teal-600" },
  ] : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Platform Statistics</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={`size-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}