export type JobStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type DemoApplication = {
  id: string;
  workerId: string;
  workerName: string;
  skills: string[];
  message: string;
  status: ApplicationStatus;
  matchScore: number;
};

export type DemoJob = {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  category: string;
  description: string;
  city: string;
  area: string;
  startsAt: string;
  payAmount: number;
  payPeriod: "hour" | "shift" | "day" | "month";
  workersNeeded: number;
  requirements: string[];
  status: JobStatus;
  applications: DemoApplication[];
};

export type WorkActivity = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

export type WorkDemoState = {
  jobs: DemoJob[];
  activity: WorkActivity[];
};

export const WORK_DEMO_STORAGE_KEY = "jeevandwaar-work-demo-v1";
export const DEMO_EMPLOYER_ID = "demo-employer";
export const DEMO_WORKER_ID = "demo-worker";

export const initialWorkDemoState: WorkDemoState = {
  jobs: [
    {
      id: "job-function-hall",
      employerId: DEMO_EMPLOYER_ID,
      employerName: "Sree Convention Centre",
      title: "Function hall service helpers",
      category: "Events",
      description:
        "Help with dining setup, guest service and closing cleanup. Meal and drinking water provided.",
      city: "Hyderabad",
      area: "Madhapur",
      startsAt: "2026-07-17T11:00",
      payAmount: 900,
      payPeriod: "shift",
      workersNeeded: 6,
      requirements: ["Event service", "Guest support", "Cleaning"],
      status: "open",
      applications: [
        {
          id: "application-ravi",
          workerId: DEMO_WORKER_ID,
          workerName: "Ravi Kumar",
          skills: ["Event service", "Guest support", "Driving"],
          message: "I have three years of function-hall service experience.",
          status: "pending",
          matchScore: 92,
        },
      ],
    },
    {
      id: "job-construction",
      employerId: "other-employer",
      employerName: "Nava Telangana Builders",
      title: "Construction site helpers",
      category: "Construction",
      description:
        "Day-shift helpers for material movement and site preparation. Safety equipment is provided.",
      city: "Hyderabad",
      area: "Kondapur",
      startsAt: "2026-07-18T08:00",
      payAmount: 850,
      payPeriod: "day",
      workersNeeded: 4,
      requirements: ["Material handling", "Site safety"],
      status: "open",
      applications: [],
    },
  ],
  activity: [
    {
      id: "activity-demo-ready",
      title: "Interactive work demo ready",
      detail: "Switch roles to apply, assign, start and complete a job.",
      createdAt: "Today",
    },
  ],
};

export function calculateMatchScore(
  requirements: string[],
  workerSkills: string[],
) {
  if (requirements.length === 0) return 75;

  const normalizedSkills = new Set(
    workerSkills.map((skill) => skill.trim().toLowerCase()),
  );
  const matches = requirements.filter((requirement) =>
    normalizedSkills.has(requirement.trim().toLowerCase()),
  ).length;

  return Math.min(100, Math.round(55 + (matches / requirements.length) * 45));
}
