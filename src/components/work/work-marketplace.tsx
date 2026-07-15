"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  calculateMatchScore,
  DEMO_EMPLOYER_ID,
  DEMO_WORKER_ID,
  initialWorkDemoState,
  WORK_DEMO_STORAGE_KEY,
  type DemoJob,
  type WorkDemoState,
} from "@/lib/work-demo";

const workerSkills = ["Event service", "Guest support", "Driving"];

function statusLabel(status: DemoJob["status"]) {
  return status.replace("_", " ");
}

function statusClass(status: DemoJob["status"]) {
  if (status === "completed") return "bg-[#e5f6eb] text-[#11663b]";
  if (status === "cancelled") return "bg-[#fbe8e5] text-[#9b2c20]";
  if (status === "open") return "bg-[#e8f0f8] text-[#0b3768]";
  return "bg-[#fff3cf] text-[#765409]";
}

function formatDateTime(value: string) {
  const [date, time] = value.split("T");
  return `${date} · ${time}`;
}

export function WorkMarketplace() {
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [state, setState] = useState<WorkDemoState>(initialWorkDemoState);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Events");
  const [area, setArea] = useState("");
  const [startsAt, setStartsAt] = useState("2026-07-18T09:00");
  const [payAmount, setPayAmount] = useState("900");
  const [workersNeeded, setWorkersNeeded] = useState("1");
  const [requirements, setRequirements] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(WORK_DEMO_STORAGE_KEY);
    if (!saved) return;

    try {
      // Restoring browser-owned demo state after hydration is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(JSON.parse(saved) as WorkDemoState);
    } catch {
      localStorage.removeItem(WORK_DEMO_STORAGE_KEY);
    }
  }, []);

  function commit(update: (current: WorkDemoState) => WorkDemoState) {
    setState((current) => {
      const next = update(current);
      localStorage.setItem(WORK_DEMO_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function resetDemo() {
    localStorage.removeItem(WORK_DEMO_STORAGE_KEY);
    setState(initialWorkDemoState);
    setNotice("Demo reset to its starting state.");
  }

  function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedRequirements = requirements
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const job: DemoJob = {
      id: `job-${Date.now()}`,
      employerId: DEMO_EMPLOYER_ID,
      employerName: "Sree Convention Centre",
      title: title.trim(),
      category,
      description: description.trim(),
      city: "Hyderabad",
      area: area.trim(),
      startsAt,
      payAmount: Number(payAmount),
      payPeriod: "shift",
      workersNeeded: Number(workersNeeded),
      requirements: parsedRequirements,
      status: "open",
      applications: [],
    };

    commit((current) => ({
      jobs: [job, ...current.jobs],
      activity: [
        {
          id: `activity-${Date.now()}`,
          title: "Job published",
          detail: `${job.title} · ₹${job.payAmount} per shift`,
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setShowForm(false);
    setTitle("");
    setArea("");
    setRequirements("");
    setDescription("");
    setNotice("Job published. Switch to worker view to see it.");
  }

  function applyToJob(jobId: string) {
    commit((current) => ({
      ...current,
      jobs: current.jobs.map((job) => {
        if (job.id !== jobId) return job;
        if (job.applications.some((application) => application.workerId === DEMO_WORKER_ID)) {
          return job;
        }

        return {
          ...job,
          applications: [
            ...job.applications,
            {
              id: `application-${Date.now()}`,
              workerId: DEMO_WORKER_ID,
              workerName: "Ravi Kumar",
              skills: workerSkills,
              message: "I am available and interested in this work.",
              status: "pending",
              matchScore: calculateMatchScore(job.requirements, workerSkills),
            },
          ],
        };
      }),
      activity: [
        {
          id: `activity-${Date.now()}`,
          title: "Application sent",
          detail: current.jobs.find((job) => job.id === jobId)?.title ?? "Local job",
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setNotice("Application sent directly to the employer.");
  }

  function acceptApplication(jobId: string, applicationId: string) {
    commit((current) => ({
      ...current,
      jobs: current.jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "assigned",
              applications: job.applications.map((application) => ({
                ...application,
                status:
                  application.id === applicationId ? "accepted" : "rejected",
              })),
            }
          : job,
      ),
      activity: [
        {
          id: `activity-${Date.now()}`,
          title: "Worker assigned",
          detail: current.jobs.find((job) => job.id === jobId)?.title ?? "Local job",
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setNotice("Worker selected. The job is now assigned.");
  }

  function transitionJob(
    jobId: string,
    nextStatus: "in_progress" | "completed",
  ) {
    commit((current) => {
      const job = current.jobs.find((item) => item.id === jobId);
      return {
        ...current,
        jobs: current.jobs.map((item) =>
          item.id === jobId ? { ...item, status: nextStatus } : item,
        ),
        activity: [
          {
            id: `activity-${Date.now()}`,
            title: nextStatus === "completed" ? "Work completed" : "Work started",
            detail:
              nextStatus === "completed"
                ? `${job?.title ?? "Job"} · ₹${job?.payAmount ?? 0} recorded`
                : job?.title ?? "Local job",
            createdAt: "Just now",
          },
          ...current.activity,
        ],
      };
    });
    setNotice(
      nextStatus === "completed"
        ? "Job completed and added to activity history."
        : "Job marked as in progress.",
    );
  }

  const visibleJobs = useMemo(
    () =>
      role === "employer"
        ? state.jobs.filter((job) => job.employerId === DEMO_EMPLOYER_ID)
        : state.jobs.filter((job) => job.employerId !== DEMO_EMPLOYER_ID || job.status !== "completed"),
    [role, state.jobs],
  );

  return (
    <main className="shell min-h-[76vh] py-12 lg:py-18">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Interactive work marketplace</p>
          <h1 className="section-title">Direct local work, from post to completion.</h1>
          <p className="mt-5 text-lg leading-8 text-[#557089]">
            Switch roles to experience both sides of the same transparent
            workflow. This demo persists in your browser.
          </p>
        </div>
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-[#c9d7d1] bg-white px-5 py-3 text-sm font-bold"
          onClick={resetDemo}
          type="button"
        >
          <RefreshCw size={16} /> Reset demo
        </button>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-[#c9d7d1] bg-white p-1">
          {(["worker", "employer"] as const).map((item) => (
            <button
              className={`focus-ring rounded-full px-5 py-2.5 text-sm font-bold capitalize ${
                role === item ? "bg-[#102a43] text-white" : "text-[#557089]"
              }`}
              key={item}
              onClick={() => {
                setRole(item);
                setNotice("");
              }}
              type="button"
            >
              {item} view
            </button>
          ))}
        </div>
        <span className="text-sm text-[#557089]">
          {role === "worker" ? "Signed in as Ravi Kumar" : "Signed in as Sree Convention Centre"}
        </span>
      </div>

      {notice && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl border border-[#b9ddc5] bg-[#eef7f1] px-4 py-3 text-sm font-semibold text-[#11663b]"
        >
          {notice}
        </p>
      )}

      {role === "employer" && (
        <section className="mt-8">
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#177245] px-6 py-3.5 font-bold text-white"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            <Plus size={18} /> {showForm ? "Close form" : "Post a job"}
          </button>

          {showForm && (
            <form className="card mt-5 grid gap-5 p-6 md:grid-cols-2 md:p-8" onSubmit={createJob}>
              <label className="grid gap-2 text-sm font-bold md:col-span-2">
                Job title
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  minLength={5}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Function hall service helpers"
                  required
                  value={title}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Category
                <select
                  className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                >
                  {["Events", "Construction", "Driving", "Security", "Home services", "Agriculture"].map(
                    (item) => <option key={item}>{item}</option>,
                  )}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Area
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Madhapur"
                  required
                  value={area}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Starts
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setStartsAt(event.target.value)}
                  required
                  type="datetime-local"
                  value={startsAt}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Pay per shift (₹)
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  min={1}
                  onChange={(event) => setPayAmount(event.target.value)}
                  required
                  type="number"
                  value={payAmount}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Workers needed
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  max={100}
                  min={1}
                  onChange={(event) => setWorkersNeeded(event.target.value)}
                  required
                  type="number"
                  value={workersNeeded}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Skills, separated by commas
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setRequirements(event.target.value)}
                  placeholder="Event service, Guest support"
                  value={requirements}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold md:col-span-2">
                Description
                <textarea
                  className="min-h-28 rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  minLength={10}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  value={description}
                />
              </label>
              <button
                className="focus-ring rounded-full bg-[#177245] px-6 py-3.5 font-bold text-white md:col-span-2"
                type="submit"
              >
                Publish job
              </button>
            </form>
          )}
        </section>
      )}

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="grid content-start gap-5">
          {visibleJobs.map((job) => {
            const ownApplication = job.applications.find(
              (application) => application.workerId === DEMO_WORKER_ID,
            );
            return (
              <article className="card p-6 md:p-7" key={job.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#177245]">
                        {job.category}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(job.status)}`}>
                        {statusLabel(job.status)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">{job.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-[#557089]">{job.employerName}</p>
                  </div>
                  <div className="rounded-xl bg-[#eef7f1] px-4 py-3 text-right">
                    <p className="flex items-center font-extrabold text-[#11663b]">
                      <IndianRupee size={16} /> {job.payAmount}
                    </p>
                    <p className="text-xs text-[#557089]">per {job.payPeriod}</p>
                  </div>
                </div>

                <p className="mt-5 leading-7 text-[#557089]">{job.description}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#557089]">
                  <span className="inline-flex items-center gap-2"><MapPin size={16} /> {job.area}, {job.city}</span>
                  <span className="inline-flex items-center gap-2"><Clock3 size={16} /> {formatDateTime(job.startsAt)}</span>
                  <span className="inline-flex items-center gap-2"><Users size={16} /> {job.workersNeeded} needed</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.requirements.map((requirement) => (
                    <span className="rounded-full border border-[#dce5e1] px-3 py-1 text-xs font-semibold" key={requirement}>
                      {requirement}
                    </span>
                  ))}
                </div>

                {role === "worker" && job.status === "open" && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      className="focus-ring rounded-full bg-[#177245] px-5 py-3 text-sm font-bold text-white disabled:bg-[#8da69a]"
                      disabled={Boolean(ownApplication)}
                      onClick={() => applyToJob(job.id)}
                      type="button"
                    >
                      {ownApplication ? "Application sent" : "Apply directly"}
                    </button>
                    {ownApplication && (
                      <span className="text-sm font-bold text-[#177245]">
                        {ownApplication.matchScore}% transparent match
                      </span>
                    )}
                  </div>
                )}

                {role === "worker" && ownApplication?.status === "accepted" && (
                  <p className="mt-6 rounded-xl bg-[#eef7f1] px-4 py-3 text-sm font-bold text-[#11663b]">
                    You were selected for this job.
                  </p>
                )}

                {role === "employer" && (
                  <div className="mt-7 border-t border-[#dce5e1] pt-6">
                    <h3 className="font-bold">Applications ({job.applications.length})</h3>
                    {job.applications.length === 0 ? (
                      <p className="mt-3 text-sm text-[#557089]">No applications yet.</p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {job.applications.map((application) => (
                          <div className="rounded-xl border border-[#dce5e1] p-4" key={application.id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-bold">{application.workerName}</p>
                                <p className="mt-1 text-sm text-[#557089]">{application.message}</p>
                              </div>
                              <span className="rounded-full bg-[#e8f0f8] px-3 py-1 text-xs font-bold text-[#0b3768]">
                                {application.matchScore}% match
                              </span>
                            </div>
                            {application.status === "pending" && job.status === "open" ? (
                              <button
                                className="focus-ring mt-4 rounded-full bg-[#102a43] px-4 py-2 text-sm font-bold text-white"
                                onClick={() => acceptApplication(job.id, application.id)}
                                type="button"
                              >
                                Select worker
                              </button>
                            ) : (
                              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#177245]">
                                {application.status}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {job.status === "assigned" && (
                      <button
                        className="focus-ring mt-5 rounded-full bg-[#177245] px-5 py-3 text-sm font-bold text-white"
                        onClick={() => transitionJob(job.id, "in_progress")}
                        type="button"
                      >
                        Start work
                      </button>
                    )}
                    {job.status === "in_progress" && (
                      <button
                        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#177245] px-5 py-3 text-sm font-bold text-white"
                        onClick={() => transitionJob(job.id, "completed")}
                        type="button"
                      >
                        <CheckCircle2 size={17} /> Mark complete
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="card h-fit p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#eef7f1] text-[#177245]">
              <BriefcaseBusiness size={19} />
            </span>
            <h2 className="font-bold">Activity</h2>
          </div>
          <div className="mt-5 grid gap-5">
            {state.activity.slice(0, 6).map((item) => (
              <div className="border-l-2 border-[#b9ddc5] pl-4" key={item.id}>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#557089]">{item.detail}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#8295a5]">
                  {item.createdAt}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
