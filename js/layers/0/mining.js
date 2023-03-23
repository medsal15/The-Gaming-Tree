'use strict';

addLayer('m', {
    name: 'Mining',
    symbol: 'M',
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
            /** @type {(color: string, amount: Decimal) => string} */
            const style = (color, amount) => `<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(amount)}</span>`,
                pieces = [
                    style('#BBBBBB', player.lo.items.stone.amount),
                    style('#BB7733', player.lo.items.copper_ore.amount),
                    style('#CCBB88', player.lo.items.tin_ore.amount),
                ];

            return pieces.join(' | ');
        } else {
            const line = item => `${formatWhole(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`,
                pieces = [
                    line('stone'),
                    line('copper_ore'),
                    line('tin_ore'),
                ];

            return pieces.join('<br>');
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
                    /** @type {(color: string, text: string) => string} */
                    const style = (color, text) => `<span style="color:${color};text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${text}</span>`;
                    return `You have ${style('#BBBBBB', formatWhole(player.lo.items.stone.amount))} ${tmp.lo.items.stone.name}, \
                    ${style('#BB7733', formatWhole(player.lo.items.copper_ore.amount))} ${tmp.lo.items.copper_ore.name}, and\
                    ${style('#CCBB88', formatWhole(player.lo.items.tin_ore.amount))} ${tmp.lo.items.tin_ore.name}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['m', 'short_mode']]
                ]],
                'blank',
                ['bar', 'health'],
                ['clickables', [1]],
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
                    /** @type {(color: string, text: string) => string} */
                    const style = (color, text) => `<span style="color:${color};text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${text}</span>`;
                    return `You have ${style('#BBBBBB', formatWhole(player.lo.items.stone.amount))} stone, \
                    ${style('#BB7733', formatWhole(player.lo.items.copper_ore.amount))} copper ore, and\
                    ${style('#CCBB88', formatWhole(player.lo.items.tin_ore.amount))} tin ore.`;
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
    },
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
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
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
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
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
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
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
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
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
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
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
                if (!shiftDown) return 'Allow crafting items with ores<br>Tin boosts max ore health';

                let formula = '5√(tin ore)';

                return `Formula: ${formula}`;
            },
            effect() { return player.lo.items.tin_ore.amount.root(5); },
            effectDisplay() { return `+${format(this.effect())}`; },
            cost: D(9),
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
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

            health = health.times(buyableEffect('lo', 21));

            return health;
        },
        regen() {
            let regen = D.dOne;

            if (hasUpgrade('m', 23)) regen = regen.times(upgradeEffect('m', 23));

            return regen;
        },
        chance() {
            let chance = D(1 / 10);

            if (hasUpgrade('m', 12)) chance = chance.times(upgradeEffect('m', 12));
            if (hasUpgrade('m', 32) && hasUpgrade('m', 13)) chance = chance.times(upgradeEffect('m', 13));

            chance = chance.times(buyableEffect('lo', 22));
            chance = chance.times(buyableEffect('lo', 23).chance_mult);

            return chance.min(1);
        },
        mode(mode) {
            switch (mode) {
                default:
                case 'shallow':
                    return '';
            };
        },
        get_drops(amount) {
            const drops = layers.lo.items["*"].get_drops(`mining:${player.m.mode}`, D(amount));

            if (hasUpgrade('m', 32)) {
                const stone = drops.reduce((sum, [, amount]) => D.add(sum, amount), D.dZero),
                    entry = drops.find(([item]) => item == 'stone') ?? false;
                if (entry) entry[1] = stone;
                else drops.push(['stone', stone]);
            }

            return drops;
        },
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
