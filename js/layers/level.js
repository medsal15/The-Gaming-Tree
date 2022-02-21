addLayer('l', {
    name: 'Levels',
    symbol: 'L',
    startData() {
        return {
            points: new Decimal(0),
            unlockedUpgrades: [11],
            unlocked: false,
            has_reset: false,
        };
    },
    layerShown() {
        return tmp.xp.upgrades[33].unlocked;
    },
    tooltipLocked() {
        return `You need ${layerColor('xp', tmp.xp.upgrades[33].title)} to use this layer`;
    },
    color: '#5CE1E6',
    row: 1,
    effect() {
        let up_boost = new Decimal(1);
        let xp_nerf = new Decimal(.99);

        up_boost = up_boost.add(new Decimal(.1).times(player.l.points));
        xp_nerf = xp_nerf.pow(player.l.points);

        if (hasUpgrade('l', 31)) {
            const {boost, nerf} = upgradeEffect('l', 31);
            up_boost = up_boost.times(boost);
            xp_nerf = xp_nerf.pow(nerf);
        }
        if (hasUpgrade('l', 32)) {
            const boost = upgradeEffect('l', 32);
            xp_nerf = xp_nerf.div(boost);
        }

        xp_nerf = xp_nerf.min(1);
        up_boost = up_boost.max(1);

        return {up_boost, xp_nerf};
    },
    effectDescription() {
        return `boosting XP upgrades effects by *${format(tmp.l.effect.up_boost)}, but reducing XP gain by *${format(tmp.l.effect.xp_nerf)}`;
    },
    resource: 'levels',
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
            title: 'Level up bonus boost',
            description: 'Double XP gain',
            cost: new Decimal(1),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { player[this.layer].unlockedUpgrades.push(12, 13); },
            effect() {
                let base = new Decimal(2);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        12: {
            title: 'Level to point converter',
            description() {
                if (!shiftDown) {
                    return 'Levels boost points and reduce levels scaling';
                }

                let point_formula = 'log2(L + 2)';
                let level_formula = 'log2(L + 2)'

                return `Point boost formula: ${point_formula}<br>Level boost formula: ${level_formula}`;
            },
            cost: new Decimal(3),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 13)) player[this.layer].unlockedUpgrades.push(21, 22, 23); },
            effect() {
                let base = player.l.points;

                base = base.add(2);
                base = base.log(2);

                const point_boost = base;
                const level_div = base;

                return {point_boost, level_div};
            },
            effectDisplay() {
                const effect = tmp[this.layer].upgrades[this.id].effect;

                return `*${format(effect.point_boost)}, ${format(effect.level_div)}√`;
            },
        },
        13: {
            title: 'Level-up XP bonus',
            description() {
                if (!shiftDown) {
                    return 'Levels boost XP';
                }

                let formula = '2√L + 1';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(6),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 13)) player[this.layer].unlockedUpgrades.push(21, 22, 23); },
            effect() {
                let base = player.l.points;

                base = base.root(2);
                base = base.add(1);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        21: {
            title: 'Bonus coin drops',
            description() {
                if (!shiftDown) {
                    return 'Levels boost Coin';
                }

                let formula = 'log4(L + 1)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(8),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 22)) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
            effect() {
                let base = player.l.points;

                base = base.add(1);
                base = base.log(4);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        22: {
            title: 'Level-up bonus potion',
            description: 'Divides level cost by 10<br>Multiplies XP gain by 2',
            cost: new Decimal(10),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 23)) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
            effect() {
                let level_div = new Decimal(10);
                let xp_mult = new Decimal(2);

                return {level_div, xp_mult};
            },
            effectDisplay() {
                const effect = tmp[this.layer].upgrades[this.id].effect;

                return `/${format(effect.level_div)}, *${format(effect.xp_mult)}`;
            },
        },
        23: {
            title: 'Leveling self-synergy',
            description() {
                if (!shiftDown) {
                    return 'Levels divide their own cost';
                }

                let formula = 'L + 1';

                if (hasUpgrade('l', 33)) formula = '(L + 1) ^ 2';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(12),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 23)) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
            effect() {
                let base = player.l.points;

                base = base.add(1);

                if (hasUpgrade('l', 33)) base = base.pow(2);

                return base;
            },
            effectDisplay() {
                return `/${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        31: {
            title: 'Level effect booster',
            description: 'Double positive level effect, but square negative level effect',
            cost: new Decimal(20),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            effect() {
                let boost = new Decimal(2);
                let nerf = new Decimal(2);

                return {boost, nerf};
            },
            effectDisplay() {
                const effect = tmp[this.layer].upgrades[this.id].effect;

                return `*${format(effect.boost)}, ^${format(effect.nerf)}`;
            },
        },
        32: {
            title: 'Level effect anti nerfer',
            description() {
                if (!shiftDown) {
                    return 'Levels reduce the level effect nerf';
                }

                let formula = '(L + 1) / (L + 11)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(25),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            effect() {
                let base = player.l.points;

                base = base.add(1).div(base.add(11));

                return base;
            },
            effectDisplay() {
                return `/${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        33: {
            title: 'Redivide',
            description() {
                let name = 'Leveling self-synergy';

                if (hasUpgrade(this.layer, this.id)) name = layerColor('l', name);

                const lines = [`Squares ${name} effect`];

                if (true) {
                    lines.push('Unlock 1.5 new layers');
                }

                return lines.join('<br>');
            },
            cost: new Decimal(27),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            /*
            onPurchase() {
                player.p.unlocked = true;
                if (hasUpgrade('c', 33)) player.m.unlocked = true;
            },
            */
            effect() {
                let base = new Decimal(2);

                return base;
            },
            effectDisplay() {
                return `^${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
    },
    milestones: {
        1: {
            requirementDescription: '5 total levels',
            effectDescription: 'Passively gain 1% of XP gain',
            done() { return player.l.total.gte(5); },
        },
        2: {
            requirementDescription: '10 total levels',
            effectDescription: 'You can buy max levels',
            done() { return player.l.total.gte(10); },
        },
        3: {
            requirementDescription: '25 total levels',
            effectDescription: 'Passively gain 9% more XP',
            done() { return player.l.total.gte(25); },
        },
        4: {
            requirementDescription: '50 total levels',
            effectDescription: 'Automatically gain levels and levels reset nothing',
            done() { return player.l.total.gte(50); },
        },
    },
    type: 'static',
    baseResource: 'experience',
    baseAmount() { return player.xp.points; },
    requires() {
        let base = new Decimal(25_000);

        return base;
    },
    gainMult() {
        let div = new Decimal(1);

        // L layer
        if (hasUpgrade('l', 22)) div = div.div(upgradeEffect('l', 22).level_div);
        if (hasUpgrade('l', 23)) div = div.div(upgradeEffect('l', 23));

        // C layer
        if (hasUpgrade('c', 21)) div = div.div(upgradeEffect('c', 21));
        if (hasUpgrade('c', 61)) div = div.div(upgradeEffect('c', 61));

        return div;
    },
    directMult() {
        let mult = new Decimal(1);

        return mult;
    },
    gainExp() {
        let root = new Decimal(1);

        // L layer
        if (hasUpgrade('l', 12)) root = root.times(upgradeEffect('l', 12).level_div);

        // C layer
        if (hasUpgrade('c', 31)) root = root.times(upgradeEffect('c', 31));

        return root;
    },
    doReset(layer) {
        if (layer == this.layer) {
            player[this.layer].has_reset = true;
            if (!player.c.has_reset) player.c.unlocked = false;
        }

        if (layers[layer].row <= this.row) return;

        let keep = ['unlockedUpgrades'];

        layerDataReset(this.layer, keep);
    },
    canReset() {
        let next = tmp.l.base.pow(player.l.points.pow(tmp.l.exponent)).root(tmp.l.gainExp).times(tmp.l.requires).times(tmp.l.gainMult);

        return (hasUpgrade('xp', 33) || player.l.has_reset) && player.xp.points.gte(next);
    },
    canBuyMax() { return hasMilestone('l', 2); },
    autoPrestige() { return hasMilestone('l', 4); },
    resetsNothing() { return hasMilestone('l', 4); },
    exponent: new Decimal(2),
    base: new Decimal(2),
    roundUpCost: true,
    branches: ['xp'],
});
