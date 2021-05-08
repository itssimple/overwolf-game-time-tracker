"use strict";
if (typeof exports !== "undefined") {
  Object.defineProperty(exports, "__esModule", { value: true });
}

/**
 * An enum that contains all games that support events through Overwolf
 */
const OverwolfGameWithEventSupport = {
  APEX: 21566,
  CallOfDutyWarzone: 21626,
  CSGO: 7764,
  DOTA2: 7314,
  DOTAUnderlords: 21586,
  EscapeFromTarkov: 21634,
  FinalFantasyXIV: 6350,
  Fortnite: 21216,
  Hearthstone: 9898,
  HeroesOfTheStorm: 10624,
  LeagueOfLegends: 5426,
  LegendsOfRuneterra: 21620,
  Minecraft: 8032,
  MTGArena: 21308,
  Overwatch: 10844,
  PUBG: 10906,
  PUBGLite: 21598,
  PathOfExile: 7212,
  RainbowSixSiege: 10826,
  RocketLeague: 10798,
  Splitgate: 21404,
  StarCraft2: 5855,
  TeamfightTactics: 5426,
  Valheim: 21668,
  Valorant: 21640,
  Warframe: 8954,
  WorldOfTanks: 6365,
  WorldOfWarcraft: 765,
  WorldOfWarships: 10746,
};

/**
 * Enum that contains the supported events per game, these will automatically register with setRequiredFeatures when the game is detected
 */
const OverwolfGameSupportedEvents = {
  APEX: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "me",
    "team",
    "kill",
    "damage",
    "death",
    "revive",
    "match_state",
    "match_info",
    "inventory",
    "location",
    "match_summary",
    "roster",
    "rank",
    "kill_feed",
  ],
  CallOfDutyWarzone: [
    "gep_internal",
    "match_info",
    "game_info",
    "kill",
    "death",
    "assist",
    "roster",
  ],
  CSGO: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "match_info",
    "kill",
    "death",
    "assist",
    "headshot",
    "round_start",
    "match_start",
    "match_info",
    "match_end",
    "team_round_win",
    "bomb_planted",
    "bomb_change",
    "reloading",
    "fired",
    "weapon_change",
    "weapon_acquired",
    "info",
    "roster",
    "player_activity_change",
    "team_set",
    "replay",
    "counters",
    "mvp",
    "scoreboard",
    "kill_feed",
  ],
  DOTA2: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "game_state_changed",
    "match_state_changed",
    "match_detected",
    "daytime_changed",
    "clock_time_changed",
    "ward_purchase_cooldown_changed",
    "match_ended",
    "kill",
    "assist",
    "death",
    "cs",
    "xpm",
    "gpm",
    "gold",
    "hero_leveled_up",
    "hero_respawned",
    "hero_buyback_info_changed",
    "hero_boughtback",
    "hero_health_mana_info",
    "hero_status_effect_changed",
    "hero_attributes_skilled",
    "hero_ability_skilled",
    "hero_ability_used",
    "hero_ability_cooldown_changed",
    "hero_ability_changed",
    "hero_item_cooldown_changed",
    "hero_item_changed",
    "hero_item_used",
    "hero_item_consumed",
    "hero_item_charged",
    "match_info",
    "roster",
    "party",
    "error",
    "hero_pool",
    "me",
    "game",
  ],
  DOTAUnderlords: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "match_info",
  ],
  EscapeFromTarkov: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "match_info",
    "game_info",
  ],
  FinalFantasyXIV: ["match_info"],
  Fortnite: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "kill",
    "killed",
    "killer",
    "revived",
    "death",
    "match",
    "match_info",
    "rank",
    "me",
    "phase",
    "location",
    "team",
    "items",
    "counters",
  ],
  Hearthstone: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "scene_state",
    "collection",
    "decks",
    "match",
    "match_info",
  ],
  HeroesOfTheStorm: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "match_info",
    "me",
    "game_info",
    "roster",
    "death",
    "kill",
  ],
  LeagueOfLegends: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "live_client_data",
    "matchState",
    "match_info",
    "death",
    "respawn",
    "abilities",
    "kill",
    "assist",
    "gold",
    "minions",
    "summoner_info",
    "gameMode",
    "teams",
    "level",
    "announcer",
    "counters",
    "damage",
    "heal",
  ],
  LegendsOfRuneterra: ["game_client_data"],
  Minecraft: ["gep_internal", "game_info", "match_info"],
  MTGArena: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "game_info",
    "match_info",
  ],
  Overwatch: ["gep_internal", "game_info", "match_info", "kill", "death"],
  PUBG: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "kill",
    "revived",
    "death",
    "killer",
    "match",
    "rank",
    "counters",
    "location",
    "me",
    "team",
    "phase",
    "map",
    "roster",
  ],
  PUBGLite: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "kill",
    "revived",
    "death",
    "killer",
    "match",
    "rank",
    "me",
    "phase",
    "map",
    "team_feed",
    "team",
  ],
  PathOfExile: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "kill",
    "death",
    "me",
    "match_info",
  ],
  RainbowSixSiege: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "game_info",
    "match",
    "match_info",
    "roster",
    "kill",
    "death",
    "me",
  ],
  RocketLeague: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "stats",
    "teamGoal",
    "opposingTeamGoal",
    "match",
    "roster",
    "me",
    "match_info",
  ],
  Splitgate: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "game_info",
    "match_info",
    "player",
    "location",
    "match",
    "feed",
    "connection",
    "kill",
    "death",
    "portal",
    "assist",
  ],
  StarCraft2: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "match_info",
  ],
  TeamfightTactics: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "live_client_data",
    "me",
    "match_info",
    "roster",
    "store",
    "board",
    "bench",
    "carousel",
  ],
  Valheim: ["gep_internal", "game_info"],
  Valorant: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "me",
    "game_info",
    "match_info",
    "kill",
    "death",
  ],
  Warframe: ["gep_internal", "game_info", "match_info"],
  WorldOfTanks: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "kill",
    "death",
    "game_info",
    "match_info",
  ],
  WorldOfWarcraft: ["game_info"],
  WorldOfWarships: [
    /**
     * Internal use for Overwolf (Version numbers for GEP, Game Event Provider)
     */
    "gep_internal",
    "game_info",
    "account_info",
    "match",
    "match_info",
    "kill",
    "death",
  ],
};

