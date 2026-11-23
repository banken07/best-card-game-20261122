/* Lumen Duel — main.js: game loop, input, screens and sound. */
(function (root) {
  "use strict";

  var state = null;
  var audioOn = true;
  var audioCtx = null;

  function newMatch(seed) {
    var rng = root.LumenDeck.makeRng(seed || (Date.now() % 2147483647));
    var deck = root.LumenDeck.shuffleDeck(root.LumenDeck.buildDeck(), rng);
    var dealt = root.LumenDeck.dealHands(deck, root.LumenRules.HAND_SIZE);
    return {
      phase: "play",
      playerScore: 0,
      opponentScore: 0,
      playerTricks: 0,
      opponentTricks: 0,
      trickNumber: 0,
      playerLeads: true,
      deck: dealt.rest,
      playerHand: dealt.player,
      opponentHand: dealt.opponent,
      table: { playerCard: null, opponentCard: null, leadSuit: null },
      lastResult: null,
      showChain: false,
      logLine: "Welcome to the lantern table. You lead — play any card.",
      turnLine: "Your lead. Click a card, or press 1-7 then Enter.",
      selectedCard: null,
      busy: false
    };
  }

  function beep(freq, dur) {
    if (!audioOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (err) { /* sound is optional */ }
  }

  function drawCards() {
    var i;
    for (i = 0; i < 2; i++) {
      if (state.deck.length > 0 && state.playerHand.length < root.LumenRules.HAND_SIZE) {
        state.playerHand.push(state.deck.shift());
      }
      if (state.deck.length > 0 && state.opponentHand.length < root.LumenRules.HAND_SIZE) {
        state.opponentHand.push(state.deck.shift());
      }
    }
  }

  function removeFromHand(hand, card) {
    var idx = hand.indexOf(card);
    if (idx >= 0) hand.splice(idx, 1);
  }

  // One full trick: the player has chosen a card; Mira answers or leads next.
  function playTrick(playerCard) {
    if (state.busy || state.phase !== "play") return;
    state.busy = true;
    removeFromHand(state.playerHand, playerCard);
    state.selectedCard = null;
    var result;
    if (state.playerLeads) {
      state.table.playerCard = playerCard;
      state.table.leadSuit = playerCard.wild ? null : playerCard.suit;
      var miraCard = root.LumenAi.chooseFollow(state.opponentHand, playerCard);
      removeFromHand(state.opponentHand, miraCard);
      state.table.opponentCard = miraCard;
      if (playerCard.wild) state.table.leadSuit = miraCard.suit;
      result = root.LumenRules.resolveTrick(playerCard, miraCard, true);
      state.lastResult = result;
      state.showChain = true;
      state.logLine = root.LumenRules.trickSummary(result, "You", "Mira");
      if (result.winnerIsPlayer) {
        state.playerScore += result.points;
        state.playerTricks++;
        state.playerLeads = true;
        state.turnLine = "You take the trick. Lead again.";
      } else {
        state.opponentScore += result.points;
        state.opponentTricks++;
        state.playerLeads = false;
        state.turnLine = "Mira takes the trick. She leads next.";
      }
      beep(result.winnerIsPlayer ? 660 : 330, 0.18);
    } else {
      var lead = root.LumenAi.chooseLead(state.opponentHand);
      removeFromHand(state.opponentHand, lead);
      state.table.opponentCard = lead;
      state.table.leadSuit = lead.suit;
      state.table.playerCard = playerCard;
      result = root.LumenRules.resolveTrick(lead, playerCard, false);
      state.lastResult = result;
      state.showChain = true;
      state.logLine = root.LumenRules.trickSummary(result, "Mira", "You");
      if (result.winnerIsPlayer) {
        state.playerScore += result.points;
        state.playerTricks++;
        state.playerLeads = true;
        state.turnLine = "You take the trick against her lead. Your lead now.";
      } else {
        state.opponentScore += result.points;
        state.opponentTricks++;
        state.playerLeads = false;
        state.turnLine = "Mira holds her lead. She leads again.";
      }
      beep(result.winnerIsPlayer ? 660 : 330, 0.18);
    }
    state.trickNumber++;
    root.LumenRender.renderTable(state, { onCardClick: onCardClick });
    window.setTimeout(function () {
      state.table.playerCard = null;
      state.table.opponentCard = null;
      state.showChain = false;
      state.busy = false;
      drawCards();
      if (root.LumenRules.isMatchOver(state.playerScore, state.opponentScore)) {
        state.phase = "end";
        if (root.LumenRules.matchWinner(state.playerScore, state.opponentScore) === "player") {
          beep(880, 0.4);
          window.setTimeout(function () { beep(1174, 0.4); }, 180);
        }
        root.LumenRender.renderEnd(state);
      } else {
        root.LumenRender.renderTable(state, { onCardClick: onCardClick });
      }
    }, 1400);
  }

  function onCardClick(card) {
    if (state.busy || state.phase !== "play") return;
    if (state.selectedCard === card) {
      playTrick(card);
    } else {
      state.selectedCard = card;
      beep(520, 0.08);
      root.LumenRender.renderTable(state, { onCardClick: onCardClick });
    }
  }

  function startMatch() {
    state = newMatch();
    root.LumenRender.showScreen("screen-play");
    root.LumenRender.renderTable(state, { onCardClick: onCardClick });
  }

  function bindKeys() {
    document.addEventListener("keydown", function (ev) {
      if (!state || state.phase !== "play") {
        if (ev.key === "Enter" || ev.key === "r" || ev.key === "R") startMatch();
        return;
      }
      if (ev.key >= "1" && ev.key <= "7") {
        var idx = parseInt(ev.key, 10) - 1;
        var sorted = root.LumenDeck.sortHand(state.playerHand);
        if (sorted[idx]) onCardClick(sorted[idx]);
      } else if (ev.key === "Enter" && state.selectedCard) {
        playTrick(state.selectedCard);
      } else if (ev.key === "r" || ev.key === "R") {
        startMatch();
      } else if (ev.key === "m" || ev.key === "M") {
        audioOn = !audioOn;
        document.getElementById("mute-label").textContent = audioOn ? "Sound: on (M)" : "Sound: off (M)";
      }
    });
  }

  function boot() {
    document.getElementById("play-button").addEventListener("click", startMatch);
    document.getElementById("play-again-button").addEventListener("click", startMatch);
    document.getElementById("restart-button").addEventListener("click", startMatch);
    document.getElementById("mute-button").addEventListener("click", function () {
      audioOn = !audioOn;
      document.getElementById("mute-label").textContent = audioOn ? "Sound: on (M)" : "Sound: off (M)";
    });
    bindKeys();
    var shot = root.LumenShots.shotFromUrl();
    if (shot) {
      root.LumenShots.renderShot(shot);
      return;
    }
    root.LumenRender.showScreen("screen-title");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  root.LumenMain = { newMatch: newMatch, startMatch: startMatch };
})(typeof window !== "undefined" ? window : globalThis);
