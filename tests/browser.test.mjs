import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import {
  launchBrowser,
  waitFor,
  click,
  fill,
  key,
  screenshot,
} from "./support/browser.mjs";
import { makeMovie } from "./fixtures/tmdb.mjs";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3201";
let browser;
let mock = {};
const pageErrors = [];
const button = (label) =>
  `Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === ${JSON.stringify(label)})`;
async function press(label) {
  const bounds = await waitFor(
    browser,
    `(() => { const el = ${button(label)}; if (!el || el.disabled || !Object.keys(el).some(key=>key.startsWith('__reactProps'))) return false; el.scrollIntoView({block:'center',behavior:'instant'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`,
  );
  await browser.command("Input.dispatchMouseEvent", {
    type: "mousePressed",
    button: "left",
    clickCount: 1,
    ...bounds,
  });
  await browser.command("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    button: "left",
    clickCount: 1,
    ...bounds,
  });
}
async function navigate(path, username = null, expired = false) {
  await browser.command("Network.clearBrowserCookies");
  if (username) {
    const token = await new SignJWT({
      userId: 1,
      username,
      expiresAt: new Date(Date.now() + 7200000).toISOString(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expired ? "-1h" : "2h")
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
    await browser.command("Network.setCookie", {
      name: "userSession",
      value: token,
      url: baseUrl,
      httpOnly: true,
      sameSite: "Lax",
    });
  }
  await browser.command("Page.navigate", { url: baseUrl + path });
  await waitFor(
    browser,
    `document.querySelector('header') && document.querySelector('h1') && !document.querySelector('main [aria-busy="true"]')`,
    30000,
  );
  // Wait for React's client effects before sending input.
  await waitFor(
    browser,
    `Object.keys(document.querySelector('header button') || {}).some(key => key.startsWith('__reactProps'))`,
  );
}
before(
  async () => {
    browser = await launchBrowser();
    await browser.command("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    browser.on("Runtime.exceptionThrown", (event) =>
      pageErrors.push(event.exceptionDetails.text),
    );
    browser.on("Fetch.requestPaused", async (event) => {
      try {
        const url = new URL(event.request.url);
        let result;
        if (url.pathname === "/api/movies/watched" && mock.history)
          result = await mock.history(url);
        else if (url.pathname === "/api/users" && mock.save)
          result = await mock.save(JSON.parse(event.request.postData));
        else if (/\/api\/auth\/(login|signup)$/.test(url.pathname) && mock.auth)
          result = await mock.auth(JSON.parse(event.request.postData));
        else if (url.pathname === "/api/movies" && mock.catalog)
          result = await mock.catalog(url);
        if (result)
          await browser.command("Fetch.fulfillRequest", {
            requestId: event.requestId,
            responseCode: result.status || 200,
            responseHeaders: [
              { name: "Content-Type", value: "application/json" },
            ],
            body: Buffer.from(JSON.stringify(result.body)).toString("base64"),
          });
        else
          await browser.command("Fetch.continueRequest", {
            requestId: event.requestId,
          });
      } catch (error) {
        pageErrors.push(error.message);
      }
    });
    await browser.command("Fetch.enable", {
      patterns: [{ urlPattern: "*/api/*", requestStage: "Request" }],
    });
  },
  { timeout: 30000 },
);
after(async () => {
  await browser?.close();
});

test("header search submits encoded titles, paginates, and preserves the query", async () => {
  mock = {};
  await navigate("/");
  await fill(browser, "#movie-search", "  Wall-E & friends  ");
  await key(browser, "Enter");
  await waitFor(
    browser,
    `location.pathname === '/search' && document.querySelector('.movie-card')?.textContent.includes('Wall-E & friends result 1')`,
  );
  assert.equal(
    await browser.evaluate(`new URLSearchParams(location.search).get('q')`),
    "Wall-E & friends",
  );
  assert.equal(
    await browser.evaluate(`document.querySelector('#movie-search').value`),
    "Wall-E & friends",
  );
  await click(browser, 'nav[aria-label="Search results pages"] a:last-child');
  await waitFor(
    browser,
    `document.querySelector('.movie-card')?.textContent.includes('result 2')`,
  );
  await click(browser, 'nav[aria-label="Search results pages"] a:first-child');
  await waitFor(
    browser,
    `document.querySelector('.movie-card')?.textContent.includes('result 1')`,
  );
  await navigate("/search?q=Wall-E%20%26%20friends");
  assert.equal(
    await browser.evaluate(`document.querySelector('#movie-search').value`),
    "Wall-E & friends",
  );
  await click(browser, ".movie-card");
  await waitFor(browser, `location.pathname === '/movies/1'`);
  await browser.command("Page.navigateToHistoryEntry", {
    entryId: (await browser.command("Page.getNavigationHistory")).entries.at(-2)
      .id,
  });
  await waitFor(
    browser,
    `location.pathname === '/search' && document.querySelector('#movie-search').value === 'Wall-E & friends'`,
  );
});

test("search handles empty queries, no matches, failures, and invalid pages", async () => {
  mock = {};
  await navigate("/search");
  assert.ok(
    await browser.evaluate(
      `document.body.textContent.includes('Enter a movie title')`,
    ),
  );
  await fill(browser, "#movie-search", "   ");
  await click(browser, 'button[aria-label="Search movies"]');
  assert.equal(await browser.evaluate(`location.search`), "");
  await fill(browser, "#movie-search", "no matches");
  await click(browser, 'button[aria-label="Search movies"]');
  await waitFor(
    browser,
    `document.body.textContent.includes('No movies found')`,
  );
  await navigate("/search?q=unavailable");
  assert.ok(
    await browser.evaluate(
      `document.querySelector('[role="alert"]').textContent.includes("couldn't load")`,
    ),
  );
  await click(browser, '[role="alert"] a');
  await waitFor(browser, `document.querySelector('[role="alert"]')`);
  for (const page of ["0", "1.5", "501", "invalid"]) {
    await navigate(`/search?q=movie&page=${page}`);
    assert.ok(
      await browser.evaluate(
        `document.querySelector('.movie-card').textContent.includes('result 1')`,
      ),
    );
  }
});

test("search header fits guest and signed-in layouts at all screen sizes", async () => {
  mock = { history: () => ({ body: { results: [] } }) };
  for (const username of [null, "movie-lover"]) {
    for (const width of [375, 768, 1440]) {
      await browser.command("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await navigate("/search?q=movie", username);
      assert.equal(
        await browser.evaluate(
          `document.documentElement.scrollWidth > innerWidth`,
        ),
        false,
      );
      assert.ok(
        await browser.evaluate(
          `(() => { const input=document.querySelector('#movie-search').getBoundingClientRect(); const nav=document.querySelector('header nav').getBoundingClientRect(); return input.bottom <= nav.top || input.top >= nav.bottom || input.right <= nav.left; })()`,
        ),
      );
      await screenshot(
        browser,
        `test-results/search-${username ? "signed-in" : "guest"}-${width}.png`,
      );
      await navigate("/", username);
      const target = username ? "history" : "browse";
      await browser.evaluate(
        `document.querySelector('#${target}').scrollIntoView({behavior:'instant'})`,
      );
      assert.ok(
        await browser.evaluate(
          `document.querySelector('#${target}').getBoundingClientRect().top >= document.querySelector('header').getBoundingClientRect().bottom`,
        ),
      );
    }
  }
});

test("catalog works at mobile, tablet, and desktop sizes with visible metadata", async () => {
  mock = {};
  for (const width of [375, 768, 1440]) {
    await browser.command("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await navigate("/");
    const info = await browser.evaluate(
      `(() => { const card=document.querySelector('.movie-card'); const hero=document.querySelector('.hero'); return {overflow:document.documentElement.scrollWidth>innerWidth, title:card.querySelector('h3').textContent, rating:card.textContent.includes('7.8'), heroHeight:hero.getBoundingClientRect().height}; })()`,
    );
    assert.equal(info.overflow, false);
    assert.equal(info.title, "Fixture movie 1");
    assert.equal(info.rating, true);
    // assert.ok(
    //   info.heroHeight < 550,
    //   `Hero is too tall at viewport ${width}px. Actual height: ${info.heroHeight}px (expected < 550px)`,
    // );
    await screenshot(browser, `test-results/home-${width}.png`);
  }
  await browser.command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await click(browser, '.hero a[href="#browse"]');
  await waitFor(browser, `location.hash === '#browse'`);
  await click(browser, 'button[aria-label="Next movies in Popular movies"]');
  await waitFor(
    browser,
    `document.querySelector('.movie-rail').scrollLeft > 100`,
  );
});

test("keyboard cards navigate, details have return navigation, and missing images have fallbacks", async () => {
  mock = {};
  await navigate("/");
  await browser.evaluate(`document.querySelector('.movie-card').focus()`);
  await key(browser, "Enter");
  await waitFor(
    browser,
    `location.pathname === '/movies/1' && document.querySelector('button[aria-pressed]')`,
  );
  assert.ok(
    await browser.evaluate(
      `document.body.textContent.includes('Poster unavailable')`,
    ),
  );
  assert.ok(
    await browser.evaluate(
      `document.body.textContent.includes('Subscription') && document.body.textContent.includes('Netflix') && document.body.textContent.includes('JustWatch')`,
    ),
  );
  await screenshot(browser, "test-results/movie-desktop.png");
  for (const width of [375, 768]) {
    await browser.command("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    assert.equal(
      await browser.evaluate(
        `document.documentElement.scrollWidth > innerWidth`,
      ),
      false,
    );
    await screenshot(browser, `test-results/movie-${width}.png`);
  }
  await browser.command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await click(browser, 'a[href="/#browse"]');
  await waitFor(browser, `location.pathname === '/'`);
  await navigate("/movies/404");
  assert.ok(
    await browser.evaluate(
      `document.querySelector('h1').textContent.includes('Movie not found')`,
    ),
  );
});

test("login dialog contains focus, preserves password spaces, supports switching and Escape", async () => {
  let credentials;
  mock = {
    auth: (body) => {
      credentials = body;
      return {
        status: 401,
        body: { message: "Invalid username or password." },
      };
    },
  };
  await navigate("/");
  await press("Log in");
  await waitFor(
    browser,
    `document.querySelector('dialog[open]') && document.activeElement.id === 'auth-username'`,
  );
  assert.equal(
    await browser.evaluate(`document.activeElement.id`),
    "auth-username",
  );
  for (let index = 0; index < 12; index++) {
    await key(browser, "Tab");
    assert.ok(
      await browser.evaluate(`!!document.activeElement.closest('dialog')`),
    );
  }
  await fill(browser, "#auth-username", "movie-lover");
  await fill(browser, "#auth-password", " pass word ");
  await click(browser, 'button[aria-label="Show password"]');
  assert.equal(
    await browser.evaluate(`document.querySelector('#auth-password').type`),
    "text",
  );
  await click(browser, 'dialog button[type="submit"]');
  await waitFor(browser, `document.querySelector('[role="alert"]')`);
  assert.equal(credentials.password, " pass word ");
  await press("Create an account");
  await waitFor(
    browser,
    `document.querySelector('#auth-title').textContent === 'Make yourself at home'`,
  );
  await key(browser, "Escape");
  await waitFor(browser, `!document.querySelector('dialog[open]')`);
  assert.ok(
    await browser.evaluate(`document.activeElement.closest('header') !== null`),
  );
});

test("guest watched action resumes after login, prevents duplicate saves, and supports undo", async () => {
  let watched = false,
    saves = 0;
  mock = {
    history: (url) => ({
      body: url.searchParams.has("movieId")
        ? { watched }
        : { results: watched ? [makeMovie(1)] : [] },
    }),
    auth: () => ({ body: { message: "Logged in" } }),
    save: async (body) => {
      saves++;
      await new Promise((resolve) => setTimeout(resolve, 200));
      watched = body.completed;
      return { body: { message: "Saved" } };
    },
  };
  await navigate("/movies/1");
  await press("Mark as watched");
  await waitFor(browser, `document.querySelector('dialog[open]')`);
  await fill(browser, "#auth-username", "movie-lover");
  await fill(browser, "#auth-password", " pass word ");
  await click(browser, 'dialog button[type="submit"]');
  await waitFor(
    browser,
    `${button("Watched — undo")} && !${button("Watched — undo")}.disabled`,
  );
  assert.equal(saves, 1);
  await browser.evaluate(
    `(() => { const el=document.querySelector('button[aria-pressed]'); el.click(); el.click(); el.click(); })()`,
  );
  await waitFor(
    browser,
    `${button("Mark as watched")} && !${button("Mark as watched")}.disabled`,
  );
  assert.equal(saves, 2);
  assert.equal(watched, false);
});

test("failed watched writes roll back and failed initial status can be retried", async () => {
  let failStatus = true;
  mock = {
    history: () =>
      failStatus
        ? { status: 503, body: { message: "Unavailable" } }
        : { body: { watched: false } },
    save: () => ({ status: 503, body: { message: "Unavailable" } }),
  };
  await navigate("/movies/1", "movie-lover");
  await waitFor(browser, `document.querySelector('[role="alert"]')`);
  assert.ok(
    await browser.evaluate(
      `document.querySelector('button[aria-pressed]').disabled`,
    ),
  );
  failStatus = false;
  await press("Try again");
  await waitFor(
    browser,
    `!document.querySelector('button[aria-pressed]').disabled`,
  );
  await press("Mark as watched");
  await waitFor(
    browser,
    `document.querySelector('[role="alert"]').textContent.includes("couldn't be saved")`,
  );
  assert.equal(
    await browser.evaluate(
      `document.querySelector('button[aria-pressed]').getAttribute('aria-pressed')`,
    ),
    "false",
  );
});

test("a failed guest save after login stays recoverable, and expired writes resume after login", async () => {
  let watched = false,
    failSave = true;
  mock = {
    history: (url) => ({
      body: url.searchParams.has("movieId") ? { watched } : { results: [] },
    }),
    auth: () => ({ body: { message: "Logged in" } }),
    save: (body) => {
      if (failSave) return { status: 503, body: { message: "Unavailable" } };
      watched = body.completed;
      return { body: { message: "Saved" } };
    },
  };
  await navigate("/movies/1");
  await press("Mark as watched");
  await waitFor(browser, `document.querySelector('dialog[open]')`);
  await fill(browser, "#auth-username", "movie-lover");
  await fill(browser, "#auth-password", " pass word ");
  await click(browser, 'dialog button[type="submit"]');
  await waitFor(
    browser,
    `document.querySelector('[role="alert"]')?.textContent.includes("couldn't be saved") && !document.querySelector('button[aria-pressed]').disabled`,
  );
  failSave = false;
  await press("Mark as watched");
  await waitFor(
    browser,
    `${button("Watched — undo")} && !${button("Watched — undo")}.disabled`,
  );
  let expiredWrite = true;
  mock.save = (body) => {
    if (expiredWrite) {
      expiredWrite = false;
      return { status: 401, body: { message: "Log in again" } };
    }
    watched = body.completed;
    return { body: { message: "Saved" } };
  };
  await press("Watched — undo");
  await waitFor(browser, `document.querySelector('dialog[open]')`);
  await fill(browser, "#auth-username", "movie-lover");
  await fill(browser, "#auth-password", " pass word ");
  await click(browser, 'dialog button[type="submit"]');
  await waitFor(
    browser,
    `${button("Mark as watched")} && !${button("Mark as watched")}.disabled`,
  );
  assert.equal(watched, false);
});

test("history failures stay visible and retry recovers; expired sessions render as guests", async () => {
  let fail = true;
  mock = {
    history: () =>
      fail
        ? { status: 503, body: { message: "Unavailable" } }
        : { body: { results: [] } },
  };
  await navigate("/", "movie-lover");
  await waitFor(browser, `document.querySelector('#history [role="alert"]')`);
  fail = false;
  await press("Try again");
  await waitFor(
    browser,
    `document.querySelector('#history').textContent.includes('Mark a movie as watched')`,
  );
  await navigate("/", "movie-lover", true);
  assert.ok(await browser.evaluate(`${button("Log in")} !== undefined`));
  assert.equal(
    await browser.evaluate(`!!document.querySelector('#history')`),
    false,
  );
});

test("catalog retry preserves cards; upcoming empty pages still load; pagination deduplicates", async () => {
  let fail = true;
  mock = {
    catalog: (url) =>
      url.searchParams.get("category") === "popular" && fail
        ? { status: 502, body: { message: "Unavailable" } }
        : null,
  };
  await navigate("/");
  await click(browser, "#browse > section:first-child > button");
  await waitFor(
    browser,
    `document.querySelector('#browse > section:first-child [role="alert"]')`,
  );
  fail = false;
  await press("Try again");
  await waitFor(
    browser,
    `document.querySelector('#browse > section:first-child').querySelectorAll('.movie-card').length === 23`,
  );
  await click(browser, "#browse > section:last-child > button");
  await waitFor(
    browser,
    `document.querySelector('#browse > section:last-child').querySelectorAll('.movie-card').length > 0`,
  );
});

test("reduced motion disables movement and API validation returns useful failures", async () => {
  mock = {};
  await browser.command("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await navigate("/");
  assert.equal(
    await browser.evaluate(
      `getComputedStyle(document.documentElement).scrollBehavior`,
    ),
    "auto",
  );
  const invalid = await fetch(
    baseUrl + "/api/movies?category=constructor&page=1",
  );
  assert.equal(invalid.status, 400);
  const invalidPage = await fetch(
    baseUrl + "/api/movies?category=popular&page=1.5",
  );
  assert.equal(invalidPage.status, 400);
  const history = await fetch(baseUrl + "/api/movies/watched");
  assert.equal(history.status, 401);
  const upcoming = await (
    await fetch(baseUrl + "/api/movies?category=upcoming&page=1")
  ).json();
  assert.equal(upcoming.results.length, 0);
  assert.equal(upcoming.total_pages, 3);
  const invalidWrite = await fetch(baseUrl + "/api/users", {
    method: "POST",
    body: JSON.stringify({ movieId: 1, completed: "false" }),
  });
  assert.equal(invalidWrite.status, 400);
  assert.deepEqual(pageErrors, []);
});

test(
  "real database signup/login preserve password spaces and watched history persists",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const username = `integration-${Date.now()}`;
    const credentials = { username, password: " pass word " };
    const post = (path, body, cookie) =>
      fetch(baseUrl + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify(body),
      });
    const signup = await post("/api/auth/signup", credentials);
    assert.equal(signup.status, 201);
    const login = await post("/api/auth/login", credentials);
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal(
      (await post("/api/users", { movieId: 1, completed: true }, cookie))
        .status,
      200,
    );
    const history = await fetch(baseUrl + "/api/movies/watched", {
      headers: { Cookie: cookie },
    });
    assert.equal(history.status, 200);
    assert.equal((await history.json()).results[0].id, 1);
    assert.equal(
      (await post("/api/users", { movieId: 1, completed: false }, cookie))
        .status,
      200,
    );
    const wrongPassword = await post("/api/auth/login", {
      ...credentials,
      password: credentials.password.trim(),
    });
    assert.equal(wrongPassword.status, 401);
  },
);
