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
                ['buyables', [1]],
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
    clickables: {
        11: {
            title: 'Craft slime core',
            display: 'Convert 50 slime goo and 10 slime core shards into a slime core',
            canClick() { return 'slime_core_shards' in player.lo.items && player.lo.items.slime_goo.gte(50) && player.lo.items.slime_core_shards.gte(10); },
            onClick() {
                player.lo.items.slime_goo = player.lo.items.slime_goo.minus(50);
                player.lo.items.slime_core_shards = player.lo.items.slime_core_shards.minus(10);
                player.lo.items.slime_core = player.lo.items.slime_core.add(1);
            },
            unlocked() { return player.lo.shown; },
        },
    },
    upgrades: {
        11: {
            title: 'Lootbag',
            description: 'Start getting items<br>This upgrade does a Loot reset',
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
        11: {
            title: 'Slimy trap',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your slimy traps divide your enemy's health by ${format(buyableEffect(this.layer, this.id))}<br><br>Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) { return x.add(1).root(2); },
            cost(x) {
                return {
                    slime_goo: new Decimal(1.5).pow(x).times(10),
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
            buyMax() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;

                let target_amount = items.slime_goo.div(10).log(1.5).floor();
                let current_amount = getBuyableAmount(this.layer, this.id);
                if (target_amount.lte(current_amount)) return;

                // You know what, I'm not doing the true calculation
                /** @type {Decimal} */
                let target_cost = this.cost(target_amount);
                /** @type {Decimal} */
                let current_cost = this.cost(current_amount);

                let final_cost = target_cost.minus(current_cost);
                player.lo.items.slime_goo = player.lo.items.slime_goo.minus(final_cost);
                setBuyableAmount(this.layer, this.id, target_amount);
            },
        },
        12: {
            title: 'Slime sword',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your slime swords add ${format(buyableEffect(this.layer, this.id))} damage to your attacks<br><br>Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) { return x.root(2).div(4); },
            cost(x) {
                return {
                    slime_goo: new Decimal(2).pow(x).times(10),
                    slime_core_shard: new Decimal(1.25).pow(x).times(5),
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
            buyMax() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;

                let target_amount = [
                    // Slime goo
                    items.slime_goo.div(10).log(2).floor(),
                    // Slime core shard
                    items.slime_core_shard.div(5).log(1.5).floor(),
                ].sort((a, b) => a.gt(b))[0];
                let current_amount = getBuyableAmount(this.layer, this.id);

                if (target_amount.lte(current_amount)) return;

                // You know what, I'm not doing the true calculation
                /** @type {{[k: string]: Decimal}} */
                let target_cost = this.cost(target_amount);
                /** @type {{[k: string]: Decimal}} */
                let current_cost = this.cost(current_amount);

                Object.entries(target_cost).map(([key, cost]) => [key, cost.minus(current_cost[key])])
                    .forEach(/**@param {[string, Decimal]}*/([key, cost]) => items[key] = items[key].minus(cost));
                setBuyableAmount(this.layer, this.id, target_amount);
            },
        },
        13: {
            title: 'Slime bag',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your slime bags multiply your item drop chances by ${buyableEffect(this.layer, this.id)}, squared for slime items<br><br>Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) { return x.div(10).add(1); },
            cost(x) {
                return {
                    slime_goo: new Decimal(5).pow(x).times(5),
                    slime_core: new Decimal(2).pow(x),
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
            buyMax() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;

                let target_amount = [
                    // Slime goo
                    items.slime_goo.div(5).log(5).floor(),
                    // Slime core
                    items.slime_Core.log2().floor(),
                ].sort((a, b) => a.gt(b))[0];
                let current_amount = getBuyableAmount(this.layer, this.id);

                if (target_amount.lte(current_amount)) return;

                // You know what, I'm not doing the true calculation
                /** @type {{[k: string]: Decimal}} */
                let target_cost = this.cost(target_amount);
                /** @type {{[k: string]: Decimal}} */
                let current_cost = this.cost(current_amount);

                Object.entries(target_cost).map(([key, cost]) => [key, cost.minus(current_cost[key])])
                    .forEach(/**@param {[string, Decimal]}*/([key, cost]) => items[key] = items[key].minus(cost));
                setBuyableAmount(this.layer, this.id, target_amount);
            },
        },
    },
    grid: {
        rows: 1,
        cols: 3,
        // Required, even though I am only using grid for display
        getStartData(_) { return null; },
        getTitle(_, id) {
            return {
                get 101() { return layers.lo.items.slime_goo.name.replace(/^(.)/, s => s.toUpperCase()); },
                get 102() { return layers.lo.items.slime_core_shard.name.replace(/^(.)/, s => s.toUpperCase()); },
                get 103() { return layers.lo.items.slime_core.name.replace(/^(.)/, s => s.toUpperCase()); },
            }[id];
        },
        getDisplay(_, id) {
            let item = {
                get 101() { return 'slime_goo'; },
                get 102() { return 'slime_core_shard'; },
                get 103() { return 'slime_core'; },
            }[id];
            if (!item) return;

            return formatWhole(player.lo.items[item]);
        },
        getStyle(_, id) {
            return {
                get 101() {
                    return {
                        'background-color': '#7FBF7F',
                        'background-image': `url('./resources/images/spill.svg')`,
                        'background-repeat': 'no-repeat',
                        'background-size': 'contain',
                    };
                },
                get 102() {
                    return {
                        'background-color': '#7FBF7F',
                        'background-image': `url('./resources/images/slime_core_shard.svg')`,
                        'background-repeat': 'no-repeat',
                        'background-size': 'contain',
                    };
                },
                get 103() {
                    return {
                        'background-color': '#7FBF7F',
                        'background-image': `url('./resources/images/slime_core.svg')`,
                        'background-repeat': 'no-repeat',
                        'background-size': 'contain',
                    };
                },
            }[id];
        },
        getTooltip(_, id) {
            let item = {
                get 101() { return 'slime_goo'; },
                get 102() { return 'slime_core_shard'; },
                get 103() { return 'slime_core'; },
            }[id];
            if (!item) return;

            /** @type {Decimal} */
            const chance = tmp.lo.items[item].chance;
            if (chance.gte(1)) return format(chance);
            else return `${format(chance.times(100))}% chance`;
        },
    },
    items: {
        /**
         * @param {'slime'} type
         * @param {Decimal} level
         * @param {Decimal} kills
         * @returns {[string, Decimal][]}
         */
        onKill(type, level, kills) {
            if (!hasUpgrade('lo', 11)) return;
            /** @type {{[item: string]: Decimal}} */
            const stored = player.lo.items;
            /** @type {string[]} */
            const items = [];
            /** @type {{[item: string]: Decimal}} */
            const looted = {};

            switch (type) {
                case 'slime':
                    // Odds of getting everything: 1/1e6
                    items.push('slime_goo', 'slime_core_shard', 'slime_core');
                    break;
            }

            /** @type {string[]} */
            const rolled = [];
            items.forEach(item => {
                /** @type {Decimal} */
                const chance = tmp.lo.items[item].chance;
                if (chance.gte(1)) {
                    if (item in looted) looted[item] = looted[item].add(chance);
                    else looted[item] = chance;
                } else {
                    rolled.push(item);
                }
            });

            if (rolled.length >= 7) {
                //! too big, limited to 63 loops
                alert('Too many items are being rolled at once, tell the mod creator if it is not supported yet');
            } else {
                let roll = Math.random();
                let n = 0;
                for (; n < 2 ** rolled.length - 1 && roll > 0; n++) {
                    const r = rolled.map((item, i) => {
                        /** @type {number} */
                        let c = tmp.lo.items[item].chance.toNumber();

                        if ((2 ** i & n) == 0) c = 1 - c;

                        return c;
                    }).reduce((a, b) => a * b, 1);

                    roll -= r;
                }
                n--;
                // Chosen set of items
                let loot = rolled.filter((_, i) => (2 ** i & n) != 0);

                new Set(loot).forEach(item => {
                    const amount = new Decimal(loot.filter(i => i == item).length);
                    if (item in looted) looted[item] = looted[item].add(amount);
                    else looted[item] = amount;
                });
            }

            Object.entries(looted).forEach(([item, amount]) => stored[item] = stored[item].add(amount));

            return Object.entries(looted);
        },
        slime_goo: {
            chance() {
                let base = new Decimal(.1);

                base = base.times(buyableEffect('lo', 13).pow(2));

                return base;
            },
            name: 'slime goo',
            unlocked: true,
        },
        slime_core_shard: {
            chance() {
                let base = new Decimal(.01);

                base = base.times(buyableEffect('lo', 13).pow(2));

                return base;
            },
            name: 'slime core shards',
            unlocked: true,
        },
        slime_core: {
            chance() {
                let base = new Decimal(.001);

                base = base.times(buyableEffect('lo', 13).pow(2));

                return base;
            },
            name: 'slime cores',
            unlocked: true,
        },
    },
    // Only for doReset
    type: 'static',
    baseAmount() { return Decimal.dZero; },
    requires: Decimal.dOne,
    branches: ['xp'],
});
