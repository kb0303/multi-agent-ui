"use client";

import { useState } from "react";
import { StepCard } from "./StepCard";
import { PipelineStep } from "@/app/types/research";

interface PipelineStatusProps {
    steps: PipelineStep[];
    isRunning: boolean;
    serverAwake: boolean;
    elapsedTime: number;
    error: any;
    progress: number;
}

export function PipelineStatus({
    steps, isRunning, serverAwake, elapsedTime, error, progress,
}: PipelineStatusProps) {
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    const toggleStep = (id: string) =>
        setExpandedStep((prev) => (prev === id ? null : id));

    return (
        <section className="mb-12 animate-[fadeIn_0.4s_ease] mt-12 lg:mt-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-['Syne',_sans-serif] text-[22px] font-bold m-0 tracking-[-0.02em] text-[#f1f1f9]">
                    Pipeline Status
                </h2>
                {isRunning && (
                    <span className="text-[13px] px-3 py-1 rounded-[20px] bg-[#1a1208] text-[#f59e0b] border border-[#f59e0b] font-['JetBrains_Mono',_monospace]">
                        {serverAwake ? `⏱ ${elapsedTime}s elapsed` : "⏳ initialising server"}
                    </span>
                )}
                {!isRunning && !error && (
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
                    <StepCard
                        key={step.id}
                        step={step}
                        isExpanded={expandedStep === step.id}
                        onToggle={() => toggleStep(step.id)}
                    />
                ))}
            </div>

            {/* Error banner */}
            {error && (
                <div className="mt-4 bg-[#1a0808] border border-[#7f1d1d] rounded-[12px] px-5 py-4 text-[#fca5a5]">
                    <strong>
                        {error.type === "rate_limit" ? "Rate Limit Hit" :
                            error.type === "token_limit" ? "Token Limit Exceeded" :
                                error.type === "auth_error" ? "Authentication Error" :
                                    "Pipeline Error"}
                    </strong>
                    <p className="mt-[6px] text-[14px] opacity-85">{error.message}</p>
                    {error.suggestion && (
                        <p className="mt-[6px] text-[13px] text-[#f87171]">💡 {error.suggestion}</p>
                    )}
                </div>
            )}
        </section>
    );
}