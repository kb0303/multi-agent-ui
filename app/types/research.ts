export type StepStatus = "idle" | "running" | "done" | "error";

export interface PipelineStep {
    id: string;
    label: string;
    emoji: string;
    description: string;
    detail: string;
    status: StepStatus;
    result?: string;
    duration?: number;
}

export interface ResearchResult {
    search_results: string;
    scraped_content: string;
    report: string;
    feedback: string;
    debate: string;
}

export type ResultTab = "report" | "feedback" | "search" | "scraped" | "debate";