/**
 * @typedef {Object} OverwolfGameWithEvents
 * @property {string} game
 * @property {string[]} events
 */

/**
 * Gets the supported events for the specified classId
 * @param {Number} classId This is the classId you get from the gameInfo-object
 * @returns {OverwolfGameWithEvents} Returns an array of supported events if there's a game that corresponds to the classId, otherwise null
 */
function getSupportedFeatures(classId) {
  let game = Object.keys(OverwolfGameWithEventSupport).find(
    (key) => OverwolfGameWithEventSupport[key] == classId
  );
  if (game) {
    return { game: game, events: OverwolfGameSupportedEvents[game] };
  }

  return null;
}

/**
 * Gets the supported events for the specified classId
 * @param {Number} classId This is the classId you get from the gameInfo-object
 * @param {Function|null} callback This is what you use to manage the data returned
 */
function getSupportedFeaturesOnline(classId, callback) {
  let game = Object.keys(OverwolfGameWithEventSupport).find(
    (key) => OverwolfGameWithEventSupport[key] == classId
  );
  if (game) {
    fetch(`https://game-events-status.overwolf.com/${classId}_prod.json`)
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (!!callback) {
          callback({
            game: game,
            events: json.features.map((f) => f.name),
          });
        }
      })
      .catch((err) => console.log(err));
  }
}

if (typeof overwolf !== "undefined" && typeof overwolf.games !== "undefined") {
  overwolf.games.getSupportedFeatures = getSupportedFeatures;
  overwolf.games.getSupportedFeaturesOnline = getSupportedFeaturesOnline;
}

if (typeof exports !== "undefined") {
  exports.getSupportedFeatures = getSupportedFeatures;
  exports.getSupportedFeaturesOnline = getSupportedFeaturesOnline;

  exports.OverwolfGameWithEventSupport = OverwolfGameWithEventSupport;
  exports.OverwolfGameSupportedEvents = OverwolfGameSupportedEvents;
}
