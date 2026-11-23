# best-card-game-20261122

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/banken07/best-card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/banken07/best-card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Lumen Duel** is an original lantern-light card duel for make.fun's "Make the best card game" bounty, $50 in USDC. You face Mira, the Lantern-Keeper, across a lantern table: higher card takes the trick, answering the lead suit chains for +5, and Lantern wild cards match any suit. First to 50 points wins. Mira telegraphs her favoured suit, so every hand is a readable decision — break her chain, save your high cards, or chain back.

## Run it

```sh
python3 -m http.server 8130
```

Then open http://localhost:8130/game/index.html in desktop Chrome. No build step, no network requests — the game is static files under `game/`.

## How to play

- Click a card to select it, click again to play it. Keys 1–7 select, Enter plays, R restarts, M mutes.
- Higher card wins the trick and scores both cards. Same-suit answer: chain bonus +5. Lantern cards are wild (value 6, any suit).
- First to 50 points wins the match.

---

<sub>Entered on [make.fun](https://make.fun/?ref=banken07&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
