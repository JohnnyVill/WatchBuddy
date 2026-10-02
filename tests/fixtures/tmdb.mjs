import http from "node:http";
export const makeMovie = (id, overrides = {}) => ({
  id, title: `Fixture movie ${id}`, poster_path: null, backdrop_path: null,
  release_date: "2099-01-01", vote_average: 7.8, overview: "A movie for a quieter evening.",
  tagline: "A story worth remembering.", runtime: 104, genres: [{ id: 18, name: "Drama" }],
  ...overrides,
});
export async function startTmdbFixture(port = 0) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    const page = Number(url.searchParams.get("page") || 1);
    response.setHeader("Content-Type", "application/json");
    if (url.pathname === "/3/search/movie") {
      const query = url.searchParams.get("query");
      if (query === "unavailable") { response.writeHead(503); response.end(JSON.stringify({ message: "Unavailable" })); return; }
      const results = query === "no matches" ? [] : [makeMovie(page, { title: `${query} result ${page}` })];
      response.end(JSON.stringify({ results, page, total_pages: results.length ? 2 : 0 })); return;
    }
    if (url.pathname === "/3/movie/503") { response.writeHead(503); response.end(JSON.stringify({ message: "Unavailable" })); return; }
    if (/\/movie\/(popular|top_rated|now_playing|upcoming)$/.test(url.pathname)) {
      const upcoming = url.pathname.endsWith("/upcoming");
      const results = Array.from({ length: 12 }, (_, index) => makeMovie((page - 1) * 11 + index + 1, upcoming && page === 1 ? { release_date: "2000-01-01" } : {}));
      response.end(JSON.stringify({ results, page, total_pages: 3 })); return;
    }
    if (url.pathname.endsWith("/videos")) { response.end(JSON.stringify({ results: [] })); return; }
    if (url.pathname.endsWith("/watch/providers")) {
      response.end(JSON.stringify({ results: { US: {
        link: "https://www.themoviedb.org/movie/1/watch",
        flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: null }],
        rent: [{ provider_id: 2, provider_name: "Apple TV", logo_path: null }],
        buy: [{ provider_id: 2, provider_name: "Apple TV", logo_path: null }],
      } } })); return;
    }
    const match = url.pathname.match(/\/movie\/(\d+)$/);
    if (match && match[1] !== "404") { response.end(JSON.stringify(makeMovie(Number(match[1])))); return; }
    response.writeHead(404); response.end(JSON.stringify({ message: "Not found" }));
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}/3` };
}
