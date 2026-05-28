import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/extractText";
import { analyzeResume } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!resumeFile) {
      return NextResponse.json({ error: "No resume uploaded" }, { status: 400 });
    }

    if (!jobDescription || jobDescription.length < 100) {
      return NextResponse.json(
        { error: "Job description is missing or too short" },
        { status: 400 }
      );
    }

    if (resumeFile.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 4MB" },
        { status: 400 }
      );
    }

    let resumeText = "";
    try {
      resumeText = await extractTextFromFile(resumeFile);
    } catch (e: any) {
      console.error("Extract text error:", e);
      return NextResponse.json(
        { error: "Failed to extract text from file or unsupported file type" },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.length < 100) {
      return NextResponse.json(
        {
          error:
            "Resume appears to be image-based or empty. Please upload a text-based PDF or DOCX.",
        },
        { status: 400 }
      );
    }

    const result = await analyzeResume(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Error:", error);
    
    let friendlyMessage = "Analysis Failed: Something went wrong while checking your resume. Please try again.";
    const errorMessage = (error.message || error.statusText || JSON.stringify(error)).toString();
    
    if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("Too Many Requests")) {
      friendlyMessage = "Rate Limit Exceeded: You have made too many requests in a short time. Please wait 1 minute before trying again.";
    } else if (errorMessage.includes("400") || errorMessage.includes("token")) {
      friendlyMessage = "Content Too Long: Your resume or job description has too much text. Please shorten it and try again.";
    } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      friendlyMessage = "Service Unavailable: The AI system is currently down. Please try again later.";
    } else if (errorMessage.includes("503")) {
      friendlyMessage = "Server Busy: The AI servers are overloaded right now. Please try again in a few moments.";
    }

    return NextResponse.json(
      { error: friendlyMessage },
      { status: 500 }
    );
  }
}
