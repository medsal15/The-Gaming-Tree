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
/**
 * Sums the amount of purchased buyables in a layer
 *
 * @param {String} layer Layer to check in
 * @returns {Decimal} The amount of purchased buyables
 */
function layerBuyableAmount(layer) {
    if (!tmp[layer].buyables) return new Decimal(0);

    let sum = new Decimal(0);
    for (let id in tmp[layer].buyables) {
        if (isNaN(id)) continue;
        sum = sum.add(getBuyableAmount(layer, id));
    }
    return sum;
}
/**
 * Calculates the sum of the `amount` first consecutive powers of `base`
 *
 * @param {Decimal} base
 * @param {Decimal} amount
 * @returns {Decimal}
 */
function powerSum(base, amount) {
    if (amount.eq(0)) return Decimal.dZero;
    if (base.eq(1)) return base.times(amount);

    return base.pow(amount.add(1)).div(base.minus(1));
}
