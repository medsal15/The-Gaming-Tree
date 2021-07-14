/**
 * Checks if an upgrade can be purchased in a layer
 *
 * @param {String} layer Layer to check for
 * @returns {Boolean} True if an unlocked upgrade can be purchased
 */
function canAffordLayerUpgrade(layer) {
    if (!tmp[layer].upgrades) return false;

    for (let id in tmp[layer].upgrades) {
        if (isNaN(id)) continue;
        let upgrade = tmp[layer].upgrades[id];
        if (!upgrade.unlocked) continue;
        if (!hasUpgrade(layer, id) && canAffordUpgrade(layer, id)) return true;
    }
    return false;
}
/**
 * Checks if a buyable can be purchased in a layer
 *
 * @param {String} layer Layer to check for
 * @returns {Boolean} True if an unlocked buyable can be purchased
 */
function canAffordLayerBuyable(layer) {
    if (!tmp[layer].buyables) return false;

    for (let id in tmp[layer].buyables) {
        if (isNaN(id)) continue;
        let buyable = tmp[layer].buyables[id];
        if (!buyable.unlocked) continue;
        if (canBuyBuyable(layer, id)) return true;
    }
    return false;
}
