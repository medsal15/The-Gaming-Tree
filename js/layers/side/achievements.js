'use strict';

addLayer('ach', {
    name: 'Achievements',
    symbol: '⭐',
    startData() {
        return {
            unlocked: true,
            short_mode: false,
        };
    },
    color: '#ffff00',
    row: 'side',
    resource: 'achievements',
    tabFormat: {
        'Achievements': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['ach', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows()],
            ],
        },
        'Bonus': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('bonus'))} / ${formatWhole(layers.ach.totalAchievements('bonus'))} bonus achievements`],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows('bonus')],
            ],
            unlocked() {
                return layers.ach.totalAchievements('bonus').gte(1);
            },
            buttonStyle: {
                'border-color': 'rgb(0,127,255)',
            },
            name: 'Bonus Achievements',
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secret achievements`],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows('secret')],
            ],
            unlocked() {
                return layers.ach.ownedAchievements('secret').gte(1);
            },
            buttonStyle: {
                'border-color': 'rgb(127,0,255)',
            },
            name: 'Secret Achievements',
        },
    },
    achievements: {
        //#region Normal achievements
        11: {
            name: 'Murderer',
            tooltip: 'Kill an innocent slime',
            done() { return player.xp.kills.slime.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        12: {
            name: 'Tougher enemies',
            tooltip: 'Get your slimes to level 1',
            done() { return layers.xp.enemy.level('slime').gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        13: {
            name: 'Passive damage',
            tooltip: 'Build a sword trap',
            done() { return hasUpgrade('xp', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        14: {
            name: 'Reapply',
            tooltip: 'Reapply your first 3 upgrades\' effects',
            done() { return hasUpgrade('xp', 32); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        15: {
            name: 'A quarter of a thousand',
            tooltip: 'Kill 250 innocent slimes',
            done() { return layers.xp.enemy.level('slime').gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.xp.color;
                return s;
            },
        },
        31: {
            name: 'Level up!',
            tooltip: 'Gain a level',
            done() { return player.l.points.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        32: {
            name: 'Trained attack',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.attacking.unlocked ? 'attacking' : '???'}`; },
            done() { return player.l.skills.attacking.level.gte(10); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        33: {
            name: 'Learned to learn',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.learning.unlocked ? 'learning' : '???'}`; },
            done() { return player.l.skills.learning.level.gte(10); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        34: {
            name: 'Advanced reading techniques',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.reading.unlocked ? 'reading' : '???'}`; },
            done() { return player.l.skills.reading.level.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        35: {
            name: 'Back for blood',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.vampirism.unlocked ? 'vampirism' : '???'}`; },
            done() { return player.l.skills.vampirism.level.gte(10); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        51: {
            name: 'Sweet loot',
            tooltip: 'Get an item',
            done() { return tmp.lo.items["*"].amount.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        52: {
            name: 'Slime formation',
            tooltip: 'Make a book of slimes',
            done() { return getBuyableAmount('lo', 11).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        53: {
            name: 'Keep killing',
            tooltip: 'Keep your sword trap',
            done() { return hasUpgrade('xp', 22) && buyableEffect('lo', 12).xp_hold.gte(player.xp.upgrades.indexOf(22) + 1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        54: {
            name: 'Another trap',
            tooltip: 'Make a sticky trap',
            done() { return getBuyableAmount('lo', 13).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        55: {
            name: 'Full passive',
            tooltip: 'Keep all experience upgrades',
            done() { return buyableEffect('lo', 12).xp_hold.gte(9); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, layers.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = layers.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        //#endregion Normal achievements
        //#region Bonus achievements
        //#endregion Bonus achievements
        //#region Secret achievements
        21: {
            name: 'Straight to the end',
            tooltip: 'Get only the last experience upgrade',
            done() { return player.xp.upgrades.length == 1 && hasUpgrade('xp', 33); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        41: {
            name: 'Skill issue',
            tooltip: 'Get 5 levels without any skill',
            done() { return player.l.points.gte(5) && Object.values(player.l.skills).every(skill => skill.level.lte(0)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        61: {
            name: 'Pure luck',
            tooltip: 'Get all drops from an enemy at once without any chance boost',
            done() {
                if (tmp.lo.items["*"].global_chance_multiplier.neq(1)) return false;

                if (player.xp.last_drops.slime.length == 3) return true;

                return false;
            },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        //#endregion Secret achievements
    },
    type: 'none',
    position: 1,
    tooltip() {
        if (player.ach.short_mode) {
            let pieces = [
                layerColor('ach', `${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())}`),
            ];
            if (tmp.ach.tabFormat['Bonus'].unlocked) {
                const color = tmp.ach.tabFormat['Bonus'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px";>${formatWhole(layers.ach.ownedAchievements('bonus'))} / ${formatWhole(layers.ach.totalAchievements('bonus'))}</span>`);
            }
            if (layers.ach.ownedAchievements('secret').gte(1)) {
                const color = tmp.ach.tabFormat['Secrets'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(layers.ach.ownedAchievements('secret'))}</span>`);
            }
            return pieces.join(' | ');
        } else {
            let lines = [
                `<span style="white-space: nowrap">${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements</span>`
            ];

            if (tmp.ach.tabFormat['Bonus'].unlocked) {
                lines.push(`<span style="white-space: nowrap">${formatWhole(layers.ach.ownedAchievements('bonus'))} / ${formatWhole(layers.ach.totalAchievements('bonus'))} bonus achievements</span>`)
            }
            if (layers.ach.ownedAchievements('secret').gte(1)) {
                lines.push(`${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`);
            }

            return lines.join('<br />');
        }
    },
    /** @param {AchievementTypes} [type] */
    getAchievementsRows(type = 'normal') {
        let rows = [];

        switch (type) {
            case 'normal':
            default:
                rows = [1, 3, 5];
                break;
            case 'bonus':
                rows = [];
                break;
            case 'secret':
                rows = [2, 4, 6];
                break;
        }

        return rows;
    },
    /** @param {AchievementTypes} [type] */
    getAchievements(type = 'normal') {
        let rows = layers.ach.getAchievementsRows(type);

        if (!rows.length) return [];

        return Object.keys(layers.ach.achievements).filter(id => {
            if (isNaN(id)) return false;

            if (!(tmp.ach.achievements[id].unlocked ?? true)) return false;

            return rows.some(r => RegExp(`^${r}\\d$`).test(id));
        });
    },
    /** @param {AchievementTypes} [type] */
    totalAchievements(type = 'normal') { return D(this.getAchievements(type).length); },
    /** @param {AchievementTypes} [type] */
    ownedAchievements(type = 'normal') { return D(this.getAchievements(type).filter(id => hasAchievement('ach', id)).length); },
    achievementPopups: false,
});
