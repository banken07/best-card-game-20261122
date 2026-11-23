/* Lumen Duel — deck.js: the 43-card lantern deck and its seeded shuffle. */
(function (root) {
  "use strict";

  var SUITS = [
    { id: "sun",   name: "Sun",   color: "#b8860b", glyph: "\u2600" },
    { id: "moon",  name: "Moon",  color: "#5b4398", glyph: "\u263E" },
    { id: "leaf",  name: "Leaf",  color: "#20703a", glyph: "\u25C6" },
    { id: "stone", name: "Stone", color: "#5a6470", glyph: "\u2B22" }
  ];

  function suitById(id) {
    for (var i = 0; i < SUITS.length; i++) {
      if (SUITS[i].id === id) return SUITS[i];
    }
    return null;
  }

  // Small deterministic PRNG (mulberry32) so ?shot= states render identically.
  function makeRng(seed) {
    var state = (seed >>> 0) || 1;
    return function nextRandom() {
      state = (state + 0x6D2B79F5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Build the deck: four suits x values 1-10, plus three Lantern wild cards.
  function buildDeck() {
    var cards = [];
    var s, v;
    for (s = 0; s < SUITS.length; s++) {
      for (v = 1; v <= 10; v++) {
        cards.push({ suit: SUITS[s].id, value: v, wild: false });
      }
    }
    for (v = 0; v < 3; v++) {
      cards.push({ suit: "lantern", value: 6, wild: true });
    }
    return cards;
  }

  function shuffleDeck(cards, rng) {
    var out = cards.slice();
    var i, j, tmp;
    for (i = out.length - 1; i > 0; i--) {
      j = Math.floor(rng() * (i + 1));
      tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  // Deal n cards each to player and opponent from the front of the deck.
  function dealHands(deck, handSize) {
    var player = [];
    var opponent = [];
    var i;
    for (i = 0; i < handSize; i++) {
      player.push(deck.shift());
      opponent.push(deck.shift());
    }
    return { player: player, opponent: opponent, rest: deck };
  }

  function sortHand(hand) {
    var order = { sun: 0, moon: 1, leaf: 2, stone: 3, lantern: 4 };
    return hand.slice().sort(function (a, b) {
      if (order[a.suit] !== order[b.suit]) return order[a.suit] - order[b.suit];
      return b.value - a.value;
    });
  }

  root.LumenDeck = {
    SUITS: SUITS,
    suitById: suitById,
    makeRng: makeRng,
    buildDeck: buildDeck,
    shuffleDeck: shuffleDeck,
    dealHands: dealHands,
    sortHand: sortHand
  };
})(typeof window !== "undefined" ? window : globalThis);
