"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { FaFilePdf } from "react-icons/fa6";
import { TbFileTypeDocx } from "react-icons/tb";

import { ResearchResult, ResultTab } from "@/app/types/research";
import { cleanAIOutput, wordCount, getFeedbackScore } from "@/app/utils/helpers";
import { CopyButton } from "./CopyButton";
import { DebateView } from "./results/DebateView";
import { TAB_LABELS } from "@/app/constants/pipeline";


interface ResultsSectionProps {
    result: ResearchResult;
    topic: string;
    onReset: () => void;
    onDownloadPdf: () => Promise<void>;
    onDownloadDocx: () => Promise<void>;
    downloadingPdf: boolean;
    downloadingDocx: boolean;
}

const STATS = (result: ResearchResult) => [
    { label: "Report Length", value: `${wordCount(result.report).toLocaleString()} words` },
    { label: "Sources Scraped", value: "1 deep source" },
    { label: "Search Snippets", value: `${result.search_results.split("\n").length} lines` },
    { label: "Feedback Score", value: getFeedbackScore(result.feedback) },
];

export function ResultsSection({
    result, topic, onReset,
    onDownloadPdf, onDownloadDocx,
    downloadingPdf, downloadingDocx,
}: ResultsSectionProps) {
    const [activeTab, setActiveTab] = useState<ResultTab>("report");

    return (
        <section className="animate-[fadeIn_0.5s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-['Syne',_sans-serif] text-[22px] font-bold m-0 tracking-[-0.02em] text-[#f1f1f9]">
                    Research Results
                </h2>
                <div className="flex gap-2">
                    <button
                        className="text-[13px] font-['Inter',_sans-serif] bg-transparent border border-[#2a2a3e] rounded-[10px] text-[#9090b0] px-4 py-[7px] cursor-pointer transition-all hover:border-[#4a4a5e] hover:text-[#c0c0d0]"
                        onClick={onReset}
                    >
                        New Research
                    </button>
                    <CopyButton text={result.report} />
                    <DownloadButton onClick={onDownloadPdf} loading={downloadingPdf} title="Export PDF file">
                        <FaFilePdf className="w-5.5 h-5.5" />
                    </DownloadButton>
                    <DownloadButton onClick={onDownloadDocx} loading={downloadingDocx} title="Export DOCX file">
                        <TbFileTypeDocx className="w-5.5 h-5.5" />
                    </DownloadButton>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(134px,1fr))] gap-3 mb-7">
                {STATS(result).map(({ label, value }) => (
                    <div key={label} className="bg-[#0e0e1c] border border-[#1e1e2e] rounded-[12px] px-4 py-[14px] flex flex-col gap-1">
                        <span className="text-[11px] text-[#6b7280] uppercase tracking-[0.06em] font-medium">{label}</span>
                        <span className="text-[15px] font-semibold text-[#e2e2f0] font-['JetBrains_Mono',_monospace]">{value}</span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#1e1e2e] overflow-x-auto">
                {(Object.keys(TAB_LABELS) as ResultTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-[18px] py-[10px] text-[13px] md:text-[15px] font-medium bg-transparent border-0 border-b-2 border-solid whitespace-nowrap transition-all duration-200 font-['Inter',_sans-serif] ${activeTab === tab
                            ? "text-[#f59e0b] border-b-[#f59e0b]"
                            : "text-[#6b7280] border-b-transparent cursor-pointer hover:text-[#9090b0]"
                            }`}
                    >
                        {TAB_LABELS[tab]}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="bg-[#0a0a14] border border-[#1e1e2e] border-t-0 rounded-b-[14px] px-6 lg:px-8 py-7 min-h-[300px] w-fit max-w-[100%]">
                {activeTab === "report" && (
                    <div>
                        <div className="flex justify-between items-start mb-7 gap-4 flex-wrap">
                            <div>
                                <h3 className="font-['Syne',_sans-serif] text-[20px] font-bold m-0 text-[#f1f1f9]">Research Report</h3>
                                <p className="text-[14px] text-[#6b7280] mt-1">Topic: <em>{topic}</em></p>
                            </div>
                            <CopyButton text={cleanAIOutput(result.report)} />
                        </div>
                        <MarkdownContent>{cleanAIOutput(result.report)}</MarkdownContent>
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
                        <MarkdownContent>{cleanAIOutput(result.feedback)}</MarkdownContent>
                    </div>
                )}

                {activeTab === "search" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[12px] font-['JetBrains_Mono',_monospace] text-[#6b7280] uppercase tracking-[0.08em]">
                                Search Agent Output
                            </span>
                            <CopyButton text={cleanAIOutput(result.search_results)} />
                        </div>
                        <MarkdownContent>{cleanAIOutput(result.search_results)}</MarkdownContent>
                    </div>
                )}

                {activeTab === "scraped" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[12px] font-['JetBrains_Mono',_monospace] text-[#6b7280] uppercase tracking-[0.08em]">
                                Scraped Content
                            </span>
                            <CopyButton text={cleanAIOutput(result.scraped_content)} />
                        </div>
                        <MarkdownContent>{cleanAIOutput(result.scraped_content)}</MarkdownContent>
                    </div>
                )}

                {activeTab === "debate" && (
                    <DebateView debate={cleanAIOutput(result.debate)} />
                )}
            </div>
        </section>
    );
}

// ── Shared sub-components local to this file ──────────────────────────────────

function MarkdownContent({ children }: { children: string }) {
    return (
        <div className="prose prose-invert max-w-none break-words">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}

interface DownloadButtonProps {
    onClick: () => Promise<void>;
    loading: boolean;
    title: string;
    children: React.ReactNode;
}

function DownloadButton({ onClick, loading, title, children }: DownloadButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            title={title}
            className="text-[13px] border border-[#2a2a3e] hover:border-[#f59e0b] text-[#c0c0d0]/80 hover:text-[#f59e0b] rounded-[10px] px-3 py-[2px] font-semibold disabled:opacity-60 cursor-pointer transition-all duration-200"
        >
            {loading
                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                : children}
        </button>
    );
}