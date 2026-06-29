const CLOUDFLARE_ANALYTICS_SNIPPET = `
  <!-- Cloudflare Web Analytics -->
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"ee1ebb7c6cac4c3c8f71cce2ad6bf28f"}'></script>
  <!-- End Cloudflare Web Analytics -->
`;

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  const html = await response.text();

  if (html.includes("static.cloudflareinsights.com/beacon.min.js")) {
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  const updatedHtml = html.includes("</body>")
    ? html.replace("</body>", `${CLOUDFLARE_ANALYTICS_SNIPPET}\n</body>`)
    : `${html}\n${CLOUDFLARE_ANALYTICS_SNIPPET}`;

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(updatedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
