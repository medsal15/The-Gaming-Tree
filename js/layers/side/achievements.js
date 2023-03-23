'use strict';

//todo add goblin achievements?
addLayer('ach', {
    name: 'Achievements',
    symbol: '⭐',
    startData() {
        return {
            unlocked: true,
            short_mode: false,
        };
    },
    color: '#FFFF00',
    row: 'side',
    resource: 'achievements',
    type: 'none',
    position: 0,
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
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['ach', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows('bonus')],
            ],
            unlocked() { return layers.ach.totalAchievements('bonus').gte(1); },
            buttonStyle: {
                'border-color': 'rgb(0,127,255)',
            },
            name: 'Bonus Achievements',
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secret achievements`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['ach', 'short_mode']]
                ]],
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
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        12: {
            name: 'Tougher enemies',
            tooltip: 'Get your slimes to level 1',
            done() { return layers.xp.enemy.level('slime').gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        13: {
            name: 'Passive damage',
            tooltip: 'Build a sword trap',
            done() { return hasUpgrade('xp', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        14: {
            name: 'Reapply',
            tooltip: 'Reapply your first 3 upgrades\' effects',
            done() { return hasUpgrade('xp', 32); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        15: {
            name: 'A quarter of a thousand',
            tooltip: 'Kill 250 innocent slimes',
            done() { return layers.xp.enemy.level('slime').gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        31: {
            name: 'Level up!',
            tooltip: 'Gain a level',
            done() { return player.l.points.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        32: {
            name: 'Trained attack',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.attacking.unlocked ? 'attacking' : '???'}`; },
            done() { return player.l.skills.attacking.level.gte(10); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        33: {
            name: 'Learned to learn',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.learning.unlocked ? 'learning' : '???'}`; },
            done() { return player.l.skills.learning.level.gte(10); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        34: {
            name: 'Back for blood',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.vampirism.unlocked ? 'vampirism' : '???'}`; },
            done() { return player.l.skills.vampirism.level.gte(10); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        35: {
            name: 'Advanced reading techniques',
            tooltip() { return `Get 10 levels of ${tmp.l.skills.reading.unlocked ? 'reading' : '???'}`; },
            done() { return player.l.skills.reading.level.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        51: {
            name: 'Sweet loot',
            tooltip: 'Get an item',
            done() { return tmp.lo.items["*"].amount.gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        52: {
            name: 'Slime formation',
            tooltip: 'Make a book of slimes',
            done() { return getBuyableAmount('lo', 11).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        53: {
            name: 'Keep killing',
            tooltip: 'Keep your sword trap',
            done() { return hasUpgrade('xp', 22) && buyableEffect('lo', 12).xp_hold.gte(player.xp.upgrades.indexOf(22) + 1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        54: {
            name: 'Another trap',
            tooltip: 'Make a sticky trap',
            done() { return getBuyableAmount('lo', 13).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        55: {
            name: 'Full passive',
            tooltip: 'Keep all experience upgrades',
            done() { return buyableEffect('lo', 12).xp_hold.gte(9); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        71: {
            name: '>:(',
            tooltip: 'Fight the first boss',
            done() { return activeChallenge('b') == 11; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        72: {
            name: 'Calm before the storm',
            tooltip: 'Defeat the Slime King',
            done() { return hasChallenge('b', 11); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        73: {
            name: 'Stonks',
            tooltip: 'Defeat ???',
            done() { return hasChallenge('b', 12); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        74: {
            name: 'Diligent',
            tooltip: 'Defeat ???',
            done() { return hasChallenge('b', 21); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        75: {
            name: 'Hungry for more',
            tooltip: 'Defeat ???',
            done() { return hasAchievement('b', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        111: {
            name: 'Rock and stone',
            tooltip: 'Mine something',
            done() { return ['stone', 'copper_ore', 'tin_ore'].some(id => player.lo.items[id].amount.gte(1)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        112: {
            name: 'Autonomous',
            tooltip: 'Get a drill',
            done() { return hasUpgrade('m', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        114: {
            name: 'Permanent mark',
            tooltip: 'Get a stone tablet',
            done() { return hasUpgrade('m', 31); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        113: {
            name: 'More stone',
            tooltip: 'Get a filter',
            done() { return hasUpgrade('m', 32); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        115: {
            name: 'Anvil',
            tooltip: 'Start crafting stone items',
            done() { return hasUpgrade('m', 33); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        121: {
            name: 'Heating up',
            tooltip: 'Get a stone furnace',
            done() { return getBuyableAmount('lo', 21).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        122: {
            name: 'The helper we never got',
            tooltip: 'Get a copper golem',
            done() { return getBuyableAmount('lo', 22).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        123: {
            name: 'A bigger can',
            tooltip: 'Get a tin chest',
            done() { return getBuyableAmount('lo', 23).gte(1); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        124: {
            name: 'Stay passive',
            tooltip: 'Get enough tin chests to keep Copper Drill',
            done() { return hasUpgrade('m', 22) && buyableEffect('lo', 23).m_hold.gt(player.m.upgrades.indexOf(22)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        125: {
            name: 'Off to never visit again',
            tooltip: 'Keep all mining upgrades',
            done() { return buyableEffect('lo', 23).m_hold.gte(9); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        //#endregion Normal achievements
        //#region Bonus achievements
        81: {
            name: 'Revenge',
            tooltip: 'Defeat the Slime Prince',
            done() { return hasChallenge('b', 31); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        82: {
            name: 'Second in power',
            tooltip: '???',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        83: {
            name: 'Amalgam',
            tooltip: '???',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        84: {
            name: '???',
            tooltip: '???',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        85: {
            name: 'Boss Star',
            tooltip: 'Beat all 4 bonus bosses',
            done() { return [31, 32, 41, 42].every(id => hasChallenge('b', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = { 'background-image': `url('./resources/images/round-star.svg')`, };
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        91: {
            name: 'In strides',
            tooltip: 'Unlock the Clock',
            done() { return hasChallenge('b', 51); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 31); },
        },
        92: {
            name: 'Roll the dice',
            tooltip: '???',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 31); },
        },
        93: {
            name: '???',
            tooltip: '???',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 31); },
        },
        94: {
            name: '???',
            tooltip: '???',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 31); },
        },
        95: {
            name: 'Relic Star',
            tooltip: 'Get all 4 relics',
            done() { return [51, 52, 61, 62].every(id => hasChallenge('b', id)); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = { 'background-image': `url('./resources/images/round-star.svg')`, };
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 31); },
        },
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

                return tmp.lo.items["*"].global_chance_multiplier.lte(1) && [['slime', 3], ['goblin', 3]].some(([type, len]) => player.xp.last_drops[type].length == len);
            },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        101: {
            name: 'You\'re done, please stop',
            tooltip: () => `Get ${format(10_000)} kills fighting the Slime King`,
            done() { return inChallenge('b', 11) && player.xp.kills.slime.gte(1e4); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        102: {
            name: 'Hardcore',
            tooltip: 'Beat the Slime Prince without any experience upgrades',
            done() { return player.xp.upgrades.length == 0 && inChallenge('b', 31) && canCompleteChallenge('b', 31); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        //#endregion Secret achievements
    },
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
                rows = [1, 3, 5, 12, 7, 11];
                break;
            case 'bonus':
                rows = [8, 9];
                break;
            case 'secret':
                rows = [2, 4, 6, 10];
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
