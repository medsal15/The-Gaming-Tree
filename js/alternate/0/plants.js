'use strict';

//todo recycle plant seeds into seeds (item)
addLayer('p', {
    name: 'Plants',
    symbol: 'P',
    /** @returns {typeof player.p} */
    startData() {
        return {
            unlocked: false,
            mode: 'place',
            plant: '',
            plants: Object.fromEntries(
                Object.keys(layers.p.plants).map(plant => [plant, {
                    seeds: D(plant == 'wheat'), // Wheat starts with 1 seed
                    harvested: D.dZero,
                    dead: D.dZero,
                    infusions: [],
                    last_harvest: [],
                    last_harvest_seeds: D.dZero,
                    last_harvest_count: D.dZero,
                }])
            ),
            infuse_target: '',
            infuse_item: '',
            last_harvest: '',
        };
    },
    tooltip() { return `${formatWhole(Object.values(player.p.grid).filter(data => data.plant != '').length)} growing plants`; },
    layerShown() { return player[this.layer].unlocked; },
    deactivated() { return inChallenge('b', 31); },
    color: '#88CC00',
    row: 0,
    position: 2.5,
    resource: 'plants',
    hotkeys: [
        {
            key: 'p',
            description: 'P: Display plants layer',
            unlocked() { return player.p.unlocked; },
            onPress() { showTab('p'); },
        },
    ],
    tabFormat: {
        'Garden': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('p'), layers.tic.time_speed('p'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['clickables', [1]],
                'blank',
                'grid',
                'blank',
                ['display-text', () => {
                    const last = player.p.last_harvest;
                    if (!last) return '';
                    const drops = [],
                        count = player.p.plants[last].last_harvest_count;

                    if (!last) return '';

                    if (player.p.plants[last].last_harvest.length > 0) {
                        drops.push(
                            ...player.p.plants[last].last_harvest.map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`)
                        );
                    }
                    if (D.gt(player.p.plants[last].last_harvest_seeds, 0)) {
                        drops.push(`${format(player.p.plants[last].last_harvest_seeds)} ${tmp.p.plants[last].name} seeds`);
                    }
                    if (!drops.length) drops.push('nothing');

                    const count_text = D.gt(count, 1) ? ` (${formatWhole(count)} times)` : '';

                    return `Last harvested ${tmp.p.plants[last].name} dropped ${listFormat.format(drops)}${count_text}`;
                }],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (Object.keys(layers.p.plants).some(plant => tmp.p.plants[plant].notify)) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
        'Plants': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('p'), layers.tic.time_speed('p'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['row', [
                    ['display-text', 'Currently planting'],
                    'blank',
                    ['drop-down-double', ['plant', () => [['', 'nothing'], ...tmp.p.plants['*'].list.map(plant => [plant, tmp.p.plants[plant].name])]]],
                ]],
                'blank',
                ['display-text', () => {
                    /** @param {string} plant */
                    const row = plant_id => {
                        const plant = tmp.p.plants[plant_id],
                            produces = plant.produces.map(item => `${format(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`);

                        return `<tr>\
                                <td rowspan="2">${capitalize(plant.name)}</td>\
                                <td rowspan="2">\
                                    Maturation: ${formatTime(plant.maturation)}<br><br>\
                                    Lifespan: ${formatTime(plant.ages.at(-1)[1])}\
                                </td>\
                                <td rowspan="2">${tmp.p.plants[plant_id].effect_text ?? 'None'}</td>\
                                <td>${format(player.p.plants[plant_id].seeds)} seeds</td>\
                            </tr>\
                            <tr>\
                                <td>${produces.join('<br>')}</td>\
                            </tr>`;
                    };

                    return `<table class="layer-table" style="--color:${tmp.p.color};">\
                            <tr>\
                                <th>Name</th>\
                                <th>Life</th>\
                                <th>Effect</th>\
                                <th>Amount</th>\
                            </tr>\
                            ${tmp.p.plants['*'].list.map(row).join('')}\
                        </table>`;
                }],
            ],
        },
        'Infusion': {
            content: [
                ['row', [
                    ['display-text', 'Infuse'],
                    'blank',
                    ['drop-down-double', ['infuse_target', () => [['', 'nothing'], ...tmp.p.plants['*'].list.map(plant => [plant, tmp.p.plants[plant].name])]]],
                    'blank',
                    ['display-text', 'with'],
                    'blank',
                    ['drop-down-double', [
                        'infuse_item',
                        () => [
                            ['', 'nothing'],
                            ...[
                                'slime_goo',
                                'slime_core',
                                'red_fabric',
                                'copper_ore',
                                'coal',
                                'iron_ore',
                                'gold_ore',
                                'wheat',
                                'corn',
                                'potato',
                                'stardust',
                            ].map(item => [item, tmp.lo.items[item].name]),
                        ]
                    ]],
                    'blank',
                    ['clickable', 21],
                ]],
                ['display-text', () => {
                    const target = player.p.infuse_target,
                        item = player.p.infuse_item;

                    const text = [];
                    if (player.p.infuse_target != '') text.push(`${format(player.p.plants[target].seeds)} ${tmp.p.plants[target].name} seeds`);
                    if (player.p.infuse_item != '') text.push(`${format(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`);
                    if (!text.length) text.push('nothing selected');

                    return `You have ${listFormat.format(text)}`;
                }],
                'blank',
                ['display-text', 'Discovered infusions'],
                ['display-text', () => {
                    /**
                     * @param {string} plant
                     * @param {string} item
                     */
                    const row = (plant, item) => {
                        return `<tr>\
                                <td>${capitalize(tmp.p.plants[plant].name)}</td>\
                                <td>${capitalize(tmp.lo.items[item].name)}</td>\
                                <td>${capitalize(tmp.p.plants[tmp.p.plants[plant].infusions[item]].name)}</td>\
                            </tr>`;
                    },
                        /** @type {[string, string][]} */
                        infusions = tmp.p.plants['*'].list.map(
                            plant => Object.entries(tmp.p.plants[plant].infusions)
                                .filter(([, result]) => tmp.p.plants[result].unlocked && player.p.plants[plant].infusions.includes(result))
                                .map(([item]) => [plant, item])
                        ).flat();

                    return `<table class="layer-table" style="--color:${tmp.p.color};">\
                            <tr>\
                                <th>Base</th>\
                                <th>Item</th>\
                                <th>Result</th>\
                            </tr>\
                            ${infusions.map(([plant, item]) => row(plant, item)).join('')}\
                        </table>`;
                }],
                'blank',
                ['display-text', 'Infusion hints'],
                ['display-text', () => {
                    /**
                     * @param {string} plant
                     */
                    const row = plant => `${(tmp.p.plants[plant].unlocked ?? true) ? capitalize(tmp.p.plants[plant].name) : '???'}: ${tmp.p.plants[plant].hint}`;

                    return Object.keys(tmp.p.plants)
                        .filter(plant => plant != '*' && !tmp.p.plants[plant].unlocked && tmp.p.plants[plant].hint)
                        .map(row)
                        .join('<br>')
                }],
            ],
        },
    },
    clickables: {
        11: {
            display: 'Set current mode to planting',
            canClick() { return player.p.mode != 'place'; },
            onClick() { player.p.mode = 'place'; },
        },
        12: {
            display: 'Set current mode to harvesting or destroying',
            canClick() { return player.p.mode != 'harvest'; },
            onClick() { player.p.mode = 'harvest'; },
        },
        21: {
            style: { 'background-image': `url('./resources/images/crafting.svg')`, },
            canClick() {
                const target = player.p.infuse_target,
                    item = player.p.infuse_item;

                return target != '' && player.p.plants[target].seeds.gte(1) &&
                    item != '' && player.lo.items[item].amount.gte(1) &&
                    (tmp.p.plants[target].unlocked ?? true) && (tmp.lo.items[item].unlocked ?? true) &&
                    item in tmp.p.plants[target].infusions;
            },
            onClick() {
                const target = player.p.infuse_target,
                    item = player.p.infuse_item;

                if (target != '' && player.p.plants[target].seeds.gte(1) &&
                    item != '' && player.lo.items[item].amount.gte(1) &&
                    (tmp.p.plants[target].unlocked ?? true) && (tmp.lo.items[item].unlocked ?? true) &&
                    item in tmp.p.plants[target].infusions
                ) {
                    player.p.plants[target].seeds = D.minus(player.p.plants[target].seeds, 1);
                    const result = tmp.p.plants[target].infusions[item];
                    if (!player.p.plants[target].infusions.includes(result)) player.p.plants[target].infusions.push(result);
                    layers.lo.items['*'].gain_items(item, -1);
                    player.p.plants[result].seeds = D.add(player.p.plants[result].seeds, 1);
                }
            },
        },
    },
    /** @type {Layer<'p'>['grid']} */
    grid: {
        cols() {
            let cols = 5;

            if (hasUpgrade('c', 84)) cols += upgradeEffect('c', 84);

            return cols;
        },
        maxCols: 6,
        rows: 5,
        getStartData(_) {
            return {
                plant: '',
                age: D.dZero,
            };
        },
        getCanClick(data, _) {
            switch (player.p.mode) {
                case 'place':
                    return data.plant == '' && player.p.plant != '' &&
                        (tmp.p.plants[player.p.plant].unlocked ?? true) &&
                        D.gte(player.p.plants[player.p.plant].seeds, 1);
                case 'harvest':
                    return data.plant != '';
            }
        },
        onClick(data, _) {
            switch (player.p.mode) {
                case 'place':
                    if (
                        data.plant == '' && player.p.plant != '' &&
                        (tmp.p.plants[player.p.plant].unlocked ?? true) &&
                        D.gte(player.p.plants[player.p.plant].seeds, 1)
                    ) {
                        data.plant = player.p.plant;
                        data.age = D.dZero;
                        player.p.plants[data.plant].seeds = D.minus(player.p.plants[data.plant].seeds, 1);
                    }
                    return;
                case 'harvest':
                    if (data.plant != '') {
                        // Get items
                        const drops = layers.p.plants[data.plant].produce(data.age),
                            seeds = layers.p.plants[data.plant].seeds(data.age),
                            player_data = player.p.plants[data.plant],
                            equal = drops.length == player_data.last_harvest.length &&
                                seeds.eq(player_data.last_harvest_seeds) &&
                                drops.every(([item, amount]) => player_data.last_harvest.some(([litem, lamount]) => litem == item && D.eq(lamount, amount)));

                        layers.lo.items['*'].gain_items(drops);
                        player_data.seeds = D.add(player_data.seeds, seeds);

                        if (equal) {
                            player_data.last_harvest_count = D.add(player_data.last_harvest_count, 1);
                        } else {
                            player_data.last_harvest_count = D.dOne;
                            player_data.last_harvest = drops;
                            player_data.last_harvest_seeds = seeds;
                        }
                        player.p.last_harvest = data.plant;

                        if (drops.length) player_data.harvested = D.add(player_data.harvested, 1);

                        // Wipe
                        data.plant = '';
                        data.age = D.dZero;
                    }
                    return;
            }
        },
        getStyle(data, _) {
            if (!(data.plant in layers.p.plants)) return {};

            const plant = tmp.p.plants[data.plant],
                nega = data.age.lt(0),
                /** @type {number} */
                stage = plant.ages.findIndex(([from, to]) => D.gt(data.age.abs(), from) && D.lte(data.age.abs(), to)),
                image = plant.images[stage],
                negastyle = {
                    'transform': `scaleY(-1)`,
                    'filter': `invert(1)`,
                    'z-index': 10,
                };

            return Object.assign(
                {},
                plant.style.general,
                plant.style.grid ?? {},
                {
                    'background-image': `url(${image})`,
                    'background-repeat': 'no-repeat',
                    'background-origin': 'border-box',
                    'background-position': 'center',
                },
                nega ? negastyle : {},
            );
        },
        getTooltip(data, _) {
            if (data?.plant in tmp.p.plants) return capitalize(tmp.p.plants[data.plant].name);
            return 'Empty';
        },
    },
    /** @type {Layers['p']['plants']} */
    plants: {
        '*': {
            list() {
                return Object.keys(layers.p.plants).filter(plant => plant != '*' && (tmp.p.plants[plant].unlocked ?? true));
            },
            harvest_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 64)) mult = mult.times(upgradeEffect('c', 64));

                mult = mult.times(tmp.p.plants.sunflower.effect);

                return mult;
            },
            grow_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 74)) mult = mult.times(upgradeEffect('c', 74));

                mult = mult.times(tmp.p.plants.clockberry.effect);

                return mult;
            },
        },
        wheat: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'wheat',
            style: {
                general: {
                    'background-color': '#FFDDBB',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(.5 * 60)],
                    [D(.5 * 60), D(1 * 60)],
                    [D(1 * 60), D(1.5 * 60)],
                    [D(1.5 * 60), D(2 * 60)],
                    [D(2 * 60), D(5 * 60)], // mature
                    [D(5 * 60), D(6 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(2 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/wheat/age1.png',
                'resources/images/plants/wheat/age2.png',
                'resources/images/plants/wheat/age3.png',
                'resources/images/plants/wheat/age4.png',
                'resources/images/plants/wheat/age5.png',
                'resources/images/plants/wheat/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['wheat', D.dOne]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['wheat'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.5, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {
                'copper_ore': 'copper_wheat',
                'slime_goo': 'corn',
                'potato': 'eggplant',
            },
        },
        copper_wheat: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'copper wheat',
            style: {
                general: {
                    'background-color': '#BB7733',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1 * 60)],
                    [D(1 * 60), D(2 * 60)],
                    [D(2 * 60), D(3 * 60)],
                    [D(3 * 60), D(4 * 60)],
                    [D(4 * 60), D(8 * 60)], // mature
                    [D(8 * 60), D(10 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(4 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/copper_wheat/age1.png',
                'resources/images/plants/copper_wheat/age2.png',
                'resources/images/plants/copper_wheat/age3.png',
                'resources/images/plants/copper_wheat/age4.png',
                'resources/images/plants/copper_wheat/age5.png',
                'resources/images/plants/copper_wheat/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['copper_ore', D(100)], ['wheat', D.dOne]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['copper_ore', 'wheat'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.1, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {},
            unlocked() { return player.p.plants.wheat.infusions.includes(this.id); },
            hint: 'Needs copper',
        },
        corn: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'corn',
            style: {
                general: {
                    'background-color': '#FFEE55',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1 * 60)],
                    [D(1 * 60), D(2 * 60)],
                    [D(2 * 60), D(3 * 60)],
                    [D(3 * 60), D(4 * 60)],
                    [D(4 * 60), D(10 * 60)], // mature
                    [D(10 * 60), D(11 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(4 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/corn/age1.png',
                'resources/images/plants/corn/age2.png',
                'resources/images/plants/corn/age3.png',
                'resources/images/plants/corn/age4.png',
                'resources/images/plants/corn/age5.png',
                'resources/images/plants/corn/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['corn', D(2)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['corn'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.25, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {
                'wheat': 'candy_corn',
                'red_fabric': 'strawberry',
                'coal': 'sunflower',
            },
            unlocked() { return player.p.plants.wheat.infusions.includes(this.id); },
            hint: 'Needs some slime',
        },
        candy_corn: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'candy corn',
            style: {
                general: {
                    'background-color': '#FF5500',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1.5 * 60)],
                    [D(1.5 * 60), D(3 * 60)],
                    [D(3 * 60), D(4.5 * 60)],
                    [D(4.5 * 60), D(6 * 60)],
                    [D(6 * 60), D(16 * 60)], // mature
                    [D(16 * 60), D(18 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(6 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/candy_corn/age1.png',
                'resources/images/plants/candy_corn/age2.png',
                'resources/images/plants/candy_corn/age3.png',
                'resources/images/plants/candy_corn/age4.png',
                'resources/images/plants/candy_corn/age5.png',
                'resources/images/plants/candy_corn/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['corn', D(2)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['corn'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.1, mult);
            },
            notify: false,
            infusions: {},
            unlocked() { return player.p.plants.corn.infusions.includes(this.id); },
            effect() {
                const planted = Object.entries(player.p.grid).filter(([id, data]) => {
                    if (data.plant != this.id) return false;

                    const row = Math.floor(id / 100),
                        col = id % 100;

                    return row > 0 && row <= tmp.p.grid.rows && col > 0 && col <= tmp.p.grid.cols;
                }).map(([, data]) => data),
                    ages = tmp.p.plants[this.id].ages,
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = ages.findIndex(([from, to]) => data.age.gt(from) && data.age.lte(to));

                        set[i] = D.add(set[i], 1);

                        return set;
                    }, {}),
                    sum = D.times(amounts[0], .01)
                        .add(D.times(amounts[1], .1))
                        .add(D.times(amounts[2], .25))
                        .add(D.times(amounts[3], .5))
                        .add(amounts[4])
                        .add(D.times(amounts[5], .5));

                return sum.max(0).add(2).log2();
            },
            effect_text() {
                let effect;
                if (!shiftDown) {
                    effect = format(tmp.p.plants[this.id].effect);
                } else {
                    effect = '[log2(corn value + 2)]';
                }

                return `Multiplies taming progress gain by ${effect}`;
            },
            hint() { if (tmp.p.plants.corn.unlocked) return 'Combine 2 plants'; },
        },
        strawberry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'strawberry',
            style: {
                general: {
                    'background-color': '#FF4444',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1.5 * 60)],
                    [D(1.5 * 60), D(2.5 * 60)],
                    [D(2.5 * 60), D(3.5 * 60)],
                    [D(3.5 * 60), D(5.5 * 60)],
                    [D(5.5 * 60), D(11 * 60)], // mature
                    [D(11 * 60), D(13 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(5.5 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/strawberry/age1.png',
                'resources/images/plants/strawberry/age2.png',
                'resources/images/plants/strawberry/age3.png',
                'resources/images/plants/strawberry/age4.png',
                'resources/images/plants/strawberry/age5.png',
                'resources/images/plants/strawberry/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['strawberry', D(2)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['strawberry'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.25, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {
                'iron_ore': 'clockberry',
            },
            unlocked() { return player.p.plants.corn.infusions.includes(this.id); },
            hint() { if (tmp.p.plants.corn.unlocked) return 'A redder version of corn'; },
        },
        clockberry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'clockberry',
            style: {
                general: {
                    'background-color': '#FFFFFF',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1.5 * 60)],
                    [D(1.5 * 60), D(2.5 * 60)],
                    [D(2.5 * 60), D(3.5 * 60)],
                    [D(3.5 * 60), D(5.5 * 60)],
                    [D(5.5 * 60), D(25.5 * 60)], // mature
                    [D(25.5 * 60), D(30 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(5.5 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/clockberry/age1.png',
                'resources/images/plants/clockberry/age2.png',
                'resources/images/plants/clockberry/age3.png',
                'resources/images/plants/clockberry/age4.png',
                'resources/images/plants/clockberry/age5.png',
                'resources/images/plants/clockberry/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['strawberry', D(2)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['strawberry'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.1, mult);
            },
            notify: false,
            infusions: {},
            unlocked() { return player.p.plants.strawberry.infusions.includes(this.id); },
            effect() {
                const planted = Object.entries(player.p.grid).filter(([id, data]) => {
                    if (data.plant != this.id) return false;

                    const row = Math.floor(id / 100),
                        col = id % 100;

                    return row > 0 && row <= tmp.p.grid.rows && col > 0 && col <= tmp.p.grid.cols;
                }).map(([, data]) => data),
                    ages = tmp.p.plants[this.id].ages,
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = ages.findIndex(([from, to]) => data.age.gt(from) && data.age.lte(to));

                        set[i] = D.add(set[i], 1);

                        return set;
                    }, {}),
                    sum = D.times(amounts[0], .01)
                        .add(D.times(amounts[1], .1))
                        .add(D.times(amounts[2], .25))
                        .add(D.times(amounts[3], .5))
                        .add(amounts[4])
                        .add(D.times(amounts[5], .5));

                return sum.add(1).root(2);
            },
            effect_text() {
                let effect;
                if (!shiftDown) {
                    effect = format(tmp.p.plants[this.id].effect);
                } else {
                    effect = '[2√(clockberry value + 1)]';
                }

                return `Multiplies growing speed by ${effect}`;
            },
            hint() { if (tmp.p.plants.strawberry.unlocked) return 'A bit of metal should work'; },
        },
        sunflower: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'sunflower',
            style: {
                general: {
                    'background-color': '#FFCC33',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(2 * 60)],
                    [D(2 * 60), D(3 * 60)],
                    [D(3 * 60), D(4 * 60)],
                    [D(4 * 60), D(6 * 60)],
                    [D(6 * 60), D(9 * 60)], // mature
                    [D(9 * 60), D(11 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(6 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/sunflower/age1.png',
                'resources/images/plants/sunflower/age2.png',
                'resources/images/plants/sunflower/age3.png',
                'resources/images/plants/sunflower/age4.png',
                'resources/images/plants/sunflower/age5.png',
                'resources/images/plants/sunflower/age6.png',
            ],
            produce(age) { return []; },
            produces: [],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.25, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            unlocked() { return player.p.plants.corn.infusions.includes(this.id); },
            infusions: {
                'stardust': 'starflower',
                'corn': 'potato',
            },
            effect() {
                const planted = Object.entries(player.p.grid).filter(([id, data]) => {
                    if (data.plant != this.id) return false;

                    const row = Math.floor(id / 100),
                        col = id % 100;

                    return row > 0 && row <= tmp.p.grid.rows && col > 0 && col <= tmp.p.grid.cols;
                }).map(([, data]) => data),
                    ages = tmp.p.plants[this.id].ages,
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = ages.findIndex(([from, to]) => data.age.gt(from) && data.age.lte(to));

                        set[i] = D.add(set[i], 1);

                        return set;
                    }, {}),
                    sum = D.times(amounts[0], .01)
                        .add(D.times(amounts[1], .1))
                        .add(D.times(amounts[2], .25))
                        .add(D.times(amounts[3], .5))
                        .add(amounts[4])
                        .add(D.times(amounts[5], .5));

                return sum.max(0).add(1).root(2);
            },
            effect_text() {
                let effect;
                if (!shiftDown) {
                    effect = format(tmp.p.plants[this.id].effect);
                } else {
                    effect = '[2√(sunflower value + 1)]';
                }

                return `Multiplies harvest yield by ${effect}`;
            },
            hint() { if (tmp.p.plants.corn.unlocked) return 'Add some fuel'; },
        },
        starflower: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'starflower',
            style: {
                general: {
                    'background-color'() { return tmp.xp.enemies.star.color; },
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(2 * 60)],
                    [D(2 * 60), D(4 * 60)],
                    [D(4 * 60), D(6 * 60)],
                    [D(6 * 60), D(8 * 60)],
                    [D(8 * 60), D(38 * 60)], // mature
                    [D(38 * 60), D(40 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(8 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/starflower/age1.png',
                'resources/images/plants/starflower/age2.png',
                'resources/images/plants/starflower/age3.png',
                'resources/images/plants/starflower/age4.png',
                'resources/images/plants/starflower/age5.png',
                'resources/images/plants/starflower/age6.png',
            ],
            produce(age) { return []; },
            produces: [],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.1, mult);
            },
            notify: false,
            unlocked() { return player.p.plants.sunflower.infusions.includes(this.id); },
            infusions: {},
            effect() {
                const planted = Object.entries(player.p.grid).filter(([id, data]) => {
                    if (data.plant != this.id) return false;

                    const row = Math.floor(id / 100),
                        col = id % 100;

                    return row > 0 && row <= tmp.p.grid.rows && col > 0 && col <= tmp.p.grid.cols;
                }).map(([, data]) => data),
                    ages = tmp.p.plants[this.id].ages,
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = ages.findIndex(([from, to]) => data.age.gt(from) && data.age.lte(to));

                        set[i] = D.add(set[i], 1);

                        return set;
                    }, {}),
                    sum = D.times(amounts[0], .01)
                        .add(D.times(amounts[1], .1))
                        .add(D.times(amounts[2], .25))
                        .add(D.times(amounts[3], .5))
                        .add(amounts[4])
                        .add(D.times(amounts[5], .5));

                return sum.max(0).add(4).log(4);
            },
            effect_text() {
                let effect;
                if (!shiftDown) {
                    effect = format(tmp.p.plants[this.id].effect);
                } else {
                    effect = '[log4(starflower value + 4)]';
                }

                return `Multiplies multiplies star time by ${effect}`;
            },
            hint() { if (tmp.p.plants.sunflower.unlocked) return 'Shines only during the night'; },
        },
        potato: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'potato',
            style: {
                general: {
                    'background-color': '#FFCC88',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1 * 60)],
                    [D(1 * 60), D(2 * 60)],
                    [D(2 * 60), D(3 * 60)],
                    [D(3 * 60), D(4 * 60)],
                    [D(4 * 60), D(8 * 60)], // mature
                    [D(8 * 60), D(10 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(4 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/potato/age1.png',
                'resources/images/plants/potato/age2.png',
                'resources/images/plants/potato/age3.png',
                'resources/images/plants/potato/age4.png',
                'resources/images/plants/potato/age5.png',
                'resources/images/plants/potato/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['potato', D(2)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['potato'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.25, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {
                'gold_ore': 'potato_battery',
            },
            unlocked() { return player.p.plants.sunflower.infusions.includes(this.id); },
            hint() { if (tmp.p.plants.sunflower.unlocked) return 'Combine 2 plants, again'; },
        },
        potato_battery: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'potato battery',
            style: {
                general: {
                    'background-color': '#FFEE00',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1.5 * 60)],
                    [D(1.5 * 60), D(3 * 60)],
                    [D(3 * 60), D(4.5 * 60)],
                    [D(4.5 * 60), D(6 * 60)],
                    [D(6 * 60), D(16 * 60)], // mature
                    [D(16 * 60), D(20 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(6 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/potato_battery/age1.png',
                'resources/images/plants/potato_battery/age2.png',
                'resources/images/plants/potato_battery/age3.png',
                'resources/images/plants/potato_battery/age4.png',
                'resources/images/plants/potato_battery/age5.png',
                'resources/images/plants/potato_battery/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['potato', D(1)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['potato'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.1, mult);
            },
            notify: false,
            infusions: {},
            unlocked() { return player.p.plants.potato.infusions.includes(this.id); },
            effect() {
                const planted = Object.entries(player.p.grid).filter(([id, data]) => {
                    if (data.plant != this.id) return false;

                    const row = Math.floor(id / 100),
                        col = id % 100;

                    return row > 0 && row <= tmp.p.grid.rows && col > 0 && col <= tmp.p.grid.cols;
                }).map(([, data]) => data),
                    ages = tmp.p.plants[this.id].ages,
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = ages.findIndex(([from, to]) => data.age.gt(from) && data.age.lte(to));

                        set[i] = D.add(set[i], 1);

                        return set;
                    }, {}),
                    sum = D.times(amounts[0], .01)
                        .add(D.times(amounts[1], .1))
                        .add(D.times(amounts[2], .25))
                        .add(D.times(amounts[3], .5))
                        .add(amounts[4])
                        .add(D.times(amounts[5], .5));

                return sum.max(0).add(4).log(4);
            },
            effect_text() {
                let effect;
                if (!shiftDown) {
                    effect = format(tmp.p.plants[this.id].effect);
                } else {
                    effect = '[log4(potato battery value + 4)]';
                }

                return `Multiplies energy gain by ${effect}`;
            },
            hint() { if (tmp.p.plants.potato.unlocked) return 'Electricity flows through this one'; },
        },
        eggplant: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'eggplant',
            style: {
                general: {
                    'background-color': '#664455',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(1.5 * 60)],
                    [D(1.5 * 60), D(3 * 60)],
                    [D(3 * 60), D(4 * 60)],
                    [D(4 * 60), D(5 * 60)],
                    [D(5 * 60), D(13 * 60)], // mature
                    [D(13 * 60), D(15 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(5 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/eggplant/age1.png',
                'resources/images/plants/eggplant/age2.png',
                'resources/images/plants/eggplant/age3.png',
                'resources/images/plants/eggplant/age4.png',
                'resources/images/plants/eggplant/age5.png',
                'resources/images/plants/eggplant/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['eggplant', D(1)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['eggplant'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.25, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {
                'slime_core': 'egg_plant',
            },
            unlocked() { return player.p.plants.wheat.infusions.includes(this.id); },
            hint() { if (tmp.p.plants.potato.unlocked) return 'Combine 2 plants, once more'; },
        },
        egg_plant: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'egg plant',
            style: {
                general: {
                    'background-color': '#FFEEDD',
                },
            },
            ages() {
                /** @type {[Decimal, Decimal][]} */
                const ages = [
                    [D(-1), D(2.5 * 60)],
                    [D(2.5 * 60), D(5 * 60)],
                    [D(5 * 60), D(7.5 * 60)],
                    [D(7.5 * 60), D(11 * 60)],
                    [D(11 * 60), D(60 * 60)], // mature
                    [D(60 * 60), D(65 * 60)], // wilting
                ];

                ages.forEach(([from, to], i) => {
                    let div = tmp.p.plants['*'].grow_mult;

                    ages[i] = [from.div(div), to.div(div)];
                });

                return ages;
            },
            maturation() {
                let maturation = D(11 * 60);

                maturation = maturation.div(tmp.p.plants['*'].grow_mult);

                return maturation;
            },
            images: [
                'resources/images/plants/egg_plant/age1.png',
                'resources/images/plants/egg_plant/age2.png',
                'resources/images/plants/egg_plant/age3.png',
                'resources/images/plants/egg_plant/age4.png',
                'resources/images/plants/egg_plant/age5.png',
                'resources/images/plants/egg_plant/age6.png',
            ],
            produce(age) {
                if (D.lte(age, tmp.p.plants[this.id].maturation)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['egg', D(1)]];

                items.forEach(([item, amount], i) => {
                    let mult = tmp.p.plants['*'].harvest_mult;

                    // The plant got too old, lose most of the harvest
                    if (D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0])) mult = mult.div(10);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = amount.times(mult);
                });

                return items;
            },
            produces: ['egg'],
            seeds(age) {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                if (D.lte(age, tmp.p.plants[this.id].maturation) ||
                    D.gt(age, tmp.p.plants[this.id].ages.at(-1)[0]) ||
                    D.gt(player.p.plants[this.id].seeds, 1e3)) return mult;

                return D.times(1.1, mult);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
            infusions: {},
            unlocked() { return player.p.plants.eggplant.infusions.includes(this.id); },
            hint() { if (tmp.p.plants.eggplant.unlocked) return 'Add something... circular?'; },
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        Object.entries(player.p.grid).forEach(([, data]) => {
            if (data.plant == '') return;

            data.age = D.add(data.age, diff);
            if (D.gte(data.age, tmp.p.plants[data.plant].ages.at(-1)[1])) {
                // Oops, plant is dead
                const drops = layers.p.plants[data.plant].produce(data.age),
                    seeds = layers.p.plants[data.plant].seeds(data.age),
                    player_data = player.p.plants[data.plant],
                    equal = drops.length == player_data.last_harvest.length &&
                        seeds.eq(player_data.last_harvest_seeds) &&
                        drops.every(([item, amount]) => player_data.last_harvest.some(([litem, lamount]) => litem == item && D.eq(lamount, amount)));

                if (equal) {
                    player_data.last_harvest_count = D.add(player_data.last_harvest_count, 1);
                } else {
                    player_data.last_harvest_count = D.dOne;
                    player_data.last_harvest = drops;
                    player_data.last_harvest_seeds = seeds;
                }
                player.p.last_harvest = data.plant;

                layers.lo.items['*'].gain_items(drops);
                player_data.seeds = D.add(player_data.seeds, seeds);

                player_data.dead = D.add(player_data.dead, 1);

                // Wipe
                data.plant = '';
                data.age = D.dZero;
            }
        });
        // Ensure that the player always has wheat by checking for 1 wheat seed or 1 planted wheat seed
        if (player.p.plants.wheat.seeds.lt(1) &&
            !Object.entries(player.p.grid).some(([id, data]) => {
                if (data.plant != 'wheat') return false;
                const row = Math.floor(id / 100),
                    col = id % 100;

                return row > 0 && row <= tmp.p.grid.rows && col > 0 && col <= tmp.p.grid.cols;
            })) {
            player.p.plants.wheat.seeds = D.add(player.p.plants.wheat.seeds, diff);
        }
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['mode', 'plant', 'infuse_target', 'infuse_item'];

        layerDataReset(this.layer, keep);
        Object.keys(player.p.plants).forEach(plant => Object.assign(player.p.plants[plant], {
            dead: D.dZero,
            harvested: D.dZero,
            // Since there are no upgrades, keep an amount of seeds
            seeds: player.p.plants[plant].seeds.min(buyableEffect('lo', 62).t_hold.pow(tmp.a.change_efficiency)),
            last_harvest: [],
            last_harvest_seeds: D.dZero,
            last_harvest_count: D.dZero,
        }))
    },
    branches: [[() => player.f.unlocked ? 'f' : 'lo', 3]],
    prestigeNotify() {
        return Object.values(player.p.plants).some(data => D.gte(data.seeds, 1)) &&
            Object.entries(player.p.grid)
                .some(([id, data]) =>
                    Math.floor(id / 100) > 0 && Math.floor(id / 100) <= tmp.p.grid.rows &&
                    id % 100 > 0 && id % 100 <= tmp.p.grid.cols &&
                    data.plant == ''
                );
    },
    shouldNotify() {
        return Object.keys(layers.p.plants).some(plant => tmp.p.plants[plant].notify);
    },
});
