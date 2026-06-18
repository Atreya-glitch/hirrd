import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function deleteAbcJob() {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    // 1. Fetch all jobs to inspect
    const fetchRes = await fetch(`${supabaseUrl}/rest/v1/jobs?select=*`, { headers });
    if (!fetchRes.ok) {
      console.error("Failed to fetch jobs:", fetchRes.status, await fetchRes.text());
      return;
    }
    const jobs = await fetchRes.json();
    console.log(`Found ${jobs.length} jobs in database.`);
    
    // Find the job where describtion is "abc"
    const abcJob = jobs.find(j => j.describtion === 'abc' || j.description === 'abc' || j.title?.toLowerCase() === 'software enginner');
    
    if (!abcJob) {
      console.log("No job with description 'abc' or title 'software enginner' found.");
      return;
    }
    
    console.log("Found target job to delete:", abcJob);

    // 2. Delete the job
    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${abcJob.id}`, {
      method: 'DELETE',
      headers
    });
    
    if (deleteRes.ok) {
      console.log(`Successfully deleted job with ID ${abcJob.id}`);
    } else {
      console.error(`Failed to delete job:`, deleteRes.status, await deleteRes.text());
    }
  } catch (err) {
    console.error("Error running script:", err);
  }
}

deleteAbcJob();
