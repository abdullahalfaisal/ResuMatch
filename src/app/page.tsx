"use client";

import { useState, useRef, useCallback, FormEvent } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Loader2,
  Check,
  X,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const CIRCUMFERENCE = 2 * Math.PI * 52;

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", ring: "text-emerald-500", glow: "shadow-emerald-500/20" };
  if (score >= 60) return { text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500", ring: "text-sky-500", glow: "shadow-sky-500/20" };
  if (score >= 40) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", ring: "text-amber-500", glow: "shadow-amber-500/20" };
  return { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500", ring: "text-rose-500", glow: "shadow-rose-500/20" };
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.size > 4 * 1024 * 1024) { setError("File must be under 4 MB."); return; }
    const ok = f.type === "application/pdf" || f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || f.name.endsWith(".pdf") || f.name.endsWith(".docx");
    if (!ok) { setError("Only PDF and DOCX files are supported."); return; }
    setError(null);
    setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please upload your resume."); return; }
    if (jd.length < 100) { setError("Job description needs at least 100 characters."); return; }
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("jobDescription", jd);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setFile(null); setJd(""); setResult(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-6 pb-12 pt-4 sm:pb-20 sm:pt-8">
        <AnimatePresence mode="wait">

          {/* ═══════════ LOADING ═══════════ */}
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col items-center justify-center pt-32 gap-8"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Analyzing your resume</h2>
                <p className="text-sm text-muted-foreground">Running AI-powered semantic matching…</p>
              </div>
            </motion.div>

            /* ═══════════ RESULTS ═══════════ */
          ) : result ? (
            <motion.div
              key="results"
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Header */}
              <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Analysis Complete</h1>
                  <p className="text-sm text-muted-foreground mt-1">Here's how your resume matches the role</p>
                </div>
                <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-1.5 hover:bg-muted">
                  <RotateCcw className="h-3.5 w-3.5" /> New analysis
                </button>
              </motion.div>

              {result.confidenceWarning && (
                <motion.div variants={fadeUp} custom={1} className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">Low-confidence result — your resume may be too short or vague for accurate scoring.</p>
                </motion.div>
              )}

              {/* ── Score Hero ── */}
              <motion.div variants={fadeUp} custom={1} className="rounded-2xl border bg-card overflow-hidden">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
                  {/* Ring */}
                  <div className="relative shrink-0">
                    <div className={`absolute inset-2 rounded-full blur-2xl ${scoreColor(result.score).bg} opacity-10`} />
                    <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90 score-glow">
                      <circle cx="60" cy="60" r="52" fill="none" strokeWidth="7" className="stroke-muted/30" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none" strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        initial={{ strokeDashoffset: CIRCUMFERENCE }}
                        animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - result.score / 100) }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`stroke-current ${scoreColor(result.score).ring}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="text-4xl font-extrabold tabular-nums"
                      >
                        {result.score}
                      </motion.span>
                    </div>
                  </div>

                  {/* Sub-scores */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className={`text-lg font-bold ${scoreColor(result.score).text}`}>{result.band}</h2>
                      {result.parseRate !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ATS Parse Rate</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${result.parseRate >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : result.parseRate >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                            {result.parseRate}%
                          </span>
                        </div>
                      )}
                    </div>
                    {[
                      { label: "Skills Match", value: result.subScores.skillsMatch, max: 40, color: "bg-violet-500" },
                      { label: "Experience", value: result.subScores.experienceRelevance, max: 30, color: "bg-sky-500" },
                      { label: "Keywords", value: result.subScores.keywordCoverage, max: 20, color: "bg-amber-500" },
                      { label: "Alignment", value: result.subScores.overallAlignment, max: 10, color: "bg-emerald-500" },
                    ].map((s, idx) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground font-medium">{s.label}</span>
                          <span className="font-semibold tabular-nums">{s.value}<span className="text-muted-foreground font-normal text-xs">/{s.max}</span></span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${s.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(s.value / s.max) * 100}%` }}
                            transition={{ duration: 0.9, delay: 0.3 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation strip */}
                <div className="border-t bg-muted/30 px-6 sm:px-8 py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.scoreExplanation}</p>
                </div>
              </motion.div>

              {/* ── Skills ── */}
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div variants={fadeUp} custom={2} className="rounded-2xl border bg-card p-5 hover:shadow-md hover:shadow-emerald-500/5 transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Matched Skills</h3>
                    <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">{result.matchedSkills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.length > 0 ? result.matchedSkills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" />{s}
                      </span>
                    )) : <span className="text-sm text-muted-foreground">No matches found.</span>}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} custom={3} className="rounded-2xl border bg-card p-5 hover:shadow-md hover:shadow-rose-500/5 transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-rose-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Missing Skills</h3>
                    <span className="ml-auto text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 rounded-full px-2 py-0.5">{result.missingSkills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.length > 0 ? result.missingSkills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                        <X className="h-3 w-3" />{s}
                      </span>
                    )) : <span className="text-sm text-muted-foreground">None missing!</span>}
                  </div>
                </motion.div>
              </div>

              {/* ── Strengths + Weaknesses ── */}
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div variants={fadeUp} custom={4} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div variants={fadeUp} custom={5} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.weakAreas.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* ── Action Plan ── */}
              <motion.div variants={fadeUp} custom={6} className="rounded-2xl border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-500/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Recommended Actions</h3>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {result.improvementTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-bold text-white shadow-sm">{i + 1}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1">{tip}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div variants={fadeUp} custom={7} className="pt-4 flex justify-center">
                <button
                  onClick={reset}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:brightness-110 transition-all duration-200"
                >
                  <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45 duration-300" /> Analyze another resume
                </button>
              </motion.div>
            </motion.div>

            /* ═══════════ FORM ═══════════ */
          ) : (
            <motion.div
              key="form"
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Hero */}
              <div className="relative text-center space-y-5">
                <div className="hero-glow" />
                <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
                  <Zap className="h-3 w-3" />
                  Powered by Google Gemini AI
                </motion.div>
                <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-extrabold capitalize tracking-tight sm:[word-spacing:8px] leading-[1.1] text-balance mx-auto">
                  See how your resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-400">scores against the job</span>
                </motion.h1>
                <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-[15px]">
                  Upload your resume, paste a job description, and get instant AI‑powered feedback with a detailed match score.
                </motion.p>
              </div>

              {/* Form card */}
              <motion.div variants={fadeUp} custom={3}>
                <form onSubmit={handleSubmit} className="rounded-2xl border bg-card shadow-xl shadow-black/[0.03] dark:shadow-none p-6 sm:p-8 space-y-6">

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Step 1: Upload */}
                    <div className="space-y-2.5 flex flex-col min-w-0">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">1</span>
                        Upload Resume
                      </label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex-1 flex flex-col justify-center min-w-0 overflow-hidden ${dragOver
                          ? "border-primary bg-primary/5 scale-[1.01]"
                          : file
                            ? "border-primary/30 bg-primary/[0.03]"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                          } ${file ? "p-4" : "p-8"}`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                        />
                        {file ? (
                          <div className="flex items-center gap-3 w-full">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                              className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center">
                              <UploadCloud className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">Drop your resume here or <span className="text-primary font-semibold">browse</span></p>
                              <p className="text-xs text-muted-foreground mt-1">PDF or DOCX, up to 4 MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2: JD */}
                    <div className="space-y-2.5 flex flex-col">
                      <div className="flex items-center justify-between">
                        <label htmlFor="jd" className="text-sm font-semibold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">2</span>
                          Job Description
                        </label>
                        <span className={`text-xs font-medium tabular-nums ${jd.length > 0 && jd.length < 100 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {jd.length > 0 ? `${jd.length} chars` : ""} {jd.length > 0 && jd.length < 100 && "(min 100)"}
                        </span>
                      </div>
                      <textarea
                        id="jd"
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        placeholder="Paste the full job description here…"
                        className="w-full flex-1 rounded-xl border bg-background p-4 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-none min-h-[160px] transition-all duration-200 sm:text-center sm:pt-[70px]"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 p-3.5">
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!file || jd.length < 100 || loading}
                    className="w-full group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:brightness-110 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:brightness-100"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Analyze Resume
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 duration-200" />
                  </button>
                </form>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No signup required</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Files never stored</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 100% free</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
