import { StepStatus } from "../../types/research";

export function Spinner() {
    return (
        <span className="inline-block w-[14px] h-[14px] rounded-full border-2 border-[rgba(245,158,11,0.3)] border-t-[#f59e0b] animate-[spin_0.7s_linear_infinite]" />
    );
}

const STATUS_COLORS: Record<StepStatus, string> = {
    idle: "#3a3a4a",
    running: "#f59e0b",
    done: "#10b981",
    error: "#ef4444",
};

interface StatusDotProps {
    status: StepStatus;
}

export function StatusDot({ status }: StatusDotProps) {
    const color = STATUS_COLORS[status];
    return (
        <span
            className="inline-block w-2 h-2 rounded-full transition-all duration-300 shrink-0"
            style={{
                background: color,
                boxShadow: status === "running" ? `0 0 8px ${color}` : "none",
            }}
        />
    );
}