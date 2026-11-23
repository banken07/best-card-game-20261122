/* Lumen Duel — rules.js: trick resolution, chain bonus, scoring, match end. */
(function (root) {
  "use strict";

  var TARGET_SCORE = 50;
  var CHAIN_BONUS = 5;
  var HAND_SIZE = 7;

  // A card matches the lead suit when it shares the suit or is a Lantern wild.
  function matchesLead(card, leadSuit) {
    if (!card || !leadSuit) return false;
    if (card.wild) return true;
    return card.suit === leadSuit;
  }

  // Resolve one trick. leadCard was played first, followCard second.
  // Higher value wins; a tie goes to the leader. A same-suit follow chains.
  function resolveTrick(leadCard, followCard, leaderIsPlayer) {
    var chained = matchesLead(followCard, leadCard.suit);
    var followWins = followCard.value > leadCard.value;
    var winnerIsPlayer = followWins ? !leaderIsPlayer : leaderIsPlayer;
    var points = leadCard.value + followCard.value + (chained ? CHAIN_BONUS : 0);
    return {
      winnerIsPlayer: winnerIsPlayer,
      points: points,
      chained: chained,
      chainBonus: chained ? CHAIN_BONUS : 0,
      leadValue: leadCard.value,
      followValue: followCard.value
    };
  }

  // Describe a trick in one plain line for the table log.
  function trickSummary(result, leaderName, followerName) {
    var winner = result.winnerIsPlayer ? "You" : "Mira";
    var line = leaderName + " led " + result.leadValue + ", " + followerName +
      " answered " + result.followValue + " — " + winner + " take " + result.points + " points";
    if (result.chained) line += " (chain +" + result.chainBonus + ")";
    return line;
  }

  function matchWinner(playerScore, opponentScore) {
    if (playerScore >= TARGET_SCORE && opponentScore >= TARGET_SCORE) {
      return playerScore >= opponentScore ? "player" : "opponent";
    }
    if (playerScore >= TARGET_SCORE) return "player";
    if (opponentScore >= TARGET_SCORE) return "opponent";
    return null;
  }

  function isMatchOver(playerScore, opponentScore) {
    return matchWinner(playerScore, opponentScore) !== null;
  }

  root.LumenRules = {
    TARGET_SCORE: TARGET_SCORE,
    CHAIN_BONUS: CHAIN_BONUS,
    HAND_SIZE: HAND_SIZE,
    matchesLead: matchesLead,
    resolveTrick: resolveTrick,
    trickSummary: trickSummary,
    matchWinner: matchWinner,
    isMatchOver: isMatchOver
  };
})(typeof window !== "undefined" ? window : globalThis);
