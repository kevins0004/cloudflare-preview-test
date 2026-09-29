const VERSION = "v6 - blue";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    return new Response(
      `<style>body { background: #1e5bd8; color: white; font-family: sans-serif; }</style>
<h1>Cloudflare Preview Test</h1>
<p>Version: <strong>${VERSION}</strong></p>
<p>Served from: ${url.hostname}</p>`,
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  },
};
