'use strict';

addLayer('fai', {
    name: 'Failures',
    image: `./resources/images/cracked-disc.svg`,
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    /** @returns {Player['fai']} */
    startData() {
        return {
            unlocked: true,
            short_mode: false,
        };
    },
    color: '#0000FF',
    row: 'side',
    resource: 'failures',
    type: 'none',
    position: 0.5,
    layerShown() { return hasUpgrade('a', 14); },
    tabFormat: {
        'Failures': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.fai.ownedFailures())} / ${formatWhole(layers.fai.totalFailures())} failures`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['fai', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.fai.getFailuresRows()],
            ],
        },
        'Malus': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.fai.ownedFailures('bonus'))} / ${formatWhole(layers.fai.totalFailures('bonus'))} malus failures`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['fai', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.fai.getFailuresRows('bonus')],
            ],
            unlocked() { return layers.fai.totalFailures('bonus').gte(1); },
            buttonStyle: {
                'border-color': 'rgb(255,127,0)',
            },
            name: 'Malus Failures',
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.fai.ownedFailures('secret'))} secret failures`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['fai', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.fai.getFailuresRows('secret')],
            ],
            unlocked() {
                return layers.fai.ownedFailures('secret').gte(1);
            },
            buttonStyle: {
                'border-color': 'rgb(127,255,0)',
            },
            name: 'Secret Failures',
        },
    },
    achievements: {
        //#region Normal Failures
        //#endregion Normal Failures
        //#region Malus Failures
        11: {
            name: 'Hello World',
            tooltip: 'Awaken the other side',
            done() { return hasUpgrade('a', 14); },
            onComplete() { if (tmp.fai.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Malus Failure Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        12: {
            name: 'Out of Time',
            tooltip() {
                if (!hasChallenge('b', 31)) return 'Unseal ???';

                return 'Unseal the Time Cubes';
            },
            done() { return false; },
            onComplete() { if (tmp.fai.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Malus Failure Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        13: {
            name: 'Broke',
            tooltip() {
                if (!hasChallenge('b', 32)) return 'Unseal ???';

                return 'Unseal the Stock Market';
            },
            done() { return false; },
            onComplete() { if (tmp.fai.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Malus Failure Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        14: {
            name: 'Chemistry',
            tooltip() {
                if (!hasChallenge('b', 31)) return 'Unseal ???';

                return 'Unseal the Elements';
            },
            done() { return false; },
            onComplete() { if (tmp.fai.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Malus Failure Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        15: {
            name: 'Tell a friend',
            tooltip() {
                if (!hasChallenge('b', 31)) return 'Unseal ???';

                return 'Unseal the Party';
            },
            done() { return false; },
            onComplete() { if (tmp.fai.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Malus Failure Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        //#endregion Malus Failures
        //#region Secret Failures
        //#endregion Secret Failures
    },
    tooltip() {
        if (player.fai.short_mode) {
            let pieces = [
                layerColor('fai', `${formatWhole(layers.fai.ownedFailures())} / ${formatWhole(layers.fai.totalFailures())}`),
            ];
            if (tmp.fai.tabFormat['Malus'].unlocked) {
                const color = tmp.fai.tabFormat['Malus'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px";>${formatWhole(layers.fai.ownedFailures('bonus'))} / ${formatWhole(layers.fai.totalFailures('bonus'))}</span>`);
            }
            if (layers.fai.ownedFailures('secret').gte(1)) {
                const color = tmp.fai.tabFormat['Secrets'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(layers.fai.ownedFailures('secret'))}</span>`);
            }
            return pieces.join(' | ');
        } else {
            let lines = [
                `<span style="white-space: nowrap">${formatWhole(layers.fai.ownedFailures())} / ${formatWhole(layers.fai.totalFailures())} failures</span>`
            ];

            if (tmp.fai.tabFormat['Malus'].unlocked) {
                lines.push(`<span style="white-space: nowrap">${formatWhole(layers.fai.ownedFailures('bonus'))} / ${formatWhole(layers.fai.totalFailures('bonus'))} malus failures</span>`)
            }
            if (layers.fai.ownedFailures('secret').gte(1)) {
                lines.push(`${formatWhole(layers.fai.ownedFailures('secret'))} secrets`);
            }

            return lines.join('<br />');
        }
    },
    /** @param {AchievementTypes} [type] */
    getFailuresRows(type = 'normal') {
        let rows = [];

        switch (type) {
            case 'normal':
            default:
                rows = [];
                break;
            case 'bonus':
                rows = [1];
                break;
            case 'secret':
                rows = [];
                break;
        }

        return rows;
    },
    /** @param {AchievementTypes} [type] */
    getFailures(type = 'normal') {
        let rows = layers.fai.getFailuresRows(type);

        if (!rows.length) return [];

        return Object.keys(layers.fai.achievements).filter(id => {
            if (isNaN(id)) return false;

            if (!(tmp.fai.achievements[id].unlocked ?? true)) return false;

            return rows.some(r => RegExp(`^${r}\\d$`).test(id));
        });
    },
    /** @param {AchievementTypes} [type] */
    totalFailures(type = 'normal') { return D(this.getFailures(type).length); },
    /** @param {AchievementTypes} [type] */
    ownedFailures(type = 'normal') { return D(this.getFailures(type).filter(id => hasAchievement('fai', id)).length); },
    achievementPopups: false,
});
