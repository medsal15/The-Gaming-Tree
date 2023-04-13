'use strict';

//todo coal upgrades
//todo gold upgrades
addLayer('m', {
    name: 'Mining',
    symbol: 'M',
    /** @returns {typeof player.m} */
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            health: null ?? D(10),
            short_mode: false,
            last_drops: [],
            mode: 'shallow',
        };
    },
    tooltip() {
        if (player.m.short_mode) {
            const style = item => {
                const color = tmp.lo.items[item].style['background-color'];
                return `<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(player.lo.items[item].amount)}</span>`;
            };

            return layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(style).join(', ');
        } else {
            const line = item => `${formatWhole(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`;

            return layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(line).join('<br>');
        }
    },
    layerShown() { return (hasChallenge('b', 11) || inChallenge('b', 11)) && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#DDDDDD',
    row: 0,
    position: 1,
    resource: 'ores',
    hotkeys: [
        {
            key: 'M',
            description: 'Shift + M: Display mining layer',
            unlocked() { return tmp.m.layerShown; },
            onPress() { showTab('m'); },
        },
    ],
    tabFormat: {
        'Mining': {
            content: [
                () => {
                    const speed = layers.clo.time_speed('m');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'];
                        return `<span style="color:${color};text-shadow:${color} 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items[item].amount)}</span> ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['m', 'short_mode']]
                ]],
                'blank',
                ['bar', 'health'],
                ['clickables', [1]],
                () => { if (hasUpgrade('m', 25)) return ['display-text', `Mining ${tmp.m.ore.mode}`]; },
                'blank',
                ['display-text', () => `Chance to mine something: ${layers.lo.items["*"].format_chance(tmp.m.ore.chance)}`],
                ['display-text', () => {
                    let drops = 'nothing';

                    const last_drops = player.m.last_drops;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));

                    return `Mined ${drops}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'];
                        return `<span style="color:${color};text-shadow:${color} 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items[item].amount)}</span> ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['m', 'short_mode']]
                ]],
                'blank',
                'upgrades',
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('m')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    clickables: {
        11: {
            style: {
                'background-image': `url('./resources/images/previous-button.svg')`,
                'transform': 'rotate(90deg)',
            },
            canClick() { return player.m.mode != 'shallow'; },
            onClick() {
                player.m.mode = {
                    'deep': 'shallow',
                }[player.m.mode] ?? 'shallow';
            },
            unlocked() { return hasUpgrade('m', 25); },
        },
        12: {
            style: { 'background-image': `url('./resources/images/pickaxe.svg')`, },
            canClick() { return player.m.health.gte(1); },
            onClick() {
                player.m.health = player.m.health.minus(1);
                if (tmp.m.ore.chance.gt(Math.random())) {
                    const drops = player.m.last_drops = layers.m.ore.get_drops(1);
                    layers.lo.items["*"].gain_drops(drops);
                } else {
                    player.m.last_drops = [];
                }
            },
            onHold() {
                player.m.health = player.m.health.minus(1);
                if (tmp.m.ore.chance.gt(Math.random())) {
                    const drops = player.m.last_drops = layers.m.ore.get_drops(1);
                    layers.lo.items["*"].gain_drops(drops);
                } else {
                    player.m.last_drops = [];
                }
            },
        },
        13: {
            style: {
                'background-image': `url('./resources/images/previous-button.svg')`,
                'transform': 'rotate(-90deg)',
            },
            canClick() { return player.m.mode != 'deep'; },
            onClick() {
                player.m.mode = {
                    'shallow': 'deep',
                }[player.m.mode] ?? 'deep';
            },
            unlocked() { return hasUpgrade('m', 25); },
        },
    },
    /** @type {typeof layers.m.upgrades} */
    upgrades: {
        11: {
            title: 'Stone Pickaxe',
            description: 'Double ore health',
            effect() { return D(2); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(10),
            item: 'stone',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        12: {
            title: 'Copper Pickaxe',
            description() {
                if (!shiftDown) return 'Ore health boosts mining chance';

                let formula = 'log7(ore health + 7)';

                return `Formula: ${formula}`;
            },
            effect() { return player.m.health.add(7).log(7); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(5),
            item: 'copper_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        13: {
            title: 'Tin Pickaxe',
            description() {
                if (!shiftDown) {
                    if (hasUpgrade('m', 32)) return 'Kills boost mining chance';
                    return 'Kills boost ore chances (does not apply to stone)';
                }

                let formula = 'log3(kills + 3)';
                if (hasUpgrade('m', 32)) formula = `2√(${formula})`;

                return `Formula: ${formula}`;
            },
            effect() {
                let effect = tmp.xp.total.kills.add(3).log(3);

                if (hasUpgrade('m', 32)) effect = effect.root(2);

                return effect;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(1),
            item: 'tin_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        15: {
            title: 'Iron Pickaxe',
            description() {
                if (!shiftDown) return 'Kills boost ore health';

                let formula = 'log100(kills + 100)';

                return `Formula: ${formula}`;
            },
            effect() { return tmp.xp.total.kills.add(100).log(100); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(1),
            item: 'iron_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        21: {
            title: 'Stone Sword',
            description() {
                if (!shiftDown) return 'Stone boosts damage';

                let formula = '5√(stone + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.stone.amount.add(1).root(5); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(50),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'stone',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        22: {
            title: 'Copper Drill',
            description: 'Automatically mine the whole ore when it\'s full',
            cost: D(20),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'copper_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        23: {
            title: 'Tin Minecart',
            description() {
                if (!shiftDown) return 'Ore health boosts ore regeneration speed';

                let formula = '7√(ore health + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return player.m.health.add(1).root(7); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(3),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'tin_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        25: {
            title: 'Iron Shaft',
            description: 'Allows deep mining<br>Doubles stone gain',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(5),
            item: 'iron_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        31: {
            title: 'Stone Tablet',
            description() {
                if (!shiftDown) return 'Stone boosts skill speed';

                let formula = 'log10(stone + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.stone.amount.add(10).log10(); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(250),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'stone',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        32: {
            title: 'Copper Filter',
            description() { return `Get as much stone as ores<br>Stop getting stone otherwise<br>${layerColor('m', tmp.m.upgrades[13].title, 'text-shadow:#000 0 0 10px')}\'s effect is changed`; },
            cost: D(80),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'copper_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        33: {
            title: 'Tin Anvil',
            description() {
                if (!shiftDown) {
                    let text = 'Allow crafting items with metals';

                    if (!hasUpgrade('s', 72)) text += '<br>Tin boosts max ore health';

                    return text;
                }

                let formula = '5√(tin ore)';

                if (hasUpgrade('s', 72)) formula = '3√(tin ore)';

                return `Formula: ${formula}`;
            },
            effect() {
                if (!hasUpgrade('s', 72)) return player.lo.items.tin_ore.amount.root(5);

                return player.lo.items.tin_ore.amount.root(3);
            },
            effectDisplay() { return `+${format(this.effect())}`; },
            cost: D(9),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'tin_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        35: {
            title: 'Iron Axe',
            description: 'Unlock a new layer<br>Increase tree damage',
            effect() { return D.dOne; },
            effectDisplay() { return `+${format(this.effect())}`; },
            cost: D(25),
            item: 'iron_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = { 'border-radius': 0, };

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.m.ore.health;
                return D.div(player.m.health ?? max, max);
            },
            display() { return `${format(player.m.health)} / ${format(tmp.m.ore.health)}`; },
            baseStyle: { 'background-color': '#222222', },
            fillStyle: { 'background-color': '#DDDDDD', },
            textStyle: { 'color': 'gray', },
        },
    },
    /** @type {typeof layers.m.ore} */
    ore: {
        health() {
            let health = D(10);

            if (hasUpgrade('m', 33)) health = health.add(upgradeEffect('m', 33));

            if (hasUpgrade('m', 11)) health = health.times(upgradeEffect('m', 11));
            if (hasUpgrade('m', 14)) health = health.times(upgradeEffect('m', 14));

            health = health.times(buyableEffect('lo', 21));

            return health;
        },
        regen() {
            let regen = D.dOne;

            if (hasUpgrade('m', 23)) regen = regen.times(upgradeEffect('m', 23));

            return regen;
        },
        chance(mode = player.m.mode) {
            /** @type {Decimal} */
            let chance;
            switch (mode) {
                default:
                case 'shallow':
                    chance = D(1 / 10);
                    break;
                case 'deep':
                    chance = D(1 / 100);
                    break;
            }

            if (hasUpgrade('m', 12)) chance = chance.times(upgradeEffect('m', 12));
            if (hasUpgrade('m', 32) && hasUpgrade('m', 13)) chance = chance.times(upgradeEffect('m', 13));

            chance = chance.times(buyableEffect('lo', 22));
            chance = chance.times(buyableEffect('lo', 23).chance_mult);

            if (hasUpgrade('s', 61)) chance = chance.root(upgradeEffect('s', 61));
            else chance = chance.min(1);

            return chance;
        },
        mode(mode = player.m.mode) {
            switch (mode) {
                default:
                case 'shallow':
                    return hasUpgrade('m', 25) ? 'shallow' : '';
                case 'deep':
                    return 'deep';
            };
        },
        get_drops(amount) {
            const drops = layers.lo.items["*"].get_drops(`mining:${player.m.mode}`, D(amount));

            if (hasUpgrade('m', 32)) {
                let stone = drops.reduce((sum, [, amount]) => D.add(sum, amount), D.dZero);

                if (inChallenge('b', 12) && !hasUpgrade('s', 31)) stone = stone.div(player.lo.items.stone.amount.add(10).log10());
                if (hasUpgrade('s', 31)) stone = stone.times(upgradeEffect('s', 31));

                const entry = drops.find(([item]) => item == 'stone') ?? false;
                if (entry) entry[1] = stone;
                else drops.push(['stone', stone]);
            }
            if (hasUpgrade('m', 25)) {
                const stone = drops.find(([item]) => item == 'stone');
                if (stone) {
                    stone[1] = stone[1].times(upgradeEffect('m', 25));
                }
            }

            return drops;
        },
        items: [
            'stone', 'copper_ore', 'tin_ore',
            'coal', 'iron_ore', 'gold_ore',
        ],
    },
    update(diff) {
        diff = D.times(diff, layers.clo.time_speed(this.layer));

        if (player.m.health.lt(tmp.m.ore.health)) {
            const regen = tmp.m.ore.regen.times(diff);

            player.m.health = player.m.health.add(regen).min(tmp.m.ore.health);
        }
    },
    automate() {
        if (hasUpgrade('m', 22) && player.m.health.gte(tmp.m.ore.health)) {
            const chance = player.m.health.times(tmp.m.ore.chance),
                drops = player.m.last_drops = layers.m.ore.get_drops(chance);
            layers.lo.items["*"].gain_drops(drops);
            player.m.health = D.dZero;
        }
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = [],
            kept_ups = [...player.m.upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 23).m_hold).toNumber();

        layerDataReset(this.layer, keep);
        ['stone', 'copper_ore', 'tin_ore'].forEach(item => player.lo.items[item].amount = D.dZero);
        player.m.upgrades.push(...kept_ups);
    },
    branches: ['lo'],
});
