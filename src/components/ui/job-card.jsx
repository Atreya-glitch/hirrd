import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Trash2 } from "lucide-react";
import { Button } from "./button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "./card";
import useFetch from "../../hooks/use-fetch";
import { saveJob } from "../api/apijobs";

const JobCard = ({
  job,
  isMyJob = false,
  savedInit = false,
  onJobSaved = () => {},
}) => {
  const { user } = useUser();
  const [isSaved, setIsSaved] = useState(savedInit);

  // Sync with prop changes
  useEffect(() => {
    setIsSaved(savedInit);
  }, [savedInit]);

  const { fn: fnSaveJob, loading: loadingSaveJob } = useFetch(saveJob, {
    alreadySaved: isSaved,
  });

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      // Call Supabase API
      const response = await fnSaveJob({
        user_id: user.id,
        job_id: job.id,
      });

      if (response !== null) {
        const nextSavedState = !isSaved;
        setIsSaved(nextSavedState);
        onJobSaved(nextSavedState);
      } else {
        alert("An error occurred while saving the job.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  const company = job.companies;

  return (
    <Card className="flex flex-col border border-white/10 bg-[#111114] text-white p-5 gap-3 rounded-2xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-white">{job.title}</h2>
        <div className="flex justify-between items-center text-sm text-zinc-400 mt-1">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-6 object-contain" />
          ) : (
            <span className="font-semibold text-purple-400">
              {company?.name || "Company"}
            </span>
          )}
          <div className="flex gap-1 items-center text-zinc-400">
            <MapPin className="w-4 h-4 text-zinc-500" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 mt-2">
        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {job.description || job.describtion}
        </p>
      </div>

      <div className="flex gap-3 mt-4 items-center">
        <Link to={`/jobs/${job.id}`} className="flex-1">
          <Button className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold h-11 rounded-lg border border-white/5 transition-colors">
            More Details
          </Button>
        </Link>
        {!isMyJob && (
          <Button 
            variant="outline" 
            className="w-11 h-11 p-0 flex-shrink-0 bg-[#111114] border-white/10 hover:bg-white/5" 
            onClick={handleToggleSave}
            disabled={loadingSaveJob}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500 border-transparent" : "text-zinc-400"}`} />
          </Button>
        )}
        {isMyJob && (
          <Button variant="destructive" className="w-11 h-11 p-0 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default JobCard;