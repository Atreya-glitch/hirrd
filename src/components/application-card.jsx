import React from "react";
import { Mail, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { updateApplicationStatus } from "./api/apiapplications";
import { useSession } from "@clerk/clerk-react";

const ApplicationCard = ({ application, isCandidate = false, onStatusChange }) => {
  const { session } = useSession();

  const handleStatusChange = async (newStatus) => {
    try {
      const token = await session?.getToken({ template: "supabase" });
      const data = await updateApplicationStatus(token, { job_id: application.job_id, candidate_id: application.candidate_id }, newStatus);
      if (data && onStatusChange) {
        onStatusChange(data[0]);
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const downloadResume = () => {
    // Basic resume download handler, in Supabase typically a storage download url
    if (application.resumeUrl) {
      const link = document.createElement("a");
      link.href = application.resumeUrl;
      link.target = "_blank";
      link.click();
    }
  };

  return (
    <div className="border border-white/5 bg-[#121216] p-4 rounded-xl flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-foreground text-sm">{application.name || application.candidateName}</h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Mail className="size-3" /> {application.email || "Email hidden"}
          </p>
        </div>
        {application.resumeUrl && (
          <button 
            onClick={downloadResume}
            className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Download Resume"
          >
            <Download className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Experience</span>
          <span className="font-medium text-foreground">{application.experience}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Skills</span>
          <span className="font-medium text-foreground truncate block">{application.skills}</span>
        </div>
      </div>

      {application.coverLetter && (
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-semibold mb-0.5">Cover Letter</span>
          <p className="text-xs text-muted-foreground line-clamp-3 bg-white/5 p-2 rounded leading-relaxed">
            {application.coverLetter}
          </p>
        </div>
      )}

      {/* Status Dropdown / Text */}
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[10px] uppercase font-semibold">Candidate Status</span>
        {isCandidate ? (
          <span className="font-medium text-sm">{application.status}</span>
        ) : (
          <Select 
            value={application.status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 mt-1">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#121216] border-white/10">
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interviewing">Interviewing</SelectItem>
              <SelectItem value="Offered">Offered</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
