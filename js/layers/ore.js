addLayer('o', {
    name: 'Mining',
    symbol: 'M',
    deactivated() { return inChallenge('b', 21); },
    startData() {
        return {
            unlocked: true,
            points: D(0),
            health: tmp.o?.oreHealth ?? D(10),
            last_drops: [],
        };
    },
    tooltip() {
        return `${formatWhole(player.lo.items.stone)} stone<br>${formatWhole(player.lo.items.copper_ore)} copper ore<br>${formatWhole(player.lo.items.tin_ore)} tin ore`;
    },
    layerShown() { return !tmp[this.layer].deactivated && (inChallenge('b', 11) || hasChallenge('b', 11)); },
    color: '#BCBCBC',
    row: 0,
    position: 1,
    hotkeys: [
        {
            key: 'M',
            description: 'Shift + M: Display mining layer',
            unlocked() { return tmp.o.layerShown; },
            onPress() { if (tmp.o.layerShown) showTab('o'); },
        },
    ],
    tabFormat: {
        'Mine': {
            content: [
                [
                    'display-text',
                    () => `You have <span style="color:#BCBCBC;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items.stone)}</span> stone,
                        <span style="color:#B87333;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items.copper_ore)}</span> copper ore and
                        <span style="color:#C4BC86;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items.tin_ore)}</span> tin ore`
                ],
                'blank',
                ['bar', 'health'],
                ['clickables', [1]],
                ['display-text', () => {
                    let text = 'Mining dropped ';
                    if (!player.o.last_drops.length) text += 'nothing';
                    else
                        text += new Intl.ListFormat('en').format(player.o.last_drops.map/**@param {[string, Decimal]}*/(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));

                    return text;
                }],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => `You have <span style="color:#BCBCBC;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items.stone)}</span> stone,
                        <span style="color:#B87333;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items.copper_ore)}</span> copper ore and
                        <span style="color:#C4BC86;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items.tin_ore)}</span> tin ore`
                ],
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
        },
    },
    upgrades: {
        11: {
            title: 'Stone pickaxe',
            description: 'Double ore health',
            effect() { return D(2); },
            unlocked() { return tmp.o.layerShown; },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#BCBCBC';

                return style;
            },
            cost: D(10),
            currencyDisplayName: 'stone',
            currencyInternalName: 'stone',
            currencyLocation() { return player.lo.items; },
        },
        12: {
            title: 'Copper pickaxe',
            description() {
                if (!shiftDown) {
                    return 'Ore health boosts ore health regeneration';
                }
                let formula = '2√(ore health + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return player.o.health.max(0).add(1).root(2); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 11) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#B87333';

                return style;
            },
            cost: D(3),
            currencyDisplayName: 'copper ore',
            currencyInternalName: 'copper_ore',
            currencyLocation() { return player.lo.items; },
        },
        13: {
            title: 'Tin pickaxe',
            description() {
                if (!shiftDown) {
                    return 'Enemy max health boosts ore health';
                }
                let formula = 'log10(enemy max health + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return tmp.xp.enemyHealth.max(0).add(10).log(10); },
            effectDisplay() { return `Ore max health *${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 12) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#C4BC86';

                return style;
            },
            cost: D(1),
            currencyDisplayName: 'tin ore',
            currencyInternalName: 'tin_ore',
            currencyLocation() { return player.lo.items; },
        },
        21: {
            title: 'A bag of stones',
            description() {
                if (!shiftDown) {
                    return 'The more stone, the more damage';
                }
                let formula = 'log5(stone / 10 + 5)';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.stone.max(0).div(10).add(5).log(5); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 11) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#BCBCBC';

                return style;
            },
            cost: D(50),
            currencyDisplayName: 'stone',
            currencyInternalName: 'stone',
            currencyLocation() { return player.lo.items; },
        },
        22: {
            title: 'Copper drill',
            description: 'Automatically mine the whole ore\'s health when it\'s full',
            unlocked() { return hasUpgrade('o', 21) || hasUpgrade('o', 12) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#B87333';

                return style;
            },
            cost: D(15),
            currencyDisplayName: 'copper ore',
            currencyInternalName: 'copper_ore',
            currencyLocation() { return player.lo.items; },
        },
        23: {
            title: 'Tin minecart',
            description() {
                if (!shiftDown) {
                    return 'Tin ores boost ore drops';
                }
                let formula = '2√(tin ore + 3)';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.tin_ore.max(0).add(3).root(2); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 22) || hasUpgrade('o', 13) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#C4BC86';

                return style;
            },
            cost: D(5),
            currencyDisplayName: 'tin ore',
            currencyInternalName: 'tin_ore',
            currencyLocation() { return player.lo.items; },
        },
        31: {
            title: 'Carry a big boulder',
            description() {
                if (!shiftDown) {
                    return 'Stone boosts skill speed';
                }
                let formula = '2√(log10(stone + 10))';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.stone.max(0).add(10).log10().root(2); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 21) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#BCBCBC';

                return style;
            },
            cost: D(250),
            currencyDisplayName: 'stone',
            currencyInternalName: 'stone',
            currencyLocation() { return player.lo.items; },
        },
        32: {
            title: 'Non-stick frying pan',
            description() {
                if (!shiftDown) {
                    return 'Copper ores boost slime drops';
                }
                let formula = '2√(copper ore) / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.copper_ore.max(0).root(2).div(10).add(1); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 31) || hasUpgrade('o', 22) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#B87333';

                return style;
            },
            cost: D(75),
            currencyDisplayName: 'copper ore',
            currencyInternalName: 'copper_ore',
            currencyLocation() { return player.lo.items; },
        },
        33: {
            title: 'Tin anvil',
            description() {
                if (!shiftDown) {
                    let unlock_text = '';
                    if (!hasUpgrade('s', 83)) unlock_text = 'Unlock new craftable items<br>';
                    return `${unlock_text}Ore upgrades boost ore health`;
                }
                let formula = '2√(ore upgrades)';
                if (hasUpgrade('s', 83)) formula += ' * 2';

                return `Formula: ${formula}`;
            },
            effect() {
                let base = D.root(player.o.upgrades.length, 2).max(1);
                if (hasUpgrade('s', 83)) base = base.times(2);
                return base;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasUpgrade('o', 32) || hasUpgrade('o', 23) || hasChallenge('b', 11); },
            style() {
                const row = Math.floor(this.id / 10);
                const col = this.id % 10;
                const upgrades = Object.keys(layers.o.upgrades).filter(n => !isNaN(n) && (tmp.o.upgrades[n].unlocked ?? true)).map(n => +n);

                const below = upgrades.some(id => id > this.id && id % 10 == col);
                const right = upgrades.some(id => id > this.id && Math.floor(id / 10) == row);
                const above = upgrades.some(id => id < this.id && id % 10 == col);
                const left = upgrades.some(id => id < this.id && Math.floor(id / 10) == row);

                const style = {
                    'border-top-left-radius': left || above ? '0' : '10px',
                    'border-top-right-radius': right || above ? '0' : '10px',
                    'border-bottom-left-radius': left || below ? '0' : '10px',
                    'border-bottom-right-radius': right || below ? '0' : '10px',
                };
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) style['background-color'] = '#C4BC86';

                return style;
            },
            cost: D(25),
            currencyDisplayName: 'tin ore',
            currencyInternalName: 'tin_ore',
            currencyLocation() { return player.lo.items; },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/pickaxe.svg')` },
            canClick() { return player.o.health.gte(1); },
            onClick() {
                player.o.health = player.o.health.minus(1);
                player.o.last_drops = layers.lo.items.onKill('ore', D.dOne, D.dOne);
            },
            onHold() {
                player.o.health = player.o.health.minus(1);
                player.o.last_drops = layers.lo.items.onKill('ore', D.dOne, D.dOne);
            },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.o.oreHealth;
                return player.o.health.div(max);
            },
            display() { return `${format(player.o.health.floor())} / ${format(tmp.o.oreHealth.floor())}`; },
            textStyle: { 'color': 'black' },
            baseStyle: { 'background-color': 'red' },
        },
    },
    oreHealth() {
        let health = D(10);

        if (hasUpgrade('o', 11)) health = health.times(upgradeEffect('o', 11));
        if (hasUpgrade('o', 13)) health = health.times(upgradeEffect('o', 13));
        if (hasUpgrade('o', 33)) health = health.times(upgradeEffect('o', 33));
        health = health.times(buyableEffect('lo', 23).ore_health);
        health = health.times(buyableEffect('lo', 31));
        if (hasUpgrade('s', 63)) health = health.times(upgradeEffect('s', 63));

        return health;
    },
    update(diff) {
        if (player.o.health.lt(tmp.o.oreHealth)) {
            let regen = D(diff);

            if (hasUpgrade('o', 12)) regen = regen.times(upgradeEffect('o', 12));
            regen = regen.times(buyableEffect('lo', 33));
            regen = regen.times(tmp.l.skills.mining.effect);
            if (hasUpgrade('s', 63)) regen = regen.times(upgradeEffect('s', 63));
            if (hasUpgrade('s', 83)) regen = regen.times(upgradeEffect('s', 83));

            player.o.health = player.o.health.add(regen).min(tmp.o.oreHealth);
        }
    },
    automate() {
        if (hasUpgrade('o', 22) && player.o.health.gte(tmp.o.oreHealth)) {
            /** @type {Decimal} */
            const mined = player.o.health.floor();

            player.o.last_drops = layers.lo.items.onKill('ore', D.dOne, mined);
            player.o.health = player.o.health.minus(mined);
        }
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = [];

        /** @type {number[]} */
        let kept_upgrades = [];
        /** @type {Decimal} */
        let kept_amount = buyableEffect('lo', 23).o_keep;
        if (kept_amount.gt(0)) kept_upgrades = [...player.o.upgrades];
        if (kept_amount.lt(kept_upgrades.length)) kept_upgrades.length = kept_amount.toNumber();

        layerDataReset(this.layer, keep);

        ['stone', 'copper_ore', 'tin_ore'].forEach(item => player.lo.items[item] = D.dZero);

        player.o.upgrades = [...kept_upgrades];
    },
    type: 'none',
});
