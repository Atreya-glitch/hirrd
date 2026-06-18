import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useSession } from "@clerk/clerk-react";
import { Button } from "../components/ui/button";
import ApplyJobDrawer from "../components/apply-job-drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { MapPin, Briefcase, DoorOpen, DoorClosed, Heart, Loader2 } from "lucide-react";
import { getSingleJob, updateHiringStatus, saveJob } from "../components/api/apijobs";
import ApplicationCard from "../components/application-card";
import useFetch from "../hooks/use-fetch";
import { BarLoader } from "react-spinners";

const JobPage = () => {
  const { id } = useParams();
  const { isLoaded: userLoaded, user: clerkRawUser } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const navigate = useNavigate();

  const user = clerkRawUser ? {
    id: clerkRawUser.id,
    name: clerkRawUser.fullName || clerkRawUser.username || "User",
    email: clerkRawUser.primaryEmailAddress?.emailAddress || "",
    role: clerkRawUser.unsafeMetadata?.role || "candidate"
  } : null;

  // Fetch single job
  const { fn: fetchJob, data: job, loading: loadingJob } = useFetch(getSingleJob, { job_id: id });

  // Update hiring status
  const { fn: fnUpdateStatus, loading: loadingUpdateStatus } = useFetch(updateHiringStatus);

  // Save/Unsave job
  const [isSaved, setIsSaved] = useState(false);
  const { fn: fnSaveJob, loading: loadingSaveJob } = useFetch(saveJob, { alreadySaved: isSaved });

  useEffect(() => {
    if (sessionLoaded) {
      fetchJob();
    }
  }, [sessionLoaded, id]);

  useEffect(() => {
    if (job && clerkRawUser) {
      const savedState = job.saved?.some(s => s.user_id === clerkRawUser.id) || false;
      setIsSaved(savedState);
    }
  }, [job, clerkRawUser]);

  const handleToggleSave = async () => {
    if (!clerkRawUser) return;
    
    try {
      const response = await fnSaveJob({
        user_id: clerkRawUser.id,
        job_id: id
      });

      if (response !== null) {
        setIsSaved(!isSaved);
      } else {
        alert("An error occurred while saving the job.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  const handleStatusChange = async (value) => {
    const isOpen = value === "open";
    await fnUpdateStatus({ job_id: id, isOpen });
    // Refetch to get updated status
    fetchJob();
  };

  if (!sessionLoaded || !userLoaded || loadingJob) {
    return <BarLoader className="mb-4" width={"100%"} color={"#9333ea"} />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <Button onClick={() => navigate("/live-jobs")} className="bg-purple-600 hover:bg-purple-700 text-white">
          Back to Live Jobs
        </Button>
      </div>
    );
  }

  const company = job.companies;
  const applications = job.applications || [];
  const userApplied = applications.some(app => app.candidate_id === clerkRawUser?.id);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 mt-2 pb-20 text-white">
    
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-start">
        <div className="flex-1">
          <h1 className="font-extrabold pb-2 text-3xl sm:text-5xl text-white tracking-tight">{job?.title}</h1>
          <p className="text-purple-400 font-semibold text-base sm:text-lg">{company?.name}</p>
        </div>
        {company?.logo_url ? (
          <img src={company.logo_url} className="h-16 object-contain rounded-xl bg-white/5 border border-white/10 p-2.5" alt={company?.name} />
        ) : (
          <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-bold text-2xl text-purple-400">
            {(company?.name || job?.title).charAt(0)}
          </div>
        )}
      </div>

      {/* Info Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex gap-3 items-center text-zinc-300">
          <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
            <MapPin className="size-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Location</p>
            <span className="font-semibold text-sm sm:text-base text-zinc-200">{job?.location}</span>
          </div>
        </div>
        <div className="flex gap-3 items-center text-zinc-300">
          <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
            <Briefcase className="size-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Applicants</p>
            <span className="font-semibold text-sm sm:text-base text-zinc-200">{applications?.length} Candidate{applications?.length !== 1 && "s"}</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
            {job?.isOpen ? <DoorOpen className="size-5 text-emerald-400" /> : <DoorClosed className="size-5 text-red-400" />}
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</p>
            {job?.isOpen ? (
              <span className="font-semibold text-sm sm:text-base text-emerald-400">Open</span>
            ) : (
              <span className="font-semibold text-sm sm:text-base text-red-400">Closed</span>
            )}
          </div>
        </div>
      </div>

    
      {user?.role === "recruiter" && (
        <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <label className="text-sm font-semibold text-zinc-300 mb-1">Manage Hiring Status</label>
          <Select 
            value={job?.isOpen ? "open" : "closed"} 
            onValueChange={handleStatusChange}
            disabled={loadingUpdateStatus}
          >
            <SelectTrigger className={`w-full max-w-[200px] text-sm font-semibold h-10 ${job?.isOpen ? "bg-emerald-950 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900" : "bg-red-950 text-red-400 border-red-500/30 hover:bg-red-900"}`}>
              {loadingUpdateStatus ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="animate-spin size-4" /> Updating...
                </div>
              ) : (
                <SelectValue placeholder="Select Status" />
              )}
            </SelectTrigger>
            <SelectContent className="bg-[#111114] border-white/10 text-white">
              <SelectItem value="open" className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer">Open</SelectItem>
              <SelectItem value="closed" className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

 
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">About the job</h2>
        <p className="sm:text-lg text-zinc-300 leading-relaxed">{job?.description}</p>
      </div>

      
      {job?.requirements && (
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">What we are looking for</h2>
          <ul className="flex flex-col gap-3">
            {job.requirements
              .split("\n")
              .map(req => req.trim())
              .filter(req => req.length > 0)
              .map((req, i) => (
                <li key={i} className="flex gap-3 items-start text-zinc-300 sm:text-lg">
                  <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-purple-500" />
                  {req}
                </li>
              ))}
          </ul>
        </div>
      )}
      {user?.role !== "recruiter" && (
        <div className="flex gap-4 items-center mt-2">
          <div className="flex-1">
            <ApplyJobDrawer 
              job={job} 
              user={clerkRawUser} 
              applied={userApplied} 
              fetchJob={fetchJob} 
            />
          </div>
          <Button 
            variant="outline" 
            className="w-12 h-12 p-0 bg-white/5 border-white/10 hover:bg-white/10 flex-shrink-0"
            onClick={handleToggleSave}
            disabled={loadingSaveJob}
          >
            <Heart className={`size-6 ${isSaved ? "fill-red-500 text-red-500 border-transparent" : "text-zinc-400"}`} />
          </Button>
        </div>
      )}

 
      {user?.role === "recruiter" && (
        <div className="mt-8 border-t border-white/10 pt-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Applications ({applications.length})</h2>
          {applications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map(app => (
                <ApplicationCard 
                  key={app.id} 
                  application={app} 
                  onStatusChange={fetchJob} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <p className="text-zinc-400 text-sm md:text-base">No applications yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobPage;