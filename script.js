function updateStats() {
  const states = movies.map((m) => getMovieState(m.id));

  const watchedCount   = states.filter((s) => s?.watched === true).length;
  const favoritesCount = states.filter((s) => s?.favorite === true).length;
  const ratings        = states.map((s) => s?.rating).filter((r) => r !== null && r !== undefined);
  const avgRating      = ratings.length
    ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
    : null;

  document.getElementById("watched-count").textContent   = watchedCount;
  document.getElementById("favorites-count").textContent = favoritesCount;
  document.getElementById("average-rating").textContent  = avgRating ?? "—";
}

function createStarRating(movieId, initialRating) {
  const container = document.createElement("div");
  container.className = "star-rating";
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", "Star rating");

  function updateStars(rating) {
    container.querySelectorAll(".star").forEach((star) => {
      const filled = Number(star.dataset.value) <= rating;
      star.textContent = filled ? "⭐" : "☆";
      star.classList.toggle("filled", filled);
    });
  }

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("button");
    star.className = "star";
    star.dataset.value = i;
    star.setAttribute("aria-label", `Rate ${i} star${i > 1 ? "s" : ""}`);
    star.textContent = "☆";

    star.addEventListener("click", () => {
      const current = getMovieState(movieId)?.rating ?? null;
      const newRating = current === i ? null : i;
      setRating(movieId, newRating);
      updateStars(newRating ?? 0);
      updateStats();
    });

    container.appendChild(star);
  }

  updateStars(initialRating ?? 0);
  return container;
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.dataset.id = movie.id;

  const state = getMovieState(movie.id);
  const isFavorite = state?.favorite ?? false;
  const isWatched = state?.watched ?? false;

  const savedReview = state?.review ?? "";

  card.innerHTML = `
    ${movie.poster ? `<img class="movie-poster" src="${movie.poster}" alt="${movie.title} poster" loading="lazy">` : ""}
    <div class="card-header">
      <h3 class="movie-title">${movie.title}</h3>
      <span class="movie-genre">${movie.genre}</span>
    </div>
    <div class="card-actions">
      <button class="btn-watched${isWatched ? " watched" : ""}" aria-label="Toggle watched" aria-pressed="${isWatched}">
        ${isWatched ? "✔ Watched" : "Mark Watched"}
      </button>
      <button class="btn-favorite" aria-label="Toggle favorite" aria-pressed="${isFavorite}">
        ${isFavorite ? "❤️" : "🤍"}
      </button>
    </div>
    <div class="card-rating"></div>
    <div class="review-section">
      <textarea class="review-input" rows="2" placeholder="Write a review...">${savedReview}</textarea>
      <button class="btn-save-review">Save Review</button>
    </div>
  `;

  card.querySelector(".card-rating").appendChild(createStarRating(movie.id, state?.rating));

  card.querySelector(".btn-watched").addEventListener("click", () => {
    toggleWatched(movie.id);
    const nowWatched = getMovieState(movie.id).watched;
    const btn = card.querySelector(".btn-watched");
    btn.textContent = nowWatched ? "✔ Watched" : "Mark Watched";
    btn.setAttribute("aria-pressed", nowWatched);
    btn.classList.toggle("watched", nowWatched);
    updateStats();
  });

  card.querySelector(".btn-favorite").addEventListener("click", () => {
    toggleFavorite(movie.id);
    const nowFavorite = getMovieState(movie.id).favorite;
    const btn = card.querySelector(".btn-favorite");
    btn.textContent = nowFavorite ? "❤️" : "🤍";
    btn.setAttribute("aria-pressed", nowFavorite);
    updateStats();
  });

  card.querySelector(".btn-save-review").addEventListener("click", () => {
    const text = card.querySelector(".review-input").value;
    setReview(movie.id, text);
    const btn = card.querySelector(".btn-save-review");
    btn.textContent = "Saved!";
    setTimeout(() => { btn.textContent = "Save Review"; }, 1500);
  });

  return card;
}

function renderMovies(movieList) {
  const container = document.getElementById("movie-list");
  container.innerHTML = "";

  if (movieList.length === 0) {
    container.innerHTML = `<p class="empty-state">No movies match this filter.</p>`;
    return;
  }

  movieList.forEach((movie) => {
    container.appendChild(createMovieCard(movie));
  });
}

const filters = {
  all:       (list) => list,
  watched:   (list) => list.filter((m) => getMovieState(m.id)?.watched === true),
  favorites: (list) => list.filter((m) => getMovieState(m.id)?.favorite === true),
};

let activeFilter = "all";
let activeGenre  = null;

function render() {
  let result = filters[activeFilter](movies);
  if (activeGenre) result = result.filter((m) => m.genre === activeGenre);
  renderMovies(result);
}

function buildGenreBar() {
  const genres = [...new Set(movies.map((m) => m.genre))].sort();
  const bar = document.getElementById("genre-bar");

  const allBtn = document.createElement("button");
  allBtn.className = "genre-btn active";
  allBtn.dataset.genre = "";
  allBtn.textContent = "All Genres";
  bar.appendChild(allBtn);

  genres.forEach((genre) => {
    const btn = document.createElement("button");
    btn.className = "genre-btn";
    btn.dataset.genre = genre;
    btn.textContent = genre;
    bar.appendChild(btn);
  });
}

function resetFilters() {
  activeFilter = "all";
  activeGenre  = null;

  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === "all");
  });
  document.querySelectorAll(".genre-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.genre === "");
  });

  render();
}

document.getElementById("filter-bar").addEventListener("click", (e) => {
  if (e.target.closest("#btn-reset-filters")) { resetFilters(); return; }
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  activeFilter = btn.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });
  render();
});

document.getElementById("genre-bar").addEventListener("click", (e) => {
  const btn = e.target.closest(".genre-btn");
  if (!btn) return;
  activeGenre = btn.dataset.genre || null;
  document.querySelectorAll(".genre-btn").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });
  render();
});

buildGenreBar();
render();
updateStats();
