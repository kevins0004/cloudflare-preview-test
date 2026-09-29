const VERSION = "v1 - initial";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    return new Response(
      `<h1>Cloudflare Preview Test</h1>
<p>Version: <strong>${VERSION}</strong></p>
<p>Served from: ${url.hostname}</p>`,
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  },
};
