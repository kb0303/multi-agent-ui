import { PipelineStep } from "../types/research";

export const EXAMPLE_TOPICS = [
    "Impact of AI on software engineering jobs in 2025",
    "Latest breakthroughs in quantum computing",
    "Climate change mitigation strategies",
    "Microbiome research and mental health",
    "Future of nuclear fusion energy",
    "Advances in CRISPR gene editing",
];

export const INITIAL_STEPS: PipelineStep[] = [
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
        id: "debate",
        label: "Debate Chain",
        emoji: "💬",
        description: "Facilitates a structured debate on the topic",
        detail: "Presents multiple perspectives and arguments, encouraging critical thinking and nuanced discussion by providing optimist and skeptic views.",
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

export const TAB_LABELS = {
    report: "📋 Report",
    search: "🔍 Search Data",
    scraped: "📄 Scraped Content",
    feedback: "🧐 Feedback",
    debate: "⚔️ Debate",
} as const;