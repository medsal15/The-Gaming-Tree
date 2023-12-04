'use strict';

addLayer('con', {
    name: 'Condiments',
    image: `./resources/images/salt-shaker.svg`,
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            condiment: '',
            condiments: Object.fromEntries(
                Object.keys(layers.con.condiments)
                    .filter(condiment => condiment != '*')
                    .map(condiment => [condiment, { amount: D.dZero, }])
            ),
        };
    },
    layerShown() { return player.con.unlocked; },
    nodeStyle() {
        const style = {};

        if (tmp.con.condiments['*']?.highest) style['border-color'] = tmp.con.condiments[tmp.con.condiments['*'].highest]?.color;

        return style;
    },
    color: '#CC9955',
    row: 'side',
    position: 3.5,
    resource: 'spice',
    type: 'none',
    tabFormat: {
        'Seal': {
            content: [
                ['layer-proxy', ['b', [['challenge', 91]]]],
            ],
            unlocked() { return !hasChallenge('b', 91) || inChallenge('b', 91); },
        },
        'Condiments': {
            content: [
                ['display-text', () => {
                    let change_str = '';

                    const change = tmp.con.spice.gain;

                    if (shiftDown) change_str = tmp.con.spice.formula;
                    else if (D.abs(change).gt(1e-4)) change_str = ` (${layerColor('con', (change.gt(0) ? '+' : '-') + format(change))} /s)`;

                    return `You have ${layerColor('con', format(player.con.points), 'font-size:1.5em;')}${change_str} ${tmp.con.resource}`;
                }],
                ['display-text', () => {
                    const highest = tmp.con.condiments['*'].highest;
                    let name;

                    if (!highest) name = 'none';
                    else name = `<span style="color:${tmp.con.condiments[highest].color};">${tmp.con.condiments[highest].name}</span>`;

                    return `Current active condiment: ${name}`;
                }],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.con.condiments)
                        .filter(cond => cond != '*' && cond != '')
                        .map(cond => {
                            const amount = player.con.condiments[cond].amount,
                                tmp_cond = tmp.con.condiments[cond];

                            let change_str = '';
                            if (player.con.condiment == cond) {
                                const change = tmp.con.condiments['*'].gain;
                                if (D.abs(change).gt(1e-4)) change_str = ` (<span style="color:${tmp_cond.color}>${(change.gt(0) ? '+' : '-') + format(change)}</span> /s)`;
                            }

                            return ['display-text', `You have <span style="color:${tmp_cond.color};font-size:1.25em;">${format(amount)}</span>${change_str} ${tmp_cond.name}`];
                        })
                ],
                ['display-text', () => `<span class="warning">You lose ${formatWhole(tmp.con.condiments['*'].loss.times(100))}% of your condiment amounts every second</span>`],
                ['display-text', () => `Using the good condiment multiplies food duration by ${format(tmp.con.condiments['*'].bonus)}`],
                ['display-text', () => `<span class="warning">Using the bad condiment multiplies food duration by ${format(tmp.con.condiments['*'].bonus)}</span>`],
                ['clickables', [1]],
                'blank',
                ['buyable-tree', [[11, 12, 13]]],
            ],
            unlocked() { return inChallenge('b', 91) || hasChallenge('b', 91); },
        },
        'Effects': {
            content: [
                [
                    'layer-table',
                    () => {
                        const condiment_color = (condiment, text) => `<span style="color:${tmp.con.condiments[condiment].color}">${text}</span>`,
                            /** @param {string} condiment */
                            effects = condiment => {
                                /** @type {string[]} */
                                const pros = [],
                                    /** @type {string[]} */
                                    cons = [],
                                    {
                                        to = {},
                                        k = {},
                                        fr = {},
                                    } = tmp.con.condiments[condiment].effect,
                                    forms = tmp.con.condiments[condiment].formulas;

                                if ('material_cost' in to && D.neq(to.material_cost, 1)) {
                                    const mult = to.material_cost;
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${forms.to.material_cost}]`;
                                    } else if (D.gt(mult, 1)) {
                                        mult_text = format(mult);
                                    } else {
                                        mult_text = format(mult.pow(-1));
                                    }

                                    if (D.gt(mult, 1)) cons.push(`Multiplies tower block costs by ${mult_text}`);
                                    else pros.push(`Divides tower block costs by ${mult_text}`);
                                }
                                if ('floor_cost' in to && D.neq(to.floor_cost, 1)) {
                                    const mult = to.floor_cost;
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${forms.to.material_cost}]`;
                                    } else if (D.gt(mult, 1)) {
                                        mult_text = format(mult);
                                    } else {
                                        mult_text = format(mult.pow(-1));
                                    }

                                    if (D.gt(mult, 1)) pros.push(`Divides tower floor cost by ${mult_text}`);
                                    else cons.push(`Multiplies tower floor cost by ${mult_text}`);
                                }
                                if ('oven_size' in k && D.neq(k.oven_size, 0)) {
                                    const add = k.oven_size;
                                    let add_text;
                                    if (shiftDown) {
                                        add_text = `[${forms.k.oven_size}]`;
                                    } else {
                                        add_text = format(add.abs());
                                    }

                                    if (D.gt(add, 0)) pros.push(`Increases oven size by ${add_text}`);
                                    else cons.push(`Decreases oven size by ${add_text}`);
                                }
                                if ('stomach_size' in k && D.neq(k.stomach_size, 0)) {
                                    const add = k.stomach_size;
                                    let add_text;
                                    if (shiftDown) {
                                        add_text = `[${forms.k.stomach_size}]`;
                                    } else {
                                        add_text = format(add.abs());
                                    }

                                    if (D.gt(add, 0)) pros.push(`Increases stomach size by ${add_text}`);
                                    else cons.push(`Decreases stomach size by ${add_text}`);
                                }
                                if ('water' in fr && D.neq(fr.water, 1)) {
                                    const mult = fr.water;
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${forms.f.water}]`;
                                    } else if (D.gt(mult, 1)) {
                                        mult_text = format(mult);
                                    } else {
                                        mult_text = format(mult.pow(-1));
                                    }

                                    if (D.gt(mult, 1)) pros.push(`Multiplies water gain by ${mult_text}`);
                                    else cons.push(`Divides water gain by ${mult_text}`);
                                }
                                if ('cold' in fr && D.neq(fr.cold, 1)) {
                                    const mult = fr.cold;
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${forms.f.cold}]`;
                                    } else if (D.gt(mult, 1)) {
                                        mult_text = format(mult);
                                    } else {
                                        mult_text = format(mult.pow(-1));
                                    }

                                    if (D.gt(mult, 1)) pros.push(`Multiplies cold gain by ${mult_text}`);
                                    else cons.push(`Divides cold gain by ${mult_text}`);
                                }

                                return { pros, cons, };
                            },
                            condiments = Object.keys(layers.con.condiments)
                                .filter(cond => cond != '*' && cond != '');

                        if (inChallenge('b', 91)) condiments.push('');

                        return [
                            ['Condiment', 'Amount', 'Effects'],
                            ...condiments.map(cond => {
                                let change = tmp.con.condiments['*'].loss.neg(),
                                    change_str = '';
                                const effect = effects(cond);

                                if (player.con.condiment == cond) change = change.add(tmp.con.condiments['*'].gain);
                                if (D.abs(change).gt(1e-4)) change_str = ` (${condiment_color(cond, (change.gt(0) ? '+' : '-') + format(change))} /s)`;

                                return [
                                    [['display-text', condiment_color(cond, capitalize(tmp.con.condiments[cond].name))]],
                                    [['display-text', condiment_color(cond, format(player.con.condiments[cond].amount)) + change_str]],
                                    [
                                        ...effect.pros.map(eff => ['display-text', `<span style="color:#55AA55;">${eff}</span>`]),
                                        'h-line',
                                        ...effect.cons.map(eff => ['display-text', `<span class="warning">${eff}</span>`]),
                                    ],
                                ];
                            }),
                        ];
                    },
                ],
                ['clickables', [1]],
            ],
            unlocked() { return inChallenge('b', 91) || hasChallenge('b', 91); },
        },
    },
    //? Might need to nerf/change these
    //if so, use a merge minigame
    buyables: {
        11: {
            title: 'Condiment Producer',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {Decimal} */
                    const effect = buyableEffect(this.layer, this.id);

                    return `Your ${formatWhole(amount)} condiment producers\
                        produce ${format(effect)} condiment per second<br><br>\
                        Cost: ${format(tmp[this.layer].buyables[this.id].cost)}`;
                } else {
                    let formula_effect = 'amount',
                        formula_cost = '3 ^ amount';

                    return `Your ${formatWhole(amount)} condiment producers\
                        produce [${formula_effect}] condiment per second<br><br>\
                        Cost: [${formula_cost}]`;
                }
            },
            cost(x) {
                if (D.lt(x, 1)) return D.dZero;

                return D.pow(3, x);
            },
            effect(x) { return x; },
            canAfford() { return D.gte(player.con.points, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                player.con.points = D.minus(player.con.points, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
            branches: [12],
        },
        12: {
            title: 'Condiment Factory',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {Decimal} */
                    const effect = buyableEffect(this.layer, this.id);

                    return `Your ${formatWhole(amount)} condiment factories\
                        multiply condiment gain by ${format(effect)}<br><br>\
                        Cost: ${format(tmp[this.layer].buyables[this.id].cost)}`;
                } else {
                    let formula_effect = 'amount + 1',
                        formula_cost = '5 ^ (amount + 2)';

                    return `Your ${formatWhole(amount)} condiment factories\
                        multiply condiment gain by [${formula_effect}]<br><br>\
                        Cost: [${formula_cost}]`;
                }
            },
            cost(x) {
                x = D.add(x, 2);

                return D.pow(5, x);
            },
            effect(x) { return D.add(x, 1); },
            canAfford() { return D.gte(player.con.points, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                player.con.points = D.minus(player.con.points, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
            unlocked() { return D.gte(getBuyableAmount('con', 11), 1); },
            branches: [13],
        },
        13: {
            title: 'Condiment Gigafactory',
            display() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (!shiftDown) {
                    /** @type {Decimal} */
                    const effect = buyableEffect(this.layer, this.id);

                    return `Your ${formatWhole(amount)} condiment gigafactories\
                        multiply condiment gain by ${format(effect)}<br><br>\
                        Cost: ${format(tmp[this.layer].buyables[this.id].cost)}`;
                } else {
                    let formula_effect = 'amount * 2 + 1',
                        formula_cost = '7 ^ (amount + 4)';

                    return `Your ${formatWhole(amount)} condiment gigafactories\
                        multiply condiment gain by [${formula_effect}]<br><br>\
                        Cost: [${formula_cost}]`;
                }
            },
            cost(x) {
                x = D.add(x, 4);

                return D.pow(7, x);
            },
            effect(x) { return D.times(x, 2).add(1); },
            canAfford() { return D.gte(player.con.points, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                player.con.points = D.minus(player.con.points, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
            unlocked() { return D.gte(getBuyableAmount('con', 12), 1); },
        },
    },
    clickables: {
        11: {
            condiment: 'pepper',
            title() {
                if (player.con.condiment == this.condiment) return `Deselect ${tmp.con.condiments[this.condiment].name}`;
                else return `Select ${tmp.con.condiments[this.condiment].name}`;
            },
            onClick() {
                if (player.con.condiment == this.condiment) player.con.condiment = '';
                else player.con.condiment = this.condiment;
            },
            canClick: true,
            style() {
                const style = {};
                if (player.con.condiment == this.condiment) style['box-shadow'] = `${tmp.con.color} 0 0 20px`;

                style['background-color'] = tmp.con.condiments[this.condiment].color;

                return style;
            },
        },
        12: {
            condiment: 'mint',
            title() {
                if (player.con.condiment == this.condiment) return `Deselect ${tmp.con.condiments[this.condiment].name}`;
                else return `Select ${tmp.con.condiments[this.condiment].name}`;
            },
            onClick() {
                if (player.con.condiment == this.condiment) player.con.condiment = '';
                else player.con.condiment = this.condiment;
            },
            canClick: true,
            style() {
                const style = {};
                if (player.con.condiment == this.condiment) style['box-shadow'] = `${tmp.con.color} 0 0 20px`;

                style['background-color'] = tmp.con.condiments[this.condiment].color;

                return style;
            },
        },
        13: {
            condiment: 'vinegar',
            title() {
                if (player.con.condiment == this.condiment) return `Deselect ${tmp.con.condiments[this.condiment].name}`;
                else return `Select ${tmp.con.condiments[this.condiment].name}`;
            },
            onClick() {
                if (player.con.condiment == this.condiment) player.con.condiment = '';
                else player.con.condiment = this.condiment;
            },
            canClick: true,
            style() {
                const style = {};
                if (player.con.condiment == this.condiment) style['box-shadow'] = `${tmp.con.color} 0 0 20px`;

                style['background-color'] = tmp.con.condiments[this.condiment].color;

                return style;
            },
        },
        14: {
            condiment: 'ginger',
            title() {
                if (player.con.condiment == this.condiment) return `Deselect ${tmp.con.condiments[this.condiment].name}`;
                else return `Select ${tmp.con.condiments[this.condiment].name}`;
            },
            onClick() {
                if (player.con.condiment == this.condiment) player.con.condiment = '';
                else player.con.condiment = this.condiment;
            },
            canClick: true,
            style() {
                const style = {};
                if (player.con.condiment == this.condiment) style['box-shadow'] = `${tmp.con.color} 0 0 20px`;

                style['background-color'] = tmp.con.condiments[this.condiment].color;

                return style;
            },
        },
    },
    spice: {
        gain() { return ['pepper', 'mint', 'vinegar', 'ginger'].reduce((sum, condiment) => D.add(sum, player.con.condiments[condiment].amount.add(10).log10()), 0); },
        formula: 'log10(pepper + 10) + log10(mint + 10) + log10(vinegar + 10) + log10(ginger + 10)',
    },
    condiments: {
        '*': {
            gain() {
                let gain = buyableEffect('con', 11);

                gain = gain.times(buyableEffect('con', 12));

                gain = gain.times(buyableEffect('con', 13));

                return gain;
            },
            loss() { return D(.01); },
            total: {
                to: {
                    material_cost() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.to?.material_cost ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                    floor_cost() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.to?.floor_cost ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                },
                k: {
                    oven_size() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.k?.oven_size ?? D.dZero) : D.dZero)
                            .reduce(D.add, 0);
                    },
                    stomach_size() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.k?.stomach_size ?? D.dZero) : D.dZero)
                            .reduce(D.add, 0);
                    },
                },
                fr: {
                    water() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.fr?.water ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                    cold() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.fr?.cold ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                },
            },
            bonus: D(1.25),
            malus: D(.75),
            highest() {
                const condiments = Object.entries(player.con.condiments)
                    .filter(([, data]) => D.gt(data.amount, 0));

                if (!condiments.length) return '';

                return condiments.sort(([, data_a], [, data_b]) => D.cmp(data_a.amount, data_b.amount))[0][0];
            },
        },
        '': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                if (inChallenge('b', 91) && !player.con.condiment) {
                    const amount = player.con.points,
                        amlo = D.add(amount, 50).log(50).max(0).minus(1);
                    return {
                        to: {
                            material_cost: D.pow(2, amlo),
                            floor_cost: D.pow(.5, amlo),
                        },
                        k: {
                            oven_size: amlo.neg(),
                            stomach_size: amlo.neg(),
                        },
                        fr: {
                            water: D.pow(.5, amlo),
                            cold: D.pow(.5, amlo),
                        },
                    }
                };
                return {};
            },
            formulas() {
                if (inChallenge('b', 91)) return {
                    to: {
                        material_cost: '* 2 ^ (log50(spice + 50) - 1)',
                        floor_cost: '/ 2 ^ (log50(spice + 50) - 1)',
                    },
                    k: {
                        oven_size: '- (log50(spice + 50) - 1)',
                        stomach_size: '- (log50(spice + 50) - 1)',
                    },
                    fr: {
                        water: '/ 2 ^ (log50(spice + 50) - 1)',
                        cold: '/ 2 ^ (log50(spice + 50) - 1)',
                    },
                };
                return {};
            },
            name: 'none',
            color: '#00000000',
        },
        pepper: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 100).log(100).max(0).minus(1);

                return {
                    k: {
                        oven_size: amlo,
                        stomach_size: amlo,
                    },
                    fr: {
                        water: D.pow(.5, amlo),
                        cold: D.pow(.5, amlo),
                    },
                };
            },
            formulas: {
                k: {
                    oven_size: '+ (log100(pepper + 100) - 1)',
                    stomach_size: '+ (log100(pepper + 100) - 1)',
                },
                fr: {
                    water: '/ 2 ^ (log100(pepper + 100) - 1)',
                    cold: '/ 2 ^ (log100(pepper + 100) - 1)',
                },
            },
            name: 'pepper',
            color: '#DD3355',
        },
        mint: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 100).log(100).max(0).minus(1);

                return {
                    to: {
                        material_cost: D.pow(2, amlo),
                    },
                    k: {
                        oven_size: amlo.neg(),
                    },
                    fr: {
                        water: D.pow(2, amlo),
                        cold: D.pow(2, amlo),
                    },
                };
            },
            formulas: {
                to: {
                    material_cost: '* 2 ^ (log100(mint + 100) - 1)',
                },
                k: {
                    oven_size: '- (log100(mint + 100) - 1)',
                },
                fr: {
                    water: '* 2 ^ (log100(mint + 100) - 1)',
                    cold: '* 2 ^ (log100(mint + 100) - 1)'
                },
            },
            name: 'mint',
            color: '#99FF99',
        },
        vinegar: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 100).log(100).max(0).minus(1);

                return {
                    to: {
                        floor_cost: D.pow(2, amlo),
                    },
                    k: {
                        oven_size: amlo,
                        stomach_size: amlo.neg(),
                    },
                    fr: {
                        water: D.pow(.5, amlo),
                    },
                };
            },
            formulas: {
                to: {
                    floor_cost: '* 2 ^ (log100(vinegar + 100) - 1)',
                },
                k: {
                    oven_size: '+ (log100(vinegar + 100) - 1)',
                    stomach_size: '- (log100(vinegar + 100) - 1)',
                },
                fr: {
                    water: '/ 2 ^ (log100(vinegar + 100) - 1)'
                },
            },
            name: 'vinegar',
            color: '#DDAA55',
        },
        ginger: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 100).log(100).max(0).minus(1);

                return {
                    to: {
                        material_cost: D.pow(.5, amlo),
                        floor_cost: D.pow(2, amlo),
                    },
                    k: {
                        oven_size: amlo.neg(),
                    },
                    fr: {
                        cold: D.pow(.5, amlo),
                    },
                };
            },
            formulas: {
                to: {
                    material_cost: '/ 2 ^ (log100(ginger + 100) - 1)',
                    floor_cost: '* 2 ^ (log100(ginger + 100) - 1)',
                },
                k: {
                    oven_size: '- (log100(ginger + 100) - 1)',
                },
                fr: {
                    cold: '/ 2 ^ (log100(ginger + 100) - 1)',
                },
            },
            name: 'ginger',
            color: '#BB6600',
        },
    },
    //todo update
    shouldNotify() { return inChallenge('b', 91) && canCompleteChallenge('b', 91); },
});
