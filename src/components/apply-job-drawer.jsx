import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { supabaseClient } from "../utils/supabase";
import { applyToJob as apiApplyToJob } from "./api/apiapplications";
import { useSession } from "@clerk/clerk-react";

const schema = z.object({
  experience: z
    .number({
      required_error: "Experience is required",
      invalid_type_error: "Experience must be a number",
    })
    .min(0, { message: "Experience must be at least 0" })
    .max(50, { message: "Experience must be at most 50" }),
  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Immediately", "15 Days", "30 Days", "45 Days", "60 Days"], {
    errorMap: () => ({ message: "Please select when you can join" }),
  }),
  resume: z.any().refine(
    (file) =>
      file &&
      file.length > 0 &&
      (file[0].type === "application/pdf" ||
        file[0].type === "application/msword" ||
        file[0].type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    { message: "Only PDF or Word documents are allowed" }
  ),
});

const ApplyJobDrawer = ({ user, job, applied = false, fetchJob }) => {
  const { session } = useSession();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const token = await session?.getToken({ template: "supabase" });
      const supabase = await supabaseClient(token);

      const file = data.resume[0];
      const fileName = `resume-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("resume")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("Storage Error:", storageError);
        alert("Failed to upload resume. Make sure your resume is valid and bucket policy is correct.");
        return;
      }

      const applicationData = {
        job_id: job.id,
        candidate_id: user?.id,
        name: user?.fullName || user?.firstName || "Candidate",
        status: "applied",
        experience: data.experience,
        skills: data.skills,
        education: data.education, // notice period stored here
        resume: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resume/${storageData.path}`,
      };

      const newApp = await apiApplyToJob(token, null, applicationData);

      if (newApp) {
        alert("Applied successfully!");
        reset();
        fetchJob();
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission Error: " + (err.message || "An error occurred. Please try again."));
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          variant={job?.isOpen && !applied ? "blue" : "destructive"}
          disabled={!job?.isOpen || applied}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-emerald-600 disabled:opacity-85"
        >
          {job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#111114] border-white/10 text-white">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              Apply for {job?.title}
            </DrawerTitle>
            <DrawerDescription className="text-zinc-400">
              at {job?.companies?.name}. Please complete the questionnaire below.
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4 pb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="mb-2 block text-sm font-semibold">Years of Experience</Label>
                <Input
                  type="number"
                  placeholder="Years of Experience"
                  className="bg-white/5 border-white/10 text-white flex-1 focus-visible:ring-purple-600"
                  {...register("experience", {
                    valueAsNumber: true,
                  })}
                />
                {errors.experience && (
                  <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>
                )}
              </div>

              <div className="flex-1">
                <Label className="mb-2 block text-sm font-semibold">Skills</Label>
                <Input
                  type="text"
                  placeholder="Skills (e.g. React, Node, SQL)"
                  className="bg-white/5 border-white/10 text-white flex-1 focus-visible:ring-purple-600"
                  {...register("skills")}
                />
                {errors.skills && (
                  <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-sm font-semibold">When can you join?</Label>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    value={field.value}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    {["Immediately", "15 Days", "30 Days", "45 Days", "60 Days"].map((val) => (
                      <label key={val} className="flex items-center space-x-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all cursor-pointer">
                        <RadioGroupItem value={val} id={val.toLowerCase().replace(" ", "-")} className="border-zinc-400 text-purple-600 focus:ring-purple-600 focus:ring-offset-0" />
                        <span className="text-sm font-medium text-zinc-200">{val}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.education && (
                <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">Resume</Label>
              <Input
                type="file"
                accept=".pdf, .doc, .docx"
                className="bg-white/5 border-white/10 text-zinc-300 cursor-pointer file:bg-purple-600 file:border-none file:text-white file:px-3 file:py-1 file:rounded file:mr-3 hover:file:bg-purple-700 file:cursor-pointer"
                {...register("resume")}
              />
              {errors.resume && (
                <p className="text-red-500 text-xs mt-1">{errors.resume.message}</p>
              )}
            </div>

            <DrawerFooter className="px-0 pt-4 flex flex-col gap-2">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="w-full border-white/10 hover:bg-white/5">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ApplyJobDrawer;
