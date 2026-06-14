const COMPANIES = [
  { id: "google", name: "Google", url: "https://google.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { id: "microsoft", name: "Microsoft", url: "https://microsoft.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { id: "meta", name: "Meta", url: "https://meta.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { id: "amazon", name: "Amazon", url: "https://amazon.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { id: "netflix", name: "Netflix", url: "https://netflix.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" }
];

const INITIAL_JOBS = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer (React)",
    companyId: "google",
    companyName: "Google",
    location: "Bangalore, KA",
    salary: "₹32,00,000 - ₹45,00,000",
    description: "We are looking for a Senior Frontend Engineer with strong React skills to join our Core Search UI team. In this role, you will design, build, and optimize customer-facing Search experiences that impact billions of users daily. You will collaborate closely with UX designers, product managers, and backend engineers to define next-generation search queries and user interaction flows. Security, speed, accessibility, and high performance are core focus areas.",
    requirements: "- 5+ years of experience with React, HTML5, CSS3, and JavaScript/TypeScript.\n- Solid understanding of web performance optimization techniques.\n- Experience working with web accessibility standards (WCAG).\n- Excellent communication and collaboration skills.",
    postedDate: "2 days ago",
    status: "Open",
    postedBy: "recruiter@google.com"
  },
  {
    id: "job-2",
    title: "Software Engineer II - Azure Systems",
    companyId: "microsoft",
    companyName: "Microsoft",
    location: "Hyderabad, TG",
    salary: "₹24,00,000 - ₹35,00,000",
    description: "Join the Azure Core Cloud infrastructure team to build next-generation distributed systems. You will work on low-latency cloud platforms, virtual networking capabilities, and massive-scale cluster controllers. If you are passionate about cloud scale, system level programming, and distributed databases, this is the perfect role for you.",
    requirements: "- 3+ years of software design and development experience in C++, C#, or Rust.\n- Strong understanding of multithreading, concurrency, and OS internals.\n- BS or MS in Computer Science or related fields.",
    postedDate: "3 days ago",
    status: "Open",
    postedBy: "recruiter@microsoft.com"
  },
  {
    id: "job-3",
    title: "Full Stack Engineer (Meta Quest)",
    companyId: "meta",
    companyName: "Meta",
    location: "Gurugram, HR",
    salary: "₹28,00,000 - ₹42,00,000",
    description: "The Quest Developer Platform team is looking for a Full Stack Developer. You will create modern web applications and SDK integration portals that enable developers worldwide to publish virtual and mixed reality experiences. You will design developer interfaces, dashboard analytics portals, and APIs powering the VR developer ecosystem.",
    requirements: "- Proficient in modern Javascript frameworks (React, NextJS) and backend systems (NodeJS, GraphQL, Python).\n- Experience with high-traffic APIs and database optimization.\n- Passion for VR/AR technologies is a plus.",
    postedDate: "5 days ago",
    status: "Open",
    postedBy: "recruiter@meta.com"
  },
  {
    id: "job-4",
    title: "Software Development Engineer (AWS S3)",
    companyId: "amazon",
    companyName: "Amazon",
    location: "Pune, MH",
    salary: "₹26,00,000 - ₹38,00,000",
    description: "Help build the future of cloud storage with the AWS Simple Storage Service (S3) team. We are looking for engineers to design and scale storage services processing millions of operations per second. You will implement distributed data replication algorithms, optimize memory allocations, and build fault-tolerant data retrieval pipelines.",
    requirements: "- 4+ years of professional development experience, preferably in Java, Go, or C++.\n- Strong CS fundamentals in algorithms, data structures, and system design.\n- Experience building highly scalable distributed databases or storage services.",
    postedDate: "1 week ago",
    status: "Open",
    postedBy: "recruiter@amazon.com"
  },
  {
    id: "job-5",
    title: "Senior Systems Engineer - Playback",
    companyId: "netflix",
    companyName: "Netflix",
    location: "Mumbai, MH",
    salary: "₹40,00,000 - ₹55,00,000",
    description: "Netflix is searching for an experienced Systems Engineer to optimize global video playback engines. Our playback platform delivers content to over 200 million members globally. You will work on streaming protocols, adaptive bitrate engines, and client-side system integrations to guarantee instant, buffer-free playback on smart TVs, mobile devices, and browsers.",
    requirements: "- 6+ years of systems development experience in C/C++, Rust, or JavaScript/WebAssembly.\n- In-depth understanding of networking protocols (HTTP, TCP, QUIC, DASH/HLS).\n- Experience with video compression formats and digital rights management (DRM) is highly beneficial.",
    postedDate: "4 days ago",
    status: "Open",
    postedBy: "recruiter@netflix.com"
  }
];

const DB_VERSION = "2"; // bump this when INITIAL_JOBS changes

export const db = {
  getJobs() {
    const storedVersion = localStorage.getItem("hirrd_db_version");
    let jobs = localStorage.getItem("hirrd_jobs");
    if (!jobs || storedVersion !== DB_VERSION) {
      jobs = JSON.stringify(INITIAL_JOBS);
      localStorage.setItem("hirrd_jobs", jobs);
      localStorage.setItem("hirrd_db_version", DB_VERSION);
    }
    return JSON.parse(jobs);
  },

  saveJobsList(jobsList) {
    localStorage.setItem("hirrd_jobs", JSON.stringify(jobsList));
  },

  getJobById(id) {
    const jobs = this.getJobs();
    return jobs.find(job => job.id === id) || null;
  },

  getCompanies() {
    return COMPANIES;
  },

  getSavedJobs() {
    const saved = localStorage.getItem("hirrd_saved_jobs");
    return saved ? JSON.parse(saved) : [];
  },

  toggleSaveJob(jobId) {
    const saved = this.getSavedJobs();
    let updated;
    if (saved.includes(jobId)) {
      updated = saved.filter(id => id !== jobId);
    } else {
      updated = [...saved, jobId];
    }
    localStorage.setItem("hirrd_saved_jobs", JSON.stringify(updated));
    return updated;
  },

  getApplicationsByJobId(jobId) {
    const apps = localStorage.getItem("hirrd_applications");
    const parsed = apps ? JSON.parse(apps) : [];
    return parsed.filter(app => app.jobId === jobId);
  },

  getAllApplications() {
    const apps = localStorage.getItem("hirrd_applications");
    return apps ? JSON.parse(apps) : [];
  },

  applyToJob(applicationData) {
    const apps = this.getAllApplications();
    const newApp = {
      ...applicationData,
      id: "app-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      status: "Applied",
      appliedAt: new Date().toISOString(),
    };
    const updated = [...apps, newApp];
    localStorage.setItem("hirrd_applications", JSON.stringify(updated));
    return newApp;
  },

  updateApplicationStatus(appId, newStatus) {
    const apps = this.getAllApplications();
    const updated = apps.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    );
    localStorage.setItem("hirrd_applications", JSON.stringify(updated));
  },

  toggleJobStatus(jobId) {
    const jobs = this.getJobs();
    let updatedJob = null;
    const updatedJobs = jobs.map(job => {
      if (job.id === jobId) {
        updatedJob = {
          ...job,
          status: job.status === "Open" ? "Closed" : "Open"
        };
        return updatedJob;
      }
      return job;
    });
    this.saveJobsList(updatedJobs);
    return updatedJob;
  },

  addJob(jobData) {
    const jobs = this.getJobs();
    const newJob = {
      ...jobData,
      id: "job-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      postedDate: "Just now",
      status: "Open"
    };
    const updatedJobs = [newJob, ...jobs];
    this.saveJobsList(updatedJobs);
    return newJob;
  }
};
