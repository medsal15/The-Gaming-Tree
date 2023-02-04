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
        //#endregion
        //#region Bonus achievements
        //#endregion Bonus achievements
        //#region Secret achievements
        //#endregion
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
                rows = [];
                break;
            case 'bonus':
                rows = [];
                break;
            case 'secret':
                rows = [];
                break;
        }

        return rows;
    },
    /** @param {AchievementTypes} [type] */
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
    /** @param {AchievementTypes} [type] */
    totalAchievements(type = 'normal') {
        return D(this.getAchievements(type).length);
    },
    /** @param {AchievementTypes} [type] */
    ownedAchievements(type = 'normal') {
        return D(this.getAchievements(type).filter(id => hasAchievement('ach', id)).length);
    },
    achievementPopups: false,
});
