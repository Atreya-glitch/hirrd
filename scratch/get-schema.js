import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function probeColumn(columnName) {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/jobs?select=${columnName}&limit=1`, { headers });
    const text = await res.text();
    console.log(`Column '${columnName}' status:`, res.status, "body:", text.slice(0, 150));
  } catch (err) {
    console.error(`Error probing '${columnName}':`, err);
  }
}

async function runProbes() {
  const columns = [
    'id', 'created_at', 'title', 'description', 'requirements', 
    'location', 'salary', 'company_id', 'recruiter_id', 'posted_by', 
    'user_id', 'isOpen', 'is_open', 'nonexistent_col'
  ];
  
  for (const col of columns) {
    await probeColumn(col);
  }
}

runProbes();
