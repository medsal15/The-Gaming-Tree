'use strict';

//todo
addLayer('c', {
    name: 'City',
    symbol: 'C',
    /** @returns {typeof player.c} */
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            resources: {
                science: D.dZero,
            },
            mode: 'place',
            building: '',
        };
    },
    //tooltip() {return `${format(0)} buildings`;},
    layerShown() { return player.c.unlocked; },
    color: '#666677',
    row: 0,
    position: 1.5,
    resource: 'buildings',
    hotkeys: [
        {
            key: 'c',
            description: 'C: Display city layer',
            unlocked() { return tmp.m.layerShown; },
            onPress() { showTab('c'); },
        },
    ],
    tabFormat: {
        'City': {
            content: [
                [
                    'display-text',
                    () => {
                        const mode = {
                            'place': 'placing buildings',
                            'destroy': 'destroying buildings',
                            'toggle': 'toggling buildings',
                        }[player.c.mode];
                        return `Current mode: ${mode}`;
                    },
                ],
                ['row', [
                    ['clickable', 'place'],
                    'blank',
                    ['clickable', 'destroy'],
                    'blank',
                    ['clickable', 'toggle'],
                ]],
                'blank',
                'grid',
            ],
        },
        'Buildings': {
            content: [
                ['column', () => Object.keys(layers.c.buildings).map(id => layers.c.buildings['*'].show_building(id))],
            ],
        },
        'Research': {
            content: [
                //todo
            ],
            unlocked() { return false; },
        },
    },
    grid: {
        cols: 5,
        rows: 5,
        getStartData(_) {
            return {
                building: '',
                enabled: true,
            };
        },
        /** @param {Player['c']['grid'][number]} data */
        getCanClick(data, _) {
            switch (player.c.mode) {
                case 'place':
                    return data.building == '' &&
                        player.c.building != '' &&
                        D.gte(getBuyableAmount('c', player.c.building), D.add(tmp.c.buildings['*'].placed[player.c.building], 1));
                case 'destroy':
                case 'toggle':
                    return data.building != '';
            }
        },
        /** @param {Player['c']['grid'][number]} data */
        onClick(data, _) {
            switch (player.c.mode) {
                case 'place':
                    if (
                        data.building == '' &&
                        player.c.building != '' &&
                        D.gte(getBuyableAmount('c', player.c.building), D.add(tmp.c.buildings['*'].placed[player.c.building], 1))
                    ) data.building = player.c.building;
                    return;
                case 'destroy':
                    if (data.building != '') data.building = '';
                    return;
                case 'toggle':
                    data.enabled = !data.enabled;
                    return;
            }
        },
        /** @param {Player['c']['grid'][number]} data */
        getStyle(data, _) {
            if (!(data.building in tmp.c.buildings)) return {};

            const building = tmp.c.buildings[data.building];

            return Object.assign(
                {
                    'font-size': '1em',
                }, // Ensures that general style is not overwritten
                building.style.general,
                building.style.grid ?? {},
            );
        },
        /** @param {Player['c']['grid'][number]} data */
        getTooltip(data, _) {
            if (data?.building in tmp.c.buildings) return capitalize(tmp.c.buildings[data.building].name);
            return 'Empty';
        },
        /** @param {Player['c']['grid'][number]} data */
        getDisplay(data, _) {
            if (data?.building in tmp.c.buildings) return data.enabled ? 'ON' : 'OFF';
        },
    },
    buyables: new Proxy({}, {
        /** @returns {Buyable<'c'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'c';

            if (prop in obj) return obj[prop];

            if (prop in layers.c.buildings && prop != '*') {
                const tmpuilding = () => tmp.c.buildings[prop];

                return obj[prop] ??= {
                    title() { return capitalize(tmpuilding().name); },
                    display() {
                        const cost = listFormat.format(tmpuilding().cost.map(([item, cost]) => {
                            let c;
                            if (shiftDown) c = `[${tmpuilding().formulas.cost.find(([i]) => i == item)[1]}]`;
                            else c = format(cost);

                            return `${c} ${tmp.lo.items[item].name}`;
                        }));

                        return `Cost: ${cost}`;
                    },
                    cost(x) { return layers.c.buildings[prop].cost(x); },
                    unlocked() { return tmpuilding().unlocked ?? true; },
                    canAfford() { return Array.isArray(tmpuilding().cost) && tmpuilding().cost.every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)); },
                    buy() {
                        tmpuilding().cost.forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                        addBuyables(this.layer, this.id, 1);
                    },
                    style() {
                        const style = {
                            'height': '120px',
                            'width': '120px',
                            'min-height': 'unset',
                        },
                            cant = {
                                'background': '#bf8f8f',
                                'cursor': 'not-allowed',
                            };

                        return Object.assign(
                            style,
                            tmpuilding().style.general,
                            tmpuilding().style.buyable ?? {},
                            canBuyBuyable(this.layer, this.id) ? {} : cant,
                        );
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || prop in layers.c.buildings) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop in layers.c.buildings; },
        ownKeys(_) { return Object.keys(layers.c.buildings).filter(id => id != '*'); },
    }),
    clickables: new Proxy({}, {
        /** @returns {Clickable<'c'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'c';

            if (prop in obj) return obj[prop];

            if (prop == 'place') {
                return obj[prop] ??= {
                    display: 'Set current mode to place buildings',
                    canClick() { return player.c.mode != 'place'; },
                    onClick() { player.c.mode = 'place'; },
                };
            }
            if (prop == 'destroy') {
                return obj[prop] ??= {
                    display: 'Set current mode to destroy buildings',
                    canClick() { return player.c.mode != 'destroy'; },
                    onClick() { player.c.mode = 'destroy'; },
                };
            }
            if (prop == 'toggle') {
                return obj[prop] ??= {
                    display: 'Set current mode to toggle buildings',
                    canClick() { return player.c.mode != 'toggle'; },
                    onClick() { player.c.mode = 'toggle'; },
                };
            }

            const matches = layers.c.buildings['*'].regex.exec(prop);
            if (matches) {
                /** @type {[string, 'select', string]} */
                const [, , building] = matches;

                return obj[prop] ??= {
                    canClick() { return D.gte(getBuyableAmount('c', building), D.add(tmp.c.buildings['*'].placed[building], 1)); },
                    onClick() {
                        if (player.c.building == building) player.c.building = '';
                        else player.c.building = building;
                    },
                    display() { return `Select ${tmp.c.buildings[building].name}`; },
                    style() {
                        const base = {},
                            cant = {
                                'background': '#bf8f8f',
                                'cursor': 'not-allowed',
                            };

                        if (player.c.building == building) base['box-shadow'] = `${tmp.c.color} 0 0 20px`;

                        return Object.assign(
                            base,
                            tmp.c.buildings[building].style.general,
                            tmp.c.buildings[building].style.select,
                            tmp[this.layer].clickables[this.id].canClick ? {} : cant,
                        );
                    },
                    unlocked: true,
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' ||
                layers.c.buildings['*'].regex.exec(prop) ||
                ['place', 'destroy', 'toggle'].includes(prop)) return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) { return layers.c.buildings['*'].regex.exec(prop) || ['place', 'destroy', 'toggle'].includes(prop); },
        ownKeys(_) {
            return [
                'place',
                'destroy',
                'toggle',
                ...Object.keys(layers.c.buildings).map(id => `select_${id}`),
            ];
        },
    }),
    //todo upgrades
    /** @type {Layers['c']['resources']} */
    resources: {
        science: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.resources).find(item => layers.c.resources[item] == this); },
            name: 'science',
            color: '#DDCCFF',
        }
    },
    /** @type {Layers['c']['buildings']} */
    buildings: {
        '*': {
            regex: /^(select)_([a-z_]+)$/,
            placed() {
                return Object.entries(player.c.grid).reduce((sum, [id, data]) => {
                    // Check if id is in the grid
                    if (
                        Math.floor(id / 100) <= layers.c.grid.rows &&
                        id % 100 <= layers.c.grid.cols &&
                        data.enabled
                    ) sum[data.building] = D.add(sum[data.building], 1);
                    return sum;
                }, {});
            },
            show_building(building) {
                if (building == '*' || !(building in tmp.c.buildings) || !(tmp.c.buildings[building].unlocked ?? true)) return;

                return ['row', [
                    ['buyable', building],
                    'blank',
                    ['display-text', tmp.c.buildings[building].description],
                    'blank',
                    ['clickable', `select_${building}`],
                ]];
            },
            produce_mult() {
                return D.dOne;
            },
        },
        quarry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'stone quarry',
            description() {
                const building = tmp.c.buildings[this.id],
                    placed = tmp.c.buildings['*'].placed[this.id] ?? D.dZero,
                    total = getBuyableAmount('c', this.id),
                    /** @type {string[]} */
                    production_parts = [],
                    produces = building.produces;

                if ('items' in produces) {
                    production_parts.push(
                        ...produces.items
                            .map(([item, amount]) => `+${format(amount)} ${tmp.lo.items[item].name}`)
                    );
                }
                if ('resources' in produces) {
                    production_parts.push(
                        ...produces.resources
                            .map(([resource, amount]) => `<span style="color:${tmp.c.resources[resource].color};">+${format(amount)}</span> ${tmp.c.resources[resource].name}`)
                    );
                }

                return `You have ${formatWhole(placed)} / ${formatWhole(total)} ${building.name}<br>\
                    They produce ${listFormat.format(production_parts)} /s<br>`;
            },
            style: {
                general: {
                    'background-color': '#BBBBBB',
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].placed[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['stone', D(1 / 15)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10());
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                let stone = D.pow(built, 1.1).times(10);

                return [['stone', stone]];
            },
            formulas: {
                cost: [['stone', '(built ^ 1.1) * 10']],
            },
        },
        mine: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'mine',
            description() {
                const building = tmp.c.buildings[this.id],
                    placed = tmp.c.buildings['*'].placed[this.id] ?? D.dZero,
                    total = getBuyableAmount('c', this.id),
                    /** @type {string[]} */
                    production_parts = [],
                    produces = building.produces;

                if ('items' in produces) {
                    production_parts.push(
                        ...produces.items
                            .map(([item, amount]) => `+${format(amount)} ${tmp.lo.items[item].name}`)
                    );
                }
                if ('resources' in produces) {
                    production_parts.push(
                        ...produces.resources
                            .map(([resource, amount]) => `<span style="color:${tmp.c.resources[resource].color};">+${format(amount)}</span> ${tmp.c.resources[resource].name}`)
                    );
                }

                return `You have ${formatWhole(placed)} / ${formatWhole(total)} ${building.name}<br>\
                    They produce ${listFormat.format(production_parts)} /s<br>`;
            },
            style: {
                general: {
                    'background': 'linear-gradient(to right, #BB7733, #CCBB88)',
                    'background-origin': 'border-box',
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].placed[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['copper_ore', D(1 / 35)], ['tin_ore', D(1 / 140)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10());
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                let stone = D.pow(1.5, built).times(15),
                    planks = D.pow(1.25, built).times(50);

                return [['stone', stone], ['plank', planks]];
            },
            formulas: {
                cost: [['stone', '1.5 ^ built * 10'], ['plank', '1.5 ^ built * 50']],
            },
        },
    },
    update(diff) {
        Object.keys(layers.c.buildings).forEach(building => {
            const build = tmp.c.buildings[building];

            if (!(build.unlocked ?? true)) return;

            if (build.produces && 'items' in build.produces && Array.isArray(build.produces.items)) {
                const production = build.produces.items.map(([item, amount]) => [item, D.times(amount, diff)]);

                layers.lo.items['*'].gain_drops(production);
            }
        });
    },
    //todo update
    type: 'none',
    /** @this {Layers['c']} */
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        /** @type {(keyof player['c'])[]} */
        const keep = [],
            kept_ups = [...player[this.layer].upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 23).m_hold.pow(tmp.a.change_efficiency).floor()).toNumber();

        layerDataReset(this.layer, keep);
        player[this.layer].upgrades.push(...kept_ups);
    },
    branches: [['lo', 3]],
});
