const STORAGE_KEY = "reeltalk_user_movies";

function getUserMovies() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
}

function saveUserMovies(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getMovieState(id) {
  return getUserMovies()[id] ?? null;
}

/**
 * Creates or updates the stored state for a movie.
 * Only the fields present in `updates` are changed.
 */
function updateMovie(id, updates) {
  const data = getUserMovies();
  data[id] = {
    watched: false,
    favorite: false,
    rating: null,
    watchedAt: null,
    ...data[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveUserMovies(data);
}

function toggleFavorite(id) {
  const current = getMovieState(id);
  updateMovie(id, { favorite: !current?.favorite });
}

function toggleWatched(id) {
  const current = getMovieState(id);
  const nowWatched = !current?.watched;
  updateMovie(id, {
    watched: nowWatched,
    watchedAt: nowWatched ? new Date().toISOString() : null,
  });
}

function setRating(id, rating) {
  if (rating !== null && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    throw new RangeError("Rating must be an integer between 1 and 5, or null to clear.");
  }
  updateMovie(id, { rating });
}

function setReview(id, review) {
  updateMovie(id, { review: review.trim() || null });
}
