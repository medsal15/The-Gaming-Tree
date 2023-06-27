'use strict';

//todo add Tree damage for type 'ent' (in enemy.damage)
addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    /** @returns {typeof player.xp} */
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            health: Object.fromEntries(layers.xp?.enemy.all_types.map(id => [id, D.dZero]) ?? []),
            kills: Object.fromEntries(layers.xp?.enemy.all_types.map(id => [id, D.dZero]) ?? []),
            type: 'slime',
            clicked: false,
            last_drops: Object.fromEntries(layers.xp?.enemy.all_types.map(id => [id, []]) ?? []),
        };
    },
    tooltip() {
        return `${formatWhole(player.xp.points)} experience<br>${formatWhole(tmp.xp.total.kills)} kills`;
    },
    color() { return tmp.xp.enemy.color; },
    row: 0,
    position: 0,
    resource: 'experience',
    hotkeys: [
        {
            key: 'X',
            description: 'Shift + X: Display experience points layer',
            unlocked() { return player.xp.unlocked; },
            onPress() { if (player.xp.unlocked) showTab('xp'); },
        },
        {
            key: 'ArrowUp',
            description: '↑ (in XP): Switch to previous enemy',
            unlocked() { return tmp.xp.enemy.types.length > 1; },
            onPress() {
                const types = tmp.xp.enemy.types;
                if (player.tab == 'xp' && player.xp.type != types[0]) {
                    const i = types.indexOf(player.xp.type);
                    if (i == -1) player.xp.type = types[0];
                    else player.xp.type = types[i - 1];
                };
            },
        },
        {
            key: 'ArrowDown',
            description: '↓ (in XP): Switch to next enemy',
            unlocked() { return tmp.xp.enemy.types.length > 1; },
            onPress() {
                const types = tmp.xp.enemy.types;
                if (player.tab == 'xp' && player.xp.type != types[types.length - 1]) {
                    const i = types.indexOf(player.xp.type);
                    if (i == -1) player.xp.type = types[0];
                    else player.xp.type = types[i + 1];
                };
            },
        },
    ],
    tabFormat: {
        'Enemy': {
            content: [
                () => {
                    const speed = layers.clo.time_speed('xp');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;${style.join(';')}">${text}</span>`,
                            capped = !tmp.l.canBuyMax && player.xp.points.gte(getNextAt('l')),
                            xp_text = capped ? 'hardcapped' : layerColor('xp', `+${format(tmp.xp.enemy.experience)}`),
                            kill_pieces = [];
                        if (tmp.xp.total.kills.neq(player.xp.kills[player.xp.type])) {
                            kill_pieces.push(kill_style(`<span title="Kills from the current enemy">${format(player.xp.kills[player.xp.type])}</span>`));
                        }
                        if (tmp.xp.enemy.kills.neq(1)) {
                            kill_pieces.push(kill_style(`+${format(tmp.xp.enemy.kills)}`));
                        }

                        const kill_text = kill_pieces.length ? ` (${kill_pieces.join(', ')})` : '';

                        return `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} (${xp_text}) experience
                            and ${kill_style(format(tmp.xp.total.kills, 0), 'font-size:1.5em')}${kill_text} kills`;
                    },
                ],
                'blank',
                ['bar', 'health'],
                ['display-text', () => {
                    const level = tmp.xp.enemy.level;
                    let text = '';
                    if (options.colorLevels) {
                        text = capitalize(layers.xp.enemy.color_level(level));
                    } else {
                        text = `Level ${formatWhole(tmp.xp.enemy.level)}`;
                    }
                    return `${text} ${player.xp.type}`
                }],
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => `Current damage: ${format(tmp.xp.enemy.damage)}`],
                'blank',
                ['display-text', () => {
                    const type = player.xp.type;
                    if (!layers.lo.items["*"].can_drop('enemy:') || player.xp.kills[type].lte(0)) return;

                    let drops = 'nothing';
                    const last_drops = player.xp.last_drops[type];
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));

                    return `${layers.xp.enemy.name(type).replace(/^./, s => s.toUpperCase())} dropped ${drops}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} experience
                            and ${kill_style(format(tmp.xp.total.kills, 0), 'font-size:1.5em')} kills`;
                    },
                ],
                'blank',
                ['upgrades', [1, 2, 3, 4]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('xp')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
        'Info': {
            content: [
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} experience
                            and ${kill_style(format(tmp.xp.total.kills, 0), 'font-size:1.5em')} kills`;
                    },
                ],
                'blank',
                ['display-text', () => {
                    const kill_style = (text, ...style) => `<span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;${style.join(';')}">${text}</span>`,
                        enemy_style = (type, text, ...style) => {
                            const color = layers.xp.enemy.color(type);
                            return `<span style="color:${color};text-shadow:${color} 0 0 10px;${style.join(';')}">${text}</span>`
                        },
                        show_dps = hasChallenge('b', 12),
                        row = type => {
                            const kills = layers.xp.enemy.kills(type),
                                kill_text = kills.neq(1) ? ` (+${kill_style(format(kills))})` : '',
                                dps = show_dps ? `<td>${type == player.xp.type ? '<u>' : ''}${format(layers.xp.enemy.dps(type))}${type == player.xp.type ? '</u>' : ''}</td>` : '';
                            return `<tr>\
                                <td>${capitalize(layers.xp.enemy.name(type))}</td>\
                                <td>${format(player.xp.health[type])} / ${format(layers.xp.enemy.health(type))}</td>\
                                <td>${enemy_style(type, `+${format(layers.xp.enemy.experience(type))}`)}</td>\
                                <td>${kill_style(format(player.xp.kills[type]))}${kill_text}</td>\
                                <td>${options.colorLevels ? capitalize(layers.xp.enemy.color_level(layers.xp.enemy.level(type))) : formatWhole(layers.xp.enemy.level(type))}</td>\
                                ${dps}\
                            </tr>`;
                        };

                    return `<table class="layer-table" style="--color:${tmp.xp.color};">
                        <tr>
                            <th>Enemy</th>
                            <th>Health</th>
                            <th>Experience</th>
                            <th>Kills</th>
                            <th>${options.colorLevels ? 'Color' : 'Level'}</th>
                            ${show_dps ? '<th>DPS</th>' : ''}
                        </tr>
                        ${tmp.xp.enemy.types.map(row).join('')}
                    </table>`;
                }],
            ],
            unlocked() { return tmp.xp.enemy.types.length > 1; }, // Otherwise it'd show what you can see in the main view
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/previous-button.svg')`, },
            unlocked() { return tmp.xp.enemy.types.length > 1; },
            canClick() { return player.xp.type != tmp.xp.enemy.types[0]; },
            onClick() {
                const i = tmp.xp.enemy.types.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.enemy.types[0];
                else player.xp.type = tmp.xp.enemy.types[i - 1];
            },
        },
        12: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return D.gt(player.xp.health[player.xp.type], 0); },
            onClick() {
                player.xp.health[player.xp.type] = D.minus(player.xp.health[player.xp.type], tmp.xp.enemy.damage);
                player.xp.clicked = true;
            },
            onHold() {
                player.xp.health[player.xp.type] = D.minus(player.xp.health[player.xp.type], tmp.xp.enemy.damage.div(3));
                player.xp.clicked = true;
            },
        },
        13: {
            style: { 'background-image': `url('./resources/images/next-button.svg')`, },
            unlocked() { return tmp.xp.enemy.types.length > 1; },
            canClick() { return player.xp.type != tmp.xp.enemy.types[tmp.xp.enemy.types.length - 1]; },
            onClick() {
                const i = tmp.xp.enemy.types.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.enemy.types[0];
                else player.xp.type = tmp.xp.enemy.types[i + 1];
            },
        },
    },
    upgrades: {
        11: {
            title: 'Sharper Sword',
            description: 'Double damage',
            effect() {
                let base = D(2);

                if (hasUpgrade('xp', 32)) base = base.pow(upgradeEffect('xp', 32));

                return base;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(5) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(5),
        },
        12: {
            title: 'Stronger Monsters',
            description: 'Monsters have more health and give more experience',
            effect() {
                let health = D(10),
                    experience = D(1.5);

                if (hasUpgrade('xp', 32)) {
                    health = health.times(upgradeEffect('xp', 32));
                    experience = experience.pow(upgradeEffect('xp', 32));
                }

                return { health, experience };
            },
            effectDisplay() {
                /** @type {{health: Decimal, experience: Decimal}} */
                const { health, experience } = this.effect();
                return `+${format(health)} health, *${format(experience)} xp`;
            },
            unlocked() { return tmp.xp.total.kills.gte(10) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(10),
        },
        13: {
            title: 'Bloodthirst',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost experience gain';
                } else {
                    let formula = 'log10(kills + 10)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp.total.kills.add(10).log10();

                effect = effect.times(tmp.l.skills.vampirism.effect);

                if (hasUpgrade('xp', 32)) effect = effect.pow(upgradeEffect('xp', 32));

                return effect;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(15) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(15),
        },
        21: {
            title: 'Bloodlust',
            description() {
                if (!shiftDown) {
                    return 'Enemy health boosts damage';
                } else {
                    let formula = '10√(max health + 1) - 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp.enemy.health.add(1).root(10).minus(1);

                effect = effect.times(tmp.l.skills.vampirism.effect);

                return effect;
            },
            effectDisplay() { return `+${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(30) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(50),
        },
        22: {
            title: 'Sword Trap',
            description() {
                let amount = '25%';
                if (hasChallenge('b', 11)) amount = '50%';
                let text = `Passively deal ${amount} of your damage every second`;
                if (hasChallenge('b', 12)) text += `<br>Passively deal 25% of your damage to <u>every</u> monsters every second (see Info tab for current DPS)`;

                return text;
            },
            effect() {
                let active = D(.25),
                    global = D.dZero;

                if (hasChallenge('b', 11)) active = D(.5);

                if (hasChallenge('b', 12)) global = active.div(2);

                return { active, global };
            },
            effectDisplay() {
                if (hasChallenge('b', 12)) return '';
                return `${format(tmp.xp.enemy.damage.times(this.effect().active))} /s`;
            },
            unlocked() { return tmp.xp.total.kills.gte(50) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(150),
        },
        23: {
            title: 'Notebook',
            description: 'Double experience gain',
            effect() {
                let effect = D.dTwo;

                effect = effect.times(tmp.l.skills.reading.effect);

                return effect;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(70) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(250),
        },
        31: {
            title: 'Sword of Knowledge',
            description() {
                if (!shiftDown) {
                    return 'Experience boosts damage';
                } else {
                    let formula = 'log5(experience + 5)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return player.xp.points.add(5).log(5); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(100) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(400),
        },
        32: {
            title: 'Book of Numbers',
            description: 'Reapply first row upgrades effects',
            unlocked() { return tmp.xp.total.kills.gte(125) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            effect() {
                let effect = D.dTwo;

                effect = effect.times(tmp.l.skills.reading.effect);

                return effect;
            },
            effectDisplay() { return `+${format(this.effect().minus(1))} times`; },
            cost: D(600),
        },
        33: {
            title: 'Better Power',
            description: 'Unlock 2 new layers<br>Deal 50% more damage',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(150) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(900),
        },
        41: {
            title: 'Sword of Death',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost damage';
                } else {
                    let formula = 'log9(kills + 9)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp.total.kills.add(9).log(9); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(195),
        },
        42: {
            title: 'Forbidden Knowledge',
            description() {
                if (!shiftDown) {
                    return 'Experience boosts experience gain';
                } else {
                    let formula = '15√(experience) + 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return player.xp.points.root(15).add(1); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(850),
        },
        43: {
            title: 'Cryptoslime',
            description: 'Goblins can also drop slime items at 10% of the rate.<br>Slime level *1.1',
            effect() {
                let level_mult = D(1.1),
                    chance_mult = D(.1);

                return { level_mult, chance_mult };
            },
            effectDisplay() { return `level *${format(this.effect().level_mult)}, chance *${format(this.effect().chance_mult)}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(2222),
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp.enemy.health;
                return D.div(player.xp.health[player.xp.type] ?? max, max);
            },
            display() {
                let text = `${format(player.xp.health[player.xp.type])} / ${format(tmp.xp.enemy.health)}`;

                const regen = tmp.xp.enemy.regen;
                if (regen.gt(0)) {
                    text += `<br>(+${format(regen)}/s)`;
                }

                return text;
            },
            baseStyle: { 'background-color': 'red' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
        },
    },
    update(diff) {
        diff = D.times(diff, layers.clo.time_speed(this.layer));

        for (const type of tmp.xp.enemy.types) {
            const dps = layers.xp.enemy.dps(type),
                regen = layers.xp.enemy.regen(type),
                health = player.xp.health[type];
            if (dps.gt(0)) {
                player.xp.clicked = true;
                player.xp.health[type] = D.minus(health, dps.times(diff));
            }
            if (regen.gt(0) && health.lt(layers.xp.enemy.health(type))) {
                player.xp.health[type] = D.add(health, regen.times(diff)).min(layers.xp.enemy.health(type));
            }
        }
    },
    automate() {
        for (const type of tmp.xp.enemy.all_types) {
            if (D.gt(player.xp.health[type], layers.xp.enemy.health(type))) player.xp.health[type] = layers.xp.enemy.health(type);
            while (D.lte(player.xp.health[type], 0)) {
                if (player.xp.clicked) {
                    //workaround for starting at undefined
                    const xp_gain = tmp.xp.enemy.experience,
                        kills_gain = tmp.xp.enemy.kills;

                    player.xp.points = player.xp.points.add(xp_gain);
                    player.xp.total = D.add(player.xp.total, xp_gain);
                    player.xp.best = D.max(player.xp.best, player.xp.points);
                    player.xp.kills[type] = D.add(player.xp.kills[type], kills_gain);

                    if (layers.lo.items["*"].can_drop('enemy:')) {
                        const drops = player.xp.last_drops[type] = layers.lo.items["*"].get_drops(`enemy:${type}`, kills_gain);
                        layers.lo.items["*"].gain_drops(drops);
                    }
                }

                player.xp.health[type] = D.add(player.xp.health[type], layers.xp.enemy.health(type));
            }
        }
    },
    type: 'none',
    /** @type {typeof layers.xp.enemy} */
    enemy: {
        types() {
            const list = ['slime'];

            if (!inChallenge('b', 31)) {
                if (hasChallenge('b', 11)) list.push('goblin');
                if (hasChallenge('b', 12)) list.push('zombie');
            }

            return list;
        },
        all_types: ['slime', 'goblin', 'zombie'],
        level(type = player.xp.type) {
            const kills = player.xp.kills[type] ?? D.dZero;

            let level = D.div(kills, 10).root(2);

            if (type == 'slime' && hasUpgrade('xp', 43)) level = level.times(upgradeEffect('xp', 43).level_mult);

            return level.floor();
        },
        color_level(level = 0) {
            const l = D(level);
            if (format(l) == 'NaN') return 'unknown';
            /** @type {{[k in number|'e'|'F'|'.']: (len: number) => string}} */
            const map = {
                0: len => [
                    'black',
                    'ebony',
                    'dark',
                    'grim',
                    'inky',
                    'vantablack',
                    'onyx',
                ][len - 1] ?? 'black',
                1: len => [
                    'gray',
                    'dusty',
                    'light gray',
                    'ashen',
                    'grey',
                    'slate',
                    'light grey',
                    'silver',
                ][len - 1] ?? 'gray',
                2: len => [
                    'red',
                    'carmine',
                    'carnelian',
                    'cardinal',
                    'crimson',
                    'coquelicot',
                    'scarlet',
                    'ruby',
                ][len - 1] ?? 'red',
                3: len => [
                    'orange',
                    'carrot',
                    'fulvous',
                    'flame',
                    'ginger',
                    'sunset',
                    'tangerine',
                    'amber',
                ][len - 1] ?? 'orange',
                4: len => [
                    'yellow',
                    'sunglow',
                    'mustard',
                    'jonquil',
                    'mango',
                    'jasmine',
                    'lemon',
                    'gold',
                ][len - 1] ?? 'yellow',
                5: len => [
                    'green',
                    'volt',
                    'mint',
                    'chartreuse',
                    'harlequin',
                    'olive',
                    'moss',
                    'jade',
                ][len - 1] ?? 'green',
                6: len => [
                    'blue',
                    'zaffre',
                    'verdigris',
                    'ultramarine',
                    'glaucous',
                    'azure',
                    'cerulean',
                    'sapphire',
                ][len - 1] ?? 'blue',
                7: len => [
                    'magenta',
                    'purple',
                    'violet',
                    'lavender',
                    'orchid',
                    'lilac',
                    'plum',
                    'amethyst',
                ][len - 1] ?? 'magenta',
                8: len => [
                    'brown',
                    'beige',
                    'chestnut',
                    'chocolate',
                    'coffee',
                    'tan',
                    'sepia',
                    'bronze',
                ][len - 1] ?? 'brown',
                9: len => [
                    'white',
                    'snow',
                    'pale',
                    'bleached',
                    'ghostly',
                    'cream',
                    'light',
                    'ivory',
                ][len - 1] ?? 'white',
                'e': len => 'shifted through',
                'F': len => 'tainted by',
                '.': len => 'covered by',
            };

            return formatWhole(l).replaceAll(/(.)\1*/g, s => `${map[s[0]](s.length)} `);
        },
        color(type = player.xp.type) {
            switch (type) {
                default:
                case 'slime': return '#77BB77';
                case 'goblin': return '#33DD33';
                case 'zombie': return '#779900';
            };
        },
        health(type = player.xp.type) {
            let health;
            switch (type) {
                default:
                case 'slime':
                    health = D(2).pow(layers.xp.enemy.level(type)).times(10);
                    break;
                case 'goblin':
                    health = D(3).pow(layers.xp.enemy.level(type)).times(15);
                    break;
                case 'zombie':
                    health = D(2.5).pow(layers.xp.enemy.level(type)).times(20);
                    break;
            }

            if (hasUpgrade('xp', 12)) health = health.add(upgradeEffect('xp', 12).health);

            health = health.div(buyableEffect('lo', 13));

            if (type == 'slime') {
                if (inChallenge('b', 11)) health = health.times(5);
                if (inChallenge('b', 31)) health = health.times(2.5);
            }

            return health;
        },
        experience(type = player.xp.type) {
            let xp_gain;
            switch (type) {
                default:
                case 'slime':
                    xp_gain = layers.xp.enemy.level(type).add(1);
                    break;
                case 'goblin':
                    xp_gain = layers.xp.enemy.level(type).pow(2).add(2);
                    break;
                case 'zombie':
                    xp_gain = layers.xp.enemy.level(type).pow(2.5).add(4);
                    break;
            }

            if (hasUpgrade('xp', 12)) xp_gain = xp_gain.times(upgradeEffect('xp', 12).experience);
            if (hasUpgrade('xp', 13)) xp_gain = xp_gain.times(upgradeEffect('xp', 13));
            if (hasUpgrade('xp', 23)) xp_gain = xp_gain.times(upgradeEffect('xp', 23));
            if (hasUpgrade('xp', 42)) xp_gain = xp_gain.times(upgradeEffect('xp', 42));

            xp_gain = xp_gain.times(tmp.l.skills.learning.effect);

            /** @type {Decimal} */
            let lo_11_mult = buyableEffect('lo', 11);
            if (type == 'slime') lo_11_mult = lo_11_mult.pow(1.1);
            xp_gain = xp_gain.times(lo_11_mult);

            if (inChallenge('b', 12) && !hasUpgrade('s', 11)) xp_gain = xp_gain.div(player.xp.points.add(10).log10());
            if (hasUpgrade('s', 11)) xp_gain = xp_gain.times(upgradeEffect('s', 11));

            if (!tmp.l.canBuyMax) {
                xp_gain = xp_gain.min(getNextAt('l').minus(player.xp.points));
            }

            return xp_gain;
        },
        kills(type = player.xp.type) {
            let kills = D.dOne;

            if (inChallenge('b', 12) && !hasUpgrade('s', 12)) kills = kills.div(tmp.xp.total.kills.add(10).log10());
            if (hasUpgrade('s', 12)) kills = kills.times(upgradeEffect('s', 12));

            return kills;
        },
        name(type) {
            switch (type) {
                default: return '';
                case 'slime': return 'slime';
                case 'goblin': return 'goblin';
                case 'zombie': return 'zombie';
            }
        },
        damage(type = player.xp.type) {
            let damage = D(1);

            if (hasUpgrade('xp', 21)) damage = damage.add(upgradeEffect('xp', 21));

            if (hasUpgrade('xp', 11)) damage = damage.times(upgradeEffect('xp', 11));
            if (hasUpgrade('xp', 31)) damage = damage.times(upgradeEffect('xp', 31));
            if (hasUpgrade('xp', 33)) damage = damage.times(upgradeEffect('xp', 33));
            if (hasUpgrade('xp', 41)) damage = damage.times(upgradeEffect('xp', 41));

            if (hasUpgrade('m', 21)) damage = damage.times(upgradeEffect('m', 21));

            damage = damage.times(tmp.l.skills.attacking.effect);

            damage = damage.times(buyableEffect('lo', 31));
            damage = damage.times(buyableEffect('lo', 42).xp_damage_mult);

            if (hasUpgrade('s', 71)) damage = damage.times(upgradeEffect('s', 71));

            return damage.max(1);
        },
        dps(type = player.xp.type) {
            let active_damage = D.dZero,
                damage = D.dZero;

            if (hasUpgrade('xp', 22)) {
                active_damage = active_damage.add(upgradeEffect('xp', 22).active);
                damage = damage.add(upgradeEffect('xp', 22).global);
            }

            if (type == player.xp.type) damage = damage.add(active_damage);

            return damage.times(this.damage(type));
        },
        regen(type = player.xp.type) {
            if (type != 'zombie') return D.dZero;

            return this.health('zombie').div(100);
        },
    },
    /** @type {typeof layers.xp.total} */
    total: {
        kills() {
            return Object.values(player.xp.kills).reduce(D.add, D.dZero);
        },
    },
    doReset(layer, force = false) {
        if (!force && layers[layer].row <= this.row) return;

        const keep = ['type'],
            kept_ups = [...player.xp.upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 12).xp_hold).toNumber();

        layerDataReset(this.layer, keep);
        player.xp.upgrades.push(...kept_ups);
        Object.keys(player.xp.health).forEach(type => player.xp.health[type] = layers.xp.enemy.health(type));
    },
});
