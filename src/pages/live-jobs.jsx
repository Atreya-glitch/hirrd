import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, MapPin, Globe, Filter, RefreshCw, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { BarLoader } from "react-spinners";
import LiveJobCard from "../components/ui/live-job-card";

const COUNTRY_OPTIONS = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "in", name: "India" },
  { code: "fr", name: "France" },
  { code: "de", name: "Germany" }
];

const LiveJobs = () => {
  // Input fields state
  const [keywordInput, setKeywordInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  
  // Search parameters applied state
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("in");
  const [jobType, setJobType] = useState("all");
  const [page, setPage] = useState(1);

  // API response state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Fetch live jobs from proxy server
  const fetchLiveJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        what: search,
        where: location,
        country: country,
        page: page
      });

      if (jobType === "full_time") {
        queryParams.append("full_time", "1");
      } else if (jobType === "contract") {
        queryParams.append("contract", "1"); // in proxy maps to contract/part-time
      }

      const response = await fetch(`/api/live-jobs?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.results || []);
      setIsDemoMode(!!data.isDemo);
    } catch (err) {
      console.error("Fetch Live Jobs Error:", err);
      setError(
        "Could not load live jobs. Please check that the backend proxy server is running on port 5000 and has connectivity."
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when applied search params or page changes
  useEffect(() => {
    fetchLiveJobs();
  }, [search, location, country, jobType, page]);

  // Handle Search Form Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    setSearch(keywordInput);
    setLocation(locationInput);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setKeywordInput("");
    setLocationInput("");
    setSearch("");
    setLocation("");
    setCountry("in");
    setJobType("all");
    setPage(1);
  };

  // Page navigation
  const handleNextPage = () => {
    setPage(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="live-jobs-page pb-16 text-white max-w-5xl mx-auto px-4 relative">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-3">
          <span className="gradient-text-blue">Live Jobs</span>
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mx-auto">
          Explore and apply to thousands of live, external career opportunities fetched in real-time.
        </p>
      </div>

      {/* Demo Alert Banner */}
      {isDemoMode && (
        <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex gap-3 items-start max-w-3xl mx-auto shadow-lg shadow-amber-950/5">
          <AlertTriangle className="text-amber-400 size-5 shrink-0 mt-0.5" />
          <div className="text-left">
            <h4 className="text-amber-400 font-bold text-sm">Demo Mode Active</h4>
            <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
              No Adzuna API credentials (`ADZUNA_APP_ID` and `ADZUNA_APP_KEY`) were detected in the backend `.env` file. 
              The application is serving curated mock results. Update your `.env` variables to connect to live job streams.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter Panel */}
      <form onSubmit={handleSearchSubmit} className="glass-panel grey p-5 rounded-2xl mb-8 flex flex-col gap-4 border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keywords search */}
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-3.5 size-4.5 text-zinc-500" />
            <Input
              placeholder="Keywords, skills, or job title..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="bg-[#111114] border-white/10 h-12 pl-10 pr-4 text-sm focus-visible:ring-purple-600 w-full rounded-xl"
            />
          </div>

          {/* Location search */}
          <div className="flex-1 relative flex items-center">
            <MapPin className="absolute left-3.5 size-4.5 text-zinc-500" />
            <Input
              placeholder="City, state, or postal code..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="bg-[#111114] border-white/10 h-12 pl-10 pr-4 text-sm focus-visible:ring-purple-600 w-full rounded-xl"
            />
          </div>

          {/* Search Button */}
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-purple-950/20 transition-all active:scale-98 md:w-auto w-full"
          >
            Find Jobs
          </Button>
        </div>

        {/* Second row filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
          {/* Country Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider pl-1">Country</label>
            <Select value={country} onValueChange={(val) => { setPage(1); setCountry(val); }}>
              <SelectTrigger className="bg-[#111114] border-white/10 h-11 text-zinc-300 rounded-xl">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-zinc-500" />
                  <SelectValue placeholder="Select Country" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a22] border-white/10 text-white rounded-xl">
                {COUNTRY_OPTIONS.map(c => (
                  <SelectItem key={c.code} value={c.code} className="cursor-pointer">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Type Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider pl-1">Job Type</label>
            <Select value={jobType} onValueChange={(val) => { setPage(1); setJobType(val); }}>
              <SelectTrigger className="bg-[#111114] border-white/10 h-11 text-zinc-300 rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-zinc-500" />
                  <SelectValue placeholder="All Contract Types" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a22] border-white/10 text-white rounded-xl">
                <SelectItem value="all" className="cursor-pointer">All Job Types</SelectItem>
                <SelectItem value="full_time" className="cursor-pointer">Full-Time</SelectItem>
                <SelectItem value="contract" className="cursor-pointer">Contract / Part-Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset button or spacer */}
          <div className="flex items-end">
            {(search || location || country !== "in" || jobType !== "all" || page !== 1) ? (
              <Button 
                type="button"
                onClick={handleResetFilters} 
                className="h-11 w-full bg-red-950/20 hover:bg-red-900/40 text-red-300 font-semibold rounded-xl border border-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-4 shrink-0" />
                Reset Filters
              </Button>
            ) : (
              <div className="hidden sm:block h-11" />
            )}
          </div>
        </div>
      </form>

      {/* Loading Progress */}
      {loading && (
        <div className="my-6">
          <BarLoader width={"100%"} color={'#9333ea'} />
          <p className="text-zinc-500 text-xs text-center mt-2 animate-pulse">Contacting Live Job Streams...</p>
        </div>
      )}

      {/* Content Area */}
      {!loading && error && (
        <div className="glass-panel grey border-red-500/20 bg-red-500/5 p-8 rounded-2xl text-center max-w-xl mx-auto my-12">
          <AlertTriangle className="text-red-400 size-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Fetch Openings</h3>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <Button 
            onClick={fetchLiveJobs} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="size-4" />
            Retry Connection
          </Button>
        </div>
      )}

      {!loading && !error && (
        jobs.length > 0 ? (
          <>
            {/* Grid listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {jobs.map((job) => (
                <LiveJobCard key={job.id} job={job} country={country} />
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-center gap-6 mt-12 pt-6 border-t border-white/5">
              <Button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="bg-[#111114] border border-white/10 hover:bg-white/5 text-white disabled:opacity-40 disabled:hover:bg-transparent rounded-xl h-10 px-4 flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
              <span className="text-sm font-semibold text-zinc-400">
                Page <span className="text-purple-400 font-bold text-base">{page}</span>
              </span>
              <Button
                onClick={handleNextPage}
                disabled={jobs.length < 12} // Adzuna outputs 12 per page
                className="bg-[#111114] border border-white/10 hover:bg-white/5 text-white disabled:opacity-40 disabled:hover:bg-transparent rounded-xl h-10 px-4 flex items-center gap-1.5 transition-all"
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel grey border-white/5 rounded-2xl max-w-xl mx-auto my-8">
            <Search className="size-12 text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Matching Vacancies Found</h3>
            <p className="text-zinc-400 text-sm mt-1 max-w-sm leading-relaxed">
              We couldn't find any live job listings matching your parameters. Try modifying your keywords, checking location spelling, or selecting another country.
            </p>
            <Button onClick={handleResetFilters} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-6 py-2.5 transition-colors">
              Reset Search Filter
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default LiveJobs;
