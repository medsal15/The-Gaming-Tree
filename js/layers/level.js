addLayer('l', {
    name: 'Levels',
    symbol: 'L',
    startData() {
        const data = {
            unlocked: false,
            points: D(0),
            change: D(1),
            skills: {},
        };
        Object.entries(this.skills).forEach(([skill, value]) => {
            if (typeof value == 'function') return;
            data.skills[skill] = {
                level: D(0),
                points: D(0),
                progress: D(0),
            };
        });
        return data;
    },
    deactivated() { return inChallenge('b', 21); },
    color: '#3299FF',
    row: 1,
    resource: 'level',
    layerShown() { return !tmp[this.layer].deactivated && (player.l.unlocked || hasUpgrade('xp', 33)); },
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
                    `You have\
                    <span style="color:#84C1FF;text-shadow:#84C1FF 0 0 10px;font-size:1.5em;">${formatWhole(tmp.l.skills.points)}/${formatWhole(tmp.l.skills.total)}</span>\
                    unassigned skill points`
                ] : '',
                ['buyables', [1]],
                () => layers.l.skill_row('attack'),
                () => layers.l.skill_row('learning'),
                () => layers.l.skill_row('running'),
                () => layers.l.skill_row('mining'),
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
            effectDescription: 'Unlock a skill to deal more damage',
            done() { return player.l.best.gte(1); },
        },
        1: {
            requirementDescription: 'Get 3 levels',
            effectDescription: 'Unlock a skill to earn more xp and levels',
            done() { return player.l.best.gte(3); },
            unlocked() { return hasMilestone('l', 0) || player.b.unlocked; },
        },
        2: {
            requirementDescription: 'Get 5 levels',
            effectDescription: 'Unlock a skill to skill faster',
            done() { return player.l.best.gte(5); },
            unlocked() { return hasMilestone('l', 1) || player.b.unlocked; },
        },
        3: {
            requirementDescription: 'Get 7 levels',
            effectDescription() { return `Levels multiply skill points amount by ${format(tmp.l.milestones[3].effect)}`; },
            done() { return player.l.best.gte(7); },
            unlocked() { return hasMilestone('l', 2) || player.b.unlocked; },
            effect() { return player.l.points.root(2); },
        },
    },
    clickables: {
        11: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to attacking`; },
            display() { return `Attacking has ${formatWhole(player.l.skills.attack.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 0); },
            canClick() { return tmp.l.skills.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.attack.points = player.l.skills.attack.points.add(player.l.change); },
        },
        12: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from attacking`; },
            display() { return `Attacking has ${formatWhole(player.l.skills.attack.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 0); },
            canClick() { return player.l.skills.attack.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.attack.points = player.l.skills.attack.points.minus(player.l.change); },
        },
        13: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to learning`; },
            display() { return `Learning has ${formatWhole(player.l.skills.learning.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 1); },
            canClick() { return tmp.l.skills.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.learning.points = player.l.skills.learning.points.add(player.l.change); },
        },
        14: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from learning`; },
            display() { return `Learning has ${formatWhole(player.l.skills.learning.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 1); },
            canClick() { return player.l.skills.learning.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.learning.points = player.l.skills.learning.points.minus(player.l.change); },
        },
        15: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to running`; },
            display() { return `Running has ${formatWhole(player.l.skills.running.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 2); },
            canClick() { return tmp.l.skills.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.running.points = player.l.skills.running.points.add(player.l.change); },
        },
        16: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from running`; },
            display() { return `Running has ${formatWhole(player.l.skills.running.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', 2); },
            canClick() { return player.l.skills.running.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.running.points = player.l.skills.running.points.minus(player.l.change); },
        },
        17: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to looting`; },
            display() { return `Looting has ${formatWhole(player.l.skills.looting.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', -1) && false; },
            canClick() { return tmp.l.skills.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.looting.points = player.l.skills.looting.points.add(player.l.change); },
        },
        18: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from looting`; },
            display() { return `Looting has ${formatWhole(player.l.skills.looting.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', -1) && false; },
            canClick() { return player.l.skills.looting.points.gte(player.l.change); },
            onClick() { player.l.skills.looting.points = player.l.skills.looting.points.minus(player.l.change); },
        },
        21: {
            title() { return `Add ${formatWhole(player.l.change)} skill points to mining`; },
            display() { return `Mining has ${formatWhole(player.l.skills.mining.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', -1) && false; },
            canClick() { return tmp.l.skills.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.mining.points = player.l.skills.mining.points.add(player.l.change); },
        },
        22: {
            title() { return `Remove ${formatWhole(player.l.change)} skill points from mining`; },
            display() { return `Mining has ${formatWhole(player.l.skills.mining.points)} skill points assigned`; },
            unlocked() { return hasMilestone('l', -1) && false; },
            canClick() { return player.l.skills.mining.points.gte(player.l.change) && player.l.change.gt(0); },
            onClick() { player.l.skills.mining.points = player.l.skills.mining.points.minus(player.l.change); },
        },
    },
    bars: {
        attack: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasMilestone('l', 0); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Attack level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies damage by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
        learning: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasMilestone('l', 1); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Learning level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies XP gain by ${format(tmp.l.skills[this.id].effect.xp_mult)} and
                divides Level cost by ${format(tmp.l.skills[this.id].effect.l_div)}`;
            },
        },
        running: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasMilestone('l', 2); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Running level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies skill speed by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
        looting: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasMilestone('l', 1); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Looting level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies XP gain by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
        mining: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() { return player.l.skills[this.id].progress.div(tmp[this.layer].skills[this.id].needed); },
            unlocked() { return hasUpgrade('s', 31); },
            textStyle: { 'color': 'gray' },
            display() {
                return `Mining level ${formatWhole(player.l.skills[this.id].level)}<br>
                Multiplies ore regeneration by ${format(tmp.l.skills[this.id].effect)}`;
            },
        },
    },
    /**
     * @type {{
     *  points(): Decimal,
     *  total(): Decimal,
     *  [k: string]: {
     *      readonly id: string,
     *      needed(): Decimal,
     *      effect(): Decimal,
     *      clickables: number[],
     *  },
     * }}
     */
    skills: {
        points() {
            let points = this.total();

            let loss = Object.keys(this).reduce((p, s) => p.add(s in player.l.skills ? player.l.skills[s].points : 0), D(0));

            return points.minus(loss).max(0).floor();
        },
        total() {
            let points = player.l.points;

            if (hasMilestone('l', 3)) points = points.times(tmp.l.milestones[3].effect);

            return points;
        },
        attack: {
            _id: false,
            get id() {
                if (!this._id) {
                    this._id = (Object.entries(layers.l.skills).find(/**@param {[string, typeof this]}*/([_, k]) => k == this) ?? [false])[0];
                }
                return this._id;
            },
            needed() { return D(1.5).pow(player.l.skills[this.id].level.max(0)).times(25); },
            effect() { return D(1.1).pow(player.l.skills[this.id].level.max(0)); },
            clickables: [11, 12],
        },
        learning: {
            _id: false,
            get id() {
                if (!this._id) {
                    this._id = (Object.entries(layers.l.skills).find(/**@param {[string, typeof this]}*/([_, k]) => k == this) ?? [false])[0];
                }
                return this._id;
            },
            needed() { return D(1.75).pow(player.l.skills[this.id].level.max(0)).times(50); },
            effect() {
                return {
                    xp_mult: player.l.points.div(14).times(player.l.skills[this.id].level.max(0)).add(1),
                    l_div: player.l.points.div(7).times(player.l.skills[this.id].level.max(0)).add(1),
                };
            },
            clickables: [13, 14],
        },
        running: {
            _id: false,
            get id() {
                if (!this._id) {
                    this._id = (Object.entries(layers.l.skills).find(/**@param {[string, typeof this]}*/([_, k]) => k == this) ?? [false])[0];
                }
                return this._id;
            },
            needed() { return D(2).pow(player.l.skills[this.id].level.max(0)).times(99); },
            effect() { return D(1.5).pow(player.l.skills[this.id].level.max(0)); },
            clickables: [15, 16],
        },
        //todo make these available
        looting: {
            _id: false,
            get id() {
                if (!this._id) {
                    this._id = (Object.entries(layers.l.skills).find(/**@param {[string, typeof this]}*/([_, k]) => k == this) ?? [false])[0];
                }
                return this._id;
            },
            needed() { return D(3).pow(player.l.skills[this.id].level.max(0).div(2)).times(200); },
            effect() { return D(1.1).pow(player.l.skills[this.id].level.max(0)); },
            clickables: [17, 18],
        },
        mining: {
            _id: false,
            get id() {
                if (!this._id) {
                    this._id = (Object.entries(layers.l.skills).find(/**@param {[string, typeof this]}*/([_, k]) => k == this) ?? [false])[0];
                }
                return this._id;
            },
            needed() { return D(2).pow(player.l.skills[this.id].level.max(0).times(2)).times(100); },
            effect() { return D(1.25).pow(player.l.skills[this.id].level.max(0)); },
            clickables: [21, 22],
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
                let gain = skill.points.pow(2).times(diff).times(tmp.l.skills.running.effect);
                if (hasUpgrade('o', 31)) gain = gain.times(upgradeEffect('o', 31));

                skill.progress = skill.progress.add(gain);

                if (skill.progress.gte(tmp.l.skills[s].needed)) {
                    skill.progress = D.dZero;
                    skill.level = skill.level.add(1);
                }
            }
        });
    },
    type: 'static',
    baseResource: 'experience points',
    baseAmount() { return player.xp.points; },
    gainMult() {
        let div = D.dOne;

        div = div.div(tmp.l.skills.learning.effect.l_div);
        div = div.div(buyableEffect('lo', 22));
        if (hasUpgrade('s', 13)) div = div.div(upgradeEffect('s', 13));
        if (hasUpgrade('s', 51)) div = div.div(upgradeEffect('s', 51));
        if (hasUpgrade('s', 81)) div = div.div(upgradeEffect('s', 81));

        return div;
    },
    requires: D(10_000),
    exponent: D(2),
    base: D(1.5),
    roundUpCost: true,
    branches: ['xp'],
    /**
    * @param {string} skill
    *
    * @returns {[
    *  'row',
    *  [
    *      ['bar', string],
    *      ...['clickable', number][],
    *  ],
    * ]|''}
    */
    skill_row(skill) {
        /** @type {number[]} */
        let clickables = tmp.l.skills[skill].clickables;
        return tmp.l.bars[skill].unlocked ? ['row', [
            ['bar', skill],
            ...clickables.map(n => ['clickable', n]),
        ]] : ''
    },
});
