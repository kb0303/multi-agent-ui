import { Code2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const FRONTEND_REPO = "https://github.com/kb0303/multi-agent-ui";
const BACKEND_REPO = "https://github.com/kb0303/multi-agent-system";

export function Header() {
    const openRepos = () => {
        window.open(FRONTEND_REPO, "_blank", "noopener,noreferrer");
        window.open(BACKEND_REPO, "_blank", "noopener,noreferrer");
    };

    return (
        <header className="border-b border-[#1a1a2e] bg-[rgba(8,8,16,0.95)] backdrop-blur-[12px] sticky top-0 z-[100]">
            <div className="mx-auto px-4 md:px-8 py-[14px] flex items-center justify-between gap-3">

                <div className="flex items-center gap-[10px]">
                    <span className="text-[22px] text-[#f59e0b]">⬡</span>
                    <span className="font-['Syne',_sans-serif] font-bold text-[16.5px] md:text-[18px] tracking-[-0.02em] text-[#f1f1f9]">
                        Research
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden md:flex text-[10px] md:text-[11px] font-medium px-[10px] py-[3px] rounded-[20px] bg-[#13131f] border border-[#2a2a3e] text-[#9090b0] tracking-[0.04em] uppercase">
                        Multi-Agent Pipeline
                    </span>

                    <button
                        onClick={openRepos}
                        className="group relative overflow-hidden flex items-center gap-2 px-4 py-[8px] rounded-[12px]
              bg-gradient-to-r from-[#17172a] to-[#10101b] border border-[#2a2a3e] text-[#e2e2f0]
              text-[13px] font-semibold transition-all duration-300
              hover:border-[#f59e0b] hover:shadow-[0_0_0_1px_rgba(245,158,11,0.15),0_8px_28px_rgba(245,158,11,0.08)]
              hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
                    >
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <FaGithub className="w-4 h-4" />
                        <span className="opacity-85 hidden sm:block group-hover:opacity-100 transition duration-100">Source Code</span>
                        <Code2 className="w-4 h-4 text-[#9090b0] group-hover:text-[#f59e0b] transition" />
                    </button>
                </div>

            </div>
        </header>
    );
}