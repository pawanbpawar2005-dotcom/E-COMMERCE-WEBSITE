export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function errorResponse(message, status = 500) {
  return json({ error: message }, { status });
}

export function methodNotAllowed() {
  return errorResponse("Method not allowed", 405);
}
