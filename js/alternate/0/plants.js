'use strict';

addLayer('p', {
    name: 'Plants',
    symbol: 'P',
    startData() {
        return {
            unlocked: false,
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
                    auto_replant: false,
                    auto_harvest: false,
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
                () => {
                    if (tmp.p.plants['*'].harvest_mult.neq(1))
                        return [
                            'display-text',
                            `Harvest yield multiplier: *${format(tmp.p.plants['*'].harvest_mult)}`,
                        ];
                },
                [
                    'row',
                    () => Object.keys(layers.p.plants)
                        .filter(id => tmp.p.plants[id].unlocked ?? true)
                        .map(id => ['clickable', `quick_${id}`])
                ],
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
                ['display-text', () => `Grow speed: *${format(tmp.p.plants['*'].grow_mult)}`],
                'blank',
                ['row', [
                    ['display-text', 'Currently planting'],
                    'blank',
                    ['drop-down-double', ['plant', () => [['', 'nothing'], ...tmp.p.plants['*'].list.map(plant => [plant, tmp.p.plants[plant].name])]]],
                ]],
                'blank',
                [
                    'layer-table',
                    () => {
                        const headers = ['Name', 'Life', 'Effect', 'Amount'],
                            auto = hasAchievement('bl', 31) || false;
                        if (auto) headers.push('Auto');
                        return [
                            headers,
                            ...tmp.p.plants['*'].list.map(plant_id => {
                                const plant = tmp.p.plants[plant_id],
                                    produces = plant.produces.map(item => ['display-text', `${format(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`]),

                                    content = [
                                        [['display-text', capitalize(plant.name)]],
                                        [
                                            ['display-text', `Maturation: ${formatTime(plant_maturation_time(plant_id))}`],
                                            ['display-text', `Lifespan: ${formatTime(plant_lifespan(plant_id))}`]
                                        ],
                                        [['display-text', plant.effect_text ?? 'None']],
                                        [['display-text', `${format(player.p.plants[plant_id].seeds)} seeds`], 'h-line', ...produces],
                                    ];

                                if (auto) content.push([
                                    ['clickable', `auto_replant_${plant_id}`],
                                    ['clickable', `auto_harvest_${plant_id}`],
                                ]);

                                return content;
                            })
                        ];
                    },
                ],
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
                    ['clickable', 'infuse'],
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
                [
                    'layer-table',
                    () => {
                        /** @type {[string, items][]} */
                        const infusions = tmp.p.plants['*'].list.map(
                            plant => Object.entries(tmp.p.plants[plant].infusions)
                                .filter(([, result]) => tmp.p.plants[result].unlocked && player.p.plants[plant].infusions.includes(result))
                                .map(([item]) => [plant, item])
                        ).flat();

                        return [
                            ['Base', 'Item', 'Result', 'Infuse'],
                            ...infusions.map(([plant, item]) => [
                                [['display-text', capitalize(tmp.p.plants[plant].name)]],
                                [['display-text', capitalize(tmp.lo.items[item].name)]],
                                [['display-text', capitalize(tmp.p.plants[tmp.p.plants[plant].infusions[item]].name)]],
                                [['clickable', `infuse_${plant}-${item}`]],
                            ])
                        ];
                    },
                ],
                ['column', () => {
                    const locked = Object.keys(tmp.p.plants).filter(plant => plant != '*' && !tmp.p.plants[plant].unlocked && tmp.p.plants[plant].hint);
                    if (!locked.length) return;
                    /**
                     * @param {string} plant
                     */
                    const row = plant => `${(tmp.p.plants[plant].unlocked ?? true) ? capitalize(tmp.p.plants[plant].name) : '???'}: ${tmp.p.plants[plant].hint}`;

                    return [
                        'blank',
                        ['display-text', 'Infusion hints'],
                        ...locked.map(plant => ['display-text', row(plant)]),
                    ]
                }],
            ],
        },
        'Ranch': {
            content: [
                ['layer-proxy', ['r', ['grid']]],
            ],
            unlocked() { return player.r.unlocked; },
        },
        //todo ranch tab
        //todo animals tab
    },
    clickables: new Proxy({}, {
        /** @returns {Clickable<'p'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'p';

            if (prop in obj) return obj[prop];

            if (prop == 'infuse') {
                return obj[prop] ??= {
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
                            gain_items(item, -1);
                            player.p.plants[result].seeds = D.add(player.p.plants[result].seeds, 1);
                        }
                    },
                };
            }

            const matches_select = layers.p.plants['*'].regexes.select.exec(prop);
            if (matches_select) {
                /** @type {[string, 'quick', plants]} */
                const [, , plant] = matches_select;

                return obj[prop] ??= {
                    canClick() {
                        return player.p.plant == plant ||
                            D.gte(player.p.plants[plant].seeds, 1) ||
                            Object.values(player.p.grid).some(data => data.plant == plant);
                    },
                    onClick() {
                        if (player.p.plant == plant) player.p.plant = '';
                        else player.p.plant = plant;
                    },
                    display() { return `${capitalize(tmp.p.plants[plant].name)}<br>${format(player.p.plants[plant].seeds)}`; },
                    style() {
                        let base = {},
                            plant_style = {};
                        const cant = {};

                        if (player.p.plant == plant) base['box-shadow'] = `${tmp.p.color} 0 0 20px`;
                        if (!tmp[this.layer].clickables[this.id].canClick) {
                            cant['background'] = '#bf8f8f';
                            cant['cursor'] = 'not-allowed';
                        } else {
                            plant_style = tmp.p.plants[plant].style.general;
                        }

                        return Object.assign(
                            base,
                            {
                                'height': '80px',
                                'width': '80px',
                                'min-height': 'unset',
                            },
                            plant_style,
                            cant,
                        );
                    },
                    unlocked: true,
                };
            }

            const matches_infusion = layers.p.plants['*'].regexes.infuse.exec(prop);
            if (matches_infusion) {
                /** @type {[string, 'infuse', plants, items]} */
                const [, , plant, item] = matches_infusion;
                return obj[prop] ??= {
                    canClick() {
                        return D.gte(player.p.plants[plant].seeds, 1) &&
                            D.gte(player.lo.items[item].amount, 1) &&
                            player.p.plants[plant].infusions.includes(tmp.p.plants[plant].infusions[item]);
                    },
                    onClick() {
                        player.p.plants[plant].seeds = D.minus(player.p.plants[plant].seeds, 1);
                        const result = tmp.p.plants[plant].infusions[item];
                        gain_items(item, -1);
                        player.p.plants[result].seeds = D.add(player.p.plants[result].seeds, 1);
                    },
                    style() {
                        let base = {
                            'background-image': `url('./resources/images/crafting.svg')`,
                            'background-repeat': 'no-repeat',
                            'background-position': 'center',
                        },
                            plant_style = {};
                        const cant = {};

                        if (!tmp[this.layer].clickables[this.id].canClick) {
                            cant['background'] = `url('./resources/images/crafting.svg') #bf8f8f no-repeat center`;
                            cant['cursor'] = 'not-allowed';
                        } else {
                            plant_style = tmp.p.plants[tmp.p.plants[plant].infusions[item]].style.general;
                        }

                        return Object.assign(
                            base,
                            {
                                'height': '60px',
                                'min-height': 'unset',
                            },
                            plant_style,
                            cant,
                        );
                    },
                    unlocked() { return player.p.plants[plant].infusions.includes(tmp.p.plants[plant].infusions[item]); },
                    display() {
                        return `${format(player.p.plants[plant].seeds)} ${tmp.p.plants[plant].name} seeds<br>\
                            ${format(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`;
                    },
                };
            }

            const matches_auto = layers.p.plants['*'].regexes.auto.exec(prop);
            if (matches_auto) {
                /** @type {[string, 'replant'|'harvest', plants]} */
                const [, type, plant] = matches_auto;

                return {
                    canClick: true,
                    onClick() {
                        switch (type) {
                            case 'replant':
                                player.p.plants[plant].auto_replant = !player.p.plants[plant].auto_replant;
                                break;
                            case 'harvest':
                                player.p.plants[plant].auto_harvest = !player.p.plants[plant].auto_harvest;
                        }
                    },
                    display() {
                        let type_name, enabled;
                        switch (type) {
                            case 'replant':
                                type_name = 'replant';
                                enabled = player.p.plants[plant].auto_replant;
                                break;
                            case 'harvest':
                                type_name = 'harvest';
                                enabled = player.p.plants[plant].auto_replant;
                        }
                        return `Auto ${type_name}<br>${enabled ? 'ON' : 'OFF'}`;
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' ||
                layers.p.plants['*'].regexes.select.exec(prop) ||
                layers.p.plants['*'].regexes.infuse.exec(prop) ||
                prop == 'infuse') return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) {
            return layers.p.plants['*'].regexes.select.exec(prop) ||
                layers.p.plants['*'].regexes.infuse.exec(prop) ||
                prop == 'layer';
        },
        ownKeys() {
            return [
                'infuse',
                ...Object.keys(layers.p.plants).map(plant => `quick_${plant}`),
                ...Object.values(layers.p.plants)
                    .filter(plant => 'infusions' in plant)
                    .map(plant => Object.keys(plant.infusions).map(item => `infuse_${plant.id}-${item}`)).flat(),
            ];
        },
    }),
    grid: {
        cols() {
            let cols = 5;

            if (hasUpgrade('c', 84)) cols += upgradeEffect('c', 84);

            return cols;
        },
        maxCols: 6,
        rows() {
            let rows = 5;

            if (hasUpgrade('c', 104)) rows += upgradeEffect('c', 104);

            return rows;
        },
        maxRows: 6,
        getStartData(_) {
            return {
                plant: '',
                age: D.dZero,
            };
        },
        getCanClick(data, _) {
            return data.plant != '' || (
                player.p.plant != '' &&
                (tmp.p.plants[player.p.plant].unlocked ?? true) &&
                D.gte(player.p.plants[player.p.plant].seeds, 1)
            );
        },
        onClick(data, _) {
            if (data.plant != '') {
                // prevent accidental double clicking
                if (D.lt(data.age, 1)) return;
                // Get items
                const stage = tmp.p.plants[data.plant].times[plant_age_index(data.plant, data.age)][1],
                    drops = layers.p.plants[data.plant].produce(stage),
                    player_data = player.p.plants[data.plant];
                let seeds = layers.p.plants[data.plant].seeds(stage);
                const equal = drops.length == player_data.last_harvest.length &&
                    seeds.eq(player_data.last_harvest_seeds) &&
                    drops.every(([item, amount]) => player_data.last_harvest.some(([litem, lamount]) => litem == item && D.eq(lamount, amount)));

                if (tmp.p.plants['*'].auto.replant && player.p.plants[data.plant].auto_replant) {
                    seeds = seeds.minus(1);
                }

                gain_items(drops);
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
                if (!tmp.p.plants['*'].auto.replant || !player.p.plants[data.plant].auto_replant) {
                    data.plant = '';
                }
                data.age = D.dZero;
            } else if (
                player.p.plant != '' &&
                (tmp.p.plants[player.p.plant].unlocked ?? true) &&
                D.gte(player.p.plants[player.p.plant].seeds, 1)
            ) {
                data.plant = player.p.plant;
                data.age = D.dZero;
                player.p.plants[data.plant].seeds = D.minus(player.p.plants[data.plant].seeds, 1);
            }
        },
        getStyle(data, _) {
            if (!(data.plant in layers.p.plants)) return {};

            const plant = tmp.p.plants[data.plant],
                nega = data.age.lt(0),
                negastyle = {
                    'transform': `scaleY(-1)`,
                    'filter': `invert(1)`,
                    'z-index': 10,
                };
            const image = plant.images[plant_age_index(data.plant, data.age)];

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
            let text = 'Empty';
            if (data?.plant in tmp.p.plants) text = capitalize(tmp.p.plants[data.plant].name);

            if (hasAchievement('bl', 33)) text += `Aged ${formatTime(data.age)}`;

            return text;
        },
    },
    plants: {
        '*': {
            list() {
                return Object.keys(layers.p.plants).filter(plant => plant != '*' && (tmp.p.plants[plant].unlocked ?? true));
            },
            harvest_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 64)) mult = mult.times(upgradeEffect('c', 64));

                mult = mult.times(tmp.p.plants.sunflower.effect);

                if (hasMilestone('to', 5)) mult = mult.times(tmp.to.milestones[5].effect);

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['p'] ?? 1);

                mult = mult.times(tmp.k.dishes.failure.effect);

                mult = mult.times(tmp.k.dishes.grilled_corn.effect);

                if (hasUpgrade('v', 13)) mult = mult.times(upgradeEffect('v', 13));

                return mult;
            },
            grow_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 74)) mult = mult.times(upgradeEffect('c', 74));

                mult = mult.times(tmp.p.plants.clockberry.effect);

                mult = mult.times(tmp.k.dishes.roasted_eggplant.effect);
                mult = mult.times(tmp.k.dishes.coffee.effect.plant);

                if (hasUpgrade('v', 33)) mult = mult.times(upgradeEffect('v', 33));

                return mult;
            },
            seeds_mult() {
                let mult = D.dOne;

                mult = mult.times(buyableEffect('fr', 31).seed);

                return mult;
            },
            regexes: {
                select: /^(quick)_([a-z_]+)$/,
                infuse: /^(infuse)_([a-z_]+)-([a-z_]+)$/,
                auto: /^auto_(replant|harvest)_([a-z_]+)$/,
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
            times: [
                [30, 'growing'],
                [30, 'growing'],
                [30, 'growing'],
                [30, 'growing'],
                [180, 'mature'],
                [60, 'wilting']
            ],
            images: [
                'resources/images/plants/wheat/age1.png',
                'resources/images/plants/wheat/age2.png',
                'resources/images/plants/wheat/age3.png',
                'resources/images/plants/wheat/age4.png',
                'resources/images/plants/wheat/age5.png',
                'resources/images/plants/wheat/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['wheat'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.5);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
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
            times: [
                [60, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [4 * 60, 'mature'],
                [2 * 60, 'wilting'],
            ],
            images: [
                'resources/images/plants/copper_wheat/age1.png',
                'resources/images/plants/copper_wheat/age2.png',
                'resources/images/plants/copper_wheat/age3.png',
                'resources/images/plants/copper_wheat/age4.png',
                'resources/images/plants/copper_wheat/age5.png',
                'resources/images/plants/copper_wheat/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['copper_ore', 'wheat'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.1);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
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
            times: [
                [60, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [360, 'mature'],
                [60, 'wilting'],
            ],
            images: [
                'resources/images/plants/corn/age1.png',
                'resources/images/plants/corn/age2.png',
                'resources/images/plants/corn/age3.png',
                'resources/images/plants/corn/age4.png',
                'resources/images/plants/corn/age5.png',
                'resources/images/plants/corn/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['corn'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.25);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
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
            times: [
                [90, 'growing'],
                [90, 'growing'],
                [90, 'growing'],
                [90, 'growing'],
                [600, 'mature'],
                [120, 'wilting'],
            ],
            images: [
                'resources/images/plants/candy_corn/age1.png',
                'resources/images/plants/candy_corn/age2.png',
                'resources/images/plants/candy_corn/age3.png',
                'resources/images/plants/candy_corn/age4.png',
                'resources/images/plants/candy_corn/age5.png',
                'resources/images/plants/candy_corn/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['corn'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.1);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
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
                    /** @type {{[stage: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = plant_age_index(this.id, data.age);

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
            times: [
                [90, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [120, 'growing'],
                [330, 'mature'],
                [120, 'wilting'],
            ],
            images: [
                'resources/images/plants/strawberry/age1.png',
                'resources/images/plants/strawberry/age2.png',
                'resources/images/plants/strawberry/age3.png',
                'resources/images/plants/strawberry/age4.png',
                'resources/images/plants/strawberry/age5.png',
                'resources/images/plants/strawberry/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['strawberry'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.25);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
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
            times: [
                [90, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [120, 'growing'],
                [1200, 'mature'],
                [300, 'wilting'],
            ],
            images: [
                'resources/images/plants/clockberry/age1.png',
                'resources/images/plants/clockberry/age2.png',
                'resources/images/plants/clockberry/age3.png',
                'resources/images/plants/clockberry/age4.png',
                'resources/images/plants/clockberry/age5.png',
                'resources/images/plants/clockberry/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['strawberry'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.1);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
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
                    amounts = planted.reduce((set, data) => {
                        const i = plant_age_index(this.id, data.age);

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
            times: [
                [120, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [120, 'growing'],
                [240, 'mature'],
                [120, 'wilting'],
            ],
            images: [
                'resources/images/plants/sunflower/age1.png',
                'resources/images/plants/sunflower/age2.png',
                'resources/images/plants/sunflower/age3.png',
                'resources/images/plants/sunflower/age4.png',
                'resources/images/plants/sunflower/age5.png',
                'resources/images/plants/sunflower/age6.png',
            ],
            produce(stage) { return []; },
            produces: [],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.25);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify: false,
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
                    amounts = planted.reduce((set, data) => {
                        const i = plant_age_index(this.id, data.age);

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
            times: [
                [120, 'growing'],
                [120, 'growing'],
                [120, 'growing'],
                [120, 'growing'],
                [1800, 'mature'],
                [120, 'wilting'],
            ],
            images: [
                'resources/images/plants/starflower/age1.png',
                'resources/images/plants/starflower/age2.png',
                'resources/images/plants/starflower/age3.png',
                'resources/images/plants/starflower/age4.png',
                'resources/images/plants/starflower/age5.png',
                'resources/images/plants/starflower/age6.png',
            ],
            produce(stage) { return []; },
            produces: [],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.1);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
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
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = plant_age_index(this.id, data.age);

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
            times: [
                [60, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [240, 'mature'],
                [120, 'wilting'],
            ],
            images: [
                'resources/images/plants/potato/age1.png',
                'resources/images/plants/potato/age2.png',
                'resources/images/plants/potato/age3.png',
                'resources/images/plants/potato/age4.png',
                'resources/images/plants/potato/age5.png',
                'resources/images/plants/potato/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['potato'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.25);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
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
            times: [
                [90, 'growing'],
                [90, 'growing'],
                [90, 'growing'],
                [90, 'growing'],
                [600, 'mature'],
                [240, 'wilting'],
            ],
            images: [
                'resources/images/plants/potato_battery/age1.png',
                'resources/images/plants/potato_battery/age2.png',
                'resources/images/plants/potato_battery/age3.png',
                'resources/images/plants/potato_battery/age4.png',
                'resources/images/plants/potato_battery/age5.png',
                'resources/images/plants/potato_battery/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['potato'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.1);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
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
                    /** @type {{[age: number]: Decimal}} */
                    amounts = planted.reduce((set, data) => {
                        const i = plant_age_index(this.id, data.age);

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
            times: [
                [90, 'growing'],
                [90, 'growing'],
                [60, 'growing'],
                [60, 'growing'],
                [480, 'mature'],
                [120, 'wilting'],
            ],
            images: [
                'resources/images/plants/eggplant/age1.png',
                'resources/images/plants/eggplant/age2.png',
                'resources/images/plants/eggplant/age3.png',
                'resources/images/plants/eggplant/age4.png',
                'resources/images/plants/eggplant/age5.png',
                'resources/images/plants/eggplant/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['eggplant'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.25);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
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
            times: [
                [150, 'growing'],
                [150, 'growing'],
                [150, 'growing'],
                [150, 'growing'],
                [3000, 'mature'],
                [300, 'wilting'],
            ],
            images: [
                'resources/images/plants/egg_plant/age1.png',
                'resources/images/plants/egg_plant/age2.png',
                'resources/images/plants/egg_plant/age3.png',
                'resources/images/plants/egg_plant/age4.png',
                'resources/images/plants/egg_plant/age5.png',
                'resources/images/plants/egg_plant/age6.png',
            ],
            produce(stage) {
                switch (stage) {
                    case 'growing': return [];
                    case 'mature': return get_type_drops(`plant:${this.id}`, tmp.p.plants['*'].harvest_mult);
                    case 'wilting': return get_type_drops(`plant:${this.id}:old`, tmp.p.plants['*'].harvest_mult);
                }
            },
            produces: ['egg'],
            seeds(stage) {
                if (stage == 'growing') return D.dOne;

                let seeds = D(1.1);

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    seeds = seeds.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    seeds = seeds.div(D.add(player.p.plants[this.id].seeds.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                seeds = seeds.times(tmp.p.plants['*'].seeds_mult);

                if (stage == 'wilting') seeds = seeds.sqrt();

                return seeds;
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, plant_maturation_time(this.id))); },
            infusions: {},
            unlocked() { return player.p.plants.eggplant.infusions.includes(this.id); },
            hint() { if (tmp.p.plants.eggplant.unlocked) return 'Add something... circular?'; },
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        const grow = D.times(diff, tmp.p.plants['*'].grow_mult);

        Object.entries(player.p.grid).forEach(([, data]) => {
            if (data.plant == '') return;

            data.age = D.add(data.age, grow);

            let drops = [],
                seeds = D.dZero;
            const plant_id = data.plant,
                player_data = player.p.plants[plant_id];

            if (D.gte(data.age, plant_lifespan(plant_id))) {
                // Oops, plant is dead
                drops = layers.p.plants[plant_id].produce('wilting');
                seeds = layers.p.plants[plant_id].seeds('wilting');
            } else if (tmp.p.plants['*'].auto.harvest &&
                player_data.auto_harvest &&
                data.age.gte(plant_maturation_time(plant_id))) {
                // Auto harvest
                drops = layers.p.plants[plant_id].produce('mature');
                seeds = layers.p.plants[plant_id].seeds('mature');
            } else {
                // Do nothing
                return;
            }

            const equal = drops.length == player_data.last_harvest.length &&
                seeds.eq(player_data.last_harvest_seeds) &&
                drops.every(([item, amount]) => player_data.last_harvest.some(([litem, lamount]) => litem == item && D.eq(lamount, amount)));

            if (equal) {
                player_data.last_harvest_count = D.add(player_data.last_harvest_count, 1);
            } else {
                player_data.last_harvest_count = D.dOne;
                player_data.last_harvest = drops;
                player_data.last_harvest_seeds = seeds;
            }
            player.p.last_harvest = plant_id;

            gain_items(drops);

            player_data.seeds = D.add(player_data.seeds, seeds);
            player_data.dead = D.add(player_data.dead, 1);

            // Wipe
            if (!tmp.p.plants['*'].auto.replant || !player.p.plants[data.plant].auto_replant) {
                data.plant = '';
            }
            data.age = D.dZero;
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

        if (layer == 'v_soft') {
            const max_seeds = D.add(buyableEffect('lo', 62).t_hold.pow(tmp.a.change_efficiency), buyableEffect('fr', 31).p_hold),
                hold = Object.entries(player.p.plants).map(([plant, data]) => [plant, {
                    seeds: D.min(max_seeds, data.seeds),
                }]);
            hold.forEach(([plant, data]) => Object.assign(player.p.plants[plant], {
                dead: D.dZero,
                harvested: D.dZero,
                seeds: data.seeds,
                last_harvest: [],
                last_harvest_seeds: D.dZero,
                last_harvest_count: D.dZero,
            }));
            player.p.grid = getStartGrid(this.layer);
            return;
        }

        const keep = ['mode', 'plant', 'infuse_target', 'infuse_item'],
            max_seeds = D.add(buyableEffect('lo', 62).t_hold.pow(tmp.a.change_efficiency), buyableEffect('fr', 31).p_hold),
            hold = Object.entries(player.p.plants).map(([plant, data]) => [plant, {
                seeds: D.min(max_seeds, data.seeds),
                auto_replant: data.auto_replant,
                auto_harvest: data.auto_harvest,
            }]);

        layerDataReset(this.layer, keep);
        hold.forEach(([plant, data]) => Object.assign(player.p.plants[plant], {
            dead: D.dZero,
            harvested: D.dZero,
            seeds: data.seeds,
            last_harvest: [],
            last_harvest_seeds: D.dZero,
            last_harvest_count: D.dZero,
            auto_replant: data.auto_replant,
            auto_harvest: data.auto_harvest,
        }));
    },
    branches: [() => {
        if (player.fr.unlocked) return 'fr';
        if (player.f.unlocked) return ['f', 3];
        return ['lo', 3];
    }],
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
addLayer('r', {
    name: 'Ranch',
    symbol: 'R',
    startData() {
        return {
            unlocked: false,
            animals: Object.fromEntries(
                Object.keys(layers.r.animals)
                    .filter(animal => animal != '*')
                    .map(/**@param{animals}animal*/animal => [animal, {
                        killed: D.dZero,
                        last_kill: [],
                        last_kill_count: D.dZero,
                    }])
            ),
            last_kill: '',
        };
    },
    layerShown: false,
    color: '#CC8800',
    row: 0,
    position: 2.75,
    resource: 'animals',
    animals: {
        '*': {
            age_speed() { return D.dOne; },
        },
        milk_slime: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.r.animals).find(plant => layers.r.animals[plant] == this); },
            item: 'wheat',
            style: {
                grid: {
                    'background': `url('./resources/images/transparent-slime.svg') no-repeat center, white`,
                },
            },
            nextAt(amount) {
                amount ??= D.add(
                    Object.keys(player.r.grid)
                        .filter(id => is_grid_visible(id, tmp.r.grid.rows, tmp.r.grid.cols) && player.r.grid[id].animal == this.id)
                        .length,
                    player.r.animals[this.id].killed
                );

                return D.pow(10, amount).times(10);
            },
        },
        /**
         * hamgoblin https://game-icons.net/1x1/caro-asercion/goblin.html
         *  -> ham
         * zombee https://game-icons.net/1x1/lorc/bee.html
         *  -> honey
         * coffeent https://game-icons.net/1x1/delapouite/berry-bush.html
         *  -> coffee beans
         */
    },
    //todo bars (Proxy)
    grid: {
        rows: 7,
        cols: 7,
        getStartData(id) {
            return {
                age: D.dZero,
                animal: '',
            };
        },
        getCanClick(data, _) { return data.animal != ''; },
        getStyle(data, _) {
            if (!data.animal) return {};
            const nega = D.lt(data.age, 0),
                negastyle = {
                    'transform': `scaleY(-1)`,
                    'filter': `invert(1)`,
                    'z-index': 10,
                };

            return Object.assign(
                {},
                tmp.r.animals[data.animal].style.grid,
                nega ? negastyle : {},
            );
        },
        onClick(data, _) {
            if (!data.animal || D.lte(data.age, 0)) return;

            const drops = get_animal_drops(data.animal, data.age),
                player_data = player.r.animals[data.animal],
                equal = drops.length == player_data.last_kill.length &&
                    drops.every(([item, amount]) => player_data.last_kill.some(([litem, lamount]) => litem == item && D.eq_tolerance(lamount, amount, 1e-3)));

            gain_items(drops);

            if (equal) {
                player_data.last_kill_count = D.add(player_data.last_kill_count, 1);
            } else {
                player_data.last_kill_count = D.dOne;
                player_data.last_kill = drops;
            }
            player_data.killed = D.add(player_data.killed, 1);

            player.r.last_kill = data.animal;

            data.age = D.dZero;
            data.animal = '';
        },
        getTooltip(data, _) {
            if (data.animal == '') return;
            return capitalize(tmp.r.animals[data.animal].name);
        },
    },
    //todo automate
    //  randomly move animals to a random neighbor
    //  spawn new animals when space is available
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        layerDataReset(this.layer);
        Object.values(player.r.animals).forEach(data => Object.assign(data, {
            killed: D.dZero,
            last_kill_count: D.dZero,
        }));
    },
});
