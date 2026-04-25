import Image from "next/image";

const TECH_STACK = [
    { src: "/fastapi-logo.png", alt: "FastAPI", label: "FastAPI", invert: false },
    { src: "/langchain-logo.png", alt: "LangChain", label: "LangChain", invert: false },
    { src: "/nextjs-logo.png", alt: "Next.js", label: "Next.js", invert: true },
];

export function Footer() {
    return (
        <footer className="border-t border-[#1a1a2e] px-6 py-5 flex justify-center lg:justify-between text-[12px] text-[#3a3a5a] font-['JetBrains_Mono',_monospace] mx-auto">
            <div className="hidden lg:block">ResearchOS — Multi-Agent AI System</div>
            <div className="text-white flex items-center gap-9">
                {TECH_STACK.map(({ src, alt, label, invert }) => (
                    <div key={label} className="flex items-center justify-center">
                        <Image
                            src={src}
                            alt={alt}
                            width={18}
                            height={18}
                            className={`mr-2 ${invert ? " filter invert" : ""}`}
                        />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </footer>
    );
}