addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            unlockedUpgrades: [11],
            keep_all_ups: false,
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
    },
    upgrades: {
        11: {
            title: 'New game',
            description: 'Begin generating points',
            cost() {
                let cost = new Decimal(1);

                // Allows point generation no matter how strong the nerf is
                cost = cost.times(tmp[this.layer].gainMult.min(1)).floor();

                return cost;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { player[this.layer].unlockedUpgrades.push(12, 13); },
            effect() {
                let base = new Decimal(1);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `+${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        12: {
            title: 'Bonus score',
            description() {
                if (!shiftDown) {
                    return 'Points multiply point gain';
                } else {
                    let formula = 'log3(points + 3)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let base = player.points;

                base = base.add(3).log(3);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(5),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 13)) player[this.layer].unlockedUpgrades.push(21, 22, 23); },
        },
        13: {
            title: 'XP score',
            description() {
                if (!shiftDown) {
                    return 'Points multiply XP gain';
                } else {
                    let formula = 'log9(points + 9)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let base = player.points;

                base = base.add(9).log(9);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(15),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 13)) player[this.layer].unlockedUpgrades.push(21, 22, 23); },
        },
        21: {
            title: 'Bestiary',
            description() {
                if (!shiftDown) {
                    return 'XP multiplies point gain';
                } else {
                    let formula = '3√XP + 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let base = player.xp.points;

                base = base.root(3).add(1);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(50),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if ([22, 23].every(id => hasUpgrade(this.layer, id))) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
        },
        22: {
            title: 'Score X2',
            description() {
                if ((tmp.l.effect.up_boost || new Decimal(1)).eq(1)) {
                    return 'Doubles point gain';
                } else {
                    return 'Multiplies point gain';
                }
            },
            effect() {
                let base = new Decimal(2);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(250),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if ([21, 23].every(id => hasUpgrade(this.layer, id))) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
        },
        23: {
            title: 'Improved learning capacity',
            description() {
                if (!shiftDown) {
                    return 'XP multiplies XP gain';
                } else {
                    let formula = '9√XP + 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let base = player.xp.points;

                base = base.root(9).add(1);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(500),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if ([21, 22].every(id => hasUpgrade(this.layer, id))) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
        },
        31: {
            title: 'Score grinding knowledge',
            description() {
                if (!shiftDown) {
                    return 'XP upgrades multiply point gain';
                } else {
                    let formula = '[XP upgrades]';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let base = new Decimal(player.xp.upgrades.length);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(2_500),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
        },
        32: {
            title: 'XP rate tools',
            description() {
                if (!shiftDown) {
                    return 'XP upgrades multiply XP gain';
                } else {
                    let formula = '2√[XP upgrades]';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let base = new Decimal(player.xp.upgrades.length);

                base = base.root(2);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(7_500),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
        },
        33: {
            title: 'XP X2',
            description() {
                const lines = [];
                if ((tmp.l.effect.up_boost || new Decimal(1)).eq(1)) {
                    lines.push('Doubles XP gain');
                } else {
                    lines.push('Multiples XP gain');
                }

                if (!player.l.unlocked || !player.c.unlocked) {
                    lines.push('Unlock 2 new layers')
                }

                return lines.join('<br>');
            },
            effect() {
                let base = new Decimal(2);

                base = base.times(tmp.l.effect.up_boost || new Decimal(1));

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            cost: new Decimal(25_000),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { player.l.unlocked = player.c.unlocked = true; },
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
        if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23));
        if (hasUpgrade('xp', 32)) mult = mult.times(upgradeEffect('xp', 32));

        // L layer
        mult = mult.times(tmp.l.effect.xp_nerf);
        if (hasUpgrade('l', 11)) mult = mult.times(upgradeEffect('l', 11));
        if (hasUpgrade('l', 13)) mult = mult.times(upgradeEffect('l', 13));
        if (hasUpgrade('l', 22)) mult = mult.times(upgradeEffect('l', 22).xp_mult);

        // C layer
        mult = mult.times(tmp.c.effect.xp_boost);
        if (hasUpgrade('c', 42)) mult = mult.times(upgradeEffect('c', 42));

        return mult;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = ['unlockedUpgrades'];

        if (layers[layer].row <= 2) keep.push('upgrades');

        layerDataReset(this.layer, keep);
    },
    passiveGeneration() {
        let base = 0;

        if (hasMilestone('l', 1)) base += .01;
        if (hasMilestone('l', 3)) base += .09;

        return base;
    },
});
