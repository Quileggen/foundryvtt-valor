import {VALOR} from "../helpers/config.mjs";
import {AsyncFunction, getActiveAttribute, isLeastGM} from "../utils.mjs";
import * as Technique from "./items/technique.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class valorItem extends Item {


  /**
   * @override
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
      }

  /**
   * @override
   * */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    super.prepareBaseData();
  }


  /**
   * @override
   * Augment the basic item data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an item
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }


  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;
    console.log(item);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `<h2>${item.name}</h2><i>Level ${item.system.level.value}</i>`;

    let formula = null;
    let content = "";
    const text = item.system.text;
    if (item.type == "technique") {
      // 1d10 + active attribute + attack roll bonus (all) + attack roll bonus (active attribute)
      // Then remove any empty additions
      formula = `1d10+${item.parent.system.attribute[item.system.attribute.opposedRoll].value ?? 0}+${item.parent.system.rollModifiers.allRolls.value ?? 0}+${item.parent.system.rollModifiers.attackRolls.all.value ?? 0}+${item.parent.system.rollModifiers.attackRolls[item.system.attribute.opposedRoll].value ?? 0}`;
      formula = formula.replaceAll("+0", "");

      content = content.concat("<br>", text.crunch.effect);
      if (text.flavor.user) {content = content.concat("<br><br>", text.flavor.user);}
      else {content = content.concat("<br><br>", text.flavor.default);}

      // If item has uses, use one
      if (item.system.uses.value > 0) {
        item.update({system: {uses: {value: item.system.uses.value - 1}}});
      }

      // Subtract costs from technique's actor
      item.actor.update({
        system: {
          statistic: {
            health: {value: item.actor.system.statistic.health.value - item.system.cost.health.value},
            stamina: {value: item.actor.system.statistic.stamina.value - item.system.cost.stamina.value},
            valor: {value: item.actor.system.statistic.valor.value - item.system.cost.valor.value}
        }}});
    }

    // If there's no roll data, send a chat message.
    if (!formula) {
      switch (item.type) {
        case "skill":
        case "flaw":
          content = content.concat("<br><b>Effect:</b> ", text.effect);
          if (text.levelUp) {content = content.concat("<br><b>Level Up:</b> ", text.levelUp);}
          if (text.special) {content = content.concat("<br><b>Special:</b> ", text.special);}
          break;
        case "technique":
          content = content.concat("<br>", text.crunch.effect);
          if (text.flavor.user) {content = content.concat("<br><br>", text.flavor.user);}
          else {content = content.concat("<br><br>", text.flavor.default);}
          break;
        default:
          content = item.name;
      }
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: content
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label.concat(content),
      });
      return roll;
    }
  }
}
