// Import document classes.
import { valorActor } from "./documents/actor.mjs";
import { valorItem } from "./documents/item.mjs";
import { valorActiveEffect } from "./documents/activeEffect.mjs";
import { valorToken } from "./documents/token.mjs";
// Import sheet classes.
import { valorActorSheet } from "./sheets/actor-sheet.mjs";
import { valorItemSheet } from "./sheets/item-sheet.mjs";
import { valorActiveEffectConfig } from "./sheets/valor-active-effect-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { VALOR } from "./helpers/config.mjs";
import {_runCompendiumTechScript} from "./documents/items/technique.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.valor = {
    valorActor,
    valorItem,
    valorActiveEffect,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.VALOR = VALOR;
  CONFIG.ActiveEffect.legacyTransferral = false;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d10 + @statistic.initiative.value",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = valorActor;
  CONFIG.Item.documentClass = valorItem;
  CONFIG.Token.documentClass = valorToken;
  CONFIG.ActiveEffect.documentClass = valorActiveEffect;
  
  // v13 implements Application2 api
  const _Actors = (foundry.documents.collections) ? foundry.documents.collections.Actors : Actors;
  const _Items = (foundry.documents.collections) ? foundry.documents.collections.Items : Items;
  // Register sheet application classes
  _Actors.unregisterSheet("core", ActorSheet);
  _Actors.registerSheet("valor", valorActorSheet, { makeDefault: true });
  _Items.unregisterSheet("core", ItemSheet);
  _Items.registerSheet("valor", valorItemSheet, { makeDefault: true });
  DocumentSheetConfig.registerSheet(ActiveEffect, 'valor', valorActiveEffectConfig, {makeDefault: true})

  //enable sockets
  game.socket.on('system.valor', await handleSocketEvent);

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

//preload Compendiums
Hooks.once('ready', async function() {
  const techCompendium = game.packs.get("valor.techniques");
  const skillFlawCompendium = game.packs.get("valor.flaws-and-skills");

  for (let techComponent of techCompendium.index) {
    fromUuid(techComponent.uuid);
    console.log(techComponent)
  }
  for (let skillFlawComponent of skillFlawCompendium.index) {
    fromUuid(skillFlawComponent.uuid);
    console.log(skillFlawComponent)
  }
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('isLimited', function(num) {
  return num < Number.POSITIVE_INFINITY;
});

Handlebars.registerHelper('json', function(obj) {
  return JSON.stringify(obj, null, "  ");
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = system;

  // Create the macro command
  const command = `game.valor.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "valor.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}

/* -------------------------------------------- */
/*  Socket Functions                             */
/* -------------------------------------------- */

//handle Socket Events
async function handleSocketEvent({type, ...args}) {
  switch(type) {
    case 'TECHCOMPENDIUMSCRIPT':
      console.log(args)
      await _runCompendiumTechScript(args.technique, args.item);
      break;
  }
}