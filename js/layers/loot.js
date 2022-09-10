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
                ['upgrades', [1, 2]],
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
    upgrades: {
        11: {
            title: 'Lootbag',
            description: 'Start getting items<br><span style="color:orange;font-weight:bold">This upgrade does a Loot reset</span>',
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
            title: 'Slime sword',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime swords
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
        },
        12: {
            title: 'Slime bag',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const effect = buyableEffect(this.layer, this.id);
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime bags multiply drop chances by ${format(effect.chance)} and
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
        },
        13: {
            title: 'Slime spike',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime spikes increase
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
        },
        14: {
            title: 'Slime orb',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = `${layers.l.resource} ${format(tmp[this.layer].buyables[this.id].requires['l'])}`;
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime orbs increase
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
            let style = {
                'background-repeat': 'no-repeat',
                'background-size': 'contain',
            };
            switch (Math.floor(id / 100)) {
                case 1:
                    style['background-color'] = '#7FBF7F';
                    break;
            }

            return {
                get 101() {
                    return Object.assign({}, style, {
                        'background-image': `url('./resources/images/spill.svg')`,
                    });
                },
                get 102() {
                    return Object.assign({}, style, {
                        'background-image': `url('./resources/images/slime_core_shard.svg')`,
                    });
                },
                get 103() {
                    return Object.assign({}, style, {
                        'background-image': `url('./resources/images/slime_core.svg')`,
                    });
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

            /**
             * Items bound to your luck
             *
             * @type {string[]}
             */
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
                // Fuck it, you're getting a little of everything instead
            } else {
                /*
                You might be wondering what kinda cheat this is.

                The trick is to roll a number, then check every possible roll,
                starting from the most common one, until the total weight is above the roll.
                 */
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
                let base = new Decimal(1 / 3);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);

                return base;
            },
            name: 'slime goo',
            unlocked: true,
        },
        slime_core_shard: {
            chance() {
                let base = new Decimal(1 / 16);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);

                return base;
            },
            name: 'slime core shards',
            unlocked: true,
        },
        slime_core: {
            chance() {
                let base = new Decimal(1 / 125);

                base = base.times(buyableEffect('lo', 12).chance);
                base = base.times(tmp.l.skills.looting.effect);

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
