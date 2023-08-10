'use strict';

//todo c achievements
//todo p achievements
addLayer('suc', {
    name: 'Successes',
    image: `./resources/images/cracked-disc.svg`,
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    /** @returns {Player['suc']} */
    startData() {
        return {
            unlocked: true,
            short_mode: false,
        };
    },
    color: '#0000FF',
    row: 'side',
    resource: 'successes',
    type: 'none',
    position: 0.5,
    layerShown() { return hasUpgrade('a', 14); },
    tabFormat: {
        'Successes': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.suc.ownedSuccesses())} / ${formatWhole(layers.suc.totalSuccesses())} successes`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['suc', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.suc.getSuccessesRows()],
            ],
        },
        'Bonus': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.suc.ownedSuccesses('bonus'))} / ${formatWhole(layers.suc.totalSuccesses('bonus'))} bonus successes`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['suc', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.suc.getSuccessesRows('bonus')],
            ],
            unlocked() { return layers.suc.totalSuccesses('bonus').gte(1); },
            buttonStyle: {
                'border-color': 'rgb(255,127,0)',
            },
            name: 'Bonus Successes',
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.suc.ownedSuccesses('secret'))} secret successes`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['suc', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.suc.getSuccessesRows('secret')],
            ],
            unlocked() {
                return layers.suc.ownedSuccesses('secret').gte(1);
            },
            buttonStyle: {
                'border-color': 'rgb(127,255,0)',
            },
            name: 'Secret Successes',
        },
    },
    achievements: {
        //#region Normal Successes
        21: {
            name: 'New friend',
            tooltip: 'Tame an innocent slime',
            done() { return player.xp_alt.monsters.slime.tamed.gte(1); },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Success Completed!", 3, tmp.xp_alt.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp_alt.color;
                return s;
            },
        },
        22: {
            name: 'You monster',
            tooltip: 'Kill a friendly slime',
            done() { return player.xp_alt.unlocked && player.xp.enemies.slime.kills.gte(1); },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Success Completed!", 3, tmp.xp_alt.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp_alt.color;
                return s;
            },
        },
        23: {
            name: 'Passive friendship',
            tooltip: 'Passively tame slimes',
            done() { return hasUpgrade('xp_alt', 22); },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Success Completed!", 3, tmp.xp_alt.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp_alt.color;
                return s;
            },
        },
        24: {
            name: 'Snack time',
            tooltip: 'Buy all 3 snack upgrades',
            done() { return [11, 21, 31].every(id => hasUpgrade('xp_alt', id)); },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Success Completed!", 3, tmp.xp_alt.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp_alt.color;
                return s;
            },
        },
        25: {
            name: 'Newer friend',
            tooltip: 'Tame a goblin',
            done() { return D.gt(player.xp_alt.monsters.goblin.tamed, 0); },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Success Completed!", 3, tmp.xp_alt.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp_alt.color;
                return s;
            },
        },
        //#endregion Normal Successes
        //#region Bonus Successes
        11: {
            name: 'Hello World',
            tooltip: 'Awaken the other side',
            done() { return hasUpgrade('a', 14); },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Success Completed!", 3, 'rgb(255,127,0)'); },
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
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Success Completed!", 3, 'rgb(255,127,0)'); },
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

                return 'Unseal Bingo';
            },
            done() { return false; },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Success Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        14: {
            name: '???',
            tooltip() {
                if (!hasChallenge('b', 31)) return 'Unseal ???';

                return 'Unseal ???';
            },
            done() { return false; },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Success Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        15: {
            name: '???',
            tooltip() {
                if (!hasChallenge('b', 31)) return 'Unseal ???';

                return 'Unseal ???';
            },
            done() { return false; },
            onComplete() { if (tmp.suc.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Success Completed!", 3, 'rgb(255,127,0)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(255,127,0)';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        //#endregion Bonus Successes
        //#region Secret Successes
        //#endregion Secret Successes
    },
    tooltip() {
        if (player.suc.short_mode) {
            let pieces = [
                layerColor('suc', `${formatWhole(layers.suc.ownedSuccesses())} / ${formatWhole(layers.suc.totalSuccesses())}`),
            ];
            if (tmp.suc.tabFormat['Bonus'].unlocked) {
                const color = tmp.suc.tabFormat['Bonus'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px";>${formatWhole(layers.suc.ownedSuccesses('bonus'))} / ${formatWhole(layers.suc.totalSuccesses('bonus'))}</span>`);
            }
            if (layers.suc.ownedSuccesses('secret').gte(1)) {
                const color = tmp.suc.tabFormat['Secrets'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(layers.suc.ownedSuccesses('secret'))}</span>`);
            }
            return pieces.join(' | ');
        } else {
            let lines = [
                `<span style="white-space: nowrap">${formatWhole(layers.suc.ownedSuccesses())} / ${formatWhole(layers.suc.totalSuccesses())} successes</span>`
            ];

            if (tmp.suc.tabFormat['Bonus'].unlocked) {
                lines.push(`<span style="white-space: nowrap">${formatWhole(layers.suc.ownedSuccesses('bonus'))} / ${formatWhole(layers.suc.totalSuccesses('bonus'))} bonus successes</span>`)
            }
            if (layers.suc.ownedSuccesses('secret').gte(1)) {
                lines.push(`${formatWhole(layers.suc.ownedSuccesses('secret'))} secrets`);
            }

            return lines.join('<br />');
        }
    },
    /** @param {AchievementTypes} [type] */
    getSuccessesRows(type = 'normal') {
        let rows = [];

        switch (type) {
            case 'normal':
            default:
                rows = [2];
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
    getSuccesses(type = 'normal') {
        let rows = layers.suc.getSuccessesRows(type);

        if (!rows.length) return [];

        return Object.keys(layers.suc.achievements).filter(id => {
            if (isNaN(id)) return false;

            if (!(tmp.suc.achievements[id].unlocked ?? true)) return false;

            return rows.some(r => RegExp(`^${r}\\d$`).test(id));
        });
    },
    /** @param {AchievementTypes} [type] */
    totalSuccesses(type = 'normal') { return D(this.getSuccesses(type).length); },
    /** @param {AchievementTypes} [type] */
    ownedSuccesses(type = 'normal') { return D(this.getSuccesses(type).filter(id => hasAchievement('suc', id)).length); },
    achievementPopups: false,
});
