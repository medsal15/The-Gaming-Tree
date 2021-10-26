addLayer('l', {
    name: 'Levels',
    symbol: 'L',
    startData() {
        return {
            points: new Decimal(0),
            unlockedUpgrades: [11],
            unlocked: false,
        };
    },
    layerShown() {
        return hasUpgrade('xp', 33);
    },
    color: '#5CE1E6',
    row: 1,
    effect() {
        let base = player.l.points;

        if (hasMilestone('l', 2)) base = player.l.best;
        if (hasUpgrade('l', 32)) base = player.l.total;

        return base;
    },
    effectDescription() {
        return `which increase your maximum skill count by ${format(tmp.l.effect)}`;
    },
    resource: 'level',
    hotkeys: [
        {
            key: 'l',
            description: 'L: Reset for levels',
            unlocked() {
                return player.l.unlocked;
            },
            onPress() {
                if (player.l.unlocked) doReset('l');
            },
        },
        {
            key: 'L',
            description: 'Shift + L: Display levels layer',
            unlocked() {
                return player.l.unlocked;
            },
            onPress() {
                if (player.l.unlocked) showTab('l');
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
        'Milestones': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'milestones',
            ],
        },
    },
    upgrades: {
        11: {
            title: 'Base stats boost',
            description() {
                if (!shiftDown) {
                    return 'Levels boost XP gain';
                }
                let formula = '√L + 2';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.l.points.root(2).add(2);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(1),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                player[this.layer].unlockedUpgrades.push(12, 13);
            },
        },
        12: {
            title: 'Level-up bonus',
            description() {
                if (!shiftDown) {
                    return 'Levels boost point gain';
                }
                let formula = 'log2(L + 1) + 1.25';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.l.points.add(1).log(2).add(1.25);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(2),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade(this.layer, 13))
                    player[this.layer].unlockedUpgrades.push(21, 22, 23);
            },
        },
        13: {
            title: 'Scale reducing abilities',
            description: 'Unlock a new skill to reduce level costs',
            cost: new Decimal(3),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade(this.layer, 12))
                    player[this.layer].unlockedUpgrades.push(21, 22, 23);
            },
        },
        21: {
            title: 'Level shop',
            description() {
                if (!shiftDown) {
                    return 'Levels boost coin gain';
                }
                let formula = '4√(L + 1) + .5';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.l.points.add(1).root(4).add(.5);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(5),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 23))
                    player[this.layer].unlockedUpgrades.push(31, 32, 33);
            },
        },
        22: {
            title: 'Level-up strategies',
            description() {
                if (!shiftDown) {
                    return 'Levels reduce their own cost';
                }
                let formula = '1.1^(L + 1)';

                return `Formula: ${formula}`;
            },
            effect() {
                return new Decimal(1.1).pow(player.l.points.add(1));
            },
            effectDisplay() {
                return `/${format(this.effect())}`;
            },
            cost: new Decimal(7),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 23))
                    player[this.layer].unlockedUpgrades.push(31, 32, 33);
            },
        },
        23: {
            title: 'Skill cap raise',
            description: 'Each skill can be raised an additional level regardless of skill cap',
            cost: new Decimal(9),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 22))
                    player[this.layer].unlockedUpgrades.push(31, 32, 33);
            },
        },
        31: {
            title: 'Skill upgrade',
            description() {
                if (!shiftDown) {
                    return 'Levels boost skill effects';
                }
                let formula = 'log5(L + 1) + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.l.points.add(1).log(5).add(1);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(12),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
        },
        32: {
            title: 'More max skills',
            description: 'Level effect is based on total levels',
            cost: new Decimal(30),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
        },
        33: {
            title: 'Social levels',
            description: `Unlock parties and (almost) lootboxes<br />Levels and coins don't reset anything<br />Keep this upgrade`,
            cost: new Decimal(70),
            unlocked() {
                return player[this.layer].unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                //player.p.unlocked = true;
                //if (hasUpgrade('c', 33)) player.lb.unlocked = true;
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: '1 level',
            effectDescription: 'Gain 1% of XP gain on reset',
            done() { return player.l.points.gte(1); },
        },
        1: {
            requirementDescription: '3 levels',
            effectDescription: 'You can keep XP upgrades on reset',
            done() { return player.l.points.gte(3); },
            toggles: [['xp', 'keep_all_ups']],
        },
        2: {
            requirementDescription: '5 levels',
            effectDescription: 'L effect is based on best and gain another 9% of XP gain on reset',
            done() { return player.l.points.gte(5); },
        },
        3: {
            requirementDescription: '5 levels and 1,000 coins',
            effectDescription: 'No longer forget skills on row 2 resets',
            done() { return player.l.points.gte(5) && player.c.points.gte(1e3); },
        },
        4: {
            requirementDescription: '10 levels',
            effectDescription: 'You can now get max levels on reset',
            done() { return player.l.points.gte(10); },
        },
    },
    type: 'static',
    baseResource: 'experience',
    baseAmount() { return player.xp.points; },
    requires() {
        let base = new Decimal(50_000);

        return base;
    },
    gainMult() {
        let div = new Decimal(1);

        // XP layer
        //div = div.times(buyableEffect('xp', 21));

        // C layer
        if (hasUpgrade('c', 21)) div = div.div(upgradeEffect('c', 21));

        // L layer
        if (hasUpgrade('l', 22)) div = div.div(upgradeEffect('l', 22));

        return div;
    },
    gainExp() {
        let root = new Decimal(1);

        root = root.div(buyableEffect('xp', 21));

        return root;
    },
    canBuyMax() {
        return hasMilestone('l', 4);
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keptUps = [];

        if (hasUpgrade('l', 33)) keptUps.push(33);

        let keep = ['unlockedUpgrades'];

        layerDataReset(this.layer, keep);

        for (let id of keptUps) {
            if (!hasUpgrade('l', id)) player.l.upgrades.push(id);
        }
    },
    exponent: new Decimal(2),
    base: new Decimal(2),
    roundUpCost: true,
    branches: ['xp'],
});
