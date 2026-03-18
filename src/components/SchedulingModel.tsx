import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "./ui/dialog";
import { useNavigate } from "react-router";
import type { Mentor } from "@/types";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  preSelectedSubjectId?: number;
}

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export function SchedulingModal({ isOpen, onClose, mentor, preSelectedSubjectId }: SchedulingModalProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(
    preSelectedSubjectId ?? mentor.subjects[0]?.id
  );
  const navigate = useNavigate();

  const mentorName = `${mentor.firstName} ${mentor.lastName}`;
  const selectedSubject = mentor.subjects.find(s => s.id === selectedSubjectId) ?? mentor.subjects[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSchedule = () => {
    if (!date || !selectedTime || !selectedSubject) return;

    const sessionDateTime = new Date(date);
    const [hours, minutes] = selectedTime.split(":");
    sessionDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes));

    if (sessionDateTime < new Date()) {
      alert("Please select a future date and time.");
      return;
    }

    const sessionId = `${mentor.id}-${Date.now()}`;
    const searchParams = new URLSearchParams({
      date: sessionDateTime.toISOString(),
      courseTitle: selectedSubject.subjectName,
      mentorName: mentorName,
      mentorId: String(mentor.id),
      mentorImg: mentor.profileImageUrl ?? "",
      subjectId: String(selectedSubject.id),
    });
    navigate(`/payment/${sessionId}?${searchParams.toString()}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule a session with {mentorName}</DialogTitle>
          <DialogDescription>
            Pick a subject, date and time for your mentoring session.
          </DialogDescription>
        </DialogHeader>

        {mentor.subjects.length > 1 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Select Subject</h4>
            <div className="space-y-2">
              {mentor.subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                    selectedSubjectId === subject.id
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {subject.subjectName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Choose a date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(d) => d < today}
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Choose a time</h4>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={!date || !selectedTime || !selectedSubject}>
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}