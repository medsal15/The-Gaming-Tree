addLayer('c', {
    name: 'Coins',
    symbol: 'C',
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
    color: '#FFBF00',
    row: 1,
    resource: 'coin',
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
                'upgrades',
            ],
            shouldNotify() {
                return canAffordLayerUpgrade('c');
            },
        },
        'Bank': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'buyables',
            ],
            shouldNotify() {
                return canAffordLayerBuyable('c');
            },
            glowColor: '#ffff00',
            unlocked() {
                return hasUpgrade('c', 23);
            },
        },
    },
    upgrades: {
        11: {
            title: 'Pay to play',
            description() {
                if (!shiftDown) {
                    return 'Coins boost point gain';
                }
                let formula = 'log6(coins + 1) + 2';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.c.points.add(1).log(6).add(2);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(1),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                player.c.unlockedUpgrades.push(12, 13);
            },
        },
        12: {
            title: 'Pay to win',
            description() {
                if (!shiftDown) {
                    return 'Coins boost XP gain';
                }
                let formula = '6√coins + 1.25';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.c.points.root(6).add(1.25);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(2),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('c', 13))
                    player.c.unlockedUpgrades.push(21, 22, 23);
            },
        },
        13: {
            title: 'Money making techniques',
            description: 'Unlock a new skill to boost coin gain',
            cost: new Decimal(10),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('c', 12))
                    player.c.unlockedUpgrades.push(21, 22, 23);
            },
        },
        21: {
            title: 'Premium shop',
            description() {
                if (!shiftDown) {
                    return 'Coins reduce level cost';
                }
                let formula = 'log10(coins + 2) + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.c.points.add(2).log(10).add(1);
            },
            effectDisplay() {
                return `/${format(this.effect())}`;
            },
            cost: new Decimal(25),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('c', 22) && hasUpgrade('c', 23))
                    player.c.unlockedUpgrades.push(31, 32, 33);
            },
        },
        22: {
            title: 'Fake gold coins',
            description() {
                if (!shiftDown) {
                    return 'Coins boost coin gain';
                }
                let formula = '12√coins + 1.1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.c.points.root(12).add(1);
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(75),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('c', 21) && hasUpgrade('c', 23))
                    player.c.unlockedUpgrades.push(31, 32, 33);
            },
        },
        23: {
            title: 'Banking',
            description: 'Unlock investing',
            cost: new Decimal(250),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                if (hasUpgrade('c', 21) && hasUpgrade('c', 22))
                    player.c.unlockedUpgrades.push(31, 32, 33);
            },
        },
        31: {
            title: 'Skill sales',
            description() {
                if (!shiftDown) {
                    return 'Coins reduce skill costs';
                }
                let formula = '10√C+1';

                return `Formula: ${formula}`;
            },
            effect() {
                return player.c.points.root(10).add(1);
            },
            effectDisplay() {
                return `/${format(this.effect())}`;
            },
            cost: new Decimal(1e3),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
        },
        32: {
            title: 'Wallet',
            description: 'Passively gain 100% of coin gain but it caps at the amount you get on reset',
            cost: new Decimal(4e3),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
        },
        33: {
            title: 'Monster-proof safe',
            description: 'Unlock monsters and (almost) lootboxes<br />Wallet is uncapped<br />Keep Wallet and this upgrade',
            cost: new Decimal(16e3),
            unlocked() {
                return player.c.unlockedUpgrades.includes(+this.id);
            },
            onPurchase() {
                //player.m.unlocked = true;
                //if (hasUpgrade('l', 33)) player.lb.unlocked = true;
            },
        },
    },
    buyables: {
        respecText: 'Change banks',
        respec() {
            let buyables = tmp[this.layer].buyables;

            for (let id in buyables) {
                setBuyableAmount(this.layer, id, new Decimal(0));
            }
        },
        11: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} XP investment${getBuyableAmount(this.layer, this.id).gt(1)?'s':''}`;
            },
            cost(x) {
                let xp = new Decimal(100).pow(x.add(1));
                let coin = new Decimal(10).pow(x.add(1));
                return {xp, coin};
            },
            effect(x) {
                return new Decimal(1.2).pow(x);
            },
            display() {
                if (!shiftDown) {
                    return `Your XP investments multiply XP gain by ${format(buyableEffect(this.layer, this.id))}<br /><br />
                    Cost: ${format(tmp[this.layer].buyables[this.id].cost.xp)} XP<br />
                    ${format(tmp[this.layer].buyables[this.id].cost.coin)} Coins`;
                }
                let formulas = {
                    cost: {
                        xp: '100^(x+1)',
                        coin: '10^(x+1)',
                    },
                    effect: '1.2^x',
                };

                return `XP cost formula: ${formulas.cost.xp}<br />
                Coin cost formula: ${formulas.cost.coin}<br />
                Effect formula: ${formulas.effect}`;
            },
            unlocked() {
                return hasUpgrade(this.layer, 23);
            },
            canAfford() {
                if (tmp[this.layer].buyables[this.id].cost.coin.gt(player.c.points)) return false;
                if (tmp[this.layer].buyables[this.id].cost.xp.gt(player.xp.points)) return false;
                return true;
            },
            buy() {
                player.xp.points = player.xp.points.minus(tmp[this.layer].buyables[this.id].cost.xp);
                player.c.points = player.c.points.minus(tmp[this.layer].buyables[this.id].cost.coin);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            buyMax() {
                let max_xp = player.xp.points.log(100).minus(1).minus(getBuyableAmount(this.layer, this.id)).floor();
                let max_coin = player.c.points.log(10).minus(1).minus(getBuyableAmount(this.layer, this.id)).floor();

                let amount = max_coin.min(max_xp);
                if (amount.lte(0)) return;

                let cost_current = this.cost(getBuyableAmount(this.layer, this.id));
                let cost_total_xp = powerSum(100, amount);
                let cost_total_coin = powerSum(10, amount);

                let cost_xp = cost_total_xp.times(cost_current.xp);
                let cost_coin = cost_total_coin.times(cost_current.coin);
                if (cost_xp.gt(player.xp.points)) {console.error(`error in buyable max buy cost calculation for buyable ${this.id} in layer ${this.layer} for xp`); return;}
                if (cost_coin.gt(player.c.points)) {console.error(`error in buyable max buy cost calculation for buyable ${this.id} in layer ${this.layer} for coins`); return;}

                player.xp.points = player.xp.points.minus(cost_xp);
                player.c.points = player.c.points.minus(cost_coin);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount));
            },
        },
        12: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Coin investment${getBuyableAmount(this.layer, this.id).gt(1)?'s':''}`;
            },
            cost(x) {
                return coin = new Decimal(50).pow(x.add(1));
            },
            effect(x) {
                return new Decimal(1.2).pow(x);
            },
            display() {
                if (!shiftDown) {
                    return `Your Coin investments multiply Coin gain by ${format(buyableEffect(this.layer, this.id))}<br /><br />
                    Cost: ${format(tmp[this.layer].buyables[this.id].cost)} Coins`;
                }

                let formulas = {
                    cost: '50^(x+1)',
                    effect: '1.2^x',
                };

                return `Cost formula: ${formulas.cost}<br />
                Effect formula: ${formulas.effect}`;
            },
            unlocked() {
                return hasUpgrade(this.layer, 23);
            },
            canAfford() {
                if (tmp[this.layer].buyables[this.id].cost.gt(player.c.points)) return false;
                return true;
            },
            buy() {
                player.c.points = player.c.points.minus(tmp[this.layer].buyables[this.id].cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            buyMax() {
                let amount = player.c.points.log(50).minus(1).minus(getBuyableAmount(this.layer, this.id)).floor();

                if (amount.lte(0)) return;

                let cost_current = this.cost(getBuyableAmount(this.layer, this.id));
                let cost_total = powerSum(50, amount);

                let cost = cost_current.times(cost_total);
                if (cost.gt(player.c.points)) {console.error(`error in buyable max buy cost calculation for buyable ${this.id} in layer ${this.layer}`); return;}

                player.c.points = player.c.points.minus(cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount));
            },
        },
        13: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Level investment${getBuyableAmount(this.layer, this.id).gt(1)?'s':''}`;
            },
            cost(x) {
                let level = new Decimal(2).times(x.add(1));
                let coin = new Decimal(10).pow(x.add(1));
                return {level, coin};
            },
            effect(x) {
                return new Decimal(1.2).pow(x);
            },
            display() {
                if (!shiftDown) {
                    return `Your Level investments divide level scaling by ${format(buyableEffect(this.layer, this.id))}<br /><br />
                    Cost: ${format(tmp[this.layer].buyables[this.id].cost.level)} Levels<br />
                    ${format(tmp[this.layer].buyables[this.id].cost.coin)} Coins`;
                }
                let formulas = {
                    cost: {
                        level: '2*(x+1)',
                        coin: '10^(x+1)',
                    },
                    effect: '1.1^x',
                };

                return `Level cost formula: ${formulas.cost.level}<br />
                Coin cost formula: ${formulas.cost.coin}<br />
                Effect formula: ${formulas.effect}`;
            },
            unlocked() {
                return hasUpgrade(this.layer, 23);
            },
            canAfford() {
                if (tmp[this.layer].buyables[this.id].cost.coin.gt(player.c.points)) return false;
                if (tmp[this.layer].buyables[this.id].cost.level.gt(player.l.points)) return false;
                return true;
            },
            buy() {
                player.l.points = player.l.points.minus(tmp[this.layer].buyables[this.id].cost.level);
                player.c.points = player.c.points.minus(tmp[this.layer].buyables[this.id].cost.coin);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            buyMax() {
                let max_level = player.l.points.div(2).minus(1).minus(getBuyableAmount(this.layer, this.id)).floor();
                let max_coin = player.c.points.log(10).minus(1).minus(getBuyableAmount(this.layer, this.id)).floor();

                let amount = max_coin.min(max_level);
                if (amount.lte(0)) return;

                let cost_current = this.cost(getBuyableAmount(this.layer, this.id));
                let cost_total_level = amount.times(2);
                let cost_total_coin = powerSum(10, amount);

                let cost_level = cost_total_level.times(cost_current.level);
                let cost_coin = cost_total_coin.times(cost_current.coin);
                if (cost_level.gt(player.l.points)) {console.error(`error in buyable max buy cost calculation for buyable ${this.id} in layer ${this.layer} for levels`); return;}
                if (cost_coin.gt(player.c.points)) {console.error(`error in buyable max buy cost calculation for buyable ${this.id} in layer ${this.layer} for coins`); return;}

                player.l.points = player.l.points.minus(cost_level);
                player.c.points = player.c.points.minus(cost_coin);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount));
            },
        },
    },
    type: 'normal',
    baseResource: 'points',
    baseAmount() {
        return player.points;
    },
    requires: new Decimal(50_000),
    exponent: new Decimal(.5),
    gainMult() {
        let mult = new Decimal(1);

        // XP layer
        mult = mult.times(buyableEffect('xp', 22));

        // C layer
        if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));
        mult = mult.times(buyableEffect('c', 12));

        // L layer
        if (hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 21));

        return mult;
    },
    branches: ['xp'],
    passiveGeneration() {
        let base = 0;

        // C layer
        if (hasUpgrade('c', 32)) {
            if (hasUpgrade('c', 33) || player.c.points.lt(tmp.c.resetGain)) base += 1;
        }

        return base;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keptUps = [];

        if (hasUpgrade('c', 33)) {
            if (hasUpgrade('c', 32)) keptUps.push(32);
            keptUps.push(33);
        }

        let keep = ['unlockedUpgrades'];

        layerDataReset(this.layer, keep);

        for (let id of keptUps) {
            if (!hasUpgrade('c', id)) player.c.upgrades.push(id);
        }
    },
});
