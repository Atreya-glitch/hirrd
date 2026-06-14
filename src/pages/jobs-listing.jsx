import React, { useState, useEffect } from "react";
import { useSession, useUser } from "@clerk/clerk-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Building, RotateCcw } from "lucide-react";
import useFetch from "../hooks/use-fetch";
import { getJobs } from "../components/api/apijobs";
import { getCompanies } from "../components/api/apicompanies";
import { BarLoader } from "react-spinners";
import JobCard from "../components/ui/job-card";

const JobsListing = () => {
  const { user: clerkRawUser } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [companyId, setCompanyId] = useState("all");

  // Fetch jobs
  const { fn: fetchJobs, data: datajobs, loading: isLoading } = useFetch(getJobs, {
    location: location === "all" ? "" : location,
    company_id: companyId === "all" ? "" : companyId,
    search: search
  });

  // Fetch companies
  const { fn: fetchCompanies, data: companiesData } = useFetch(getCompanies);

  useEffect(() => {
    if (sessionLoaded) {
      fetchJobs();
      fetchCompanies();
    }
  }, [sessionLoaded, location, companyId, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSearch("");
    setLocation("all");
    setCompanyId("all");
  };

  const filteredJobs = datajobs || [];
  const companies = companiesData || [];

  // Extract unique locations from jobs dynamically
  const locations = datajobs ? Array.from(new Set(datajobs.map(j => j.location))) : [];

  const hasActiveFilters = search || location !== "all" || companyId !== "all";

  return (
    <div className="jobs-page pb-16 text-white max-w-5xl mx-auto px-4">
      <div className="jobs-page__header text-center mb-10">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-2">Latest Jobs</h1>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
        {/* Row 1: Search input + Blue Search Button */}
        <div className="flex gap-3 items-center w-full">
          <div className="relative flex-1">
            <Input
              placeholder="Search Jobs by Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111114] border-white/10 h-12 text-base focus-visible:ring-purple-600 w-full"
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 text-sm rounded-lg shrink-0">
            Search
          </Button>
        </div>

        {/* Row 2: Location + Company selects + Clear Filters button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="bg-[#111114] border-white/10 h-12 text-zinc-300">
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a22] border-white/10 text-white">
              <SelectItem value="all" className="cursor-pointer">Filter by Location</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc} className="cursor-pointer">{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="bg-[#111114] border-white/10 h-12 text-zinc-300">
              <SelectValue placeholder="Filter by Company" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a22] border-white/10 text-white">
              <SelectItem value="all" className="cursor-pointer">Filter by Company</SelectItem>
              {companies.map(comp => (
                <SelectItem key={comp.id} value={comp.id.toString()} className="cursor-pointer">{comp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <button 
              type="button"
              onClick={handleResetFilters} 
              className="h-12 bg-red-800/80 hover:bg-red-700 text-white font-bold rounded-lg transition-colors border border-red-900"
            >
              Clear Filters
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </form>

      {/* Loading indicator */}
      {isLoading && (
        <BarLoader className="my-6" width={"100%"} color={'#9333ea'} />
      )}

      {/* Listings */}
      {!isLoading && (
        filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredJobs.map((job) => {
              const isSaved = job.saved?.some(s => s.user_id === clerkRawUser?.id) || false;

              return (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  savedInit={isSaved} 
                  onJobSaved={() => {
                    // Refetch list to sync saves or keep state local (faster UI response)
                  }} 
                />
              );
            })}
          </div>
        ) : (
          <div className="jobs-empty flex flex-col items-center justify-center py-20 text-center">
            <Building className="jobs-empty__icon size-12 text-zinc-600 mb-4" />
            <p className="jobs-empty__title text-xl font-bold">No matching jobs found</p>
            <p className="jobs-empty__text text-zinc-400 text-sm mt-1 max-w-sm">
              Try adjusting your filters or search terms.
            </p>
            <button onClick={handleResetFilters} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
              Reset Filters
            </button>
          </div>
        )
      )}

      <style>{`
        .jobs-page__title {
          letter-spacing: -0.3px;
        }
      `}</style>
    </div>
  );
};

export default JobsListing;