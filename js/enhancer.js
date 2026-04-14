// ─── AI Review Enhancer ───────────────────────────────────────────────────────

(function () {
  const textarea    = document.getElementById("raw-review");
  const toneSelect  = document.getElementById("tone-select");
  const btn         = document.getElementById("enhance-btn");
  const clearBtn    = document.getElementById("clear-btn");
  const output      = document.getElementById("enhance-output");
  const outputText  = document.getElementById("enhance-text");
  const errorBox    = document.getElementById("enhance-error");

  clearBtn.addEventListener("click", () => {
    textarea.value         = "";
    output.hidden          = true;
    outputText.textContent = "";
    errorBox.hidden        = true;
    errorBox.textContent   = "";
  });

  btn.addEventListener("click", async () => {
    const review = textarea.value.trim();
    const tone   = toneSelect.value;

    // Clear any previous results
    output.hidden    = true;
    errorBox.hidden  = true;
    outputText.textContent = "";
    errorBox.textContent   = "";

    if (!review) {
      errorBox.textContent = "Please write a review before enhancing.";
      errorBox.hidden      = false;
      return;
    }

    // Loading state
    btn.textContent = "Enhancing…";
    btn.disabled    = true;

    try {
      const res = await fetch("http://localhost:3001/enhance-review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ review, tone }),
      });

      const data = await res.json();

      if (!res.ok || data.enhanced === "Error generating review.") {
        throw new Error("Server error");
      }

      outputText.textContent = data.enhanced;
      output.hidden          = false;
    } catch {
      errorBox.textContent = "Something went wrong. Please try again in a moment.";
      errorBox.hidden      = false;
    } finally {
      btn.textContent = "✨ Enhance Review";
      btn.disabled    = false;
    }
  });
})();
