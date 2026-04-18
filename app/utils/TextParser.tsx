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


export function parseDebate(text: string) {
  const optimistMatch = text.split("🔴 Skeptic View:");
  
  const optimistPart = optimistMatch[0]?.replace("🟢 Optimist View:", "").trim();
  const skepticPart = optimistMatch[1]?.trim();

  return {
    optimist: optimistPart || "",
    skeptic: skepticPart || "",
  };
}