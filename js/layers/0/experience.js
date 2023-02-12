'use strict';

addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    /** @returns {Player['xp']} */
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            health: Object.fromEntries(layers.xp?.enemy.types().map(id => [id, D.dZero]) ?? []),
            kills: Object.fromEntries(layers.xp?.enemy.types().map(id => [id, D.dZero]) ?? []),
            type: 'slime',
            ignore_type_warning: false,
            clicked: false,
            last_drops: Object.fromEntries(layers.xp?.enemy.types().map(id => [id, []]) ?? []),
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
            key: 'ArrowLeft',
            description: '←: Move to previous tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + tabs.length - 1) % tabs.length];
            },
        },
        {
            key: 'ArrowRight',
            description: '→: Move to next tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + 1) % tabs.length];
            },
        },
        {
            key: 'X',
            description: 'Shift + X: Display experience points layer',
            unlocked() { return player.xp.unlocked; },
            onPress() { if (player.xp.unlocked) showTab('xp'); },
        },
    ],
    tabFormat: {
        'Enemy': {
            content: [
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;${style.join(';')}">${text}</span>`,
                            kill_text = tmp.xp.enemy.kills.neq(1) ? ` (${kill_style(`+${format(tmp.xp.enemy.kills)}`)})` : '',
                            capped = !tmp.l.canBuyMax && player.xp.points.gte(getNextAt('l')),
                            xp_text = capped ? 'hardcapped' : layerColor('xp', `+${format(tmp.xp.enemy.experience)}`);
                        return `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} (${xp_text}) experience
                            and ${kill_style(format(player.xp.kills[player.xp.type], 0), 'font-size:1.5em')}${kill_text} kills`;
                    },
                ],
                'blank',
                ['bar', 'health'],
                ['display-text', () => {
                    let text = '';
                    if (options.colorLevels) {
                        text = tmp.xp.enemy.color_level.replace(/^(.)/, s => s.toUpperCase());
                    } else {
                        text = `Level ${formatWhole(tmp.xp.enemy.level)}`;
                    }
                    return `${text} ${player.xp.type}`
                }],
                ['clickables', [1]],
                () => tmp.xp.enemy.types.length > 1 ? ['row', [
                    ['display-text', 'Ignore type change warning'],
                    'blank',
                    ['toggle', ['xp', 'ignore_type_warning']],
                ]] : '',
                ['display-text', () => `Current damage: ${format(tmp.xp.clickDamage)}`],
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
                            and ${kill_style(format(player.xp.kills[player.xp.type], 0), 'font-size:1.5em')} kills`;
                    },
                ],
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('xp')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/previous-button.svg')` },
            unlocked() { return tmp.xp.enemy.types.length > 1; },
            canClick() { return player.xp.type != tmp.xp.enemy.types[0]; },
            onClick() {
                if (!player.xp.ignore_type_warning && !confirm('Are you sure you want to change enemy type?\nThis will reset XP')) return;
                const i = tmp.xp.enemy.types.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.enemy.types[0];
                else player.xp.type = tmp.xp.enemy.types[i - 1];

                layers[this.layer].doReset('xp', true);
            },
        },
        12: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return D.gt(player.xp.health[player.xp.type], 0); },
            onClick() {
                player.xp.health[player.xp.type] = D.minus(player.xp.health[player.xp.type], tmp.xp.clickDamage);
                player.xp.clicked = true;
            },
            onHold() {
                player.xp.health[player.xp.type] = D.minus(player.xp.health[player.xp.type], tmp.xp.clickDamage.div(3));
                player.xp.clicked = true;
            },
        },
        13: {
            style: { 'background-image': `url('./resources/images/next-button.svg')` },
            unlocked() { return tmp.xp.enemy.types.length > 1; },
            canClick() { return player.xp.type != tmp.xp.enemy.types[tmp.xp.enemy.types.length - 1]; },
            onClick() {
                if (!player.xp.ignore_type_warning && !confirm('Are you sure you want to change enemy type?\nThis will reset XP')) return;
                const i = tmp.xp.enemy.types.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.enemy.types[0];
                else player.xp.type = tmp.xp.enemy.types[i + 1];

                layers[this.layer].doReset('xp', true);
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
            unlocked() { return tmp.xp.total.kills.gte(5) || hasUpgrade(this.layer, this.id); },
            cost: D(5),
        },
        12: {
            title: 'Stronger Monsters',
            description: 'Monsters have more health and give more experience',
            effect() {
                let effect = {
                    health: D(10), experience: D(1.5)
                };

                if (hasUpgrade('xp', 32)) {
                    effect.health = effect.health.times(upgradeEffect('xp', 32));
                    effect.experience = effect.experience.pow(upgradeEffect('xp', 32));
                }

                return effect;
            },
            effectDisplay() {
                /** @type {{health: Decimal, experience: Decimal}} */
                const { health, experience } = this.effect();
                return `+${format(health)} health, *${format(experience)} xp`;
            },
            unlocked() { return tmp.xp.total.kills.gte(10) || hasUpgrade(this.layer, this.id); },
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
            unlocked() { return tmp.xp.total.kills.gte(15) || hasUpgrade(this.layer, this.id); },
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
            unlocked() { return tmp.xp.total.kills.gte(30) || hasUpgrade(this.layer, this.id); },
            cost: D(50),
        },
        22: {
            title: 'Sword Trap',
            description: 'Passively deal 25% of your damage every second',
            effect() { return D(.25); },
            effectDisplay() { return `${format(tmp.xp.clickDamage.times(this.effect()))} /s`; },
            unlocked() { return tmp.xp.total.kills.gte(50) || hasUpgrade(this.layer, this.id); },
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
            unlocked() { return tmp.xp.total.kills.gte(70) || hasUpgrade(this.layer, this.id); },
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
            unlocked() { return tmp.xp.total.kills.gte(100) || hasUpgrade(this.layer, this.id); },
            cost: D(400),
        },
        32: {
            title: 'Book of numbers',
            description: 'Reapply first row upgrades effects',
            unlocked() { return tmp.xp.total.kills.gte(125) || hasUpgrade(this.layer, this.id); },
            effect() {
                let effect = D.dTwo;

                effect = effect.times(tmp.l.skills.reading.effect);

                return effect;
            },
            effectDisplay() { return `+${format(this.effect().minus(1))} times`; },
            cost: D(600),
        },
        33: {
            title: 'Better power',
            description: 'Unlock 2 new layers<br>Deal 50% more damage',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return tmp.xp.total.kills.gte(150) || hasUpgrade(this.layer, this.id); },
            cost: D(900),
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
            display() { return `${format(player.xp.health[player.xp.type])} / ${format(tmp.xp.enemy.health)}`; },
            baseStyle: { 'background-color': 'red' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
        },
    },
    update(diff) {
        let passive_damage = D.dZero;

        if (hasUpgrade('xp', 22)) passive_damage = passive_damage.add(upgradeEffect('xp', 22));

        if (passive_damage.gt(0)) {
            player.xp.clicked = true;
            /** @type {Decimal} */
            let damage = tmp.xp.clickDamage.times(passive_damage).times(diff);

            player.xp.health[player.xp.type] = D.minus(player.xp.health[player.xp.type], damage);
        }
    },
    automate() {
        const type = player.xp.type;
        if (D.gt(player.xp.health[type], tmp.xp.enemy.health)) player.xp.health[type] = tmp.xp.enemy.health;
        while (D.lte(player.xp.health[type], 0)) {
            let kills = D.dOne;
            if (player.xp.clicked) {
                //workaround for starting at undefined
                const xp_gain = tmp.xp.enemy.experience,
                    kills_gain = tmp.xp.enemy.kills;

                player.xp.points = player.xp.points.add(xp_gain);
                player.xp.total = D.add(player.xp.total, xp_gain);
                player.xp.best = D.max(player.xp.best, player.xp.points);
                player.xp.kills[type] = D.add(player.xp.kills[type], kills_gain);

                kills = kills_gain;

                if (layers.lo.items["*"].can_drop('enemy:')) {
                    const drops = layers.lo.items["*"].get_drops(`enemy:${type}`, kills);
                    player.xp.last_drops[type] = drops;
                    drops.forEach(([item, amount]) => player.lo.items[item].amount = player.lo.items[item].amount.add(amount));
                }
            }

            player.xp.health[type] = D.add(player.xp.health[type], layers.xp.enemy.health());
        }
    },
    type: 'none',
    /** @type {typeof layers.xp.enemy} */
    enemy: {
        types() { return ['slime']; },
        level(type = player.xp.type) {
            const kills = player.xp.kills[type] ?? D.dZero;

            let level = D.div(kills, 10).root(2);

            return level.floor();
        },
        color_level(type = player.xp.type) {
            const level = layers.xp.enemy.level(type);
            if (format(level) == 'NaN') return 'unknown';
            if (level.gte(Number.MAX_VALUE)) return 'rainbow';

            //todo improve to use Decimals
            const colors = ['black', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'white'];

            let color = [],
                l = level.toNumber();
            do {
                const c = l % colors.length;

                l = Math.floor(l / colors.length);
                color.push(colors[c]);
            } while (l > 0)

            return color.join(' ');
        },
        color(type = player.xp.type) {
            switch (type) {
                default:
                case 'slime':
                    return '#7FBF7F';
            };
        },
        health(type = player.xp.type) {
            let health;
            switch (type) {
                default:
                case 'slime':
                    health = D(2).pow(layers.xp.enemy.level(type)).times(10);
                    break;
            }

            if (hasUpgrade('xp', 12)) health = health.add(upgradeEffect('xp', 12).health);

            health = health.div(buyableEffect('lo', 13));

            return health;
        },
        experience(type = player.xp.type) {
            let xp_gain;
            switch (type) {
                default:
                case 'slime':
                    xp_gain = layers.xp.enemy.level(type).add(1);
                    break;
            }

            if (hasUpgrade('xp', 12)) xp_gain = xp_gain.times(upgradeEffect('xp', 12).experience);
            if (hasUpgrade('xp', 13)) xp_gain = xp_gain.times(upgradeEffect('xp', 13));
            if (hasUpgrade('xp', 23)) xp_gain = xp_gain.times(upgradeEffect('xp', 23));

            xp_gain = xp_gain.times(tmp.l.skills.learning.effect);

            /** @type {Decimal} */
            let lo_11_mult = buyableEffect('lo', 11);
            if (type == 'slime') lo_11_mult.pow(1.1);
            xp_gain = xp_gain.times(lo_11_mult);

            if (!tmp.l.canBuyMax) {
                xp_gain = xp_gain.min(getNextAt('l').minus(player.xp.points));
            }

            return xp_gain;
        },
        kills(type = player.xp.type) {
            let kills = D.dOne;

            return kills;
        },
        name(type) {
            switch (type) {
                default: return '';
                case 'slime': return 'slime';
            }
        },
    },
    /** @type {typeof layers.xp.total} */
    total: {
        kills() {
            return Object.values(player.xp.kills).reduce(D.add, D.dZero);
        },
    },
    clickDamage() {
        let damage = D(1);

        if (hasUpgrade('xp', 21)) damage = damage.add(upgradeEffect('xp', 21));

        if (hasUpgrade('xp', 11)) damage = damage.times(upgradeEffect('xp', 11));
        if (hasUpgrade('xp', 31)) damage = damage.times(upgradeEffect('xp', 31));
        if (hasUpgrade('xp', 31)) damage = damage.times(upgradeEffect('xp', 31));

        damage = damage.times(tmp.l.skills.attacking.effect);

        return damage.max(1);
    },
    doReset(layer, force = false) {
        if (!force && layers[layer].row <= this.row) return;

        let keep = ['type', 'ignore_type_warning'],
            kept_ups = [...player.xp.upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 12).xp_hold).toNumber();

        layerDataReset(this.layer, keep);
        player.xp.upgrades.push(...kept_ups);
    },
});
