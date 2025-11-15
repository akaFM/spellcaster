## spellcaster – phase 1

this is phase 1 of the spellcaster project for natalie and avo. right now we only have:

- a basic node + express + socket.io + typescript server
- a basic react + vite + typescript + tailwind client

later phases will add all the game logic, text-to-speech, gemini, scoring, and wizard duel visuals.

## requirements

- node.js (lts, for example 20.x)
- npm (or pnpm/yarn if you prefer)

## setup

### server

```bash
cd server
npm install
cp .env.example .env
# edit .env if you want to change the port or client origin
npm run dev
```

this starts the express + socket.io server on `http://localhost:4000` by default.

quick checks:

- `GET http://localhost:4000/health` returns `{ "status": "ok" }`
- socket clients can emit `ping` and should get a `pong` right back

### client

```bash
cd client
npm install
npm run dev
```

this starts the vite dev server (usually on `http://localhost:5173`).

### quick smoke test

1. run `npm run dev` inside `server`.
2. run `npm run dev` inside `client`.
3. open the client url in a browser – you should see the spellcaster phase 1 placeholder ui.

once those steps work, stop. no real game logic, tts, or gemini gets added until phase 2.

---

## phase 1 checklist

1. `cd server && npm run dev`
   - server logs `spellcaster server listening on port 4000`
   - `/health` responds with `{ "status": "ok" }`
2. `cd client && npm run dev`
   - vite starts without errors
   - browser shows the spellcaster placeholder ui
3. optional: use any socket.io tester to send `ping` and confirm the `pong` reply.

after that we’re officially done with phase 1 scaffolding. the next phases will layer in multiplayer game logic, spell generation, scoring, and wizard effects. stay tuned.