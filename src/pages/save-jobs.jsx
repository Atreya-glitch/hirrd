import React, { useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import useFetch from "../hooks/use-fetch";
import { getSavedJobs } from "../components/api/apijobs";
import { BarLoader } from "react-spinners";
import JobCard from "../components/ui/job-card";
import { BookmarkX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const SavedJobs = () => {
  const { session, isLoaded: sessionLoaded } = useSession();

  const {
    fn: fetchSavedJobs,
    data: savedJobsData,
    loading: isLoading,
  } = useFetch(getSavedJobs);

  useEffect(() => {
    if (sessionLoaded) {
      fetchSavedJobs();
    }
  }, [sessionLoaded]);

  if (!sessionLoaded || (isLoading && !savedJobsData)) {
    return <BarLoader className="mb-4" width={"100%"} color={"#9333ea"} />;
  }

  const savedJobs = savedJobsData || [];

  return (
    <div className="flex flex-col gap-8 pb-16 text-white">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">Saved Jobs</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {savedJobs.length > 0
            ? `${savedJobs.length} saved ${savedJobs.length === 1 ? "listing" : "listings"} — apply before they close.`
            : "Your saved jobs will appear here."}
        </p>
      </div>

      {isLoading && (
        <BarLoader className="mb-4" width={"100%"} color={"#9333ea"} />
      )}

      {!isLoading && (
        savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white/3 border border-white/10 rounded-2xl p-6">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mb-6 border border-white/5">
              <BookmarkX className="size-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">No saved jobs yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs leading-relaxed">
              Browse openings and click the heart icon to save jobs for later.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6">
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((saved) => (
              <JobCard
                key={saved.id}
                job={saved.job}
                savedInit={true}
                onJobSaved={fetchSavedJobs}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SavedJobs;