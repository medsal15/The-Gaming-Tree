'use strict';

const resources = {
    // City
    /** @prop {Resource<'science'>} */
    science: {
        _resource: null,
        get resource() { return this._resource ??= Object.keys(resources).find(resource => resources[resource] == this); },
        name: 'science',
        color: '#AA99FF',
        getStartData() {
            return {
                amount: D.dZero,
                best: D.dZero,
                total: D.dZero,
            };
        },
        /** @this {Resource<'science'>} */
        gain_mult() {
            let normal = D.dOne,
                alt = D.dOne;

            const upg = false;
            if (upg && hasUpgrade('s', upg)) {
                normal = normal.times(upgradeEffect('s', upg));
            } else if (inChallenge('b', 12)) {
                normal = normal.div(D.add(player.resources[this.resource].amount, 10).log10());
            }

            return {
                normal: normal.times(alt.pow(tmp.a.change_efficiency)),
                alt: alt.times(normal.pow(tmp.a.change_efficiency)),
            };
        },
        alternate: true,
        negate_b32: false,
    },
    /** @prop {Resource<'energy'>} */
    energy: {
        _resource: null,
        get resource() { return this._resource ??= Object.keys(resources).find(resource => resources[resource] == this); },
        name: 'energy',
        color: '#FFEE00',
        getStartData() {
            return {
                amount: D.dZero,
            };
        },
        /** @this {Resource<'energy'>} */
        gain_mult() {
            let normal = D.dOne,
                alt = D.dOne;

            const upg = false;
            if (upg && hasUpgrade('s', upg)) {
                normal = normal.times(upgradeEffect('s', upg));
            } else if (inChallenge('b', 12)) {
                normal = normal.div(D.add(player.resources[this.resource].amount, 10).log10());
            }

            return {
                normal: normal.times(alt.pow(tmp.a.change_efficiency)),
                alt: alt.times(normal.pow(tmp.a.change_efficiency)),
            };
        },
        alternate: true,
        negate_b32: false,
    },
};

/**
 * @param {keyof typeof resources} resource
 * @param {DecimalSource} gain
 */
function addResource(resource, gain) {
    const res = player.resources[resource];

    res.amount = D.add(res.amount, gain).max(0);
    if ('best' in res && D.lt(res.best, res.amount)) res.best = res.amount;
    if ('total' in res && D.gt(gain, 0)) res.total = D.add(res.total, gain);
}

/**
 * @param {keyof typeof resources} resource
 * @param {string} text
 * @param {string} [style=""]
 */
function resourceColor(resource, text, style = "") {
    return `<span style="color:${tmp.resources[resource].color};text-shadow:${tmp.resources[resource].color} 0 0 10px;${style}">${text}</span>`;
}
