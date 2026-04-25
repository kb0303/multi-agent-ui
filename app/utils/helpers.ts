import { StepStatus } from "../types/research";

export function wordCount(text: string): number {
    return text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
}

export function cleanAIOutput(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export function getFeedbackScore(feedback: string): string {
    const match = feedback?.match(/Score:\s*([0-9]+(?:\.[0-9]+)?\/10)/i);
    return match ? match[1] : "N/A";
}

export function getStepCardClass(status: StepStatus): string {
    const base = "bg-[#0e0e1c] border rounded-[14px] p-4 transition-all duration-300";
    const variants: Record<StepStatus, string> = {
        running: `${base} border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_4px_24px_rgba(245,158,11,0.1)] animate-[stepPulse_2s_ease_infinite]`,
        done: `${base} border-[#10b981] cursor-pointer`,
        error: `${base} border-[#ef4444]`,
        idle: `${base} border-[#1e1e2e]`,
    };
    return variants[status];
}