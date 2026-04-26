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
        model:  "llama3",
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
            const parsed = JSON.parse(data);

            // Ollama signals failures (e.g. model not found) with a non-200
            // status and an "error" string in the body.
            if (ollamaRes.statusCode !== 200) {
              const msg = parsed?.error || `Ollama returned status ${ollamaRes.statusCode}`;
              console.error("Ollama error:", msg);
              send(res, 502, { error: msg });
              return;
            }

            const enhanced = parsed?.response;
            if (typeof enhanced !== "string" || !enhanced.trim()) {
              throw new Error("Unexpected response shape from Ollama");
            }

            send(res, 200, { enhanced: enhanced.trim() });
          } catch (err) {
            console.error("Failed to parse Ollama response:", err.message);
            send(res, 500, { error: "Failed to parse Ollama response." });
          }
        });
      });

      // 5. Hard timeout — prevents the request hanging if Ollama is busy.
      //    Guard with res.headersSent so the destroy() call below does not
      //    trigger the error handler and attempt a second send().
      ollamaReq.setTimeout(30000, () => {
        ollamaReq.destroy();
        if (!res.headersSent) {
          send(res, 504, { error: "Ollama timed out. The model may still be loading — try again in a moment." });
        }
      });

      // 6. Handle network-level errors — server will not crash.
      //    res.headersSent guard covers the case where the timeout fired first
      //    and destroy() subsequently emits an error event.
      ollamaReq.on("error", (err) => {
        console.error("Ollama connection error:", err.message);
        if (res.headersSent) return;
        let msg;
        if (err.code === "ECONNREFUSED") {
          msg = "Cannot connect to Ollama. Make sure it is running: `ollama serve`";
        } else if (err.code === "ECONNRESET") {
          msg = "Ollama closed the connection. The model may not be pulled — run: `ollama pull llama3`";
        } else {
          msg = "Failed to reach Ollama: " + err.message;
        }
        send(res, 502, { error: msg });
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
