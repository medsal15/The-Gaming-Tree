'use strict';

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
                const effect = shiftDown ? '[2√(floors)]' : formatWhole(tmp[this.layer].milestones[this.id].effect);
                return `Increase city size by ${effect} layers`;
            },
            done() { return player.to.points.gte(1); },
        },
        2: {
            requirementDescription: 'Hatchery: Build 2 floors',
            effect() { return D.pow(1.1, player.to.points); },
            effectDescription() {
                const effect = shiftDown ? '[1.1 ^ floors]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Multiply taming progress gain by ${effect}`;
            },
            done() { return player.to.points.gte(2); },
        },
        3: {
            requirementDescription: 'Engineering: Build 3 floors',
            effectDescription: 'Unlock more tower materials',
            done() { return player.to.points.gte(3); },
        },
        4: {
            requirementDescription: 'Smelter: Build 4 floors',
            effectDescription: 'Unlock the ability to build small smelters',
            done() { return player.to.points.gte(4); },
        },
        5: {
            requirementDescription: 'Greenhouse: Build 5 floors',
            effect() { return D.pow(1.25, player.to.points); },
            effectDescription() {
                const effect = shiftDown ? '[1.25 ^ floors]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Multiply harvest yield by ${effect}`;
            },
            done() { return player.to.points.gte(5); },
        },
        //todo 6: well
        //todo 7: more materials
        //todo 8: arc furnace
    },
    /** @type {Layers['to']['buyables']} */
    buyables: {
        // Random
        11: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} ${capitalize_words(tmp.lo.items[player.to.random[0]].name)} Block`; },
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
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} ${capitalize_words(tmp.lo.items[player.to.random[1]].name)} Block`; },
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
            unlocked() { return hasMilestone('to', 3); },
        },
        13: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} ${capitalize_words(tmp.lo.items[player.to.random[2]].name)} Block`; },
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
        21: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Stone Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 2 ^ (1.5 ^ amount)]';
                } else {
                    cost = `${format(player.lo.items.stone.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.stone.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                return D.pow(1.5, getBuyableAmount(this.layer, this.id)).pow_base(2).times(75);
            },
            canAfford() {
                return D.gte(player.lo.items.stone.amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                layers.lo.items['*'].gain_items('stone', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.stone.style['background-color'];

                return style;
            },
        },
        22: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Plank Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 2 ^ (1.5 ^ amount)]';
                } else {
                    cost = `${format(player.lo.items.plank.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.plank.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                return D.pow(1.5, getBuyableAmount(this.layer, this.id)).pow_base(2).times(75);
            },
            canAfford() {
                return D.gte(player.lo.items.plank.amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                layers.lo.items['*'].gain_items('plank', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.plank.style['background-color'];

                return style;
            },
        },
        23: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Copper Ore Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[25 * 2 ^ (1.5 ^ amount)]';
                } else {
                    cost = `${format(player.lo.items.copper_ore.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.copper_ore.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                return D.pow(1.5, getBuyableAmount(this.layer, this.id)).pow_base(2).times(25);
            },
            canAfford() {
                return D.gte(player.lo.items.copper_ore.amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                layers.lo.items['*'].gain_items('copper_ore', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.copper_ore.style['background-color'];

                return style;
            },
        },
        // Decent Materials
        31: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Stone Brick Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 2 ^ (1.5 ^ amount)]';
                } else {
                    cost = `${format(player.lo.items.stone_brick.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.stone_brick.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                return D.pow(1.5, getBuyableAmount(this.layer, this.id)).pow_base(2).times(75);
            },
            canAfford() {
                return D.gte(player.lo.items.stone_brick.amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                layers.lo.items['*'].gain_items('stone_brick', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.stone_brick.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        32: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Copper Ingot Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 2 ^ (1.5 ^ amount)]';
                } else {
                    cost = `${format(player.lo.items.copper_ingot.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.copper_ingot.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                return D.pow(1.5, getBuyableAmount(this.layer, this.id)).pow_base(2).times(75);
            },
            canAfford() {
                return D.gte(player.lo.items.copper_ingot.amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                layers.lo.items['*'].gain_items('copper_ingot', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.copper_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        33: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Iron Ore Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[50 * 2 ^ (1.25 ^ amount)]';
                } else {
                    cost = `${format(player.lo.items.iron_ore.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.iron_ore.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                return D.pow(1.25, getBuyableAmount(this.layer, this.id)).pow_base(2).times(50);
            },
            canAfford() {
                return D.gte(player.lo.items.iron_ore.amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                layers.lo.items['*'].gain_items('iron_ore', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.iron_ore.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        // Great Materials
        //todo iron ingot, bronze ingot, steel ingot
    },
    /** @type {Layers['to']['materials']} */
    materials: {
        low: {
            'slime_goo': {
                req: 100,
                base: 2.5,
                exp: 2,
            },
            'slime_core_shard': {
                req: 50,
                base: 2,
                exp: 2,
            },
        },
        medium: {
            'slime_core': {
                req: 25,
                base: 1.5,
                exp: 2,
            },
            'red_fabric': {
                req: 100,
                base: 2.5,
                exp: 2.5,
            },
            'pyrite_coin': {
                req: 50,
                base: 2,
                exp: 2.5,
            },
        },
        high: {
            'rusty_gear': {
                req: 25,
                base: 1.5,
                exp: 2.5,
            },
            'coal': {
                req: 50,
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
    requires: new Decimal(12.5),
    base: Decimal.dTwo,
    exponent: Decimal.dTwo,
    roundUpCost: true,
    branches: ['xp_alt'],
    /** @this {Layers['to']} */
    doReset(layer) {
        if (layer == 'to') {
            Object.keys(tmp.to.buyables)
                .filter(id => !['layer', 'rows', 'cols'].includes(id))
                .forEach(id => setBuyableAmount('to', id));
            player.to.random = layers.to.materials.randomize();
        } else if (tmp[layer].row > this.row) {
            layerDataReset(this.layer);
        }
    },
    prestigeNotify() { return canReset('to') || canAffordLayerBuyable('to'); },
});
