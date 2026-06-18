import { supabaseClient } from "../../utils/supabase";

export async function applyToJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  // Convert status to lowercase if present to match the DB enum
  const formattedData = {
    ...jobData,
    status: jobData.status ? jobData.status.toLowerCase() : undefined
  };

  const { data, error } = await supabase
    .from("application")
    .insert([formattedData]);

  if (error) {
    console.error("Error Submitting Application:", error);
    throw new Error(error.message || "Failed to submit application");
  }

  return data || true;
}

export async function updateApplicationStatus(token, { job_id, candidate_id }, status) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("application")
    .update({ status: status.toLowerCase() }) // database enum values are lowercase
    .eq("job_id", job_id)
    .eq("candidate_id", candidate_id)
    .select();

  if (error || data.length === 0) {
    console.error("Error Updating Application Status:", error);
    return null;
  }

  return data;
}

// ─── Get candidate applications (Supabase) ───────────────────────────────────
export async function getApplications(token, { candidate_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("application")
    .select("*, job: jobs(*, companies(name, logo_url))")
    .eq("candidate_id", candidate_id);

  if (error) {
    console.error("Error fetching applications:", error);
    return null;
  }

  // Map misspelled describtion to description on nested job & Filter out target job
  return data ? data
    .filter(item => !item.job || (item.job.describtion !== 'abc' && item.job.description !== 'abc' && item.job.title?.toLowerCase() !== 'software enginner'))
    .map(item => {
      if (item.job) {
        item.job.description = item.job.description || item.job.describtion;
      }
      return item;
    }) : null;
}
