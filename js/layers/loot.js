addLayer('lo', {
    name: 'Loot',
    image: './resources/images/locked-chest.svg',
    startData() {
        const data = {
            points: D.dZero,
            // Cheat the system to allow purchasing the first upgrade without actually unlocking the layer
            unlocked: true,
            shown: false,
            items: {},
        };

        Object.entries(this.items).forEach(([item, value]) => {
            if (typeof value == 'function') return;

            data.items[item] = D.dZero;
        });

        return data;
    },
    color: '#B768A2',
    row: 1,
    deactivated() { return inChallenge('b', 21); },
    tooltip() {
        if (player.lo.shown) return `${formatWhole(Object.values(player.lo.items).reduce((a, b) => a.add(b), D.dZero))} items`;
        else {
            const upgrade = tmp[this.layer].upgrades[11];
            return `Reach ${formatWhole(upgrade.cost)} ${upgrade.currencyDisplayName} to unlock
            (You have ${formatWhole(upgrade.currencyLocation[upgrade.currencyInternalName])} ${upgrade.currencyDisplayName})`;
        };
    },
    nodeStyle() {
        let style = { 'background-repeat': 'no-repeat' };

        const upgrade = tmp[this.layer].upgrades[11];
        if (!(upgrade.currencyInternalName in upgrade.currencyLocation) || (!player.lo.shown && !canAffordUpgrade('lo', 11))) {
            style['background-color'] = '#bf8f8f';
            style['cursor'] = 'not-allowed';
        } else {
            style['background-color'] = tmp[this.layer].color;
        }

        return style;
    },
    layerShown() { return !tmp[this.layer].deactivated && (player.lo.shown || hasUpgrade('xp', 33)); },
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
                ['buyables', [1, 2, 3]],
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
            description() {
                if (hasUpgrade('s', 72)) return 'Double items gain';
                return 'Start getting items<br><span style="color:#ff2400;font-weight:bold">This upgrade does a Loot reset</span>';
            },
            cost: D(250),
            currencyDisplayName: 'kills',
            currencyInternalName: 'kills',
            currencyLocation() { return player.xp; },
            onPurchase() {
                player.lo.shown = true;
                if (!hasUpgrade('s', 72)) doReset('lo', true);
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
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime swords\
                add ${format(buyableEffect(this.layer, this.id))} damage to your attacks\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return x.add(1).log2().div(1.25);
            },
            cost(x) {
                const costs = {
                    slime_goo: D(2).pow(x).times(10),
                    slime_core_shard: D(2).pow(x),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
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
            value() {
                let base = D(1);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        12: {
            title: 'Slime bag',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const effect = buyableEffect(this.layer, this.id);
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime bags\
                multiply drop chances by ${format(effect.chance)} and\
                store ${formatWhole(effect.xp_keep)} XP upgrades\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return {
                    chance: D(.1).times(x).add(1),
                    xp_keep: x,
                };
            },
            cost(x) {
                const costs = {
                    slime_goo: D(x).add(1).pow(1.5).times(7),
                    slime_core_shard: D(1.5).pow(x).times(3),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
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
            value() {
                let base = D(5);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        13: {
            title: 'Slime spike',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime spikes increase\
                passive damage by ${format(buyableEffect(this.layer, this.id).times(100))}%\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return player.lo.shown; },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return x.pow(2).div(100);
            },
            cost(x) {
                const costs = {
                    slime_goo: D(1.5).pow(x).times(10),
                    slime_core: D(1.5).pow(x).times(2),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
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
            value() {
                let base = D(3);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        // Ore
        21: {
            title: 'Stone forge',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = (hasUpgrade('o', 33) || hasUpgrade('s', 83)) ? '' : '<span style="font-weight:bold;color:#FF2400">Requires an anvil</span><br>';
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `${req}\
                Your ${formatWhole(getBuyableAmount(this.layer, this.id))} stone forges\
                multiply your damage by ${format(buyableEffect(this.layer, this.id))}\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return hasChallenge('b', 11) || hasUpgrade('o', 33) || getBuyableAmount('lo', 21).gte(1) || getBuyableAmount('lo', 22).gte(1) || getBuyableAmount('lo', 23).gte(1); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return D(1.1).pow(x.div(2));
            },
            cost(x) {
                const costs = {
                    stone: D(2).pow(x).times(200),
                    copper_ore: D(1.25).pow(x).times(75),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
            },
            canAfford() {
                if (!(hasUpgrade('o', 33) || hasUpgrade('s', 83))) return false;

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
            value() {
                let base = D(3);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        22: {
            title: 'Copper golem',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = (hasUpgrade('o', 33) || hasUpgrade('s', 83)) ? '' : '<span style="font-weight:bold;color:#FF2400">Requires an anvil</span><br>';
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `${req}\
                Your ${formatWhole(getBuyableAmount(this.layer, this.id))} copper golems\
                divide level costs by ${format(buyableEffect(this.layer, this.id))}\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return hasChallenge('b', 11) || hasUpgrade('o', 33) || getBuyableAmount('lo', 21).gte(1) || getBuyableAmount('lo', 22).gte(1) || getBuyableAmount('lo', 23).gte(1); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return D(1.1).pow(x);
            },
            cost(x) {
                const costs = {
                    stone: D(1.75).pow(x).times(75),
                    copper_ore: D(2).pow(x).times(100),
                    slime_core: D(1.25).pow(x),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
            },
            canAfford() {
                if (!(hasUpgrade('o', 33) || hasUpgrade('s', 83))) return false;

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
            value() {
                let base = D(10);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
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
                const req = hasUpgrade('o', 33) ? '' : '<span style="font-weight:bold;color:#FF2400">Requires an anvil</span><br>';
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `${req}\
                Your ${formatWhole(getBuyableAmount(this.layer, this.id))} tin chests\
                store ${formatWhole(effect.o_keep)} ore upgrades\
                and multiply ore health by ${format(effect.ore_health)}\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return hasChallenge('b', 11) || hasUpgrade('o', 33) || getBuyableAmount('lo', 21).gte(1) || getBuyableAmount('lo', 22).gte(1) || getBuyableAmount('lo', 23).gte(1); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return {
                    o_keep: x,
                    ore_health: x.add(1).root(3),
                };
            },
            cost(x) {
                const costs = {
                    stone: D(1.75).pow(x).times(150),
                    copper_ore: D(1.75).pow(x).times(125),
                    tin_ore: D(2).pow(x).times(5),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
            },
            canAfford() {
                if (!(hasUpgrade('o', 33) || hasUpgrade('s', 83))) return false;

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
            value() {
                let base = D(5);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        // Skeleton
        31: {
            title: 'Brone pickaxe',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} brone pickaxe multiply\
                ore health by ${format(buyableEffect(this.layer, this.id))}\
            ${value}<br><br>\
                Cost: ${cost}`;
            },
            unlocked() { return hasChallenge('b', 11); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return x.div(5).add(1);
            },
            cost(x) {
                const costs = {
                    bone: D(1.7).pow(x).times(5),
                    copper_ore: D(2.5).pow(x).times(150),
                    tin_ore: D(2).pow(x).times(10),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
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

                if (this.canAfford()) style['background-color'] = '#EEEEEE';

                return style;
            },
            value() {
                let base = D(7);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        32: {
            title: 'Slime skull',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime skulls multiply\
                drop chances by ${format(buyableEffect(this.layer, this.id))}\
                ${value}<br><br>\
                Cost: ${cost}`;
            },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return x.div(5).add(1);
            },
            cost(x) {
                const costs = {
                    bone: D(1.7).pow(x).times(5),
                    skull: D(1.25).pow(x),
                    slime_core: D(1.5).pow(x).times(3),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
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

                if (this.canAfford()) style['background-color'] = '#EEEEEE';

                return style;
            },
            value() {
                let base = D(12);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
        33: {
            title: 'Cursed miner',
            display() {
                const cost = Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .map(/**@param {[string, Decimal]}*/([key, cost]) => `${layers.lo.items[key].name} ${format(cost)}`)
                    .join(', ');
                const req = `${tmp.lo.buyables[22].title} ${format(tmp[this.layer].buyables[this.id].requires[22])}`;
                const value = tmp.s.layerShown ? `<br><br>Value: ${format(tmp[this.layer].buyables[this.id].value)}` : '';
                return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} cursed miners multiply\
                ore regeneration speed by ${format(buyableEffect(this.layer, this.id))}\
                ${value}<br><br>\
                Requires: ${req}<br>\
                Cost: ${cost}`;
            },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;
                return D(1.05).pow(x);
            },
            cost(x) {
                const costs = {
                    bone: D(2).pow(x).times(10),
                    skull: D(1.5).pow(x),
                    slime_goo: D(3).pow(x).times(50),
                };

                Object.keys(costs).forEach(/**@param {keyof costs} item*/item => {
                    if (hasUpgrade('s', 61)) costs[item] = costs[item].times(upgradeEffect('s', 61));
                });

                return costs;
            },
            requires(x = getBuyableAmount('lo', 33)) {
                return {
                    22: x,
                };
            },
            canAfford() {
                /** @type {{[k: string]: Decimal}} */
                const items = player.lo.items;
                /** @type {{[k: string]: Decimal}} */
                const cost = tmp[this.layer].buyables[this.id].cost;

                return Object.entries(cost)
                    .every(([k, c]) => items[k].gte(c)) &&
                    getBuyableAmount(this.layer, 22).gte(tmp[this.layer].buyables[this.id].requires[22]);
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

                if (this.canAfford()) style['background-color'] = '#EEEEEE';

                return style;
            },
            value() {
                let base = D(15);

                if (hasUpgrade('s', 82)) base = base.times(getBuyableAmount(this.layer, this.id).max(0).add(2).log(2));

                return base;
            },
        },
    },
    grid: {
        cols: 10,
        rows: 10,
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
            if (item === false || !tmp.lo.items[item].unlocked) return { 'display': 'none' };

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
            if (
                options.chanceMode == 'BELOW 1' ||
                options.chanceMode == 'BELOW 0.5' && chance.lt(.5)
            ) return `1/${format(chance.pow(-1))}`;

            return `${format(chance.times(100))}% chance`;
        },
    },
    /**
     * @type {{
     *  onKill: (type: string, level?: Decimal, chance_mult?: Decimal) => [string, Decimal][],
     *  itemId: (id: number) => string|false,
     *  chanceMult: () => Decimal,
     *  canGet: (type: string) => boolean,
     *  [k: string]: {
     *      chance: Computable<Decimal>,
     *      name: string,
     *      unlocked: Computable<boolean>,
     *      types: Computable<string[]>,
     *      gridStyle: Computable<CSSStyles>,
     *      gridId: number,
     *      debtFree: Computable<boolean>,
     *  },
     * }}
     */
    items: {
        /**
         * @param {string} type
         * @param {Decimal} [level]
         * @param {Decimal} [chance_mult]
         * @returns {[string, Decimal][]}
         */
        onKill(type, level = D.dOne, chance_mult = D.dOne) {
            if (!this.canGet(type)) return [];
            /** @type {{[item: string]: Decimal}} */
            const stored = player.lo.items;
            /** @type {{[item: string]: Decimal}} */
            const looted = {};

            /** @type {string[]} */
            const items = Object.entries(tmp.lo.items)
                .filter(([_, v]) => typeof v != 'function' && 'types' in v && v.types.includes(type) && v.unlocked)
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
                } else if (chance.gt(0)) {
                    rolled.push(item);
                }
            });

            if (rolled.length >= 7) {
                // Fuck it, you're getting a little of everything instead
                rolled.forEach(item => {
                    /** @type {Decimal} */
                    const chance = tmp.lo.items[item].chance.times(chance_mult);
                    looted[item] = (looted[item] ?? D.dZero).add(chance);
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
                    const amount = D(loot.filter(i => i == item).length);
                    looted[item] = (looted[item] ?? D.dZero).add(amount);
                });
            }

            Object.entries(looted).forEach(([item, amount]) => stored[item] = stored[item].add(amount));

            return Object.entries(looted);
        },
        /**
         * @param {number} id
         * @returns {string|false}
         */
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
        chanceMult() {
            let mult = D.dOne;

            mult = mult.times(buyableEffect('lo', 12).chance);
            mult = mult.times(buyableEffect('lo', 32));

            mult = mult.times(tmp.l.skills.looting.effect);

            if (hasUpgrade('s', 51)) mult = mult.times(upgradeEffect('s', 51));
            if (hasUpgrade('s', 73)) mult = mult.times(upgradeEffect('s', 73));
            if (hasUpgrade('s', 72) && hasUpgrade('lo', 11)) mult = mult.times(2);

            return mult;
        },
        /**
         * @param {string} type
         * @returns {boolean}
         */
        canGet(type) {
            if (tmp.lo.deactivated) return false;
            if (type == 'ore') return tmp.o.layerShown;
            return hasUpgrade('lo', 11) || hasUpgrade('s', 72);
        },
        // slime
        slime_goo: {
            chance() {
                let chance = D(1 / 3);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('o', 32)) chance = chance.times(upgradeEffect('o', 32));
                if (hasChallenge('b', 21)) chance = chance.times(2);
                if (hasUpgrade('s', 21)) chance = chance.times(upgradeEffect('s', 21));
                if (upgradeEffect('xp', 43).active) chance = chance.times(upgradeEffect('xp', 43).mult);

                return chance;
            },
            name: 'slime goo',
            unlocked: true,
            types() {
                const types = ['slime'];

                if (upgradeEffect('xp', 43).active) types.push('skeleton');

                return types;
            },
            gridStyle: {
                'background-color': '#7FBF7F',
                'background-image': `url('./resources/images/spill.svg')`,
            },
            gridId: 101,
            debtFree() { return hasUpgrade('s', 21); },
        },
        slime_core_shard: {
            chance() {
                let chance = D(1 / 16);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('o', 32)) chance = chance.times(upgradeEffect('o', 32));
                if (hasChallenge('b', 21)) chance = chance.times(2);
                if (hasUpgrade('s', 22)) chance = chance.times(upgradeEffect('s', 22));
                if (upgradeEffect('xp', 43).active) chance = chance.times(upgradeEffect('xp', 43).mult);

                return chance;
            },
            name: 'slime core shards',
            unlocked: true,
            types() {
                const types = ['slime'];

                if (upgradeEffect('xp', 43).active) types.push('skeleton');

                return types;
            },
            gridStyle: {
                'background-color': '#7FBF7F',
                'background-image': `url('./resources/images/slime_core_shard.svg')`,
            },
            gridId: 102,
            debtFree() { return hasUpgrade('s', 72); },
        },
        slime_core: {
            chance() {
                let chance = D(1 / 125);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('o', 32)) chance = chance.times(upgradeEffect('o', 32));
                if (hasChallenge('b', 21)) chance = chance.times(2);
                if (hasUpgrade('s', 23)) chance = chance.times(upgradeEffect('s', 23));
                if (upgradeEffect('xp', 43).active) chance = chance.times(upgradeEffect('xp', 43).mult);

                return chance;
            },
            name: 'slime cores',
            unlocked: true,
            types() {
                const types = ['slime'];

                if (upgradeEffect('xp', 43).active) types.push('skeleton');

                return types;
            },
            gridStyle: {
                'background-color': '#7FBF7F',
                'background-image': `url('./resources/images/slime_core.svg')`,
            },
            gridId: 103,
            debtFree() { return hasUpgrade('s', 23); },
        },
        // ore
        stone: {
            chance() {
                let chance = D(1 / 4);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('o', 23)) chance = chance.times(upgradeEffect('o', 23));
                if (hasUpgrade('s', 31)) chance = chance.times(upgradeEffect('s', 31));
                if (hasUpgrade('xp', 42)) chance = chance.times(upgradeEffect('xp', 42));

                return chance;
            },
            name: 'stone',
            unlocked() { return tmp.o.layerShown; },
            types: ['ore'],
            gridStyle: {
                'background-image': `url('./resources/images/stone-block.svg')`,
                'background-color': '#BCBCBC',
            },
            gridId: 201,
            debtFree() { return hasUpgrade('s', 31); },
        },
        copper_ore: {
            chance() {
                let chance = D(1 / 27);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('o', 23)) chance = chance.times(upgradeEffect('o', 23));
                if (hasUpgrade('s', 32)) chance = chance.times(upgradeEffect('s', 32));
                if (hasUpgrade('xp', 42)) chance = chance.times(upgradeEffect('xp', 42));

                return chance;
            },
            name: 'copper ore',
            unlocked() { return tmp.o.layerShown; },
            types: ['ore'],
            gridStyle: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#B87333',
            },
            gridId: 202,
            debtFree() { return hasUpgrade('s', 32); },
        },
        tin_ore: {
            chance() {
                let chance = D(1 / 256);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('o', 23)) chance = chance.times(upgradeEffect('o', 23));
                if (hasUpgrade('s', 33)) chance = chance.times(upgradeEffect('s', 33));
                if (hasUpgrade('xp', 42)) chance = chance.times(upgradeEffect('xp', 42));

                return chance;
            },
            name: 'tin ore',
            unlocked() { return tmp.o.layerShown; },
            types: ['ore'],
            gridStyle: {
                'background-image': `url('./resources/images/ore.svg')`,
                'background-color': '#C4BC86',
            },
            gridId: 203,
            debtFree() { return hasUpgrade('s', 33); },
        },
        // skeleton
        bone: {
            chance() {
                let chance = D(1 / 9);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('s', 41)) chance = chance.times(upgradeEffect('s', 41));

                return chance;
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
            debtFree() { return hasUpgrade('s', 41); },
        },
        skull: {
            chance() {
                let chance = D(1 / 64);

                chance = chance.times(tmp.lo.items.chanceMult);
                if (hasUpgrade('s', 42)) chance = chance.times(upgradeEffect('s', 42));

                return chance;
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
            debtFree() { return hasUpgrade('s', 42); },
        },
        // pirate
        soaked_wood: {
            chance() {
                let chance = D(1 / 16);

                chance = chance.times(tmp.lo.items.chanceMult);

                return chance;
            },
            name: 'soaked wood',
            unlocked() { return hasChallenge('b', 12); },
            types: ['pirate'],
            gridStyle: {
                'background-image': `url('./resources/images/wood-beam.svg')`,
                'background-color': '#DEB887',
            },
            gridId: 401,
        },
        cloth: {
            chance() {
                let chance = D(1 / 125);

                chance = chance.times(tmp.lo.items.chanceMult);

                return chance;
            },
            name: 'cloth',
            unlocked() { return hasChallenge('b', 12); },
            types: ['pirate'],
            gridStyle: {
                'background-image': `url('./resources/images/rolled-cloth.svg')`,
                'background-color': '#DEB887',
            },
            gridId: 402,
        },
        pirate_hat: {
            chance() {
                let chance = D(1 / 1296);

                chance = chance.times(tmp.lo.items.chanceMult);

                return chance;
            },
            name: 'pirate hat',
            unlocked() { return hasChallenge('b', 12); },
            types: ['pirate'],
            gridStyle: {
                'background-image': `url('./resources/images/pirate-hat.svg')`,
                'background-color': '#DEB887',
            },
            gridId: 403,
        },
    },
    // Only for doReset
    type: 'static',
    baseAmount() { return D.dZero; },
    requires: D.dOne,
    branches: ['xp', 'o'],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = ['shown'];

        layerDataReset(this.layer, keep);
    },
});
