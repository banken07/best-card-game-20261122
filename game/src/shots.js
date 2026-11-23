/* Lumen Duel — shots.js: deterministic ?shot= states for screenshots. */
(function (root) {
  "use strict";

  // Fixed hands for the cover shot: a dramatic mid-game table.
  // Player leads Sun 9, Mira answers Sun 6 — a chain is resolving, +5.
  function playShotState() {
    var D = root.LumenDeck;
    function card(suit, value) { return { suit: suit, value: value, wild: false }; }
    function wild() { return { suit: "lantern", value: 6, wild: true }; }
    var deck = [];
    var i;
    for (i = 0; i < 12; i++) deck.push(card("stone", 2 + (i % 8)));
    return {
      phase: "play",
      playerScore: 34,
      opponentScore: 28,
      playerTricks: 5,
      opponentTricks: 4,
      trickNumber: 9,
      playerLeads: true,
      deck: deck,
      playerHand: [card("sun", 10), card("sun", 4), card("moon", 8), card("moon", 3),
        card("leaf", 9), card("leaf", 5), wild()],
      opponentHand: [card("moon", 10), card("moon", 7), card("leaf", 8), card("stone", 9),
        card("stone", 4), card("sun", 2), card("leaf", 6)],
      table: {
        playerCard: card("sun", 9),
        opponentCard: card("sun", 6),
        leadSuit: "sun"
      },
      lastResult: { chained: true, chainBonus: 5, points: 20, winnerIsPlayer: true },
      showChain: true,
      logLine: "You led 9, Mira answered 6 — You take 20 points (chain +5)",
      turnLine: "Chain! Sun answers Sun. Your trick — play again to keep the lead.",
      selectedCard: null
    };
  }

  function endShotState(winner) {
    var base = playShotState();
    base.phase = "end";
    if (winner === "player") {
      base.playerScore = 52;
      base.opponentScore = 31;
    } else {
      base.playerScore = 24;
      base.opponentScore = 50;
    }
    return base;
  }

  // Read ?shot=title|play|win|loss&seed=1. Returns the shot name or null.
  function shotFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var shot = params.get("shot");
    if (shot === "title" || shot === "play" || shot === "win" || shot === "loss") return shot;
    return null;
  }

  // Render one deterministic shot state. Returns true when a shot was rendered.
  function renderShot(shot) {
    var R = root.LumenRender;
    if (shot === "title") {
      R.showScreen("screen-title");
      return true;
    }
    if (shot === "play") {
      R.showScreen("screen-play");
      R.renderTable(playShotState(), { onCardClick: function () {} });
      return true;
    }
    if (shot === "win") {
      R.renderEnd(endShotState("player"));
      return true;
    }
    if (shot === "loss") {
      R.renderEnd(endShotState("opponent"));
      return true;
    }
    return false;
  }

  root.LumenShots = {
    playShotState: playShotState,
    endShotState: endShotState,
    shotFromUrl: shotFromUrl,
    renderShot: renderShot
  };
})(typeof window !== "undefined" ? window : globalThis);
