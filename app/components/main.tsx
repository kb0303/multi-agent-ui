"use client";

import { useState, useRef, useEffect } from "react";

import { PipelineStep, ResearchResult, StepStatus } from "../types/research";
import { INITIAL_STEPS } from "../constants/pipeline";

import { Header } from "./ui/Header";
import { Footer } from "./ui/Footer";
import { HeroSection } from "./ui/HeroSection";
import { PipelineStatus } from "./ui/PipelineStatus";
import { LiveTerminal } from "./ui/LiveTerminal";
import { ResultsSection } from "./ui/ResultsSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is missing");
  return url;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Main() {
  const API_URL = getApiUrl();

  // ── Core state ──
  const [topic, setTopic] = useState("");
  const [model, setModel] = useState("qwen/qwen3-32b");
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<any>(null);

  // ── UI state ──
  const [liveReport, setLiveReport] = useState("");
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [serverAwake, setServerAwake] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // ── Refs ──
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const stepStartRef = useRef<Record<string, number>>({});
  const evtSourceRef = useRef<EventSource | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const progress = (steps.filter((s) => s.status === "done").length / steps.length) * 100;
  const hasStarted = isRunning || !!result || !!error;

  // ── Server wake-up ping ──
  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then(() => setServerAwake(true))
      .catch(() => { });
  }, [API_URL]);

  // ── Cleanup on unmount ──
  useEffect(() => () => {
    timerRef.current && clearInterval(timerRef.current);
    evtSourceRef.current?.close();
  }, []);

  // ── Step helpers ──
  const updateStep = (id: string, status: StepStatus, result?: string) =>
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            status,
            result: result ?? s.result,
            duration: stepStartRef.current[id]
              ? Date.now() - stepStartRef.current[id]
              : undefined,
          }
          : s
      )
    );

  const resetPipeline = () => {
    setSteps(INITIAL_STEPS);
    setResult(null);
    setError(null);
    setElapsedTime(0);
  };

  // ── SSE stream ──
  const openStream = (sessionId: string) => {
    evtSourceRef.current?.close();
    const evtSource = new EventSource(`${API_URL}/stream/${sessionId}`);
    evtSourceRef.current = evtSource;

    evtSource.onmessage = ({ data: raw }) => {
      const data = JSON.parse(raw);

      switch (data.type) {
        case "log":
          setLiveReport((p) => p + data.data);
          break;

        case "data_chunk":
          setLiveReport((p) => p + data.data);
          setSteps((prev) =>
            prev.map((s) =>
              s.id === data.step ? { ...s, result: (s.result ?? "") + data.data } : s
            )
          );
          break;

        case "step_start":
          stepStartRef.current[data.step] = Date.now();
          updateStep(data.step, "running");
          break;

        case "step_end":
          updateStep(data.step, "done");
          break;

        case "data":
          setSteps((prev) =>
            prev.map((s) => (s.id === data.step ? { ...s, result: data.data } : s))
          );
          break;

        case "done":
          evtSource.close();
          break;
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      evtSourceRef.current = null;
    };
  };

  // ── Run pipeline ──
  const runPipeline = async () => {
    if (!topic.trim() || isRunning) return;

    resetPipeline();
    setIsRunning(true);
    setLiveReport("");

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 100);

    const sessionId = crypto.randomUUID();
    openStream(sessionId);

    try {
      const res = await fetch(`${API_URL}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, model, session_id: sessionId }),
      });

      const data: ResearchResult = await res.json();
      if (!res.ok) throw { status: res.status, ...data };

      setSteps((prev) =>
        prev.map((s) => {
          const resultMap: Record<string, string> = {
            search: data.search_results,
            reader: data.scraped_content,
            writer: data.report,
            debate: data.debate,
            critic: data.feedback,
          };
          return s.id in resultMap
            ? { ...s, status: "done", result: resultMap[s.id] }
            : s;
        })
      );

      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch (err: any) {
      setError(err);
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s))
      );
    } finally {
      timerRef.current && clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  // ── Download helpers ──
  const downloadFile = async (
    endpoint: string,
    filename: string,
    setLoading: (v: boolean) => void
  ) => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, ...result }),
      });
      if (!res.ok) throw new Error("Download failed");
      const url = URL.createObjectURL(await res.blob());
      Object.assign(document.createElement("a"), { href: url, download: filename }).click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () =>
    downloadFile(
      "/api/export-pdf",
      `${topic.slice(0, 40).replace(/[^\w\s-]/g, "").trim() || "research-report"}.pdf`,
      setDownloadingPdf
    );

  const handleDownloadDocx = () =>
    downloadFile("/api/export-docx", `${topic || "research-report"}.docx`, setDownloadingDocx);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080810] text-[#e2e2f0] font-['Inter',_sans-serif]">
      <Header />

      <main className="mx-auto px-6 pb-20">
        <HeroSection
          topic={topic}
          model={model}
          isRunning={isRunning}
          onTopicChange={setTopic}
          onModelChange={setModel}
          onRun={runPipeline}
        />

        {hasStarted && (
          <PipelineStatus
            steps={steps}
            isRunning={isRunning}
            serverAwake={serverAwake}
            elapsedTime={elapsedTime}
            error={error}
            progress={progress}
          />
        )}

        {(isRunning || liveReport) && (
          <LiveTerminal
            liveReport={liveReport}
            isRunning={isRunning}
            isOpen={terminalOpen}
            onToggle={() => setTerminalOpen((p) => !p)}
          />
        )}

        {result && (
          <div ref={resultsRef}>
            <ResultsSection
              result={result}
              topic={topic}
              onReset={resetPipeline}
              onDownloadPdf={handleDownloadPdf}
              onDownloadDocx={handleDownloadDocx}
              downloadingPdf={downloadingPdf}
              downloadingDocx={downloadingDocx}
            />
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap');
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeIn    { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stepPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        ::-webkit-scrollbar       { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f0f14; }
        ::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 3px; }
      `}</style>
    </div>
  );
}