'use strict';

/**
 * TODO revamp:
 *
 * Replace required xp with building points
 * Make building points with materials (e.g. wood/stone/planks)
 * Milestones unlock better materials? (e.g. copper/iron)
 * Reset building points on prestige
 */
addLayer('to', {
    name: 'Tower',
    symbol: 'T',
    /** @returns {typeof player.to} */
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            random: layers.to.materials.randomize(),
        };
    },
    layerShown() { return player.to.unlocked; },
    color: '#996644',
    row: 1,
    position: 0.5,
    resource: 'floors',
    //todo Are these good hotkeys?
    hotkeys: [
        {
            key: 'f',
            description: 'F: Reset for floors',
            unlocked() { return player.to.unlocked; },
            onPress() { doReset('to'); },
        },
        {
            key: 't',
            description: 'T: Display floors layer',
            unlocked() { return player.to.unlocked; },
            onPress() { showTab('to'); },
        },
    ],
    tabFormat: {
        'Floors': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'milestones',
            ],
        },
        'Materials': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'buyables',
            ],
        },
    },
    /** @type {Layers['to']['milestones']} */
    milestones: {
        1: {
            requirementDescription: 'Layering: Build a floor',
            effect() { return D.root(player.to.points, 2).floor(); },
            effectDescription() {
                const effect = shiftDown ? '[2√(floors)]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Increase city size by ${effect} layers`;
            },
            done() { return player.to.points.gte(1); },
        },
    },
    /** @type {Layers['to']['buyables']} */
    buyables: {
        // Random
        11: {
            title() { return `${capitalize_words(tmp.lo.items[player.to.random[0]].name)} Block`; },
            display() {
                const item = player.to.random[0];

                let cost = '';
                if (shiftDown) {
                    const entry = tmp.to.materials.low[item];
                    cost = `[${format(entry.req)} * ${format(entry.base)} ^ (${format(entry.exp)} ^ amount)]`;
                } else {
                    cost = `${format(player.lo.items[item].amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items[item].name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                const item = player.to.random[0],
                    entry = tmp.to.materials.low[item];

                return D.pow(entry.exp, getBuyableAmount(this.layer, this.id)).pow_base(entry.base).times(entry.req);
            },
            canAfford() {
                const item = player.to.random[0];

                return D.gte(player.lo.items[item].amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                const item = player.to.random[0];

                layers.lo.items['*'].gain_items(item, tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const item = player.to.random[0],
                    style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items[item].style['background-color'];

                return style;
            },
        },
        12: {
            title() { return `${capitalize_words(tmp.lo.items[player.to.random[1]].name)} Block`; },
            display() {
                const item = player.to.random[1];

                let cost = '';
                if (shiftDown) {
                    const entry = tmp.to.materials.medium[item];
                    cost = `[${format(entry.req)} * ${format(entry.base)} ^ (${format(entry.exp)} ^ amount)]`;
                } else {
                    cost = `${format(player.lo.items[item].amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items[item].name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                const item = player.to.random[1],
                    entry = tmp.to.materials.medium[item];

                return D.pow(entry.exp, getBuyableAmount(this.layer, this.id)).pow_base(entry.base).times(entry.req);
            },
            canAfford() {
                const item = player.to.random[1];

                return D.gte(player.lo.items[item].amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                const item = player.to.random[1];

                layers.lo.items['*'].gain_items(item, tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const item = player.to.random[1],
                    style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items[item].style['background-color'];

                return style;
            },
            unlocked: false,
        },
        13: {
            title() { return `${capitalize_words(tmp.lo.items[player.to.random[2]].name)} Block`; },
            display() {
                const item = player.to.random[2];

                let cost = '';
                if (shiftDown) {
                    const entry = tmp.to.materials.high[item];
                    cost = `[${format(entry.req)} * ${format(entry.base)} ^ (${format(entry.exp)} ^ amount)]`;
                } else {
                    cost = `${format(player.lo.items[item].amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items[item].name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                const item = player.to.random[2],
                    entry = tmp.to.materials.high[item];

                return D.pow(entry.exp, getBuyableAmount(this.layer, this.id)).pow_base(entry.base).times(entry.req);
            },
            canAfford() {
                const item = player.to.random[2];

                return D.gte(player.lo.items[item].amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                const item = player.to.random[2];

                layers.lo.items['*'].gain_items(item, tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const item = player.to.random[2],
                    style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items[item].style['background-color'];

                return style;
            },
            unlocked: false,
        },
        // Basic Materials
        //todo stone, normal wood, copper ore
        // Decent Materials
        //todo stone brick, copper ingot, iron ore
        // Great Materials
        //todo iron ingot, bronze ingot, steel ingot
    },
    /** @type {Layers['to']['materials']} */
    materials: {
        low: {
            'slime_goo': {
                req: 200,
                base: 2.5,
                exp: 2,
            },
            'slime_core_shard': {
                req: 100,
                base: 2,
                exp: 2,
            },
        },
        medium: {
            'slime_core': {
                req: 50,
                base: 1.5,
                exp: 2,
            },
            'red_fabric': {
                req: 200,
                base: 2.5,
                exp: 2.5,
            },
            'pyrite_coin': {
                req: 100,
                base: 2,
                exp: 2.5,
            },
        },
        high: {
            'rusty_gear': {
                req: 50,
                base: 1.5,
                exp: 2.5,
            },
            'coal': {
                req: 100,
                base: 3,
                exp: 3,
            },
        },
        randomize() {
            const low = Object.keys(run(layers.to.materials.low, layers.to.materials)),
                medium = Object.keys(run(layers.to.materials.medium, layers.to.materials)),
                high = Object.keys(run(layers.to.materials.high, layers.to.materials));

            return [
                low[Math.floor(low.length * Math.random())],
                medium[Math.floor(medium.length * Math.random())],
                high[Math.floor(high.length * Math.random())],
            ];
        },
    },
    type: 'static',
    baseResource: 'building materials',
    baseAmount() { return layerBuyableAmount('to'); },
    requires: new Decimal(25),
    base: Decimal.dTwo,
    exponent: Decimal.dTwo,
    roundUpCost: true,
    branches: ['xp_alt'],
    prestigeNotify() { return canReset('to') || canAffordLayerBuyable('to'); },
});
