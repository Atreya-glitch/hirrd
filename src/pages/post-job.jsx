import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useSession } from "@clerk/clerk-react";
import useFetch from "../hooks/use-fetch";
import { getCompanies } from "../components/api/apicompanies";
import { addNewJob } from "../components/api/apijobs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { PlusCircle, Building, MapPin, CheckCircle2 } from "lucide-react";
import { BarLoader } from "react-spinners";

const LOCATIONS = [
  "Bangalore, KA",
  "Hyderabad, TG",
  "Gurugram, HR",
  "Mumbai, MH",
  "Pune, MH",
  "Chennai, TN",
  "Noida, UP",
  "Delhi, DL",
  "Kolkata, WB",
  "Ahmedabad, GJ",
];

const PostJob = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const navigate = useNavigate();

  // Fetch companies from Supabase
  const { fn: fetchCompanies, data: companiesData } = useFetch(getCompanies);
  const { fn: fnCreateJob, loading: submitting, error: createError } = useFetch(addNewJob);

  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sessionLoaded) {
      fetchCompanies();
    }
  }, [sessionLoaded]);

  if (!isLoaded || !sessionLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color={"#9333ea"} />;
  }

  const companies = companiesData || [];
  const user = clerkUser
    ? {
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        role: clerkUser.unsafeMetadata?.role || "candidate",
      }
    : null;

  if (user?.role !== "recruiter") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
          <PlusCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Recruiter Access Only</h1>
        <p className="text-muted-foreground text-sm mb-6">
          You need to be in Recruiter Mode to post job listings. Switch your
          role from the top-right dropdown.
        </p>
        <Button onClick={() => navigate("/jobs")} className="bg-purple-600 hover:bg-purple-700 text-white">
          Browse Jobs Instead
        </Button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Job title is required";
    if (!companyId) e.companyId = "Please select a company";
    if (!location) e.location = "Please select a location";
    if (!description.trim()) e.description = "Job description is required";
    if (!requirements.trim()) e.requirements = "Requirements are required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await fnCreateJob({
        title: title.trim(),
        company_id: Number(companyId),
        location,
        description: description.trim(),
        requirements: requirements.trim(),
        recruiter_id: clerkUser.id,
        isOpen: true
      });

      setSuccess(true);
      setTimeout(() => navigate("/my-jobs"), 1800);
    } catch (err) {
      console.error("Failed to post job:", err);
      alert("Error posting job: " + (err.message || "Please try again."));
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 animate-bounce">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Job Posted!</h1>
        <p className="text-muted-foreground text-sm">
          Redirecting you to My Jobs…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Post a Job</h1>
        <p className="text-muted-foreground text-sm">
          Fill in the details below to publish your listing on Hirrd.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Job Title */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Basic Info
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Job Title *
            </label>
            <Input
              placeholder="e.g. Senior Frontend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10"
            />
            {errors.title && (
              <span className="text-xs text-red-400">{errors.title}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Building className="size-3.5" /> Company *
              </label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <span className="text-xs text-red-400">{errors.companyId}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Location *
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <span className="text-xs text-red-400">{errors.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Role Details
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Job Description *
            </label>
            <Textarea
              rows={6}
              placeholder="Describe the role, responsibilities, team, and what success looks like…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 resize-none"
            />
            {errors.description && (
              <span className="text-xs text-red-400">{errors.description}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Requirements & Qualifications *
            </label>
            <Textarea
              rows={5}
              placeholder="List must-have skills, years of experience, education…"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="bg-white/5 border-white/10 resize-none"
            />
            {errors.requirements && (
              <span className="text-xs text-red-400">{errors.requirements}</span>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-semibold shadow-lg shadow-purple-600/20"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Publishing…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <PlusCircle className="size-4" />
              Publish Job Listing
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default PostJob;