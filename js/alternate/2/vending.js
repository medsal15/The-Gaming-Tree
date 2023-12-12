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
                //todo display table of item/upgrade rows & times
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
            ],
        },
    },
    clickables: {
        //todo sell
    },
    upgrades: {
        11: {
            rarity: 'common',
            title() { return rarity_color(this.rarity, 'Softer Gloves'); },
            description: 'Taming progress is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            unlocked() { return player.v.entries[this.rarity].upgrades.includes(this.id) || hasUpgrade(this.layer, this.id); },
        },
        12: {
            rarity: 'common',
            title() { return rarity_color(this.rarity, 'Promotions'); },
            description: 'City production and consumption is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            unlocked() { return player.v.entries[this.rarity].upgrades.includes(this.id) || hasUpgrade(this.layer, this.id); },
        },
        13: {
            rarity: 'common',
            title() { return rarity_color(this.rarity, 'Fertilizer'); },
            description: 'Plant harvest yield is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            unlocked() { return player.v.entries[this.rarity].upgrades.includes(this.id) || hasUpgrade(this.layer, this.id); },
        },
        14: {
            rarity: 'common',
            title() { return rarity_color(this.rarity, 'Small Cooler'); },
            description: 'Cold production is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            unlocked() { return player.v.entries[this.rarity].upgrades.includes(this.id) || hasUpgrade(this.layer, this.id); },
        },
        15: {
            rarity: 'common',
            title() { return rarity_color(this.rarity, 'Older Coins'); },
            description: 'Coing gain is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            unlocked() { return player.v.entries[this.rarity].upgrades.includes(this.id) || hasUpgrade(this.layer, this.id); },
        },
        //todo
    },
    rarities: {
        '*': {
            amount_mult() { return D.dOne; },
        },
        common: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D(5),
                max: D.dTen,
            },
            color: '#777777',
        },
        uncommon: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D(3),
                max: D(8),
            },
            color: '#228800',
        },
        rare: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D.dOne,
                max: D(4),
            },
            color: '#4488CC',
        },
        epic: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D.dZero,
                max: D.dTwo,
            },
            color: '#FFBB22',
        },
        legendary: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D.dNegOne,
                max: D.dOne,
            },
            color: '#AA55FF',
        },
    },
    items: {
        '*': {
            amount_mult() { return D.dOne; },
            cost_mult() { return D.dOne; },
        },
        //todo add a few duplicates (and more items!)
        //#region Common
        slime_goo: {
            merch: {
                type: 'item',
                item: 'slime_goo',
            },
            rarity: 'common',
            amount: {
                max: D(100),
                min: D(50),
            },
            cost: {
                min: D(.5),
                max: D(1.5),
            },
        },
        slime_core_shard: {
            merch: {
                type: 'item',
                item: 'slime_core_shard',
            },
            rarity: 'common',
            amount: {
                max: D(75),
                min: D(40),
            },
            cost: {
                min: D.dOne,
                max: D(2.5),
            },
        },
        slime_core: {
            merch: {
                type: 'item',
                item: 'slime_core',
            },
            rarity: 'common',
            amount: {
                max: D(50),
                min: D(25),
            },
            cost: {
                min: D.dTwo,
                max: D(4),
            },
        },
        stone: {
            merch: {
                type: 'item',
                item: 'stone',
            },
            rarity: 'common',
            amount: {
                max: D(90),
                min: D(70),
            },
            cost: {
                min: D.dTwo,
                max: D(5),
            },
        },
        copper_ore: {
            merch: {
                type: 'item',
                item: 'copper_ore',
            },
            rarity: 'common',
            amount: {
                max: D(70),
                min: D(50),
            },
            cost: {
                min: D(5),
                max: D(15),
            },
        },
        tin_ore: {
            merch: {
                type: 'item',
                item: 'tin_ore',
            },
            rarity: 'common',
            amount: {
                max: D(50),
                min: D(30),
            },
            cost: {
                min: D(5),
                max: D(25),
            },
        },
        normal_log: {
            merch: {
                type: 'item',
                item: 'normal_log',
            },
            rarity: 'common',
            amount: {
                max: D(100),
                min: D(50),
            },
            cost: {
                min: D(1.5),
                max: D(3),
            },
        },
        wheat: {
            merch: {
                type: 'item',
                item: 'wheat',
            },
            rarity: 'common',
            amount: {
                max: D(50),
                min: D(25),
            },
            cost: {
                min: D.dTwo,
                max: D(5),
            },
        },
        corn: {
            merch: {
                type: 'item',
                item: 'corn',
            },
            rarity: 'common',
            amount: {
                max: D(50),
                min: D(15),
            },
            cost: {
                min: D(3),
                max: D(9),
            },
        },
        water: {
            merch: {
                type: 'item',
                item: 'water',
            },
            rarity: 'common',
            amount: {
                max: D(150),
                min: D(100),
            },
            cost: {
                min: D.dOne,
                max: D.dTwo,
            },
        },
        //#endregion Common
        //#region Uncommon
        red_fabric: {
            merch: {
                type: 'item',
                item: 'red_fabric',
            },
            rarity: 'uncommon',
            amount: {
                max: D(90),
                min: D(60),
            },
            cost: {
                min: D.dOne,
                max: D.dTwo,
            },
        },
        pyrite_coin: {
            merch: {
                type: 'item',
                item: 'pyrite_coin',
            },
            rarity: 'uncommon',
            amount: {
                max: D(70),
                min: D(45),
            },
            cost: {
                min: D.dTwo,
                max: D(5),
            },
        },
        rusty_gear: {
            merch: {
                type: 'item',
                item: 'rusty_gear',
            },
            rarity: 'uncommon',
            amount: {
                max: D(50),
                min: D(30),
            },
            cost: {
                min: D(3),
                max: D(7),
            },
        },
        coal: {
            merch: {
                type: 'item',
                item: 'coal',
            },
            rarity: 'uncommon',
            amount: {
                max: D(70),
                min: D(35),
            },
            cost: {
                min: D.dOne,
                max: D(4),
            },
        },
        iron_ore: {
            merch: {
                type: 'item',
                item: 'iron_ore',
            },
            rarity: 'uncommon',
            amount: {
                max: D(50),
                min: D(30),
            },
            cost: {
                min: D(10),
                max: D(20),
            },
        },
        gold_ore: {
            merch: {
                type: 'item',
                item: 'gold_ore',
            },
            rarity: 'uncommon',
            amount: {
                max: D(30),
                min: D(5),
            },
            cost: {
                min: D(20),
                max: D(50),
            },
        },
        plank: {
            merch: {
                type: 'item',
                item: 'plank',
            },
            rarity: 'uncommon',
            amount: {
                max: D(75),
                min: D(50),
            },
            cost: {
                min: D(2),
                max: D(4),
            },
        },
        strawberry: {
            merch: {
                type: 'item',
                item: 'strawberry',
            },
            rarity: 'uncommon',
            amount: {
                max: D(75),
                min: D(60),
            },
            cost: {
                min: D.dOne,
                max: D(5),
            },
        },
        potato: {
            merch: {
                type: 'item',
                item: 'potato',
            },
            rarity: 'uncommon',
            amount: {
                max: D(60),
                min: D(45),
            },
            cost: {
                min: D.dOne,
                max: D(3),
            },
        },
        //#endregion Uncommon
        //#region Rare
        rotten_flesh: {
            merch: {
                type: 'item',
                item: 'rotten_flesh',
            },
            rarity: 'rare',
            amount: {
                max: D(80),
                min: D(50),
            },
            cost: {
                min: D(.5),
                max: D.dTwo,
            },
        },
        brain: {
            merch: {
                type: 'item',
                item: 'brain',
            },
            rarity: 'rare',
            amount: {
                max: D(40),
                min: D(20),
            },
            cost: {
                min: D(5),
                max: D(25),
            },
        },
        stone_brick: {
            merch: {
                type: 'item',
                item: 'stone_brick',
            },
            rarity: 'rare',
            amount: {
                max: D(60),
                min: D(50),
            },
            cost: {
                min: D(4),
                max: D(10),
            },
        },
        copper_ingot: {
            merch: {
                type: 'item',
                item: 'copper_ingot',
            },
            rarity: 'rare',
            amount: {
                max: D(50),
                min: D(30),
            },
            cost: {
                min: D(15),
                max: D(45),
            },
        },
        tin_ingot: {
            merch: {
                type: 'item',
                item: 'tin_ingot',
            },
            rarity: 'rare',
            amount: {
                max: D(30),
                min: D(20),
            },
            cost: {
                min: D(15),
                max: D(75),
            },
        },
        ice: {
            merch: {
                type: 'item',
                item: 'ice',
            },
            rarity: 'rare',
            amount: {
                max: D(50),
                min: D(53),
            },
            cost: {
                min: D(10),
                max: D(25),
            },
        },
        eggplant: {
            merch: {
                type: 'item',
                item: 'eggplant',
            },
            rarity: 'rare',
            amount: {
                max: D(50),
                min: D(30),
            },
            cost: {
                min: D.dTwo,
                max: D(5),
            },
        },
        egg: {
            merch: {
                type: 'item',
                item: 'egg',
            },
            rarity: 'rare',
            amount: {
                max: D(30),
                min: D(15),
            },
            cost: {
                min: D(9),
                max: D(19),
            },
        },
        oil: {
            merch: {
                type: 'item',
                item: 'oil',
            },
            rarity: 'rare',
            amount: {
                max: D(300),
                min: D(150),
            },
            cost: {
                min: D(6),
                max: D(16),
            },
        },
        //#endregion Rare
        //#region Epic
        leaf: {
            merch: {
                type: 'item',
                item: 'leaf',
            },
            rarity: 'epic',
            amount: {
                max: D(60),
                min: D(40),
            },
            cost: {
                min: D(5),
                max: D(25),
            },
        },
        seed: {
            merch: {
                type: 'item',
                item: 'seed',
            },
            rarity: 'epic',
            amount: {
                max: D(40),
                min: D(20),
            },
            cost: {
                min: D(10),
                max: D(40),
            },
        },
        iron_ingot: {
            merch: {
                type: 'item',
                item: 'iron_ingot',
            },
            rarity: 'epic',
            amount: {
                max: D(30),
                min: D(20),
            },
            cost: {
                min: D(30),
                max: D(60),
            },
        },
        gold_ingot: {
            merch: {
                type: 'item',
                item: 'gold_ingot',
            },
            rarity: 'epic',
            amount: {
                max: D(20),
                min: D.dTwo,
            },
            cost: {
                min: D(60),
                max: D(150),
            },
        },
        icestone: {
            merch: {
                type: 'item',
                item: 'icestone',
            },
            rarity: 'epic',
            amount: {
                max: D(20),
                min: D(5),
            },
            cost: {
                min: D(15),
                max: D(25),
            },
        },
        //#endregion Epic
        //#region Legendary
        stardust: {
            merch: {
                type: 'item',
                item: 'stardust',
            },
            rarity: 'legendary',
            amount: {
                max: D(2),
                min: D(1),
            },
            cost: {
                min: D(100),
                max: D(200),
            },
        },
        rust_ingot: {
            merch: {
                type: 'item',
                item: 'rust_ingot',
            },
            rarity: 'legendary',
            amount: {
                max: D(25),
                min: D(15),
            },
            cost: {
                min: D(50),
                max: D(70),
            },
        },
        steel_ingot: {
            merch: {
                type: 'item',
                item: 'steel_ingot',
            },
            rarity: 'legendary',
            amount: {
                max: D(15),
                min: D(5),
            },
            cost: {
                min: D(75),
                max: D(125),
            },
        },
        bronze_ingot: {
            merch: {
                type: 'item',
                item: 'bronze_ingot',
            },
            rarity: 'legendary',
            amount: {
                max: D(25),
                min: D(15),
            },
            cost: {
                min: D(50),
                max: D(100),
            },
        },
        //#endregion Legendary
    },
    //todo time
    //todo update
    //todo automate
    type: 'none',
    branches: ['k'],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        layerDataReset(this.layer, ['upgrades']);
    },
});
