import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>DeskDrop</title></head><body><main><h1>DeskDrop</h1><p>Boilerplate startup scaffold.</p></main></body></html>';

export function startServer(port, host = "0.0.0.0") {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(page);
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag = process.argv.indexOf("--port");
  const port = Number(flag >= 0 ? process.argv[flag + 1] : process.env.PORT ?? 3100);
  const server = await startServer(port);
  console.log(`boilerplate: listening on 0.0.0.0:${server.address().port}`);
}
