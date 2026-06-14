import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser, useSession } from "@clerk/clerk-react";
import useFetch from "../hooks/use-fetch";
import { getRecruiterJobs, updateHiringStatus } from "../components/api/apijobs";
import { getApplications } from "../components/api/apiapplications";
import { Button } from "../components/ui/button";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  PlusCircle,
  ToggleLeft,
} from "lucide-react";
import { BarLoader } from "react-spinners";

const statusConfig = {
  Applied: { label: "Applied", color: "status--applied" },
  Interviewing: { label: "Interviewing", color: "status--interviewing" },
  Offered: { label: "Offered", color: "status--offered" },
  Rejected: { label: "Rejected", color: "status--rejected" },
};

const MyJobs = () => {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();

  // Recruiter jobs
  const { fn: fetchRecruiterJobs, data: postedJobsData, loading: loadingRecruiter } = useFetch(
    getRecruiterJobs,
    { recruiter_id: clerkUser?.id }
  );

  // Candidate applications
  const { fn: fetchCandidateApps, data: candidateAppsData, loading: loadingCandidate } = useFetch(
    getApplications,
    { candidate_id: clerkUser?.id }
  );

  // Update status function
  const { fn: fnUpdateStatus } = useFetch(updateHiringStatus);

  useEffect(() => {
    if (sessionLoaded && clerkUser) {
      const role = clerkUser.unsafeMetadata?.role || "candidate";
      if (role === "recruiter") {
        fetchRecruiterJobs();
      } else {
        fetchCandidateApps();
      }
    }
  }, [sessionLoaded, clerkUser]);

  const handleToggleJobStatus = async (jobId, currentIsOpen) => {
    await fnUpdateStatus({ job_id: jobId, isOpen: !currentIsOpen });
    fetchRecruiterJobs();
  };

  if (!userLoaded || !sessionLoaded || loadingRecruiter || loadingCandidate) {
    return <BarLoader className="mb-4" width={"100%"} color={"#9333ea"} />;
  }

  const postedJobs = postedJobsData || [];
  const myApplications = candidateAppsData || [];
  const role = clerkUser?.unsafeMetadata?.role || "candidate";

  // ─── Recruiter View ────────────────────────────────────────────────────────
  if (role === "recruiter") {
    return (
      <div className="flex flex-col gap-8 pb-16 text-white max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">My Postings</h1>
            <p className="text-zinc-400 text-sm">
              {postedJobs.length > 0
                ? `${postedJobs.length} active ${postedJobs.length === 1 ? "listing" : "listings"}`
                : "No listings posted yet."}
            </p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link to="/post-job" className="flex items-center gap-2">
              <PlusCircle className="size-4" /> Post New Job
            </Link>
          </Button>
        </div>

        {postedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mb-6">
              <Briefcase className="size-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">No postings yet</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs">
              You haven't posted any jobs. Create a listing to start receiving
              applications.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/post-job">Post a Job</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {postedJobs.map((job) => {
              const appsCount = job.applications?.length || 0;
              return (
                <div key={job.id} className="bg-[#111114] rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <Link to={`/jobs/${job.id}`} className="myjob__title">
                        {job.title}
                      </Link>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5 text-purple-400" /> {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3.5 text-purple-400" /> {new Date(job.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5 text-purple-400" /> {appsCount} applicant{appsCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          job.isOpen
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {job.isOpen ? "Open" : "Closed"}
                      </span>
                      <Button
                        size="sm"
                        variant={job.isOpen ? "destructive" : "outline"}
                        onClick={() => handleToggleJobStatus(job.id, job.isOpen)}
                        className={`text-xs h-7 px-3 ${
                          !job.isOpen
                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                            : ""
                        }`}
                      >
                        <ToggleLeft className="size-3.5 mr-1" />
                        {job.isOpen ? "Close" : "Re-open"}
                      </Button>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 border border-white/10 rounded-lg px-3 py-1.5 transition-colors hover:border-white/20 bg-white/5"
                      >
                        View <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Applicants summary */}
                  {appsCount > 0 && (
                    <div className="border-t border-white/5 pt-3 grid grid-cols-4 gap-3">
                      {["Applied", "Interviewing", "Offered", "Rejected"].map(
                        (s) => {
                          const count = job.applications.filter(
                            (a) => a.status?.toLowerCase() === s.toLowerCase()
                          ).length;
                          return (
                            <div
                              key={s}
                              className="text-center bg-white/5 rounded-xl py-2 px-1 border border-white/5"
                            >
                              <div className="text-base font-bold text-white">
                                {count}
                              </div>
                              <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wide">
                                {s}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Candidate View ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 pb-16 text-white max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">My Applications</h1>
        <p className="text-zinc-400 text-sm">
          {myApplications.length > 0
            ? `${myApplications.length} submitted ${myApplications.length === 1 ? "application" : "applications"}`
            : "You haven't applied to any jobs yet."}
        </p>
      </div>

      {myApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mb-6">
            <Briefcase className="size-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">No applications yet</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-xs">
            Find a job you love and hit "Apply" on the job detail page to
            track your status here.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {myApplications.map((app) => {
            const capStatus = app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase() : "Applied";
            const st = statusConfig[capStatus] || statusConfig.Applied;
            return (
              <div
                key={app.id}
                className="bg-[#111114] rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-base font-bold text-white">
                      {app.job?.title || "Job Listing"}
                    </span>
                    <span className={`app-status ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-sm text-zinc-400">
                    {app.job?.companies?.name || "Company"}
                  </span>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-zinc-400">
                    {app.experience !== undefined && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-purple-400" /> {app.experience} year{app.experience !== 1 && "s"} experience
                      </span>
                    )}
                    {app.skills && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-purple-400" /> {app.skills}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5 text-purple-400" />{" "}
                      {new Date(app.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/jobs/${app.job_id}`}
                  className="shrink-0 text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 border border-white/10 rounded-lg px-3 py-2 transition-colors hover:border-white/20 bg-white/5 whitespace-nowrap"
                >
                  View Job <ChevronRight className="size-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .myjob__title {
          font-size: 16px;
          font-weight: 700;
          color: #e4e4e7;
          text-decoration: none;
          transition: color 0.12s;
        }
        .myjob__title:hover { color: #c084fc; }
        .app-status {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
          border: 1px solid transparent;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .status--applied {
          background: rgba(168,85,247,0.12);
          border-color: rgba(168,85,247,0.25);
          color: #c084fc;
        }
        .status--interviewing {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.25);
          color: #60a5fa;
        }
        .status--offered {
          background: rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.25);
          color: #34d399;
        }
        .status--rejected {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.2);
          color: #f87171;
        }
      `}</style>
    </div>
  );
};

export default MyJobs;