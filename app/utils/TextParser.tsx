export function parseTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#60a5fa] underline break-all hover:text-[#93c5fd]"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}


export function parseDebate(raw: string): { optimist: string; skeptic: string } {
  // Strip ALL think blocks first
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Find the LAST occurrence of each label to skip any repeated think-block copies
  const optimistRegex = /optimist view[:\s]*/gi;
  const skepticRegex = /skeptic view[:\s]*/gi;

  let lastOptimistIdx = -1;
  let lastSkepticIdx = -1;
  let match: RegExpExecArray | null;

  while ((match = optimistRegex.exec(cleaned)) !== null) {
    lastOptimistIdx = match.index + match[0].length;
  }
  while ((match = skepticRegex.exec(cleaned)) !== null) {
    lastSkepticIdx = match.index + match[0].length;
  }

  if (lastOptimistIdx === -1 || lastSkepticIdx === -1) {
    // Fallback: couldn't parse, return everything in optimist
    return { optimist: cleaned, skeptic: "" };
  }

  let optimist: string;
  let skeptic: string;

  if (lastOptimistIdx < lastSkepticIdx) {
    optimist = cleaned.slice(lastOptimistIdx, cleaned.lastIndexOf("Skeptic") !== -1
      ? cleaned.toLowerCase().lastIndexOf("skeptic view")
      : lastSkepticIdx).trim();
    skeptic = cleaned.slice(lastSkepticIdx).trim();
  } else {
    skeptic = cleaned.slice(lastSkepticIdx, cleaned.toLowerCase().lastIndexOf("optimist view")).trim();
    optimist = cleaned.slice(lastOptimistIdx).trim();
  }

  return { optimist, skeptic };
}