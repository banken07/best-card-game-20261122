/* Lumen Duel — render.js: draws the table, hands, cards and end screens. */
(function (root) {
  "use strict";

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function suitGlyph(suitId) {
    if (suitId === "lantern") return "\u2726";
    var suit = root.LumenDeck.suitById(suitId);
    return suit ? suit.glyph : "?";
  }

  function suitName(suitId) {
    if (suitId === "lantern") return "Lantern";
    var suit = root.LumenDeck.suitById(suitId);
    return suit ? suit.name : suitId;
  }

  // One face-up card element. faceDown renders the patterned card back.
  function cardElement(card, opts) {
    opts = opts || {};
    var node = el("div", "card");
    if (opts.faceDown) {
      node.classList.add("back");
      var mark = el("div", "back-mark", "\u2726");
      node.appendChild(mark);
      return node;
    }
    if (card.wild) node.classList.add("lantern");
    else node.classList.add("suit-" + card.suit);
    if (opts.selected) node.classList.add("selected");
    if (opts.played) node.classList.add("played");
    var top = el("div", "corner");
    top.appendChild(el("span", "v", String(card.value)));
    top.appendChild(el("span", "s", suitGlyph(card.suit)));
    var bottom = el("div", "corner br");
    bottom.appendChild(el("span", "v", String(card.value)));
    bottom.appendChild(el("span", "s", suitGlyph(card.suit)));
    var center = el("div", "center");
    center.appendChild(el("div", "big", String(card.value)));
    center.appendChild(el("div", "glyph", suitGlyph(card.suit)));
    node.appendChild(top);
    node.appendChild(center);
    node.appendChild(bottom);
    if (opts.onClick) {
      node.addEventListener("click", function () { opts.onClick(card); });
    }
    return node;
  }

  function renderHand(container, hand, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var sorted = root.LumenDeck.sortHand(hand);
    sorted.forEach(function (card, index) {
      var cardOpts = { faceDown: !!opts.faceDown };
      if (opts.selectedCard === card) cardOpts.selected = true;
      if (opts.onCardClick) {
        cardOpts.onClick = function (picked) { opts.onCardClick(picked, index); };
      }
      container.appendChild(cardElement(card, cardOpts));
    });
  }

  function renderScoreboard(state) {
    var playerBox = document.getElementById("score-player");
    var oppBox = document.getElementById("score-opp");
    playerBox.querySelector(".num").innerHTML =
      state.playerScore + " <small>/ " + root.LumenRules.TARGET_SCORE + "</small>";
    oppBox.querySelector(".num").innerHTML =
      state.opponentScore + " <small>/ " + root.LumenRules.TARGET_SCORE + "</small>";
    playerBox.classList.toggle("leading", state.playerScore > state.opponentScore);
    oppBox.classList.toggle("leading", state.opponentScore > state.playerScore);
    document.getElementById("deck-count").textContent =
      "Deck: " + state.deck.length + " cards";
    document.getElementById("trick-count").textContent =
      "Trick " + (state.trickNumber + 1) + "  ·  " + state.playerTricks +
      " tricks won — " + state.opponentTricks + " Mira";
  }

  function renderTable(state, callbacks) {
    var table = document.getElementById("table-area");
    table.querySelectorAll(".chain-banner").forEach(function (n) { n.remove(); });
    var playerSlot = document.getElementById("slot-player");
    var oppSlot = document.getElementById("slot-opp");
    playerSlot.innerHTML = "";
    oppSlot.innerHTML = "";
    var labelP = el("div", "slot-label", "YOUR CARD");
    var labelO = el("div", "slot-label", "MIRA'S CARD");
    playerSlot.appendChild(labelP);
    oppSlot.appendChild(labelO);
    if (state.table.playerCard) {
      playerSlot.appendChild(cardElement(state.table.playerCard, { played: true }));
    } else {
      playerSlot.appendChild(el("div", "slot-empty", "waiting…"));
    }
    if (state.table.opponentCard) {
      oppSlot.appendChild(cardElement(state.table.opponentCard, { played: true }));
    } else {
      oppSlot.appendChild(el("div", "slot-empty", "waiting…"));
    }
    if (state.lastResult && state.lastResult.chained && state.showChain) {
      var banner = el("div", "chain-banner",
        "CHAIN BONUS +5 — " + suitName(state.table.leadSuit));
      table.appendChild(banner);
    }
    document.getElementById("trick-log").textContent = state.logLine || "";
    document.getElementById("turn-banner").textContent = state.turnLine || "";
    var fav = root.LumenAi.favouredSuit(state.opponentHand);
    var favName = suitName(fav);
    document.getElementById("opp-fav").innerHTML =
      "Favours <b>" + favName + "</b> " + suitGlyph(fav) +
      " — " + root.LumenAi.telegraph(state.opponentHand, state.playerLeads === false);
    renderScoreboard(state);
    renderHand(document.getElementById("opp-hand"), state.opponentHand, { faceDown: true });
    renderHand(document.getElementById("player-hand"), state.playerHand, {
      selectedCard: state.selectedCard,
      onCardClick: callbacks.onCardClick
    });
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
    document.getElementById(id).classList.add("active");
  }

  function renderEnd(state) {
    var winner = root.LumenRules.matchWinner(state.playerScore, state.opponentScore);
    var title = document.getElementById("end-title");
    var sub = document.getElementById("end-sub");
    var score = document.getElementById("end-score");
    var detail = document.getElementById("end-detail");
    var fireworks = document.getElementById("fireworks");
    if (winner === "player") {
      title.textContent = "YOU WIN THE DUEL";
      title.className = "win";
      sub.textContent = "The lanterns burn gold for you tonight.";
      fireworks.style.display = "flex";
      detail.textContent = "You reached " + root.LumenRules.TARGET_SCORE +
        " points first. Your chains outshone Mira's — every same-suit answer " +
        "lit another lantern on the table.";
    } else {
      title.textContent = "MIRA WINS";
      title.className = "loss";
      sub.textContent = "The lanterns dim. Mira keeps the table tonight.";
      fireworks.style.display = "none";
      detail.textContent = "Mira reached " + root.LumenRules.TARGET_SCORE +
        " points first. Watch her favoured suit: lead a different suit to break " +
        "her chain, and save your high cards for her leads.";
    }
    score.innerHTML = "You <b>" + state.playerScore + "</b> — <b>" +
      state.opponentScore + "</b> Mira";
    showScreen("screen-end");
  }

  root.LumenRender = {
    cardElement: cardElement,
    renderHand: renderHand,
    renderTable: renderTable,
    renderEnd: renderEnd,
    showScreen: showScreen,
    suitGlyph: suitGlyph,
    suitName: suitName
  };
})(typeof window !== "undefined" ? window : globalThis);
