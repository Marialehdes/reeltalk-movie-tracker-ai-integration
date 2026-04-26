// ─── AI Review Enhancer ───────────────────────────────────────────────────────

(function () {
  const textarea    = document.getElementById("raw-review");
  const toneSelect  = document.getElementById("tone-select");
  const btn         = document.getElementById("enhance-btn");
  const clearBtn    = document.getElementById("clear-btn");
  const output      = document.getElementById("enhance-output");
  const outputText  = document.getElementById("enhance-text");
  const errorBox    = document.getElementById("enhance-error");
  const loadingMsg  = document.getElementById("enhance-loading");

  clearBtn.addEventListener("click", () => {
    textarea.value         = "";
    output.hidden          = true;
    outputText.textContent = "";
    errorBox.hidden        = true;
    errorBox.textContent   = "";
    loadingMsg.hidden      = true;
  });

  btn.addEventListener("click", async () => {
    const review = textarea.value.trim();
    const tone   = toneSelect.value;

    // Clear any previous results
    output.hidden          = true;
    errorBox.hidden        = true;
    loadingMsg.hidden      = true;
    outputText.textContent = "";
    errorBox.textContent   = "";

    if (!review) {
      errorBox.textContent = "Please write a review before enhancing.";
      errorBox.hidden      = false;
      return;
    }

    // Loading state
    btn.textContent   = "Enhancing…";
    btn.disabled      = true;
    loadingMsg.hidden = false;

    try {
      const res = await fetch("http://localhost:3001/enhance-review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ review, tone }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Server error");
      }

      outputText.textContent = data.enhanced;
      output.hidden          = false;
    } catch (err) {
      errorBox.textContent = err.message || "Something went wrong. Please try again in a moment.";
      errorBox.hidden      = false;
    } finally {
      btn.textContent   = "✨ Enhance Review";
      btn.disabled      = false;
      loadingMsg.hidden = true;
    }
  });
})();
