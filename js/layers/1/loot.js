'use strict';

addLayer('lo', {
    name: 'Loot',
    image: './resources/images/swap-bag.svg',
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
    layerShown() { return player.lo.shown || hasUpgrade('xp', 33); },
    color: '#A27A50',
    row: 1,
    position: 1,
    hotkeys: [
        {
            key: 'O',
            description: 'Shift + O: Display Loot layer',
            unlocked() { return player.lo.unlocked; },
            onPress() { showTab('lo'); },
        }
    ],
    tabFormat: {
        'Crafting': {
            content: [
                ['upgrades', [1]],
                ['buyables', [1]],
            ],
        },
        'Inventory': {
            content: [
                'grid',
            ],
        },
    },
    upgrades: {
        11: {
            title: 'Lootbag',
            description: 'Start getting items from your kills',
            cost: D(250),
            currencyDisplayName: 'kills',
            currencyInternalName: 'kills',
            currencyLocation() { return tmp.xp.total; },
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
    buyables: {
        // slime
        11: {
            title: 'Book of slimes',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} books of slimes\
                multiply experience gain by ${format(buyableEffect(this.layer, this.id))} (^1.1 for slimes)<br><br>\
                Cost: ${cost}`;
            },
            cost(x) {
                return {
                    slime_goo: D(1.5).pow(x).times(10),
                    slime_core_shard: D(1.1).pow(x),
                };
            },
            effect(x) { return D(1.25).pow(x); },
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
        },
        12: {
            title: 'Storage slime',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)),
                    /** @type {{xp_hold: Decimal, chance_mult: Decimal}} */
                    effect = buyableEffect(this.layer, this.id);

                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} storage slimes\
                hold ${formatWhole(effect.xp_hold)} experience upgrades\
                and multiply drop chances by ${format(effect.chance_mult)}<br><br>\
                Cost: ${cost}`;
            },
            cost(x) {
                return {
                    slime_goo: D(1.25).pow(x).times(10),
                    slime_core_shard: D(5 / 6).pow(x).times(3),
                };
            },
            effect(x) {
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
        },
        13: {
            title: 'Sticky trap',
            display() {
                /** @type {{[item: string]: Decimal}} */
                const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                    cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} books of slimes\
                divide enemy health by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                Cost: ${cost}`;
            },
            cost(x) {
                return {
                    slime_goo: D(1.5).pow(x).times(30),
                    slime_core: D(1.1).pow(x),
                };
            },
            effect(x) { return D(1.1).pow(x); },
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
        },
    },
    grid: {
        rows: 1,
        cols: 3,
        getStartData(_) { return {}; },
        getStyle(_, id) {
            const item_id = layers.lo.items["*"].grid_to_item(id);
            if (!item_id) return { 'display': 'none', };

            const row = Math.floor(id / 100),
                row_style = {
                    1: {
                        'background-color': layers.xp.enemy.color('slime'),
                    },
                }[row] ?? {};

            return Object.assign(
                { 'background-repeat': 'no-repeat', 'background-position': 'center', 'background-size': 'contain', },
                row_style,
                tmp.lo.items[item_id].style,
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
            const item_id = layers.lo.items["*"].grid_to_item(id);
            if (!item_id) return;

            const item = tmp.lo.items[item_id];

            const lines = Object.entries(item.chances)
                .filter(([type]) => layers.lo.items["*"].can_drop(type))
                .map(([type, chance]) => `${layers.lo.items["*"].type_name(type)}: ${layers.lo.items["*"].format_chance(chance.times(tmp.lo.items["*"].global_chance_multiplier))}`);

            if (!lines.length) lines.push('No source');
            return lines.join('<br>');
        },
    },
    /** @type {typeof layers.lo.items} */
    items: {
        '*': {
            global_chance_multiplier() {
                let mult = D.dOne;

                mult = mult.times(buyableEffect('lo', 12).chance_mult);

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
                if (chance_multiplier.lte(0)) return [];

                /** @type {typeof tmp.lo.items[string][]} */
                const items = Object.values(tmp.lo.items)
                    .filter((item) => 'chances' in item && type in item.chances),
                    /** @type {{[item: string]: Decimal}} */
                    results = {},
                    /** @type {typeof items} */
                    rolled = [],
                    /** @type {(item: string, amount: Decimal) => void} */
                    add_to_results = (item, amount) => {
                        if (item in results) {
                            results[item] = results[item].add(amount);
                        } else {
                            results[item] = amount;
                        }
                    };

                items.forEach(item => {
                    const { id } = item,
                        chance = item.chances[type].times(chance_multiplier);
                    if (chance.gte(1)) {
                        add_to_results(id, chance);
                    } else {
                        rolled.push(item);
                    }
                });

                if (rolled.length > 7) {
                    // Limit to a theorical maximum of 128 loops
                    rolled.forEach(item => {
                        add_to_results(item.id, item.chances[type]);
                    });
                } else {
                    let rng = Math.random(),
                        i = 0;
                    for (; i < 2 ** rolled.length && rng > 0; i++) {
                        const bin = i.toString(2).padStart(rolled.length, '0').split(''),
                            chance = rolled.map((item, i) => {
                                const chance = item.chances[type] * chance_multiplier;
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

                return Object.entries(results);
            },
            format_chance(chance) {
                if (chance.gte(1)) return `+${format(chance)}`;

                const fractional = options.chanceMode == 'NOT_GUARANTEED' || (options.chanceMode == 'LESS_HALF' && chance.lt(.5));

                if (fractional) {
                    return `1/${format(chance.pow(-1))}`;
                } else {
                    return `${format(chance.times(100))}%`;
                }
            },
            type_name(type) {
                const [from, sub] = type.split(':');
                switch (from) {
                    case 'enemy': return layers.xp.enemy.name(sub);
                }
            },
            can_drop(type) {
                const [from] = type.split(':');

                if (from == 'enemy') return hasUpgrade('lo', 11);
                return false;
            },
            amount() { return Object.values(player.lo.items).reduce((sum, { amount }) => D.add(sum, amount), D.dZero); },
        },
        // Slime drops
        slime_goo: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 101,
            chances() { return { 'enemy:slime': D(1 / 3), }; },
            name: 'slime goo',
            style: { 'background-image': `url('./resources/images/spill.svg')`, },
        },
        slime_core_shard: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 102,
            chances() { return { 'enemy:slime': D(1 / 16), }; },
            name: 'slime core shard',
            style: { 'background-image': `url('./resources/images/slime_core_shard.svg')`, },
        },
        slime_core: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.lo.items).find(item => layers.lo.items[item] == this); },
            grid: 103,
            chances() { return { 'enemy:slime': D(1 / 125), }; },
            name: 'slime core',
            style: { 'background-image': `url('./resources/images/slime_core.svg')`, },
        },
    },
    // type none does not allow layerReset
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    branches: ['xp'],
});
