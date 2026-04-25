"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface CopyButtonProps {
    text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            title={copied ? "✓ Copied" : "Copy"}
            className="text-[12px] font-['JetBrains_Mono',_monospace] bg-[#13131f] border border-[#2a2a3e] rounded-lg text-[#9090b0] px-3 py-[5px] cursor-pointer transition-all shrink-0 hover:border-[#4a4a5e] hover:text-[#c0c0d0] duration-100"
        >
            {copied ? "✓ Copied" : <Copy className="w-5 h-5" />}
        </button>
    );
}