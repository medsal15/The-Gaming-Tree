addLayer('ach', {
    name: 'Achievements',
    symbol: '⭐',
    startData() {
        return {
            unlocked: true,
        };
    },
    color: '#ffff00',
    row: 'side',
    resource: 'achievements',
    tabFormat: {
        'Achievements': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements`],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows()],
            ],
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows('secret')],
            ],
            unlocked() {
                return layers.ach.ownedAchievements('secret').gte(1);
            },
            buttonStyle: {
                'border-color': 'rgb(127,0,255)',
            },
        },
    },
    achievements: {
        //#region Normal achievements
        11: {
            name: 'Murderer',
            done() { return player.xp.kills.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.xp.color); },
            tooltip: 'Kill a poor innocent slime :(',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        12: {
            name: 'Unlocked an upgrade',
            done() { return player.xp.kills.gte(5); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.xp.color); },
            tooltip: 'Kill more to unlock more upgrades',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        13: {
            name: 'Harder monster',
            done() { return player.xp.level.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.xp.color); },
            tooltip: 'Level up the enemy',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        14: {
            name: 'They just keep running into it',
            done() { return hasUpgrade('xp', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.xp.color); },
            tooltip: 'Passively slay monsters',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        15: {
            name: 'Sliced slimes',
            done() { return player.xp.kills.gte(250); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.xp.color); },
            tooltip: 'Kill 250 slimes',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        21: {
            name: 'Sticky sword',
            done() { return getBuyableAmount('lo', 11).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.lo.color); },
            tooltip: 'Buy a sword',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return player.lo.shown; },
        },
        22: {
            name: 'Better than a coin flip',
            done() { return Object.values(tmp.lo.items).some(v => typeof v == 'object' && v.chance.gte(.5)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.lo.color); },
            tooltip: 'Get an item\'s chance above 50%',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return player.lo.shown; },
        },
        23: {
            name: 'Many bags',
            done() { return buyableEffect('lo', 12).xp_keep.gte(9); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.lo.color); },
            tooltip: 'Keep all your XP upgrades',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return player.lo.shown; },
        },
        24: {
            name: 'All the time',
            done() { return Object.values(tmp.lo.items).some(v => typeof v == 'object' && v.chance.gte(1)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.lo.color); },
            tooltip: 'Get an item\'s chance above 100%',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return player.lo.shown; },
        },
        25: {
            name: 'Sword Trap duplicate',
            done() { return buyableEffect('lo', 13).gte(.25); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.lo.color); },
            tooltip: 'Get Slime spike\'s effect to at least 25%',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return player.lo.shown; },
        },
        31: {
            name: 'Level up',
            done() { return player.l.best.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.l.color); },
            tooltip: 'Get a level',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return player.l.unlocked; },
        },
        32: {
            name: 'Big damage',
            done() { return tmp.l.skills.attack.effect.gte(1.5); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.l.color); },
            tooltip: 'Deal at least 50% more damage through your attack skill',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return player.l.unlocked; },
        },
        33: {
            name: 'Half price level',
            done() { return tmp.l.skills.learning.effect.l_div.gte(2); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.l.color); },
            tooltip: 'Get skilled enough to halve your level cost',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return player.l.unlocked; },
        },
        34: {
            name: 'Faster skills',
            done() { return tmp.l.skills.running.effect.gte(5); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.l.color); },
            tooltip: 'Multiply skilling speed by at least 5',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return player.l.unlocked; },
        },
        35: {
            name: 'More skill points',
            done() { return hasMilestone('l', 3); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, layers.l.color); },
            tooltip: 'Get your levels to boost your skill point amount',
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return player.l.unlocked; },
        },
        //#endregion
        //#region Secret achievements
        //#endregion
    },
    type: 'none',
    position: 1,
    tooltip() {
        let lines = [
            `<span style="white-space: nowrap">${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements</span>`
        ];

        if (layers.ach.ownedAchievements('secret').gte(1)) {
            lines.push(`${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`);
        }

        return lines.join('<br />')
    },
    getAchievementsRows(type = 'normal') {
        let rows = [];

        switch (type) {
            case 'normal':
            default:
                rows = [1, 2, 3, 4];
                break;
            case 'secret':
                rows = [];
                break;
        }

        return rows;
    },
    getAchievements(type = 'normal') {
        let rows = layers.ach.getAchievementsRows(type);

        if (!rows.length) return [];

        let achievements = Object.keys(layers.ach.achievements).filter(id => {
            if (isNaN(id)) return false;

            if (!(tmp.ach.achievements[id].unlocked ?? true)) return false;

            return rows.some(r => RegExp(`^${r}\\d$`).test(id));
        });

        return achievements;
    },
    totalAchievements(type = 'normal') {
        return new Decimal(this.getAchievements(type).length);
    },
    ownedAchievements(type = 'normal') {
        return new Decimal(this.getAchievements(type).filter(id => hasAchievement('ach', id)).length);
    },
    achievementPopups: false,
});
