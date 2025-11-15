## spellcaster – phase 2

we’re slowly building the spellcaster duel for natalie and avo. phase 1 set up the barebones server + client. phase 2 keeps that intact and layers on typed socket events, a shared types folder, and a simple ping/pong ui so we know realtime wiring works.

### what’s in place now

- node + express + socket.io + typescript server with shared event types
- react + vite + typescript + tailwind client with connection status + ping button
- shared `shared/types/socket.ts` to keep socket events in sync between frontend and backend

## requirements

- node.js (lts, for example 20.x)
- npm (or pnpm/yarn if you prefer)

## setup

### server

```bash
cd server
npm install
cp .env.example .env
# edit .env if you want to change the port or allowed client origins (comma-separated)
npm run dev
```

this starts the express + socket.io server on `http://localhost:4000` by default. out of the box we allow both `http://localhost:5173` and `http://127.0.0.1:5173`, so you can use whichever url vite serves without editing env vars.

quick checks:

- `GET http://localhost:4000/health` returns `{ "status": "ok" }`
- watch the terminal for lines like `received ping from <socket-id>` when the client sends a ping

### client

```bash
cd client
npm install
npm run dev
```

this starts the vite dev server (usually on `http://localhost:5173`).

### phase 2 smoke test

1. run `npm run dev` inside `server`.
2. run `npm run dev` inside `client`.
3. open the client url in a browser – the card should show the socket status.
4. once it says `connected`, click **ping server**.
5. server console should log the ping, and the client should display `last pong at: <timestamp>`.
6. refresh the page to see the status flip through `connecting -> connected` again.

once those steps work, stop. no real game logic, tts, or gemini gets added until phase 3.

---

## status checklist

1. `cd server && npm run dev`
   - server logs `spellcaster server listening on port 4000`
   - `/health` responds with `{ "status": "ok" }`
   - ping requests print `received ping from ...`
2. `cd client && npm run dev`
   - vite starts without errors
   - socket status shows `connecting` then `connected`
   - ping button lights up once connected and displays the last pong timestamp

after that we’re officially done with phase 2 wiring. the next phases will layer in lobby management, round flow, and all the wizard flair.