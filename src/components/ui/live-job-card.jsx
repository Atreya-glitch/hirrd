import React, { useState, useEffect } from "react";
import { Card } from "./card";
import { Button } from "./button";
import { MapPin, Briefcase, DollarSign, Calendar, ExternalLink, Heart } from "lucide-react";

const LiveJobCard = ({ job, country, onSaveToggle }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hirrd_saved_live_jobs");
    const parsed = saved ? JSON.parse(saved) : [];
    setIsSaved(parsed.some(j => j.id === job.id));
  }, [job.id]);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const saved = localStorage.getItem("hirrd_saved_live_jobs");
    let parsed = saved ? JSON.parse(saved) : [];
    
    if (isSaved) {
      parsed = parsed.filter(j => j.id !== job.id);
    } else {
      parsed.push({
        ...job,
        country
      });
    }
    
    localStorage.setItem("hirrd_saved_live_jobs", JSON.stringify(parsed));
    setIsSaved(!isSaved);
    if (onSaveToggle) {
      onSaveToggle();
    }
  };

  // Helper to format salary elegantly
  const formatSalary = (min, max, countryCode) => {
    if (!min && !max) return "Salary not disclosed";
    
    // Choose currency symbol based on country code
    let symbol = "$";
    const code = countryCode?.toLowerCase().trim();
    if (code === "gb") symbol = "£";
    else if (code === "in") symbol = "₹";
    else if (["fr", "de", "nl", "it", "es", "ie", "at", "be"].includes(code)) symbol = "€";
    
    const formatNum = (num) => {
      if (symbol === "₹") {
        if (num >= 100000) {
          return (num / 100000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "L";
        }
        if (num >= 1000) {
          return (num / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "k";
        }
      } else {
        if (num >= 1000) {
          return (num / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "k";
        }
      }
      return num.toLocaleString();
    };

    if (min && max) {
      if (min === max) return `${symbol}${formatNum(min)} / yr`;
      return `${symbol}${formatNum(min)} - ${symbol}${formatNum(max)} / yr`;
    } else if (min) {
      return `From ${symbol}${formatNum(min)} / yr`;
    } else {
      return `Up to ${symbol}${formatNum(max)} / yr`;
    }
  };

  // Helper to format relative time
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (isNaN(diffDays)) return "Recent";
      if (diffMinutes < 60) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return "Recent";
    }
  };

  return (
    <Card className="flex flex-col border border-white/10 bg-[#111114] text-white p-5 gap-3 rounded-2xl card-hover relative overflow-hidden group">
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header Info */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-lg font-bold tracking-tight text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
            {job.title}
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400 mt-0.5">
          <span className="font-semibold text-purple-400">
            {job.companyName}
          </span>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>

      {/* Contract and Salary Metadata */}
      <div className="grid grid-cols-2 gap-2 border-y border-white/5 py-2.5 my-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="capitalize">{job.contractType?.replace('-', ' ') || "Full-time"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium">{formatSalary(job.salaryMin, job.salaryMax, country)}</span>
        </div>
      </div>
      
      {/* Description Preview */}
      <div className="flex-1">
        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {job.description || "No description provided."}
        </p>
      </div>

      {/* Footer / Apply Now */}
      <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{getRelativeTime(job.created)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="w-9 h-9 p-0 bg-white/5 border-white/10 hover:bg-white/10 flex-shrink-0"
            onClick={handleToggleSave}
          >
            <Heart className={`w-4.5 h-4.5 ${isSaved ? "fill-red-500 text-red-500 border-transparent" : "text-zinc-400"}`} />
          </Button>

          <a 
            href={job.redirectUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="shrink-0"
          >
            <Button 
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/20 active:scale-95"
            >
              Apply Now
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
};

export default LiveJobCard;
