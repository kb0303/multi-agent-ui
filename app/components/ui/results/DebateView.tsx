import ReactMarkdown from "react-markdown";
import { parseDebate } from "@/app/utils/textParser";

interface DebateViewProps {
    debate: string;
}

export function DebateView({ debate }: DebateViewProps) {
    const { optimist, skeptic } = parseDebate(debate);

    return (
        <div>
            <div className="flex gap-4 items-start bg-[#0d0d20] border border-[#2a2a3e] rounded-[12px] px-5 py-4 mb-6">
                <span className="text-[24px]">⚔️</span>
                <div>
                    <strong className="text-[15px]">Debate Mode</strong>
                    <p className="mt-1 text-[13px] text-[#9ca3af]">
                        Optimist vs Skeptic perspectives on the topic
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#062e1f] border border-[#10b981] rounded-[14px] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[18px]">🟢</span>
                        <h3 className="font-semibold text-[#10b981]">Optimist View</h3>
                    </div>
                    <div className="text-[#a7f3d0] text-[14px] leading-[1.7]">
                        <div className="prose prose-invert max-w-none break-words">
                            <ReactMarkdown>{optimist}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2a0a0a] border border-[#ef4444] rounded-[14px] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[18px]">🔴</span>
                        <h3 className="font-semibold text-[#ef4444]">Skeptic View</h3>
                    </div>
                    <div className="text-[#fca5a5] text-[14px] leading-[1.7]">
                        <div className="prose prose-invert max-w-none break-words">
                            <ReactMarkdown>{skeptic}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}