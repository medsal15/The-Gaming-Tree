addLayer('s', {
    name: 'Shop',
    image: './resources/images/swap-bag.svg',
    startData() {
        const data = {
            points: D.dZero,
            unlocked: true,
            stocks: {},
            stock_time: D.dZero,
        };

        return data;
    },
    color: 'gold',
    row: 2,
    position: 1,
    resource: 'coin',
    layerShown() { return inChallenge('b', 12) || hasChallenge('b', 12); },
    tooltip() { return this.formatCoins(player.s.points, false); },
    hotkeys: [
        {
            key: 's',
            description: 'S: Sell your items for some coins',
            unlocked() { return tmp.s.layerShown },
            onPress() { if (tmp.s.layerShown) doReset('s'); },
        },
        {
            key: 'S',
            description: 'Shift + S: Open the shop',
            unlocked() { return tmp.s.layerShown },
            onPress() { if (tmp.s.layerShown) showTab('s'); },
        },
    ],
    tabFormat: {
        'Shop': {
            content: [
                ['display-text', () => `You have ${layers.s.formatCoins(player.s.points)}`],
                'prestige-button',
                () => player.s.points.lt(1e3) && tmp.s.resetGain.lt(100) ? [
                    'display-text', `Your crafted items have a total of ${format(tmp.s.baseAmount)} value`,
                ] : '',
                'blank',
                ['upgrades', [6, 7, 8]],
            ],
        },
        'Debt': {
            content: [
                ['display-text', () => `You have ${layers.s.formatCoins(player.s.points)}`],
                'prestige-button',
                () => player.s.points.lt(1e3) && tmp.s.resetGain.lt(100) ? [
                    'display-text', `Your crafted items have a total of ${format(tmp.s.baseAmount)} value`,
                ] : '',
                'blank',
                ['display-text', () => `<span style="color:red;font-weight:bold">Buying ${inChallenge('b', 12) ? 'a debt' : 'an investment'} increases the cost of all others!</span>`],
                ['upgrades', [1, 2, 3, 4, 5]],
            ],
            unlocked() { return inChallenge('b', 12); },
        },
        'Investments': {
            content() { return this['Debt'].content; },
            unlocked() { return !inChallenge('b', 12) && hasChallenge('b', 12); },
        },
    },
    upgrades: {
        //#region Debts/investments
        11: {
            title: () => inChallenge('b', 12) ? 'Pay off XP debt' : 'XP investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate XP loss';
                if (!shiftDown) {
                    return 'Boost XP gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        12: {
            title: () => inChallenge('b', 12) ? 'Pay off kills debt' : 'Kills investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate kills loss';
                if (!shiftDown) {
                    return 'Boost kills gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        13: {
            title: () => inChallenge('b', 12) ? 'Pay off levels debt' : 'Levels investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate levels loss';
                if (!shiftDown) {
                    return 'Nerf levels cost by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `/${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        21: {
            title: () => inChallenge('b', 12) ? 'Pay off slime goo debt' : 'Slime goo investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate slime goo loss';
                if (!shiftDown) {
                    return 'Boost slime goo gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        22: {
            title: () => inChallenge('b', 12) ? 'Pay off slime core shards debt' : 'Slime core shards investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate slime core shards loss';
                if (!shiftDown) {
                    return 'Boost slime core shards gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        23: {
            title: () => inChallenge('b', 12) ? 'Pay off slime core debt' : 'Slime core investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate slime core loss';
                if (!shiftDown) {
                    return 'Boost slime core gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        31: {
            title: () => inChallenge('b', 12) ? 'Pay off stone debt' : 'Stone investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate stone loss';
                if (!shiftDown) {
                    return 'Boost stone gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        32: {
            title: () => inChallenge('b', 12) ? 'Pay off copper ore debt' : 'Copper ore investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate copper ore loss';
                if (!shiftDown) {
                    return 'Boost copper ore gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        33: {
            title: () => inChallenge('b', 12) ? 'Pay off tin ore debt' : 'Tin ore investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate tin ore loss';
                if (!shiftDown) {
                    return 'Boost tin ore gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        41: {
            title: () => inChallenge('b', 12) ? 'Pay off bone debt' : 'Bone investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate bone loss';
                if (!shiftDown) {
                    return 'Boost bone gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        42: {
            title: () => inChallenge('b', 12) ? 'Pay off skull debt' : 'Skull investment',
            description() {
                if (inChallenge('b', 12)) return 'Negate skull loss';
                if (!shiftDown) {
                    return 'Boost skull gain by amount of investments owned';
                }
                let formula = '1 + investments / 100';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(100);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        43: {
            title: () => inChallenge('b', 12) ? 'Pay off nothing debt' : 'No investment',
            description() {
                if (inChallenge('b', 12)) return 'Does nothing';
                return 'A useless investment';
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 1); },
            fullDisplay() {
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br><br>\
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        51: {
            title: () => inChallenge('b', 12) ? 'Pay off final debt' : 'Full investment',
            description() {
                if (inChallenge('b', 12)) return 'Finish the challenge';
                if (!shiftDown) {
                    return 'Boost all gains by amount of investments owned';
                }
                let formula = '1 + investments / 20';

                return `Formula: ${formula}`;
            },
            cost() { return tmp.s.altBase.pow(player.s.upgrades.filter(id => +id <= 51).length + 4); },
            effect() {
                if (inChallenge('b', 12)) return D.dOne;
                return D(player.s.upgrades.filter(id => id <= 51).length).div(20);
            },
            effectDisplay() { return `*${format(this.effect().add(1))}`; },
            fullDisplay() {
                let effect = '';
                if (!inChallenge('b', 12)) effect = `<span>Currently: ${tmp[this.layer].upgrades[this.id].effectDisplay}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
            style: {
                width: '360px',
            },
        },
        //#endregion Debts/investments
        61: {
            title: 'Discount crafting',
            description: 'Crafting is 10% cheaper per shop upgrade (multiplicative)',
            effect() { return D.pow(.9, player.s.upgrades.filter(id => id > 51).length).min(1).max(0); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D.dOne,
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        62: {
            title: 'Bank',
            description() {
                if (!shiftDown) return 'Coins boost coin gain';
                let formula = '2√(coins + 2)';

                return `Formula: ${formula}`;
            },
            effect() { return player.s.points.max(0).add(2).root(2); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(5),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        63: {
            title: 'Hired miners',
            description() {
                if (!shiftDown) return 'Coins boost ore health and regeneration';
                let formula = 'log4(coins + 4)';

                return `Formula: ${formula}`;
            },
            effect() { return player.s.points.max(0).add(4).log(4); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(15),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        71: {
            title: () => `${inChallenge('b', 12) ? 'Debt' : 'Investment'} returns`,
            description() {
                if (!shiftDown) return `${inChallenge('b', 12) ? 'Paid debts' : 'Investments'} increase coin gains`;
                let formula = `2√(${inChallenge('b', 12) ? 'paid debts' : 'investments'} + 1)`;

                return `Formula: ${formula}`;
            },
            effect() { return D(player.s.upgrades.filter(id => id <= 51).length).add(1).root(2).max(1); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(25),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        72: {
            title: 'Loot purse',
            description: () => `Keep getting items<br>Changes ${layerColor('lo', 'Lootbag')}'s effect`,
            cost: D(50),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        73: {
            title: 'Monster farm',
            description() {
                if (!shiftDown) return 'Coins boost items gain';
                let formula = '6√(coins + 6)';

                return `Formula: ${formula}`;
            },
            effect() { return player.s.points.max(0).add(6).root(6); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(75),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        81: {
            title: 'Level self-synergy',
            description() {
                if (!shiftDown) return 'Levels reduce their own cost';
                let formula = '2√(levels + 2)';

                return `Formula: ${formula}`;
            },
            effect() { return player.l.points.max(0).add(2).root(2); },
            effectDisplay() { return `/${format(this.effect())}`; },
            cost: D(100),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        82: {
            title: 'Gold ticket',
            description() {
                if (!shiftDown) return 'Items amount boost their own value';
                let formula = 'log2(item amount + 2)';

                return `Formula: ${formula}`;
            },
            cost: D(200),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
        83: {
            title: 'High quality anvil',
            description() {
                if (!shiftDown) return `You can always craft ore items<br>\
                Boosts <span style="color:#C4BC86">${tmp.o.upgrades[33].title}</span>'s effects<br>\
                Ore upgrades boost ore regeneration`;

                let formula = '2√(ore upgrades + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return D.root(player.o.upgrades.length + 1, 2).max(1); },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(400),
            fullDisplay() {
                let effect = '';
                if ('effectDisplay' in this) effect = `<span>Currently: ${this.effectDisplay()}</span><br>`;
                return `<h3>${tmp[this.layer].upgrades[this.id].title}</h3><br>\
                <span>${tmp[this.layer].upgrades[this.id].description}</span><br>\
                ${effect}<br>
                Cost: ${layers.s.formatCoins(tmp[this.layer].upgrades[this.id].cost, false)}`;
            },
        },
    },
    altBase() {
        if (inChallenge('b', 12)) return D(2);
        return D(8);
    },
    /**
     * TODO:
     * - Stocks?
     *  - buy low, sell high
     * - Upgrades
     *  - automation, keep, etc...
     *  - also more stuff
     */
    coin_types: [
        ['copper', '#B87333'],
        ['bronze', '#CD7F32'],
        ['silver', '#C0C0C0'],
        ['gold', '#FFD700'],
        ['platinum', '#E5E4E2'],
        ['diamond', '#00FFFF'],
    ],
    formatCoins(amount, span = true) {
        /** @type {[string, string][]} */
        const coin_types = this.coin_types;
        const coins = formatCoins(amount, coin_types);
        const list = coins.map(/**@returns {[string,number]}*/(c, i) => [c, i])
            .filter(([c]) => c != '0')
            .map(([c, i]) => span ?
                `<span style="color:${coin_types[i][1]};text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${c}</span> ${coin_types[i][0]} coins` :
                `${c} ${coin_types[i][0]} coins`
            ).reverse();
        if (!list.length) list.push(span ?
            `<span style="color:${coin_types[0][1]};text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">0</span> ${coin_types[0][0]} coins` :
            `0 ${coin_types[0][0]} coins`
        );
        return new Intl.ListFormat('en').format(list);
    },
    type: 'normal',
    baseAmount() {
        let amount = Object.keys(layers.lo.buyables)
            .filter(id => !isNaN(id))
            .reduce((sum, id) => sum.add(getBuyableAmount('lo', id).times(tmp['lo'].buyables[id].value)), D.dZero);

        return amount;
    },
    baseResource: 'total value',
    exponent: 2 / 3,
    requires: D(100),
    branches: ['lo'],
    prestigeButtonText() {
        let text = '';
        if (player[this.layer].points.lt(100) && tmp.s.resetGain?.lt?.(100)) text = `<br><br>Next at ${format(tmp.s.nextAt)} ${this.baseResource}`;
        return `Sell your crafted items for ${this.formatCoins(tmp.s.resetGain, false)}${text}`;
    },
    gainMult() {
        let mult = D.dOne;

        if (hasUpgrade('s', 62)) mult = mult.times(upgradeEffect('s', 62));
        if (hasUpgrade('s', 71)) mult = mult.times(upgradeEffect('s', 71));

        return mult;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = ['shown'];

        layerDataReset(this.layer, keep);
    },
});
