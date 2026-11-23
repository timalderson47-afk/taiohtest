"use strict";

const { createHash, randomBytes, timingSafeEqual } = require("node:crypto");
const { createReadStream, existsSync, readFileSync, renameSync, rmSync, writeFileSync } = require("node:fs");
const { createServer } = require("node:http");
const { join } = require("node:path");

const hash = value => createHash("sha256").update(value).digest();
const accounts = new Map();
try {
  const config = JSON.parse(process.env.SITE_USERS || "{}");
  if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error();
  for (const [login, password] of Object.entries(config)) {
    if (!login || login !== login.trim() || typeof password !== "string" || !password.trim()) {
      throw new Error();
    }
    accounts.set(login, hash(password));
  }
  if (!accounts.size) throw new Error();
} catch {
  console.error('Укажите в SITE_USERS непустой JSON-объект вида {"логин":"пароль"}.');
  process.exit(1);
}

const assets = new Map([
  ["/", "index.html"],
  ...["index.html", "style.css", "script.js", "data100.js", "data400a.js", "data400b.js",
    "data600a.js", "data600b.js", "data800a.js", "data800b.js", "data800c.js", "data800d.js", "data-patfiz.js"]
    .map(file => ["/" + file, file])
]);
const types = { html: "text/html", css: "text/css", js: "text/javascript", png: "image/png" };
const secureCookie = process.env.SITE_SECURE_COOKIE === "1" ? "; Secure" : "";
const sessionSeconds = 8 * 60 * 60;
const browserSeconds = 400 * 24 * 60 * 60;
const browserLimit = 2;
const sessions = new Map();
const activeTokens = new Map();
const unknownPassword = randomBytes(32);
const cookieAttributes = `Path=/; HttpOnly; SameSite=Strict${secureCookie}`;
const browserFile = process.env.SITE_TRUSTED_BROWSERS_FILE || join(__dirname, "trusted-browsers.json");
const browserTokenPattern = /^[a-f0-9]{64}$/;
let trustedBrowsers = loadTrustedBrowsers();

