'use strict';

addLayer('f', {
    name: 'Forge',
    symbol: 'F',
    /** @returns {typeof player.f} */
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            fuels: Object.fromEntries(
                Object.keys(layers.f.fuels)
                    .filter(fuel => fuel != '*')
                    .map(fuel => [fuel, false])
            ),
            recipes: Object.fromEntries(
                Object.keys(layers.f.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => [recipe, {
                        enabled: false,
                        amount_smelting: D.dZero,
                        amount_target: D.dZero,
                        progress: D.dZero,
                    }])
            ),
            alloys: false,
        };
    },
    color() {
        /** @type {[DecimalSource, [number, number, number]][]} */
        const color_points = [
            [1, [0xCC, 0xCC, 0xCC]],
            ['1e20', [0xBB, 0x00, 0x00]],
            ['1e30', [0xFF, 0x00, 0x00]],
            ['1e40', [0xFF, 0xAA, 0x00]],
            ['1e50', [0xFF, 0xFF, 0x00]],
            ['1e70', [0xFF, 0xFF, 0xFF]],
        ],
            i = color_points.findIndex(([n]) => D.gte(n, player.f.points.max(0)));

        if (i == color_points.length - 1 || i == 0) {
            return `#${color_points[i][1].map(n => n.toString(16)).join('')}`;
        }

        const min = D.log10(color_points[i - 1][0]),
            color_min = color_points[i - 1][1],
            max = D.log10(color_points[i][0]),
            color_max = color_points[i][1],
            current = D.log10(player.f.points),
            fraction = current.minus(min).div(max).max(0).min(1).toNumber();

        return `#${Array.from({ length: 3 }, (_, i) => Math.floor(color_max[i] * fraction + color_min[i] * (1 - fraction)).toString(16).padStart(2, '0')).join('')}`;
    },
    row: 1,
    position: 2,
    resource: 'heat',
    layerShown() { return player[this.layer].unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    hotkeys: [
        {
            key: 'F',
            description: 'Shift + F: Display forge layer',
            unlocked() { return player.f.unlocked; },
            onPress() { showTab('f'); },
        },
    ],
    tabFormat: {
        'Forge': {
            content: [
                () => {
                    const speed = layers.clo.time_speed('f');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    let text = `You have ${layerColor('f', format(player.f.points), 'font-size:1.5em;')}`;

                    if (tmp.f.heat.gain.abs().gt(1e-4)) {
                        text += ` (${tmp.f.heat.gain.gt(0) ? '+' : ''}${layerColor('f', format(tmp.f.heat.gain))} /s)`;
                    }

                    text += ' heat.';

                    return text;
                }],
                ['display-text', '<span style="color:#AA5555;">You lose 1% of your heat every second</span>'],
                () => { if (inChallenge('b', 32) && !hasUpgrade('s', 121)) return ['display-text', '(technically 2% because of your challenges)']; },
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
        },
        'Fuel': {
            content: [
                () => {
                    const speed = layers.clo.time_speed('f');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    let text = `You have ${layerColor('f', format(player.f.points), 'font-size:1.5em;')}`;

                    if (tmp.f.heat.gain.abs().gt(1e-4)) {
                        text += ` (${tmp.f.heat.gain.gt(0) ? '+' : ''}${layerColor('f', format(tmp.f.heat.gain))} /s)`;
                    }

                    text += ' heat.';

                    return text;
                }],
                ['display-text', '<span style="color:#AA5555;">You lose 1% of your heat every second</span>'],
                () => { if (inChallenge('b', 32) && !hasUpgrade('s', 121)) return ['display-text', '(technically 2% because of your challenges)']; },
                'blank',
                ['display-text', `<span style="color:#AA5555;">You consume 1% of your fuels to produce heat every second</span>`],
                ['display-text', () => `Your forge's prevents consuming more than ${format(tmp.f.fuels['*'].size)} of each fuel per second`],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.f.fuels)
                        .filter(fuel => fuel != '*')
                        .map(fuel => layers.f.fuels['*'].show_fuel(fuel))
                ],
            ],
        },
        'Smelting': {
            content: [
                () => {
                    const speed = layers.clo.time_speed('f');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    let text = `You have ${layerColor('f', format(player.f.points), 'font-size:1.5em;')}`;

                    if (tmp.f.heat.gain.abs().gt(1e-4)) {
                        text += ` (${tmp.f.heat.gain.gt(0) ? '+' : ''}${layerColor('f', format(tmp.f.heat.gain))} /s)`;
                    }

                    text += ' heat.';

                    return text;
                }],
                ['display-text', '<span style="color:#AA5555;">You lose 1% of your heat every second</span>'],
                () => { if (inChallenge('b', 32) && !hasUpgrade('s', 121)) return ['display-text', '(technically 2% because of your challenges)']; },
                ['display-text', () => `Your heat divides time requirements by ${shiftDown ? `[${tmp.f.heat.speed_formula}]` : format(tmp.f.heat.speed)}`],
                'blank',
                ['display-text', () => `Your forge's prevents producing more than ${format(tmp.f.recipes['*'].size)} of each recipes per second`],
                [
                    'display-text',
                    () => `Hold <span style="${ctrlDown && !shiftDown ? 'text-decoration:underline;' : ''}">control for *10</span>,\
                    <span style="${!ctrlDown && shiftDown ? 'text-decoration:underline;' : ''}">shift for *25</span>,\
                    and <span style="${ctrlDown && shiftDown ? 'text-decoration:underline;' : ''}">both for *250</span>`
                ],
                ['display-text', '<span style="color:#AA5555;">Smelting will only progress as long as there is enough heat</span>'],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.f.recipes)
                        .filter(fuel => fuel != '*')
                        .map(fuel => layers.f.recipes['*'].show_recipe(fuel))
                ],
            ],
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));

        // Lose heat
        if (player.f.points.gt(0)) {
            const loss = player.f.points.div(100).times(diff);

            player.f.points = player.f.points.minus(loss);
        }

        // Consume fuels to produce heat
        Object.keys(layers.f.fuels)
            .filter(fuel => fuel != '*' && (tmp.f.fuels[fuel].unlocked ?? true) && player.f.fuels[fuel])
            .forEach(fuel_id => {
                const fuel = tmp.f.fuels[fuel_id],
                    item_id = fuel.item;

                player.lo.items[item_id].amount = D.minus(player.lo.items[item_id].amount, fuel.consuming.times(diff));
                addPoints('f', fuel.producing.times(diff));
            });

        // Smelt
        Object.keys(layers.f.recipes)
            .filter(recipe => recipe != '*' && player.f.recipes[recipe].amount_smelting.gt(0))
            .forEach(recipe_id => {
                const precipe = player.f.recipes[recipe_id],
                    recipe = tmp.f.recipes[recipe_id];

                // Too cold, no progress
                if (player.f.points.lt(recipe.heat)) return;

                precipe.progress = precipe.progress.add(diff);

                if (precipe.progress.gte(recipe.time)) {
                    player.lo.items[recipe.produces].amount = D.add(player.lo.items[recipe.produces].amount, precipe.amount_smelting);
                    precipe.progress = D.dZero;
                    precipe.amount_smelting = D.dZero;
                }
            });
    },
    automate() {
        // Prevent overflow in some cases
        Object.entries(player.f.recipes)
            .forEach(([id, recipe]) => {
                if (recipe.amount_target.gt(tmp.f.recipes['*'].size)) recipe.amount_target = tmp.f.recipes['*'].size;
            });
    },
    type: 'none',
    branches: ['lo'],
    upgrades: {
        11: {
            title: 'Iron Anvil',
            description() {
                if (!shiftDown) {
                    return `Reduces smeltable crafting costs depending on its depth found<br>\
                        Use their smelted variant for crafting<br>\
                        <span style="color:#AA5555;">Reset ALL affected buyables</span>`;
                }

                let formula = '(depth ^ 2) * 100';

                return `Formula: ${formula}`;
            },
            effect() {
                return {
                    stone_brick: D(1 / 100),
                    copper_ingot: D(1 / 100),
                    tin_ingot: D(1 / 100),
                    coal: D(1 / 200),
                    iron_ingot: D(1 / 200),
                    gold_ingot: D(1 / 200),
                };
            },
            cost: D(25),
            item: 'iron_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            onPurchase() {
                const items = [
                    'stone', 'copper_ore', 'tin_ore',
                    'coal', 'iron_ingot', 'gold_ingot',
                ];

                Object.keys(layers.lo.buyables)
                    .filter(id => !isNaN(id) && items.some(item => item in tmp.lo.buyables[+id].cost))
                    .forEach(id => player.lo.buyables[id] = D.dZero);

                // Reset only once
                if (!player.clo.use_advanced) {
                    Object.keys(layers.clo.buyables)
                        .filter(id => !isNaN(id) && items.some(item => item in tmp.clo.buyables[+id].cost))
                        .forEach(id => player.clo.buyables[id] = D.dZero);
                    player.clo.use_advanced = true;
                }
            },
        },
        12: {
            title: 'Iron Molds',
            description: 'Unlock more advanced materials',
            cost: D(75),
            item: 'iron_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            onPurchase() { player.f.alloys = true; },
        },
        13: {
            title: 'Bronze Platings',
            description: 'Increase fuel and production sizes',
            effect() {
                return {
                    fuel: D(5),
                    recipe: D.dTen,
                };
            },
            effectDisplay() {
                return `+${format(this.effect().fuel)} fuel size, +${format(this.effect().recipe)} production size`;
            },
            cost: D(20),
            item: 'bronze_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
        21: {
            title: 'Bronze Sword',
            description() {
                if (!shiftDown) return 'Bronze ingots boost damage';

                let formula = 'log60(bronze ingots + 60)';

                return `Formula: ${formula}`;
            },
            effect() {
                return D.add(player.lo.items.bronze_ingot.amount, 60).log(60);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost() {
                let cost = D(60);

                cost = cost.times(D(6).pow(player.f.upgrades.filter(id => Math.floor(id / 10) == 2).length));

                return cost;
            },
            item: 'bronze_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
        22: {
            title: 'Bronze Pickaxe',
            description() {
                if (!shiftDown) return 'Bronze ingots boost mining amount';

                let formula = 'log60(bronze ingots + 60)';

                return `Formula: ${formula}`;
            },
            effect() {
                return D.add(player.lo.items.bronze_ingot.amount, 60).log(60);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost() {
                let cost = D(60);

                cost = cost.times(D(6).pow(player.f.upgrades.filter(id => Math.floor(id / 10) == 2).length));

                return cost;
            },
            item: 'bronze_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
        23: {
            title: 'Bronze Axe',
            description() {
                if (!shiftDown) return 'Bronze ingots boost tree size';

                let formula = 'log60(bronze ingots + 60)';

                return `Formula: ${formula}`;
            },
            effect() {
                return D.add(player.lo.items.bronze_ingot.amount, 60).log(60);
            },
            effectDisplay() {
                return `+${format(this.effect())}`;
            },
            cost() {
                let cost = D(60);

                cost = cost.times(D(6).pow(player.f.upgrades.filter(id => Math.floor(id / 10) == 2).length));

                return cost;
            },
            item: 'bronze_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
        31: {
            title: 'Steel Skills',
            description: 'Get a bonus level in every skills',
            effect() { return D.dOne; },
            effectDisplay() {
                return `+${format(this.effect())}`;
            },
            cost() {
                let cost = D(40);

                cost = cost.times(D(4).pow(player.f.upgrades.filter(id => Math.floor(id / 10) == 3).length));

                return cost;
            },
            item: 'steel_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
        32: {
            title: 'Steel Collector',
            description: 'Double item drop amounts',
            cost() {
                let cost = D(40);

                cost = cost.times(D(4).pow(player.f.upgrades.filter(id => Math.floor(id / 10) == 3).length));

                return cost;
            },
            effect() { return D.dTwo; },
            effectDisplay() { return `*${this.effect()}`; },
            item: 'steel_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
        33: {
            title: 'Steel Forge',
            description: '-10% smelting costs',
            cost() {
                let cost = D(40);

                cost = cost.times(D(4).pow(player.f.upgrades.filter(id => Math.floor(id / 10) == 3).length));

                return cost;
            },
            effect() { return D(.9); },
            effectDisplay() { return `*${this.effect()}`; },
            item: 'steel_ingot',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.f.alloys; },
        },
    },
    /** @type {typeof layers.f.fuels} */
    fuels: {
        '*': {
            regex: /^fuel_(display|toggle)_([a-z_]+)$/,
            show_fuel(fuel) {
                if (!fuel || !(tmp.f.fuels[fuel].unlocked ?? true)) return;

                const entry = tmp.f.fuels[fuel];

                return ['row', [
                    ['clickable', `fuel_display_${fuel}`],
                    'blank',
                    ['display-text', `${format(entry.producing)} heat /s (${format(entry.heat)} each)`],
                    'blank',
                    ['clickable', `fuel_toggle_${fuel}`],
                ]];
            },
            size() {
                let size = D.dTen;

                if (hasUpgrade('f', 13)) size = size.add(upgradeEffect('f', 13).fuel);

                return size;
            },
            consuming(item) {
                if (!item) return D.dZero;

                return Object.entries(tmp.f.fuels)
                    .filter(([fuel_id, fuel]) => fuel_id != '*' && fuel.item == item)
                    .reduce((sum, [_, fuel]) => D.add(sum, fuel.consuming), D.dZero);
            },
        },
        coal: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.fuels).find(fuel => layers.f.fuels[fuel] == this); },
            heat() {
                let heat = D(5);

                heat = heat.times(tmp.f.heat.mult);

                return heat;
            },
            unlocked() { return tmp.lo.items[this.item].unlocked ?? true; },
            item: 'coal',
            consuming() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return D.div(player.lo.items[this.item].amount, 100).min(tmp.f.fuels['*'].size);
            },
            producing() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return tmp.f.fuels[this.id].consuming.times(tmp.f.fuels[this.id].heat);
            },
        },
        soaked_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.fuels).find(fuel => layers.f.fuels[fuel] == this); },
            heat() {
                let heat = D(.1);

                heat = heat.times(tmp.f.heat.mult);

                return heat;
            },
            unlocked() { return tmp.lo.items[this.item].unlocked ?? true; },
            item: 'soaked_log',
            consuming() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return D.div(player.lo.items[this.item].amount, 100).min(tmp.f.fuels['*'].size);
            },
            producing() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return tmp.f.fuels[this.id].consuming.times(tmp.f.fuels[this.id].heat);
            },
        },
        normal_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.fuels).find(fuel => layers.f.fuels[fuel] == this); },
            heat() {
                let heat = D(.5);

                heat = heat.times(tmp.f.heat.mult);

                return heat;
            },
            unlocked() { return tmp.lo.items[this.item].unlocked ?? true; },
            item: 'normal_log',
            consuming() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return D.div(player.lo.items[this.item].amount, 100).min(tmp.f.fuels['*'].size);
            },
            producing() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return tmp.f.fuels[this.id].consuming.times(tmp.f.fuels[this.id].heat);
            },
        },
        plank: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.fuels).find(fuel => layers.f.fuels[fuel] == this); },
            heat() {
                let heat = D(.75);

                heat = heat.times(tmp.f.heat.mult);

                return heat;
            },
            unlocked() { return tmp.lo.items[this.item].unlocked ?? true; },
            item: 'plank',
            consuming() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return D.div(player.lo.items[this.item].amount, 100).min(tmp.f.fuels['*'].size);
            },
            producing() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return tmp.f.fuels[this.id].consuming.times(tmp.f.fuels[this.id].heat);
            },
        },
        leaf: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.fuels).find(fuel => layers.f.fuels[fuel] == this); },
            heat() {
                let heat = D(.15);

                heat = heat.times(tmp.f.heat.mult);

                return heat;
            },
            unlocked() { return tmp.lo.items[this.item].unlocked ?? true; },
            item: 'leaf',
            consuming() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return D.div(player.lo.items[this.item].amount, 100).min(tmp.f.fuels['*'].size);
            },
            producing() {
                if (!player.f.fuels[this.id]) return D.dZero;

                return tmp.f.fuels[this.id].consuming.times(tmp.f.fuels[this.id].heat);
            },
        },
    },
    /** @type {typeof layers.f.recipes} */
    recipes: {
        '*': {
            regexes: {
                bar: /^recipe_(heat|time)_([a-z_]+)$/,
                display: /^recipe_(display)_([a-z_]+)_(\d+)$/,
                amount: /^recipe_(increase|decrease)_([a-z_]+)$/,
            },
            show_recipe(recipe_id) {
                if (!recipe_id || !(tmp.f.recipes[recipe_id].unlocked ?? true)) return;

                const recipe = tmp.f.recipes[recipe_id];

                return ['row', [
                    ...Array.from({ length: recipe.consumes.length }, (_, i) => ['clickable', `recipe_display_${recipe_id}_${i}`]),
                    ['bar', `recipe_heat_${recipe_id}`],
                    ['bar', `recipe_time_${recipe_id}`],
                    // I can't put a text-input on a subitem so I'll have to do with what I can
                    ['clickable', `recipe_decrease_${recipe_id}`],
                    ['clickable', `recipe_display_${recipe_id}_${recipe.consumes.length}`],
                    ['clickable', `recipe_increase_${recipe_id}`],
                ]];
            },
            size() {
                let size = D.dTen;

                if (hasUpgrade('f', 13)) size = size.add(upgradeEffect('f', 13).recipe);

                return size;
            },
            producing(item) { return D.dZero; },
            default_amount(recipe, amount) {
                if (D.gt(amount, 0)) return D(amount);
                if (!recipe) return D.dOne;

                const precipe = player.f.recipes[recipe];
                if (precipe.amount_smelting.gt(0)) return precipe.amount_smelting;
                if (precipe.amount_target.gt(0)) return precipe.amount_target;
                return D.dOne;
            },
            speed() {
                let speed = D.dOne;

                speed = speed.times(tmp.f.heat.speed);

                speed = speed.times(buyableEffect('lo', 73));

                return speed;
            },
        },
        // Simple convertions
        normal_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(25),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'soaked_log': amount.times(5),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'normal_log',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(20, amount);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'soaked_log': 'amount * 5',
                'time': 'amount + 20',
            },
            unlocked() { return (tmp.lo.items['soaked_log'].unlocked ?? true) && (tmp.lo.items['normal_log'].unlocked ?? true); },
        },
        coal: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(250),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'normal_log': amount.times(20),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'coal',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(60, amount.times(5));

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'normal_log': 'amount * 20',
                'time': 'amount * 5 + 60',
            },
            unlocked() { return (tmp.lo.items['normal_log'].unlocked ?? true) && (tmp.lo.items['coal'].unlocked ?? true); },
        },
        // Materials
        stone_brick: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(50),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'stone': amount.pow(1.25).times(25),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'stone_brick',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(25, amount.times(5));

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'stone': '(amount ^ 1.25) * 25',
                'time': 'amount * 5 + 25',
            },
        },
        copper_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(250),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'copper_ore': amount.pow(1.25).times(100),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'copper_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(50, amount.times(25));

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'copper_ore': '(amount ^ 1.25) * 100',
                'time': 'amount * 25 + 50',
            },
        },
        tin_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(250),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'tin_ore': amount.pow(1.25).times(75),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'tin_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(30, amount.times(15));

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'tin_ore': '(amount ^ 1.25) * 75',
                'time': 'amount * 15 + 30',
            },
        },
        iron_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(750),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'iron_ore': amount.pow(1.25).times(150),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'iron_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(75, amount.times(25));

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'iron_ore': '(amount ^ 1.25) * 150',
                'time': 'amount * 25 + 75',
            },
        },
        gold_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(600),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'gold_ore': amount.pow(1.25).times(50),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'gold_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.add(50, amount.times(25));

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'gold_ore': '(amount ^ 1.25) * 50',
                'time': 'amount * 25 + 50',
            },
        },
        // Alloys
        bronze_ingot_crude: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(1_000),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'copper_ore': amount.pow(1.5).times(300),
                    'tin_ore': amount.pow(1.5).times(100),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'bronze_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.pow(1.125, amount).times(25).add(120);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'copper_ore': '(amount ^ 1.5) * 300',
                'tin_ore': '(amount ^ 1.5) * 100',
                'time': '(1.125 ^ amount) * 25 + 120',
            },
            unlocked() { return hasUpgrade('f', 12); },
        },
        bronze_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(1_000),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'copper_ingot': amount.pow(1.4).times(3),
                    'tin_ingot': amount.pow(1.4).times(1),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'bronze_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.times(25, amount).add(180);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'copper_ingot': '(amount ^ 1.4) * 3',
                'tin_ingot': 'amount ^ 1.4',
                'time': 'amount * 25 + 180',
            },
            unlocked() { return hasUpgrade('f', 12); },
        },
        steel_ingot_crude: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(2_000),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'iron_ore': amount.pow(1.5).times(100),
                    'coal': amount.pow(1.5).times(300),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'steel_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.pow(1.125, amount).times(50).add(240);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'iron_ore': '(amount ^ 1.5) * 300',
                'coal': '(amount ^ 1.5) * 100',
                'time': '(1.125 ^ amount) * 50 + 240',
            },
            unlocked() { return hasUpgrade('f', 12); },
        },
        steel_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(2_000),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'iron_ingot': amount.pow(1.5).times(10),
                    'coal': amount.pow(1.5).times(150),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'steel_ingot',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 50).add(300);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'iron_ingot': '(amount ^ 1.5) * 300',
                'coal': '(amount ^ 1.5) * 100',
                'time': 'amount * 50 + 300',
            },
            unlocked() { return hasUpgrade('f', 12); },
        },
        // Challenge
        holy_water: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.f.recipes).find(fuel => layers.f.recipes[fuel] == this); },
            heat: D(2_500),
            consumes(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                const items = {
                    'slime_goo': D.times(amount, 100),
                    'copper_ingot': D.pow(amount, 1.25).times(50),
                    'gold_ingot': D.pow(amount, 1.25),
                };

                if (hasUpgrade('f', 33)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(upgradeEffect('f', 33));
                        });
                }

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.div(upgradeEffect('s', upg));
                        });
                } else if (inChallenge('b', 12)) {
                    Object.entries(items)
                        .forEach(([item, amount]) => {
                            items[item] = amount.times(D.add(player.lo.items[item].amount, 10).log10());
                        });
                }

                return Object.entries(items);
            },
            produces: 'holy_water',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 60).add(600);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'slime_goo': 'amount * 100',
                'copper_ingot': '(amount ^ 1.25) * 50',
                'gold_ingot': 'amount ^ 1.25',
                'time': 'amount * 60 + 600',
            },
            unlocked() { return tmp.lo.items['holy_water'].unlocked ?? true; },
        },
    },
    /** @type {typeof layers.f.heat} */
    heat: {
        speed() {
            return D.dTwo.pow(D.log10(player.f.points.add(1)).div(50));
        },
        speed_formula: '2 ^ (log10(heat + 1) / 50)',
        gain() {
            /** @type {Decimal} */
            let gain = Object.keys(layers.f.fuels)
                .filter(fuel => fuel != '*' && player.f.fuels[fuel])
                .map(fuel => tmp.f.fuels[fuel].producing)
                .reduce(D.add, D.dZero);

            let loss = player.f.points.div(100);

            return gain.minus(loss);
        },
        mult() {
            let mult = D.dOne;

            if (hasUpgrade('s', 121)) mult = mult.times(upgradeEffect('s', 121))
            else if (inChallenge('b', 12)) mult = mult.div(player.f.points.add(10).log10());

            return mult;
        },
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['alloys'];

        layerDataReset(this.layer, keep);
    },
    /*
    If you've looked at level.js, you know what you're about to see.

    If you haven't, go look at level.js to understand.

    The reasoning is the same.
    */
    clickables: new Proxy({}, {
        /** @returns {Clickable} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            const fuel_matches = layers.f.fuels['*'].regex.exec(prop);
            if (fuel_matches) {
                /** @type {[string, 'display'|'toggle', string]} */
                const [, mode, fuel_id] = fuel_matches,
                    fuel = () => tmp.f?.fuels[fuel_id],
                    item = () => tmp.lo?.items[fuel().item];

                return obj[prop] ??= {
                    canClick: true,
                    onClick() { if (mode == 'toggle') player.f.fuels[fuel_id] = !player.f.fuels[fuel_id]; },
                    display() {
                        switch (mode) {
                            case 'toggle':
                                return player.f.fuels[fuel_id] ? 'ON' : 'OFF';
                            case 'display':
                                return `<h3>${capitalize(item().name)}</h3><br>\
                                ${format(player.lo.items[fuel().item].amount)}`;
                        }
                    },
                    unlocked() { return fuel().unlocked ?? true; },
                    style() {
                        switch (mode) {
                            case 'display':
                                return Object.assign({
                                    'height': '80px',
                                    'width': '80px',
                                    'min-height': 'unset',
                                    'transform': 'unset',
                                    'color': 'black',
                                }, item().style);
                            case 'toggle':
                                return Object.assign({
                                    'height': '40px',
                                    'width': '40px',
                                    'min-height': 'unset',
                                    'color': 'black',
                                }, item().style, { 'background-image': 'none' });
                        }
                    },
                };
            }

            const recipe_display_matches = layers.f.recipes['*'].regexes.display.exec(prop);
            if (recipe_display_matches) {
                /** @type {[string, 'display', string, string]} */
                const [, , recipe_id, index] = recipe_display_matches,
                    recipe = () => tmp.f?.recipes[recipe_id],
                    precipe = () => player.f.recipes[recipe_id],
                    /** @type {() => [string, Decimal]} */
                    entry = () => {
                        if (+index < recipe().consumes.length) {
                            let e = [...recipe().consumes[+index]];
                            e[1] = e[1].neg();
                            return e;
                        } else {
                            let amount;
                            if (precipe().amount_smelting.gt(0)) amount = precipe().amount_smelting;
                            else amount = precipe().amount_target;

                            return [recipe().produces, amount];
                        }
                    },
                    is_output = () => +index == recipe().consumes.length,
                    has_materials = () => recipe().consumes.every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));

                if (!recipe()) return;

                return obj[prop] ??= {
                    canClick() { return !is_output() || precipe().amount_smelting.lte(0) && precipe().amount_target.gt(0) && has_materials(); },
                    display() {
                        if (!shiftDown) {
                            return `<h3>${capitalize(tmp.lo?.items[entry()[0]].name)}</h3><br>\
                            ${format(player.lo.items[entry()[0]].amount)}<br>\
                            ${D.gt(entry()[1], 0) ? '+' : ''}${format(entry()[1])}\
                            ${is_output() && precipe().amount_smelting.gt(0) ? '<br><i>In progress</i>' : ''}`;
                        } else {
                            return `<h3>${capitalize(tmp.lo?.items[entry()[0]].name)}</h3><br>\
                            Formula: ${recipe().formulas[entry()[0]] ?? 'amount'}\
                            ${is_output() && precipe().amount_smelting.gt(0) ? '<br><i>In progress</i>' : ''}`;
                        }
                    },
                    unlocked() { return recipe().unlocked ?? true; },
                    style() {
                        const style = Object.assign({
                            'height': '80px',
                            'width': '80px',
                            'min-height': 'unset',
                            'transform': 'unset',
                            'color': 'black',
                        }, tmp.lo?.items[entry()[0]].style);

                        if (is_output()) {
                            if (precipe().amount_smelting.gt(0)) {
                                style['filter'] = 'drop-shadow(0 0 5px orange)';
                            } else if (precipe().amount_target.lte(0) || !has_materials()) {
                                style['filter'] = 'brightness(75%)';
                            }
                        }

                        return style;
                    },
                    onClick() {
                        if (is_output()) {
                            const amount = precipe().amount_target;

                            recipe().consumes.forEach(([item, amount]) => {
                                player.lo.items[item].amount = D.minus(player.lo.items[item].amount, amount);
                            });
                            precipe().amount_smelting = amount;
                        }
                    },
                };
            }

            const recipe_amount_matches = layers.f.recipes['*'].regexes.amount.exec(prop);
            if (recipe_amount_matches) {
                /** @type {[string, 'increase'|'decrease', string]} */
                const [, mode, recipe_id] = recipe_amount_matches,
                    recipe = () => tmp.f?.recipes[recipe_id],
                    precipe = () => player.f?.recipes[recipe_id],
                    change = () => {
                        let amount = D.dOne;

                        if (ctrlDown) amount = amount.times(10);

                        if (shiftDown) amount = amount.times(25);

                        return amount;
                    };

                if (!recipe()) return;

                return obj[prop] ??= {
                    canClick() {
                        if (precipe().amount_smelting.gt(0)) return false;

                        switch (mode) {
                            case 'increase':
                                if (precipe().amount_target.gte(tmp.f.recipes['*'].size)) return false;
                                break;
                            case 'decrease':
                                if (precipe().amount_target.lte(0)) return false;
                                break;
                        }
                        return true;
                    },
                    display() { return { 'increase': '+', 'decrease': '-' }[mode]; },
                    unlocked() { return recipe().unlocked ?? true; },
                    style: {
                        'height': '40px',
                        'width': '40px',
                        'min-height': 'unset',
                    },
                    onClick() {
                        let amount = change();
                        if (mode == 'decrease') amount = amount.neg();

                        precipe().amount_target = precipe().amount_target.add(amount).min(tmp.f.recipes['*'].size).max(0);
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' ||
                layers.f.fuels['*'].regex.exec(prop) ||
                layers.f.recipes['*'].regexes.display.exec(prop) ||
                layers.f.recipes['*'].regexes.amount.exec(prop)) return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) {
            return !!layers.f.fuels['*'].regex.exec(prop) &&
                !!layers.f.recipes['*'].regexes.display.exec(prop);
        },
        ownKeys(_) {
            return [
                ...Object.keys(layers.f.fuels)
                    .filter(fuel => fuel != '*')
                    .map(fuel => [`fuel_display_${fuel}`, `fuel_toggle_${fuel}`])
                    .flat(),
                ...Object.keys(layers.f.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => {
                        /**
                         * OK so
                         * When tmp sets up, it sometimes converts arrays into Decimals (for a reason I don't wanna search)
                         * This causes problems during the array creation because `Decimal + 1` is NaN
                         */
                        /** @type {number} */
                        let length = 1;
                        if (tmp.f && Array.isArray(tmp.f.recipes[recipe].consumes)) length = tmp.f.recipes[recipe].consumes.length + 1;
                        else if (layers.f) length = layers.f.recipes[recipe].consumes(D(1)).length + 1;

                        return [
                            ...Array.from({ length }, (_, i) => `recipe_display_${recipe}_${i}`),
                            `recipe_increase_${recipe}`,
                            `recipe_decrease_${recipe}`,
                        ];
                    })
                    .flat(),
            ];
        },
    }),
    bars: new Proxy({}, {
        /** @returns {Bar} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            const recipe_matches = layers.f.recipes['*'].regexes.bar.exec(prop);
            if (recipe_matches) {
                /** @type {[string, 'heat'|'time', string]} */
                const [, mode, recipe_id] = recipe_matches,
                    recipe = tmp.f?.recipes[recipe_id];

                return {
                    direction: { 'heat': UP, 'time': RIGHT, }[mode],
                    width: { 'heat': 80, 'time': 160, }[mode],
                    height: 80,
                    unlocked() { return recipe.unlocked ?? true; },
                    progress() {
                        switch (mode) {
                            case 'heat':
                                return D.div(player.f.points, recipe.heat);
                            case 'time':
                                return D.div(player.f.recipes[recipe_id].progress, recipe.time);
                        }
                    },
                    display() {
                        if (mode == 'heat') return `${format(player.f.points)} / ${format(recipe.heat)}`;
                        if (!shiftDown) {
                            return `${formatTime(player.f.recipes[recipe_id].progress)} / ${formatTime(recipe.time)}`;
                        } else {
                            return `Formula: ${recipe.formulas.time}s`;
                        }
                    },
                    fillStyle() { if (mode == 'heat') return { 'background-color': '#FFAA00', }; },
                    textStyle: { 'color': 'gray', },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || layers.f.recipes['*'].regexes.bar.exec(prop)) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return !!layers.f.recipes['*'].regexes.bar.exec(prop); },
        ownKeys(_) {
            return [
                ...Object.keys(layers.f.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => [`recipe_heat_${recipe}`, `recipe_time_${recipe}`])
                    .flat(),
            ];
        },
    }),
});
