"use client";
import { useState } from "react";

type ResearchState = {
    search_results: string;
    scraped_content: string;
    report: string;
    feedback: string;
};

export default function Main() {
    const [topic, setTopic] = useState("");
    const [result, setResult] = useState<ResearchState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit() {
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("http://localhost:8000/api/research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            if (!res.ok) throw new Error("Pipeline failed");
            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}>
            <h1>Multi-Agent Research System</h1>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a research topic..."
                    style={{ flex: 1, padding: 8 }}
                />
                <button onClick={handleSubmit} disabled={loading || !topic}>
                    {loading ? "Running..." : "Research"}
                </button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {result && (
                <div>
                    {[
                        { label: "🔍 Search Results", key: "search_results" },
                        { label: "📄 Scraped Content", key: "scraped_content" },
                        { label: "📝 Report", key: "report" },
                        { label: "✅ Feedback", key: "feedback" },
                    ].map(({ label, key }) => (
                        <details key={key} style={{ marginBottom: 16 }}>
                            <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
                                {label}
                            </summary>
                            <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                                {result[key as keyof ResearchState]}
                            </pre>
                        </details>
                    ))}
                </div>
            )}
        </main>
    );
}