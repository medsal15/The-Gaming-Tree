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
                ['achievements', [1, 3]],
            ],
        },
        'Secrets': {
            content: [
                ['display-text', function() { return `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`; }],
                'blank',
                ['achievements', [2, 4, 5]],
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
            name: 'Getting started',
            done() {
                return hasUpgrade('xp', 11);
            },
            tooltip: 'Buy the first XP upgrade',
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        12: {
            name: 'But wait, there\'s more!',
            done() {
                let needed = [11, 12, 13];
                for (let id of needed) {
                    if (!hasUpgrade('xp', id)) return false;
                }
                return true;
            },
            tooltip: 'Buy the first row of XP upgrades',
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        13: {
            name: '2nd line',
            done() {
                let needed = [21, 22, 23];
                for (let id of needed) {
                    if (!hasUpgrade('xp', id)) return false;
                }
                return true;
            },
            tooltip: 'Buy the second row of XP upgrades',
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        14: {
            name: '3rd line\'s the charm',
            done() {
                let needed = [31, 32, 33];
                for (let id of needed) {
                    if (!hasUpgrade('xp', id)) return false;
                }
                return true;
            },
            tooltip: 'Buy the third row of XP upgrades',
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        15: {
            name: 'Skilled',
            done() {
                return tmp.xp.currentSkillAmount.gte(1);
            },
            tooltip: 'Buy a skill',
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        31: {
            name: 'Level up',
            done() {
                return player.l.points.gte(1);
            },
            tooltip: 'Get a level',
            unlocked() {
                return hasAchievement('ach', 15);
            },
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        32: {
            name: 'A tenth',
            done() {
                return hasMilestone('l', 2) && hasMilestone('l', 0);
            },
            tooltip: 'Generate 10% of your XP on reset per second',
            unlocked() {
                return hasAchievement('ach', 15);
            },
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        33: {
            name: 'It\'s not even made of gold',
            done() {
                return player.c.points.gte(1);
            },
            tooltip: 'Get a coin',
            unlocked() {
                return hasAchievement('ach', 15);
            },
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        34: {
            name: 'Long term approach',
            done() {
                return hasUpgrade('c', 23);
            },
            tooltip: 'Unlock the bank',
            unlocked() {
                return hasAchievement('ach', 15);
            },
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        35: {
            name: 'Rich and powerful',
            done() {
                return player.c.upgrades.length + player.l.upgrades.length >= 18;
            },
            tooltip: 'Get all the L and C upgrades',
            unlocked() {
                return hasAchievement('ach', 15);
            },
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Gotten!", 3, tmp[this.layer].color)
            },
        },
        //#endregion
        //#region Secret achievements
        21: {
            name: '2 is 1',
            done() {
                let needed = [21, 22, 23];
                for (let id of needed) {
                    if (!hasUpgrade('xp', id)) return false;
                }
                let forbidden = [11, 12, 13];
                for (let id of forbidden) {
                    if (hasUpgrade('xp', id)) return false;
                }
                return true;
            },
            tooltip: 'Complete the second row of XP upgrades before any upgrade on the first row',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        22: {
            name: '3 early',
            done() {
                let needed = [31, 32, 33];
                for (let id of needed) {
                    if (!hasUpgrade('xp', id)) return false;
                }
                let forbidden = [11, 12, 13, 21, 22, 23];
                for (let id of forbidden) {
                    if (hasUpgrade('xp', id)) return false;
                }
                return true;
            },
            tooltip: 'Complete the third row of XP upgrades before any upgrade on the first or second rows',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        41: {
            name: 'No wheels',
            done() {
                if (tmp.xp.passiveGeneration == 0) return false;
                let forbidden = [11, 12, 13, 21, 22, 23, 31, 32];
                for (let id of forbidden) {
                    if (hasUpgrade('l', id)) return false;
                }
                return true;
            },
            tooltip: 'Get passive xp generation without any non permanent L upgrade',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        42: {
            name: 'Pentagram',
            done() {
                let forbidden = [11, 12, 13, 21, 22, 23, 31, 32];
                for (let id of forbidden) {
                    if (hasUpgrade('l', id)) return false;
                }
                let required = [0, 1, 2, 3, 4];
                for (let id of required) {
                    if (!hasMilestone('l', id)) return false;
                }
                return true;
            },
            tooltip: 'Get all L milestones without any non permanent L upgrade',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        45: {
            name: 'Lone stand',
            done() {
                let forbidden_coin = [11, 12, 13, 21, 22, 23, 31];
                let forbidden_level = [11, 12, 13, 21, 22, 23, 31, 32];

                if (forbidden_coin.every(id => hasUpgrade('c', id)) && forbidden_level.every(id => !hasUpgrade('l', id))) return true;
                if (forbidden_level.every(id => hasUpgrade('c', id)) && forbidden_coin.every(id => !hasUpgrade('l', id))) return true;
                return false;
            },
            tooltip: 'Get all L upgrades without any permanent C upgrade, or vice versa',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        51: {
            name: 'Higher than owned',
            done() {
                if (tmp.c.passiveGeneration != 0 && tmp.c.resetGain.times(tmp.c.passiveGeneration).gt(player.c.points)) return true;

                return false;
            },
            tooltip: 'Passively gain more coins than you own',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        52: {
            name: 'Greedy',
            done() {
                if (player.c.upgrades.length < 9) return false;
                if (Object.values(player.c.buyables).every(d => d.gt(0))) return false;
                return true;
            },
            tooltip: 'Get all C upgrades without any investment',
            unlocked() {
                return hasAchievement('ach', this.id);
            },
            style: {'background-color': '#bb77ff'},
            onComplete() {
                doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Gotten!", 3, '#bb77ff')
            },
        },
        //#endregion
    },
    type: 'none',
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
                rows = [2, 4, 5];
                break;
            case 'normal':
            default:
                rows = [1, 3];
        }

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
