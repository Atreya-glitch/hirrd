// api/screen-resume.js
// Vercel Serverless Function to screen resumes and run ATS score analysis via Gemini API

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { resumeUrl } = req.body;

  if (!resumeUrl) {
    return res.status(400).json({ error: 'resumeUrl is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isDemoMode = !apiKey;

  // Attempt to parse a potential name from the resume URL for better mock data
  let parsedName = "Candidate";
  try {
    const decodedUrl = decodeURIComponent(resumeUrl);
    const filename = decodedUrl.split('/').pop() || "";
    // Match resume-timestamp-First-Last.pdf or similar
    const nameMatch = filename.match(/resume-\d+-(.+?)\.[^.]+$/i);
    if (nameMatch && nameMatch[1]) {
      parsedName = nameMatch[1].replace(/[-_]+/g, ' ');
    }
  } catch (e) {
    console.error("Error parsing name from filename:", e);
  }

  if (isDemoMode) {
    console.log("[Demo Mode] No GEMINI_API_KEY found. Serving mock ATS results.");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return res.status(200).json({
      isDemo: true,
      atsScore: 78,
      name: parsedName !== "Candidate" ? parsedName : "Atreya Sharma",
      email: parsedName !== "Candidate" ? `${parsedName.toLowerCase().replace(/\s+/g, '.')}@example.com` : "atreyasharma9@gmail.com",
      skills: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Node.js", "Express", "Git", "REST APIs"],
      experience: "2+ years of experience in building responsive frontend applications and Node.js proxy layers.",
      education: "Bachelor of Technology in Computer Science & Engineering",
      summary: "Passionate developer focused on building modern web interfaces, optimizing performance, and integrating APIs. Experienced in React ecosystem and serverless environments.",
      suggestions: [
        "Include more concrete metrics in your experience bullet points (e.g. 'improved page load times by 20%').",
        "Add a section detailing cloud platforms or database tools like Supabase and PostgreSQL.",
        "Ensure your contact details include your GitHub profile and LinkedIn URL."
      ]
    });
  }

  try {
    // 1. Fetch file from Supabase Storage
    console.log(`[Screen Resume] Downloading file from: ${resumeUrl}`);
    const fileResponse = await fetch(resumeUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch resume file. Status: ${fileResponse.status}`);
    }

    const contentType = fileResponse.headers.get('content-type') || 'application/pdf';
    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');

    // 2. Prepare Gemini payload
    const prompt = `Analyze this resume and screen it for ATS suitability. Extract the following information and return it as a JSON object:
- "name": The candidate's full name.
- "email": The candidate's email address.
- "skills": An array of technical and soft skills extracted from the resume.
- "experience": A summary of their work experience (e.g., "3 years of experience in Software Engineering...").
- "education": A summary of their educational background.
- "summary": A brief professional summary.
- "atsScore": An integer between 0 and 100 representing how well the resume is optimized for Applicant Tracking Systems (ATS), based on formatting, clarity, and presence of standard sections.
- "suggestions": An array of strings containing specific, actionable recommendations to improve the resume's ATS friendliness.

Return ONLY this JSON object.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: contentType,
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    console.log('[Screen Resume] Calling Gemini 2.5 Flash API...');
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiBody)
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      throw new Error(`Gemini API returned status ${geminiResponse.status}: ${errBody}`);
    }

    const geminiData = await geminiResponse.json();
    const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('Gemini API response did not return text content.');
    }

    console.log('[Screen Resume] AI response parsed successfully.');
    const parsedResult = JSON.parse(resultText);

    return res.status(200).json({
      isDemo: false,
      ...parsedResult
    });

  } catch (error) {
    console.error('[Vercel Serverless Function Error in Screener]:', error);
    
    // Fallback on error to simulated results
    return res.status(200).json({
      isDemo: true,
      errorOccurred: true,
      errorMsg: error.message,
      atsScore: 65,
      name: parsedName !== "Candidate" ? parsedName : "Atreya Sharma",
      email: "error@example.com",
      skills: ["HTML", "CSS", "JavaScript"],
      experience: "Experience could not be parsed automatically due to a backend error.",
      education: "N/A",
      summary: "Error parsing resume. Serving fallback details.",
      suggestions: [
        "Ensure the uploaded file is a valid PDF and not password protected.",
        "Check that your Gemini API Key is active and configured correctly.",
        "Try scanning again in a few moments."
      ]
    });
  }
}
