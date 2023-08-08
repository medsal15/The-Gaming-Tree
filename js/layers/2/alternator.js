'use strict';

addLayer('a', {
    name: 'alternator',
    symbol: 'A',
    /** @returns {Player['a']} */
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
        };
    },
    layerShown() { return hasChallenge('b', 22) && !inChallenge('b', 31); },
    tooltip() { return `${formatWhole(player.lo.items.stardust.amount)} stardust`; },
    color: '#773377',
    nodeStyle: {
        'background-image': 'linear-gradient(to right, #0044BB, #EE2233)',
        'background-origin': 'border-box',
    },
    row: 2,
    position: 2,
    hotkeys: [
        {
            key: 'A',
            description: 'Shift + A: Display alternator layer',
            unlocked() { return tmp.s.layerShown; },
            onPress() { showTab('a'); },
        },
    ],
    tabFormat: {
        'Alteration': {
            content: [
                [
                    'display-text',
                    () => `You have <span style="color:${tmp.xp.enemies.star.color};text-shadow:${tmp.xp.enemies.star.color} 0 0 10px;font-size:1.5em;">\
                        ${formatWhole(player.lo.items.stardust.amount)}</span> ${capitalize(tmp.lo.items.stardust.name)}\
                        </span>`
                ],
                'blank',
                ['display-text', `<span style="color:#AA5555;">Alternating a layer will radically change its function and effects</span>`],
                ['display-text', `<span style="color:#AA5555;">Alternating a layer will increase the cost to alternate other layers</span>`],
                ['upgrade-tree', [
                    [11, 12, 13, 14],
                    [21, 22, 23, 24],
                    [31, 32, 33, 34],
                    [44],
                    [54],
                ]],
            ],
            buttonStyle: {
                'border-image-source': 'linear-gradient(to right, #0044BB, #EE2233)',
                'border-image-slice': '1',
            },
        },
    },
    /** @type {Layers['a']['upgrades']} */
    upgrades: {
        11: {
            title: 'Alternate XP',
            description: 'Not Yet Implemented',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.xp.color;
                }

                return style;
            },
            branches: [21, 22],
            canAfford: false,
        },
        12: {
            title: 'Alternate Mining',
            description: 'Not Yet Implemented',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.m.color;
                }

                return style;
            },
            branches: [22],
            canAfford: false,
        },
        13: {
            title: 'Alternate Tree',
            description: 'Not Yet Implemented',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.t.color;
                }

                return style;
            },
            branches: [23],
            canAfford: false,
        },
        14: {
            title: 'Alternate Achievements',
            cost: D.dZero,
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {
                    'height': '90px',
                    'width': '90px',
                    'min-height': 'unset',
                };

                if (hasUpgrade(this.layer, this.id)) {
                    style['background-color'] = tmp.fai.color;
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    style['background-image'] = `linear-gradient(to right, ${tmp.ach.color}, ${tmp.fai.color})`;
                    style['background-origin'] = `border-box`;
                } else {
                    style['background-color'] = tmp.ach.color;
                }

                return style;
            },
        },
        21: {
            title: 'Alternate Levels',
            description: 'Not Yet Implemented<br>Requires all 1st row layer alternates',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.l.color;
                }

                return style;
            },
            canAfford() { return [11, 12, 13].every(id => hasUpgrade('a', id)); },
            branches: [31],
        },
        22: {
            title: 'Alternate Loot',
            description: 'Not Yet Implemented<br>Requires all 1st row layer alternates',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.lo.color;
                }

                return style;
            },
            canAfford() { return [11, 12, 13].every(id => hasUpgrade('a', id)); },
            branches: [32],
        },
        23: {
            title: 'Alternate Forge',
            description: 'Not Yet Implemented<br>Requires all 1st row layer alternates',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.f.color;
                }

                return style;
            },
            canAfford() { return [11, 12, 13].every(id => hasUpgrade('a', id)); },
            branches: [33],
        },
        24: {
            title: 'Alternate Clock',
            description: 'Not Yet Implemented',
            cost: D.dTwo,
            item: 'stardust',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {
                    'height': '90px',
                    'width': '90px',
                    'min-height': 'unset',
                };

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.clo.color;
                }

                return style;
            },
            unlocked() { return tmp.clo.layerShown; },
        },
        31: {
            title: 'Alternate Bosses',
            description: 'Not Yet Implemented<br>Requires all 2nd row layer alternates',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.b.color;
                }

                return style;
            },
            canAfford() { return [21, 22, 23].every(id => hasUpgrade('a', id)); },
        },
        32: {
            title: 'Alternate Shop',
            description: 'Not Yet Implemented<br>Requires all 2nd row layer alternates',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.s.color;
                }

                return style;
            },
            canAfford() { return [21, 22, 23].every(id => hasUpgrade('a', id)); },
        },
        33: {
            title: 'Alternate Alternator',
            description: 'Not Yet Implemented<br>Requires all other 3rd row layer alternates',
            cost() { return D.add(player.a.upgrades.filter(id => id % 10 < 4).length, 1); },
            item: 'stardust',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-image'] = tmp.a.nodeStyle['background-image'];
                    style['background-origin'] = tmp.a.nodeStyle['background-origin'];
                }

                return style;
            },
            canAfford() { return [31, 32].every(id => hasUpgrade('a', id)); },
        },
        34: {
            title: 'Alternate Casino',
            description: 'Not Yet Implemented',
            cost: D(4),
            item: 'stardust',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {
                    'height': '90px',
                    'width': '90px',
                    'min-height': 'unset',
                };

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.cas.color;
                }

                return style;
            },
            unlocked() { return tmp.cas.layerShown; },
        },
        44: {
            title: 'Alternate Magic',
            description: 'Not Yet Implemented',
            cost: D(6),
            item: 'stardust',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {
                    'height': '90px',
                    'width': '90px',
                    'min-height': 'unset',
                };

                if (hasUpgrade(this.layer, this.id)) {
                    //todo
                } else if (canAffordUpgrade(this.layer, this.id)) {
                    //todo
                } else {
                    style['background-color'] = tmp.mag.color;
                }

                return style;
            },
            unlocked() { return tmp.mag.layerShown; },
        },
        //todo 54
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['upgrades'];

        layerDataReset(this.layer, keep);
    },
    branches: ['f'],
});
