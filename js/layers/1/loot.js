'use strict';

//todo Tree items and buyables (6X)
//todo Forge items and buyables (7X)
addLayer('lo', {
    name: 'Loot',
    image: './resources/images/swap-bag.svg',
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
                    const speed = layers.clo.time_speed('lo');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['upgrades', [1]],
                ['buyables', [1, 2, 3, 4, 5, 6]],
            ],
        },
        'Inventory': {
            content: [
                () => {
                    const mult = tmp.lo.items["*"].gain_multiplier;

                    if (mult.neq(1)) return [
                        'column', [
                            ['display-text', `Item gain multiplier: *${format(mult)}`],
                            'blank',
                        ],
                    ];
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
                if (!hasUpgrade('s', 72)) return 'Start getting items from your kills';

                return 'Double items gain';
            },
            effect() {
                if (!hasUpgrade('s', 72)) return D.dOne;

                return D.dTwo;
            },
            effectDisplay() {
                if (!hasUpgrade('s', 72)) return '';

                return `${format(this.effect())}`;
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
                Object.entries(player.xp.kills)
                    .forEach(([type, kills]) => {
                        if (to_lose.lte(0) || kills.lte(0)) return;
                        const lose = kills.min(to_lose);
                        player.xp.kills[type] = kills.minus(lose);
                        to_lose = to_lose.minus(lose);
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
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} books of slimes\
                multiply experience gain by ${format(buyableEffect(this.layer, this.id))} (^1.1 for slimes)<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    slime_goo: D(1.5).pow(x).times(10),
                    slime_core_shard: D(1.1).pow(x),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(1.25).pow(x);
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
            value() {
                let value = D.dOne;

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        12: {
            title: 'Storage Slime',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    /** @type {{xp_hold: Decimal, chance_mult: Decimal}} */
                    effect = buyableEffect(this.layer, this.id),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} storage slimes\
                hold ${formatWhole(effect.xp_hold)} experience upgrades\
                and multiply drop chances by ${format(effect.chance_mult)}<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    slime_goo: D(1.25).pow(x).times(10),
                    slime_core_shard: D(6 / 5).pow(x).times(3),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    xp_hold: x,
                    chance_mult: D(.05).times(x).add(1),
                };
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
            value() {
                let value = D(5);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        13: {
            title: 'Sticky Trap',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} sticky traps\
                divide enemy health by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    slime_goo: D(1.5).pow(x).times(30),
                    slime_core: D(1.1).pow(x),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(1.1).pow(x);
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
            value() {
                let value = D(3);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        // mining
        21: {
            title: 'Stone Furnace',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {Decimal} */
                    bonus = this.bonusAmount(),
                    amount_bonus = bonus.gt(0) ? `+${format(bonus)}` : '',
                    /** @type {{[item: string]: Decimal}} */
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)}${amount_bonus} stone furnace\
                multiply ore health by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    stone: D(1.5).pow(x).times(10),
                    copper_ore: D(1.25).pow(x).times(5),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                let mult = D(1.125).pow(x);

                if (hasUpgrade('m', 61)) mult = mult.pow(upgradeEffect('m', 61));

                return mult;
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
            unlocked() { return tmp.lo.items['*'].has_anvil || getBuyableAmount(this.layer, this.id).gte(1) || hasChallenge('b', 11); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

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
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {Decimal} */
                    bonus = this.bonusAmount(),
                    amount_bonus = bonus.gt(0) ? `+${format(bonus)}` : '',
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)}${amount_bonus} copper golems\
                multiply mining chance by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    copper_ore: D(1.3).pow(x).times(25),
                    slime_core: D(1.125).pow(x).times(5),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D.div(x, 6).add(1);
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

                if (this.canAfford()) style['background-color'] = tmp.lo.items.copper_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items['*'].has_anvil || getBuyableAmount(this.layer, this.id).gte(1) || hasChallenge('b', 11); },
            value() {
                let value = D(7);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

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
                    bonus = this.bonusAmount(),
                    amount_bonus = bonus.gt(0) ? `+${format(bonus)}` : '',
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    /** @type {{m_hold: Decimal, chance_mult: Decimal}} */
                    effect = buyableEffect(this.layer, this.id),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)}${amount_bonus} tin chests\
                multiply drop and mining chance by ${format(effect.chance_mult)} and keep ${formatWhole(effect.m_hold)} mining upgrades through resets<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    tin_ore: D(1.25).pow(x).times(2),
                    copper_ore: D(1.125).pow(x).times(50),
                    slime_goo: D(1.5).pow(x).times(20)
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return {
                    m_hold: x,
                    chance_mult: D(.05).times(x).add(1)
                };
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

                if (this.canAfford()) style['background-color'] = tmp.lo.items.tin_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items['*'].has_anvil || getBuyableAmount(this.layer, this.id).gte(1) || hasChallenge('b', 11); },
            value() {
                let value = D(5);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

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
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} red slimes\
                multiply damage by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    red_fabric: D(1.25).pow(x).times(10),
                    slime_goo: D(1.5).pow(x).times(25),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(.05).times(x).add(1);
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
            unlocked() { return hasChallenge('b', 11); },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        32: {
            title: 'Coin Bag',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    /** @type {{chance_mult: Decimal, coin_mult: Decimal}} */
                    effect = buyableEffect(this.layer, this.id),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '',
                    coin_mult = tmp.s.layerShown ? ` and multiply coins gain by ${format(effect.coin_mult)}` : '';

                return `Your ${formatWhole(amount)} coin bags\
                multiply drop chances by ${format(effect.chance_mult)}${coin_mult}<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    red_fabric: D(1.5).pow(x).times(10),
                    pyrite_coin: D(1.23).pow(x),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
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
            unlocked() { return hasChallenge('b', 11); },
            value() {
                let value = D(10);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        33: {
            title: 'Gear Golems',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} gear golems\
                multiply skill speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    copper_ore: D(1.5).pow(x).times(100),
                    tin_ore: D(1.5).pow(x).times(25),
                    rusty_gear: D(1.23).pow(x),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;
                return D(1.1).pow(x);
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

                if (this.canAfford()) style['background-color'] = layers.xp.enemy.color('goblin');

                return style;
            },
            unlocked() { return hasChallenge('b', 11); },
            value() {
                let value = D(10);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        // zombie
        41: {
            title: 'Rotten Bag',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '',
                    /** @type {{chance_mult: Decimal,}} */
                    effect = buyableEffect(this.layer, this.id);

                return `Your ${formatWhole(amount)} rotten bags\
                multiply drop chances by ${format(effect.chance_mult)}<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    rotten_flesh: D(1.75).pow(x).times(7.5),
                    red_fabric: D(1.25).pow(x).times(2),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
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
            unlocked() { return hasChallenge('b', 12); },
            value() {
                let value = D(2);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        42: {
            title: 'Iron Battle Axe',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '',
                    /** @type {{xp_damage_mult: Decimal, tree_damage: Decimal,}} */
                    effect = buyableEffect(this.layer, this.id);

                return `Your ${formatWhole(amount)} iron battle axes\
                multiply enemy damage by ${format(effect.xp_damage_mult)}\
                ${tmp.t.layerShown ? `and add ${format(effect.tree_damage)} tree damage` : ''}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    iron_ore: D(1.5).pow(x).times(2.5),
                    slime_goo: D(1.75).pow(x).times(20),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

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
            unlocked() { return hasChallenge('b', 12); },
            value() {
                let value = D(13);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        43: {
            title: 'Knowledge Ball',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const amount = getBuyableAmount(this.layer, this.id),
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} knowledge balls\
                add ${format(buyableEffect(this.layer, this.id))} skill points<br><br>\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    slime_core: D(2).pow(x),
                    rusty_gear: D(1.75).pow(x),
                    brain: D(1.5).pow(x),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x;
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
            unlocked() { return hasChallenge('b', 12); },
            value() {
                let value = D(7);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        // deep mining
        51: {
            title: 'Coal Brazier',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {{[item: string]: Decimal}} */
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} coal braziers\
                give ${format(buyableEffect(this.layer, this.id))} effective levels to ${layerColor('lo', tmp.lo.buyables[21].title)} and ${layerColor('lo', tmp.lo.buyables[22].title)}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    stone: D(2.5).pow(x).times(10),
                    coal: D(1.5).pow(x).times(5),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x;
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

                if (this.canAfford()) style['background-color'] = tmp.lo.items.coal.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.coal.unlocked; },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        52: {
            title: 'Iron Chest',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {{[item: string]: Decimal}} */
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} iron chests\
                give ${format(buyableEffect(this.layer, this.id))} effective levels to ${layerColor('lo', tmp.lo.buyables[23].title)}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    iron_ore: D(1.5).pow(x).times(20),
                    copper_ore: D(1.5).pow(x).times(50),
                    tin_ore: D(1.5).pow(x).times(25),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x.times(2);
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

                if (this.canAfford()) style['background-color'] = tmp.lo.items.coal.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.iron_ore.unlocked; },
            value() {
                let value = D(9);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
        53: {
            title: 'Gold Pile',
            display() {
                const amount = getBuyableAmount(this.layer, this.id),
                    /** @type {{[item: string]: Decimal}} */
                    cost_obj = this.cost(amount),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    value = tmp.s.layerShown ? `Value: ${format(D.times(amount, tmp.lo.buyables[this.id].value))} (+${format(tmp.lo.buyables[this.id].value)})<br>` : '';

                return `Your ${formatWhole(amount)} gold piles\
                represent ${format(buyableEffect(this.layer, this.id))} gold for ${layerColor('m', tmp.m.upgrades[53].title)}<br><br>\
                ${anvil_req}\
                ${value}\
                Cost: ${cost}`;
            },
            cost(x) {
                const cost = {
                    gold_ore: D.pow(x, 2).times(5),
                };

                if (hasUpgrade('s', 63)) Object.entries(cost).forEach(([item, amount]) => {
                    cost[item] = amount.times(upgradeEffect('s', 63));
                });

                return cost;
            },
            effect(x) {
                if (tmp.l.deactivated) x = D.dZero;

                return x.times(10).root(2);
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

                if (this.canAfford()) style['background-color'] = tmp.lo.items.gold_ore.style['background-color'];

                return style;
            },
            unlocked() { return tmp.lo.items.gold_ore.unlocked; },
            value() {
                let value = D(15);

                if (hasUpgrade('s', 81)) value = value.add(getBuyableAmount(this.layer, this.id).times(upgradeEffect('s', 81)));

                return value;
            },
        },
    },
    grid: {
        rows: 6,
        cols: 6,
        getStartData(_) { return {}; },
        getStyle(_, id) {
            const item_id = layers.lo.items["*"].grid_to_item(id);
            if (!item_id) return { 'display': 'none', };

            const item = tmp.lo.items[item_id];
            if (!(item.unlocked ?? true)) return { 'display': 'none', };

            const row = Math.floor(id / 100),
                row_style = {
                    1: {
                        'background-color': layers.xp.enemy.color('slime'),
                    },
                    2: {
                        'background-color': layers.xp.enemy.color('goblin'),
                    },
                    3: {
                        'background-color': layers.xp.enemy.color('zombie'),
                    },
                }[row] ?? {};

            return Object.assign(
                { 'background-repeat': 'no-repeat', 'background-position': 'center', 'background-size': 'contain', },
                row_style,
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

            if ('chances' in item && item.chances) {
                lines.push(
                    ...Object.entries(item.chances)
                        .filter(([type]) => star.can_drop(type))
                        .map(([type, chance]) => `${capitalize(star.type_name(type))}: ${star.format_chance(chance.times(tmp.lo.items["*"].global_chance_multiplier))}`),
                );
            }
            if ('weights' in item && item.weights) {
                lines.push(
                    ...Object.entries(item.weights)
                        .filter(([type]) => star.can_drop(type))
                        .map(([type, weight]) => `${capitalize(star.type_name(type))}: ${star.format_chance(weight.div(tmp.lo.items["*"].weight[type]))} (in group)`),
                );
            }
            if ('per_second' in item && item.per_second) {
                lines.push(
                    ...Object.entries(item.per_second)
                        .filter(([type]) => star.can_drop(type))
                        .map(([type, amount]) => `${capitalize(star.type_name(type))}: ${format(amount)}/s`),
                );
            }
            if ('other_sources' in item && item.other_sources) {
                lines.push(
                    ...item.other_sources.map(type => capitalize(star.type_name(type))),
                );
            }

            if (!lines.length) lines.push('No sources');
            return lines.join('<br>');
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
                if (!this.can_drop(type) || chance_multiplier.lte(0)) return [];

                /** @type {{[item: string]: Decimal}} */
                const results = {},
                    /** @type {typeof tmp.lo.items[string][]} */
                    chance_items = Object.values(tmp.lo.items)
                        .filter((item) => 'chances' in item && type in item.chances),
                    /** @type {typeof tmp.lo.items[string][]} */
                    weight_items = Object.values(tmp.lo.items)
                        .filter((item) => 'weights' in item && type in item.weights),
                    /** @type {typeof chance_items} */
                    rolled = [],
                    /** @type {(item: string, amount: Decimal) => void} */
                    add_to_results = (item, amount) => {
                        if (item in results) {
                            results[item] = results[item].add(amount);
                        } else {
                            results[item] = amount;
                        }
                    };

                chance_items.forEach(item => {
                    const { id } = item,
                        chance = item.chances[type].times(chance_multiplier).times(tmp.lo.items["*"].global_chance_multiplier);
                    if (chance.gte(1)) {
                        add_to_results(id, chance);
                    } else {
                        rolled.push(item);
                    }
                });

                if (rolled.length > 7 || options.noRNG) {
                    // Limit to a theorical maximum of 128 loops
                    rolled.forEach(item => {
                        add_to_results(item.id, item.chances[type].times(chance_multiplier).times(tmp.lo.items["*"].global_chance_multiplier));
                    });
                } else {
                    let rng = Math.random(),
                        i = 0;
                    for (; i < 2 ** rolled.length && rng > 0; i++) {
                        const bin = i.toString(2).padStart(rolled.length, '0').split(''),
                            chance = rolled.map((item, i) => {
                                const chance = item.chances[type].times(chance_multiplier).times(tmp.lo.items["*"].global_chance_multiplier);
                                if (bin[i] == '1') {
                                    return chance;
                                } else {
                                    return D.dOne.minus(chance);
                                }
                            }).reduce(D.times, D.dOne);
                        rng -= chance.toNumber();
                    }
                    if (rng <= 0) i--;
                    const bin = i.toString(2).padStart(rolled.length, '0').split('');
                    rolled.forEach((item, i) => {
                        if (bin[i] == '1') add_to_results(item.id, D.dOne);
                    });
                }

                if (weight_items.length) {
                    /** @type {Decimal} */
                    const total = layers.lo.items["*"].weight(type);
                    if (weight_items.length == 1) {
                        const item = weight_items[0].id;
                        if (item in results) results[item] = results[item].add(1);
                        else results[item] = D.dOne;
                    } else if (chance_multiplier.gt(10) || options.noRNG) {
                        weight_items.forEach(item => {
                            const amount = item.weights[type].div(total).times(chance_multiplier);
                            if (item.id in results) results[item.id] = results[item.id].add(amount);
                            else results[item.id] = amount;
                        });
                    } else {
                        // There must be a better way to do this, but it looks like a pain to figure out
                        for (let l = D.dZero; l.lt(chance_multiplier); l = l.add(1)) {
                            let rng = D.times(Math.random(), total),
                                i = 0;
                            while (rng.gt(0)) {
                                rng = rng.minus(weight_items[i].weights[type]);
                                i++;
                            }
                            if (rng.lte(0)) i--;
                            const item = weight_items[i].id;
                            if (item in results) results[item] = results[item].add(1);
                            else results[item] = D.dOne;
                        }
                    }
                }

                Object.entries(results).forEach(([item, gain]) => {
                    const upg = layers.s.investloans.item_upgrade[item] ?? false;
                    if (inChallenge('b', 12)) {
                        if (upg && hasUpgrade('s', upg)) return;
                        results[item] = gain.div(player.lo.items[item].amount.add(10).log10());
                    }
                    let gain_mult = tmp.lo.items["*"].gain_multiplier;

                    if (upg && hasUpgrade('s', upg)) gain_mult = gain_mult.times(upgradeEffect('s', upg));

                    results[item] = results[item].times(gain_mult);
                });

                return Object.entries(results);
            },
            gain_drops(drops) { drops.forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.add(amount)); },
            format_chance(chance) {
                if (chance.gte(1) || options.noRNG) return `+${format(chance)}`;

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
                    case 'enemy': return layers.xp.enemy.name(sub);
                    case 'mining': return `${layers.m.ore.mode(sub)} ${tmp.m.name.toLowerCase()}`.trim();
                    case 'tree': return `Chopping ${layers.t.trees.name(sub)}`;
                }
            },
            can_drop(type) {
                if (tmp.l.deactivated) return false;
                /** @type {[drop_sources, string]} */
                const [from] = type.split(':');

                if (from == 'enemy') return hasUpgrade('lo', 11) || hasUpgrade('s', 72);
                if (from == 'mining') return tmp.m.layerShown;
                return false;
            },
            amount() { return Object.values(player.lo.items).reduce((sum, { amount }) => D.add(sum, amount), D.dZero); },
            weight(type) {
                if (!type) {
                    /** @type {{ [key: string]: Decimal }} */
                    const weights = {};

                    Object.entries(tmp.lo.items)
                        .filter(([id, item]) => id != '*' && 'weights' in item && item.weights)
                        .forEach(/**@param {[string, typeof tmp.lo.items[string]]}*/([, item]) => {
                            if (item.weights instanceof Decimal) return; // Not sure why this happens, but it breaks everything

                            Object.entries(item.weights)
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
                        if (!('weights' in item) || !item.weights || !(type in item.weights)) return sum;

                        return sum.add(item.weights[type]);
                    }, D.dZero);
            },
            has_anvil() { return hasUpgrade('m', 33) || hasUpgrade('s', 72); },
            value() {
                return Object.values(tmp.lo.buyables).reduce((sum, buyable) => {
                    if (typeof buyable != 'object' || !('value' in buyable)) return sum;
                    return D.add(sum, buyable.value.times(getBuyableAmount(buyable.layer, buyable.id)));
                }, D.dZero);
            },
            gain_multiplier() {
                let mult = D.dOne;

                if (hasUpgrade('lo', 11)) mult = mult.times(upgradeEffect('lo', 11));

                return mult;
            },
        },
        // Slime drops
        slime_goo: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 101,
            chances() {
                const chances = { 'enemy:slime': D(1 / 3), };

                if (hasChallenge('b', 31)) chances['enemy:slime'] = chances['enemy:slime'].times(2);

                if (hasUpgrade('xp', 43)) chances['enemy:goblin'] = chances['enemy:slime'].times(upgradeEffect('xp', 43).chance_mult);

                return chances;
            },
            name: 'slime goo',
            style: { 'background-image': `url('./resources/images/spill.svg')`, },
        },
        slime_core_shard: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 102,
            chances() {
                const chances = { 'enemy:slime': D(1 / 16), };

                if (hasChallenge('b', 31)) chances['enemy:slime'] = chances['enemy:slime'].times(2);

                if (hasUpgrade('xp', 43)) chances['enemy:goblin'] = chances['enemy:slime'].times(upgradeEffect('xp', 43).chance_mult);

                return chances;
            },
            name: 'slime core shard',
            style: { 'background-image': `url('./resources/images/slime_core_shard.svg')`, },
        },
        slime_core: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 103,
            chances() {
                const chances = { 'enemy:slime': D(1 / 125), };

                if (hasChallenge('b', 31)) chances['enemy:slime'] = chances['enemy:slime'].times(2);

                if (hasUpgrade('xp', 43)) chances['enemy:goblin'] = chances['enemy:slime'].times(upgradeEffect('xp', 43).chance_mult);

                return chances;
            },
            name: 'slime core',
            style: { 'background-image': `url('./resources/images/slime_core.svg')`, },
        },
        // Goblin drops
        red_fabric: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 201,
            chances() {
                const chances = { 'enemy:goblin': D(1 / 4), };

                if (hasChallenge('b', 32)) chances['enemy:goblin'] = chances['enemy:goblin'].times(2);

                return chances;
            },
            name: 'red fabric',
            style: { 'background-image': `url('./resources/images/rolled-cloth.svg')`, },
            unlocked() { return hasChallenge('b', 11); },
        },
        pyrite_coin: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 202,
            chances() {
                const chances = { 'enemy:goblin': D(1 / 25), };

                if (hasChallenge('b', 32)) chances['enemy:goblin'] = chances['enemy:goblin'].times(2);

                return chances;
            },
            name: 'pyrite coin',
            style: { 'background-image': `url('./resources/images/token.svg')`, },
            unlocked() { return hasChallenge('b', 11); },
        },
        rusty_gear: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 203,
            chances() {
                const chances = { 'enemy:goblin': D(1 / 216), };

                if (hasChallenge('b', 32)) chances['enemy:goblin'] = chances['enemy:goblin'].times(2);

                return chances;
            },
            name: 'rusty gear',
            style: { 'background-image': `url('./resources/images/cog.svg')`, },
            unlocked() { return hasChallenge('b', 11); },
        },
        // Zombie drops
        rotten_flesh: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 301,
            chances() {
                const chances = { 'enemy:zombie': D(1 / 5), };

                return chances;
            },
            name: 'rotten flesh',
            style: { 'background-image': `url('./resources/images/fleshy-mass.svg')`, },
            unlocked() { return hasChallenge('b', 12); },
        },
        brain: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 302,
            chances() {
                const chances = { 'enemy:zombie': D(1 / 343), };

                return chances;
            },
            name: 'brain',
            style: { 'background-image': `url('./resources/images/brain.svg')`, },
            unlocked() { return hasChallenge('b', 12); },
        },
        // Mining
        stone: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 501,
            weights() {
                if (hasUpgrade('m', 32)) return {};

                let shallow = D(27);

                const weights = { 'mining:shallow': shallow, };

                if (hasUpgrade('m', 52)) {
                    let deep = D(46_646);

                    weights['mining:deep'] = deep;
                }

                return weights;
            },
            other_sources() {
                if (hasUpgrade('m', 32)) return ['mining:shallow'];
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
            weights() {
                let shallow = D(4);

                if (hasUpgrade('m', 13)) shallow = shallow.times(upgradeEffect('m', 13).ore_chance);

                const weights = { 'mining:shallow': shallow, };

                if (hasUpgrade('m', 52)) {
                    let deep = D(3_125);

                    if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                    weights['mining:deep'] = deep;
                }

                return weights;
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
            weights() {
                let shallow = D(1);

                if (hasUpgrade('m', 13)) shallow = shallow.times(upgradeEffect('m', 13).ore_chance);

                const weights = { 'mining:shallow': shallow, };

                if (hasUpgrade('m', 52)) {
                    let deep = D(256);

                    if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                    weights['mining:deep'] = deep;
                }

                return weights;
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
            weights() {
                if (!hasUpgrade('m', 52)) return {};

                let deep = D(27);

                if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                return { 'mining:deep': deep, };
            },
            name: 'coal',
            style: {
                'background-image': `url('./resources/images/rock.svg')`,
                'background-color': '#000000',
                'color': '#777777',
            },
            unlocked() { return player.m.show_deep; },
        },
        iron_ore: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 505,
            chances() {
                const chances = { 'enemy:zombie': D(1 / 36), };

                return chances;
            },
            weights() {
                if (!hasUpgrade('m', 52)) return {};

                let deep = D(4);

                if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                return { 'mining:deep': deep, };
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
            weights() {
                if (!hasUpgrade('m', 52)) return {};

                let deep = D(1);

                if (hasUpgrade('m', 13)) deep = deep.times(upgradeEffect('m', 13).ore_chance);

                return { 'mining:deep': deep, };
            },
            name: 'gold ore',
            style: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': 'gold',
            },
            unlocked() { return player.m.show_deep; },
        },
        // Trees
        soaked_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 601,
            chances() {
                const chances = { 'tree:driftwood': D(1), };

                return chances;
            },
            /*per_second() {
                const per_second = layers.t.convertion.per_second(this.id);

                if (per_second.neq(0)) return { ['tree:']: per_second, };
            },*/
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
            grid: 602,
            chances() {
                const chances = {
                    'tree:oak': D(1),
                    'tree:birch': D(1),
                };

                return chances;
            },
            /*per_second() {
                const per_second = layers.t.convertion.per_second(this.id);

                if (per_second.neq(0)) return { ['tree:']: per_second, };
            },*/
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
            grid: 603,
            /*per_second() {
                const per_second = layers.t.convertion.per_second(this.id);

                if (per_second.neq(0)) return { ['tree:']: per_second, };
            },*/
            name: 'normal log',
            style: {
                'background-image': `url('./resources/images/planks.svg')`,
                'background-color': '#997744',
            },
            unlocked() { return tmp.t.layerShown ?? true; },
        },
    },
    // type none does not allow layerReset
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    branches: ['xp'],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['shown'];

        layerDataReset(this.layer, keep);
    },
});
