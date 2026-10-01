import test from "node:test";
import assert from "node:assert/strict";
import { filterMoviePage, isCategory, mergeMovies, categoryEndpoints } from "../../app/lib/catalog.ts";
const movie = (id, release_date = "2026-10-01") => ({ id, title: `Movie ${id}`, release_date });
test("upcoming filtering preserves today's releases and pagination across empty pages", () => {
  const data = { results: [movie(1, "2026-09-30"), movie(2), movie(3, "2026-10-02"), movie(4, "")], page: 1, total_pages: 7 };
  assert.deepEqual(filterMoviePage(data, "upcoming", "2026-10-01"), { ...data, results: [movie(2), movie(3, "2026-10-02")] });
  assert.deepEqual(filterMoviePage({ ...data, results: [movie(1, "2026-09-30")] }, "upcoming", "2026-10-01"), { results: [], page: 1, total_pages: 7 });
});
test("movie pages are merged without duplicate IDs or reordered cards", () => {
  assert.deepEqual(mergeMovies([movie(1), movie(2)], [movie(2), movie(3)]).map((item) => item.id), [1, 2, 3]);
});
test("category validation rejects inherited names and routes popular consistently", () => {
  assert.equal(isCategory("popular"), true);
  assert.equal(categoryEndpoints.popular, "movie/popular");
  for (const invalid of [null, "constructor", "__proto__", "toString", "tv"]) assert.equal(isCategory(invalid), false);
});
