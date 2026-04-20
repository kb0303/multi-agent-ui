"use client";

import { useState, useRef, useEffect } from "react";
import { parseDebate, parseTextWithLinks } from "../utils/TextParser";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

// ─── Types ────────────────────────────────────────────────────────────────────
type StepStatus = "idle" | "running" | "done" | "error";

interface PipelineStep {
  id: string;
  label: string;
  emoji: string;
  description: string;
  detail: string;
  status: StepStatus;
  result?: string;
  duration?: number;
}

interface ResearchResult {
  search_results: string;
  scraped_content: string;
  report: string;
  feedback: string;
  debate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EXAMPLE_TOPICS = [
  "Impact of AI on software engineering jobs in 2025",
  "Latest breakthroughs in quantum computing",
  "Climate change mitigation strategies",
  "Microbiome research and mental health",
  "Future of nuclear fusion energy",
  "Advances in CRISPR gene editing",
];

const INITIAL_STEPS: PipelineStep[] = [
  {
    id: "search",
    label: "Search Agent",
    emoji: "🔍",
    description: "Scours the web for recent, reliable sources",
    detail: "Uses DuckDuckGo & search APIs to find the most relevant and up-to-date information about your topic.",
    status: "idle",
  },
  {
    id: "reader",
    label: "Reader Agent",
    emoji: "📄",
    description: "Scrapes top sources for deeper content",
    detail: "Picks the best URL from search results and extracts the full article text for richer analysis.",
    status: "idle",
  },
  {
    id: "writer",
    label: "Writer Chain",
    emoji: "✍️",
    description: "Drafts a structured research report",
    detail: "Combines all gathered information and synthesizes it into a cohesive, well-structured markdown report.",
    status: "idle",
  },
  {
    id: "critic",
    label: "Critic Chain",
    emoji: "🧐",
    description: "Evaluates and scores the report",
    detail: "Critically reviews the report for accuracy, completeness, and quality — then gives actionable feedback.",
    status: "idle",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function wordCount(text: string) {
  return text?.trim().split(/\s+/).filter(Boolean).length;
}

function getStepCardClass(status: StepStatus): string {
  const base = "bg-[#0e0e1c] border rounded-[14px] p-4 transition-all duration-300";
  if (status === "running")
    return `${base} border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_4px_24px_rgba(245,158,11,0.1)] animate-[stepPulse_2s_ease_infinite]`;
  if (status === "done") return `${base} border-[#10b981] cursor-pointer`;
  if (status === "error") return `${base} border-[#ef4444]`;
  return `${base} border-[#1e1e2e]`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-[12px] font-['JetBrains_Mono',_monospace] bg-[#13131f] border border-[#2a2a3e] rounded-lg text-[#9090b0] px-3 py-[5px] cursor-pointer transition-all shrink-0 hover:border-[#4a4a5e] hover:text-[#c0c0d0]"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-[14px] h-[14px] rounded-full border-2 border-[rgba(245,158,11,0.3)] border-t-[#f59e0b] animate-[spin_0.7s_linear_infinite]" />
  );
}

function StatusDot({ status }: { status: StepStatus }) {
  const colors: Record<StepStatus, string> = {
    idle: "#3a3a4a",
    running: "#f59e0b",
    done: "#10b981",
    error: "#ef4444",
  };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full transition-all duration-300 shrink-0"
      style={{
        background: colors[status],
        boxShadow: status === "running" ? `0 0 8px ${colors.running}` : "none",
      }}
    />
  );
}

function cleanAIOutput(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Main() {
  const [topic, setTopic] = useState("");
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "feedback" | "search" | "scraped" | "debate">("report");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stepTimes, setStepTimes] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const stepStartRef = useRef<Record<string, number>>({});
  const resultsRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState("llama-3.3-70b-versatile");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetPipeline = () => {
    setSteps(INITIAL_STEPS);
    setResult(null);
    setError(null);
    setElapsedTime(0);
    setStepTimes({});
    setActiveTab("report");
  };

  const setStepStatus = (id: string, status: StepStatus, result?: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            status,
            result,
            duration: stepStartRef.current[id]
              ? Date.now() - stepStartRef.current[id]
              : undefined,
          }
          : s
      )
    );
  };

  const runPipeline = async () => {
    if (!topic.trim() || isRunning) return;

    resetPipeline();
    setIsRunning(true);
    startTimeRef.current = Date.now();
    stepStartRef.current = {};

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // ── Optimistic step animation while API runs ──
    const STEP_DURATIONS = [8000, 15000, 12000, 8000];
    const stepIds = ["search", "reader", "writer", "critic"];

    stepStartRef.current["search"] = Date.now();
    setStepStatus("search", "running");

    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = STEP_DURATIONS[0];

    for (let i = 1; i < stepIds.length; i++) {
      const id = stepIds[i];
      const prevId = stepIds[i - 1];
      const delay = cumulative;
      cumulative += STEP_DURATIONS[i];

      stepTimers.push(
        setTimeout(() => {
          stepStartRef.current[id] = Date.now();
          setSteps((prev) =>
            prev.map((s) => {
              if (s.id === prevId && s.status === "running") return { ...s, status: "done" };
              if (s.id === id) return { ...s, status: "running" };
              return s;
            })
          );
        }, delay)
      );
    }

    try {
      const res = await fetch(`${process.env.VITE_API_URL}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, model }),
      });

      stepTimers.forEach((t) => clearTimeout(t));

      if (!res.ok) throw new Error(`Server error ${res.status}: ${res.statusText}`);
      const data: ResearchResult = await res.json();

      const now = Date.now();
      const totalMs = now - startTimeRef.current;
      setStepTimes({
        search: Math.round(totalMs * 0.2),
        reader: Math.round(totalMs * 0.35),
        writer: Math.round(totalMs * 0.3),
        critic: Math.round(totalMs * 0.15),
      });

      setSteps([
        { ...INITIAL_STEPS[0], status: "done", result: data.search_results },
        { ...INITIAL_STEPS[1], status: "done", result: data.scraped_content },
        { ...INITIAL_STEPS[2], status: "done", result: data.report },
        { ...INITIAL_STEPS[3], status: "done", result: data.feedback },
      ]);
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch (err: unknown) {
      stepTimers.forEach((t) => clearTimeout(t));
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s))
      );
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) runPipeline();
  };

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = (doneCount / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#080810] text-[#e2e2f0] font-['Inter',_sans-serif]">

      {/* ── Header ── */}
      <header className="border-b border-[#1a1a2e] bg-[rgba(8,8,16,0.95)] backdrop-blur-[12px] sticky top-0 z-[100]">
        <div className="mx-auto px-4 md:px-8 py-[14px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <span className="text-[22px] text-[#f59e0b]">⬡</span>
            <span className="font-['Syne',_sans-serif] font-bold text-[16.5px] md:text-[18px] tracking-[-0.02em] text-[#f1f1f9]">
              Research
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] md:text-[11px] font-medium px-[10px] py-[3px] rounded-[20px] bg-[#13131f] border border-[#2a2a3e] text-[#9090b0] tracking-[0.04em] uppercase">
              Multi-Agent Pipeline
            </span>
            {/* <span className="text-[11px] font-medium px-[10px] py-[3px] rounded-[20px] bg-[#13131f] border border-[#2a2a3e] text-[#9090b0] tracking-[0.04em] uppercase">
              4 Agents
            </span> */}
          </div>
        </div>
      </header>

      <main className="mx-auto px-6 pb-20">

        {/* ── Hero ── */}
        <section className="text-center pt-[60px] md:pt-[72px] pb-[56px] animate-[fadeIn_0.5s_ease]">
          <p className="text-[12px] tracking-[0.16em] uppercase text-[#f59e0b] font-semibold mb-4">
            AI-Powered Research Pipeline
          </p>
          <h1 className="font-['Syne',_sans-serif] text-[clamp(36px,5vw,56px)] font-bold leading-[1.12] tracking-[-0.03em] mb-5 bg-gradient-to-br from-[#f1f1f9] to-[#9090c0] bg-clip-text text-transparent">
            What do you want to
            <br />
            research today?
          </h1>
          <p className="text-[16px] text-[#6b7280] leading-[1.7] max-w-[600px] mx-auto mb-10">
            Enter any topic and watch four specialized AI agents collaborate — searching,
            scraping, writing, and critiquing — to deliver a thorough research report.
          </p>

          {/* Input */}
          <div className="relative max-w-[720px] mx-auto">

            {/* Textarea */}
            <textarea
              className="w-full bg-[#0e0e1c] border border-[#2a2a3e] rounded-[14px]
    px-[18px] pt-[16px] pb-[56px] text-[15px] text-[#e2e2f0]
    font-['Inter',_sans-serif] leading-[1.6]
    transition-all duration-200 resize-y focus:outline-none
    focus:border-[#f59e0b]
    focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)]"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. The economic impact of autonomous vehicles by 2030"
              rows={3}
              disabled={isRunning}
            />

            {/* Bottom Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">

              {/* Model Selector */}
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-[#13131f] border border-[#2a2a3e]
        rounded-[10px] px-3 py-[6px] text-[12px]
        text-[#c0c0d0] font-medium cursor-pointer
        hover:border-[#4a4a5e] transition-all
        focus:outline-none"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
                  {/* <option value="meta-llama/llama-4-scout-17b-16e-instruct">meta-llama/llama-4-scout-17b-16e-instruct</option> */}
                  <option value="qwen/qwen3-32b">qwen/qwen3-32b</option>
                  <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                  <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
                  <option value="openai/gpt-oss-safeguard-20b">openai/gpt-oss-safeguard-20b</option>
                </select>
              </div>

              {/* Run Button */}
              <button
                className={`ml-2 bg-[#f59e0b] text-[#0a0800]
      rounded-[10px] px-4 py-[8px] text-[13px] font-semibold
      transition-all ${!topic.trim() || isRunning
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:brightness-110 cursor-pointer"
                  }`}
                onClick={runPipeline}
                disabled={!topic.trim() || isRunning}
              >
                {isRunning ? "Running Research..." :
                  <div className="flex items-center justify-center">
                    <span>Research</span>
                    <ChevronRight className="inline w-4 h-4" />
                  </div>
                }
              </button>

            </div>
          </div>
        </section>

        {/* {(!isRunning || !result || !error) */}
        {/* Examples */}
        <div className="flex items-start gap-3 max-w-[720px] mx-auto flex-wrap justify-center">
          <span className="text-[12px] text-[#6b7280] tracking-[0.04em] uppercase pt-[6px] shrink-0">
            Try an example:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                className="bg-[#0e0e1c] border border-[#2a2a3e] rounded-[20px] px-[14px] py-[5px] text-[13px] text-[#9090b0] cursor-pointer transition-all hover:border-[#4a4a5e] hover:text-[#c0c0d0] disabled:opacity-50 disabled:cursor-not-allowed font-['Inter',_sans-serif]"
                onClick={() => setTopic(t)}
                disabled={isRunning}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pipeline Steps ── */}
        {(isRunning || result || error) && (
          <section className="mb-12 animate-[fadeIn_0.4s_ease]">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-['Syne',_sans-serif] text-[22px] font-bold m-0 tracking-[-0.02em] text-[#f1f1f9]">
                Pipeline Status
              </h2>
              {isRunning && (
                <span className="text-[13px] px-3 py-1 rounded-[20px] bg-[#1a1208] text-[#f59e0b] border border-[#f59e0b] font-['JetBrains_Mono',_monospace]">
                  ⏱ {elapsedTime}s elapsed
                </span>
              )}
              {result && (
                <span className="text-[13px] px-3 py-1 rounded-[20px] bg-[#0d2a1f] text-[#10b981] border border-[#10b981] font-['JetBrains_Mono',_monospace]">
                  ✓ Completed in {elapsedTime}s
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-[3px] bg-[#1a1a2e] rounded-[2px] mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#f59e0b] to-[#10b981] rounded-[2px] transition-[width] duration-[800ms] ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {steps.map((step) => (
                <div key={step.id}>
                  <div
                    className={getStepCardClass(step.status)}
                    onClick={() =>
                      step.result &&
                      setExpandedStep(expandedStep === step.id ? null : step.id)
                    }
                  >
                    <div className="flex gap-3 items-start mb-3">
                      <span className="text-[22px] leading-none shrink-0">{step.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-[3px]">
                          <span className="text-[14px] font-semibold text-[#e2e2f0] font-['Syne',_sans-serif]">
                            {step.label}
                          </span>
                          <StatusDot status={step.status} />
                        </div>
                        <span className="text-[12px] text-[#6b7280] leading-[1.5]">
                          {step.description}
                        </span>
                      </div>
                    </div>

                    {step.status === "running" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Spinner />
                        <span className="text-[12px] text-[#f59e0b] font-['JetBrains_Mono',_monospace]">
                          Processing...
                        </span>
                      </div>
                    )}
                    {step.status === "idle" && (
                      <div className="text-[12px] text-[#3a3a5a] font-['JetBrains_Mono',_monospace] pt-1">
                        Waiting
                      </div>
                    )}
                    {step.status === "done" && (
                      <div className="flex items-center gap-[10px] flex-wrap pt-1">
                        <span className="text-[12px] text-[#10b981] font-['JetBrains_Mono',_monospace]">
                          ✓ Done
                        </span>
                        {step.result && (
                          <span className="text-[11px] text-[#4b5563] font-['JetBrains_Mono',_monospace]">
                            {wordCount(step.result).toLocaleString()} words
                          </span>
                        )}
                        {step.result && (
                          <span className="text-[11px] text-[#6b7280] ml-auto">
                            {expandedStep === step.id ? "▲ collapse" : "▼ preview"}
                          </span>
                        )}
                      </div>
                    )}
                    {step.status === "error" && (
                      <span className="text-[12px] text-[#ef4444] font-['JetBrains_Mono',_monospace] pt-1 block">
                        ✕ Failed
                      </span>
                    )}

                    {/* Expanded preview */}
                    {expandedStep === step.id && step.result && (
                      <div className="mt-3 border-t border-[#1e1e2e] pt-3">
                        <div className="text-[12px] text-[#6b7280] leading-[1.7] font-['JetBrains_Mono',_monospace] max-h-[120px] overflow-y-auto mb-2">
                          {step.result.slice(0, 600)}
                          {step.result.length > 600 && (
                            <span className="text-[#6b7280]">…</span>
                          )}
                        </div>
                        <CopyButton text={step.result} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 bg-[#1a0808] border border-[#7f1d1d] rounded-[12px] px-5 py-4 text-[#fca5a5]">
                <strong>Pipeline Error</strong>
                <p className="mt-[6px] text-[14px] opacity-85">{error}</p>
                <p className="mt-[6px] text-[13px] text-[#f87171]">
                  Make sure your FastAPI server is running at{" "}
                  <code className="bg-[#2a1515] px-[6px] py-[1px] rounded">
                    {`${process.env.VITE_API_URL}`}
                  </code>
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Results ── */}
        {result && (
          <section className="animate-[fadeIn_0.5s_ease]" ref={resultsRef}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-['Syne',_sans-serif] text-[22px] font-bold m-0 tracking-[-0.02em] text-[#f1f1f9]">
                Research Results
              </h2>
              <div className="flex gap-2">
                <button
                  className="text-[13px] font-['Inter',_sans-serif] bg-transparent border border-[#2a2a3e] rounded-[10px] text-[#9090b0] px-4 py-[7px] cursor-pointer transition-all hover:border-[#4a4a5e] hover:text-[#c0c0d0]"
                  onClick={resetPipeline}
                >
                  New Research
                </button>
                <CopyButton text={result.report} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-7">
              {[
                { label: "Report Length", value: `${wordCount(result.report).toLocaleString()} words` },
                { label: "Sources Scraped", value: "1 deep source" },
                { label: "Search Snippets", value: `${result.search_results.split("\n").length} lines` },
                { label: "Feedback Score", value: "See feedback →" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#0e0e1c] border border-[#1e1e2e] rounded-[12px] px-4 py-[14px] flex flex-col gap-1"
                >
                  <span className="text-[11px] text-[#6b7280] uppercase tracking-[0.06em] font-medium">
                    {stat.label}
                  </span>
                  <span className="text-[15px] font-semibold text-[#e2e2f0] font-['JetBrains_Mono',_monospace]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#1e1e2e] overflow-x-auto">
              {(["report", "search", "scraped", "feedback", "debate"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`px-[18px] py-[10px] text-[13px] font-medium bg-transparent border-0 border-b-2 border-solid whitespace-nowrap transition-all duration-200 font-['Inter',_sans-serif] ${activeTab === tab
                    ? "text-[#f59e0b] border-b-[#f59e0b]"
                    : "text-[#6b7280] border-b-transparent cursor-pointer hover:text-[#9090b0]"
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {{ report: "📋 Report", search: "🔍 Search Data", scraped: "📄 Scraped Content", feedback: "🧐 Feedback", debate: "⚔️ Debate" }[tab]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-[#0a0a14] border border-[#1e1e2e] border-t-0 rounded-b-[14px] px-8 py-7 min-h-[300px] w-fit">
              {activeTab === "report" && (
                <div>
                  <div className="flex justify-between items-start mb-7 gap-4 flex-wrap">
                    <div>
                      <h3 className="font-['Syne',_sans-serif] text-[20px] font-bold m-0 text-[#f1f1f9]">
                        Research Report
                      </h3>
                      <p className="text-[14px] text-[#6b7280] mt-1">
                        Topic: <em>{topic}</em>
                      </p>
                    </div>
                    <CopyButton text={cleanAIOutput(result.report)} />
                  </div>
                  {/* <SimpleMarkdown text={result.report} /> */}
                  <div className="prose prose-invert max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
                    >
                      {cleanAIOutput(result.report)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === "feedback" && (
                <div>
                  <div className="flex gap-4 items-start bg-[#0d0d20] border border-[#2a2a3e] rounded-[12px] px-5 py-4 mb-6">
                    <span className="text-[24px]">🧐</span>
                    <div>
                      <strong className="text-[15px]">Critic Agent Feedback</strong>
                      <p className="mt-1 text-[13px] text-[#9ca3af]">
                        Independent evaluation of the report's quality, accuracy, and completeness
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
                    >
                      {cleanAIOutput(result.feedback)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === "search" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] font-['JetBrains_Mono',_monospace] text-[#6b7280] uppercase tracking-[0.08em]">
                      Raw Search Agent Output
                    </span>
                    <CopyButton text={cleanAIOutput(result.search_results)} />
                  </div>
                  {/* <pre className="font-['JetBrains_Mono',_monospace] text-[12px] leading-[1.8] text-[#9090b0] whitespace-pre-wrap break-words m-0">
                    {parseTextWithLinks(result.search_results)}
                  </pre> */}
                  <div className="prose prose-invert max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
                    >
                      {cleanAIOutput(result.search_results)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === "scraped" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] font-['JetBrains_Mono',_monospace] text-[#6b7280] uppercase tracking-[0.08em]">
                      Raw Scraped Content
                    </span>
                    <CopyButton text={cleanAIOutput(result.scraped_content)} />
                  </div>

                  <div className="prose prose-invert max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
                    >
                      {cleanAIOutput(result.scraped_content)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === "debate" && (() => {
                const { optimist, skeptic } = parseDebate(result.debate);

                return (
                  <div>
                    {/* Header */}
                    <div className="flex gap-4 items-start bg-[#0d0d20] border border-[#2a2a3e] rounded-[12px] px-5 py-4 mb-6">
                      <span className="text-[24px]">⚔️</span>
                      <div>
                        <strong className="text-[15px]">Debate Mode</strong>
                        <p className="mt-1 text-[13px] text-[#9ca3af]">
                          Optimist vs Skeptic perspectives on the topic
                        </p>
                      </div>
                    </div>

                    {/* Split View */}
                    <div className="grid md:grid-cols-2 gap-4">

                      {/* Optimist */}
                      <div className="bg-[#062e1f] border border-[#10b981] rounded-[14px] p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[18px]">🟢</span>
                          <h3 className="font-semibold text-[#10b981]">Optimist View</h3>
                        </div>
                        <div className="text-[#a7f3d0] text-[14px] leading-[1.7]">
                          <div className="prose prose-invert max-w-none break-words">
                            <ReactMarkdown>{cleanAIOutput(optimist)}</ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      {/* Skeptic */}
                      <div className="bg-[#2a0a0a] border border-[#ef4444] rounded-[14px] p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[18px]">🔴</span>
                          <h3 className="font-semibold text-[#ef4444]">Skeptic View</h3>
                        </div>
                        <div className="text-[#fca5a5] text-[14px] leading-[1.7]">
                          <div className="prose prose-invert max-w-none break-words">
                            <ReactMarkdown>{cleanAIOutput(skeptic)}</ReactMarkdown>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a1a2e] px-6 py-5 flex justify-between text-[12px] text-[#3a3a5a] font-['JetBrains_Mono',_monospace] mx-auto">
        <span>ResearchOS — Multi-Agent AI System</span>
        <span className="opacity-40">FastAPI + LangChain + Next.js</span>
      </footer>

      {/* ── Keyframes only — cannot live in Tailwind without modifying tailwind.config ── */}
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