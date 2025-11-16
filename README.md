## spellcaster – phase 3

phase 1 gave us the scaffolding, phase 2 proved sockets. phase 3 is the first real gameplay skeleton: typed lobbies, ready-up flow, and an in-duel placeholder so natalie and avo can run the whole lifecycle end-to-end.

### what’s in place now

- node + express + socket.io + typescript server with an in-memory lobby store
- react + vite + typescript + tailwind client that can create/join lobbies, ready up, and trigger the duel state
- shared `shared/types/socket.ts` defines lobby, duel, and socket event contracts so server + client stay in sync

## requirements

- node.js (lts, for example 20.x)
- npm (or pnpm/yarn if you prefer)

## setup

### server

```bash
cd server
npm install
cp .env.example .env
# edit .env to configure ports, allowed client origins, and api keys
npm run dev
```

this starts the express + socket.io server on `http://localhost:4000` by default. out of the box we allow both `http://localhost:5173` and `http://127.0.0.1:5173`, so you can use whichever url vite serves without editing env vars.

#### elevenlabs tts

to enable the wizard voice, add the following to `server/.env` (the `.env` file that lives next to `package.json` inside the `server` folder):

```
ELEVENLABS_API_KEY=your_api_key_here
# optional – defaults to zNsotODqUhvbJ5wMG7Ei
ELEVENLABS_VOICE_ID=zNsotODqUhvbJ5wMG7Ei
```

keep the api key private—it's only ever referenced on the server. the client simply calls the `/tts` endpoint you run locally, so nothing sensitive ends up in the browser bundle.

quick checks:

- `GET http://localhost:4000/health` returns `{ "status": "ok" }`
- watch the terminal for lobby logs like `created lobby ABCD` or `player natalie joined lobby ABCD`

### client

```bash
cd client
npm install
npm run dev
```

this starts the vite dev server (usually on `http://localhost:5173`).

### phase 3 smoke test

1. run `npm run dev` inside `server`.
2. run `npm run dev` inside `client`.
3. open the client url in two browser windows/tabs.
4. window A: enter a name (e.g., avo) and click **create duel**. note the room code (e.g., `ABCD`).
5. window B: enter a name (e.g., natalie), paste the room code, and click **join duel**.
6. both windows should display the same lobby roster with host labels.
7. click **ready up** in each window; the ready indicators should flip in real time.
8. host window: **start duel** becomes enabled once both players are ready—click it.
9. both windows should transition to the “duel in progress” view showing round 1.
10. optionally close one window; the other should update to show only one player (lobby cleaned up).

the ping button + socket status are still there for debugging, but the real focus is the lobby/duel lifecycle.

---

## status checklist

1. `cd server && npm run dev`
   - server logs `spellcaster server listening on port 4000`
   - `/health` responds with `{ "status": "ok" }`
   - lobby logs appear when players create/join/leave
2. `cd client && npm run dev`
   - vite starts without errors
   - you can create or join a lobby, see ready states, and start a duel
   - duel view displays “round 1” placeholder once started

after that we’re officially done with the lobby + duel skeleton. phase 4 will layer in spell logic, scoring, and the gemini / tts integrations.