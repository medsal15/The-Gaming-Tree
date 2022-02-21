addLayer('lb', {
    name: 'Lootboxes',
    symbol: 'LB',
    startData() {
        return {
            points: new Decimal(0),
            unlockedUpgrades: [11],
            unlocked: false,
        };
    },
    layerShown() {
        return hasUpgrade('l', 33) && hasUpgrade('c', 33);
    },
    color: '#FFFFFF',
    row: 2,
    position: 1,
    resource: 'lootbox',
    hotkeys: [
        {
            key: 'b',
            description: 'B: Reset for monsters',
            unlocked() {
                return player.lb.unlocked;
            },
            onPress() {
                if (player.lb.unlocked) doReset('lb');
            },
        },
        {
            key: 'B',
            description: 'Shift + B: Display monsters layer',
            unlocked() {
                return player.lb.unlocked;
            },
            onPress() {
                if (player.lb.unlocked) showTab('lb');
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
                return canAffordLayerUpgrade('m');
            },
        },
        'Loot': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                ['display-text', function() {
                    return `Loot bonuses are capped at ${format(tmp.lb.buyableMaxAmount)} items`;
                }],
                ['infobox', 'odds'],
                'clickables',
                'buyables',
            ],
        },
    },
    upgrades: {
        11: {
            title: 'Taller piles',
            description: 'Double item limit for effects',
            cost: new Decimal(5),
        },
        12: {
            title: 'Big spender bonus',
            description: 'Coin upgrades effects * 1.5',
            cost: new Decimal(15),
        },
        13: {
            title: 'More RNG',
            description: 'Unlock more loot',
            cost: new Decimal(25),
        },
        //todo
        //todo 2X: XP buyable
        //todo 2X: Coin buyable
        //todo 23: weight manipulation
        //todo 33: even more buyables
    },
    clickables: {
        11: {
            title: 'Open a lootbox!',
            canClick() { return player.lb.points.gte(1); },
            effect() {
                /** @type {Decimal} */
                let amount_to_roll = buyableEffect(this.layer, 22).add(1);

                const roll_buyable = () => {
                    /** @type {[number, number][]} */
                    let options = [];
                    let sum_weight = 0;

                    for (let i of Object.values(tmp.lb.buyables)) {
                        if (!i.weight) continue;

                        options.push([i.id, i.weight]);
                        sum_weight += i.weight;
                    }

                    let rolled = Math.floor(Math.random() * sum_weight);

                    for (let [id, weight] of options) {
                        rolled -= weight;

                        if (rolled <= 0) {
                            addBuyables('lb', id, 1);
                            break;
                        }
                    }
                }

                while (amount_to_roll.gte(1)) {
                    roll_buyable();
                    amount_to_roll = amount_to_roll.minus(1);
                }

                if (amount_to_roll.gte(Math.random())) {
                    roll_buyable();
                }
            },
        },
    },
    buyables: {
        11: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} XP potions`;
            },
            effect() {
                let base = new Decimal(1.1);

                let amount = getBuyableAmount(this.layer, this.id).min(tmp.lb.buyableMaxAmount);

                return base.pow(amount);
            },
            display() {
                if (!shiftDown) {
                    let hardcapped = getBuyableAmount(this.layer, this.id).gt(tmp.lb.buyableMaxAmount) ? ` (hardcapped)` : '';
                    let effect = `Your XP potions boost XP gain by ${format(this.effect())}`;

                    return effect + hardcapped;
                }
                let formula = '1.1^amount';

                return `Formula: ${formula}`;
            },
            canAfford: false,
            buy() {},
            unlocked() { return this.weight().gt(0); },
            weight() { return new Decimal(1); },
        },
        12: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Investors`;
            },
            effect() {
                let base = new Decimal(1.1);

                let amount = getBuyableAmount(this.layer, this.id).min(tmp.lb.buyableMaxAmount);

                return base.pow(amount);
            },
            display() {
                if (!shiftDown) {
                    let hardcapped = getBuyableAmount(this.layer, this.id).gt(tmp.lb.buyableMaxAmount) ? ` (hardcapped)` : '';
                    let effect = `Your investors boost bank effects by ${format(this.effect())}`;

                    return effect + hardcapped;
                }
                let formula = '1.1^amount';

                return `Formula: ${formula}`;
            },
            canAfford: false,
            buy() {},
            unlocked() { return this.weight().gt(0); },
            weight() { return new Decimal(1); },
        },
        13: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Reducers`;
            },
            effect() {
                let base = new Decimal(1.1);

                let amount = getBuyableAmount(this.layer, this.id).min(tmp.lb.buyableMaxAmount);

                return base.pow(amount);
            },
            display() {
                if (!shiftDown) {
                    let hardcapped = getBuyableAmount(this.layer, this.id).gt(tmp.lb.buyableMaxAmount) ? ` (hardcapped)` : '';
                    let effect = `Your reducers divide level costs by ${format(this.effect())}`;

                    return effect + hardcapped;
                }
                let formula = '1.1^amount';

                return `Formula: ${formula}`;
            },
            canAfford: false,
            buy() {},
            unlocked() { return this.weight().gt(0); },
            weight() { return new Decimal(1); },
        },
        21: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Monster repellants`;
            },
            effect() {
                let base = new Decimal(1.1);

                let amount = getBuyableAmount(this.layer, this.id).min(tmp.lb.buyableMaxAmount);

                return base.pow(amount);
            },
            display() {
                if (!shiftDown) {
                    let hardcapped = getBuyableAmount(this.layer, this.id).gt(tmp.lb.buyableMaxAmount) ? ` (hardcapped)` : '';
                    let effect = `Your repellants divide champion goals by ${format(this.effect())}`;

                    return effect + hardcapped;
                }
                let formula = '1.1^amount';

                return `Formula: ${formula}`;
            },
            canAfford: false,
            buy() {},
            unlocked() { return this.weight().gt(0); },
            weight() {
                let base = new Decimal(0);

                if (hasUpgrade('lb', 13)) base = base.add(1);

                return base;
            },
        },
        22: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Four leaves clovers`;
            },
            effect() {
                let base = new Decimal(.1);

                let amount = getBuyableAmount(this.layer, this.id).min(tmp.lb.buyableMaxAmount);

                return base.times(amount);
            },
            display() {
                if (!shiftDown) {
                    /** @type {Decimal} */
                    let addition = this.effect().floor();
                    /** @type {Decimal} */
                    let chance = this.effect().minus(addition).times(100);

                    let hardcapped = getBuyableAmount(this.layer, this.id).gt(tmp.lb.buyableMaxAmount) ? ` (hardcapped)` : '';
                    let effect = `Your clovers increase lootbox loot by ${formatWhole(addition)} and your odds to get one more by ${formatWhole(chance)}%`;

                    return effect + hardcapped;
                }
                let formulas = {
                    increase: 'floor(amount/10)',
                    chance: '(amount % 10)/10',
                };

                return `Increase formula: ${formulas.increase}<br>Chance formula: ${formulas.chance}`;
            },
            canAfford: false,
            buy() {},
            unlocked() { return this.weight().gt(0); },
            weight() {
                let base = new Decimal(0);

                if (hasUpgrade('lb', 13)) base = base.add(1);

                return base;
            },
        },
        23: {
            title() {
                return `${formatWhole(getBuyableAmount(this.layer, this.id))} Charisma potions`;
            },
            effect() {
                let base = new Decimal(1.1);

                let amount = getBuyableAmount(this.layer, this.id).min(tmp.lb.buyableMaxAmount);

                return base.pow(amount);
            },
            display() {
                if (!shiftDown) {
                    let hardcapped = getBuyableAmount(this.layer, this.id).gt(tmp.lb.buyableMaxAmount) ? ` (hardcapped)` : '';
                    let effect = `Your charisma divides party costs by ${format(this.effect())}`;

                    return effect + hardcapped;
                }
                let formula = '1.1^amount';

                return `Formula: ${formula}`;
            },
            canAfford: false,
            buy() {},
            unlocked() { return this.weight().gt(0); },
            weight() {
                let base = new Decimal(0);

                if (hasUpgrade('lb', 13)) base = base.add(1);

                return base;
            },
        },
    },
    infoboxes: {
        'odds': {
            title: 'Loot odds',
            body() {
                let chance = Object.values(tmp.lb.buyables).filter(b => b?.weight).map(b => b.weight).reduce((s, b) => s + b, 0);

                let rows = ['Each lootbox will provide one of the following:'];
                for (let i of Object.values(tmp.lb.buyables)) {
                    if (i !== Object(i)) continue;

                    rows.push(`${i.title.replace(/\d+ /, '')}: ${formatWhole(i.weight / chance * 100)}%`);
                }

                return rows.join('<br>');
            },
        },
    },
    type: 'static',
    baseResource: 'coins',
    baseAmount() {
        return player.c.points;
    },
    requires: new Decimal('1e75'), //not sure
    exponent: new Decimal(2),
    base: new Decimal(2),
    roundUpCost: true,
    branches: ['l', 'c'],
    canBuyMax: true,
    buyableMaxAmount() {
        let base = new Decimal(10);

        if (hasUpgrade('lb', 11)) base = base.times(2);

        return base;
    },
});
