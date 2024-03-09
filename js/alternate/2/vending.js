'use strict';

//todo add quest board with blessing for easy money (refreshed at same rate as legendary)
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
            },
            buy: D.dOne,
        };
    },
    nodeStyle: { 'border-radius': '25%', },
    color: '#DDDD22',
    row: 2,
    position: 1.5,
    resource: 'stone coins',
    tooltip() {
        const coins = tmp.s.coins;
        if (player.s.short_mode) {
            return format_coins_split(player.s.points, coins.names.map(() => ''), coins.colors.map(color => `color: ${color};`)).join(' | ');
        } else {
            return format_coins_split(player.s.points, coins.names.map(name => `${name} coins`)).join('<br>');
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
                ['display-text', () => {
                    return `You have <span style="color:#BBBBBB;text-shadow:#BBBBBB 0 0 10px;font-size:1.15em;">\
                        ${format(player.v.points)}</span>\
                        stone coins (10 stone coins are worth 1 copper coin)`;
                }],
                ['display-text', () => {
                    const coins = tmp.s.coins,
                        text = format_coins(player.s.points, coins.names.map(name => `${name} coins`), coins.colors.map(color => `color: ${color}; font-size: 1.5em; text-shadow: ${color} 0 0 10px;`));
                    return `You have ${text}`;
                }],
                [
                    'row',
                    [
                        ['clickable', 'sell'],
                        'blank',
                        ['clickable', 'sell_specific'],
                    ]
                ],
                ['display-text', () => `Your items have ${format(tmp.s.baseAmount)} total value`],
                'blank',
                ['row', [
                    ['display-text', 'Currently buying'],
                    'blank',
                    ['text-input', 'buy'],
                    'blank',
                    ['display-text', 'items at once'],
                ]],
                'blank',
                [
                    'layer-table',
                    () => {
                        /** @type {rarities[]} */
                        const rares = ['common', 'uncommon', 'rare', 'epic', 'legendary'],
                            rows = rares.map(rarity => {
                                return [
                                    [
                                        [['display-text', rarity_color(rarity, 'Time until refresh')]],
                                        [['display-text', rarity_color(rarity, formatTime(player.v.refresh[rarity]))]],
                                        [['display-text', rarity_color(rarity, 'Refresh every')]],
                                        [['display-text', rarity_color(rarity, formatTime(tmp.v.time[rarity]))]],
                                    ],
                                    ...player.v.entries[rarity].items.map(([item]) => show_shop_row_item(item)),
                                    ...player.v.entries[rarity].upgrades.map(show_shop_row_upgrade),
                                ];
                            }).flat();

                        return [
                            ['Item', 'Stock', 'Price', ''],
                            ...rows,
                        ];
                    },
                ],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    return `You have <span style="color:#BBBBBB;text-shadow:#BBBBBB 0 0 10px;font-size:1.15em;">\
                        ${format(player.v.points)}</span>\
                        stone coins (10 stone coins are worth 1 copper coin)`;
                }],
                ['display-text', () => {
                    const coins = tmp.s.coins,
                        text = format_coins(player.s.points, coins.names.map(name => `${name} coins`), coins.colors.map(color => `color: ${color}; font-size: 1.5em; text-shadow: ${color} 0 0 10px;`));
                    return `You have ${text}`;
                }],
                [
                    'row',
                    [
                        ['clickable', 'sell'],
                        'blank',
                        ['clickable', 'sell_specific'],
                    ]
                ],
                ['display-text', () => `Your items have ${format(tmp.s.baseAmount)} total value`],
                'blank',
                'upgrades',
            ],
        },
    },
    clickables: new Proxy({}, {
        /** @returns {Clickable<'v'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            if (prop == 'sell') {
                const gain = () => getResetGain('s', null, false).times(10).floor();

                return obj[prop] ??= {
                    canClick() { return gain().gte(1); },
                    onClick() {
                        const earn = gain();
                        addPoints('v', earn);
                        doReset('v', true);
                    },
                    display() {
                        const coins = [...layers.s.coins.names].map(name => `${name} coins`),
                            earn = gain(),
                            stone = earn.minus(earn.div(10).floor().times(10)),
                            parts = format_coins_split(earn.div(10).floor(), coins);
                        if (stone.gt(0)) parts.unshift(`${format(stone)} stone coins`);
                        return `Sell your items for ${listFormat.format(parts)}`;
                    },
                    style: {
                        'width': '180px',
                        'height': '120px',
                    },
                };
            }
            if (prop == 'sell_specific') {
                const gain = () => {
                    /** @type {dishes[]} */
                    const dishes = Object.keys(tmp.k.dishes)
                        .filter(/**@param {dishes|'*'} dish*/dish => dish != '*' && tmp.k.dishes[dish].groups.includes(player.v.entries.group));

                    const sum = dishes.reduce((sum, dish) => D.add(sum, D.times(tmp.k.dishes[dish].value, player.k.dishes[dish].amount)), D.dZero);

                    let gain = sum.div(tmp.s.requires).pow(tmp.s.exponent).times(tmp.s.gainMult).pow(tmp.s.gainExp);
                    if (gain.gte(tmp.s.softcap)) gain = gain.pow(tmp.s.softcapPower).times(tmp.s.softcap.pow(decimalOne.sub(tmp.s.softcapPower)));
                    gain = gain.times(tmp.s.directMult).times(10);

                    // Bonus to specific
                    let mult = D(3);
                    gain = gain.times(mult);

                    return gain.floor().max(0);
                }

                return obj[prop] ??= {
                    canClick() { return gain().gte(1); },
                    onClick() {
                        const earn = gain();
                        addPoints('v', earn);
                        doReset('v_soft', true);
                        giveAchievement('ach', 102);
                    },
                    display() {
                        const coins = [...layers.s.coins.names].map(name => `${name} coins`),
                            earn = gain(),
                            stone = earn.minus(earn.div(10).floor().times(10)),
                            parts = format_coins_split(earn.div(10).floor(), coins);
                        if (stone.gt(0)) parts.unshift(`${format(stone)} stone coins`);
                        return `Sell all ${tmp.k.groups[player.v.entries.group].name} dishes for ${listFormat.format(parts)} and soft reset your lower layers<br>\
                            Changes in ${formatTime(player.v.refresh.specific)} (every ${formatTime(tmp.v.time.specific)})`;
                    },
                    style: {
                        'width': '180px',
                        'height': '120px',
                    },
                };
            }

            const display_matches = layers.v.items['*'].regex.exec(prop);
            if (display_matches) {
                /** @type {[string, string, 'buy'|'display']} */
                const [, vend_id, type] = display_matches,
                    vend = () => tmp.v.items[vend_id],
                    source = () => {
                        const merch = vend()?.merch;
                        switch (merch?.type) {
                            case 'item':
                                return tmp.lo.items[merch.item];
                            case 'dish':
                                return tmp.k.dishes[merch.dish];
                        }
                    },
                    get_entry = () => {
                        /** @type {Player['v']['entries'][rarities]} */
                        const entries = player.v.entries[vend().rarity]
                        return entries.items.find(([entry]) => entry == vend_id) ?? false;
                    };

                return obj[prop] ??= {
                    title() { if (type == 'display') return capitalize(source().name); },
                    unlocked() { return get_entry(); },
                    display() {
                        if (type == 'buy') {
                            const entry = get_entry();
                            if (!entry) return;

                            const [, , cost_each] = entry;
                            let cost = format_coins(D.times(cost_each, player.v.buy), layers.s.coins.names.map(name => `${name} coins`));

                            return `Cost: ${cost}`;
                        }
                    },
                    canClick() {
                        // Might remove for display if this confuses players
                        const entry = get_entry();
                        if (!entry) return false;

                        const [, amount, cost] = entry;
                        return D.gte(amount, player.v.buy) && D.gt(player.v.buy, 0) && D.gte(player.s.points, D.times(amount, cost));
                    },
                    onClick() {
                        if (!this.canClick()) return;

                        const entry = get_entry();
                        if (!entry) return;

                        const [, , cost] = entry,
                            amount = player.v.buy,
                            total_cost = D.times(amount, cost),
                            merch = vend().merch;
                        player.s.points = D.minus(player.s.points, total_cost);

                        switch (merch.type) {
                            case 'item':
                                gain_items(merch.item, amount);
                                break;
                            case 'dish': {
                                const dish = player.k.dishes[merch.dish];
                                dish.amount = D.add(dish.amount, amount);
                            }; break;
                            default:
                                // This should never be reached
                                alert(`You bought something that does not exist. Ping me on discord`);
                        }
                    },
                    onHold() { this.onClick(); },
                    style() {
                        const style = Object.assign({
                            'height': '80px',
                            'width': '80px',
                            'min-height': 'unset',
                            'transform': 'unset',
                            'color': 'black',
                            'background-repeat': 'no-repeat',
                            'background-position': 'center',
                            'background-size': 'contain',
                            'word-break': 'break-word',
                        }, source().style);

                        if (!tmp[this.layer].clickables[this.id].canClick) style['filter'] = 'brightness(75%)';

                        return style;
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (['layer', 'sell', 'sell_specific'].includes(prop) ||
                layers.v.items['*'].regex.exec(prop)) return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) {
            return ['layer', 'sell', 'sell_specific'].includes(prop) ||
                layers.v.items['*'].regex.exec(prop)
        },
        ownKeys(_) {
            return [
                'sell',
                'sell_specific',
                ...Object.keys(layers.v.items)
                    .map(item => [`item_${item}_buy`, `item_${item}_display`])
                    .flat(),
            ];
        },
    }),
    upgrades: {
        //#region Common Upgrades
        11: {
            rarity: 'common',
            title: 'Softer Gloves',
            description: 'Taming progress is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        12: {
            rarity: 'common',
            title: 'Promotions',
            description: 'City production and consumption is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        13: {
            rarity: 'common',
            title: 'Fertilizer',
            description: 'Plant harvest yield is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        14: {
            rarity: 'common',
            title: 'Small Cooler',
            description: 'Cold production is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        15: {
            rarity: 'common',
            title: 'Older Coins',
            description: 'Coin gain is increased by 25%',
            effect() { return D(1.25); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(1),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        //#endregion Common Upgrades
        //#region Uncommon Upgrades
        21: {
            rarity: 'uncommon',
            title: 'Cheaper Floors',
            description: 'Floor gain is increased by 50%',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(5),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        22: {
            rarity: 'uncommon',
            title: 'Bigger Oven',
            description: 'Oven size is increased by 1',
            effect() { return D.dOne; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(15),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        23: {
            rarity: 'uncommon',
            title: 'Bigger Leak',
            description: 'Water gain is increased by 1',
            effect() { return D.dOne; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(10),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        24: {
            rarity: 'uncommon',
            title: 'Sound investment',
            description: 'Coin gain is increased by 50%',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(5),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        25: {
            rarity: 'uncommon',
            title: 'Fracking',
            description: 'Unlock the Oil Pump in the City',
            cost: D(15),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        //#endregion Uncommon Upgrades
        //#region Rare Upgrades
        31: {
            rarity: 'rare',
            title: 'Stuffed Slime',
            description: 'Monster production is increased by 75%',
            effect() { return D(1.75); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(50),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        32: {
            rarity: 'rare',
            title: 'Corner Cutting',
            description: 'City consumption is decreased by 50%',
            effect() { return D(.5); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            cost: D(75),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        33: {
            rarity: 'rare',
            title: 'Greenhouse',
            description: 'Plant grow speed is increased by 75%',
            effect() { return D(1.75); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(50),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        34: {
            rarity: 'rare',
            title: 'Black Card',
            description: 'Coin gain is increased by 75%',
            effect() { return D(1.75); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            cost: D(25),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        35: {
            rarity: 'rare',
            title: 'Higher Temperatures',
            description: 'Unlock the Refinery in the City',
            cost: D(75),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        //#endregion Rare Upgrades
        //#region Epic Upgrades
        41: {
            rarity: 'epic',
            title: 'Smaller Blocks',
            description: 'Floor materials are cheaper',
            effect() { return D.dTwo; },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(125),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        42: {
            rarity: 'epic',
            title: 'Iron Stomach Sugery',
            description: 'Stomach size is increased by 2',
            effect() { return D.dTwo; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(150),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        43: {
            rarity: 'epic',
            title: 'Nitrogen Cooling',
            description: 'Ice gain is doubled',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(150),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        44: {
            rarity: 'epic',
            title: 'Bank Error in Your Favor',
            description: 'Coin gain is doubled',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(100),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        45: {
            rarity: 'epic',
            title: 'The Hottest Topic',
            description: 'Unlock the Fuel Generator in the City',
            cost: D(150),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        //#endregion Epic Upgrades
        //#region Legendary Upgrades
        51: {
            rarity: 'legendary',
            title: 'Non-Euclidian Floors',
            description: 'Floor exponent is lower',
            effect() { return D(.1); },
            effectDisplay() { return `-${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(500),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        52: {
            rarity: 'legendary',
            title: 'Non-Linear Timeline',
            description: 'Time between refreshes is shorter',
            effect() { return D(.9); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            cost: D(500),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        53: {
            rarity: 'legendary',
            title: 'Non-Isolated System',
            description: 'Cooking is speed is divided by 10 when using the wrong temperatures instead of failing',
            effect() { return D.dTen; },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(500),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        54: {
            rarity: 'legendary',
            title: 'Non-Pythagorian Proportions',
            description: 'Divide Freezer recipes exponents',
            effect() { return D(.8); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(500),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        55: {
            rarity: 'legendary',
            title: 'Non-Aristotlean Market',
            description() {
                if (!shiftDown) {
                    return 'Vending upgrades boost coin gain';
                }

                let formula = '3√(upgrades + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.v.upgrades.length, 1).root(3); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(500),
            costDisplay() { return `Cost: ${format_coins(this.cost, tmp.s.coins.names.map(name => `${name} coins`))}`; },
            allow() { return player.v.entries[this.rarity].upgrades.includes(+this.id) || hasUpgrade(this.layer, this.id); },
            style() {
                const style = { 'border-color': tmp.v.rarities[this.rarity].color };
                if (!tmp[this.layer].upgrades[this.id].allow) {
                    Object.assign(style, {
                        'border-style': 'dashed',
                        'background-color': 'transparent',
                        'color': 'white',
                    });
                }
                return style;
            },
            canAfford() {
                return D.gte(player.s.points, tmp[this.layer].upgrades[this.id].cost) &&
                    tmp[this.layer].upgrades[this.id].allow;
            },
            pay() { player.s.points = D.minus(player.s.points, tmp[this.layer].upgrades[this.id].cost); },
            fullDisplay() {
                const thismp = tmp[this.layer].upgrades[this.id];
                if (thismp.allow) {
                    const effectDisplay = 'effectDisplay' in thismp ? `Currently: ${run(this.effectDisplay, this)}` : '';

                    return `<h3>${thismp.title}</h3><br>\
                        ${thismp.description}<br>\
                        ${effectDisplay}\
                        <br><br>
                        ${thismp.costDisplay}`;
                }
                return `<h3>${thismp.title}</h3><br>\
                    ${format(D.times(tmp.v.rarities[this.rarity].upgrade_chance, 100).div(5))}% chance to unlock<br><br>\
                    ${thismp.costDisplay}`;
            },
        },
        //#endregion Legendary Upgrades
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
            upgrade_chance: .5,
        },
        uncommon: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D(3),
                max: D(8),
            },
            color: '#228800',
            upgrade_chance: .45,
        },
        rare: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D.dOne,
                max: D(4),
            },
            color: '#4488CC',
            upgrade_chance: .4,
        },
        epic: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D.dZero,
                max: D.dTwo,
            },
            color: '#FFBB22',
            upgrade_chance: .35,
        },
        legendary: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.v.rarities).find(rarity => layers.v.rarities[rarity] == this); },
            amount: {
                min: D.dZero,
                max: D.dOne,
            },
            color: '#AA55FF',
            upgrade_chance: .3,
        },
    },
    items: {
        '*': {
            amount_mult() {
                let mult = D.dOne;

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['v'] ?? 1);

                return mult;
            },
            cost_mult() { return D.dOne; },
            regex: /^item_([a-z_]+)_(buy|display)$/,
        },
        //todo add a few duplicates (and more items!)
        //todo add cheaper rarer duplicates
        //todo might need to lower prices more
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
                min: D(.01),
                max: D.dOne,
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
                min: D(.05),
                max: D(.5),
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
                min: D(.1),
                max: D(1),
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
                min: D(.075),
                max: D(.7),
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
                min: D(.5),
                max: D(1.5),
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
                min: D(.25),
                max: D.dTwo,
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
                min: D(.15),
                max: D(.3),
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
                min: D(.1),
                max: D(1),
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
                min: D(.25),
                max: D.dTwo,
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
                min: D(.1),
                max: D(.9),
            },
        },
        bread: {
            merch: {
                type: 'dish',
                dish: 'bread',
            },
            rarity: 'common',
            amount: {
                max: D(15),
                min: D(10),
            },
            cost: {
                min: D(1 / 3),
                max: D(5),
            },
        },
        soda: {
            merch: {
                type: 'dish',
                dish: 'soda',
            },
            rarity: 'common',
            amount: {
                max: D(50),
                min: D(5),
            },
            cost: {
                min: D(1 / 5),
                max: D(5),
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
                min: D(.05),
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
                min: D(.01),
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
                min: D(.5),
                max: D(4),
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
                min: D(.1),
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
                min: D(1),
                max: D(5),
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
                min: D(2.5),
                max: D(25),
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
                min: D(.2),
                max: D.dOne,
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
                min: D(.25),
                max: D(1.5),
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
                min: D(.1),
                max: D(1.3),
            },
        },
        french_fries: {
            merch: {
                type: 'dish',
                dish: 'french_fries',
            },
            rarity: 'uncommon',
            amount: {
                max: D(10),
                min: D(4),
            },
            cost: {
                min: D(.5),
                max: D(7),
            },
        },
        coffee: {
            merch: {
                type: 'dish',
                dish: 'coffee',
            },
            rarity: 'uncommon',
            amount: {
                max: D(50),
                min: D(5),
            },
            cost: {
                min: D(1 / 2),
                max: D(10),
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
                min: D(.15),
                max: D.dOne,
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
                min: D(.5),
                max: D(5),
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
                min: D(.75),
                max: D(3),
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
                min: D(1.5),
                max: D(5),
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
                min: D.dTwo,
                max: D.dTen,
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
                min: D.dOne,
                max: D(8),
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
                min: D.dOne,
                max: D.dTwo,
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
                min: D.dTwo,
                max: D(9),
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
                min: D(.6),
                max: D(1.6),
            },
        },
        slime_juice: {
            merch: {
                type: 'dish',
                dish: 'slime_juice',
            },
            rarity: 'rare',
            amount: {
                max: D(30),
                min: D(5),
            },
            cost: {
                min: D(1),
                max: D(15),
            },
        },
        ice_cream: {
            merch: {
                type: 'dish',
                dish: 'ice_cream',
            },
            rarity: 'rare',
            amount: {
                max: D(10),
                min: D(1),
            },
            cost: {
                min: D(4),
                max: D(9),
            },
        },
        candy_cane: {
            merch: {
                type: 'dish',
                dish: 'candy_cane',
            },
            rarity: 'rare',
            amount: {
                max: D(25),
                min: D(5),
            },
            cost: {
                min: D(3),
                max: D(15),
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
                min: D(.5),
                max: D(2.5),
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
                min: D.dOne,
                max: D(4),
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
                min: D(5),
                max: D(30),
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
                min: D(20),
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
                min: D(5),
                max: D(15),
            },
        },
        monster_meal: {
            merch: {
                type: 'dish',
                dish: 'monster_meal',
            },
            rarity: 'epic',
            amount: {
                max: D(20),
                min: D(1),
            },
            cost: {
                min: D(6.66),
                max: D(16.66),
            },
        },
        cake: {
            merch: {
                type: 'dish',
                dish: 'cake',
            },
            rarity: 'epic',
            amount: {
                max: D(50),
                min: D(10),
            },
            cost: {
                min: D(7.5),
                max: D(25),
            },
        },
        pizza: {
            merch: {
                type: 'dish',
                dish: 'pizza',
            },
            rarity: 'epic',
            amount: {
                max: D(25),
                min: D(5),
            },
            cost: {
                min: D(5),
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
                min: D(77),
                max: D(177),
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
                min: D(4),
                max: D(50),
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
                min: D(25),
                max: D(75),
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
                min: D(30),
                max: D(70),
            },
        },
        star_crunch: {
            merch: {
                type: 'dish',
                dish: 'star_crunch',
            },
            rarity: 'legendary',
            amount: {
                max: D(5),
                min: D(1),
            },
            cost: {
                min: D(7.7),
                max: D(77),
            },
        },
        chocolate: {
            merch: {
                type: 'dish',
                dish: 'chocolate',
            },
            rarity: 'legendary',
            amount: {
                max: D(25),
                min: D(5),
            },
            cost: {
                min: D(7.5),
                max: D(30),
            },
        },
        //#endregion Legendary
    },
    time: {
        '*': {
            time_mult() {
                let mult = D.dOne;

                if (hasUpgrade('v', 52)) mult = mult.times(upgradeEffect('v', 52));

                return mult;
            },
        },
        //todo? lower base time to 10 minutes
        specific() {
            let time = D(5 * 60);

            time = time.times(tmp.v.time['*'].time_mult);

            return time;
        },
        common() {
            let time = D(5 * 60);

            time = time.times(tmp.v.time['*'].time_mult);

            return time;
        },
        uncommon() {
            let time = D(10 * 60);

            time = time.times(tmp.v.time['*'].time_mult);

            return time;
        },
        rare() {
            let time = D(15 * 60);

            time = time.times(tmp.v.time['*'].time_mult);

            return time;
        },
        epic() {
            let time = D(20 * 60);

            time = time.times(tmp.v.time['*'].time_mult);

            return time;
        },
        legendary() {
            let time = D(30 * 60);

            time = time.times(tmp.v.time['*'].time_mult);

            return time;
        },
    },
    automate() {
        // Convert stone coins to real coins
        if (D.gte(player.v.points, 10)) {
            const gain = D.div(player.v.points, 10).floor();
            addPoints('s', gain);
            player.v.points = D.minus(player.v.points, gain.times(10));
        }

        // Time ran out
        Object.entries(player.v.refresh)
            .forEach(/**@param {['specific'|rarities, Decimal]}*/([type, time]) => {
                if (time.lte(0)) {
                    // Reroll
                    player.v.refresh[type] = tmp.v.time[type];
                    if (type == 'specific') {
                        player.v.entries.group = random_dish_group();
                    } else {
                        player.v.entries[type].items = random_rarity_items(type);
                        //todo norng support
                        if (Math.random() < tmp.v.rarities[type].upgrade_chance) player.v.entries[type].upgrades = [random_rarity_upgrade(type)];
                        else player.v.entries[type].upgrades = [];
                    }
                } else if (time.gt(tmp.v.time[type])) {
                    // Time left is higher than the waiting time
                    player.v.refresh[type] = tmp.v.time[type];
                }
            });
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        Object.entries(player.v.refresh)
            .forEach(/**@param {[keyof Player['v']['refresh'], Decimal]}*/([key, time]) => {
                if (D.lte(time, 0)) return;
                player.v.refresh[key] = D.minus(time, diff);
            });
    },
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    branches: ['k'],
    doReset(layer) { },
    componentStyles: {
        upgrade: {
            'border-width': '4px',
        },
    },
    prestigeNotify() { return tmp.s.prestigeNotify; },
});

// Only for soft resets in vending
addLayer('v_soft', {
    startData() { return { unlocked: false, points: decimalZero } },
    layerShown: false,
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    row: 2,
});
