// api/live-jobs.js
// This file is a Vercel Serverless Function to handle /api/live-jobs in production

const MOCK_JOBS = [
  {
    id: "mock-1",
    title: "Senior React Developer (Demo)",
    companyName: "Razorpay",
    location: "Bengaluru, Karnataka",
    description: "Looking for an expert React developer with deep understanding of hooks, performance optimization, and custom component design. You will build and scale our merchant payment dashboard dashboards.",
    salaryMin: 1800000,
    salaryMax: 2600000,
    redirectUrl: "https://example.com/apply/react-dev",
    created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    contractType: "full-time"
  },
  {
    id: "mock-2",
    title: "Full Stack Engineer (Demo)",
    companyName: "Swiggy",
    location: "Bengaluru, Karnataka (Hybrid)",
    description: "Join our core engineering platform team. Tech stack includes React, Node.js, Express, Go, and DynamoDB. Experience with high-traffic APIs and real-time trackers is highly valued.",
    salaryMin: 1500000,
    salaryMax: 2200000,
    redirectUrl: "https://example.com/apply/fullstack",
    created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    contractType: "full-time"
  },
  {
    id: "mock-3",
    title: "UI/UX Designer (Demo)",
    companyName: "Paytm",
    location: "Noida, Uttar Pradesh",
    description: "We are seeking a talented UI/UX Designer who can design frictionless checkout flows and simple, intuitive layouts for a variety of payment options. Figma expertise is required.",
    salaryMin: 900000,
    salaryMax: 1400000,
    redirectUrl: "https://example.com/apply/ui-ux",
    created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    contractType: "contract"
  },
  {
    id: "mock-4",
    title: "Backend Engineer - Node.js (Demo)",
    companyName: "Zomato",
    location: "Gurugram, Haryana",
    description: "Help us build robust and scalable API services for our ordering and delivery infrastructure. Strong skills in Node.js microservices, Redis caching, and PostgreSQL required.",
    salaryMin: 2000000,
    salaryMax: 3000000,
    redirectUrl: "https://example.com/apply/backend-node",
    created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    contractType: "full-time"
  },
  {
    id: "mock-5",
    title: "DevOps Engineer (Demo)",
    companyName: "Tata Consultancy Services (TCS)",
    location: "Pune, Maharashtra",
    description: "Automate and manage build deployments, CI/CD pipelines, and cloud health monitoring. Experience with Kubernetes, Docker, Jenkins, and AWS/Azure cloud security is essential.",
    salaryMin: 800000,
    salaryMax: 1300000,
    redirectUrl: "https://example.com/apply/devops",
    created: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    contractType: "full-time"
  },
  {
    id: "mock-6",
    title: "React Native Mobile Developer (Demo)",
    companyName: "Flipkart",
    location: "Bengaluru, Karnataka",
    description: "Work on Flipkart's mobile platform features. You'll build responsive interfaces, manage application state, integrate Native APIs, and optimize app bundle sizes.",
    salaryMin: 1600000,
    salaryMax: 2400000,
    redirectUrl: "https://example.com/apply/mobile-react",
    created: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    contractType: "full-time"
  }
];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Retrieve query params from request
  const {
    what = '',
    where = '',
    country = 'us',
    page = 1,
    full_time,
    part_time,
    contract
  } = req.query;

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const isDemoMode = !appId || !appKey;

  if (isDemoMode) {
    let results = [...MOCK_JOBS];
    
    if (what) {
      const query = what.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(query) || 
        job.description.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query)
      );
    }
    
    if (where) {
      const loc = where.toLowerCase();
      results = results.filter(job => job.location.toLowerCase().includes(loc));
    }

    if (full_time === '1') {
      results = results.filter(job => job.contractType === 'full-time');
    }
    if (contract === '1') {
      results = results.filter(job => job.contractType === 'contract' || job.contractType === 'part-time');
    }

    return res.status(200).json({
      isDemo: true,
      totalCount: results.length,
      results: results
    });
  }

  // Call Adzuna API
  const formattedCountry = country.toLowerCase().trim();
  const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${formattedCountry}/search/${page}`;

  const queryParams = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '12',
  });

  if (what) queryParams.append('what', what);
  if (where) queryParams.append('where', where);
  if (full_time === '1') queryParams.append('full_time', '1');
  if (part_time === '1') queryParams.append('part_time', '1');
  if (contract === '1') queryParams.append('contract', '1');

  try {
    const response = await fetch(`${adzunaUrl}?${queryParams.toString()}`);
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Adzuna API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();

    if (!data.results) {
      throw new Error('Adzuna API response format invalid: "results" field missing.');
    }

    const mappedJobs = data.results.map(job => ({
      id: job.id || Math.random().toString(36).substr(2, 9),
      title: job.title ? job.title.replace(/<\/?[^>]+(>|$)/g, "") : "Untitled Job",
      companyName: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || (job.location?.area ? job.location.area.reverse().join(', ') : "Various Locations"),
      description: job.description ? job.description.replace(/<\/?[^>]+(>|$)/g, "") : "",
      salaryMin: job.salary_min || null,
      salaryMax: job.salary_max || null,
      redirectUrl: job.redirect_url || "#",
      created: job.created || new Date().toISOString(),
      contractType: job.contract_type || (job.contract_time ? job.contract_time.replace('_', '-') : null)
    }));

    return res.status(200).json({
      isDemo: false,
      totalCount: data.count || mappedJobs.length,
      results: mappedJobs
    });
  } catch (error) {
    console.error('[Vercel Serverless Function Error]:', error.message);
    
    return res.status(200).json({
      isDemo: true,
      errorOccurred: true,
      errorMsg: error.message,
      totalCount: MOCK_JOBS.length,
      results: MOCK_JOBS
    });
  }
}
