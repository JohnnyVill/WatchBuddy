import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
export function browserExecutable() {
  return [
    process.env.BROWSER_EXECUTABLE,
    process.platform === "win32" && "C:/Program Files/Google/Chrome/Application/chrome.exe",
    process.platform === "win32" && "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  ].filter(Boolean).find(existsSync);
}
export async function launchBrowser() {
  const executable = browserExecutable();
  if (!executable) throw new Error("Install Chrome/Chromium or set BROWSER_EXECUTABLE.");
  mkdirSync(".cache/browser", { recursive: true });
  const profile = mkdtempSync(resolve(".cache/browser/profile-"));
  const child = spawn(executable, [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "about:blank",
  ], { windowsHide: true, stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] });
  let nextId = 0, buffer = "", diagnostic = "";
  const pending = new Map(), handlers = new Map();
  child.stderr.on("data", (chunk) => { diagnostic = (diagnostic + chunk).slice(-2000); });
  child.stdio[4].on("data", (chunk) => {
    buffer += chunk.toString();
    let boundary;
    while ((boundary = buffer.indexOf("\0")) !== -1) {
      const raw = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 1);
      if (!raw) continue;
      const message = JSON.parse(raw);
      if (message.id) {
        const entry = pending.get(message.id);
        if (!entry) continue;
        clearTimeout(entry.timer); pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
      } else for (const handler of handlers.get(message.method) ?? []) handler(message.params, message.sessionId);
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolvePromise, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}. ${diagnostic}`)); }, 20000);
    pending.set(id, { resolve: resolvePromise, reject, timer });
    child.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + "\0");
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const command = (method, params) => send(method, params, sessionId);
  await command("Page.enable"); await command("Runtime.enable"); await command("Network.enable");
  await command("Page.bringToFront");
  return {
    command,
    on(method, callback) {
      const wrapped = (params, session) => { if (session === sessionId) callback(params); };
      const entries = handlers.get(method) ?? []; entries.push(wrapped); handlers.set(method, entries);
      return () => handlers.set(method, entries.filter((entry) => entry !== wrapped));
    },
    async evaluate(expression) {
      const response = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.text + ": " + JSON.stringify(response.exceptionDetails.exception));
      return response.result.value;
    },
    async close() {
      try { await send("Browser.close"); } catch { child.kill(); }
      for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error("Browser closed")); }
      pending.clear();
    },
  };
}
export async function waitFor(browser, expression, timeout = 15000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeout) {
    try { const result = await browser.evaluate(`(() => { const result = (${expression}); return result instanceof Node ? true : result; })()`); if (result) return result; } catch (error) { lastError = error; }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 75));
  }
  const state = await browser.evaluate(`({ url: location.href, text: document.body.innerText.slice(0, 1200), busy: [...document.querySelectorAll('[aria-busy="true"]')].map(el=>el.outerHTML.slice(0,200)) })`).catch(() => null);
  console.error("Browser timeout:", expression, state);
  await screenshot(browser, "test-results/timeout.png").catch(() => {});
  throw new Error(`Condition not met: ${expression}${lastError ? " — " + lastError.message : ""}`);
}
export async function click(browser, selector) {
  const bounds = await waitFor(browser, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el || el.disabled) return false; el.scrollIntoView({block:'center',behavior:'instant'}); const r = el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await browser.command("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...bounds });
  await browser.command("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...bounds });
}
export async function fill(browser, selector, value) {
  await browser.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  await browser.command("Input.insertText", { text: value });
}
export async function key(browser, key, code = key) {
  await browser.command("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: key === "Tab" ? 9 : key === "Escape" ? 27 : key === "Enter" ? 13 : undefined });
  if (key === "Enter") await browser.command("Input.dispatchKeyEvent", { type: "char", text: "\r", key, code, windowsVirtualKeyCode: 13 });
  await browser.command("Input.dispatchKeyEvent", { type: "keyUp", key, code });
}
export async function screenshot(browser, path) {
  mkdirSync(dirname(path), { recursive: true });
  await browser.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
  const { data } = await browser.command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(path, Buffer.from(data, "base64"));
}
