/* Lumen Duel — ai.js: Mira, the lantern-keeper opponent. Readable, counterable. */
(function (root) {
  "use strict";

  var SUIT_IDS = ["sun", "moon", "leaf", "stone"];

  // Mira's favoured suit: the suit she holds most of. She telegraphs it openly,
  // so the player can read her and counter by leading a different suit.
  function favouredSuit(hand) {
    var counts = { sun: 0, moon: 0, leaf: 0, stone: 0 };
    var i;
    for (i = 0; i < hand.length; i++) {
      if (counts[hand[i].suit] !== undefined) counts[hand[i].suit]++;
    }
    var best = "sun";
    var bestCount = -1;
    for (i = 0; i < SUIT_IDS.length; i++) {
      if (counts[SUIT_IDS[i]] > bestCount) {
        bestCount = counts[SUIT_IDS[i]];
        best = SUIT_IDS[i];
      }
    }
    return best;
  }

  function lowestCard(hand) {
    var best = hand[0];
    var i;
    for (i = 1; i < hand.length; i++) {
      if (hand[i].value < best.value) best = hand[i];
    }
    return best;
  }

  function highestCard(hand) {
    var best = hand[0];
    var i;
    for (i = 1; i < hand.length; i++) {
      if (hand[i].value > best.value) best = hand[i];
    }
    return best;
  }

  function cardsOfSuit(hand, suit) {
    return hand.filter(function (c) { return c.suit === suit; });
  }

  // Mira leads: her highest card of her favoured suit, else her highest card.
  function chooseLead(hand) {
    var fav = favouredSuit(hand);
    var favCards = cardsOfSuit(hand, fav);
    if (favCards.length > 0) return highestCard(favCards);
    return highestCard(hand);
  }

  // Mira follows a lead card. She tries to win cheaply: the lowest card that
  // beats the lead, preferring the lead suit (which also chains for +5).
  // When she cannot win she sheds her lowest card and saves her wilds.
  function chooseFollow(hand, leadCard) {
    var Rules = root.LumenRules;
    var sameSuit = cardsOfSuit(hand, leadCard.suit);
    var winners = sameSuit.filter(function (c) { return c.value > leadCard.value; });
    if (winners.length > 0) return lowestCard(winners);
    var wilds = hand.filter(function (c) { return c.wild; });
    if (wilds.length > 0 && leadCard.value < 6) return wilds[0];
    var nonWild = hand.filter(function (c) { return !c.wild; });
    if (nonWild.length > 0) return lowestCard(nonWild);
    return lowestCard(hand);
  }

  // One honest hint line describing what Mira is about to do.
  function telegraph(hand, isLeading) {
    var fav = favouredSuit(hand);
    var suitName = root.LumenDeck.suitById(fav).name;
    if (isLeading) {
      return "Mira favours " + suitName + " — she will lead it when she can.";
    }
    return "Mira is watching your lead suit. Beat her " + suitName + " chain if you can.";
  }

  root.LumenAi = {
    favouredSuit: favouredSuit,
    chooseLead: chooseLead,
    chooseFollow: chooseFollow,
    telegraph: telegraph
  };
})(typeof window !== "undefined" ? window : globalThis);
