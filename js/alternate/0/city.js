'use strict';

addLayer('c', {
    name: 'City',
    symbol: 'C',
    /** @returns {typeof player.c} */
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            mode: 'place',
            building: '',
            resources: Object.fromEntries(
                Object.keys(layers.c.resources)
                    .map(resource => [resource, {
                        amount: D.dZero,
                    }])
            ),
        };
    },
    tooltip() { return `${formatWhole(layerBuyableAmount('c'))} buildings`; },
    layerShown() { return player.c.unlocked; },
    color: '#666677',
    row: 0,
    position: 1.5,
    resource: 'buildings',
    hotkeys: [
        {
            key: 'c',
            description: 'C: Display city layer',
            unlocked() { return tmp.c.layerShown; },
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
                () => {
                    if (hasUpgrade('c', 51)) return ['column', [
                        ['display-text', `You have <span style="color:${tmp.c.resources.energy.color};font-size:1.5em;">${format(player.c.resources.energy.amount)}</span> ${tmp.c.resources.energy.name}`],
                        'blank',
                    ]];
                },
                ['column', () => Object.keys(layers.c.buildings).map(id => layers.c.buildings['*'].show_building(id))],
            ],
        },
        'Research': {
            content: [
                ['display-text', () => `You have <span style="color:${tmp.c.resources.science.color};font-size:1.5em;">${format(player.c.resources.science.amount)}</span> ${tmp.c.resources.science.name}`],
                'blank',
                ['upgrade-tree', [
                    [11],
                    [21, 22, 23],
                    [31, 32, 33],
                    [41, 42, 43],
                    [51],
                ]],
            ],
            unlocked() { return D.gt(player.c.resources.science.amount, 0); },
            buttonStyle: {
                'border-color'() { return tmp.c.resources.science.color; },
            },
        },
    },
    grid: {
        cols() {
            let cols = 5;

            if (hasUpgrade('c', 41)) cols += upgradeEffect('c', 41);

            return cols;
        },
        maxCols: 6,
        rows() {
            let rows = 5;

            if (hasUpgrade('c', 42)) rows += upgradeEffect('c', 42);

            return rows;
        },
        maxRows: 6,
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
                    ) {
                        data.building = player.c.building;
                        if (D.lt(getBuyableAmount('c', player.c.building), D.add(tmp.c.buildings['*'].placed[player.c.building], 2))) player.c.building = '';
                    }
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
    /** @type {typeof layers.c.upgrades} */
    upgrades: {
        11: {
            title: 'Improved Making',
            description: '+10% item production and consumption',
            effect() { return D(1.1); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs: [['science', D(1)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
        },
        21: {
            title: 'Deeper Digging',
            description: '+50% quarry and mine productions',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(1).times([21, 22, 23].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 11) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [11],
        },
        22: {
            title: 'Lighter Wood',
            description: '+50% forest and sawmill productions and consumptions',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(1).times([21, 22, 23].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 11) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [11],
        },
        23: {
            title: 'Leather Gloves',
            description: '+50% taming progress',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(1).times([21, 22, 23].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 11) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [11],
            unlocked() { return player.xp_alt.unlocked; },
        },
        31: {
            title: 'Cheaper Beams',
            description: '-25% quarry and mine costs',
            effect() { return D(.75); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).times([31, 32, 33].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 21) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [21],
        },
        32: {
            title: 'Harder Wood',
            description: '-25% forest and sawmill costs',
            effect() { return D(.75); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).times([31, 32, 33].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 22) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [22],
        },
        33: {
            title: 'Pet House',
            description: '+33% experience gain',
            effect() { return D(4 / 3); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).times([31, 32, 33].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 23) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [23],
            unlocked() { return player.xp_alt.unlocked; },
        },
        41: {
            title: 'Stone Foundations',
            description: '+1 city columns',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(4).times([41, 42, 43].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            item_costs: [['stone', D(50)], ['copper_ore', 25], ['tin_ore', 12.5]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 31) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [31],
        },
        42: {
            title: 'Wood Palisade',
            description: '+1 city rows',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(4).times([41, 42, 43].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            item_costs: [['normal_log', D(50)], ['plank', 25]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 32) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [32],
        },
        43: {
            title: 'Token Trap',
            description() { return `${layerColor('xp_alt', tmp.xp_alt.upgrades[22].title)} can catch goblins`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(4).times([41, 42, 43].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            item_costs: [['pyrite_coin', D(10)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 33) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [33],
            unlocked() { return player.xp_alt.unlocked; },
        },
        51: {
            title: 'Improved Blueprints',
            description: '+20% production and consumption<br>Unlock a new set of buildings',
            effect() { return D(1.2); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs: [['science', D(15)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return [41, 42, 43].filter(id => hasUpgrade('c', id)).length >= 2 &&
                    (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => player.lo.items[item].amount = D.minus(player.lo.items[item].amount, cost));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, cost));
            },
            branches: [41, 42, 43],
        },
        /**
         * TODO
         *
         * 61-81 -> boost quarry + forest, increase price of other paths
         * 62-82 -> boost mine + sawmill, increase price of other paths
         * 63-83 -> boost deep mine + coal generator, increase price of other paths
         * 64-84 -> boost p (and t when applicable), increase price of other paths
         * 91 -> boost all production/consumption + unlock new set of buildings
         */
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
                    display() {
                        const select = player.c.building == building ? 'Selected' : 'Select';
                        return `${select} ${tmp.c.buildings[building].name}`;
                    },
                    style() {
                        const base = {},
                            cant = {};

                        if (player.c.building == building) base['box-shadow'] = `${tmp.c.color} 0 0 20px`;
                        if (!tmp[this.layer].clickables[this.id].canClick) {
                            cant['background'] = '#bf8f8f';
                            cant['cursor'] = 'not-allowed';
                        }

                        return Object.assign(
                            base,
                            tmp.c.buildings[building].style.general,
                            tmp.c.buildings[building].style.select,
                            cant,
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
    /** @type {Layers['c']['buildings']} */
    buildings: {
        '*': {
            regex: /^(select)_([a-z_]+)$/,
            placed() {
                return Object.entries(player.c.grid).reduce((sum, [id, data]) => {
                    // Check if id is in the grid
                    if (
                        Math.floor(id / 100) <= tmp.c.grid.rows &&
                        id % 100 <= tmp.c.grid.cols
                    ) sum[data.building] = D.add(sum[data.building], 1);
                    return sum;
                }, {});
            },
            enabled() {
                return Object.entries(player.c.grid).reduce((sum, [id, data]) => {
                    // Check if id is in the grid
                    if (
                        Math.floor(id / 100) <= tmp.c.grid.rows &&
                        id % 100 <= tmp.c.grid.cols &&
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
            description(building_id, effect = '') {
                if (!building_id) return '';

                const building = tmp.c.buildings[building_id],
                    placed = tmp.c.buildings['*'].placed[building_id] ?? D.dZero,
                    total = getBuyableAmount('c', building_id),
                    /** @type {string[]} */
                    production_parts = [],
                    produces = building.produces ?? {},
                    /** @type {string[]} */
                    consumption_parts = [],
                    consumes = building.consumes ?? {};

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

                if ('items' in consumes) {
                    consumption_parts.push(
                        ...consumes.items
                            .map(([item, amount]) => `-${format(amount)} ${tmp.lo.items[item].name}`)
                    );
                }
                if ('resources' in consumes) {
                    consumption_parts.push(
                        ...consumes.resources
                            .map(([resource, amount]) => `<span style="color:${tmp.c.resources[resource].color};">-${format(amount)}</span> ${tmp.c.resources[resource].name}`)
                    );
                }

                const produce_text = production_parts.length > 0 ? `They produce ${listFormat.format(production_parts)} /s<br>` : '',
                    consume_text = consumption_parts.length > 0 ? `They consume ${listFormat.format(consumption_parts)} /s<br>` : '';

                if (effect.length) effect += '<br>';

                return `You have ${formatWhole(placed)} / ${formatWhole(total)} ${building.name}<br>\
                    ${effect}\
                    ${consume_text}\
                    ${produce_text}`;
            },
            produce_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 51)) mult = mult.times(upgradeEffect('c', 51));

                return mult;
            },
            item_produce_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11));

                return mult;
            },
            consume_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 51)) mult = mult.times(upgradeEffect('c', 51));

                return mult;
            },
            item_consume_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11));

                return mult;
            },
            cost_mult() {
                return D.dOne;
            },
        },
        // T0
        quarry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'stone quarry',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.stone.style['background-color']; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['stone', D(1 / 3)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(built, 1.1).times(10)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 31)) mult = mult.times(upgradeEffect('c', 31));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(built ^ 1.1) * 10']],
            },
        },
        mine: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'mine',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-image'() {
                        return `linear-gradient(to right, ${tmp.lo.items.copper_ore.style['background-color']},\
                        ${tmp.lo.items.tin_ore.style['background-color']})`;
                    },
                    'background-origin': 'border-box',
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['copper_ore', D(1 / 7)], ['tin_ore', D(1 / 28)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.5, built).times(15)],
                    ['plank', D.pow(1.25, built).times(50)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 31)) mult = mult.times(upgradeEffect('c', 31));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.5 ^ built) * 10'], ['plank', '(1.5 ^ built) * 50']],
            },
        },
        forest: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'forest',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.normal_log.style['background-color']; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['normal_log', D(1 / 2)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['normal_log', D.pow(built, 1.2).times(20)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 32)) mult = mult.times(upgradeEffect('c', 32));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['normal_log', '(built ^ 1.2) * 20']],
            },
        },
        sawmill: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'sawmill',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.plank.style['background-color']; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['plank', D(1 / 4)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['normal_log', D(1 / 4)]];

                items.forEach(([, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_consume_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['normal_log', D.pow(1.2, built).times(20)],
                    ['stone', D.pow(1.3, built).times(10)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 32)) mult = mult.times(upgradeEffect('c', 32));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['normal_log', '(1.2 ^ built) * 20'], ['stone', '(1.3 ^ built) * 10']],
            },
        },
        research_center: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'research center',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.c.resources.science.color; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['science', D(1 / 10)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['copper_ore', D.pow(1.5, built).times(10)],
                    ['stone', D.pow(1.5, built).times(50)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['copper_ore', '(1.5 ^ built) * 10'], ['stone', '(1.5 ^ built) * 50']],
            },
        },
        // T1
        deep_mine: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'deep mine',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-image'() {
                        return `linear-gradient(to right, ${tmp.lo.items.coal.style['background-color']},\
                        ${tmp.lo.items.iron_ore.style['background-color']},\
                        ${tmp.lo.items.gold_ore.style['background-color']})`;
                    },
                    'background-origin': 'border-box',
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [
                    ['coal', D(1 / 32)],
                    ['iron_ore', D(1 / 110)],
                    ['gold_ore', D(1 / 882)],
                ];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.5, built).times(40)],
                    ['normal_log', D.pow(1.25, built).times(100)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.5 ^ built) * 40'], ['normal_log', '(1.5 ^ built) * 100']],
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        coal_generator: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'coal generator',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.coal.style['background-color']; },
                    'color': '#666666',
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['energy', D(1 / 20)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['coal', D(1 / 20)]];

                items.forEach(([, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_consume_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.25, built).times(50)],
                    ['iron_ore', D.pow(1.1, built).times(10)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.25 ^ built) * 50'], ['iron_ore', '(1.1 ^ built) * 10']],
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        observatory: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'observatory',
            description() {
                const building = tmp.c.buildings[this.id],
                    effect = shiftDown ? `[${building.formulas.effect}]` : format(building.effect),
                    effect_text = `They reduce star health by ${effect} (minimum 1 health)`;
                return layers.c.buildings['*'].description(this.id, effect_text);
            },
            style: {
                general: {
                    'background-image'() { return `linear-gradient(to right, ${tmp.c.resources.energy.color}, ${tmp.c.resources.science.color})`; },
                    'background-origin': 'border-box',
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['science', D(1)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['energy', D(1 / 10)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            effect(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                return placed;
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['iron_ore', D.pow(1.2, built).times(15)],
                    ['gold_ore', D.pow(1.1, built)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['iron_ore', '(1.2 ^ built) * 15'], ['gold_ore', '1.1 ^ built']],
                effect: 'amount placed',
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        duplicator: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'duplicator',
            description() {
                const building = tmp.c.buildings[this.id],
                    /** @type {[string, Decimal]} */
                    effect = Object.entries(building.effect),
                    effect_text = 'They give ' + (effect.length ? listFormat.format(effect.map(([building, amount]) => `${format(amount)} effective ${tmp.c.buildings[building]?.name}`)) : 'no effective buildings');
                return layers.c.buildings['*'].description(this.id, effect_text);
            },
            style: {
                general: {
                    'background-color'() { return tmp.c.color; },
                },
            },
            effect(_) {
                const places = Object.keys(player.c.grid)
                    .filter(id => player.c.grid[id].building == this.id && player.c.grid[id].enabled)
                    .map(id => +id),
                    neighbors = places.map(id => {
                        const row = Math.floor(id / 100),
                            col = id % 100,
                            side_ids = [
                                (row - 1) * 100 + col,
                                (row + 1) * 100 + col,
                                row * 100 + col - 1,
                                row * 100 + col + 1,
                            ];

                        return side_ids.filter(id => id in player.c.grid && !['', this.id].includes(player.c.grid[id].building) && player.c.grid[id].enabled)
                            .map(id => player.c.grid[id].building);
                    }).flat();

                return neighbors.reduce((dict, type) => {
                    dict[type] = D.add(dict[type], .1);
                    return dict;
                }, {});
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['gold_ore', D.pow(2, built)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['gold_ore', '2 ^ built']],
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
    },
    /** @type {Layers['c']['resources']} */
    resources: {
        '*': {
        },
        science: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.resources).find(res => layers.c.resources[res] == this); },
            name: 'science',
            color: '#AA99FF',
            gain_mult() {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else {
                    mult = mult.div(D.add(player.c.resources[this.id].amount, 10).log10().pow(tmp.a.change_efficiency));
                }

                return mult;
            },
        },
        energy: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.resources).find(res => layers.c.resources[res] == this); },
            name: 'energy',
            color: '#FFEE00',
            gain_mult() {
                let mult = D.dOne;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else {
                    mult = mult.div(D.add(player.c.resources[this.id].amount, 10).log10().pow(tmp.a.change_efficiency));
                }

                return mult;
            },
        },
    },
    update(diff) {
        Object.keys(layers.c.buildings).forEach(building => {
            const build = tmp.c.buildings[building];

            if (!(build.unlocked ?? true)) return;

            if (build.consumes) {
                let can_consume = true;

                if (can_consume && 'items' in build.consumes && Array.isArray(build.consumes.items)) {
                    can_consume &&= build.consumes.items.every(([item, amount]) => D.gte(player.lo.items[item].amount, D.times(amount, diff)));
                }
                if (can_consume && 'resources' in build.consumes && Array.isArray(build.consumes.resources)) {
                    can_consume &&= build.consumes.resources.every(([resource, amount]) => D.gte(player.c.resources[resource].amount, D.times(amount, diff)));
                }

                if (!can_consume) return;

                if ('items' in build.consumes && Array.isArray(build.consumes.items)) {
                    const consumption = build.consumes.items.map(([item, amount]) => [item, D.times(amount, diff).neg()]);

                    layers.lo.items['*'].gain_drops(consumption);
                }

                if ('resources' in build.consumes && Array.isArray(build.consumes.resources)) {
                    build.consumes.resources.forEach(([resource, amount]) => {
                        player.c.resources[resource].amount = D.minus(player.c.resources[resource].amount, D.times(amount, diff));
                    });
                }
            }
            if (build.produces) {
                if ('items' in build.produces && Array.isArray(build.produces.items)) {
                    const production = build.produces.items.map(([item, amount]) => [item, D.times(amount, diff)]);

                    layers.lo.items['*'].gain_drops(production);
                }
                if ('resources' in build.produces && Array.isArray(build.produces.resources)) {
                    build.produces.resources.forEach(([resource, amount]) => {
                        player.c.resources[resource].amount = D.add(player.c.resources[resource].amount, D.times(amount, diff));
                    });
                }
            }
        });
    },
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
        Object.keys(player.c.resources).forEach(res => player.c.resources[res] = { amount: D.dZero, });
    },
    branches: [['lo', 3]],
});
