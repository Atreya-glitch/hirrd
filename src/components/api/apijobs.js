import { db } from '../../lib/db';
import { supabaseClient } from '../../utils/supabase';

export const getJobs = async (token, { location, search, company_id }) => {
    const supabase = await supabaseClient(token);

    let query = supabase.from("jobs").select("*, companies(name, logo_url), saved: saved_jobs(id, user_id)");

    if (location && location !== "all") {
        query = query.eq("location", location);
    }
    if (company_id && company_id !== "all") {
        query = query.eq("company_id", company_id);
    }
    if (search) {
        query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching jobs:", error);
        return null;
    }

    return data;
};

// ─── Get a single job by ID (Supabase) ───────────────────────────────────────
export const getSingleJob = async (token, { job_id }) => {
    const supabase = await supabaseClient(token);

    const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*, companies(name, logo_url), saved: saved_jobs(id, user_id)")
        .eq("id", job_id)
        .single();

    if (jobError) {
        console.error("Error fetching job details:", jobError.message);
        return null;
    }

    const { data: appData, error: appError } = await supabase
        .from("application")
        .select("*")
        .eq("job_id", job_id);

    if (appError) {
        console.error("Error fetching applications:", appError.message);
        jobData.applications = [];
    } else {
        jobData.applications = appData;
    }

    return jobData;
};

// ─── Update job open/closed status (Supabase) ────────────────────────────────
export async function updateHiringStatus(token, { job_id, isOpen }) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
        .from("jobs")
        .update({ isOpen })
        .eq("id", job_id)
        .select();

    if (error) {
        console.log(error.message);
        return null;
    }

    return data;
}

// ─── Save/Unsave Job (Supabase) ──────────────────────────────────────────────
export async function saveJob(token, { alreadySaved }, saveJobData) {
    const supabase = await supabaseClient(token);

    if (alreadySaved) {
        const { error } = await supabase
            .from("saved_jobs")
            .delete()
            .eq("job_id", saveJobData.job_id)
            .eq("user_id", saveJobData.user_id);

        if (error) {
            console.error("Error deleting saved job:", error);
            throw new Error(error.message || "Failed to delete saved job");
        }

        return true;
    } else {
        const { error } = await supabase
            .from("saved_jobs")
            .insert([saveJobData]);

        if (error) {
            console.error("Error saving job:", error);
            let tokenSub = "unknown";
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                tokenSub = payload.sub;
            } catch(e) {}
            
            throw new Error(`${error.message} | Token sub: ${tokenSub} | Passed user_id: ${saveJobData.user_id}`);
        }

        return true;
    }
}

// ─── Get Saved Jobs (Supabase) ───────────────────────────────────────────────
export async function getSavedJobs(token) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
        .from("saved_jobs")
        .select("*, job: jobs(*, companies(name, logo_url))");

    if (error) {
        console.error("Error fetching saved jobs:", error);
        return null;
    }

    return data;
}

// ─── Add new job (Supabase) ──────────────────────────────────────────────────
export async function addNewJob(token, _, jobData) {
    const supabase = await supabaseClient(token);

    // Map description to the misspelled column "describtion"
    const { description, ...rest } = jobData;
    const formattedData = {
        ...rest,
        describtion: description
    };

    const { data, error } = await supabase
        .from("jobs")
        .insert([formattedData]);

    if (error) {
        console.error("Error creating job:", error);
        throw new Error(error.message || "Failed to create job");
    }

    return data || true;
}

// ─── Get jobs posted by a specific recruiter (Supabase) ──────────────────────
export async function getRecruiterJobs(token, { recruiter_id }) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(name, logo_url), applications: application(*)")
        .eq("recruiter_id", recruiter_id);

    if (error) {
        console.error("Error fetching recruiter jobs:", error);
        return null;
    }

    return data;
}