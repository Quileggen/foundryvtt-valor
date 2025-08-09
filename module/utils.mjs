import {VALOR} from "./helpers/config.mjs";

export const AsyncFunction = (async function() {}).constructor;

/**
 * takes a base attribute and returns the string name of the corresponding active attribtute
 * @param {string} baseAttribute
 * @returns {string}
 */
export function getActiveAttribute(baseAttribute) {
    const baseAttributes = Object.keys(VALOR.attributes.base);
    const activeAttributes = Object.keys(VALOR.attributes.active);
    const index = baseAttributes.indexOf(baseAttribute);
    return activeAttributes[index];
}

/**
 * takes an active attribute and returns the string name of the corresponding base attribute
 * @param {string} activeAttribute
 * @returns {string}
 */
export function getBaseAttribute(activeAttribute) {
    const baseAttributes = Object.keys(VALOR.attributes.base);
    const activeAttributes = Object.keys(VALOR.attributes.active);
    const index = activeAttributes.indexOf(activeAttribute);
    return baseAttributes[index];
}

/**
 * modifies a technique, bu changing its core, changind its attribute,
 * or adding a modifier/limit, base on type
 * @param {string} _id
 * @param {valorItem} technique
 * @returns {Promise<void>}
 */
export async function onTechOptChange(_id, technique) {
    console.log(_id)

    if (_id === -1) return;

    const techComp = game.packs.get("valor.techniques");
    const techOpt = (techComp.index).get(_id);

    if (techOpt?.type === "core") {
        technique.update(
            {
                "system.core.name": techOpt.name,
                "system.core._id": techOpt._id,
                "system.core.uuid": techOpt.uuid
            });
    } else if (techOpt?.type === "modifier" || techOpt?.type === "limit") {
        technique.setFlag('valor',`technique.${techOpt.type}.${_id}`,
            {
                "name": techOpt.name,
                "_id": techOpt._id,
                "uuid": techOpt.uuid,
                "level": 1
            });
    } else {
        technique.update(
            {
                "system.attribute.effect": _id,
            });
    }
}

/**
 * deletes a technique option (modifier, limit) from a technique,using its _id as reference to the option
 * @param {string} _id
 * @param {valorItem} technique
 */
export function onTechOptDelete(_id, technique) {

    if (_id == -1) return;

    const techComp = game.packs.get("valor.techniques");
    const techOpt = (techComp.index).get(_id);

    technique.unsetFlag('valor',`technique.${techOpt.type}.${_id}`);
}

/**
 * runs the setFlag method on an item when the flags text field is changed 
 * @param {valorItem} item
 * @param {string} flagString
 */
export function onFlagFieldChange(item, flagString) {

    console.log("Flags Changed");
    console.log(item);
    console.log(flagString);
    console.log(JSON.parse(flagString));
    const flagJson = JSON.parse(flagString);
    for (const key in flagJson) {
        item.setFlag('valor', key, flagJson[key]);
    }
}


/**
 * checks if a user is the GM with the least value id, for scenerios where
 * code should fire only once from a single GM
 * @returns {*|boolean}
 */
export function isLeastGM() {

    if (!game.user.isGM) {
        return false;
    }

    const leastGM = game.users
        .filter(user => user.isGM && user.active);

    if (leastGM.length > 1) {
        return leastGM.some(otherGM => otherGM._id < game.user._id);
    } else {
        return true;
    }
}

/**
 * checks if parent of child has itself a parent and calls a reset to trigger an update to it
 * @param child
 */
export function updateGrandParent(child) {
    if (child.parent?.parent !== null) {
        (child.parent.parent).reset();
    }
}