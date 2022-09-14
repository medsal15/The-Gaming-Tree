addLayer('lo', {
    name: 'Loot',
    image: './resources/images/locked-chest.svg',
    startData() {
        const data = {
            points: Decimal.dZero,
            // Cheat the system to allow purchasing the first upgrade without actually unlocking the layer
            unlocked: true,
            shown: false,
            items: {},
        };

        Object.entries(this.items).forEach(([item, value]) => {
            if (typeof value == 'function') return;

            data.items[item] = Decimal.dZero;
        });

        return data;
    },
    color: '#B768A2',
    row: 1,
    tooltip() {
        if (player.lo.shown) return `${formatWhole(Object.values(player.lo.items).reduce((a, b) => a.add(b), Decimal.dZero))} items`;
        else {
            const upgrade = tmp[this.layer].upgrades[11];
            return `Reach ${formatWhole(upgrade.cost)} ${upgrade.currencyDisplayName} to unlock
            (You have ${formatWhole(upgrade.currencyLocation[upgrade.currencyInternalName])} ${upgrade.currencyDisplayName})`;
        };
    },
    nodeStyle() {
        let style = {};

        const upgrade = tmp[this.layer].upgrades[11];
        if (!(upgrade.currencyInternalName in upgrade.currencyLocation) || (!player.lo.shown && !canAffordUpgrade('lo', 11))) {
            style['background-color'] = '#bf8f8f';
            style['cursor'] = 'not-allowed';
        } else {
            style['background-color'] = tmp[this.layer].color;
        }

        return style;
    },
    layerShown() { return player.lo.shown || hasUpgrade('xp', 33); },
    hotkeys: [
        {
            key: 'O',
            description: 'Shift + O: Display loot layer',
            unlocked() { return player.lo.shown },
            onPress() { if (player.lo.shown) showTab('lo'); },
        },
    ],
    tabFormat: {
        'Crafting': {
            content: [
                ['upgrades', [1]],
                'blank',
                ['infobox', 'inventory'],
                ['clickables', [1]],
                'blank',
                ['buyables', [1, 2]],
            ],
        },
        'Items': {
            content: [
                ['display-text', 'Hover over a cell to get the drop rates'],
                'blank',
                'grid',
            ],
            unlocked() { return player.lo.shown; },
        },
    },
    upgrades: {
        11: {
            title: 'Lootbag',
            description: 'Start getting items<br><span style="color:#ff2400;font-weight:bold">This upgrade does a Loot reset</span>',
            cost: new Decimal(250),
            currencyDisplayName: 'kills',
            currencyInternalName: 'kills',
            currencyLocation() { return player.xp; },
            onPurchase() {
                player.lo.shown = true;
                doReset('lo', true);
            },
        },
    },
    buyables: {
        // Slime
        11: {
            title: 'Slime sword',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime swords\
                add ${format(buyableEffect(this.layer, this.id))} damage to your attacks<br><br>Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) {
                return x.add(1).log2().div(1.25);
            },
            cost(x) {
                return {
                    slime_goo: new Decimal(2).pow(x).times(10),
                    slime_core_shard: new Decimal(2).pow(x),
                };
            },
            canAfford() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost).every(([k, c]) => items[k].gte(c));
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost).forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#7FBF7F';

                return style;
            },
        },
        12: {
            title: 'Slime bag',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const effect = buyableEffect(this.layer, this.id);
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime bags\
                multiply drop chances by ${format(effect.chance)} and\
                store ${formatWhole(effect.xp_keep)} XP upgrades<br><br>Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) {
                return {
                    chance: new Decimal(.1).times(x).add(1),
                    xp_keep: x,
                };
            },
            cost(x) {
                return {
                    slime_goo: new Decimal(x).add(1).pow(1.5).times(7),
                    slime_core_shard: new Decimal(1.5).pow(x).times(3),
                };
            },
            canAfford() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost).every(([k, c]) => items[k].gte(c));
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost).forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#7FBF7F';

                return style;
            },
        },
        13: {
            title: 'Slime spike',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime spikes increase\
                passive damage by ${format(buyableEffect(this.layer, this.id).times(100))}%<br><br>Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) {
                return x.pow(2).div(100);
            },
            cost(x) {
                return {
                    slime_goo: new Decimal(1.5).pow(x).times(10),
                    slime_core: new Decimal(1.5).pow(x).times(2),
                };
            },
            canAfford() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost).every(([k, c]) => items[k].gte(c));
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost).forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#7FBF7F';

                return style;
            },
        },
        14: {
            title: 'Slime orb',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = `${layers.l.resource} ${format(tmp[this.layer].buyables[this.id].requires['l'])}`;
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime orbs increase\
                skill points by ${format(buyableEffect(this.layer, this.id).times(100))}%<br><br>Requires: ${req}<br>Cost: ${cost}`;
            },
            unlocked: false,
            effect(x) {
                return x;
            },
            cost(x) {
                return {};
            },
            requires(x = getBuyableAmount('lo', 14)) {
                return {
                    l: x,
                };
            },
            canAfford() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost)
                    .filter(([k]) => k != 'l')
                    .every(([k, c]) => items[k].gte(c)) &&
                    player.l.points.gte(tmp[this.layer].buyables[this.id].requires['l']);
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost)
                    .forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#7FBF7F';

                return style;
            },
        },
        // Ore
        21: {
            title: 'Stone forge',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = hasUpgrade('o', 33) ? '' : '<span style="font-weight:bold;color:#FF2400">Requires tin anvil</span><br>';
                return `${req}\
                Your ${formatWhole(getBuyableAmount(this.layer, this.id))} stone forges\
                multiply your damage by ${format(buyableEffect(this.layer, this.id))}<br><br>Cost: ${cost}`;
            },
            unlocked() { return hasUpgrade('o', 33) || getBuyableAmount('lo', 21).gte(1) || getBuyableAmount('lo', 22).gte(1) || getBuyableAmount('lo', 23).gte(1); },
            effect(x) {
                return new Decimal(1.1).pow(x.div(2));
            },
            cost(x) {
                return {
                    stone: new Decimal(2).pow(x).times(200),
                    copper_ore: new Decimal(1.25).pow(x).times(75),
                };
            },
            canAfford() {
                if (!hasUpgrade('o', 33)) return false;

                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost).every(([k, c]) => items[k].gte(c));
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost).forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#BCBCBC';

                return style;
            },
        },
        22: {
            title: 'Copper golem',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = hasUpgrade('o', 33) ? '' : '<span style="font-weight:bold;color:#FF2400">Requires tin anvil</span><br>';
                return `${req}\
                Your ${formatWhole(getBuyableAmount(this.layer, this.id))} copper golems\
                divide level costs by ${format(buyableEffect(this.layer, this.id))}<br><br>Cost: ${cost}`;
            },
            unlocked() { return hasUpgrade('o', 33) || getBuyableAmount('lo', 21).gte(1) || getBuyableAmount('lo', 22).gte(1) || getBuyableAmount('lo', 23).gte(1); },
            effect(x) {
                return new Decimal(1.1).pow(x);
            },
            cost(x) {
                return {
                    stone: new Decimal(1.75).pow(x).times(75),
                    copper_ore: new Decimal(2).pow(x).times(100),
                    slime_core: new Decimal(1.25).pow(x),
                };
            },
            canAfford() {
                if (!hasUpgrade('o', 33)) return false;

                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost).every(([k, c]) => items[k].gte(c));
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost).forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#B87333';

                return style;
            },
        },
        23: {
            title: 'Tin chest',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                /** @type {{o_keep: Decimal, ore_health: Decimal}} */
                const effect = buyableEffect(this.layer, this.id);
                const req = hasUpgrade('o', 33) ? '' : '<span style="font-weight:bold;color:#FF2400">Requires tin anvil</span><br>';
                return `${req}\
                Your ${formatWhole(getBuyableAmount(this.layer, this.id))} tin chests\
                store ${formatWhole(effect.o_keep)} ore upgrades\
                and multiply ore health by ${format(effect.ore_health)}<br><br>Cost: ${cost}`;
            },
            unlocked() { return hasUpgrade('o', 33) || getBuyableAmount('lo', 21).gte(1) || getBuyableAmount('lo', 22).gte(1) || getBuyableAmount('lo', 23).gte(1); },
            effect(x) {
                return {
                    o_keep: x,
                    ore_health: x.add(1).root(3),
                };
            },
            cost(x) {
                return {
                    stone: new Decimal(1.75).pow(x).times(150),
                    copper_ore: new Decimal(1.75).pow(x).times(125),
                    tin_ore: new Decimal(2).pow(x).times(5),
                };
            },
            canAfford() {
                if (!hasUpgrade('o', 33)) return false;

                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost).every(([k, c]) => items[k].gte(c));
            },
            buy() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                Object.entries(cost).forEach(([k, c]) => items[k] = items[k].minus(c));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (this.canAfford()) style['background-color'] = '#C4BC86';

                return style;
            },
        },
    },
    grid: {
        rows() {
            if (hasChallenge('b', 11)) return 3;
            if (tmp.o.layerShown) return 2;
            return 1;
        },
        cols: 3,
        maxRows: 3,
        // Required, even though I am only using grid for display
        getStartData(_) { return null; },
        getTitle(_, id) {
            const item = layers.lo.items.itemId(id);
            if (item === false) return '';
            return layers.lo.items[item].name.replace(/^(.)/, s => s.toUpperCase());
        },
        getDisplay(_, id) {
            const item = layers.lo.items.itemId(id);
            if (item === false) return;

            return formatWhole(player.lo.items[item]);
        },
        getStyle(_, id) {
            const item = layers.lo.items.itemId(id);
            if (item === false) return { 'background-color': 'transparent' };

            return Object.assign({
                'background-repeat': 'no-repeat',
                'background-size': 'contain',
            }, tmp.lo.items[item].gridStyle ?? {});
        },
        getTooltip(_, id) {
            const item = layers.lo.items.itemId(id);
            if (item === false) return;

            /** @type {Decimal} */
            const chance = tmp.lo.items[item].chance;
            if (chance.gte(1)) return `+${format(chance)}`;
            else return `${format(chance.times(100))}% chance`;
        },
    },
    /**
     * @type {{
     *  onKill: (type: string, level: Decimal, kills: Decimal) => [string, Decimal][],
     *  itemId: (id: number) => string|false,
     *  [k: string]: {
     *      chance: Computable<Decimal>,
     *      name: string,
     *      unlocked: Computable<boolean>,
     *      types: Computable<string[]>,
     *      gridStyle: Computable<CSSStyles>,
     *      gridId: number,
     *  },
     * }}
     */
    items: {
        /**
         * @param {string} type
         * @param {Decimal} level
         * @param {Decimal} kills
         * @param {Decimal} [chance_mult]
         * @returns {[string, Decimal][]}
         */
        onKill(type, level, kills, chance_mult = Decimal.dOne) {
            if (!hasUpgrade('lo', 11) && type != 'ore') return [];
            /** @type {{[item: string]: Decimal}} */
            const stored = player.lo.items;
            /** @type {{[item: string]: Decimal}} */
            const looted = {};

            /** @type {string[]} */
            const items = Object.entries(tmp.lo.items)
                .filter(([_, v]) => typeof v != 'function' && v.types.includes(type) && v.unlocked)
                .map(([k]) => k);

            if (!items.length) return [];

            /**
             * Items bound to your luck
             *
             * @type {string[]}
             */
            const rolled = [];
            items.forEach(item => {
                /** @type {Decimal} */
                const chance = tmp.lo.items[item].chance.times(chance_mult);
                if (chance.gte(1)) {
                    if (item in looted) looted[item] = looted[item].add(chance);
                    else looted[item] = chance;
                } else {
                    rolled.push(item);
                }
            });

            if (rolled.length >= 7) {
                // Fuck it, you're getting a little of everything instead
                rolled.forEach(item => {
                    /** @type {Decimal} */
                    const chance = tmp.lo.items[item].chance.times(chance_mult);
                    looted[item] = (looted[item] ?? Decimal.dZero).add(chance);
                });
            } else {
                /*
                You might be wondering what kinda cheat this is.

                The trick is to roll a number, then check every possible roll,
                starting from the most common one, until the total weight is above the roll.
                 */
                let roll = Math.random();
                let n = 0;
                for (; n < 2 ** rolled.length && roll > 0; n++) {
                    const r = rolled.map((item, i) => {
                        /** @type {number} */
                        let c = tmp.lo.items[item].chance.times(chance_mult).toNumber();

                        if ((2 ** i & n) == 0) c = 1 - c;

                        return c;
                    }).reduce((a, b) => a * b, 1);

                    roll -= r;
                }
                n = Math.max(0, n - 1);
                // Chosen set of items
                let loot = rolled.filter((_, i) => (2 ** i & n) != 0);

                new Set(loot).forEach(item => {
                    const amount = new Decimal(loot.filter(i => i == item).length);
                    looted[item] = (looted[item] ?? Decimal.dZero).add(amount);
                });
            }

            Object.entries(looted).forEach(([item, amount]) => stored[item] = stored[item].add(amount));

            return Object.entries(looted);
        },
        itemId(id) {
            if (isNaN(id)) return false;

            /** @type {{[k: number]: string|false}} */
            const map = layers.lo.items.itemId.map ??= {};
            if (id in map) {
                return map[id];
            }

            const item = Object.entries(layers.lo.items).filter(([_, v]) => typeof v == 'object').find(([_, v]) => v.gridId == id);
            if (!item) {
                map[id] = false;
            } else {
                map[id] = item[0];
            }
            return map[id];
        },
        // slime
        slime_goo: {
            chance() {
                let base = new Decimal(1 / 3);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);
                if (hasUpgrade('o', 32)) base = base.times(upgradeEffect('o', 32));

                return base;
            },
            name: 'slime goo',
            unlocked: true,
            types: ['slime'],
            gridStyle: {
                'background-color': '#7FBF7F',
                'background-image': `url('./resources/images/spill.svg')`,
            },
            gridId: 101,
        },
        slime_core_shard: {
            chance() {
                let base = new Decimal(1 / 16);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);
                if (hasUpgrade('o', 32)) base = base.times(upgradeEffect('o', 32));

                return base;
            },
            name: 'slime core shards',
            unlocked: true,
            types: ['slime'],
            gridStyle: {
                'background-color': '#7FBF7F',
                'background-image': `url('./resources/images/slime_core_shard.svg')`,
            },
            gridId: 102,
        },
        slime_core: {
            chance() {
                let base = new Decimal(1 / 125);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);
                if (hasUpgrade('o', 32)) base = base.times(upgradeEffect('o', 32));

                return base;
            },
            name: 'slime cores',
            unlocked: true,
            types: ['slime'],
            gridStyle: {
                'background-color': '#7FBF7F',
                'background-image': `url('./resources/images/slime_core.svg')`,
            },
            gridId: 103,
        },
        // ore
        stone: {
            chance() {
                let base = new Decimal(1 / 4);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);
                if (hasUpgrade('o', 23)) base = base.times(upgradeEffect('o', 23));

                return base;
            },
            name: 'stone',
            unlocked() { return tmp.o.layerShown; },
            types: ['ore'],
            gridStyle: {
                'background-image': `url('./resources/images/stone-block.svg')`,
                'background-color': '#BCBCBC',
            },
            gridId: 201,
        },
        copper_ore: {
            chance() {
                let base = new Decimal(1 / 27);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);
                if (hasUpgrade('o', 23)) base = base.times(upgradeEffect('o', 23));

                return base;
            },
            name: 'copper ore',
            unlocked() { return tmp.o.layerShown; },
            types: ['ore'],
            gridStyle: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#B87333',
            },
            gridId: 202,
        },
        tin_ore: {
            chance() {
                let base = new Decimal(1 / 256);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);
                if (hasUpgrade('o', 23)) base = base.times(upgradeEffect('o', 23));

                return base;
            },
            name: 'tin ore',
            unlocked() { return tmp.o.layerShown; },
            types: ['ore'],
            gridStyle: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#C4BC86',
            },
            gridId: 203,
        },
        // skeleton
        bone: {
            chance() {
                let base = new Decimal(1 / 9);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);

                return base;
            },
            name: 'bone',
            unlocked() { return hasChallenge('b', 11); },
            types: ['skeleton'],
            gridStyle: {
                'background-image': `url('./resources/images/bone.svg')`,
                'background-color': 'transparent',
                'border-color': '#EEEEEE',
                'color': '#777777',
            },
            gridId: 301,
        },
        skull: {
            chance() {
                let base = new Decimal(1 / 64);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);

                return base;
            },
            name: 'skull',
            unlocked() { return hasChallenge('b', 11); },
            types: ['skeleton'],
            gridStyle: {
                'background-image': `url('./resources/images/piece-skull.svg')`,
                'background-color': 'transparent',
                'border-color': '#EEEEEE',
                'color': '#777777',
            },
            gridId: 302,
        },
    },
    // Only for doReset
    type: 'static',
    baseAmount() { return Decimal.dZero; },
    requires: Decimal.dOne,
    branches: ['xp', 'o'],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = ['shown'];

        layerDataReset(this.layer, keep);
    },
});
