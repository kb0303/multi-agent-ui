"use client";

import { useState } from "react";
import { PipelineStep } from "@/app/types/research";
import { getStepCardClass, wordCount } from "@/app/utils/helpers";
import { Spinner, StatusDot } from "./Indicators";
import { CopyButton } from "./CopyButton";

interface StepCardProps {
    step: PipelineStep;
    isExpanded: boolean;
    onToggle: () => void;
}

export function StepCard({ step, isExpanded, onToggle }: StepCardProps) {
    return (
        <div
            className={getStepCardClass(step.status)}
            onClick={() => step.result && onToggle()}
        >
            {/* Header row */}
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

            {/* Status row */}
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
                    <span className="text-[12px] text-[#10b981] font-['JetBrains_Mono',_monospace]">✓ Done</span>
                    {step.result && (
                        <span className="text-[11px] text-[#4b5563] font-['JetBrains_Mono',_monospace]">
                            {wordCount(step.result).toLocaleString()} words
                        </span>
                    )}
                    {step.result && (
                        <span className="text-[11px] text-[#6b7280] ml-auto">
                            {isExpanded ? "▲ collapse" : "▼ preview"}
                        </span>
                    )}
                </div>
            )}
            {step.status === "error" && (
                <span className="text-[12px] text-[#ef4444] font-['JetBrains_Mono',_monospace] pt-1 block">
                    ✕ Failed
                </span>
            )}

            {/* Expandable preview */}
            {isExpanded && step.result && (
                <div className="mt-3 border-t border-[#1e1e2e] pt-3">
                    <div className="text-[12px] text-[#6b7280] leading-[1.7] font-['JetBrains_Mono',_monospace] max-h-[120px] overflow-y-auto mb-2">
                        {step.result.slice(0, 600)}
                        {step.result.length > 600 && <span className="text-[#6b7280]">…</span>}
                    </div>
                    <CopyButton text={step.result} />
                </div>
            )}
        </div>
    );
}