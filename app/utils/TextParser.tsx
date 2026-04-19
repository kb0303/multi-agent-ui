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
  const optimistRegex =
    /optimist\s*view\s*:?\s*([\s\S]*?)(?=skeptic\s*view\s*:|$)/i;

  const skepticRegex =
    /skeptic\s*view\s*:?\s*([\s\S]*)/i;

  const optimistMatch = text.match(optimistRegex);
  const skepticMatch = text.match(skepticRegex);

  return {
    optimist: optimistMatch?.[1]?.trim() || "",
    skeptic: skepticMatch?.[1]?.trim() || "",
  };
}