"use client";

import { useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import gsap from "gsap";
import { EXAMPLE_TOPICS } from "@/app/constants/pipeline";

interface HeroSectionProps {
    topic: string;
    model: string;
    isRunning: boolean;
    onTopicChange: (value: string) => void;
    onModelChange: (value: string) => void;
    onRun: () => void;
}

const MODEL_OPTIONS = [
    { value: "qwen/qwen3-32b", label: "qwen/qwen3-32b" },
    { value: "openai/gpt-oss-120b", label: "openai/gpt-oss-120b" },
    { value: "openai/gpt-oss-20b", label: "openai/gpt-oss-20b" },
    { value: "openai/gpt-oss-safeguard-20b", label: "openai/gpt-oss-safeguard-20b" },
];

export function HeroSection({
    topic, model, isRunning,
    onTopicChange, onModelChange, onRun,
}: HeroSectionProps) {
    const badgeRef = useRef(null);
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const inputRef = useRef(null);
    const examplesRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
            .fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
            .fromTo(descRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
            .fromTo(inputRef.current, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.5")
            .fromTo(examplesRef.current, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.5");
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) onRun();
    };

    return (
        <section className="text-center pt-[60px] md:pt-[72px] pb-[40px] lg:pb-[56px] animate-[fadeIn_0.5s_ease]">
            <div ref={badgeRef} className="text-[12px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#f59e0b] font-semibold mb-4 opacity-0">
                AI-Powered Research Pipeline
            </div>

            <h1 ref={titleRef} className="font-['Syne',_sans-serif] text-[clamp(36px,5vw,58px)] font-bold leading-[1.12] tracking-[-0.03em] mb-5 bg-gradient-to-br from-[#f1f1f9] to-[#9090c0] bg-clip-text text-transparent opacity-0">
                What do you want to
                <br className="hidden lg:block" />
                <span className="ml-2 lg:ml-0">research today?</span>
            </h1>

            <div ref={descRef} className="text-[16px] 2xl:text-[19px] text-[#6b7280] leading-[1.7] max-w-[600px] 2xl:max-w-[800px] mx-auto mb-10 opacity-0">
                Enter any topic and watch four specialized AI agents collaborate — searching,
                scraping, writing, and critiquing — to deliver a thorough research report.
            </div>

            {/* ── Input area ── */}
            <div ref={inputRef} className="relative max-w-[720px] 2xl:max-w-[920px] mx-auto opacity-0">
                <textarea
                    className="w-full bg-[#0e0e1c] border border-[#2a2a3e] rounded-[14px]
            px-[18px] pt-[16px] pb-[56px] text-[15px] text-[#e2e2f0]
            font-['Inter',_sans-serif] leading-[1.6]
            transition-all duration-200 resize-y focus:outline-none
            focus:border-[#f59e0b] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)]"
                    value={topic}
                    onChange={(e) => onTopicChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. The economic impact of autonomous vehicles by 2030"
                    rows={3}
                    disabled={isRunning}
                />

                {/* Bottom bar inside textarea */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <select
                        value={model}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="bg-[#13131f] border border-[#2a2a3e] w-full md:w-auto
              rounded-[10px] px-3 py-[6px] text-[12px] text-[#c0c0d0] font-medium
              cursor-pointer hover:border-[#4a4a5e] transition-all focus:outline-none"
                    >
                        {MODEL_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>

                    <button
                        className={`ml-2 bg-[#f59e0b] text-[#0a0800] rounded-[10px] px-4 py-[8px] text-[13px] font-semibold transition-all duration-200 ${!topic.trim() || isRunning
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:brightness-110 cursor-pointer"
                            }`}
                        onClick={onRun}
                        disabled={!topic.trim() || isRunning}
                    >
                        {isRunning ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="hidden md:block">Research</span>
                                <ChevronRight className="inline w-4 h-4" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Example topics ── */}
            <div ref={examplesRef} className="flex items-start gap-3 max-w-[720px] mx-auto flex-wrap justify-center opacity-0 mt-6">
                <span className="text-[12px] text-[#6b7280] tracking-[0.04em] uppercase pt-[6px] shrink-0">
                    Try an example:
                </span>
                <div className="flex flex-wrap gap-3 lg:gap-2 justify-center">
                    {EXAMPLE_TOPICS.map((t) => (
                        <button
                            key={t}
                            className="bg-[#0e0e1c] border border-[#2a2a3e] rounded-[20px] px-[14px] py-[5px] text-[13px] text-[#9090b0] cursor-pointer transition-all hover:border-[#4a4a5e] hover:text-[#c0c0d0] disabled:opacity-50 disabled:cursor-not-allowed font-['Inter',_sans-serif]"
                            onClick={() => onTopicChange(t)}
                            disabled={isRunning}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}