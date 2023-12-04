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
        const style = {
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'background-size': 'contain',
        };

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

                            let change_str = '',
                                change = D.times(amount, tmp.con.condiments['*'].loss).neg();
                            if (player.con.condiment == cond) {
                                change = D.add(change, tmp.con.condiments['*'].gain);
                            }
                            if (D.abs(change).gt(1e-4)) change_str = ` (<span style="color:${tmp_cond.color}">${(change.gt(0) ? '+' : '') + format(change)}</span> /s)`;

                            return ['display-text', `You have <span style="color:${tmp_cond.color};font-size:1.25em;">${format(amount)}</span>${change_str} ${tmp_cond.name}`];
                        })
                ],
                ['display-text', () => `<span class="warning">You lose ${formatWhole(tmp.con.condiments['*'].loss.times(100))}% of your condiment amounts every second</span>`],
                ['display-text', () => `Using the good condiment multiplies food duration by ${format(tmp.con.condiments['*'].bonus)}`],
                ['display-text', () => `<span class="warning">Using the bad condiment multiplies food duration by ${format(tmp.con.condiments['*'].malus)}</span>`],
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
                                    eff = tmp.con.condiments[condiment].effect,
                                    /** @type {Computed<Layers['con']['condiments'][string]['formulas']>} */
                                    formulas = tmp.con.condiments[condiment].formulas,
                                    /** @type {Computed<Layers['con']['condiments'][string]['positive']>} */
                                    {
                                        to = {},
                                        k = {},
                                        fr = {},
                                    } = tmp.con.condiments[condiment].positive;

                                if ('material_cost' in to) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.to.material_cost}]`;
                                    }

                                    if (to.material_cost) {
                                        pros.push(`Divides tower block costs by ${mult_text ?? format(eff.to?.material_cost.pow(-1))}`);
                                    } else {
                                        cons.push(`Multiplies tower block costs by ${mult_text ?? format(eff.to?.material_cost)}`);
                                    }
                                }
                                if ('floor_cost' in to) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.to.floor_cost}]`;
                                    }

                                    if (to.floor_cost) {
                                        pros.push(`Divides tower floor cost by ${mult_text ?? format(eff.to?.floor_cost)}`);
                                    } else {
                                        cons.push(`Multiplies tower floor cost by ${mult_text ?? format(eff.to?.floor_cost.pow(-1))}`);
                                    }
                                }

                                if ('oven_size' in k) {
                                    let add_text;
                                    if (shiftDown) {
                                        add_text = `[${formulas.k.oven_size}]`;
                                    } else {
                                        add_text = format(eff.k?.oven_size.abs());
                                    }

                                    if (k.oven_size) {
                                        pros.push(`Increases oven size by ${add_text}`);
                                    } else {
                                        cons.push(`Decreases oven size by ${add_text}`);
                                    }
                                }
                                if ('stomach_size' in k) {
                                    let add_text;
                                    if (shiftDown) {
                                        add_text = `[${formulas.k.stomach_size}]`;
                                    } else {
                                        add_text = format(eff.k?.stomach_size.abs());
                                    }

                                    if (k.stomach_size) {
                                        pros.push(`Increases stomach size by ${add_text}`);
                                    } else {
                                        cons.push(`Decreases stomach size by ${add_text}`);
                                    }
                                }

                                if ('water' in fr) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.fr.water}]`;
                                    }

                                    if (fr.water) {
                                        pros.push(`Multiplies water gain by ${mult_text ?? format(eff.fr?.water)}`);
                                    } else {
                                        cons.push(`Divides water gain by ${mult_text ?? format(eff.fr?.water.pow(-1))}`);
                                    }
                                }
                                if ('cold' in fr) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.fr.cold}]`;
                                    }

                                    if (fr.cold) {
                                        pros.push(`Multiplies cold gain by ${mult_text ?? format(eff.fr?.cold)}`);
                                    } else {
                                        cons.push(`Divides cold gain by ${mult_text ?? format(eff.fr?.cold.pow(-1))}`);
                                    }
                                }

                                return { pros, cons, };
                            },
                            condiments = Object.keys(layers.con.condiments)
                                .filter(cond => cond != '*' && cond != ''),
                            total_effects = () => {
                                /** @type {string[]} */
                                const lines = [],
                                    {
                                        to,
                                        k,
                                        fr,
                                    } = tmp.con.condiments['*'].total,
                                    pos = text => `<span style="color:#55AA55;">${text}</span>`,
                                    neg = text => `<span class="warning">${text}</span>`;

                                if (to.material_cost.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on tower block costs`);
                                } else if (to.material_cost.lt(1)) {
                                    lines.push(pos(`Divide tower block costs by ${format(to.material_cost.pow(-1))}`));
                                } else {
                                    lines.push(neg(`Multiply tower block costs by ${format(to.material_cost)}`));
                                }
                                if (to.floor_cost.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on tower floor costs`);
                                } else if (to.floor_cost.gt(1)) {
                                    lines.push(pos(`Divide tower floor costs by ${format(to.floor_cost)}`));
                                } else {
                                    lines.push(neg(`Multiply tower floor costs by ${format(to.floor_cost.pow(-1))}`));
                                }

                                if (k.oven_size.eq_tolerance(0, .001)) {
                                    lines.push(`No effects on oven size`);
                                } else if (k.oven_size.gt(0)) {
                                    lines.push(pos(`Increase oven size by ${format(k.oven_size)}`));
                                } else {
                                    lines.push(neg(`Decrease oven size by ${format(k.oven_size.abs())}`));
                                }
                                if (k.stomach_size.eq_tolerance(0, .001)) {
                                    lines.push(`No effects on stomach size`);
                                } else if (k.stomach_size.gt(0)) {
                                    lines.push(pos(`Increase stomach size by ${format(k.stomach_size)}`));
                                } else {
                                    lines.push(neg(`Decrease stomach size by ${format(k.stomach_size.abs())}`));
                                }

                                if (fr.water.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on water gain`);
                                } else if (fr.water.gt(1)) {
                                    lines.push(pos(`Multiply water gain by ${format(fr.water)}`));
                                } else {
                                    lines.push(neg(`Divide water gain by ${format(fr.water.pow(-1))}`));
                                }
                                if (fr.cold.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on cold gain`);
                                } else if (fr.cold.gt(1)) {
                                    lines.push(pos(`Multiply cold gain by ${format(fr.cold)}`));
                                } else {
                                    lines.push(neg(`Divide cold gain by ${format(fr.cold.pow(-1))}`));
                                }

                                return lines.map(eff => ['display-text', eff]);
                            };

                        const lines = [
                            ['Condiment', 'Amount', 'Effects'],
                            ...condiments.map(cond => {
                                let change = D.times(tmp.con.condiments['*'].loss, player.con.condiments[cond].amount).neg(),
                                    change_str = '';
                                const effect = effects(cond);

                                if (player.con.condiment == cond) change = change.add(tmp.con.condiments['*'].gain);
                                if (D.abs(change).gt(1e-4)) change_str = ` (${condiment_color(cond, (change.gt(0) ? '+' : '') + format(change))} /s)`;

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

                        if (inChallenge('b', 91)) lines.push([
                            [['display-text', 'None']],
                            [['display-text', format(player.con.points)]],
                            [
                                ['display-text', 'With no condiment selected:'],
                                ...effects('').cons.map(eff => ['display-text', `<span class="warning">${eff}</span>`])
                            ],
                        ]);

                        lines.push([
                            [['display-text', '<u>Total</u>']],
                            [],
                            [...total_effects()],
                        ]);

                        return lines;
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
                return {
                    'background-color': tmp.con.condiments[this.condiment].color,
                };
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
                return {
                    'background-color': tmp.con.condiments[this.condiment].color,
                };
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
                return {
                    'background-color': tmp.con.condiments[this.condiment].color,
                };
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
                return {
                    'background-color': tmp.con.condiments[this.condiment].color,
                };
            },
        },
    },
    spice: {
        gain() {
            if (!player.con.unlocked && !inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

            return ['pepper', 'mint', 'vinegar', 'ginger'].reduce((sum, condiment) => D.add(sum, player.con.condiments[condiment].amount.add(10).log10().minus(1)), 0);
        },
        formula: 'log10(pepper + 10) + log10(mint + 10) + log10(vinegar + 10) + log10(ginger + 10)',
    },
    condiments: {
        '*': {
            gain() {
                if (!player.con.unlocked && !inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

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

                return condiments.sort(([, data_a], [, data_b]) => D.cmp(data_b.amount, data_a.amount))[0][0];
            },
        },
        '': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                if (inChallenge('b', 91) && !player.con.condiment) {
                    const amount = player.con.points,
                        amlo = D.add(amount, 10).log(10).max(0).minus(1);
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
                    };
                };
                return {};
            },
            formulas() {
                if (inChallenge('b', 91)) return {
                    to: {
                        material_cost: '2 ^ (log10(spice + 10) - 1)',
                        floor_cost: '2 ^ (log10(spice + 10) - 1)',
                    },
                    k: {
                        oven_size: 'log10(spice + 10) - 1',
                        stomach_size: 'log10(spice + 10) - 1',
                    },
                    fr: {
                        water: '2 ^ (log10(spice + 10) - 1)',
                        cold: '2 ^ (log10(spice + 10) - 1)',
                    },
                };
                return {};
            },
            positive() {
                if (inChallenge('b', 91)) return {
                    to: {
                        material_cost: false,
                        floor_cost: false,
                    },
                    k: {
                        oven_size: false,
                        stomach_size: false,
                    },
                    fr: {
                        water: false,
                        cold: false,
                    },
                };
                return {};
            },
            name: 'none',
            color: '#FFFFFF',
        },
        pepper: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

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
                    oven_size: 'log10(pepper + 10) - 1',
                    stomach_size: 'log10(pepper + 10) - 1',
                },
                fr: {
                    water: '2 ^ (log10(pepper + 10) - 1)',
                    cold: '2 ^ (log10(pepper + 10) - 1)',
                },
            },
            positive: {
                k: {
                    oven_size: true,
                    stomach_size: true,
                },
                fr: {
                    water: false,
                    cold: false,
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
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

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
                    material_cost: '2 ^ (log10(mint + 10) - 1)',
                },
                k: {
                    oven_size: 'log10(mint + 10) - 1',
                },
                fr: {
                    water: '2 ^ (log10(mint + 10) - 1)',
                    cold: '2 ^ (log10(mint + 10) - 1)'
                },
            },
            positive: {
                to: {
                    material_cost: false,
                },
                k: {
                    oven_size: false,
                },
                fr: {
                    water: true,
                    cold: true,
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
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

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
                    floor_cost: '2 ^ (log10(vinegar + 10) - 1)',
                },
                k: {
                    oven_size: 'log10(vinegar + 10) - 1',
                    stomach_size: 'log10(vinegar + 10) - 1',
                },
                fr: {
                    water: '2 ^ (log10(vinegar + 10) - 1)'
                },
            },
            positive: {
                to: {
                    floor_cost: true,
                },
                k: {
                    oven_size: true,
                    stomach_size: false,
                },
                fr: {
                    water: false,
                },
            },
            name: 'vinegar',
            color: '#CC9944',
        },
        ginger: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

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
                    material_cost: '2 ^ (log10(ginger + 10) - 1)',
                    floor_cost: '2 ^ (log10(ginger + 10) - 1)',
                },
                k: {
                    oven_size: 'log10(ginger + 10) - 1',
                },
                fr: {
                    cold: '2 ^ (log10(ginger + 10) - 1)',
                },
            },
            positive: {
                to: {
                    material_cost: false,
                    floor_cost: true,
                },
                k: {
                    oven_size: false,
                },
                fr: {
                    cold: true,
                },
            },
            name: 'ginger',
            color: '#BB6600',
        },
    },
    update(diff) {
        if (!tmp.con.layerShown) return;

        player.con.points = D.times(tmp.con.spice.gain, diff).add(player.con.points);

        if (player.con.condiment) {
            player.con.condiments[player.con.condiment].amount = D.times(tmp.con.condiments['*'].gain, diff).add(player.con.condiments[player.con.condiment].amount);
        }
        Object.values(player.con.condiments).forEach(data => data.amount = D.minus(data.amount, D.times(data.amount, tmp.con.condiments['*'].loss)));
    },
    shouldNotify() { return inChallenge('b', 91) && canCompleteChallenge('b', 91); },
    //todo prestigeNotify when can buy buyable
});
