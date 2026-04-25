"use client";

import { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cleanAIOutput } from "@/app/utils/helpers";

interface LiveTerminalProps {
    liveReport: string;
    isRunning: boolean;
    isOpen: boolean;
    onToggle: () => void;
}

export function LiveTerminal({ liveReport, isRunning, isOpen, onToggle }: LiveTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    // Auto-scroll only when user is near the bottom
    useEffect(() => {
        const el = terminalRef.current;
        if (!el || !isAtBottomRef.current) return;
        el.scrollTop = el.scrollHeight;
    }, [liveReport]);

    const handleScroll = () => {
        const el = terminalRef.current;
        if (!el) return;
        isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    };

    return (
        <div className="my-6 mx-auto w-full">
            {/* Toggle button */}
            <button
                onClick={onToggle}
                data-open={isOpen}
                className="w-full flex items-center justify-between px-4 py-2 bg-[#0b0b14] border border-[#1f1f2e] rounded-t-[12px] rounded-b-[12px] data-[open=true]:rounded-b-none transition-all duration-100 cursor-pointer hover:border-[#4a4a5e]"
            >
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-3 text-[11px] text-[#6b7280] font-mono">research-engine.stream</span>
                    {isRunning && (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                    )}
                </div>
                <span className={`text-[11px] text-[#6b7280] font-mono transition-transform duration-400 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    <ChevronDown />
                </span>
            </button>

            {/* Accordion body */}
            <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out border-x border-b border-[#1f1f2e] rounded-b-[12px]"
                style={{ maxHeight: isOpen ? "300px" : "0px" }}
            >
                <div
                    ref={terminalRef}
                    onScroll={handleScroll}
                    className="bg-[#05050a] overflow-y-scroll max-h-[300px]"
                >
                    <div className="p-4 font-['JetBrains_Mono'] text-[13px] leading-[1.8] text-[#d1d5db] whitespace-pre-wrap">
                        {cleanAIOutput(liveReport)}
                        {isRunning && (
                            <span className="inline-block w-[8px] h-[14px] bg-[#f59e0b] ml-1 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}