function loadTrustedBrowsers() {
  let saved;
  try {
    saved = JSON.parse(readFileSync(browserFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    throw new Error("Invalid trusted browser file");
  }
  for (const browsers of Object.values(saved)) {
    if (!Array.isArray(browsers) || browsers.length > browserLimit ||
        !browsers.every(value => typeof value === "string" && browserTokenPattern.test(value))) {
      throw new Error("Invalid trusted browser list");
    }
  }
  return new Map(Object.entries(saved));
}

function registerBrowser(login, browserHash, browsers) {
  const updated = new Map(trustedBrowsers);
  updated.set(login, [...browsers, browserHash]);
  const temporaryFile = `${browserFile}.${randomBytes(8).toString("hex")}.tmp`;
  try {
    writeFileSync(temporaryFile, JSON.stringify(Object.fromEntries(updated), null, 2), {
      flag: "wx",
      mode: 0o600
    });
    renameSync(temporaryFile, browserFile);
  } finally {
    rmSync(temporaryFile, { force: true });
  }
  trustedBrowsers = updated;
}

setInterval(() => {
  const now = Date.now();
  for (const session of sessions.values()) {
    if (session.expires <= now) endSession(session);
  }
}, 60_000).unref();

function endSession(session) {
  sessions.delete(session.token);
  activeTokens.delete(session.login);
}

function showLogin(response, status = 200, message = "") {
  response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Вход · Тесты по медицине</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; min-height: 100vh; display: grid; place-items: center;
      background: #f5f6ef; color: #192721; font: 1rem/1.5 system-ui, sans-serif; }
    form { width: min(100%, 420px); padding: clamp(20px, 6vw, 36px); background: white;
      border: 1px solid #dbe3d7; border-radius: 20px; box-shadow: 0 12px 32px #1c3f2b12; }
    h1 { margin: 0 0 24px; color: #173e30; font: 1.9rem/1.15 Georgia, serif; }
    input, button { width: 100%; margin-top: 8px; padding: 10px 12px; border-radius: 10px; font: inherit; }
    input { border: 1px solid #8ba795; }
    label { display: block; }
    label:not(:first-of-type) { margin-top: 14px; }
    button { margin-top: 16px; border: 0; background: #215a43; color: white; cursor: pointer; }
    :focus-visible { outline: 3px solid #367d5f; outline-offset: 3px; }
    p { color: #a23539; }
  </style>
</head>
<body>
  <form method="post" action="/login">
    <h1>Тесты по медицине</h1>
    <label for="login">Логин</label>
    <input id="login" name="login" autocomplete="username" autocapitalize="none" spellcheck="false" required autofocus>
    <label for="password">Пароль</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    ${message ? `<p role="alert">${message}</p>` : ""}
    <button type="submit">Войти</button>
  </form>
</body>
</html>`);
}

async function handleRequest(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Content-Security-Policy", "frame-ancestors 'none'; form-action 'self'");
  const path = request.url.split("?")[0];
  const cookies = request.headers.cookie ?? "";
  const token = cookies.match(/(?:^|;\s*)site_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  const browser = cookies.match(/(?:^|;\s*)site_browser=([a-f0-9]{64})(?:;|$)/)?.[1];
  const browserHash = browser && hash(browser).toString("hex");
  const current = sessions.get(token);
  const session = current?.browserHash === browserHash && current?.expires > Date.now()
    ? current
    : undefined;

  if (request.method === "POST" && path === "/logout") {
    if (session) endSession(session);
    response.writeHead(303, {
      Location: "/",
      "Set-Cookie": `site_session=; ${cookieAttributes}; Max-Age=0`
    }).end();
    return;
  }

  if (request.method === "POST" && path === "/login") {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 4096) {
        response.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
    const form = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
    const login = form.get("login")?.trim();
    const expected = accounts.get(login);
    const matches = timingSafeEqual(hash(form.get("password") ?? ""), expected ?? unknownPassword);
    if (!matches || !expected) {
      showLogin(response, 401, "Неверный логин или пароль.");
      return;
    }

    const browserToken = browser ?? randomBytes(32).toString("hex");
    const currentBrowserHash = browserHash ?? hash(browserToken).toString("hex");
    const browsers = trustedBrowsers.get(login) ?? [];
    if (!browsers.includes(currentBrowserHash)) {
      if (browsers.length >= browserLimit) {
        showLogin(response, 403, "К аккаунту уже привязаны два браузера. Войдите из одного из них.");
        return;
      }
      registerBrowser(login, currentBrowserHash, browsers);
    }

    const previous = sessions.get(activeTokens.get(login));
    if (previous) endSession(previous);
    if (session && sessions.has(session.token)) endSession(session);
    const newToken = randomBytes(32).toString("hex");
    sessions.set(newToken, {
      login,
      token: newToken,
      browserHash: currentBrowserHash,
      expires: Date.now() + sessionSeconds * 1000
    });
    activeTokens.set(login, newToken);
    response.writeHead(303, {
      Location: "/",
      "Set-Cookie": [
        `site_session=${newToken}; ${cookieAttributes}; Max-Age=${sessionSeconds}`,
        `site_browser=${browserToken}; ${cookieAttributes}; Max-Age=${browserSeconds}`
      ]
    }).end();
    return;
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  if (path === "/session") {
    response.writeHead(session ? 204 : 401).end();
    return;
  }

  if (!session) {
    if (path === "/" || path === "/index.html") {
      if (!browser && request.method === "GET") {
        response.setHeader("Set-Cookie",
          `site_browser=${randomBytes(32).toString("hex")}; ${cookieAttributes}; Max-Age=${browserSeconds}`);
      }
      const ended = token || new URLSearchParams(request.url.split("?")[1]).has("session-ended");
      showLogin(response, 200, ended ? "Сеанс завершён. Войдите снова, чтобы продолжить." : "");
    }
    else response.writeHead(401).end();
    return;
  }

  const file = assets.get(path) ??
    (/^\/patfiz-images\/figure-\d{2}\.png$/.test(path) ? path.slice(1) : null);
  if (!file || (file.endsWith(".png") && !existsSync(join(__dirname, file)))) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader("Content-Type", types[file.split(".").pop()] + "; charset=utf-8");
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  const stream = createReadStream(join(__dirname, file));
  stream.on("error", () => response.destroy());
  response.on("close", () => stream.destroy());
  stream.pipe(response);
}

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const server = createServer((request, response) => {
  handleRequest(request, response).catch(() => {
    if (!response.headersSent) response.writeHead(500).end();
    else response.destroy();
  });
});
server.listen(port, host, () => console.log(`http://${host}:${server.address().port}`));
