'use strict';

//todo add buyMax to buyables
addLayer('lo', {
    name: 'Loot',
    image: './resources/images/swap-bag.svg',
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    /** @returns {typeof player.lo} */
    startData() {
        return {
            // Required for a fake none layer
            unlocked: true,
            points: D.dZero,
            shown: false,
            items: Object.fromEntries(
                Object.keys(layers.lo.items)
                    .filter(item => item != '*')
                    .map(item => [item, { amount: D.dZero, }])
            ),
        };
    },
    tooltip() { return `${formatWhole(tmp.lo.items["*"].amount)} items`; },
    layerShown() { return (player.lo.shown || hasUpgrade('xp', 33)) && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#AA7755',
    row: 1,
    position: 1,
    hotkeys: [
        {
            key: 'O',
            description: 'Shift + O: Display loot layer',
            unlocked() { return tmp.lo.layerShown; },
            onPress() { showTab('lo'); },
        }
    ],
    tabFormat: {
        'Crafting': {
            content: [
                () => {
                    // I know it's irrelevant, but it's still here for consitency
                    const speed = layers.clo.time_speed('lo');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['upgrades', [1]],
                () => { if (tmp.lo.items['*'].craft_consumption.neq(1)) return ['display-text', `Crafting consumes ${format(tmp.lo.items['*'].craft_consumption.times(100))}% of required resources`]; },
                ['buyables', [1, 2, 3, 4, 5, 6, 7, 8, 9]],
            ],
        },
        'Inventory': {
            content: [
                () => {
                    const mult = tmp.lo.items["*"].gain_multiplier;

                    if (mult.neq(1)) return [
                        'column', [
                            ['display-text', `Global gain multiplier (does not apply to chances): *${format(mult)}`],
                            'blank',
                        ],
                    ];
                },
                () => {
                    const mult = tmp.lo.items["*"].global_chance_multiplier;

                    if (mult.neq(1)) return [
                        'column', [
                            ['display-text', `Global chance multiplier: *${format(mult)}`],
                            'blank',
                        ],
                    ];
                },
                () => {
                    if (
                        Object.keys(tmp.lo.items).some(item => item != '*' &&
                            (tmp.lo.items[item].unlocked ?? true) &&
                            'per_second' in tmp.lo.items[item].sources)
                    ) return ['display-text', 'Production per second depends on the layer doing it'];
                },
                'blank',
                'grid',
            ],
        },
    },
    upgrades: {
        11: {
            title: 'Lootbag',
            description() {
                if (!hasUpgrade('s', 22)) return 'Start getting items from your kills';

                return 'Double items gain';
            },
            effect() {
                if (!hasUpgrade('s', 22)) return D.dOne;

                return D.dTwo;
            },
            effectDisplay() {
                if (!hasUpgrade('s', 22)) return '';

                return `${format(upgradeEffect(this.layer, this.id))}`;
            },
            cost: D(250),
            currencyDisplayName: 'kills',
            currencyInternalName: 'kills',
            currencyLocation() { return tmp.xp.total; },
            canAfford() { return tmp.xp.total.kills.gte(250); },
            onPurchase() {
                player.lo.shown = true;
                doReset('lo', true);
            },
            pay() {
                /** @type {Decimal} */
                let to_lose = this.cost;
                Object.entries(player.xp.enemies)
                    .forEach(([type, data]) => {
                        if (to_lose.lte(0) || data.kills.lte(0)) return;
                        const lose = data.kills.min(to_lose);
                        player.xp.enemies[type].kills = D.minus(player.xp.enemies[type].kills, lose);
                        to_lose = D.minus(to_lose, lose);
                    });
            },
        },
    },
    /** @type {typeof layers.lo.buyables} */
    buyables: {
        // slime
        11: {
            title: 'Book of Slimes',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} books of slimes\
                    multiply experience gain by ${format(buyableEffect(this.layer, this.id))} (^1.1 for slimes)<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = '1.25 ^ amount',
                        cost_formula_goo = '(1.5 ^ amount) * 10',
                        cost_formula_shard = '1.1 ^ amount',
                        value_formula = 'amount';

                    if (value.gt(1)) {
                        value_formula += ` * ${formatWhole(value)}`;
                    }

                    const cost_list = [
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                        `[${cost_formula_shard}] ${tmp.lo.items.slime_core_shard.name}`,
                    ];

                    return `Your ${formatWhole(amount)} books of slimes\
                    multiply experience gain by [${effect_formula}] (^1.1 for slimes)<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    slime_goo: D(1.5).pow(x).times(10),
                    slime_core_shard: D(1.1).pow(x),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(1.25).pow(x);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['slime'].color;

                return style;
            },
            value() {
                let value = D.dOne;

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        12: {
            title: 'Storage Slime',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        /** @type {{xp_hold: Decimal, chance_mult: Decimal}} */
                        effect = buyableEffect(this.layer, this.id),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} storage slimes\
                    hold ${formatWhole(effect.xp_hold)} experience upgrades\
                    and multiply drop chances by ${format(effect.chance_mult)}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_hold = 'amount',
                        effect_formula_mult = 'amount / 20 + 1',
                        cost_formula_goo = '(1.25 ^ amount) * 10',
                        cost_formula_shard = '(1.2 ^ amount) * 3',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                        `[${cost_formula_shard}] ${tmp.lo.items.slime_core_shard.name}`,
                    ];

                    return `Your ${formatWhole(amount)} storage slimes\
                    hold [${effect_formula_hold}] experience upgrades\
                    and multiply drop chances by [${effect_formula_mult}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    slime_goo: D(1.25).pow(x).times(10),
                    slime_core_shard: D(6 / 5).pow(x).times(3),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    xp_hold: D(x),
                    chance_mult: D(.05).times(x).add(1),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['slime'].color;

                return style;
            },
            value() {
                let value = D(5);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        13: {
            title: 'Sticky Trap',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {/** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} sticky traps\
                    divide enemy health by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = '1.1 ^ amount',
                        cost_formula_goo = '(1.5 ^ amount) * 30',
                        cost_formula_core = '1.1 ^ amount',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                        `[${cost_formula_core}] ${tmp.lo.items.slime_core.name}`,
                    ];

                    return `Your ${formatWhole(amount)} sticky traps\
                    divide enemy health by [${effect_formula}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    slime_goo: D(1.5).pow(x).times(30),
                    slime_core: D(1.1).pow(x),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(1.1).pow(x);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['slime'].color;

                return style;
            },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // mining
        21: {
            title: 'Stone Furnace',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {Decimal} */
                    bonus = tmp[this.layer].buyables[this.id].bonusAmount,
                    amount_bonus = bonus.gt(0) ? `+${formatWhole(bonus)}` : '',
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)}${amount_bonus} stone furnace\
                    multiply ore health by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = '1.125 ^ amount',
                        cost_formula_stone = '(1.5 ^ amount) * 10',
                        cost_formula_copper = '(1.25 ^ amount) * 5',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('m', 51)) {
                        effect_formula = `(${effect_formula}) ^ ${format(upgradeEffect('m', 51))}`;
                    }

                    if (hasUpgrade('f', 11)) {
                        cost_formula_stone += ` / ${format(D.pow(upgradeEffect('f', 11)['stone_brick'], -1))}`;
                        cost_formula_copper += ` / ${format(D.pow(upgradeEffect('f', 11)['copper_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_stone}] ${tmp.lo.items.stone.name}`,
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_stone}] ${tmp.lo.items.stone_brick.name}`;
                        cost_list[1] = `[${cost_formula_copper}] ${tmp.lo.items.copper_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)}${amount_bonus} stone furnace\
                    multiply ore health by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    stone: D(1.5).pow(x).times(10),
                    copper_ore: D(1.25).pow(x).times(5),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['stone_brick'] = cost['stone'].times(upgradeEffect('f', 11)['stone_brick']);
                    delete cost['stone'];
                    cost['copper_ingot'] = cost['copper_ore'].times(upgradeEffect('f', 11)['copper_ingot']);
                    delete cost['copper_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                let mult = D(1.125).pow(x);

                if (hasUpgrade('m', 51)) mult = mult.pow(upgradeEffect('m', 51));

                return mult;
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.stone.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items['*'].has_anvil || getBuyableAmount(this.layer, this.id).gte(1) || hasChallenge('b', 11); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
            bonusAmount() {
                let bonus = buyableEffect('lo', 51);

                return bonus;
            },
        },
        22: {
            title: 'Copper Golem',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {Decimal} */
                    bonus = tmp[this.layer].buyables[this.id].bonusAmount,
                    amount_bonus = bonus.gt(0) ? `+${formatWhole(bonus)}` : '',
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)}${amount_bonus} copper golems\
                    multiply mining chance by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 6 + 1',
                        cost_formula_copper = '(1.3 ^ amount) * 25',
                        cost_formula_core = '(1.125 ^ amount) * 5',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_copper += ` / ${format(D.pow(upgradeEffect('f', 11)['copper_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                        `[${cost_formula_core}] ${tmp.lo.items.slime_core.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_copper}] ${tmp.lo.items.copper_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)}${amount_bonus} copper golems\
                    multiply mining chance by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    copper_ore: D(1.3).pow(x).times(25),
                    slime_core: D(1.125).pow(x).times(5),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['copper_ingot'] = cost['copper_ore'].times(upgradeEffect('f', 11)['copper_ingot']);
                    delete cost['copper_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D.div(x, 6).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.copper_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items['*'].has_anvil || getBuyableAmount(this.layer, this.id).gte(1) || hasChallenge('b', 11); },
            value() {
                let value = D(7);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
            bonusAmount() {
                let bonus = buyableEffect('lo', 51);

                return bonus;
            },
        },
        23: {
            title: 'Tin Chest',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {Decimal} */
                    bonus = tmp[this.layer].buyables[this.id].bonusAmount,
                    amount_bonus = bonus.gt(0) ? `+${formatWhole(bonus)}` : '',
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        /** @type {{m_hold: Decimal, chance_mult: Decimal}} */
                        effect = buyableEffect(this.layer, this.id),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)}${amount_bonus} tin chests\
                    multiply drop and mining chance by ${format(effect.chance_mult)} and keep ${formatWhole(effect.m_hold)} mining upgrades through resets<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_hold = 'amount',
                        effect_formula_mult = 'amount / 20 + 1',
                        cost_formula_tin = '(1.25 ^ amount) * 2',
                        cost_formula_copper = '(1.125 ^ amount) * 50',
                        cost_formula_goo = '(1.5 ^ amount) * 20',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_tin += ` / ${format(D.pow(upgradeEffect('f', 11)['tin_ingot'], -1))}`;
                        cost_formula_copper += ` / ${format(D.pow(upgradeEffect('f', 11)['copper_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                        `[${cost_formula_tin}] ${tmp.lo.items.tin_ore.name}`,
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_copper}] ${tmp.lo.items.copper_ingot.name}`;
                        cost_list[1] = `[${cost_formula_tin}] ${tmp.lo.items.tin_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)}${amount_bonus} tin chests\
                    multiply drop and mining chance by [${effect_formula_mult}] and keep [${effect_formula_hold}] mining upgrades through resets<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    tin_ore: D(1.25).pow(x).times(2),
                    copper_ore: D(1.125).pow(x).times(50),
                    slime_goo: D(1.5).pow(x).times(20)
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['copper_ingot'] = cost['copper_ore'].times(upgradeEffect('f', 11)['copper_ingot']);
                    delete cost['copper_ore'];
                    cost['tin_ingot'] = cost['tin_ore'].times(upgradeEffect('f', 11)['tin_ingot']);
                    delete cost['tin_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    m_hold: D(x),
                    chance_mult: D(.05).times(x).add(1)
                };
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.tin_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items['*'].has_anvil || getBuyableAmount(this.layer, this.id).gte(1) || hasChallenge('b', 11); },
            value() {
                let value = D(5);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
            bonusAmount() {
                let bonus = buyableEffect('lo', 52);

                return bonus;
            },
        },
        // goblin
        31: {
            title: 'Red Slime',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} red slimes\
                    multiply damage by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula_fabric = '(1.25 ^ amount) * 10',
                        cost_formula_goo = '(1.5 ^ amount) * 25',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_fabric}] ${tmp.lo.items.red_fabric.name}`,
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                    ];

                    return `Your ${formatWhole(amount)} red slimes\
                    multiply damage by [${effect_formula}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    red_fabric: D(1.25).pow(x).times(10),
                    slime_goo: D(1.5).pow(x).times(25),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(.05).times(x).add(1);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['goblin'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 11); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        32: {
            title: 'Coin Bag',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        /** @type {{chance_mult: Decimal, coin_mult: Decimal}} */
                        effect = buyableEffect(this.layer, this.id),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '',
                        coin_mult = tmp.s.layerShown ? ` and multiply coins gain by ${format(effect.coin_mult)}` : '';

                    return `Your ${formatWhole(amount)} coin bags\
                    multiply drop chances by ${format(effect.chance_mult)}${coin_mult}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_chance = 'amount / 20 + 1',
                        effect_formula_coin = '1.01 ^ amount',
                        cost_formula_fabric = '(1.5 ^ amount) * 10',
                        cost_formula_pyrite = '1.23 ^ amount',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_fabric}] ${tmp.lo.items.red_fabric.name}`,
                        `[${cost_formula_pyrite}] ${tmp.lo.items.pyrite_coin.name}`,
                    ];

                    return `Your ${formatWhole(amount)} coin bags\
                    multiply drop chances by [${effect_formula_chance}]\
                    ${tmp.s.layerShown ? ` and multiply coins gain by [${effect_formula_coin}]` : ''}<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    red_fabric: D(1.5).pow(x).times(10),
                    pyrite_coin: D(1.23).pow(x),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return {
                    chance_mult: D(.05).times(x).add(1),
                    coin_mult: D(1.01).pow(x),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['goblin'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 11); },
            value() {
                let value = D(10);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        33: {
            title: 'Gear Golems',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} gear golems\
                    multiply skill speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = '1.1 ^ amount',
                        cost_formula_copper = '(1.5 ^ amount) * 100',
                        cost_formula_tin = '(1.5 ^ amount) * 25',
                        cost_formula_gear = '1.23 ^ amount',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_tin += ` / ${format(D.pow(upgradeEffect('f', 11)['tin_ingot'], -1))}`;
                        cost_formula_copper += ` / ${format(D.pow(upgradeEffect('f', 11)['copper_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                        `[${cost_formula_tin}] ${tmp.lo.items.tin_ore.name}`,
                        `[${cost_formula_gear}] ${tmp.lo.items.rusty_gear.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_copper}] ${tmp.lo.items.copper_ingot.name}`;
                        cost_list[1] = `[${cost_formula_tin}] ${tmp.lo.items.tin_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)} gear golems\
                    multiply skill speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    copper_ore: D(1.5).pow(x).times(100),
                    tin_ore: D(1.5).pow(x).times(25),
                    rusty_gear: D(1.23).pow(x),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['copper_ingot'] = cost['copper_ore'].times(upgradeEffect('f', 11)['copper_ingot']);
                    delete cost['copper_ore'];
                    cost['tin_ingot'] = cost['tin_ore'].times(upgradeEffect('f', 11)['tin_ingot']);
                    delete cost['tin_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(1.1).pow(x);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['goblin'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 11); },
            value() {
                let value = D(10);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // zombie
        41: {
            title: 'Rotten Bag',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '',
                        /** @type {{chance_mult: Decimal,}} */
                        effect = buyableEffect(this.layer, this.id);

                    return `Your ${formatWhole(amount)} rotten bags\
                    multiply drop chances by ${format(effect.chance_mult)}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula_rotten = '(1.75 ^ amount) * 7.5',
                        cost_formula_fabric = '(1.25 ^ amount) * 2',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_rotten}] ${tmp.lo.items.rotten_flesh.name}`,
                        `[${cost_formula_fabric}] ${tmp.lo.items.red_fabric.name}`,
                    ];

                    return `Your ${formatWhole(amount)} rotten bags\
                    multiply drop chances by [${effect_formula}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    rotten_flesh: D(1.75).pow(x).times(7.5),
                    red_fabric: D(1.25).pow(x).times(2),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return {
                    chance_mult: D(.05).times(x).add(1),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['zombie'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
            value() {
                let value = D(2);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        42: {
            title: 'Iron Battle Axe',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '',
                        /** @type {{xp_damage_mult: Decimal, tree_damage: Decimal,}} */
                        effect = buyableEffect(this.layer, this.id);

                    return `Your ${formatWhole(amount)} iron battle axes\
                    multiply enemy damage by ${format(effect.xp_damage_mult)}\
                    ${tmp.t.layerShown ? `and add ${format(effect.tree_damage)} tree damage` : ''}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_mult = '1.05 ^ amount',
                        effect_formula_damage = '5√(amount)',
                        cost_formula_iron = '(1.5 ^ amount) * 2.5',
                        cost_fprmula_goo = '(1.75 ^ amount) * 20',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_iron += ` / ${format(D.pow(upgradeEffect('f', 11)['iron_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_iron}] ${tmp.lo.items.iron_ore.name}`,
                        `[${cost_fprmula_goo}] ${tmp.lo.items.slime_goo.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_iron}] ${tmp.lo.items.iron_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)} iron battle axes\
                    multiply enemy damage by [${effect_formula_mult}]\
                    ${tmp.t.layerShown ? `and add [${effect_formula_damage}] tree damage` : ''}<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    iron_ore: D(1.5).pow(x).times(2.5),
                    slime_goo: D(1.75).pow(x).times(20),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['iron_ingot'] = cost['iron_ore'].times(upgradeEffect('f', 11)['iron_ingot']);
                    delete cost['iron_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return {
                    xp_damage_mult: D(1.05).pow(x),
                    tree_damage: D.root(x, 5),
                };
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['zombie'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
            value() {
                let value = D(13);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        43: {
            title: 'Knowledge Ball',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} knowledge balls\
                    add ${format(buyableEffect(this.layer, this.id))} skill points<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount',
                        cost_formula_core = '2 ^ amount',
                        cost_formula_gear = '1.75 ^ amount',
                        cost_formula_brain = '1.5 ^ amount',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_core}] ${tmp.lo.items.slime_core.name}`,
                        `[${cost_formula_gear}] ${tmp.lo.items.rusty_gear.name}`,
                        `[${cost_formula_brain}] ${tmp.lo.items.brain.name}`,
                    ];

                    return `Your ${formatWhole(amount)} knowledge balls\
                    add [${effect_formula}] skill points<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    slime_core: D(2).pow(x),
                    rusty_gear: D(1.75).pow(x),
                    brain: D(1.5).pow(x),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x;
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['zombie'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
            value() {
                let value = D(7);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // deep mining
        51: {
            title: 'Coal Brazier',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} coal braziers\
                    give ${format(buyableEffect(this.layer, this.id))} effective levels to ${layerColor('lo', tmp.lo.buyables[21].title)} and ${layerColor('lo', tmp.lo.buyables[22].title)}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount',
                        cost_formula_stone = '(2.5 ^ amount) * 10',
                        cost_formula_coal = '(1.5 ^ amount) * 5',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_stone += ` / ${format(D.pow(upgradeEffect('f', 11)['stone_brick'], -1))}`;
                        cost_formula_coal += ` / ${format(D.pow(upgradeEffect('f', 11)['coal'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_stone}] ${tmp.lo.items.stone.name}`,
                        `[${cost_formula_coal}] ${tmp.lo.items.coal.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_stone}] ${tmp.lo.items.stone_brick.name}`;
                    }

                    return `Your ${formatWhole(amount)} coal braziers\
                    give [${effect_formula}] effective levels to ${layerColor('lo', tmp.lo.buyables[21].title)} and ${layerColor('lo', tmp.lo.buyables[22].title)}<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    stone: D(2.5).pow(x).times(10),
                    coal: D(1.5).pow(x).times(5),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['stone_brick'] = cost['stone'].times(upgradeEffect('f', 11)['stone_brick']);
                    delete cost['stone'];
                    cost['coal'] = cost['coal'].times(upgradeEffect('f', 11)['coal']);
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x;
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.coal.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.coal.unlocked; },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        52: {
            title: 'Iron Chest',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} iron chests\
                    give ${format(buyableEffect(this.layer, this.id))} effective levels to ${layerColor('lo', tmp.lo.buyables[23].title)}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount * 2',
                        cost_formula_iron = '(1.5 ^ amount) * 20',
                        cost_formula_copper = '(1.5 ^ amount) * 50',
                        cost_formula_tin = '(1.5 ^ amount) * 25',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_iron += ` / ${format(D.pow(upgradeEffect('f', 11)['iron_ingot'], -1))}`;
                        cost_formula_copper += ` / ${format(D.pow(upgradeEffect('f', 11)['copper_ingot'], -1))}`;
                        cost_formula_tin += ` / ${format(D.pow(upgradeEffect('f', 11)['tin_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_iron}] ${tmp.lo.items.iron_ore.name}`,
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                        `[${cost_formula_tin}] ${tmp.lo.items.tin_ore.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_iron}] ${tmp.lo.items.iron_ingot.name}`;
                        cost_list[0] = `[${cost_formula_copper}] ${tmp.lo.items.copper_ingot.name}`;
                        cost_list[0] = `[${cost_formula_tin}] ${tmp.lo.items.tin_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)} iron chests\
                    give [${effect_formula}] effective levels to ${layerColor('lo', tmp.lo.buyables[23].title)}<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    iron_ore: D(1.5).pow(x).times(20),
                    copper_ore: D(1.5).pow(x).times(50),
                    tin_ore: D(1.5).pow(x).times(25),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['iron_ingot'] = cost['iron_ore'].times(upgradeEffect('f', 11)['iron_ingot']);
                    delete cost['iron_ore'];
                    cost['copper_ingot'] = cost['copper_ore'].times(upgradeEffect('f', 11)['copper_ingot']);
                    delete cost['copper_ore'];
                    cost['tin_ingot'] = cost['tin_ore'].times(upgradeEffect('f', 11)['tin_ingot']);
                    delete cost['tin_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x.times(2);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.iron_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.iron_ore.unlocked; },
            value() {
                let value = D(9);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        53: {
            title: 'Gold Pile',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                    return `Your ${formatWhole(amount)} gold piles\
                    represent ${format(buyableEffect(this.layer, this.id))} gold for ${layerColor('m', tmp.m.upgrades[53].title)}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = '2√(amount * 10)',
                        cost_formula_gold = '(amount ^ 2) * 5',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_gold += ` / ${format(D.pow(upgradeEffect('f', 11)['gold_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_gold}] ${tmp.lo.items.gold_ore.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[0] = `[${cost_formula_gold}] ${tmp.lo.items.gold_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)} gold piles\
                    represent [${effect_formula}] gold for ${layerColor('m', tmp.m.upgrades[53].title)}<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    gold_ore: D.pow(x, 2).times(5),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['gold_ingot'] = cost['gold_ore'].times(upgradeEffect('f', 11)['gold_ingot']);
                    delete cost['gold_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x.times(10).root(2);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.gold_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.gold_ore.unlocked; },
            value() {
                let value = D(15);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // tree
        61: {
            title: 'Tiny Dam',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} tiny dams\
                        add ${format(buyableEffect(this.layer, this.id).soaked)} size and health to driftwood<br><br>\
                        ${value}\
                        Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_soaked = '1.2 ^ amount',
                        cost_formula_soaked = '(1.5 ^ amount) * 10',
                        cost_formula_normal = '(1.125 ^ amount) * 20',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_soaked}] ${tmp.lo.items.soaked_log.name}`,
                        `[${cost_formula_normal}] ${tmp.lo.items.normal_log.name}`,
                    ];

                    return `Your ${formatWhole(amount)} tiny dams\
                    add [${effect_formula_soaked}] size and health to driftwood<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    soaked_log: D(1.5).pow(x).times(10),
                    normal_log: D(1.125).pow(x).times(20),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    soaked: D(1.2).pow(x),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.soaked_log.style['background-color'];

                return style;
            },
            unlocked() { return tmp.t.layerShown || getBuyableAmount(this.layer, this.id).gte(1); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        62: {
            title: 'Wood Box',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '',
                        /** @type {{cap: Decimal, t_hold: Decimal}} */
                        effect = buyableEffect(this.layer, this.id);

                    return `Your ${formatWhole(amount)} wood boxes\
                    multiply tree cap by ${format(effect.cap)} and keep ${formatWhole(effect.t_hold)} tree upgrades through resets<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_cap = '1.1 ^ amount',
                        effect_formula_hold = 'amount',
                        cost_formula_normal = '(1.25 ^ amount) * 10',
                        cost_formula_plank = '(1.5 ^ amount) * 20',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_normal}] ${tmp.lo.items.normal_log.name}`,
                        `[${cost_formula_plank}] ${tmp.lo.items.plank.name}`,
                    ];

                    return `Your ${formatWhole(amount)} wood boxes\
                    multiply tree cap by [${effect_formula_cap}] and keep ${effect_formula_hold} tree upgrades through resets<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    normal_log: D(1.25).pow(x).times(10),
                    plank: D(1.5).pow(x).times(20),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    cap: D(1.1).pow(x),
                    t_hold: D(x),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.normal_log.style['background-color'];

                return style;
            },
            unlocked() { return tmp.t.layerShown || getBuyableAmount(this.layer, this.id).gte(1); },
            value() {
                let value = D(5);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        63: {
            title: 'Plank Ruler',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} plank rulers\
                    increase plank gains by ${format(D.times(buyableEffect(this.layer, this.id).plank, 100))}%<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_plank = 'amount / 100',
                        cost_formula_plank = '(1.5 ^ amount) * 50',
                        cost_formula_coal = '(1.2 ^ amount) * 3',
                        cost_formula_gold = '(1.1 ^ amount) / 10',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_coal += ` / ${format(D.pow(upgradeEffect('f', 11)['coal'], -1))}`;
                        cost_formula_gold += ` / ${format(D.pow(upgradeEffect('f', 11)['gold_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_plank}] ${tmp.lo.items.plank.name}`,
                        `[${cost_formula_coal}] ${tmp.lo.items.coal.name}`,
                        `[${cost_formula_gold}] ${tmp.lo.items.gold_ore.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[2] = `[${cost_formula_gold}] ${tmp.lo.items.gold_ingot.name}`;
                    }

                    return `Your ${formatWhole(amount)} plank rulers\
                    increase plank gains by [${effect_formula_plank}]%<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    plank: D(1.5).pow(x).times(50),
                    coal: D(1.2).pow(x).times(3),
                    gold_ore: D(1.1).pow(x).div(10),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['coal'] = cost['coal'].times(upgradeEffect('f', 11)['coal']);
                    cost['gold_ingot'] = cost['gold_ore'].times(upgradeEffect('f', 11)['gold_ingot']);
                    delete cost['gold_ore'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    plank: D(.01).times(x),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.plank.style['background-color'];

                return style;
            },
            unlocked() { return tmp.t.layerShown || getBuyableAmount(this.layer, this.id).gte(1); },
            value() {
                let value = D(7);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // forge
        71: {
            title: 'Bronze Counter',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    heat_req = `<span ${D.gt(player.f.points, this.heat) ? '' : 'style="color:#CC3333;'}">Requires ${format(this.heat)} heat</span><br>`;
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} bronze counters\
                    divide level cost by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula = '(1.5 ^ amount) * 10',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.bronze_ingot.name}`,
                    ];

                    return `Your ${formatWhole(amount)} bronze counters\
                    divide level cost by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            heat: D(1000),
            cost(x) {
                const cost = {
                    bronze_ingot: D(1.5).pow(x).times(10),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return D.div(x, 20).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && D.gt(player.f.points, this.heat) && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.bronze_ingot.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.bronze_ingot.unlocked; },
            value() {
                let value = D(9);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        72: {
            title: 'Steel Minecart',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    heat_req = `<span ${D.gt(player.f.points, this.heat) ? '' : 'style="color:#CC3333;'}">Requires ${format(this.heat)} heat</span><br>`;
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} steel minecarts\
                    multiply deep mining resource weights by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula = '(2 ^ amount) * 10',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.steel_ingot.name}`,
                    ];

                    return `Your ${formatWhole(amount)} steel minecarts\
                    multiply deep mining resource weights by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            heat: D(2000),
            cost(x) {
                const cost = {
                    steel_ingot: D(2).pow(x).times(10),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return D.div(x, 20).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && D.gt(player.f.points, this.heat) && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.steel_ingot.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.steel_ingot.unlocked; },
            value() {
                let value = D(9);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        73: {
            title: 'Breeze Alloy',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    heat_req = `<span ${D.gt(player.f.points, this.heat) ? '' : 'style="color:#CC3333;'}">Requires ${format(this.heat)} heat</span><br>`;
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} breeze alloys\
                    divide smelting time by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula_bronze = '(1.75 ^ amount) * 10',
                        cost_formula_steel = '(2.25 ^ amount) * 10',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_bronze}] ${tmp.lo.items.bronze_ingot.name}`,
                        `[${cost_formula_steel}] ${tmp.lo.items.steel_ingot.name}`,
                    ];

                    return `Your ${formatWhole(amount)} breeze alloys\
                    divide smelting time by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            heat: D(1500),
            cost(x) {
                const cost = {
                    bronze_ingot: D(1.75).pow(x).times(10),
                    steel_ingot: D(2.25).pow(x).times(10),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return D.div(x, 20).add(1);
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && D.gt(player.f.points, this.heat) && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background'] = `linear-gradient(to right, ${tmp.lo.items.bronze_ingot.style['background-color']}, ${tmp.lo.items.steel_ingot.style['background-color']}) no-repeat`;

                return style;
            },
            unlocked() { return player.f.alloys; },
            value() {
                let value = D(15);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // holy water
        81: {
            title: 'Blessing of Levels',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} blessings of levels\
                    divide level costs by ${format(buyableEffect(this.layer, this.id).divide)}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_divide = 'amount / 10 + 1',
                        cost_formula_holy_water = '1.5 ^ amount',
                        cost_formula_brain = '(1.5 ^ amount) * 5',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_holy_water}] ${tmp.lo.items.holy_water.name}`,
                        `[${cost_formula_brain}] ${tmp.lo.items.brain.name}`,
                    ];

                    return `Your ${formatWhole(amount)} blessings of levels\
                    divide level costs by [${effect_formula_divide}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    holy_water: D(1.5).pow(x),
                    brain: D(1.5).pow(x).times(5),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    divide: D.div(x, 10).add(1),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background'] = `${tmp.lo.items.holy_water.style['background'].split(',')[1]}, ${tmp.l.color})`;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
            value() {
                let value = D(5);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        82: {
            title: 'Blessing of Mining',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} blessings of mining\
                    multiply ore regeneration by ${format(buyableEffect(this.layer, this.id).regen)}<br><br>\
                    ${anvil_req}\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_divide = 'amount / 10 + 1',
                        cost_formula_holy_water = '1.5 ^ amount',
                        cost_formula_stone = '(2.5 ^ amount) * 500',
                        value_formula = `amount * ${formatWhole(value)}`;

                    if (hasUpgrade('f', 11)) {
                        cost_formula_stone += ` / ${format(D.pow(upgradeEffect('f', 11)['stone_brick'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_holy_water}] ${tmp.lo.items.holy_water.name}`,
                        `[${cost_formula_stone}] ${tmp.lo.items.stone.name}`,
                    ];

                    if (hasUpgrade('f', 11)) {
                        cost_list[1] = `[${cost_formula_stone}] ${tmp.lo.items.stone_brick.name}`;
                    }

                    return `Your ${formatWhole(amount)} blessings of mining\
                    multiply ore regeneration by [${effect_formula_divide}]<br><br>\
                    ${anvil_req}\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    holy_water: D(1.5).pow(x),
                    stone: D(2.5).pow(x).times(500),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                if (hasUpgrade('f', 11)) {
                    cost['stone_brick'] = cost['stone'].times(upgradeEffect('f', 11)['stone_brick']);
                    delete cost['stone'];
                }

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    regen: D.div(x, 10).add(1),
                };
            },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background'] = `${tmp.lo.items.holy_water.style['background'].split(',')[1]}, ${tmp.m.color})`;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
            value() {
                let value = D(7);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        83: {
            title: 'Blessing of Growth',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} blessings of growth\
                    increase tree size by ${format(buyableEffect(this.layer, this.id).size)}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula_divide = 'amount',
                        cost_formula_holy_water = '1.5 ^ amount',
                        cost_formula_normal_log = '(1.5 ^ amount) * 250',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_holy_water}] ${tmp.lo.items.holy_water.name}`,
                        `[${cost_formula_normal_log}] ${tmp.lo.items.normal_log.name}`,
                    ];

                    return `Your ${formatWhole(amount)} blessings of growth\
                    increase tree size by [${effect_formula_divide}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    holy_water: D(1.5).pow(x),
                    normal_log: D(1.5).pow(x).times(250),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    size: D(x),
                };
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background'] = `${tmp.lo.items.holy_water.style['background'].split(',')[1]}, ${tmp.t.color})`;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
            value() {
                let value = D(6);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        // ent
        91: {
            title: 'Leaves Compost Bin',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} leaves compost bins\
                    multiply tree growth by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'log5(amount + 5)',
                        cost_formula_leaf = '(1.25 ^ amount) * 10',
                        cost_formula_plank = '(1.3 ^ amount) * 50',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_leaf}] ${tmp.lo.items.leaf.name}`,
                        `[${cost_formula_plank}] ${tmp.lo.items.plank.name}`,
                    ];

                    return `Your ${formatWhole(amount)} leaves compost bins\
                    multiply tree growth by [${effect_formula}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    leaf: D(1.25).pow(x).times(10),
                    plank: D(1.3).pow(x).times(50),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return D.add(x, 5).log(5);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies.ent.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        92: {
            title: 'Fake Tree',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} fake trees\
                    increase tree cap and ent health by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount * 10',
                        cost_formula_normal_log = '(1.2 ^ amount) * 150',
                        cost_formula_leaf = '(1.4 ^ amount) * 25',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_normal_log}] ${tmp.lo.items.normal_log.name}`,
                        `[${cost_formula_leaf}] ${tmp.lo.items.leaf.name}`,
                    ];

                    return `Your ${formatWhole(amount)} fake trees\
                    increase tree cap and ent health by [${effect_formula}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    normal_log: D(1.2).pow(x).times(150),
                    leaf: D(1.4).pow(x).times(25),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return D.times(x, 10);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies.ent.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
        93: {
            title: 'Planter Box',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);

                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                        value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))}<br>` : '';

                    return `Your ${formatWhole(amount)} planter boxes\
                    multiply chopping chance and item drops by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${value}\
                    Cost: ${cost}`;
                } else {
                    const value = tmp.lo.buyables[this.id].value;
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula_seed = '(1.25 ^ amount) * 3',
                        cost_formula_plank = '(1.5 ^ amount) * 100',
                        value_formula = `amount * ${formatWhole(value)}`;

                    const cost_list = [
                        `[${cost_formula_seed}] ${tmp.lo.items.seed.name}`,
                        `[${cost_formula_plank}] ${tmp.lo.items.plank.name}`,
                    ];

                    return `Your ${formatWhole(amount)} planter boxes\
                    multiply chopping chance and item drops by [${effect_formula}]<br><br>\
                    ${tmp.s.layerShown ? `Value: [${value_formula}]<br>` : ''}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    seed: D(1.25).pow(x).times(3),
                    plank: D(1.5).pow(x).times(100),
                };

                if (hasUpgrade('s', 13)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 13));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return D.div(x, 20).add(1);
            },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, D.times(amount, tmp.lo.items['*'].craft_consumption)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies.ent.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 31)));

                return value;
            },
        },
    },
    grid: {
        rows: 9,
        cols: 6,
        getStartData(_) { return {}; },
        getStyle(_, id) {
            const item_id = layers.lo.items["*"].grid_to_item(id);
            if (!item_id) return { 'display': 'none', };

            const item = tmp.lo.items[item_id];
            if (!(item.unlocked ?? true)) return { 'display': 'none', };

            return Object.assign(
                {
                    'background-repeat': 'no-repeat',
                    'background-position': 'center',
                    'background-size': 'contain',
                    'color': 'black',
                },
                item.style,
            );
        },
        getTitle(_, id) {
            const item_id = layers.lo.items["*"].grid_to_item(id);
            if (!item_id) return;

            /** @type {typeof tmp.lo.items[string]} */
            const item = tmp.lo.items[item_id];

            return item.name.replaceAll(/^.| ./g, s => s.toUpperCase());
        },
        getDisplay(_, id) {
            const item_id = layers.lo.items["*"].grid_to_item(id);
            if (!item_id) return;

            return `${format(player.lo.items[item_id].amount)}`;
        },
        getTooltip(_, id) {
            const star = layers.lo.items['*'],
                item_id = star.grid_to_item(id);
            if (!item_id) return;

            const item = tmp.lo.items[item_id],
                /** @type {string[]} */
                lines = [];
            let sources = item.sources ?? {};

            if (inChallenge('b', 52) || hasChallenge('b', 52)) sources = layers.cas.items.sources(item_id);

            if ('chances' in sources && sources.chances) {
                lines.push(
                    ...Object.entries(sources.chances)
                        .filter(([type]) => star.can_drop(type))
                        .map(([type, chance]) => `${capitalize(star.type_name(type))}: ${star.format_chance(chance.times(tmp.lo.items["*"].global_chance_multiplier))}`),
                );
            }
            if ('weights' in sources && sources.weights) {
                lines.push(
                    ...Object.entries(sources.weights)
                        .filter(([type]) => star.can_drop(type))
                        .map(([type, weight]) => `${capitalize(star.type_name(type))}: ${star.format_chance(weight.div(tmp.lo.items["*"].weight[type]))} (in group)`),
                );
            }
            if ('per_second' in sources && sources.per_second) {
                lines.push(
                    ...Object.entries(sources.per_second)
                        .filter(([type]) => star.can_drop(type))
                        .map(([type, amount]) => `${capitalize(star.type_name(type))}: ${format(amount)}/s`),
                );
            }
            if ('other' in sources && sources.other) {
                lines.push(
                    ...sources.other.map(type => capitalize(star.type_name(type))),
                );
            }

            if (!lines.length) lines.push('No sources');
            return lines.join('<hr>');
        },
    },
    /** @type {typeof layers.lo.items} */
    items: {
        '*': {
            global_chance_multiplier() {
                let mult = D.dOne;

                mult = mult.times(buyableEffect('lo', 12).chance_mult);
                mult = mult.times(buyableEffect('lo', 23).chance_mult);
                mult = mult.times(buyableEffect('lo', 32).chance_mult);
                mult = mult.times(buyableEffect('lo', 41).chance_mult);
                mult = mult.times(buyableEffect('lo', 93));

                if (hasUpgrade('m', 53)) mult = mult.times(upgradeEffect('m', 53));

                return mult;
            },
            grid_to_item(id) {
                if (!id) return false;

                const cache = layers.lo.items["*"].grid_to_item.cache ??= {};
                if (!(id in cache)) {
                    const item = Object.keys(tmp.lo.items).filter(item => item != '*').find(item => tmp.lo.items[item].grid == id) ?? false;
                    cache[id] = item;
                }
                return cache[id];
            },
            get_drops(type = player.xp.type, chance_multiplier = D.dOne) {
                if (!this.can_drop(type) || D.lte(chance_multiplier, 0)) return [];

                const items = (inChallenge('b', 52) || hasChallenge('b', 52)) ? layers.cas.items.items(type) : this.items(type),
                    /** @type {{[item_id: string]: Decimal}} */
                    results = {},
                    /** @type {[string, Decimal][]} */
                    to_roll = [],
                    /** @type {(item_id: string, amount: DecimalSource) => Decimal} */
                    add_to_results = (item_id, amount) => results[item_id] = D.add(results[item_id] ?? 0, amount);

                Object.entries(items.chances ?? {}).forEach(([item_id, chance]) => {
                    const rchance = chance.times(chance_multiplier).times(tmp.lo.items['*'].global_chance_multiplier);
                    if (rchance.gte(1) || options.noRNG) {
                        add_to_results(item_id, rchance);
                    } else {
                        to_roll.push([item_id, rchance]);
                    }
                });

                if (to_roll.length > 7) {
                    to_roll.forEach(([item_id, chance]) => add_to_results(item_id, chance));
                } else {
                    let rng = Math.random(),
                        i = 0;
                    for (; i < 2 ** to_roll.length && rng > 0; i++) {
                        const bin = i.toString(2).padStart(to_roll.length, '0').split(''),
                            chance = to_roll.map(([, chance], i) => {
                                if (bin[i] == '1') return chance;
                                else return D.dOne.minus(chance);
                            }).reduce(D.times, D.dOne);
                        rng -= chance.toNumber();
                    }
                    if (rng <= 0 && i > 0) i--;
                    const bin = i.toString(2).padStart(to_roll.length, '0').split('');
                    to_roll.forEach(([item], i) => {
                        if (bin[i] == '1') add_to_results(item, 1);
                    });
                }

                if (Object.keys(items.weights ?? {}).length > 0) {
                    const entries = Object.entries(items.weights),
                        total = entries.reduce((sum, [, weight]) => D.add(sum, weight), D.dZero);

                    if (entries.length == 1) {
                        add_to_results(entries[0][0], 1);
                    } else if (D.gt(chance_multiplier, 10) || options.noRNG) {
                        entries.forEach(([item_id, weight]) => {
                            const amount = weight.div(total).times(chance_multiplier);

                            add_to_results(item_id, amount);
                        });
                    } else {
                        // There must be a better way to do this, but it looks like a pain to figure out
                        for (let l = D.dZero; l.lt(chance_multiplier); l = l.add(1)) {
                            let rng = D.times(Math.random(), total),
                                i = 0;
                            while (rng.gt(0)) {
                                rng = rng.minus(entries[i][1]);
                                i++;
                            }
                            if (rng.lte(0) && i > 0) i--;
                            const item = entries[i][0];
                            add_to_results(item, 1);
                        }
                    }
                }

                Object.entries(results).forEach(([item, gain]) => {
                    const upg = layers.s.investloans.item_upgrade[item] ?? false;
                    if (inChallenge('b', 12)) {
                        if (upg && hasUpgrade('s', upg)) return;
                        results[item] = gain.div(D.add(player.lo.items[item].amount, 10).log10());
                    }
                    let gain_mult = tmp.lo.items["*"].gain_multiplier;

                    if (upg && hasUpgrade('s', upg)) gain_mult = gain_mult.times(upgradeEffect('s', upg));

                    results[item] = results[item].times(gain_mult);
                });

                if (inChallenge('b', 52) || hasChallenge('b', 52)) {
                    // Roll for tokens
                    const chance = tmp.cas.token.chance.times(chance_multiplier);

                    if (chance.gte(1) || options.noRNG) {
                        addPoints('cas', chance);
                    } else if (D.gt(chance, Math.random())) {
                        addPoints('cas', 1);
                    }
                }

                return Object.entries(results);
            },
            gain_drops(drops) { drops.forEach(([item, amount]) => player.lo.items[item].amount = D.add(player.lo.items[item].amount, amount)); },
            format_chance(chance) {
                if (chance.gte(1) || options.noRNG) return `+${format(chance)}`;
                if (chance.lte(0)) return format(0);

                const fractional = options.chanceMode == 'NOT_GUARANTEED' || (options.chanceMode == 'LESS_HALF' && chance.lt(.5));

                if (fractional) {
                    return `1/${format(chance.pow(-1))}`;
                } else {
                    return `${format(chance.times(100))}%`;
                }
            },
            type_name(type) {
                /** @type {[drop_sources, string]} */
                const [from, sub] = type.split(':');
                switch (from) {
                    case 'enemy': return tmp.xp.enemies[sub].name;
                    case 'mining': return `${layers.m.ore.mode(sub)} ${tmp.m.name.toLowerCase()}`.trim();
                    case 'tree':
                        if (sub == 'convertion') return 'Convertion';
                        return `Chopping ${tmp.t.trees[sub].name}`;
                    case 'forge':
                        let text = 'Forge: ';
                        if (sub == 'fuel') text += 'fueling';
                        if (sub == 'smelt') text += 'smelting';
                        return text;
                }
            },
            can_drop(type) {
                if (tmp.l.deactivated) return false;
                /** @type {[drop_sources, string]} */
                const [from, sub] = type.split(':');

                if (from == 'enemy') return hasUpgrade('lo', 11) || hasUpgrade('s', 22) || sub == 'star';
                if (from == 'mining') return tmp.m.layerShown;
                if (from == 'tree') return tmp.t.layerShown;
                if (from == 'forge') return tmp.f.layerShown;
                return false;
            },
            amount() { return Object.values(player.lo.items).reduce((sum, { amount }) => D.add(sum, amount), D.dZero); },
            weight(type) {
                if (!type) {
                    /** @type {{ [key: string]: Decimal }} */
                    const weights = {};

                    Object.entries(tmp.lo.items)
                        .filter(([id, item]) => id != '*' && 'weights' in item.sources && item.sources.weights)
                        .forEach(/**@param {[string, typeof tmp.lo.items[string]]}*/([, item]) => {
                            if (item.sources.weights instanceof Decimal) return; // Not sure why this happens, but it breaks everything

                            Object.entries(item.sources.weights)
                                .forEach(([source, amount]) => {
                                    if (source in weights) weights[source] = weights[source].add(amount);
                                    else weights[source] = amount;
                                });
                        });

                    return weights;
                }

                return Object.entries(tmp.lo.items)
                    .filter(([k]) => k != '*')
                    .reduce((sum, [, item]) => {
                        if (!('sources' in item) || !('weights' in item.sources) || !item.sources.weights || !(type in item.sources.weights)) return sum;

                        return sum.add(item.sources.weights[type]);
                    }, D.dZero);
            },
            has_anvil() { return hasUpgrade('m', 33) || hasUpgrade('s', 22); },
            value() {
                return Object.values(tmp.lo.buyables).reduce((sum, buyable) => {
                    if (typeof buyable != 'object' || !('value' in buyable)) return sum;
                    return D.add(sum, buyable.value.times(getBuyableAmount(buyable.layer, buyable.id)));
                }, D.dZero);
            },
            gain_multiplier() {
                let mult = D.dOne;

                if (hasUpgrade('lo', 11)) mult = mult.times(upgradeEffect('lo', 11));

                if (hasUpgrade('f', 32)) mult = mult.times(upgradeEffect('f', 32));

                return mult;
            },
            craft_consumption() {
                let mult = D.dOne;

                if (hasUpgrade('t', 33)) mult = mult.times(upgradeEffect('t', 33));

                return mult;
            },
            items(type) {
                if (!type) return {};

                const items = {
                    chances: {},
                    weights: {},
                };

                Object.values(tmp.lo.items).forEach(item => {
                    if (!('sources' in item)) return;

                    if ('chances' in item.sources && type in item.sources.chances) {
                        items.chances[item.id] = item.sources.chances[type];
                    }
                    if ('weights' in item.sources && type in item.sources.weights) {
                        items.weights[item.id] = item.sources.weights[type];
                    }
                });

                return items;
            },
        },
        // Slime drops
        slime_goo: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 101,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:slime': D(1 / 3), };

                    if (hasChallenge('b', 31)) chances['enemy:slime'] = chances['enemy:slime'].times(2);

                    if (hasUpgrade('xp', 43)) chances['enemy:goblin'] = chances['enemy:slime'].times(upgradeEffect('xp', 43).chance_mult);

                    return chances;
                },
            },
            name: 'slime goo',
            style: {
                'background-image': `url('./resources/images/spill.svg')`,
                'background-color'() { return tmp.xp.enemies['slime'].color; },
            },
        },
        slime_core_shard: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 102,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:slime': D(1 / 16), };

                    if (hasChallenge('b', 31)) chances['enemy:slime'] = chances['enemy:slime'].times(2);

                    if (hasUpgrade('xp', 43)) chances['enemy:goblin'] = chances['enemy:slime'].times(upgradeEffect('xp', 43).chance_mult);

                    return chances;
                },
            },
            name: 'slime core shard',
            style: {
                'background-image': `url('./resources/images/slime_core_shard.svg')`,
                'background-color'() { return tmp.xp.enemies['slime'].color; },
            },
        },
        slime_core: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 103,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:slime': D(1 / 125), };

                    if (hasChallenge('b', 31)) chances['enemy:slime'] = chances['enemy:slime'].times(2);

                    if (hasUpgrade('xp', 43)) chances['enemy:goblin'] = chances['enemy:slime'].times(upgradeEffect('xp', 43).chance_mult);

                    return chances;
                },
            },
            name: 'slime core',
            style: {
                'background-image': `url('./resources/images/slime_core.svg')`,
                'background-color'() { return tmp.xp.enemies['slime'].color; },
            },
        },
        // Goblin drops
        red_fabric: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 201,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:goblin': D(1 / 4), };

                    if (hasChallenge('b', 32)) chances['enemy:goblin'] = chances['enemy:goblin'].times(2);

                    return chances;
                },
            },
            name: 'red fabric',
            style: {
                'background-image': `url('./resources/images/rolled-cloth.svg')`,
                'background-color': () => tmp.xp.enemies['goblin'].color,
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        pyrite_coin: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 202,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:goblin': D(1 / 25), };

                    if (hasChallenge('b', 32)) chances['enemy:goblin'] = chances['enemy:goblin'].times(2);

                    return chances;
                },
            },
            name: 'pyrite coin',
            style: {
                'background-image': `url('./resources/images/token.svg')`,
                'background-color': () => tmp.xp.enemies['goblin'].color,
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        rusty_gear: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 203,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:goblin': D(1 / 216), };

                    if (hasChallenge('b', 32)) chances['enemy:goblin'] = chances['enemy:goblin'].times(2);

                    return chances;
                },
            },
            name: 'rusty gear',
            style: {
                'background-image': `url('./resources/images/cog.svg')`,
                'background-color': () => tmp.xp.enemies['goblin'].color,
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        // Zombie drops
        rotten_flesh: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 301,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:zombie': D(1 / 5), };

                    if (hasChallenge('b', 41)) chances['enemy:zombie'] = D.times(chances['enemy:zombie'], 2);

                    return chances;
                },
            },
            name: 'rotten flesh',
            style: {
                'background-image': `url('./resources/images/fleshy-mass.svg')`,
                'background-color': () => tmp.xp.enemies['zombie'].color,
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        brain: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 302,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:zombie': D(1 / 343), };

                    if (hasChallenge('b', 41)) chances['enemy:zombie'] = D.times(chances['enemy:zombie'], 2);

                    return chances;
                },
            },
            name: 'brain',
            style: {
                'background-image': `url('./resources/images/brain.svg')`,
                'background-color': () => tmp.xp.enemies['zombie'].color,
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        // Ent drops
        leaf: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 401,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:ent': D(1 / 6), };

                    if (hasChallenge('b', 42)) chances['enemy:ent'] = chances['enemy:ent'].times(2);

                    return chances;
                },
            },
            name: 'leaf',
            style: {
                'background-image': `url('./resources/images/falling-leaf.svg')`,
                'background-color': () => tmp.xp.enemies['ent'].color,
            },
            unlocked() { return hasChallenge('b', 21); },
        },
        seed: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 402,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:ent': D(1 / 512), };

                    if (hasChallenge('b', 42)) chances['enemy:ent'] = chances['enemy:ent'].times(2);

                    return chances;
                },
            },
            name: 'seed',
            style: {
                'background-image': `url('./resources/images/sesame.svg')`,
                'background-color': () => tmp.xp.enemies['ent'].color,
            },
            unlocked() { return hasChallenge('b', 21); },
        },
        // Star drops
        stardust: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 902,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (hasChallenge('b', 22)) return ['enemy:star']; },
            },
            name: 'Stardust',
            style: {
                'background-image': `url('./resources/images/powder.svg')`,
                'background-color'() { return tmp.xp.enemies.star.color; },
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        // Mining
        stone: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 501,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                weights() {
                    if (hasUpgrade('m', 32)) return {};

                    let shallow = D(9);

                    const weights = { 'mining:shallow': shallow, };

                    if (hasUpgrade('m', 52)) {
                        let deep = D(216);

                        weights['mining:deep'] = deep;
                    }

                    return weights;
                },
                other() {
                    const sources = [];

                    if (hasUpgrade('m', 32)) sources.push('mining:shallow');
                    if (hasUpgrade('m', 52)) sources.push('mining:deep');

                    return sources;
                },
            },
            name: 'stone',
            style: {
                'background-image': `url('./resources/images/stone-block.svg')`,
                'background-color': '#BBBBBB',
            },
            unlocked() { return tmp.m.layerShown; },
        },
        copper_ore: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 502,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                weights() {
                    let shallow = D(4);

                    if (hasUpgrade('m', 13)) shallow = shallow.times(upgradeEffect('m', 13).ore_chance);

                    const weights = { 'mining:shallow': shallow, };

                    if (hasUpgrade('m', 52)) {
                        let deep = D(125);

                        if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                        weights['mining:deep'] = deep;
                    }

                    return weights;
                },
            },
            name: 'copper ore',
            style: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#BB7733',
            },
            unlocked() { return tmp.m.layerShown; },
        },
        tin_ore: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 503,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                weights() {
                    let shallow = D(1);

                    if (hasUpgrade('m', 13)) shallow = shallow.times(upgradeEffect('m', 13).ore_chance);

                    const weights = { 'mining:shallow': shallow, };

                    if (hasUpgrade('m', 52)) {
                        let deep = D(64);

                        if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                        weights['mining:deep'] = deep;
                    }

                    return weights;
                },
            },
            name: 'tin ore',
            style: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#CCBB88',
            },
            unlocked() { return tmp.m.layerShown; },
        },
        coal: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 504,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                weights() {
                    if (!hasUpgrade('m', 52)) return {};

                    let deep = D(27);

                    if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                    deep = deep.times(buyableEffect('lo', 72));

                    return { 'mining:deep': deep, };
                },
                per_second() {
                    const per_second = {};

                    if (tmp.f.layerShown) {
                        const forge_consume = layers.f.fuels['*'].consuming(this.id);

                        if (forge_consume.gt(0)) {
                            per_second['forge:fuel'] = forge_consume.neg();
                        }
                    }

                    return per_second;
                },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'coal',
            style: {
                'background-image': `url('./resources/images/rock.svg')`,
                'background-color': '#444444',
                'color': '#888888',
            },
            unlocked() { return player.m.show_deep; },
        },
        iron_ore: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 505,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'enemy:zombie': D(1 / 36), };

                    if (hasChallenge('b', 41)) chances['enemy:zombie'] = D.times(chances['enemy:zombie'], 2);

                    return chances;
                },
                weights() {
                    if (!hasUpgrade('m', 52)) return {};

                    let deep = D(8);

                    if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                    deep = deep.times(buyableEffect('lo', 72));

                    return { 'mining:deep': deep, };
                },
            },
            name: 'iron ore',
            style: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#888888',
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        gold_ore: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 506,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                weights() {
                    if (!hasUpgrade('m', 52)) return {};

                    let deep = D(1);

                    if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                    deep = deep.times(buyableEffect('lo', 72));

                    return { 'mining:deep': deep, };
                },
            },
            name: 'gold ore',
            style: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': 'gold',
            },
            unlocked() { return player.m.show_deep; },
        },
        // Forge
        stone_brick: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 601,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'stone brick',
            style: {
                'background-image': `url('./resources/images/clay-brick.svg')`,
                'background-color': '#BBBBBB',
            },
            unlocked() { return tmp.f.layerShown; },
        },
        copper_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 602,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'copper ingot',
            style: {
                'background-image': `url('./resources/images/metal-bar.svg')`,
                'background-color': '#BB7733',
            },
            unlocked() { return tmp.f.layerShown; },
        },
        tin_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 603,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'tin ingot',
            style: {
                'background-image': `url('./resources/images/metal-bar.svg')`,
                'background-color': '#CCBB88',
            },
            unlocked() { return tmp.f.layerShown; },
        },
        iron_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 604,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'iron ingot',
            style: {
                'background-image': `url('./resources/images/metal-bar.svg')`,
                'background-color': '#888888',
            },
            unlocked() { return tmp.f.layerShown; },
        },
        gold_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 605,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'gold ingot',
            style: {
                'background-image': `url('./resources/images/metal-bar.svg')`,
                'background-color': 'gold',
            },
            unlocked() { return tmp.f.layerShown; },
        },
        // Forge alloys
        bronze_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 701,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.alloys) return ['forge:smelt']; },
            },
            name: 'bronze ingot',
            style: {
                'background-image': `url('./resources/images/metal-bar.svg')`,
                'background-color': '#BB8844',
            },
            unlocked() { return player.f.alloys; },
        },
        steel_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 702,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.alloys) return ['forge:smelt']; },
            },
            name: 'steel ingot',
            style: {
                'background-image': `url('./resources/images/metal-bar.svg')`,
                'background-color': '#777777',
            },
            unlocked() { return player.f.alloys; },
        },
        // Trees
        soaked_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 801,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = { 'tree:driftwood': D(1), };

                    return chances;
                },
                per_second() {
                    const per_second = {};

                    const tree_consume = layers.t.convertion.per_second(this.id);

                    if (tree_consume.neq(0)) per_second['tree:convertion'] = tree_consume;

                    if (tmp.f.layerShown) {
                        const forge_consume = layers.f.fuels['*'].consuming(this.id);

                        if (forge_consume.gt(0)) {
                            per_second['forge:fuel'] = forge_consume.neg();
                        }
                    }

                    return per_second;
                },
            },
            name: 'soaked log',
            style: {
                'background-image': `url('./resources/images/log.svg')`,
                'background-color': '#AA2222',
            },
            unlocked() { return tmp.t.layerShown ?? true; },
        },
        normal_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 802,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                chances() {
                    const chances = {
                        'tree:oak': D(1),
                        'tree:birch': D(1),
                    };

                    if (hasChallenge('b', 21)) {
                        chances['enemy:ent'] = D(1 / 49);

                        if (hasChallenge('b', 42)) chances['enemy:ent'] = chances['enemy:ent'].times(2);
                    }
                    if (hasChallenge('b', 42)) {
                        chances['tree:baobab'] = D(1);
                    }

                    return chances;
                },
                per_second() {
                    const per_second = {};

                    const tree_consume = layers.t.convertion.per_second(this.id);

                    if (tree_consume.neq(0)) per_second['tree:convertion'] = tree_consume;

                    if (tmp.f.layerShown) {
                        const forge_consume = layers.f.fuels['*'].consuming(this.id);

                        if (forge_consume.gt(0)) {
                            per_second['forge:fuel'] = forge_consume.neg();
                        }
                    }

                    return per_second;
                },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'normal log',
            style: {
                'background-image': `url('./resources/images/log.svg')`,
                'background-color': '#AA7755',
            },
            unlocked() { return tmp.t.layerShown ?? true; },
        },
        plank: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 803,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                per_second() {
                    const per_second = {};

                    const tree_consume = layers.t.convertion.per_second(this.id);

                    if (tree_consume.neq(0)) per_second['tree:convertion'] = tree_consume;

                    if (tmp.f.layerShown) {
                        const forge_consume = layers.f.fuels['*'].consuming(this.id);

                        if (forge_consume.gt(0)) {
                            per_second['forge:fuel'] = forge_consume.neg();
                        }
                    }

                    return per_second;
                },
            },
            name: 'plank',
            style: {
                'background-image': `url('./resources/images/planks.svg')`,
                'background-color': '#997744',
            },
            unlocked() { return tmp.t.layerShown; },
        },
        // Special
        holy_water: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 901,
            sources: {
                _id: null,
                get id() { return this._id ??= Object.values(layers.lo.items).find(item => item.sources == this)?.id; },
                other() { if (player.f.unlocked) return ['forge:smelt']; },
            },
            name: 'holy water',
            style: {
                'background': `url('./resources/images/round-bottom-flask.svg'), radial-gradient(#88CCFF, #EEDD88)`,
            },
            unlocked() { return inChallenge('b', 21) || hasChallenge('b', 21); },
        },
    },
    // type none does not allow layerReset
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    branches: ['xp'],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['shown'],
            stardust = D(player.lo.items.stardust.amount);

        layerDataReset(this.layer, keep);

        player.lo.items.stardust.amount = stardust;
    },
});
