import { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import { marked } from "marked";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      topic,
      report,
      search_results,
      scraped_content,
      feedback,
      debate,
    } = body;

    // Merging all markdown sections
    const markdown = `
# Research Report

**Topic:** ${topic}

---

# Main Report

${report}

---

# Search Data

${search_results}

---

# Scraped Content

${scraped_content}

---

# Critic Feedback

${feedback}

---

# Debate

${debate}
`;

    // Convert markdown -> HTML
    const htmlContent = marked.parse(markdown);

    // Final styled HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
body{
  font-family: Arial, sans-serif;
  padding:40px;
  color:#111;
  line-height:1.6;
  font-size:14px;
}
h1{
  font-size:28px;
  margin-bottom:12px;
  border-bottom:2px solid #ddd;
  padding-bottom:8px;
}
h2{
  margin-top:30px;
  color:#222;
}
h3{
  margin-top:20px;
}
p{
  margin:10px 0;
}
ul,ol{
  padding-left:22px;
}
code{
  background:#f3f3f3;
  padding:2px 4px;
}
blockquote{
  border-left:4px solid #ccc;
  padding-left:12px;
  color:#555;
}
hr{
  margin:30px 0;
}
table{
  border-collapse: collapse;
  width:100%;
}
td,th{
  border:1px solid #ccc;
  padding:8px;
}
</style>
</head>
<body>
${htmlContent}
</body>
</html>
`;

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "25px",
        bottom: "25px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="research-report.pdf"`,
      },
    });
  } catch (error) {
    return Response.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}