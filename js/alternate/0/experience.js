'use strict';

addLayer('xp_alt', {
    name: 'Experience Points',
    symbol: 'XP',
    /** @returns {typeof player.xp_alt} */
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            clicked: false,
            type: 'slime',
            monsters: Object.fromEntries(
                Object.keys(layers.xp_alt.monsters)
                    .map(type => [type, {
                        progress: D.dZero,
                        tamed: D.dZero,
                        last_drops: [],
                        last_drops_times: D.dZero,
                    }])
            ),
        };
    },
    tooltip() {
        return `${formatWhole(player.xp_alt.points)} experience<br>${formatWhole(tmp.xp_alt.total.tamed)} tamed monsters`;
    },
    layerShown() { return player[this.layer].unlocked; },
    color() { return tmp.xp_alt.monsters[player.xp_alt.type].color; },
    color_tame: '#6666AA',
    row: 0,
    position: 0.5,
    resource: 'experience',
    hotkeys: [
        {
            key: 'x',
            description() {
                if (tmp.xp.layerShown) return 'X: Display alternate experience points layer';
                return 'X: Display experience points layer';
            },
            unlocked() { return player.xp_alt.unlocked; },
            onPress() { if (player.xp_alt.unlocked) showTab('xp_alt'); },
        },
        {
            key: 'ArrowUp',
            description() {
                if (!tmp.xp.layerShown) return '↑ (in XP): Switch to previous monster';
                return '↑ (in alt XP): Switch to previous monster';
            },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            onPress() {
                const types = tmp.xp_alt.monsters['*'].list;
                if (player.tab == 'xp_alt' && player.xp_alt.type != types[0]) {
                    const i = types.indexOf(player.xp_alt.type);
                    if (i == -1) player.xp_alt.type = types[0];
                    else player.xp_alt.type = types[i - 1];
                };
            },
        },
        {
            key: 'ArrowDown',
            description() {
                if (!tmp.xp.layerShown) return '↓ (in XP): Switch to next monster';
                return '↓ (in alt XP): Switch to next monster';
            },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            onPress() {
                const types = tmp.xp_alt.monsters['*'].list;
                if (player.tab == 'xp_alt' && player.xp_alt.type != types[types.length - 1]) {
                    const i = types.indexOf(player.xp_alt.type);
                    if (i == -1) player.xp_alt.type = types[0];
                    else player.xp_alt.type = types[i + 1];
                };
            },
        },
    ],
    tabFormat: {
        'Monster': {
            content: [
                [
                    'display-text',
                    () => {
                        const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`,
                            capped = !tmp.l.canBuyMax && D.gte(player.xp_alt.points, tmp.xp.enemies['*'].exp_cap),
                            xp_text = capped ? 'hardcapped' : layerColor('xp_alt', `+${format(tmp.xp_alt.monsters['*'].experience)} /s`),
                            tame_pieces = [];
                        if (tmp.xp_alt.total.tamed.neq(player.xp_alt.monsters[player.xp_alt.type].tamed)) {
                            tame_pieces.push(tame_style(`<span title="Amount of current monster tamed">${format(player.xp_alt.monsters[player.xp_alt.type].tamed)}</span>`));
                        }
                        if (tmp.xp_alt.monsters[player.xp_alt.type].tames.neq(1)) {
                            tame_pieces.push(tame_style(`+${format(tmp.xp_alt.monsters[player.xp_alt.type].tames)}`));
                        }

                        const tame_text = tame_pieces.length ? ` (${tame_pieces.join(', ')})` : '';

                        return `You have ${layerColor('xp_alt', format(player.xp_alt.points), 'font-size:1.5em;')} (${xp_text}) experience
                            and ${tame_style(formatWhole(tmp.xp_alt.total.tamed), 'font-size:1.5em')}${tame_text} tamed monsters`;
                    },
                ],
                'blank',
                ['bar', 'progress'],
                ['display-text', () => `${capitalize(tmp.xp_alt.monsters[player.xp_alt.type].name)}`],
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => `Progress gain: ${format(tmp.xp_alt.monsters[player.xp_alt.type].progress_gain)}`],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => {
                        const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp_alt', format(player.xp_alt.points), 'font-size:1.5em;')} experience
                            and ${tame_style(formatWhole(tmp.xp_alt.total.tamed), 'font-size:1.5em')} tamed monsters`;
                    },
                ],
                'blank',
                ['upgrades', [1, 2, 3, 4, 5]],
            ],
        },
        'Info': {
            content: [
                [
                    'display-text',
                    () => {
                        const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp_alt', format(player.xp_alt.points), 'font-size:1.5em;')} experience
                            and ${tame_style(formatWhole(tmp.xp_alt.total.tamed), 'font-size:1.5em')} tamed monsters`;
                    },
                ],
                'blank',
                ['display-text', () => {
                    const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`,
                        monster_style = (type, text, ...style) => {
                            const color = tmp.xp_alt.monsters[type].color;
                            return `<span style="color:${color};text-shadow:${color} 0 0 10px;${style.join(';')}">${text}</span>`;
                        },
                        row = type => {
                            const monster = tmp.xp_alt.monsters[type],
                                tames = monster.tames,
                                height = Math.max(1, monster.produces.length),
                                items = Array.from({ length: height }, (_, i) => `+${format(monster.produces[i][1])} ${tmp.lo.items[monster.produces[i][0]].name} /s`);

                            /** @type {string[]} */
                            let tame_pieces = [];
                            if (tames.neq(1)) {
                                tame_pieces.push(`+${tame_style(format(tames))}`);
                            }
                            if (monster.passive_tame.gte(1e-4)) {
                                tame_pieces.push(`+${tame_style(format(monster.passive_tame))} /s`);
                            }

                            const tames_text = tame_pieces.length > 0 ? ` (${tame_pieces.join(', ')})` : '';

                            if (!items.length) items.push('Nothing');

                            return `<tr>\
                                    <td>${capitalize(monster.name)}</td>\
                                    <td>${format(player.xp_alt.monsters[type].progress)} / ${format(monster.difficulty)}</td>\
                                    <td>${tame_style(format(player.xp_alt.monsters[type].tamed))} ${tames_text}</td>\
                                    <td>${monster_style(type, `+${format(monster.experience)}`)} /s</td>\
                                    <td>${items.join('<br>')}</td>\
                                <tr>`;
                        };

                    return `<table class="layer-table" style="--color:${tmp.xp_alt.color}">\
                            <tr>\
                                <th>Monster</th>\
                                <th>Progress</th>\
                                <th>Tamed</th>\
                                <th>Experience</th>\
                                <th>Production</th>\
                            </tr>\
                            ${tmp.xp_alt.monsters['*'].list.map(row).join('')}\
                        </table>`;
                }],
            ],
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/previous-button.svg')`, },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            canClick() { return player.xp_alt.type != tmp.xp_alt.monsters['*'].list[0]; },
            onClick() {
                const i = tmp.xp_alt.monsters['*'].list.indexOf(player.xp_alt.type);
                if (i == -1) player.xp_alt.type = tmp.xp_alt.monsters['*'].list[0];
                else player.xp_alt.type = tmp.xp_alt.monsters['*'].list[i - 1];
            },
        },
        12: {
            style: { 'background-image': `url('./resources/images/open-palm.svg')`, },
            canClick() { return D.lt(player.xp_alt.monsters[player.xp_alt.type].progress, tmp.xp_alt.monsters[player.xp_alt.type].difficulty); },
            onClick() {
                const type = player.xp_alt.type;

                player.xp_alt.monsters[type].progress = D.add(player.xp_alt.monsters[type].progress, tmp.xp_alt.monsters[type].progress_gain);
                player.xp_alt.clicked = true;
            },
            onHold() {
                const type = player.xp_alt.type;

                player.xp_alt.monsters[type].progress = D.add(player.xp_alt.monsters[type].progress, tmp.xp_alt.monsters[type].progress_gain.div(3));
                player.xp_alt.clicked = true;
            },
        },
        13: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return D.gte(player.xp_alt.monsters[player.xp_alt.type].tamed, 1); },
            onClick() {
                const type = player.xp_alt.type,
                    player_data = player.xp_alt.monsters[type];

                // Special, you still get a kill for murdering the friendly creature!
                if (type in player.xp.enemies) {
                    player.xp.enemies[type].kills = D.add(player.xp.enemies[type].kills, tmp.xp.enemies[type].kills);
                }

                if (layers.lo.items['*'].can_drop(`tamed_kill:${type}`)) {
                    // However, you don't get the xp drop multipliers
                    const drops = layers.xp_alt.monsters[type].get_drops(D.dOne),
                        equal = drops.length == player_data.last_drops.length &&
                            drops.every(([item, amount]) => player_data.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                    if (equal) {
                        player_data.last_drops_times = D.add(player_data.last_drops_times, 1);
                    } else {
                        player_data.last_drops_times = D.dOne;
                        player_data.last_drops = drops;
                    }

                    layers.lo.items['*'].gain_drops(drops);
                }

                if (inChallenge('b', 62) || hasChallenge('b', 62)) {
                    addPoints('sta', tmp.sta.stats['*'].gain);
                }

                player.xp_alt.monsters[type].tamed = D.minus(player.xp_alt.monsters[type].tamed, 1);
            },
            onHold() {
                const type = player.xp_alt.type,
                    player_data = player.xp_alt.monsters[type];

                // Special, you still get a kill for murdering the friendly creature!
                if (type in player.xp.enemies) {
                    player.xp.enemies[type].kills = D.add(player.xp.enemies[type].kills, tmp.xp.enemies[type].kills);
                }

                if (layers.lo.items['*'].can_drop(`tamed_kill:${type}`)) {
                    // However, you don't get the xp drop multipliers
                    const drops = layers.xp_alt.monsters[type].get_drops(D.dOne),
                        equal = drops.length == player_data.last_drops.length &&
                            drops.every(([item, amount]) => player_data.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                    if (equal) {
                        player_data.last_drops_times = D.add(player_data.last_drops_times, 1);
                    } else {
                        player_data.last_drops_times = D.dOne;
                        player_data.last_drops = drops;
                    }

                    layers.lo.items['*'].gain_drops(drops);
                }

                if (inChallenge('b', 62) || hasChallenge('b', 62)) {
                    addPoints('sta', tmp.sta.stats['*'].gain);
                }

                player.xp_alt.monsters[type].tamed = D.minus(player.xp_alt.monsters[type].tamed, 1);
            },
            tooltip: 'Kill one of this monster, gain its normal drops, but stop gaining XP',
        },
        14: {
            style: { 'background-image': `url('./resources/images/next-button.svg')`, },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            canClick() { return player.xp_alt.type != tmp.xp_alt.monsters['*'].list[tmp.xp_alt.monsters['*'].list.length - 1]; },
            onClick() {
                const i = tmp.xp_alt.monsters['*'].list.indexOf(player.xp_alt.type);
                if (i == -1) player.xp_alt.type = tmp.xp_alt.monsters['*'].list[0];
                else player.xp_alt.type = tmp.xp_alt.monsters['*'].list[i + 1];
            },
        },
    },
    bars: {
        progress: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp_alt.monsters[player.xp_alt.type].difficulty;
                return D.div(player.xp_alt.monsters[player.xp_alt.type].progress ?? max, max);
            },
            display() {
                let text = `${format(player.xp_alt.monsters[player.xp_alt.type].progress)} / ${format(tmp.xp_alt.monsters[player.xp_alt.type].difficulty)}`;

                return text;
            },
            baseStyle: { 'background-color': '#BB3333' },
            fillStyle: { 'background-color': '#3333BB' },
            textStyle: { 'color': 'black' },
        },
    },
    upgrades: {
        11: {
            title: 'Tastier Treats',
            description: 'Double taming progress',
            effect() {
                let base = D(2);

                return base;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(5) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(5),
        },
        12: {
            title: 'Softer Monsters',
            description: 'Monsters are more difficult and give more items',
            effect() {
                let difficulty = D(5),
                    produce = D(1.25);

                return { difficulty, produce, };
            },
            effectDisplay() {
                /** @type {{difficulty: Decimal, produce: Decimal}} */
                const { difficulty, produce } = upgradeEffect(this.layer, this.id);
                return `+${format(difficulty)} difficulty, *${format(produce)} production`;
            },
            unlocked() { return tmp.xp_alt.total.tamed.gte(10) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(10),
        },
        13: {
            title: 'Friendsmell',
            description() {
                if (!shiftDown) {
                    return 'Tamed monsters boost taming progress';
                } else {
                    let formula = 'log10(tamed + 10)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp_alt.total.tamed.add(10).log10();

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(15) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(15),
        },
        21: {
            title: 'Sweet Scent',
            description() {
                if (!shiftDown) {
                    return 'Taming difficulty boosts experience';
                } else {
                    let formula = '10√(difficulty + 1)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp_alt.monsters[player.xp_alt.type].difficulty.add(1).root(10);

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(30) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(50),
        },
        22: {
            title: 'Slime Trap',
            description() {
                if (!shiftDown) {
                    return 'Passively catch slimes';
                } else {
                    let formula = 'progress gain / difficulty';

                    return `Formula: ${formula}`;
                }
            },
            unlocked() { return tmp.xp_alt.total.tamed.gte(50) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(150),
        },
        23: {
            title: 'Group Reading',
            description: 'Double experience gain',
            effect() {
                let effect = D.dTwo;

                effect = effect.add(tmp.l.skills.reading.effect.pow(tmp.a.change_efficiency));

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(70) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(250),
        },
        31: {
            title: 'Crunchy Carrots',
            description() {
                if (!shiftDown) {
                    return 'Tamed monsters boost progress gain';
                } else {
                    let formula = 'log5(tamed + 5)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp_alt.total.tamed.add(5).log(5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(100) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(400),
        },
        32: {
            title: 'How to Care for Monsters for Dummies',
            description: '+50% monster production',
            effect() {
                let mult = D(1.5);

                mult = mult.add(tmp.l.skills.reading.effect.pow(tmp.a.change_efficiency));

                return mult;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(125) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(600),
        },
        33: {
            title: 'Shiny Coin',
            description: 'Unlock goblins<br>Halve taming difficulty',
            effect() { return D(2); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(150) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(900),
        },
        //todo 41, 42, 43
        51: {
            title: 'Stellar Spice',
            description() {
                if (!shiftDown) {
                    return 'Tamed monsters increase star time';
                } else {
                    let formula = 'tamed / 50';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp_alt.total.tamed.div(50); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(567) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(1234),
        },
    },
    /** @type {Layers['xp_alt']['monsters']} */
    monsters: {
        '*': {
            list() {
                return Object.keys(layers.xp_alt.monsters)
                    .filter(type => type != '*' && (tmp.xp_alt.monsters[type].unlocked ?? true));
            },
            experience() {
                return Object.keys(layers.xp_alt.monsters)
                    .filter(type => type != '*' && (tmp.xp_alt.monsters[type].unlocked ?? true))
                    .reduce((sum, type) => D.add(sum, tmp.xp_alt.monsters[type].experience), D.dZero);
            },
            experience_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 21)) mult = mult.times(upgradeEffect('xp_alt', 21));
                if (hasUpgrade('xp_alt', 23)) mult = mult.times(upgradeEffect('xp_alt', 23));

                // Main
                if (hasUpgrade('xp', 12)) mult = mult.times(upgradeEffect('xp', 12).experience.pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13).pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23).pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp', 42)) mult = mult.times(upgradeEffect('xp', 42).pow(tmp.a.change_efficiency));

                mult = mult.times(tmp.l.skills.learning.effect.pow(tmp.a.change_efficiency));

                mult = mult.times(buyableEffect('lo', 11).pow(tmp.a.change_efficiency));

                if (inChallenge('b', 12) && !hasUpgrade('s', 41)) {
                    let div = player.xp_alt.points.add(10).log10().pow(tmp.a.change_efficiency);
                    mult = mult.div(div);
                }
                if (hasUpgrade('s', 41)) mult = mult.div(upgradeEffect('s', 41).pow(tmp.a.change_efficiency));

                return mult;
            },
            progress_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 11)) mult = mult.times(upgradeEffect('xp_alt', 11));
                if (hasUpgrade('xp_alt', 13)) mult = mult.times(upgradeEffect('xp_alt', 13));
                if (hasUpgrade('xp_alt', 31)) mult = mult.times(upgradeEffect('xp_alt', 31));

                return mult;
            },
            difficulty_add() {
                let add = D.dZero;

                if (hasUpgrade('xp_alt', 12)) add = add.add(upgradeEffect('xp_alt', 12).difficulty);

                return add;
            },
            difficulty_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 33)) mult = mult.div(upgradeEffect('xp_alt', 33));

                return mult;
            },
            produce_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 12)) mult = mult.times(upgradeEffect('xp_alt', 12).produce);
                if (hasUpgrade('xp_alt', 32)) mult = mult.times(upgradeEffect('xp_alt', 32));

                return mult;
            },
            tames_mult() {
                let mult = D.dOne;

                if (inChallenge('b', 12) && !false) {
                    mult = mult.div(tmp.xp_alt.total.tamed.add(10).log10());
                }

                return mult;
            },
        },
        // Normal monsters
        slime: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#884488',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty() {
                const tamed = player.xp_alt.monsters[player.xp_alt.type].tamed ?? D.dZero;

                let exp = D(1.1),
                    base = D(10);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                let exp = D(.01);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                exp = exp.times(D.pow(buyableEffect('lo', 11), .1).pow(tmp.a.change_efficiency));

                return exp.times(monst);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['slime_goo', D(1 / 30),],
                    ['slime_core_shard', D(1 / 160),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10());
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame() {
                if (!hasUpgrade('xp_alt', 22)) return D.dZero;

                return D.div(tmp.xp_alt.monsters[this.type].progress_gain, tmp.xp_alt.monsters[this.type].difficulty).times(tmp.xp_alt.monsters[this.type].tames);
            },
            get_drops(kills) { return layers.xp.enemies[this.type].get_drops(kills); },
        },
        goblin: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#44FF44',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty() {
                const tamed = player.xp_alt.monsters[player.xp_alt.type].tamed ?? D.dZero;

                let exp = D(1.15),
                    base = D(20);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                let exp = D(.04);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                return exp.times(monst);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['red_fabric', D(1 / 40),],
                    ['pyrite_coin', D(1 / 250),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10());
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame() {
                return D.dZero;
            },
            get_drops(kills) { return layers.xp.enemies[this.type].get_drops(kills); },
            unlocked() { return hasUpgrade('xp_alt', 33) },
        },
        zombie: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#557700',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty() {
                const tamed = player.xp_alt.monsters[player.xp_alt.type].tamed ?? D.dZero;

                let exp = D(1.2),
                    base = D(40);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                let exp = D(.08);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                return exp.times(monst);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['rotten_flesh', D(1 / 50),],
                    ['brain', D(1 / 3430),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10());
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame() {
                return D.dZero;
            },
            get_drops(kills) { return layers.xp.enemies[this.type].get_drops(kills); },
            unlocked: false,
        },
        ent: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#448811',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty() {
                const tamed = player.xp_alt.monsters[player.xp_alt.type].tamed ?? D.dZero;

                let exp = D(1.25),
                    base = D(80);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                let exp = D(.16);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                return exp.times(monst);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[player.xp_alt.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['leaf', D(1 / 60),],
                    ['seed', D(1 / 5120),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount, 10).log10());
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame() {
                return D.dZero;
            },
            get_drops(kills) { return layers.xp.enemies[this.type].get_drops(kills); },
            unlocked: false,
        },
    },
    /** @type {Layers['xp_alt']['total']} */
    total: {
        tamed() {
            return Object.values(player.xp_alt.monsters).reduce((sum, data) => D.add(sum, data.tamed), D.dZero);
        },
    },
    type: 'none',
    doReset(layer, force = false) {
        if (!force && layers[layer].row <= this.row) return;

        /** @type {(keyof player['xp_alt'])[]} */
        const keep = ['type'],
            kept_ups = [...player.xp_alt.upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 12).xp_hold.pow(tmp.a.change_efficiency).floor()).toNumber();

        layerDataReset(this.layer, keep);
        player.xp_alt.upgrades.push(...kept_ups);
        Object.keys(player.xp_alt.monsters).forEach(type => player.xp_alt.monsters[type] = {
            progress: D.dZero,
            last_drops: [],
            last_drops_times: D.dZero,
            tamed: D.dZero,
        });
    },
    update(diff) {
        addPoints('xp_alt', D.times(tmp.xp_alt.monsters['*'].experience, diff));

        for (const type of tmp.xp_alt.monsters['*'].list) {
            if (D.gt(player.xp_alt.monsters[type].tamed, 0)) {
                /** @type {[string, Decimal][]} */
                const production = tmp.xp_alt.monsters[type].produces.map(([item, amount]) => [item, D.times(diff, amount)]);

                layers.lo.items['*'].gain_drops(production);
            }
            if (D.gt(tmp.xp_alt.monsters[type].passive_tame, 0)) {
                player.xp_alt.monsters[type].tamed = D.add(player.xp_alt.monsters[type].tamed, D.times(tmp.xp_alt.monsters[type].passive_tame, diff));
            }
        }
    },
    automate() {
        for (const type of tmp.xp_alt.monsters['*'].list) {
            const player_data = player.xp_alt.monsters[type];

            if (D.gte(player_data.progress, tmp.xp_alt.monsters[type].difficulty)) {
                if (player.xp_alt.clicked) {
                    // Workaround for starting at undefined
                    player_data.progress = D.minus(player_data.progress, tmp.xp_alt.monsters[type].difficulty);
                    player_data.tamed = D.add(player_data.tamed, tmp.xp_alt.monsters[type].tames);
                }
            }
        }
    },
});
