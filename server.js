const http = require("http");

const PORT = 3001;

const TONE_INSTRUCTIONS = {
  professional: "Use a polished, formal tone — clear sentences, precise vocabulary, suitable for a film publication.",
  casual:       "Use a relaxed, conversational tone — like a friend recommending a movie over coffee.",
  funny:        "Use a light, humorous tone — include wit and playful observations while keeping the core opinion.",
  dramatic:     "Use a vivid, expressive tone — heightened language that makes the review feel cinematic and emotional.",
};

const ALLOWED_TONES = Object.keys(TONE_INSTRUCTIONS);

function buildPrompt(review, tone) {
  const toneGuide = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;
  return (
    "You are a movie review assistant. Rewrite the following review to be clear, " +
    "engaging, and well-structured. Keep the original opinion. Do not add new information. " +
    "Return only the improved review.\n\n" +
    "Tone instruction: " + toneGuide + "\n\n" +
    "Review:\n" + review
  );
}

// ─── CORS helper ─────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ─── Safe JSON response ───────────────────────────────────────────────────────
function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

// ─── Main server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  setCors(res);

  // Pre-flight request from the browser
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/enhance-review") {
    let body = "";

    req.on("data", (chunk) => { body += chunk; });

    req.on("end", () => {
      // 1. Parse the incoming review text and tone
      let review, tone;
      try {
        ({ review, tone } = JSON.parse(body));
      } catch {
        send(res, 400, { enhanced: "Error generating review." });
        return;
      }

      if (!review || !review.trim()) {
        send(res, 400, { enhanced: "Error generating review." });
        return;
      }

      // Fall back to "professional" if the tone is missing or unrecognised
      if (!ALLOWED_TONES.includes(tone)) {
        tone = "professional";
      }

      // 2. Build the Ollama request body
      //    stream: false → Ollama returns one complete JSON object instead of a stream
      const payload = JSON.stringify({
        model:  "gemma:2b",
        prompt: buildPrompt(review.trim(), tone),
        stream: false,
      });

      const options = {
        hostname: "localhost",
        port:     11434,
        path:     "/api/generate",
        method:   "POST",
        headers:  {
          "Content-Type":   "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      // 3. Call the local Ollama server
      const ollamaReq = http.request(options, (ollamaRes) => {
        let data = "";
        ollamaRes.on("data", (chunk) => { data += chunk; });
        ollamaRes.on("end", () => {
          // 4. Safely parse Ollama's response
          //    The generated text lives in the "response" field
          try {
            const parsed   = JSON.parse(data);
            const enhanced = parsed?.response;

            if (typeof enhanced !== "string" || !enhanced.trim()) {
              throw new Error("Unexpected response shape");
            }

            send(res, 200, { enhanced: enhanced.trim() });
          } catch {
            send(res, 500, { enhanced: "Error generating review." });
          }
        });
      });

      // 5. Handle network-level errors — server will not crash
      //    (e.g. Ollama is not running)
      ollamaReq.on("error", () => {
        send(res, 500, { enhanced: "Error generating review." });
      });

      ollamaReq.write(payload);
      ollamaReq.end();
    });

    req.on("error", () => {
      send(res, 500, { enhanced: "Error generating review." });
    });

    return;
  }

  // Any other route
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`ReelTalk AI server running → http://localhost:${PORT}`);
  console.log("Requests will be forwarded to Ollama at http://localhost:11434");
});
