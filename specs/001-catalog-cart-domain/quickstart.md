# Quickstart: Catalog and Cart Domain

```bash
scripts/qa/setup.sh                 # npm ci
scripts/qa/start.sh                 # build, serve on 0.0.0.0:3100
curl -s localhost:3100/ | grep -o '<h1[^>]*>DeskDrop</h1>'
npm run typecheck
npm test                            # domain acceptance tests
npm run test:e2e                    # scaffold smoke: / shows the DeskDrop heading
npm run golden:check                # after the tooling phase
```

Validation: every acceptance scenario of spec.md stories 2–7 has a test named after it in `tests/*.test.mjs`; `golden:check` exits 0 on `main`.
