import React, { useState, useEffect } from "react";
import { useUser, useSession } from "@clerk/clerk-react";
import { supabaseClient } from "../utils/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  User, Mail, UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  TrendingUp, Edit3, Save, Briefcase, GraduationCap, Sparkles, 
  RefreshCw, FileDown, Check, X, ShieldAlert, Cpu
} from "lucide-react";
import { BarLoader } from "react-spinners";

const Profile = () => {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { session } = useSession();

  // Mode & Loading States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [screenProgress, setScreenProgress] = useState("");

  // Input states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Candidate Profile fields (stored in Clerk unsafeMetadata)
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [joiningNotice, setJoiningNotice] = useState("Immediately");
  
  // Recruiter Profile fields
  const [companyName, setCompanyName] = useState("");
  const [recruiterTitle, setRecruiterTitle] = useState("");

  // Load user data into states
  useEffect(() => {
    if (clerkUser) {
      setFirstName(clerkUser.firstName || "");
      setLastName(clerkUser.lastName || "");
      
      const meta = clerkUser.unsafeMetadata || {};
      setSkills(meta.skills || "");
      setExperience(meta.experience || "");
      setEducation(meta.education || "");
      setJoiningNotice(meta.joiningNotice || "Immediately");
      setCompanyName(meta.companyName || "");
      setRecruiterTitle(meta.recruiterTitle || "");
    }
  }, [clerkUser]);

  if (!userLoaded || !clerkUser) {
    return <BarLoader className="my-8" width={"100%"} color={"#9333ea"} />;
  }

  const role = clerkUser.unsafeMetadata?.role || "candidate";
  const resumeUrl = clerkUser.unsafeMetadata?.resumeUrl || null;
  const atsScore = clerkUser.unsafeMetadata?.atsScore || null;
  const suggestions = clerkUser.unsafeMetadata?.suggestions || [];
  const parsedSummary = clerkUser.unsafeMetadata?.parsedSummary || "";
  const isDemoAiscore = clerkUser.unsafeMetadata?.isDemoAiscore || false;

  // Save changes to Clerk Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Core Clerk Name
      await clerkUser.update({
        firstName,
        lastName,
      });

      // 2. Update metadata based on role
      const updatedMetadata = { ...clerkUser.unsafeMetadata };
      if (role === "candidate") {
        updatedMetadata.skills = skills;
        updatedMetadata.experience = Number(experience) || 0;
        updatedMetadata.education = education;
        updatedMetadata.joiningNotice = joiningNotice;
      } else {
        updatedMetadata.companyName = companyName;
        updatedMetadata.recruiterTitle = recruiterTitle;
      }

      await clerkUser.update({
        unsafeMetadata: updatedMetadata,
      });

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save Profile Error:", err);
      alert("Error saving profile: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Upload Resume directly to Supabase Storage Bucket
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or Word document (.doc, .docx)");
      return;
    }

    setUploading(true);
    try {
      const token = await session?.getToken({ template: "supabase" });
      const supabase = await supabaseClient(token);

      // Clean name
      const cleanFileName = file.name.replace(/\s+/g, '-');
      const uploadPath = `resume-${Date.now()}-${cleanFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("resume")
        .upload(uploadPath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (storageError) {
        throw new Error(storageError.message);
      }

      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resume/${storageData.path}`;

      // Save resume URL to Clerk metadata
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          resumeUrl: publicUrl,
        }
      });

      alert("Resume uploaded successfully! Starting AI screening analysis...");
      runAiScreening(publicUrl);
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload resume: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  // Trigger serverless AI screening analysis
  const runAiScreening = async (urlToScreen = resumeUrl) => {
    if (!urlToScreen) return;
    
    setScreening(true);
    setScreenProgress("Analyzing document layout...");
    
    try {
      // Simulate progression messages
      const progressSteps = [
        "Reading file contents...",
        "Identifying candidate skills...",
        "Evaluating work history...",
        "Calculating ATS match score...",
        "Compiling expert suggestions..."
      ];
      
      let step = 0;
      const progressInterval = setInterval(() => {
        if (step < progressSteps.length) {
          setScreenProgress(progressSteps[step]);
          step++;
        } else {
          clearInterval(progressInterval);
        }
      }, 2500);

      const response = await fetch("/api/screen-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeUrl: urlToScreen }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Screener failed with status ${response.status}`);
      }

      const screeningResult = await response.json();

      // Update Clerk metadata with parsed fields
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          atsScore: screeningResult.atsScore || 0,
          suggestions: screeningResult.suggestions || [],
          parsedSummary: screeningResult.summary || "",
          isDemoAiscore: !!screeningResult.isDemo,
          // Autofill profile fields if empty
          skills: clerkUser.unsafeMetadata?.skills || (screeningResult.skills ? screeningResult.skills.join(", ") : ""),
          education: clerkUser.unsafeMetadata?.education || screeningResult.education || "",
        }
      });

      // Reload local state fields if they were blank
      if (!skills && screeningResult.skills) setSkills(screeningResult.skills.join(", "));
      if (!education && screeningResult.education) setEducation(screeningResult.education);

      alert("AI Screening completed successfully!");
    } catch (err) {
      console.error("AI Screening Error:", err);
      alert("Screener failed: " + (err.message || err));
    } finally {
      setScreening(false);
      setScreenProgress("");
    }
  };

  // Helper for Circular ATS score badge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const scoreValue = atsScore || 0;
  const strokeDashoffset = circumference - (scoreValue / 100) * circumference;

  // Determine ATS score color scheme
  const getScoreColors = (score) => {
    if (score >= 80) return { stroke: "stroke-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (score >= 60) return { stroke: "stroke-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" };
    return { stroke: "stroke-rose-500", text: "text-rose-400", bg: "bg-rose-500/10" };
  };
  const scoreColors = getScoreColors(scoreValue);

  return (
    <div className="profile-page text-white max-w-5xl mx-auto px-4 py-8 relative">
      <div className="absolute -top-40 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Profile Title Card */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 rounded-2xl glass-panel border border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent shadow-2xl">
        <div className="size-24 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-purple-500/20 text-3xl font-extrabold shadow-lg shadow-purple-950/20">
          {clerkUser.imageUrl ? (
            <img src={clerkUser.imageUrl} alt={clerkUser.fullName} className="size-full object-cover" />
          ) : (
            clerkUser.firstName?.charAt(0) || "U"
          )}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {clerkUser.fullName || "User Profile"}
            </h1>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 ${
              role === 'recruiter' ? 'bg-blue-500/15 text-blue-400 border-blue-500/10' : 'bg-purple-500/15 text-purple-400 border-purple-500/10'
            }`}>
              {role === 'recruiter' ? 'Recruiter' : 'Candidate'}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="size-3.5" /> {clerkUser.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 rounded-xl h-10 px-5 shadow-lg shadow-purple-950/25"
            >
              <Edit3 className="size-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Details Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-[#111114] border-white/5 text-white shadow-2xl rounded-2xl">
            <CardHeader className="border-b border-white/5 py-4 px-6 flex flex-row items-center gap-2.5">
              <User className="size-5 text-purple-400" />
              <div>
                <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
                <CardDescription className="text-zinc-500 text-xs">
                  {isEditing ? "Modify your profile information below" : "View your profile details"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">First Name</Label>
                    <Input
                      disabled={!isEditing}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Last Name</Label>
                    <Input
                      disabled={!isEditing}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl h-11"
                    />
                  </div>
                </div>

                {role === "candidate" ? (
                  // CANDIDATE FIELDS
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Years of Experience</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          disabled={!isEditing}
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g. 3"
                          className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Joining Notice Period</Label>
                        <Select 
                          disabled={!isEditing}
                          value={joiningNotice} 
                          onValueChange={(val) => setJoiningNotice(val)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 disabled:opacity-60 text-zinc-300 rounded-xl h-11">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a22] border-white/10 text-white rounded-xl">
                            {["Immediately", "15 Days", "30 Days", "45 Days", "60 Days"].map(val => (
                              <SelectItem key={val} value={val} className="cursor-pointer">
                                {val}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Education / Qualifications</Label>
                      <Input
                        disabled={!isEditing}
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. Bachelor of Technology in Computer Science"
                        className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl h-11"
                      />
                    </div>

                    <div>
                      <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Skills (Comma Separated)</Label>
                      <Textarea
                        disabled={!isEditing}
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. React, Node.js, Express, Tailwind CSS, PostgreSQL"
                        rows={3}
                        className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl leading-relaxed resize-none"
                      />
                    </div>
                  </>
                ) : (
                  // RECRUITER FIELDS
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Company Name</Label>
                        <Input
                          disabled={!isEditing}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-400 font-semibold mb-1.5 block text-xs uppercase tracking-wide">Recruiter Title</Label>
                        <Input
                          disabled={!isEditing}
                          value={recruiterTitle}
                          onChange={(e) => setRecruiterTitle(e.target.value)}
                          placeholder="e.g. Talent Acquisition Lead"
                          className="bg-white/5 border-white/10 disabled:opacity-60 text-white focus-visible:ring-purple-600 rounded-xl h-11"
                        />
                      </div>
                    </div>
                  </>
                )}

                {isEditing && (
                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 rounded-xl h-10 px-5"
                    >
                      <X className="size-4 mr-1.5" /> Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving} 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 rounded-xl h-10 px-5 shadow-lg shadow-purple-950/20"
                    >
                      {saving ? (
                        <RefreshCw className="size-4 animate-spin mr-1" />
                      ) : (
                        <Save className="size-4 mr-1.5" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Resume Upload & AI ATS score Parser */}
        {role === "candidate" && (
          <div className="flex flex-col gap-6">
            
            {/* Resume Upload Box */}
            <Card className="bg-[#111114] border-white/5 text-white shadow-2xl rounded-2xl">
              <CardHeader className="border-b border-white/5 py-4 px-6 flex flex-row items-center gap-2.5">
                <FileText className="size-5 text-purple-400" />
                <div>
                  <CardTitle className="text-lg font-bold">Resume Attachment</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Upload your profile resume to apply
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {resumeUrl ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <FileText className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 truncate">Stored Resume</p>
                        <p className="text-[10px] text-zinc-500">Supabase Storage</p>
                      </div>
                      <a 
                        href={resumeUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="size-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
                        title="Download Resume"
                      >
                        <FileDown className="size-4" />
                      </a>
                    </div>
                    
                    <div>
                      <Label className="relative cursor-pointer w-full">
                        <Input 
                          type="file" 
                          accept=".pdf,.doc,.docx" 
                          onChange={handleResumeUpload} 
                          disabled={uploading || screening}
                          className="hidden" 
                        />
                        <div className="h-10 border border-dashed border-white/10 hover:border-purple-500/40 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl flex items-center justify-center text-zinc-300 text-xs font-semibold gap-2 transition-all">
                          {uploading ? (
                            <RefreshCw className="size-4 animate-spin" />
                          ) : (
                            <UploadCloud className="size-4" />
                          )}
                          Update Resume File
                        </div>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors rounded-2xl text-center">
                    <div className="size-12 rounded-full bg-purple-500/5 flex items-center justify-center text-purple-400 mb-3">
                      <UploadCloud className="size-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-200 mb-1">No Resume Uploaded</h4>
                    <p className="text-zinc-500 text-xs max-w-[200px] mb-4 leading-normal">
                      Upload a PDF or Word document to store and run AI screening.
                    </p>
                    
                    <Label className="relative cursor-pointer w-full">
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleResumeUpload} 
                        disabled={uploading}
                        className="hidden" 
                      />
                      <div className="h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center text-xs gap-2 transition-colors shadow-lg shadow-purple-950/20">
                        {uploading ? (
                          <RefreshCw className="size-4 animate-spin" />
                        ) : (
                          <UploadCloud className="size-4" />
                        )}
                        Choose File
                      </div>
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI ATS score Screener Card */}
            {resumeUrl && (
              <Card className="bg-[#111114] border-white/5 text-white shadow-2xl rounded-2xl relative overflow-hidden">
                {isDemoAiscore && (
                  <div className="absolute top-0 right-0 bg-amber-500/10 border-b border-l border-amber-500/20 px-2 py-0.5 rounded-bl-lg text-[9px] font-bold text-amber-400 flex items-center gap-1 z-10">
                    <ShieldAlert className="size-3" />
                    Mock Scan
                  </div>
                )}

                <CardHeader className="border-b border-white/5 py-4 px-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="size-5 text-purple-400" />
                    <div>
                      <CardTitle className="text-lg font-bold">AI ATS Screener</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">
                        Real-time AI resume rating
                      </CardDescription>
                    </div>
                  </div>
                  
                  {atsScore && !screening && (
                    <Button
                      variant="ghost"
                      onClick={() => runAiScreening()}
                      className="size-8 p-0 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white"
                      title="Re-run Screening"
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {screening ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <RefreshCw className="size-10 text-purple-500 animate-spin mb-4" />
                      <h4 className="text-sm font-semibold text-zinc-200">AI Screening Active</h4>
                      <p className="text-zinc-500 text-xs mt-1.5 animate-pulse max-w-[200px]">
                        {screenProgress || "Analyzing document content..."}
                      </p>
                    </div>
                  ) : atsScore !== null ? (
                    <div className="flex flex-col gap-6">
                      
                      {/* Gauge Indicator */}
                      <div className="flex items-center gap-5">
                        <div className="relative size-24 flex items-center justify-center shrink-0">
                          {/* Radial Progress Circle */}
                          <svg className="size-full transform -rotate-90">
                            <circle 
                              cx="48" 
                              cy="48" 
                              r={radius} 
                              className="stroke-white/[0.03] fill-transparent"
                              strokeWidth="8"
                            />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r={radius} 
                              className={`${scoreColors.stroke} fill-transparent transition-all duration-1000 ease-out`}
                              strokeWidth="8"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className={`text-2xl font-black ${scoreColors.text}`}>
                              {scoreValue}
                            </span>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                              ATS
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                            <Sparkles className="size-4 text-purple-400" />
                            Screening Match
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            Your resume has an estimated ATS score of <span className={`${scoreColors.text} font-bold`}>{scoreValue}%</span>.
                            {scoreValue >= 80 ? " This is highly optimized!" : scoreValue >= 60 ? " This is average. Check the recommendations below to improve." : " This needs improvement."}
                          </p>
                        </div>
                      </div>

                      {/* AI Extracted Summary */}
                      {parsedSummary && (
                        <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">AI Professional Summary</h5>
                          <p className="text-xs text-zinc-300 leading-relaxed">{parsedSummary}</p>
                        </div>
                      )}

                      {/* Suggestions list */}
                      {suggestions.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Key Recommendations</h5>
                          <div className="flex flex-col gap-2">
                            {suggestions.map((sug, i) => (
                              <div key={i} className="flex gap-2.5 items-start bg-rose-500/[0.02] border border-rose-500/10 p-2.5 rounded-xl">
                                <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                <span className="text-xs text-zinc-300 leading-normal">{sug}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Sparkles className="size-10 text-purple-500/20 mb-3" />
                      <h4 className="text-sm font-semibold text-zinc-300">Awaiting AI Screening</h4>
                      <p className="text-zinc-500 text-xs max-w-[200px] mt-1.5 leading-normal">
                        Once you upload your resume file, we will run the AI screening to test your ATS score.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
