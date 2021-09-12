addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            unlockedUpgrades: [11],
        };
    },
    color: '#7FBF7F',
    row: 0,
    resource: 'experience',
    hotkeys: [
        {
            key: 'ArrowLeft',
            description: '←: Move to previous tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + tabs.length - 1) % tabs.length];
            },
        },
        {
            key: 'ArrowRight',
            description: '→: Move to next tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + 1) % tabs.length];
            },
        },
        {
            key: 'x',
            description: 'X: Reset for experience points',
            unlocked() {
                return player.xp.unlocked;
            },
            onPress() {
                if (player.xp.unlocked) doReset('xp');
            },
        },
        {
            key: 'X',
            description: 'Shift + X: Display experience points layer',
            unlocked() {
                return player.xp.unlocked;
            },
            onPress() {
                if (player.xp.unlocked) showTab('xp');
            },
        },
    ],
    tabFormat: {
        'Upgrades': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'upgrades',
            ],
            shouldNotify() {
                return canAffordLayerUpgrade('xp');
            },
        },
        'Skills': {
            content: [
                'main-display',
                'prestige-button',
                ['display-text', function() { return `You have ${formatWhole(layerBuyableAmount('xp').floor())}/${formatWhole(tmp.xp.maxSkillAmount.floor())} skills` }],
                'blank',
                'buyables',
            ],
            shouldNotify() {
                return canAffordLayerBuyable('xp');
            },
            glowColor: '#ffff00',
            unlocked() {
                return hasUpgrade('xp', 33);
            },
        },
    },
    upgrades: {
        11: {
            title: 'Play',
            description: 'Start generating points',
            cost() {
                if (player.xp.unlockedUpgrades.some(id => id != 11))
                    return new Decimal(0);

                return new Decimal(1);
            },
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                player.xp.unlockedUpgrades.push(12, 13);
            },
        },
        12: {
            title: 'Bonus score',
            description() {
                if (!shiftDown) {
                    return 'Points boost point gain';
                }
                let formula = 'log8(points + 1) + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.points.add(1).log(8).add(1);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(1),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('xp', 13))
                    player.xp.unlockedUpgrades.push(21, 22, 23);
            },
        },
        13: {
            title: 'Score bonus',
            description() {
                if (!shiftDown) {
                    return 'Points boost XP gain';
                }
                let formula = '8√points + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.points.root(8).add(1);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(4),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('xp', 12))
                    player.xp.unlockedUpgrades.push(21, 22, 23);
            },
        },
        21: {
            title: 'Backtracking',
            description() {
                if (!shiftDown) {
                    return 'XP boosts points gain'
                }
                let formula = 'log4(XP + 1.25) + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.xp.points.add(1.25).log(4).add(1);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(10),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('xp', 21) && hasUpgrade('xp', 22))
                    player.xp.unlockedUpgrades.push(31, 32, 33);
            },
        },
        22: {
            title: 'Self-learning',
            description() {
                if (!shiftDown) {
                    return 'XP boosts XP gain';
                }
                let formula = '4√XP + 1.1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.xp.points.root(4).add(1.1);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(15),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('xp', 21) && hasUpgrade('xp', 23))
                    player.xp.unlockedUpgrades.push(31, 32, 33);
            },
        },
        23: {
            title: 'Good memory',
            description() {
                if (!shiftDown) {
                    return 'XP upgrades boost point gain';
                }
                let exp = new Decimal(1);

                if (hasUpgrade('xp', 32)) exp = exp.times(1.25);

                let formula = 'upgrades';

                if (exp.neq(1)) formula += `^${format(exp)}`;

                return `Formula: ${formula}`;
            },
            effect() {
                let exp = new Decimal(1);

                if (hasUpgrade('xp', 32)) exp = exp.times(1.25);

                return new Decimal(player.xp.upgrades.length).pow(exp);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(40),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('xp', 21) && hasUpgrade('xp', 22))
                    player.xp.unlockedUpgrades.push(31, 32, 33);
            },
        },
        31: {
            title: 'Imagination',
            description() {
                if (!shiftDown) {
                    return 'XP upgrades boost XP gain';
                }
                let exp = new Decimal(.5);

                if (hasUpgrade('xp', 32)) exp = exp.times(1.25);

                let formula = `upgrades^${format(exp)}`;

                return `Formula: ${formula}`;
            },
            effect() {
                let exp = new Decimal(.5);

                if (hasUpgrade('xp', 32)) exp = exp.times(1.25);

                return new Decimal(player.xp.upgrades.length).pow(exp);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(200),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
        },
        32: {
            title: 'Mnemonic',
            description: 'Multiply Good Memory and Imagination exponents by 1.25',
            effect() {
                return new Decimal(1.25);
            },
            cost: new Decimal(1000),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
        },
        33: {
            title: 'XP condensing',
            description() {
                let desc = [];
                /*
                if (!player.l.unlocked) {
                    desc.push('Unlock levels');
                }
                */
                if (!player.xp.skills) {
                    desc.push('Unlock skills');
                }
                desc.push('Keep this upgrade');

                return desc.join('<br>');
            },
            cost: new Decimal(4000),
            unlocked() {
                return player.xp.unlockedUpgrades.includes(+this.id);
            },
        },
    },
    buyables: {
        respecText: 'Forget your abilities',
        respec() {
            let buyables = tmp.xp.buyables;

            for (let id in buyables) {
                setBuyableAmount('xp', id, new Decimal(0));
            }
        },
        11: {
            title() {
                return `Memory Lvl.${formatWhole(getBuyableAmount('xp', this.id))}`;
            },
            cost(x) {
                return new Decimal(100).pow(x.add(1));
            },
            effect() {
                return new Decimal(2).pow(getBuyableAmount('xp', 11));
            },
            display() {
                if (!shiftDown) {
                    return `Your memory multiples XP gain by ${format(buyableEffect('xp', this.id))}<br /><br />
                    Cost: ${format(tmp.xp.buyables[this.id].cost)} XP`;
                }
                let formulas = {
                    cost: '100^(x+1)',
                    effect: '2^x',
                };

                return `Effect formula: ${formulas.effect}<br />
                Cost formula: ${formulas.cost}`;
            },
            unlocked() {
                return hasUpgrade('xp', 33);
            },
            canAfford() {
                if (layerBuyableAmount('xp').gte(tmp.xp.maxSkillAmount)) return false;
                if (tmp.xp.buyables[this.id].cost.gt(player.xp.points)) return false;
                return true;
            },
            buy() {
                player.xp.points = player.xp.points.minus(tmp.xp.buyables[this.id].cost);
                setBuyableAmount('xp', this.id, getBuyableAmount('xp', this.id).add(1));
            },
            buyMax() {
                let cur = getBuyableAmount('xp', this.id);
                if (this.cost(cur).gt(player.xp.points)) return;

                let max = tmp.xp.maxSkillAmount.minus(layerBuyableAmount('xp')).add(cur);

                while (this.cost(max).gt(player.xp.points)) {
                    max = max.div(10);
                }

                for (let i = 0; i < 3; i++) {
                    let incr = 1 / (10**i);
                    let j = incr;
                    while (this.cost(max.add(max.times(j))).gt(player.xp.points)) {
                        j += incr;
                    }
                    max = max.add(max.times(j));
                }

                // Cheaper that way, but less at once
                player.xp.points = player.xp.points.minus(this.cost(max));
            },
        },
        12: {
            title() {
                return `Score multiplier Lvl. ${formatWhole(getBuyableAmount('xp', this.id))}`;
            },
            cost(x) {
                return new Decimal(90).add(x.times(10)).pow(x.add(1));
            },
            effect() {
                return new Decimal(4).pow(getBuyableAmount('xp', this.id));
            },
            display() {
                if (!shiftDown) {
                    return `Your score multiplier multiples point gain by ${format(buyableEffect('xp', this.id))}<br /><br />
                    Cost: ${format(tmp.xp.buyables[this.id].cost)} XP`;
                }
                let formulas = {
                    cost: '(90 + 10 * x)^(x + 1)',
                    effect: '4^x',
                };

                return `Effect formula: ${formulas.effect}<br />
                Cost formula: ${formulas.cost}`;
            },
            unlocked() {
                return hasUpgrade('xp', 33);
            },
            canAfford() {
                if (layerBuyableAmount('xp').gte(tmp.xp.maxSkillAmount)) return false;
                if (tmp.xp.buyables[this.id].cost.gt(player.xp.points)) return false;
                return true;
            },
            buy() {
                player.xp.points = player.xp.points.minus(tmp.xp.buyables[this.id].cost);
                setBuyableAmount('xp', this.id, getBuyableAmount('xp', this.id).add(1));
            },
            buyMax() {
                let cur = getBuyableAmount('xp', this.id);
                if (this.cost(cur).gt(player.xp.points)) return;

                let max = tmp.xp.maxSkillAmount.minus(layerBuyableAmount('xp')).add(cur);

                while (this.cost(max).gt(player.xp.points)) {
                    max = max.div(10);
                }

                for (let i = 0; i < 3; i++) {
                    let incr = 1 / (10**i);
                    let j = incr;
                    while (this.cost(max.add(max.times(j))).gt(player.xp.points)) {
                        j += incr;
                    }
                    max = max.add(max.times(j));
                }

                // Cheaper that way, but less at once
                player.xp.points = player.xp.points.minus(this.cost(max));
            },
        },
        13: {
            title() {
                return `Multitask Lvl. ${formatWhole(getBuyableAmount('xp', this.id))}`;
            },
            cost(x) {
                return new Decimal(50).pow(x.add(1)).times(x);
            },
            effect() {
                return {
                    xp: new Decimal(1.5).pow(getBuyableAmount('xp', this.id)),
                    points: new Decimal(3.5).pow(getBuyableAmount('xp', this.id)),
                };
            },
            display() {
                if (!shiftDown) {
                    return `Your multitasking multiplies XP gain by ${format(buyableEffect('xp', this.id).xp)},<br />
                    and your point gain by ${format(buyableEffect('xp', this.id).points)}<br /><br />
                    Cost: ${format(tmp.xp.buyables[this.id].cost)} XP`;
                }
                let formulas = {
                    cost: '(50^(x + 1)) * x',
                    effect: {
                        xp: '1.5^x',
                        points: '3.5^x',
                    },
                };

                return `XP effect formula: ${formulas.effect.xp}<br />
                Points effect formula: ${formulas.effect.points}<br />
                Cost formula: ${formulas.cost}`;
            },
            unlocked() {
                return hasUpgrade('xp', 33);
            },
            canAfford() {
                if (layerBuyableAmount('xp').gte(tmp.xp.maxSkillAmount)) return false;
                if (tmp.xp.buyables[this.id].cost.gt(player.xp.points)) return false;
                return true;
            },
            buy() {
                player.xp.points = player.xp.points.minus(tmp.xp.buyables[this.id].cost);
                setBuyableAmount('xp', this.id, getBuyableAmount('xp', this.id).add(1));
            },
            buyMax() {
                let cur = getBuyableAmount('xp', this.id);
                if (this.cost(cur).gt(player.xp.points)) return;

                let max = tmp.xp.maxSkillAmount.minus(layerBuyableAmount('xp')).add(cur);

                while (this.cost(max).gt(player.xp.points)) {
                    max = max.div(10);
                }

                for (let i = 0; i < 3; i++) {
                    let incr = 1 / (10**i);
                    let j = incr;
                    while (this.cost(max.add(max.times(j))).gt(player.xp.points)) {
                        j += incr;
                    }
                    max = max.add(max.times(j));
                }

                // Cheaper that way, but less at once
                player.xp.points = player.xp.points.minus(this.cost(max));
            },
        },
    },
    type: 'normal',
    baseResource: 'points',
    baseAmount() {
        return player.points;
    },
    requires: new Decimal(10),
    exponent: new Decimal(.5),
    gainMult() {
        let mult = new Decimal(1);

        // XP layer
        if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13));
        if (hasUpgrade('xp', 22)) mult = mult.times(upgradeEffect('xp', 22));
        if (hasUpgrade('xp', 31)) mult = mult.times(upgradeEffect('xp', 31));
        mult = mult.times(buyableEffect('xp', 11));
        mult = mult.times(buyableEffect('xp', 13).xp);

        return mult;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keptUps = [];

        if (hasUpgrade('xp', 33)) keptUps.push(33);

        let keep = ['unlockedUpgrades', 'skills'];

        layerDataReset(this.layer, keep);

        for (let id of keptUps) {
            if (!hasUpgrade('xp', id)) player.xp.upgrades.push(id);
        }
    },
    maxSkillAmount() {
        let base = new Decimal(1);

        return base;
    },
});
