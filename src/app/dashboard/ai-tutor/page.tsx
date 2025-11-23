"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, X } from "lucide-react";

export default function AiTutorPage() {
  const [showTutor, setShowTutor] = useState(false);

  useEffect(() => {
    if (!showTutor) return;

    // Remove old embed if exists
    const old = document.getElementById("heygen-wrapper");
    if (old) old.remove();

    // ---- Container for embedding inside page ----
    const wrapper = document.createElement("div");
    wrapper.id = "heygen-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.maxWidth = "800px";
    wrapper.style.height = "480px";
    wrapper.style.margin = "0 auto";
    wrapper.style.borderRadius = "16px";
    wrapper.style.overflow = "hidden";
    wrapper.style.boxShadow = "0 8px 22px rgba(0,0,0,0.18)";
    wrapper.style.background = "#000";

    const iframe = document.createElement("iframe");
    iframe.src =
      "https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9Qcm9mZXNzaW9uYWxMb29rX3B1YmxpYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzM0OGRkZjUwM2M2NTRiOWJiYmI4YmVhOWY5MjEwZWFkXzU1ODcwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6dHJ1ZSwia25vd2xlZGdlQmFzZUlkIjoiMTY0YTI3M2Q0MzQ3NGJiZjgwZmYxMDdlMmY0YjdmZjYiLCJ1c2VybmFtZSI6ImIzZWU3OTg3ODhjMjRiNTY5YmQ3MWI5MmM1NjI1MjM5In0=&inIFrame=1";
    iframe.allow = "microphone";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";

    wrapper.appendChild(iframe);
    document.getElementById("tutor-container")?.appendChild(wrapper);

    return () => {
      wrapper.remove();
    };
  }, [showTutor]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          AI Tutor
        </h1>
        <p className="text-muted-foreground mt-2">
          Start a live AI tutor session inside your dashboard.
        </p>
      </div>

      {/* Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Tutor Session</CardTitle>
          <CardDescription>
            Your tutor appears below when you click the start button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Start Button */}
          {!showTutor && (
            <div className="flex justify-center py-8">
              <button
                onClick={() => setShowTutor(true)}
                className="px-6 py-3 rounded-lg bg-primary text-white font-semibold text-lg shadow hover:opacity-90"
              >
                ▶️ Start Tutor
              </button>
            </div>
          )}

          {/* Tutor Embed Container */}
          <div id="tutor-container" className="w-full"></div>

          {/* Close Tutor Button */}
          {showTutor && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowTutor(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
              >
                <X size={16} /> Close Tutor
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}