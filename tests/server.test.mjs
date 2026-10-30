import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "../bootstrap/server.mjs";

test("serves the DeskDrop heading with status 200", async () => {
  const server = await startServer(0, "127.0.0.1");
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<h1>DeskDrop<\/h1>/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
