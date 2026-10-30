import { createServer } from "node:http";

const flag = process.argv.indexOf("--port");
const port = Number(flag >= 0 ? process.argv[flag + 1] : process.env.PORT ?? 3100);
const page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>DeskDrop</title></head><body><main><h1>DeskDrop</h1><p>Environment bootstrap placeholder.</p></main></body></html>';

createServer((_request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(page);
}).listen(port, "0.0.0.0", () => console.log(`bootstrap: listening on 0.0.0.0:${port}`));
