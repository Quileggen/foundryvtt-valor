/**
 * Extend the base TokenDocument to support resource type attributes.
 * @extends {TokenDocument}
 */
export class valorToken extends TokenDocument {
    getBarAttribute(barName, options) {
        const barData = super.getBarAttribute(barName, options);
        if (barData) {
            const barAttribute = barData.attribute;
            const actor = this.actor;
            barData.max = foundry.utils.getProperty(actor.system, barAttribute).max.value;
        }
        return barData;
    }
}
