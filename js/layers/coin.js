addLayer('c', {
    name: 'Coins',
    symbol: 'C',
    startData() {
        return {
            points: new Decimal(0),
            unlockedUpgrades: [11],
            unlocked: false,
            has_reset: false,
            coins: {
                'chocolate': new Decimal(0),
                'copper': new Decimal(0),
            },
        };
    },
    layerShown() {
        return tmp.xp.upgrades[33].unlocked;
    },
    tooltipLocked() {
        return `You need ${layerColor('xp', tmp.xp.upgrades[33].title)} to use this layer`;
    },
    tooltip() {
        const lines = [`<span style="white-space: nowrap;">${format(player.c.points)} ${tmp.c.resource}</span>`];

        if (hasUpgrade('c', 23) || player.c.coins.chocolate.gt(0)) lines.push(`<span style="white-space: nowrap; color: brown;">${format(player.c.coins.chocolate)} chocolate coins</span>`);
        if (hasUpgrade('c', 43) || player.c.coins.copper.gt(0)) lines.push(`<span style="white-space: nowrap; color: orange;">${format(player.c.coins.copper)} copper coins</span>`);

        return lines.join('<br>');
    },
    effect() {
        let xp_boost = new Decimal(1.1).pow(player.c.points.add(1).log10());

        return {xp_boost};
    },
    effectDescription() {
        const effect = tmp.c.effect;

        return `boosting XP gain by *${format(effect.xp_boost)}`;
    },
    color: '#FFBF00',
    row: 1,
    resource: 'coins',
    hotkeys: [
        {
            key: 'c',
            description: 'C: Reset for levels',
            unlocked() {
                return tmp.c.layerShown;
            },
            onPress() {
                if (tmp.c.layerShown) doReset('c');
            },
        },
        {
            key: 'C',
            description: 'Shift + C: Display levels layer',
            unlocked() {
                return tmp.c.layerShown;
            },
            onPress() {
                if (tmp.c.layerShown) showTab('c');
            },
        },
    ],
    tabFormat: {
        'Upgrades': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                ['upgrades', [1,2,3]],
            ],
            shouldNotify() {
                return canAffordLayerUpgrade('c', [1,2,3]);
            },
        },
        'Coins': {
            content: [
                'main-display',
                ['display-text', function() {
                    /**
                     * @type {{
                     *  chocolate: Decimal,
                     *  copper: Decimal,
                     * }}
                     */
                    const coins = player.c.coins;
                    const lines = [`You have <span style="color: brown">${format(coins.chocolate, 0)}</span> chocolate coins (+${format(tmp.c.chocolate_coin_gain)}/s)`];

                    if ((coins.copper ??= new Decimal).gt(0) || hasUpgrade('c', 43)) {
                        lines.push(`You have <span style="color: orange">${format(coins.copper, 0)}</span> copper coins (+${format(tmp.c.copper_coin_gain)}/s)`);
                    }

                    return lines.join('<br>');
                }],
                'blank',
                'prestige-button',
                'blank',
                ['upgrades', [4, 5, 6]],
            ],
            shouldNotify() { return canAffordLayerUpgrade('c', [4, 5, 6]); },
            unlocked() { return hasUpgrade('c', 23) || player.c.coins.chocolate.gt(0); },
        },
    },
    upgrades: {
        //#region Coin upgrades
        11: {
            title: 'Money game',
            description: 'Double Coin Gain',
            cost: new Decimal(5),
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
            title: 'Paid XP boost',
            description() {
                if (!shiftDown) {
                    return 'Coins boost XP and coin gain';
                }

                let formula = 'log10(C + 10)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(25),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 13)) player[this.layer].unlockedUpgrades.push(21, 22, 23); },
            effect() {
                let base = player.c.points;

                base = base.add(10);
                base = base.log(10);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        13: {
            title: 'Premium coin boost',
            description() {
                if (!shiftDown) {
                    return 'Coins boost point gain';
                }

                let formula = '10√C + 1';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(250),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 13)) player[this.layer].unlockedUpgrades.push(21, 22, 23); },
            effect() {
                let base = player.c.points;

                base = base.root(10);
                base = base.add(1);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        21: {
            title: 'Brand new level formula',
            description() {
                if (!shiftDown) {
                    return 'Coins reduce level costs';
                }

                let formula = 'log20(C + 1)';

                if (hasUpgrade('c', 31)) formula = 'log10(C + 1)'

                return `Formula: ${formula}`;
            },
            cost: new Decimal(5_000),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            effect() {
                let base = player.c.points;

                base = base.add(1);

                if (hasUpgrade('c', 31)) base = base.log(10);
                else base = base.log(20);

                return base;
            },
            effectDisplay() {
                return `/${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        22: {
            title: 'XP safe',
            description: 'Keep XP upgrades on row 2 resets',
            cost: new Decimal(25_000),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
        },
        23: {
            title: 'Actual coins',
            description: 'Start getting real coins and unlock a new tab',
            cost: new Decimal(250_000),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() {
                player[this.layer].unlockedUpgrades.push(41);
            },
        },
        31: {
            title: 'Improved brand new level formula',
            description() {
                if (!shiftDown) {
                    let name = tmp.c.upgrades[21].title;

                    if (hasUpgrade(this.layer, this.id)) name = layerColor('c', name);

                    return `Improve ${name} formula<br>Square root level scaling`;
                }

                let changes = 'log20 => log10';

                return `Changes: ${changes}`;
            },
            cost: new Decimal(5_000_000),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            effect() {
                let base = new Decimal(2);

                return base;
            },
            effectDisplay() {
                return `${format(tmp[this.layer].upgrades[this.id].effect)}√`;
            },
        },
        32: {
            title: 'Real gold coin upgrade',
            description() {
                if (!shiftDown) {
                    return `Coins boost special coins gains`;
                }

                let formula = 'log10(C + 10) / (coin tier + 1)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(500_000_000),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            effect() {
                let base = player.c.points;

                base = base.add(10);
                base = base.log(10);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
        },
        33: {
            title: 'Greed consumes',
            description() {
                if (!shiftDown) {
                    const lines = [`Coins boost special coins consumption`];

                    if (true) {
                        lines.push('Unlock 1.5 new layers');
                    }

                    return lines.join('<br>');
                }

                let formula = 'log10(C + 10) / 100';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(2.5e11),
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            /*
            onPurchase() {
                player.lb.unlocked = true;
                if (hasUpgrade('l', 33)) player.m.unlocked = true;
            },
            */
            effect() {
                let base = player.c.points;

                base = base.add(10);
                base = base.log(10);
                base = base.div(100);

                return base;
            },
            effectDisplay() {
                return `+${format(tmp[this.layer].upgrades[this.id].effect.times(100), 0)}%`;
            },
        },
        //todo row 3
        //#endregion Coin upgrades
        //#region Special coins upgrades
        41: {
            title: 'Molten chocolate',
            description() {
                if (!shiftDown) {
                    return 'Every second, unwrap 1% of your coins and get them as chocolate coins';
                }

                let gain_formula = 'log10(coins / 100)';

                return `Gain formula: ${gain_formula}`;
            },
            cost: new Decimal(0),
            currencyDisplayName: 'chocolate coins',
            currencyInternalName: 'chocolate',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = new Decimal(.01);

                if (hasUpgrade('c', 33)) base = base.add(upgradeEffect('c', 33));

                return base;
            },
            effectDisplay() {
                const percent = tmp[this.layer].upgrades[this.id].effect;
                const gain = tmp.c.chocolate_coin_gain;

                return `-${format(percent.times(100), 0)}% coins/s, +${format(gain)} chocolate coins/s`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { player[this.layer].unlockedUpgrades.push(42, 43); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'brown';

                return style;
            },
        },
        42: {
            title: 'Sweet motivation',
            description() {
                if (!shiftDown) {
                    return 'Chocolate coins boost XP gain';
                }

                let formula = 'log10(Chocolate coins + 10)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(250),
            currencyDisplayName: 'chocolate coins',
            currencyInternalName: 'chocolate',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = player.c.coins.chocolate;

                base = base.add(10);
                base = base.log(10);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 43)) player[this.layer].unlockedUpgrades.push(51, 52, 53); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'brown';

                return style;
            },
        },
        43: {
            title: 'Sweet convertion',
            description() {
                if (!shiftDown) {
                    return 'Every second, sell 1% of your chocolate coins for some copper coins';
                }

                let gain_formula = 'chocolate coins / 10,000';

                return `Gain formula: ${gain_formula}`;
            },
            cost: new Decimal(2_500),
            currencyDisplayName: 'chocolate coins',
            currencyInternalName: 'chocolate',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = new Decimal(.01);

                if (hasUpgrade('c', 33)) base = base.add(upgradeEffect('c', 33));

                return base;
            },
            effectDisplay() {
                const percent = tmp[this.layer].upgrades[this.id].effect;
                const gain = tmp.c.copper_coin_gain;

                return `-${format(percent.times(100), 0)}% chocolate coins/s, +${format(gain)} copper coins/s`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 43)) player[this.layer].unlockedUpgrades.push(51, 52, 53); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'brown';

                return style;
            },
        },
        51: {
            title: 'Expensive coins',
            description() {
                if (!shiftDown) {
                    return 'Copper coins boost coin gain';
                }

                let formula = 'log10(copper coins + 10)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(1),
            currencyDisplayName: 'copper coins',
            currencyInternalName: 'copper',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = player.c.coins.copper;

                base = base.add(10);
                base = base.log(10);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 52) && hasUpgrade(this.layer, 53)) player[this.layer].unlockedUpgrades.push(61, 62, 63); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'orange';

                return style;
            },
        },
        52: {
            title: 'Repurchased chocolate',
            description() {
                if (!shiftDown) {
                    return 'Copper coins boost chocolate coin gain';
                }

                let formula = '10√(copper coins) + 1';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(5),
            currencyDisplayName: 'copper coins',
            currencyInternalName: 'copper',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = player.c.coins.copper;

                base = base.root(10);
                base = base.add(1);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 51) && hasUpgrade(this.layer, 53)) player[this.layer].unlockedUpgrades.push(61, 62, 63); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'orange';

                return style;
            },
        },
        53: {
            title: 'Investments',
            description: 'Passively gain 1% of coins on reset per coin unlocked<br>limited to 100% of gain on reset',
            cost: new Decimal(15),
            currencyDisplayName: 'copper coins',
            currencyInternalName: 'copper',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = 0;

                if (hasUpgrade('c', 41) || player.c.coins.chocolate.gt(0)) base += .01;
                if (hasUpgrade('c', 43) || player.c.copper.chocolate.gt(0)) base += .01;

                return base;
            },
            effectDisplay() {
                return `${format(tmp[this.layer].upgrades[this.id].effect * 100)}%`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 51) && hasUpgrade(this.layer, 52)) player[this.layer].unlockedUpgrades.push(61, 62, 63); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'orange';

                return style;
            },
        },
        61: {
            title: 'Copper-plated levels',
            description() {
                if (!shiftDown) {
                    return 'Copper coins reduce levels costs';
                }

                let formula = '2√(copper coins) + 1';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(50),
            currencyDisplayName: 'copper coins',
            currencyInternalName: 'copper',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = player.c.coins.copper;

                base = base.root(2);
                base = base.add(1);

                return base;
            },
            effectDisplay() {
                return `/${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 62) && hasUpgrade(this.layer, 63)) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'orange';

                return style;
            },
        },
        62: {
            title: 'Copper-wrapped chocolate coins',
            description() {
                if (!shiftDown) {
                    return 'Copper coins boost copper coins gain';
                }

                let formula = 'log4(copper coins + 4)';

                return `Formula: ${formula}`;
            },
            cost: new Decimal(100),
            currencyDisplayName: 'copper coins',
            currencyInternalName: 'copper',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = player.c.coins.copper;

                base = base.add(4);
                base = base.log(4);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 62) && hasUpgrade(this.layer, 63)) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'orange';

                return style;
            },
        },
        63: {
            title: 'Improved convertion efficiencies',
            description: 'Convertions only consume half as much',
            cost: new Decimal(500),
            currencyDisplayName: 'copper coins',
            currencyInternalName: 'copper',
            currencyLocation() { return player.c.coins; },
            effect() {
                let base = new Decimal(.5);

                return base;
            },
            effectDisplay() {
                return `*${format(tmp[this.layer].upgrades[this.id].effect)}`;
            },
            unlocked() { return player[this.layer].unlockedUpgrades.includes(+this.id); },
            onPurchase() { if (hasUpgrade(this.layer, 62) && hasUpgrade(this.layer, 63)) player[this.layer].unlockedUpgrades.push(31, 32, 33); },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = 'orange';

                return style;
            },
        },
        //#endregion Special coins upgrades
    },
    update(diff) {
        /**
         * @type {{
         *  chocolate: Decimal,
         *  copper: Decimal,
         * }}
         */
        const coins = player.c.coins;

        /** @type {Decimal} */
        let gain;
        if ((gain = tmp.c.chocolate_coin_gain).gt(0)) {
            const converted = upgradeEffect('c', 41);
            let loss = player.c.points.times(converted);

            if (hasUpgrade('c', 63)) loss = loss.times(upgradeEffect('c', 63))

            player.c.points = player.c.points.minus(loss.times(diff));
            coins.chocolate = coins.chocolate.add(gain.times(diff));
        }

        if ((gain = tmp.c.copper_coin_gain).gt(0)) {
            // Copper loss is included in chocolate gain
            coins.copper = coins.copper.add(gain.times(diff));
        }
    },
    chocolate_coin_gain() {
        if (!hasUpgrade('c', 41)) return Decimal.dZero;

        const converted = upgradeEffect('c', 41);
        let gain = player.c.points.times(converted).log(10);

        if (tmp.c.copper_coin_gain.gt(0)) {
            const copper_converted = upgradeEffect('c', 43);
            let loss = gain.times(copper_converted);

            if (hasUpgrade('c', 63)) loss = loss.times(upgradeEffect('c', 63));

            gain = gain.minus(loss);
        }

        // C
        if (hasUpgrade('c', 32)) gain = gain.times(upgradeEffect('c', 32).div(2));

        // Copper coins
        if (hasUpgrade('c', 52)) gain = gain.times(upgradeEffect('c', 52));

        return gain.max(0);
    },
    copper_coin_gain() {
        if (!hasUpgrade('c', 43)) return Decimal.dZero;

        const converted = upgradeEffect('c', 43);
        let gain = player.c.coins.chocolate.times(converted).div(100);

        // C
        if (hasUpgrade('c', 32)) gain = gain.times(upgradeEffect('c', 32).div(3));

        // Copper coins
        if (hasUpgrade('c', 62)) gain = gain.times(upgradeEffect('c', 62));

        return gain.max(0);
    },
    type: 'normal',
    baseResource: 'points',
    baseAmount() {
        return player.points;
    },
    requires: new Decimal(100_000),
    exponent: new Decimal(2/3),
    gainMult() {
        let mult = new Decimal(1);

        // C layer
        if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11));
        if (hasUpgrade('c', 12)) mult = mult.times(upgradeEffect('c', 12));
        if (hasUpgrade('c', 51)) mult = mult.times(upgradeEffect('c', 51));

        // L layer
        if (hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 21));

        return mult;
    },
    branches: ['xp'],
    passiveGeneration() {
        let base = 0;

        if (hasUpgrade('c', 53)) base += upgradeEffect('c', 53);
        if (player.c.points.gte(tmp.c.resetGain)) base = 0;

        return base;
    },
    doReset(layer) {
        if (layer == this.layer) {
            player[this.layer].has_reset = true;
            if (!player.l.has_reset) player.l.unlocked = false;
        }

        if (layers[layer].row <= this.row) return;

        let keep = ['unlockedUpgrades'];

        layerDataReset(this.layer, keep);
    },
    canReset() {
        return (hasUpgrade('xp', 33) || player.c.has_reset) && player.points.gte(tmp.c.requires);
    },
});
