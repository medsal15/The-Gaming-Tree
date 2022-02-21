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
                ['display-text', function() { return `You have ${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements`; }],
                'blank',
                ['achievements', [1, 3, 4]],
            ],
        },
        'Secrets': {
            content: [
                ['display-text', function() { return `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`; }],
                'blank',
                ['achievements', [2, 5, 6]],
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
            name: 'Start',
            tooltip: 'Start making points',
            done() { return hasUpgrade('xp', 11); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.xp.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.color;

                return style;
            },
        },
        12: {
            name: 'Experowce',
            tooltip: 'Purchase the first row of XP upgrades',
            done() { return [11, 12, 13].every(id => hasUpgrade('xp', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.xp.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.color;

                return style;
            },
        },
        13: {
            name: 'SiXP',
            tooltip: 'Purchase the first two rows of XP upgrades',
            done() { return [11, 12, 13, 21, 22, 23].every(id => hasUpgrade('xp', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.xp.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.color;

                return style;
            },
        },
        14: {
            name: 'Threexperience',
            tooltip: 'Purchase the first three rows of XP upgrades',
            done() { return [11, 12, 13, 21, 22, 23, 31, 32, 33].every(id => hasUpgrade('xp', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.xp.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.color;

                return style;
            },
        },
        15: {
            name: 'Not again',
            tooltip: 'Reset your XP layer',
            done() { return hasAchievement('ach', 11) && !hasUpgrade('xp', 11); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.xp.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.color;

                return style;
            },
        },
        31: {
            name: 'Slow gain',
            tooltip: 'Passively gain XP',
            unlocked() { return player.l.unlocked; },
            done() { return tmp.xp.passiveGeneration >= 0; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.l.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
        },
        32: {
            name: 'Double base gain',
            tooltip: 'Get base point gain to be 2',
            unlocked() { return player.l.unlocked; },
            done() { return upgradeEffect('xp', 11).gte(2); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.l.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
        },
        33: {
            name: 'Auto level up',
            tooltip: 'Automate levelling up',
            unlocked() { return player.l.unlocked; },
            done() { return tmp.l.autoPrestige; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.l.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
        },
        34: {
            name: 'Jumping levels',
            tooltip: 'Reach level 20',
            unlocked() { return player.l.unlocked; },
            done() { return player.l.best.gte(20); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.l.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
        },
        35: {
            name: 'So many levels',
            tooltip: 'Complete the first three rows of Level upgrades',
            unlocked() { return player.l.unlocked; },
            done() { return [11, 12, 13, 21, 22, 23, 31, 32, 33].every(id => hasUpgrade('l', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.l.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
        },
        41: {
            name: 'Money',
            tooltip: 'Get a few coins',
            unlocked() { return player.c.unlocked; },
            done() { return player.c.best.gte(5); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.c.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
        },
        42: {
            name: 'QoL isn\'t free you know',
            tooltip: 'Keep XP upgrades',
            unlocked() { return player.c.unlocked; },
            done() { return hasUpgrade('c', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.c.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
        },
        43: {
            name: 'What do you mean, real coins?',
            tooltip: 'Unlock real coins',
            unlocked() { return player.c.unlocked; },
            done() { return hasUpgrade('c', 23); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.c.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
        },
        44: {
            name: 'Actual money',
            tooltip: 'Unlock copper coins',
            unlocked() { return player.c.unlocked; },
            done() { return hasUpgrade('c', 43); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.c.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
        },
        45: {
            name: 'Cashed out',
            tooltip: 'Get the first six rows of Coin and special coins upgrades',
            unlocked() { return player.c.unlocked; },
            done() { return [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63].every(id => hasUpgrade('c', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp.c.color); },
            style() {
                const style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
        },
        //#endregion
        //#region Secret achievements
        21: {
            name: 'Missed the first',
            tooltip: 'Complete the second row of XP upgrades before starting the first',
            done() { return [11, 12, 13].every(id => !hasUpgrade('xp', id)) && [21, 22, 23].every(id => hasUpgrade('xp', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, 'rgb(127,0,255)'); },
            unlocked() { return hasAchievement(this.layer, this.id); },
            style: {'background-color': 'rgb(127,0,255)'},
        },
        22: {
            name: 'Downside up',
            tooltip: 'Complete the third row of XP upgrades before the starting any other',
            done() { return [11, 12, 13, 21, 22, 23].every(id => !hasUpgrade('xp', id)) && [31, 32, 33].every(id => hasUpgrade('xp', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, 'rgb(127,0,255)'); },
            unlocked() { return hasAchievement(this.layer, this.id); },
            style: {'background-color': 'rgb(127,0,255)'},
        },
        51: {
            name: 'Penniless',
            tooltip: 'Complete the third row of coin upgrades without any special coins',
            done() { return Object.values(player.c.coins).every(c => c.lte(0)) && [31, 32, 33].every(id => hasUpgrade('c', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, 'rgb(127,0,255)'); },
            unlocked() { return hasAchievement(this.layer, this.id); },
            style: {'background-color': 'rgb(127,0,255)'},
        },
        52: {
            name: 'Pay 2 Win',
            tooltip: 'Complete the six first rows of coin upgrades without any level',
            done() {
                [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63].every(id => hasUpgrade('c', id))
                    && player.l.upgrades.length == 0;
            },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, 'rgb(127,0,255)'); },
            unlocked() { return hasAchievement(this.layer, this.id); },
            style: {'background-color': 'rgb(127,0,255)'},
        },
        61: {
            name: 'Full level mileage',
            tooltip: 'Get all 4 level milestones without any level upgrades',
            done() { [1, 2, 3, 4].every(id => hasMilestone('l', id)) && player.l.upgrades == 0; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, 'rgb(127,0,255)'); },
            unlocked() { return hasAchievement(this.layer, this.id); },
            style: {'background-color': 'rgb(127,0,255)'},
        },
        62: {
            name: 'Pure grind',
            tooltip: 'Get all 4 level milestones and 9 level upgrades without any coin upgrades',
            done() {
                [1, 2, 3, 4].every(id => hasMilestone('l', id)) &&
                    [11, 12, 13, 21, 22, 23, 31, 32, 33].every(id => hasUpgrade('l', id));
            },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, 'rgb(127,0,255)'); },
            unlocked() { return hasAchievement(this.layer, this.id); },
            style: {'background-color': 'rgb(127,0,255)'},
        },
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
            case 'secret':
                rows = [2, 5, 6];
                break;
            case 'normal':
            default:
                rows = [1, 3, 4];
        }

        if (!rows.length) return [];

        let achievements = Object.keys(layers.ach.achievements).filter(id => {
            if (isNaN(id)) return false;

            if (!tmp.ach.achievements[id].unlocked) return false;

            return rows.some(r => RegExp(`^${r}.$`).test(id));
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
