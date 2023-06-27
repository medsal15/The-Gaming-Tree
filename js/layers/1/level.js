'use strict';

addLayer('l', {
    name: 'Level',
    symbol: 'L',
    /** @returns {typeof player.l} */
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            change: D.dOne,
            skills: Object.fromEntries(
                Object.keys(layers.l.skills)
                    .filter(skill => skill != '*')
                    .map(skill => [skill, { points: D.dZero, level: D.dZero, progress: D.dZero, }])
            ),
        };
    },
    layerShown() { return (player.l.unlocked || hasUpgrade('xp', 33)) && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#6699BB',
    row: 1,
    position: 0,
    resource: 'levels',
    hotkeys: [
        {
            key: 'l',
            description: 'L: Reset for levels',
            unlocked() { return player.l.unlocked; },
            onPress() { doReset('l'); },
        },
        {
            key: 'L',
            description: 'Shift + L: Display levels layer',
            unlocked() { return player.l.unlocked; },
            onPress() { showTab('l'); },
        },
    ],
    tabFormat: {
        'Skills': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                () => {
                    const speed = layers.clo.time_speed('l');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `Skill points: ${layerColor('l', format(tmp.l.skills["*"].left))} / ${layerColor('l', format(tmp.l.skills["*"].max))}`],
                ['text-input', 'change'],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.l.skills)
                        .filter(skill => skill != '*')
                        .map(skill => layers.l.skills["*"].show_skill(skill))
                ],
            ],
        },
        'Milestones': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'milestones',
            ],
        },
    },
    /*
    I know what you're thinking, looking at this.
    > Why not just make a bar and 2 clickables for each skill?
    Because it's annoying to copy paste the same things for every skill.
    Especially when you're still adding some.
    */
    regex: /^(add|remove)_([a-z_]+)$/,
    clickables: new Proxy({}, {
        /** @returns {Clickable} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'l';
            const matches = layers.l.regex.exec(prop);
            if (matches) {
                /** @type {[string, 'add'|'remove', string]} */
                const [, mode, skill] = matches;
                return {
                    canClick() { return player.l.change.lte(mode == 'add' ? tmp.l.skills["*"].left : player.l.skills[skill].points); },
                    onClick() { player.l.skills[skill].points = player.l.skills[skill].points[mode == 'add' ? 'add' : 'minus'](player.l.change); },
                    display() { return `${mode == 'add' ? 'Add' : 'Remove'} ${format(player.l.change)} skills points ${mode == 'add' ? 'to' : 'from'} ${tmp.l.skills[skill].name}`; },
                    unlocked() { return tmp.l.skills[skill].unlocked; },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || layers.l.regex.exec(prop)) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop != '*' && !!layers.l.regex.exec(prop); },
        ownKeys(_) {
            return Object.keys(layers.l.skills)
                .filter(skill => skill != '*')
                .map(skill => [`add_${skill}`, `remove_${skill}`])
                .flat();
        },
    }),
    bars: new Proxy({}, {
        /** @returns {Bar} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'l';
            if (prop in layers.l.skills && prop != '*') {
                return obj[prop] ??= {
                    direction: RIGHT,
                    width: 300,
                    height: 50,
                    unlocked() { return tmp.l?.skills?.[prop]?.unlocked; },
                    progress() { return D.div(player.l.skills[prop].progress, tmp.l?.skills?.[prop]?.needed); },
                    display() { return tmp.l?.skills?.[prop]?.text; },
                    textStyle: { 'color': 'gray', },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || (prop in layers.l.skills && prop != '*')) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop != '*' && prop in layers.l.skills; },
        ownKeys(_) { return Object.keys(layers.l.skills).filter(skill => skill != '*'); },
    }),
    milestones: {
        1: {
            requirementDescription: 'Get a level',
            effectDescription: 'Unlock a skill to deal more damage',
            done() { return player.l.points.gte(1); },
        },
        2: {
            requirementDescription: 'Get 3 levels',
            effectDescription: 'Unlock a skill to get more experience',
            unlocked() { return hasMilestone('l', 1); },
            done() { return player.l.points.gte(3); },
        },
        3: {
            requirementDescription: 'Get 5 levels',
            effectDescription: 'Unlock a skill to boost some upgrades',
            unlocked() { return hasMilestone('l', 2); },
            done() { return player.l.points.gte(5); },
        },
        4: {
            requirementDescription: 'Get 7 levels',
            effectDescription: 'Unlock a skill to boost some more upgrades',
            unlocked() { return hasMilestone('l', 3); },
            done() { return player.l.points.gte(7); },
        },
    },
    /** @type {typeof layers.l.skills} */
    skills: {
        '*': {
            max() {
                let max = player.l.points;

                max = max.add(buyableEffect('lo', 43));

                return max;
            },
            left() { return tmp.l.skills["*"].max.minus(Object.values(player.l.skills).reduce((u, { points }) => u.add(points), D.dZero)); },
            show_skill(skill) {
                if (!(skill in layers.l.skills)) return [];
                return ['row', [
                    ['bar', skill],
                    ['clickable', `add_${skill}`],
                    ['clickable', `remove_${skill}`],
                ]];
            },
            speed() {
                let speed = D.dOne;

                if (hasUpgrade('m', 31)) speed = speed.times(upgradeEffect('m', 31));

                speed = speed.times(buyableEffect('lo', 33));

                return speed;
            },
        },
        attacking: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(2).times(25); },
            effect() {
                if (tmp.l.deactivated) return D.dOne;
                return D(1.15).pow(player.l.skills[this.id].level);
            },
            unlocked() { return hasMilestone('l', 1); },
            text() {
                return `Attacking level ${formatWhole(player.l.skills[this.id].level)}<br>\
                ${format(player.l.skills[this.id].points)} points assigned to attacking<br>\
                Damage *${format(this.effect())}`;
            },
            name: 'attacking',
        },
        learning: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(1.9).times(60); },
            effect() {
                if (tmp.l.deactivated) return D.dOne;
                return D(1.1).pow(player.l.skills[this.id].level);
            },
            unlocked() { return hasMilestone('l', 2); },
            text() {
                return `Learning level ${formatWhole(player.l.skills[this.id].level)}<br>\
                ${format(player.l.skills[this.id].points)} points assigned to learning<br>\
                Experience gain *${format(this.effect())}`;
            },
            name: 'learning',
        },
        vampirism: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(1.8).times(270); },
            effect() {
                if (tmp.l.deactivated) return D.dOne;
                return D(.25).times(player.l.skills[this.id].level).add(1);
            },
            unlocked() { return hasMilestone('l', 3); },
            text() {
                return `Vampirism level ${formatWhole(player.l.skills[this.id].level)}<br>\
                ${format(player.l.skills[this.id].points)} points assigned to vampirism<br>\
                ${layerColor('xp', tmp.xp.upgrades[13].title)} and ${layerColor('xp', tmp.xp.upgrades[21].title)} effects *${format(this.effect())}`;
            },
            name: 'vampirism',
        },
        reading: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(1.8).times(130); },
            effect() {
                if (tmp.l.deactivated) return D.dOne;
                return D(.125).times(player.l.skills[this.id].level).add(1);
            },
            unlocked() { return hasMilestone('l', 4); },
            text() {
                return `Reading level ${formatWhole(player.l.skills[this.id].level)}<br>\
                ${format(player.l.skills[this.id].points)} points assigned to reading<br>\
                ${layerColor('xp', tmp.xp.upgrades[23].title)} and ${layerColor('xp', tmp.xp.upgrades[32].title)} effects *${format(this.effect())}`;
            },
            name: 'reading',
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));

        let skill_speed = D.times(diff, tmp.l.skills["*"].speed);

        Object.values(player.l.skills)
            .filter(({ points }) => points.gt(0))
            .forEach(skill => {
                let { points } = skill;

                if (hasUpgrade('s', 73)) points = points.times(upgradeEffect('s', 73));

                skill.progress = skill.progress.add(points.pow(2).times(skill_speed));
            });
    },
    automate() {
        Object.entries(player.l.skills).forEach(([skill, pdata]) => {
            const tdata = tmp.l.skills[skill];
            while (pdata.progress.gte(tdata.needed)) {
                const tdata = tmp.l.skills[skill];
                pdata.progress = pdata.progress.minus(tdata.needed);
                pdata.level = pdata.level.add(1);
            }
        });
    },
    gainMult() {
        let div = D.dOne;

        if (inChallenge('b', 12) && !hasUpgrade('s', 13)) div = div.div(player.l.points.add(10).log10());
        if (hasUpgrade('s', 13)) div = div.div(upgradeEffect('s', 13));

        if (hasUpgrade('s', 82)) div = div.div(upgradeEffect('s', 82));

        return div;
    },
    type: 'static',
    baseResource: 'experience points',
    baseAmount() { return player.xp.points; },
    requires: D(12_500),
    base: D.dTwo,
    exponent: D.dTwo,
    roundUpCost: true,
    branches: ['xp'],
});
