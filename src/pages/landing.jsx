import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowRight, Briefcase, PlusCircle, CheckCircle, Star, Users, Building, ShieldCheck } from "lucide-react";
import logo from "../assets/logo.png";
import heroImg from "../assets/hero.png"; 
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"; 

const LandingPage = () => {
  const companies = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" },
    { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" }
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24 relative overflow-hidden">
    
      <section className="relative flex flex-col items-center text-center pt-8 md:pt-16 max-w-4xl mx-auto">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-medium mb-6 animate-fade-in">
          <Star className="size-3 fill-purple-400 text-purple-400" />
          The Ultimate Tech Job Portal
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Find Your Dream Job <br />
          <span className="gradient-text-blue">Get Hirrd Instantly.</span>
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
          Discover thousands of curated software engineering, design, and product roles at world-class companies. Or post roles and find exceptional talent.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="bg-purple-600 text-white hover:bg-purple-700 h-12 px-8 text-base shadow-lg shadow-purple-600/20">
            <Link to="/jobs">
              Find Jobs <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/10 hover:bg-white/5 h-12 px-8 text-base">
            <Link to="/post-job">
              Post a Job <PlusCircle className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        {heroImg && (
          <div className="mt-16 w-full rounded-2xl border border-white/5 bg-[#0f0f12]/80 p-2 shadow-2xl max-w-5xl mx-auto overflow-hidden">
            <img 
              src={heroImg} 
              alt="Hirrd Platform Preview" 
              className="w-full h-auto rounded-xl border border-white/5 shadow-inner opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        )}
      </section>

      <section className="text-center relative max-w-4xl mx-auto w-full px-12">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-8">Trusted by industry leaders</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="flex items-center -ml-4 md:-ml-8">
            {companies.map((company) => (
              <CarouselItem key={company.name} className="pl-4 md:pl-8 basis-1/3 md:basis-1/4 lg:basis-1/5 flex justify-center py-4">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-10 md:h-14 object-contain filter brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="border-white/10 text-white hover:text-white" />
          <CarouselNext className="border-white/10 text-white hover:text-white" />
        </Carousel>
      </section>


      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
     
        <div className="glass-panel rounded-2xl p-8 card-hover flex flex-col justify-between group">
          <div>
            <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="size-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">For Job Seekers</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Explore openings, filter by skills, save your favorite listings, and apply with ease. Manage your applications and keep track of updates instantly.
            </p>
          </div>
          <Button asChild variant="link" className="text-purple-400 hover:text-purple-300 p-0 h-auto justify-start font-semibold">
            <Link to="/jobs" className="flex items-center gap-1">
              Start Searching <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>


        <div className="glass-panel rounded-2xl p-8 card-hover flex flex-col justify-between group">
          <div>
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <PlusCircle className="size-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">For Recruiters</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Post roles on our platform, review candidate resumes, and track recruitment progress with real-time candidate application status updates.
            </p>
          </div>
          <Button asChild variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto justify-start font-semibold">
            <Link to="/post-job" className="flex items-center gap-1">
              Post a Position <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

   
      <section className="glass-panel rounded-3xl p-8 md:p-12 max-w-5xl mx-auto w-full border border-white/5 bg-gradient-to-br from-[#121216]/50 to-[#0e0e11]/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">12k+</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Jobs</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">500+</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Top Employers</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">150k+</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Candidates</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">98%</div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold">Success Rate</div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto w-full mb-12">
        <h2 className="text-3xl font-extrabold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-white/5 rounded-xl bg-[#0f0f12]/50 px-4">
            <AccordionTrigger className="text-base py-4 hover:no-underline font-medium text-foreground">
              What is Hirrd?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4">
              Hirrd is a premium mock job board built with React, Vite, and Tailwind CSS. It is designed to simulate the real-world interactions between Job Candidates looking for positions, and Recruiters seeking talent.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-white/5 rounded-xl bg-[#0f0f12]/50 px-4">
            <AccordionTrigger className="text-base py-4 hover:no-underline font-medium text-foreground">
              How do I use candidate and recruiter roles?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4">
              You can toggle between roles anytime from the **Switch Test Account** dropdown in the top-right corner of the navbar. Switching to "Candidate Mode" lets you apply for jobs and save them. "Recruiter Mode" lets you post new jobs and manage applications.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-white/5 rounded-xl bg-[#0f0f12]/50 px-4">
            <AccordionTrigger className="text-base py-4 hover:no-underline font-medium text-foreground">
              Where is the data stored?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4">
              All data (job postings, user bookmarks, submitted applications) is persisted locally in your browser's **localStorage**. Any job you post or application you submit will remain across page refreshes!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border border-white/5 rounded-xl bg-[#0f0f12]/50 px-4">
            <AccordionTrigger className="text-base py-4 hover:no-underline font-medium text-foreground">
              Can I customize the platform theme?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4">
              Yes! The application utilizes a ThemeProvider initialized to a dark scheme, but it can adapt to system schemes and preferences. You can configure custom settings in the code settings.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default LandingPage;