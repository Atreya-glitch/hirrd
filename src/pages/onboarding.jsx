import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../components/ui/button";
import { Briefcase, UserPlus, ArrowRight } from "lucide-react";
import {BarLoader} from 'react-spinners'

const Onboarding = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  if(!isLoaded){
    return <BarLoader className='mb-4' width={"100%"} color={'#9333ea'} />
  }

  const handleRoleSelection = async (role) => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: { role },
      });
      if (role === "candidate") {
        navigate("/jobs");
      } else {
        navigate("/post-job");
      }
    } catch (err) {
      console.error("Error setting role metadata:", err);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 max-w-4xl mx-auto text-center relative">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Choose Your Role</h1>
      <p className="text-muted-foreground max-w-md mb-12 text-sm sm:text-base">
        Welcome to Hirrd! Tell us how you want to use the platform to customize your experience.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
       
        <div
          onClick={() => handleRoleSelection("candidate")}
          className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer card-hover flex flex-col items-center justify-between text-center group"
        >
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="size-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">I am a Candidate</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Search and apply for jobs, save listings for later, and track application feedback from top employers.
            </p>
          </div>
          <Button className="mt-8 bg-purple-600 hover:bg-purple-700 w-full flex items-center justify-center gap-2">
            Get Started <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Recruiter Mode Option */}
        <div 
          onClick={() => handleRoleSelection("recruiter")}
          className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer card-hover flex flex-col items-center justify-between text-center group"
        >
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <UserPlus className="size-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">I am a Recruiter</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Publish job listings, manage applications, and review top candidates in our interactive pipeline view.
            </p>
          </div>
          <Button className="mt-8 bg-blue-600 hover:bg-blue-700 w-full flex items-center justify-center gap-2">
            Hire Talent <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
