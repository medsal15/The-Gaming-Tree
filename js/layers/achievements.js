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
                ['achievements', [1]],
            ],
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`],
                'blank',
                ['achievements', []],
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
    getAchievements(type = 'normal') {
        let rows = [];

        switch (type) {
            case 'normal':
            default:
                rows = [1];
                break;
            case 'secret':
                rows = [];
                break;
        }

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
