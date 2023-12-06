'use strict';

addLayer('v', {
    name: 'Shop?',
    symbol: 'V',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            refresh: {
                specific: D.dZero,
                common: D.dZero,
                uncommon: D.dZero,
                rare: D.dZero,
                epic: D.dZero,
                legendary: D.dZero,
            },
            entries: {
                group: random_dish_group(),
                common: {
                    items: [],
                    upgrades: [],
                },
                uncommon: {
                    items: [],
                    upgrades: [],
                },
                rare: {
                    items: [],
                    upgrades: [],
                },
                epic: {
                    items: [],
                    upgrades: [],
                },
                legendary: {
                    items: [],
                    upgrades: [],
                },
            }
        };
    },
    nodeStyle: { 'border-radius': '25%', },
    color: '#DDDD22',
    row: 2,
    position: 1.5,
    resource: 'stone coins',
    tooltip() {
        if (player.s.short_mode) {
            /** @type {[string, number][]} */
            const coins = formatCoins(player.s.points, layers.s.coins.types.length).map((c, i) => [c, i]).filter(([c]) => (+c) > 0);
            if (!coins.length) coins.push(['0', 0]);
            return coins.map(([c, i]) => `<span style="color:${layers.s.coins.types[i][1]};">${c}</span>`).join(' | ');
        } else {
            return layers.s.coins.format(player.s.points, false, true).join('<br>');
        }
    },
    layerShown() { return player[this.layer].unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    hotkeys: [
        {
            key: 'v',
            description: 'V: Sell specific food for coins',
            unlocked() { return player.v.unlocked; },
            onPress() {
                //todo
            },
        },
        {
            key: 'V',
            description: 'Shift + V: Display vending machine layer',
            unlocked() { return player.v.unlocked; },
            onPress() { showTab('v'); },
        },
    ],
    tabFormat: {
        'Vending': {
            content: [
                ['display-text', () => `You have ${tmp.s.coins.format}`],
                [
                    'row',
                    [
                        //todo sell all
                        'blank',
                        //todo sell specific
                    ]
                ],
                ['display-text', () => `Your items have ${format(tmp.s.baseAmount)} total value`],
                'blank',
                //todo display rows & times
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => `You have ${tmp.s.coins.format}`],
                [
                    'row',
                    [
                        //todo sell all
                        'blank',
                        //todo sell specific
                    ]
                ],
                ['display-text', () => `Your items have ${format(tmp.s.baseAmount)} total value`],
                'blank',
                //todo display bought upgrades
                //todo display upgrade rarities
            ],
        },
    },
    clickables: {
        //todo sell
    },
    upgrades: {
        //todo
    },
    //todo items
    //todo update
    type: 'none',
    branches: ['k'],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        layerDataReset(this.layer, ['upgrades']);
    },
});
