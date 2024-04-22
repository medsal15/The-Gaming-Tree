'use strict';

addLayer('bl', {
    name: 'Blessing',
    symbol: 'BL',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            failed: [],
        };
    },
    color: '#55AAAA',
    row: 2,
    position: 0.5,
    resource: 'blessings',
    tooltip() { return `${formatWhole(player.bl.achievements.length)} blessings`; },
    layerShown() { return player[this.layer].unlocked; },
    hotkeys: [
        {
            key: 'b',
            description: 'B: Display blessing layer',
            unlocked() { return player.bl.unlocked; },
            onPress() { showTab('bl'); },
        }
    ],
    tabFormat: {
        'Blessings': {
            content: [
                ['display-text', () => `You have ${layerColor('bl', format(player.bl.achievements.length), 'font-size:1.5em;')} blessings`],
                'blank',
                ['clickable', 'respec'],
                'blank',
                ['achievements', [1, 2, 3]],
                'blank',
                ['achievements', [4, 5]],
            ],
        },
        //todo bonus blessings
        //todo artifacts blessings
    },
    clickables: {
        'respec': {
            title: 'Respec your layers',
            display: `Unfail your blessings, but reset lower layers`,
            onClick() {
                if (!confirm('Are you sure you want to respec your layers?')) return;

                player.bl.failed.length = 0;
                doReset('bl', true);
            },
            canClick() { return player.bl.failed.length > 0; },
        },
    },
    achievements: {
        //#region Normal Blessings
        // XP blessings
        11: {
            name: 'Blessing of slimes',
            tooltip: `Tame a hundred slimes and nothing else<br>\
                Reward: Double experience gain`,
            onComplete() { doPopup("challenge", tmp[this.layer].achievements[this.id].name, "Blessing Received!", 3, tmp[this.layer].color); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.xp_alt.monsters.slime.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && D.gte(player.xp_alt.monsters.slime.tamed, 100); },
            fail() { return D.gt(tmp.xp_alt.total.tamed, player.xp_alt.monsters.slime.tamed); },
            effect() { return D.dTwo; },
        },
        12: {
            name: 'Goblin prayer',
            tooltip: `Tame 50 goblins and nothing else<br>\
                Reward: Double monster item production`,
            onComplete() { doPopup("challenge", tmp[this.layer].achievements[this.id].name, "Blessing Received!", 3, tmp[this.layer].color); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.xp_alt.monsters.goblin.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && D.gte(player.xp_alt.monsters.goblin.tamed, 50); },
            fail() { return D.gt(tmp.xp_alt.total.tamed, player.xp_alt.monsters.goblin.tamed); },
            effect() { return D.dTwo; },
        },
        13: {
            name: 'Revived blessing',
            tooltip: () => `Tame 25 zombies and nothing else<br>\
                Reward: Unlock ents,\
                zombies are tamed by ${layerColor('xp_alt', tmp.xp_alt.upgrades[22].title)},\
                and ${layerColor('k', tmp.k.dishes.monster_meal.name)} multiplies passive taming`,
            onComplete() { doPopup("challenge", tmp[this.layer].achievements[this.id].name, "Blessing Received!", 3, tmp[this.layer].color); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.xp_alt.monsters.zombie.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && D.gte(player.xp_alt.monsters.zombie.tamed, 25); },
            fail() { return D.gt(tmp.xp_alt.total.tamed, player.xp_alt.monsters.zombie.tamed); },
        },
        14: {
            name: 'Forest blessing',
            tooltip: `Tame 25 ents and nothing else<br>\
                Reward: Double taming progress gain and halve taming difficulty`,
            onComplete() { doPopup("challenge", tmp[this.layer].achievements[this.id].name, "Blessing Received!", 3, tmp[this.layer].color); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.xp_alt.monsters.ent.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && D.gte(player.xp_alt.monsters.ent.tamed, 25); },
            fail() { return D.gt(tmp.xp_alt.total.tamed, player.xp_alt.monsters.ent.tamed); },
            effect() { return D.dTwo; },
        },
        15: {
            name: 'Blessing of friendship',
            tooltip: `Tame a total of 250 monsters<br>\
                Reward: Autobuy XP upgrades`,
            onComplete() { doPopup("challenge", tmp[this.layer].achievements[this.id].name, "Blessing Received!", 3, tmp[this.layer].color); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.xp_alt.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && D.gte(tmp.xp_alt.total.tamed, 250); },
            fail() { return false; },
            effect() { return D.dTwo; },
        },
        // City blessings
        21: {
            name: 'Artificial blessing',
            tooltip: `Fill a full 7x7 floor<br>\
                Reward: Unlock a new set of research upgrades,\
                unlock all city upgrades`,
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.c.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) &&
                    player.c.floors.some(floor => {
                        for (let col = 1; col < 8; col++) {
                            for (let row = 1; row < 8; row++) {
                                const id = row * 100 + col;
                                if (!(id in floor) || floor[id].building == '') return false;
                            }
                        }
                    });
            },
            fail() { return false; },
        },
        22: {
            name: 'Scientific blessing',
            tooltip() {
                return `Reach ${formatWhole(1e5)} science<br>\
                    Reward: Science gain is multiplied by 2`;
            },
            effect() { return D.dTwo; },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.c.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && player.c.resources.science.amount.gte(1e5); },
            fail() { return false; },
        },
        23: {
            name: 'Floor blessing',
            tooltip: `Fill a 7x7 floor with the same building<br>\
                Reward: Multiply energy gain by 4`,
            effect() { return D(4); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.c.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) &&
                    player.c.floors.some(floor => {
                        for (let col = 1; col < 8; col++) {
                            /** @type {false|string} */
                            let type = false;
                            for (let row = 1; row < 8; row++) {
                                const id = row * 100 + col;
                                if (!(id in floor) || floor[id].building == '') return false;
                                if (type === false) type = floor[id].building;
                                else if (type != floor[id].building) return false;
                            }
                        }
                    });
            },
            fail() { return false; },
        },
        24: {
            name: 'Height blessing',
            tooltip: `Get 4 floors but build only on the first one<br>\
                Reward: Tower base is 10`,
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.c.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) &&
                    tmp.c.floors.max >= 3;
            },
            fail() {
                return player.c.floors.some((floor, i) => {
                    if (i == 0) return false;
                    return Object.keys(floor).some(id => floor[+id].building != '');
                });
            },
        },
        // Plant blessings
        31: {
            name: 'Seedless blessing',
            tooltip: `Get 1 seed of every plant type\
                without having more than 5 seeds of any of them in stock<br>\
                Reward: Automatically replant mature and wilting plants on harvest or death`,
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.p.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) &&
                    Object.keys(player.p.plants).every(plant => plant == '*' || player.p.plants[plant].seeds.gte(1));
            },
            fail() { return Object.values(player.p.plants).some(data => data.seeds.gt(5)); },
        },
        32: {
            name: 'Field blessing',
            tooltip: `Fill your 6x6 field with the same plant<br>\
                Reward: Automatically harvest mature plants`,
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.p.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                if (player.bl.failed.includes(+this.id)) return false;

                const grid = player.p.grid;

                for (let col = 1; col < 7; col++) {
                    /** @type {false|plants} */
                    let type = false;
                    for (let row = 1; row < 7; row++) {
                        const id = row * 100 + col;
                        if (!(id in grid) || grid[id].plant == '') return false;
                        if (type === false) type = grid[id].plant;
                        else if (type != grid[id].plant) return false;
                    }
                }
            },
            fail() { return false; },
        },
        33: {
            name: 'Weird blessing',
            tooltip: `Plant 3 of every strange plants<br>\
                Reward: Plant tooltips now display age`,
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.p.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                if (player.bl.failed.includes(+this.id)) return false;

                const grid = player.p.grid,
                    counts = {
                        'copper_wheat': D.dZero,
                        'candy_corn': D.dZero,
                        'clockberry': D.dZero,
                        'starflower': D.dZero,
                        'potato_battery': D.dZero,
                        'egg_plant': D.dZero,
                    };

                for (let col = 1; col < 7; col++) {
                    for (let row = 1; row < 7; row++) {
                        const id = row * 100 + col;
                        if (!(id in grid) || grid[id].plant == '') return false;
                        const plant = grid[id].plant;
                        if (plant in counts) counts[plant] = D.add(counts[plant], 1);
                    }
                }

                return Object.values(counts).every(count => D.gte(count, 3));
            },
            fail() { return false; },
        },
        // Tower blessings
        41: {
            name: 'Overshoot blessing',
            tooltip: `Get 3 times the amount of materials need for a floor<br>\
                Reward: Divide material costs by 3`,
            effect() { return D(3); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.to.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) && layerBuyableAmount('to').gte(D.times(tmp.to.getNextAt, 3));
            },
            fail() { return false; },
        },
        42: {
            name: 'Height blessing',
            tooltip: `Get 3 floors without having more than 5 additionnal materials needed<br>\
                Reward: Lower floor exponent by .1`,
            effect() { return D(.1); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.to.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && player.to.points.gte(3); },
            fail() { return layerBuyableAmount('to').gte(D.add(tmp.to.getNextAt, 5)); },
        },
        43: {
            name: 'Material blessing',
            tooltip: `Get 100 floor materials<br>\
                Reward: Auto buy floor materials and they only consume half their cost`,
            effect() { return D(.5); },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.to.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() { return !player.bl.failed.includes(+this.id) && layerBuyableAmount('to').gte(100); },
            fail() { return false; },
        },
        // Kitchen blessings
        51: {
            name: 'Blessed stomach',
            tooltip: `Cook only a single dish 20 times<br>\
                Reward: +1 stomach size`,
            effect() { return D.dOne; },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.k.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) && Object.keys(player.k.dishes)
                    .filter(/**@param {dishes}dish*/dish => dish != 'failure')
                    .some(/**@param {dishes}dish*/dish => player.k.dishes[dish].amount.gte(20));
            },
            fail() {
                return Object.keys(player.k.dishes)
                    .filter(/**@param {dishes}dish*/dish => dish != 'failure' && player.k.dishes[dish].amount.gt(0))
                    .length > 1;
            },
        },
        52: {
            name: 'Blessed oven',
            tooltip: `Cook 5 dishes at once<br>\
                Reward: +1 oven size`,
            effect() { return D.dOne; },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.k.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) && Object.values(player.k.recipes)
                    .filter(recipe => D.gt(recipe.amount_cooking, 0)).length >= 5;
            },
            fail() { return false; },
        },
        53: {
            name: 'Ranch blessing',
            tooltip: `Cook 5 cakes<br>\
                Reward: The ranch's key, next to your plants`,
            onComplete() { player.r.unlocked = true; },
            style() {
                if (hasAchievement(this.layer, this.id)) {
                    return { 'background-color': tmp.k.color };
                }
                if (player.bl.failed.includes(+this.id)) {
                    return { 'background-color': '#AA5555' };
                }
            },
            done() {
                return !player.bl.failed.includes(+this.id) && player.k.dishes.cake.amount.gte(5);
            },
            fail() { return false; },
        },
        //todo ??? blessing
        //todo freezer blessings
        //todo vending blessings
        //todo star blessing
    },
    //#endregion Normal Blessings
    //#region Bonus Blessings
    //#endregion Bonus Blessings
    //#region Artifact Blessings
    //#endregion Artifact Blessings
    automate() {
        Object.keys(tmp.bl.achievements)
            .filter(n => !isNaN(n) && !hasAchievement('bl', n))
            .forEach(id => {
                if (tmp.bl.achievements[id].fail && !player.bl.failed.includes(+id)) player.bl.failed.push(+id);
            });
    },
    achievementPopups: false,
    type: 'static',
    baseAmount() { return D.dZero; },
    requires() { return D.dOne; },
    branches() {
        if (inChallenge('b', 31)) return ['xp_alt'];
        return ['to'];
    },
    doReset(layer) { },
});
