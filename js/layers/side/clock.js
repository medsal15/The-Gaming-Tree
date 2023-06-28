'use strict';

//todo forge buyables?
addLayer('clo', {
    name: 'Clock',
    symbol: '⏲',
    startData() {
        return { unlocked: true, };
    },
    layerShown() { return inChallenge('b', 51) || hasChallenge('b', 51); },
    color: '#FFFFFF',
    row: 'side',
    resource: 'time',
    type: 'none',
    position: 1,
    tabFormat: {
        'Time Speed': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.clo.time_speed)} seconds/s`],
                ['display-text', () => inChallenge('b', 51) ? '' : `<span style="color:#AA5555;">Time speed is lower for higher rows</span>`],
                'blank',
                () => {
                    if (inChallenge('b', 51)) {
                        return ['upgrades', [4]];
                    } else {
                        return ['upgrade-tree', [
                            [11, 12, 13],
                            [21, 22, 23],
                            [31, 32, 33],
                        ]];
                    }
                },
            ],
        },
        'Time Gears': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.clo.time_speed)} seconds/s`],
                'blank',
                ['buyables', [1, 2, 3, 4, 5]],
            ],
            unlocked() { return hasChallenge('b', 51); },
        },
    },
    /** @type {typeof layers.clo.upgrades} */
    upgrades: {
        11: {
            title: 'Experience connector',
            description: 'Applies time speed to experience layer',
            effectDisplay() { return `*${format(layers.clo.time_speed('xp', true))}`; },
            price: [['slime_goo', D(32)], ['slime_core_shard', D(8)], ['slime_core', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(cost)); },
            branches: [21, 22],
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.xp.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.xp.layerShown; },
        },
        12: {
            title: 'Mining connector',
            description: 'Applies time speed to mining layer',
            effectDisplay() { return `*${format(layers.clo.time_speed('m', true))}`; },
            price: [['stone', D(32)], ['copper_ore', D(8)], ['tin_ore', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(cost)); },
            branches: [22],
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.m.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.m.layerShown; },
        },
        13: {
            title() {
                if (!player.t.unlocked) return '??? connector';
                return 'Tree connector';
            },
            description() {
                if (!player.t.unlocked) return 'Applies time speed to ??? layer';
                return 'Applies time speed to tree layer';
            },
            effectDisplay() { return `*${format(D.dOne)}`; },
            price: [['soaked_log', D(32)], ['normal_log', D(8)]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(cost)); },
            unlocked() { return hasChallenge('b', 51) && player.t.unlocked; },
            branches: [23],
        },
        21: {
            title: 'Level connector',
            description: 'Applies time speed to level layer',
            effectDisplay() { return `*${format(layers.clo.time_speed('l', true))}`; },
            costDisplay() { return `Requires: ${formatWhole(5)} levels`; },
            canAfford() { return player.l.points.gte(5); },
            pay() { },
            branches: [31],
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.l.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.l.layerShown; },
        },
        22: {
            title: 'Loot connector',
            description: 'Applies time speed to loot layer',
            effectDisplay() { return `*${format(layers.clo.time_speed('lo', true))}`; },
            price: [['slime_goo', D(32)], ['copper_ore', D(8)], ['rusty_gear', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(cost)); },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.lo.layerShown; },
            branches: [23, 32],
        },
        23: {
            title: '??? connector',
            description: 'Applies time speed to ??? layer',
            effectDisplay() { return `*${format(D.dOne)}`; },
            costDisplay() { return 'Cost: Unknown'; },
            canAfford: false,
            pay() { },
            unlocked() { return hasChallenge('b', 51) && false; },
            branches: [33],
        },
        31: {
            title: 'Boss connector',
            description: 'Applies time speed to boss layer',
            effectDisplay() { return `*${format(layers.clo.time_speed('b', true))}`; },
            costDisplay: 'Cost: Free!',
            canAfford() { return !inChallenge('b', 51); },
            pay() { },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.b.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.b.layerShown; },
        },
        32: {
            title() {
                if (!player.s.unlocked) return '??? connector';
                return 'Shop connector';
            },
            description() {
                if (!player.s.unlocked) return 'Applies time speed to ??? layer';
                return 'Applies time speed to shop layer';
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('s', true))}`; },
            costDisplay() {
                if (!player.s.unlocked) return 'Cost: Unknown';

                return layers.s.coins.format(this.cost, false);
            },
            cost: D(100),
            canAfford() { return !inChallenge('b', 51) && player.s.points.gte(this.cost); },
            pay() { player.s.points = player.s.points.minus(this.cost); },
            unlocked() { return hasChallenge('b', 51) && tmp.s.layerShown; },
        },
        33: {
            title: '??? connector',
            description: 'Applies time speed to ??? layer',
            effectDisplay() { return `*${format(D.dOne)}`; },
            costDisplay() { return 'Cost: Unknown'; },
            canAfford: false,
            pay() { },
            unlocked() { return hasChallenge('b', 51) && false; },
        },
        41: {
            title: 'Hour Hand',
            description: 'Missing piece of The Clock<br>Doubles time speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(100),
            item: 'slime_goo',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return inChallenge('b', 51); },
        },
        42: {
            title: 'Minute Hand',
            description: 'Missing piece of The Clock<br>Doubles time speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(50),
            item: 'copper_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return inChallenge('b', 51); },
        },
        43: {
            title: 'Second Hand',
            description: 'Missing piece of The Clock<br>Doubles time speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(10),
            item: 'rusty_gear',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return inChallenge('b', 51); },
        },
    },
    buyables: {
        // enemy
        11: {
            title: 'Slime Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 30 + 1',
                        cost_formula_goo = '(1.5 ^ amount) * 32',
                        cost_formula_shard = '(1.5 ^ amount) * 8',
                        cost_formula_core = '1.5 ^ amount';

                    const cost_list = [
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                        `[${cost_formula_shard}] ${tmp.lo.items.slime_core_shard.name}`,
                        `[${cost_formula_core}] ${tmp.lo.items.slime_core.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    slime_goo: D(1.5).pow(x).times(32),
                    slime_core_shard: D(1.5).pow(x).times(8),
                    slime_core: D(1.5).pow(x),
                };
            },
            effect(x) {
                return D(1 / 30).times(x).add(1);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = layers.xp.enemy.color('slime');

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        12: {
            title: 'Goblin Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} goblin gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula_fabric = '(1.5 ^ amount) * 32',
                        cost_formula_coin = '(1.5 ^ amount) * 8',
                        cost_formula_gear = '(1.5 ^ amount)';

                    const cost_list = [
                        `[${cost_formula_fabric}] ${tmp.lo.items.red_fabric.name}`,
                        `[${cost_formula_coin}] ${tmp.lo.items.pyrite_coin.name}`,
                        `[${cost_formula_gear}] ${tmp.lo.items.rusty_gear.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} goblin gears\
                        multiply time speed by [${effect_formula}]<br><br>\
                        Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    red_fabric: D(1.5).pow(x).times(32),
                    pyrite_coin: D(1.5).pow(x).times(8),
                    rusty_gear: D(1.5).pow(x),
                };
            },
            effect(x) {
                return D(1 / 20).times(x).add(1);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = layers.xp.enemy.color('goblin');

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        13: {
            title: 'Zombie Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} zombie gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 15 + 1',
                        cost_formula_flesh = '(1.5 ^ amount) * 32',
                        cost_formula_iron = '(1.5 ^ amount) * 8',
                        cost_formula_brain = '1.5 ^ amount';

                    const cost_list = [
                        `[${cost_formula_flesh}] ${tmp.lo.items.rotten_flesh.name}`,
                        `[${cost_formula_iron}] ${tmp.lo.items.iron_ore.name}`,
                        `[${cost_formula_brain}] ${tmp.lo.items.brain.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} zombie gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    rotten_flesh: D(1.5).pow(x).times(32),
                    iron_ore: D(1.5).pow(x).times(8),
                    brain: D(1.5).pow(x),
                };
            },
            effect(x) {
                return D(1 / 15).times(x).add(1);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = layers.xp.enemy.color('zombie');

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && hasChallenge('b', 12); },
        },
        // mining
        21: {
            title: 'Stone Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} stone gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula = '(2 ^ amount) * 100';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.stone.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} stone gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    stone: D(2).pow(x).times(100),
                };
            },
            effect(x) {
                return D(1 / 20).times(x).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = tmp.lo.items.stone.style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        22: {
            title: 'Bronze Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} bronze gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount * 3 / 40 + 1',
                        cost_formula_copper = '(1.75 ^ amount) * 50',
                        cost_formula_tin = '(1.75 ^ amount) * 5';

                    const cost_list = [
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                        `[${cost_formula_tin}] ${tmp.lo.items.tin_ore.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} bronze gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    copper_ore: D(1.75).pow(x).times(50),
                    tin_ore: D(1.75).pow(x).times(5),
                };
            },
            effect(x) {
                return D(3 / 40).times(x).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#C4995E';

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        // shop
        31: {
            title: 'Money Gear',
            display() {
                if (!shiftDown) {
                    /** @type {Decimal} */
                    const cost = this.cost(getBuyableAmount(this.layer, this.id));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} money gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${layers.s.coins.format(cost, false)}`;
                } else {
                    let effect_formula = 'amount / 15 + 1',
                        cost_formula = '(2 ^ amount) * 100';

                    const cost_list = [
                        `[${cost_formula}] copper coins`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} money gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) { return D.dTwo.pow(x).times(100); },
            effect(x) { return D(1 / 15).times(x).add(1); },
            canAfford() { return this.cost(getBuyableAmount(this.layer, this.id)).lte(player.s.points); },
            buy() {
                player.s.points = player.s.points.minus(this.cost(getBuyableAmount(this.layer, this.id)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = layers.s.color;

                return style;
            },
            unlocked() { return player.s.unlocked; },
        },
        // deep mining
        41: {
            title: 'Iron Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} iron gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 10 + 1',
                        cost_formula = '(2 ^ amount) * 25';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.iron_ore.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} iron gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    iron_ore: D(2).pow(x).times(25),
                };
            },
            effect(x) {
                return D(1 / 10).times(x).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#888888';

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && hasChallenge('b', 12); },
        },
        42: {
            title: 'Gold Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} gold gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula = '(3 ^ amount) * 5';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.gold_ore.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} gold gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    gold_ore: D(3).pow(x).times(5),
                };
            },
            effect(x) {
                return D(1 / 20).times(x).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = 'gold';

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && player.m.show_deep; },
        },
        // tree
        51: {
            title: 'Wooden Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} wooden gears\
                    multiply time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula_soaked = '(1.5 ^ amount) * 32',
                        cost_formula_normal = '(1.5 ^ amount) * 8',
                        cost_formula_plank = '1.5 ^ amount';

                    const cost_list = [
                        `[${cost_formula_soaked}] ${tmp.lo.items.soaked_log.name}`,
                        `[${cost_formula_normal}] ${tmp.lo.items.normal_log.name}`,
                        `[${cost_formula_plank}] ${tmp.lo.items.plank.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} wooden gears\
                    multiply time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    soaked_log: D(1.5).pow(x).times(32),
                    normal_log: D(1.5).pow(x).times(8),
                    plank: D(1.5).pow(x),
                };
            },
            effect(x) {
                return D(1 / 20).times(x).add(1);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => player.lo.items[item].amount.gte(amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.minus(amount));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = layers.t.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.t.layerShown; },
        },
    },
    tooltip() { return `Time speed: *${format(tmp.clo.time_speed)}`; },
    /** @type {typeof layers.clo.time_speed} */
    time_speed(layer, visual = false) {
        let speed = D.dOne;

        if (inChallenge('b', 51)) {
            speed = speed.div(8);

            if (hasUpgrade('clo', 41)) speed = speed.times(upgradeEffect('clo', 41));
            if (hasUpgrade('clo', 42)) speed = speed.times(upgradeEffect('clo', 42));
            if (hasUpgrade('clo', 43)) speed = speed.times(upgradeEffect('clo', 43));
        }

        if (!visual && layer) {
            const links = {
                'xp': 11, 'm': 12, 't': 13,
                'l': 21, 'lo': 22,
                'b': 31, 's': 32,
            };
            if (!(layer in links) || !hasUpgrade(this.layer, links[layer])) return speed;
        }

        /** @type {number|'side'} */
        let row = tmp[layer]?.displayRow ?? tmp[layer]?.row ?? 0;
        if (row == 'side') row = 0;

        speed = speed.times(buyableEffect('clo', 11));
        speed = speed.times(buyableEffect('clo', 12));
        speed = speed.times(buyableEffect('clo', 13));
        speed = speed.times(buyableEffect('clo', 21));
        speed = speed.times(buyableEffect('clo', 22));
        speed = speed.times(buyableEffect('clo', 31));
        speed = speed.times(buyableEffect('clo', 41));
        speed = speed.times(buyableEffect('clo', 42));
        speed = speed.times(buyableEffect('clo', 51));

        speed = speed.root(D.dTwo.pow(row));

        return speed;
    },
});
