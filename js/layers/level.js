addLayer('l', {
    name: 'Levels',
    symbol: 'L',
    startData() {
        const data = {
            unlocked: false,
            points: new Decimal(0),
            change: new Decimal(1),
            skills: {},
        };
        Object.entries(this.skills).forEach(([skill, value]) => {
            if (typeof value == 'function') return;
            data.skills[skill] = {
                level: new Decimal(0),
                points: new Decimal(0),
                progress: new Decimal(0),
            };
        });
        return data;
    },
    color: '#3299FF',
    row: 1,
    resource: 'level',
    layerShown() { return player.l.unlocked || hasUpgrade('xp', 33); },
    hotkeys: [
        {
            key: 'l',
            description: 'L: Reset for levels',
            unlocked() { return player.l.unlocked },
            onPress() { if (player.l.unlocked) doReset('l'); },
        },
        {
            key: 'L',
            description: 'Shift + L: Display level layer',
            unlocked() { return player.l.unlocked },
            onPress() { if (player.l.unlocked) showTab('l'); },
        },
    ],
    tabFormat: {
        'Skills': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                () => player.l.unlocked ? ['text-input', 'change'] : '',
                () => player.l.unlocked ? [
                    'display-text',
                    `You have <span style="color:#84C1FF;text-shadow:#84C1FF 0 0 10px;font-size:1.5em;">
                    ${formatWhole(tmp.l.skills.points)}</span> unassigned skill points`
                ] : '',
                () => {
                    let skill = 'learning';
                    /** @type {number[]} */
                    let clickables = tmp.l.skills[skill].clickables;
                    return tmp.l.bars[skill].unlocked ? ['row', [
                        ['bar', skill],
                        ...clickables.map(n => ['clickable', n]),
                    ]] : ''
                },
                () => {
                    let skill = 'attacking';
                    /** @type {number[]} */
                    let clickables = tmp.l.skills[skill].clickables;
                    return tmp.l.bars[skill].unlocked ? ['row', [
                        ['bar', skill],
                        ...clickables.map(n => ['clickable', n]),
                    ]] : ''
                },
                () => {
                    let skill = 'trapping';
                    /** @type {number[]} */
                    let clickables = tmp.l.skills[skill].clickables;
                    return tmp.l.bars[skill].unlocked ? ['row', [
                        ['bar', skill],
                        ...clickables.map(n => ['clickable', n]),
                    ]] : ''
                },
                () => {
                    let skill = 'evolving';
                    /** @type {number[]} */
                    let clickables = tmp.l.skills[skill].clickables;
                    return tmp.l.bars[skill].unlocked ? ['row', [
                        ['bar', skill],
                        ...clickables.map(n => ['clickable', n]),
                    ]] : ''
                },
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
    milestones: {
        0: {
            requirementDescription: 'Get a level',
            effectDescription: 'Unlock a skill to get more XP',
            done() { return player.l.best.gte(1); },
        },
        1: {
            requirementDescription: 'Get 3 levels',
            effectDescription: 'Unlock a skill to deal more damage',
            done() { return player.l.best.gte(3); },
            unlocked() { return hasMilestone('l', 0); },
        },
        2: {
            requirementDescription: 'Get some levels',
            effectDescription: 'Unlock a skill to deal more passive damage',
            done() { return false; },
            unlocked() { return hasMilestone('l', 1); },
        },
        //todo
    },
    clickables: {
        11: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to learning`; },
            display() { return `Learning has ${formatWhole(player.l.skills.learning.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 0); },
            canClick() { return tmp.l.skills.points.gte(player.l.change); },
            onClick() { player.l.skills.learning.points = player.l.skills.learning.points.add(player.l.change); },
        },
        12: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from learning`; },
            display() { return `Learning has ${formatWhole(player.l.skills.learning.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 0); },
            canClick() { return player.l.skills.learning.points.gte(player.l.change); },
            onClick() { player.l.skills.learning.points = player.l.skills.learning.points.minus(player.l.change); },
        },
        13: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to attacking`; },
            display() { return `Attacking has ${formatWhole(player.l.skills.attacking.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 1); },
            canClick() { return tmp.l.skills.points.gte(player.l.change); },
            onClick() { player.l.skills.attacking.points = player.l.skills.attacking.points.add(player.l.change); },
        },
        14: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from attacking`; },
            display() { return `Attacking has ${formatWhole(player.l.skills.attacking.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 1); },
            canClick() { return player.l.skills.attacking.points.gte(player.l.change); },
            onClick() { player.l.skills.attacking.points = player.l.skills.attacking.points.minus(player.l.change); },
        },
        15: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to trapping`; },
            display() { return `Trapping has ${formatWhole(player.l.skills.trapping.points)} skill points assigned`; },
            unlocked() { return false && hasMilestone('l', 2); },
            canClick() { return tmp.l.skills.points.gte(player.l.change); },
            onClick() { player.l.skills.trapping.points = player.l.skills.trapping.points.add(player.l.change); },
        },
        16: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from trapping`; },
            display() { return `Trapping has ${formatWhole(player.l.skills.trapping.points)} skill points assigned`; },
            unlocked() { return false && hasMilestone('l', 2); },
            canClick() { return player.l.skills.trapping.points.gte(player.l.change); },
            onClick() { player.l.skills.trapping.points = player.l.skills.trapping.points.minus(player.l.change); },
        },
        17: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to evolving`; },
            display() { return `Evolving has ${formatWhole(player.l.skills.evolving.points)} skill points assigned`; },
            unlocked() { return false && hasMilestone('l', 3); },
            canClick() { return tmp.l.skills.points.gte(player.l.change); },
            onClick() { player.l.skills.evolving.points = player.l.skills.evolving.points.add(player.l.change); },
        },
        18: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from evolving`; },
            display() { return `Evolving has ${formatWhole(player.l.skills.evolving.points)} skill points assigned`; },
            unlocked() { return false && hasMilestone('l', 3); },
            canClick() { return player.l.skills.evolving.points.gte(player.l.change); },
            onClick() { player.l.skills.evolving.points = player.l.skills.evolving.points.minus(player.l.change); },
        },
        //todo
    },
    bars: {
        learning: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasMilestone('l', 0); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Learning level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies XP gain by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
        attacking: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasMilestone('l', 1); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Attacking level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies damage gain by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
        trapping: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return false && hasMilestone('l', 2); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Trapping level ${formatWhole(player.l.skills[this.id].level)}<br>
                Increases passive damage by ${format(tmp.l.skills[this.id].effect.times(100))}%`;
            },
        },
        evolving: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return false && hasMilestone('l', 3); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Evolving level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies enemy level by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
        /**
         * TODO
         * - Slaying: bonus kills, unlocked with loot
         * - Looting: bonus loot, unlocked with loot
         */
    },
    /**
     * @type {{
     *  points(): Decimal,
     *  [k: string]: {
     *      needed(): Decimal,
     *      effect(): Decimal,
     *      clickables: number[],
     *  },
     * }}
     */
    skills: {
        points() { return player.l.points.minus(Object.keys(this).reduce((p, s) => p.add(s in player.l.skills ? player.l.skills[s].points : 0), new Decimal(0))).max(0); },
        learning: {
            needed() { return new Decimal(2).pow(player.l.skills.learning.level).times(25); },
            effect() { return new Decimal(1.2).pow(player.l.skills.learning.level); },
            clickables: [11, 12],
        },
        attacking: {
            needed() { return new Decimal(1.5).pow(player.l.skills.attacking.level).times(50); },
            effect() { return player.l.skills.attacking.level.div(10).add(1); },
            clickables: [13, 14],
        },
        trapping: {
            needed() { return new Decimal(2).pow(player.l.skills.trapping.level).times(100); },
            effect() { return player.l.skills.trapping.level.div(20); },
            clickables: [15, 16],
        },
        evolving: {
            needed() { return new Decimal(5).pow(player.l.skills.evolving.level).times(20); },
            effect() { return player.l.skills.evolving.level.div(10).add(1).root(2); },
            clickables: [17, 18],
        },
    },
    update(diff) {
        Object.entries(this.skills).forEach(([s, v]) => {
            if (typeof v == 'function') return;
            /**
             * @type {{
             *  points: Decimal,
             *  progress: Decimal,
             *  level: Decimal,
             * }}
             */
            const skill = player.l.skills[s];
            if (skill.points.gt(0)) {
                let gain = skill.points.pow(2).times(diff);

                skill.progress = skill.progress.add(gain);

                if (skill.progress.gte(tmp.l.skills[s].needed)) {
                    skill.progress = Decimal.dZero;
                    skill.level = skill.level.add(1);
                }
            }
        });
    },
    type: 'static',
    baseResource: 'experience points',
    baseAmount() { return player.xp.points; },
    requires: new Decimal(10_000),
    exponent: new Decimal(2),
    base: new Decimal(1.5),
    roundUpCost: true,
    branches: ['xp'],
});
