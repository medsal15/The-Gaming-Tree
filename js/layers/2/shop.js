'use strict';

//todo tree loans/investments
//todo forge loans/investments
addLayer('s', {
    name: 'Shop',
    symbol: 'S',
    /** @returns {typeof player.s} */
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            short_mode: false,
        };
    },
    tooltip() {
        if (player.s.short_mode) {
            /** @type {[string, number][]} */
            const coins = formatCoins(player.s.points, layers.s.coins.types.length).map((c, i) => [c, i]).filter(([c]) => (+c) > 0);
            if (!coins.length) coins.push(['0', 0]);
            return coins.map(([c, i]) => `<span style="color:${layers.s.coins.types[i][1]};">${c}</span>`).join(' | ');
        } else {
            return layers.s.coins.format(player.s.points, false, true).join('<br>');
        }
    },
    layerShown() { return (inChallenge('b', 12) || player.s.unlocked) && !tmp.s.deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#DDDD22',
    row: 2,
    position: 1,
    hotkeys: [
        {
            key: 's',
            description: 'S: Reset for coins',
            unlocked() { return tmp.s.layerShown; },
            onPress() { doReset('s'); },
        },
        {
            key: 'S',
            description: 'Shift + S: Display shop layer',
            unlocked() { return tmp.s.layerShown; },
            onPress() { showTab('s'); },
        },
    ],
    tabFormat: {
        'Upgrades': {
            content: [
                ['display-text', () => `You have ${tmp.s.coins.format}`],
                'prestige-button',
                ['display-text', () => `Your items have ${format(tmp.s.baseAmount)} total value`],
                'blank',
                () => {
                    const speed = layers.clo.time_speed('s');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                'blank',
                ['upgrades', [6, 7, 8]],
            ],
        },
        'Loans': {
            content: [
                ['display-text', () => tmp.s.coins.format],
                'prestige-button',
                'blank',
                ['display-text', () => `You have ${formatWhole(tmp.s.investloans.amount)} effective ${tmp.s.investloans.is_loans ? 'repaid loans' : 'investments'}`],
                ['display-text', () => `<span style="color:#AA5555;">Buying a${tmp.s.investloans.is_loans ? ' loan' : 'n investment'} increases the price of all the others</span>`],
                'blank',
                ['clickable', 11],
                ['upgrades', [1, 2, 3, 4, 9, 10, 5]],
            ],
            name() { return `${capitalize(tmp.s.investloans.type)}s`; },
        },
    },
    clickables: {
        11: {
            title() { return `Respec ${capitalize(tmp.s.investloans.type)}s`; },
            onClick() {
                if (!confirm(`Doing this will not refund your ${tmp.s.investloans.type}s and will force a Shop reset.\nAre you sure?`)) return;

                player.s.upgrades = player.s.upgrades.filter(id => id >= 61);
                doReset('s', true);
            },
            canClick() { return player.s.upgrades.some(id => id < 61); },
        },
    },
    upgrades: {
        //#region Loans/Investments
        11: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Experience ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Experience';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate experience challenge penality';
                if (!shiftDown) return 'Boost experience gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.xp.points, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.xp.points, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        12: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Kills ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Kills';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate kills challenge penality';
                if (!shiftDown) return 'Boost kills gain based on investments owned';
                let formula = 'investments / 100 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 100).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(tmp.xp.total.kills, 10).log10())}`;
                    case 'debt': return `-${format(D.div(tmp.xp.total.kills, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        13: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Levels ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Levels';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate levels challenge penality';
                if (!shiftDown) return 'Reduce level cost based on investments owned';
                let formula = 'investments / 5 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 5).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `cost *${format(D.add(player.l.points, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.l.points, 100).floor())}/s`;
                    case 'investment': return `cost /${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        21: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Slime Goo ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Slime Goo';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate slime goo challenge penality';
                if (!shiftDown) return 'Boost slime goo gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.slime_goo.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.slime_goo.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        22: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Slime Core Shards ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Slime Core Shards';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate slime core shards challenge penality';
                if (!shiftDown) return 'Boost slime core shard gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.slime_core_shard.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.slime_core_shard.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        23: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Slime Cores ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Slime Cores';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate slime cores challenge penality';
                if (!shiftDown) return 'Boost slime core gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.slime_core.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.slime_core.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        31: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Stone ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Stone';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate stone challenge penality';
                if (!shiftDown) return 'Boost stone gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.stone.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.stone.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        32: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Copper Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Copper Ore';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate copper ore challenge penality';
                if (!shiftDown) return 'Boost copper ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.copper_ore.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.copper_ore.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        33: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Tin Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Tin Ore';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate tin ore challenge penality';
                if (!shiftDown) return 'Boost tin ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.tin_ore.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.tin_ore.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        41: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Red Fabric ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Red Fabric';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate red fabric challenge penality';
                if (!shiftDown) return 'Boost red fabric gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.red_fabric.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.red_fabric.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        42: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Pyrite Coin ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Pyrite Coins';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate pyrite coin challenge penality';
                if (!shiftDown) return 'Boost pyrite coin gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.pyrite_coin.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.pyrite_coin.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        43: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Rusty Gear ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Rusty Gears';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate rusty gear challenge penality';
                if (!shiftDown) return 'Boost rusty gear gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.rusty_gear.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.rusty_gear.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        51: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Boss ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Bosses';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Allows completion of the challenge';
                if (!shiftDown) return 'Boost investments amount by bosses';
                let formula = 'bosses';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dZero;
                return player.b.points;
            },
            effectDisplay() {
                if (tmp.s.investloans.is_loans) return '';
                return `+${format(this.effect())}`;
            },
            cost() {
                let cost = D(1.5).pow(layers.s.investloans.amount(true).add(4));

                if (inChallenge('b', 32)) cost = cost.times(2);

                return powerRound(cost, 100);
            },
            style() {
                let width = '360px';

                if (inChallenge('b', 32) || hasChallenge('b', 32)) width = '600px';

                return { width };
            },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
        },
        91: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Rotten Flesh ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Rotten Flesh';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate rotten flesh challenge penality';
                if (!shiftDown) return 'Boost rotten flesh gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.rotten_flesh.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.rotten_flesh.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
            unlocked() { return hasChallenge('b', 32) || inChallenge('b', 32); },
        },
        92: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Brain ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Brains';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate brain challenge penality';
                if (!shiftDown) return 'Boost brain gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.brain.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.brain.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
            unlocked() { return hasChallenge('b', 32) || inChallenge('b', 32); },
        },
        101: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Coal ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Coal';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate coal challenge penality';
                if (!shiftDown) return 'Boost coal gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.coal.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.coal.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && player.m.show_deep; },
        },
        102: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Iron Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Iron Ore';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate iron ore challenge penality';
                if (!shiftDown) return 'Boost iron ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.iron_ore.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.iron_ore.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
            unlocked() { return hasChallenge('b', 32) || inChallenge('b', 32); },
        },
        103: {
            title() {
                if (tmp.s.investloans.is_loans) return `Repay Gold Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Gold Ore';
            },
            description() {
                if (tmp.s.investloans.is_loans) return 'Negate gold ore challenge penality';
                if (!shiftDown) return 'Boost gold ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.is_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.gold_ore.amount, 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.gold_ore.amount, 100).floor())}/s`;
                    case 'investment': return `*${format(this.effect())}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost(), false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && player.m.show_deep; },
        },
        //#endregion Loans/Investments
        //#region Normal upgrades
        61: {
            title: 'Mining Map',
            description: 'Mining chance is rooted, and it can go above 1',
            cost: D.dOne,
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let root = D.dTwo;

                if (hasUpgrade('s', 83)) root = root.add(upgradeEffect('s', 83));

                return root;
            },
            effectDisplay() { return `${format(this.effect())}√`; },
        },
        62: {
            title: 'Multi-Level Marketing',
            description() {
                if (!shiftDown) return 'Levels boost coins gain';

                let formula = '2√(levels + 1)';

                return `Formula: ${formula}`;
            },
            cost: D(2),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = player.l.points.add(1).root(2);

                return mult;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
        },
        63: {
            title: 'Blueprint Makers',
            description() {
                if (!shiftDown) return 'Shop upgrades reduce loot crafting costs';

                let formula = '0.95^upgrades';

                return `Formula: ${formula}`;
            },
            cost: D(5),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = D(.95).pow(player.s.upgrades.filter(id => id >= 61).length);

                return mult;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
        },
        71: {
            title: 'Shiny Sword',
            description() {
                if (!shiftDown) return 'Coins boost damage';

                let formula = 'log8(coins + 8)';

                return `Formula: ${formula}`;
            },
            cost: D(10),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = player.s.points.add(8).log(8);

                if (hasUpgrade('s', 83)) mult = mult.add(upgradeEffect('s', 83));

                return mult;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
        },
        72: {
            title: 'Crafting Tools',
            description() {
                return `Allows getting items and crafting with metals.<br>\
                Changes the effect of ${layerColor('lo', tmp.lo.upgrades[11].title)} and ${layerColor('m', tmp.m.upgrades[33].title)}'s formula`;
            },
            cost: D(25),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        73: {
            title: 'Book of Skills',
            description: 'Skill points are stronger',
            cost: D(50),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = D(2);

                mult = mult.times(tmp.l.skills.reading.effect);

                return mult;
            },
            effectDisplay() { return `*${format(this.effect())}`; },
        },
        81: {
            title: 'Crafting Quality Improvements',
            description: 'Item values increase by their amount',
            effect() {
                let add = D.dOne;

                if (hasUpgrade('s', 83)) add = add.add(upgradeEffect('s', 83));

                return add;
            },
            effectDisplay() { return `+${format(this.effect())} value per item`; },
            cost: D(100),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        82: {
            title: 'Cash Shop',
            description() {
                if (!shiftDown) return `${tmp.s.investloans.is_loans ? 'Loans' : 'Investments'} decrease level costs`;

                let formula = `2√(${tmp.s.investloans.is_loans ? 'loans' : 'investments'} + 2)`;

                return `Formula: ${formula}`;
            },
            effect() { return tmp.s.investloans.amount.add(2).root(2); },
            effectDisplay() { return `/${format(this.effect())}`; },
            cost: D(300),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        83: {
            title: 'Better Paper',
            description: 'Increase effects of first column of upgrades',
            effect() { return D.dOne; },
            effectDisplay() { return `+${format(this.effect())}`; },
            cost: D(750),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        //#endregion Normal upgrades
    },
    type: 'normal',
    baseAmount() { return tmp.lo.items["*"].value; },
    baseResource: 'crafts total value',
    requires: D(100),
    exponent: D(.5),
    prestigeButtonText() {
        const next = player.s.points.gte(100) || getResetGain('s').gte(1_000) ? '' : `<br>Next at ${format(getNextAt('s'))} total value`;
        return `Sell your items for ${layers.s.coins.format(getResetGain('s'), false)}${next}`;
    },
    /** @type {typeof layers.s.coins} */
    coins: {
        types: [['copper', '#BB7733'], ['bronze', '#C4995E'], ['iron', '#CCCCCC'], ['gold', '#FFDD00'], ['platinum', '#CCCCFF']],
        format(amount = player.s.points, color = true, split = false) {
            /** @type {[string, number][]} */
            const coins = formatCoins(amount, this.types.length).map((c, i) => [c, i]).filter(([c]) => (+c) > 0);
            if (!coins.length) coins.push(['0', 0]);
            const lines = coins.map(([c, i]) => {
                return `<span${color ? ` style="color:${this.types[i][1]};font-size:1.5em;text-shadow:${this.types[i][1]} 0 0 10px;font-family:'Lucida Console', 'Courier New', monospace;"` : ''}>${c}</span> ${this.types[i][0]} coins`;
            }).reverse();
            if (split) return lines;
            return listFormat.format(lines);
        },
    },
    /** @type {typeof layers.s.investloans} */
    investloans: {
        amount(real = false) {
            let amount = D(player.s.upgrades.filter(id => id < 60).length);

            if (!real && hasUpgrade('s', 51)) amount = amount.add(upgradeEffect('s', 51));

            return amount;
        },
        is_loans() { return inChallenge('b', 12) || inChallenge('b', 32); },
        type() {
            if (inChallenge('b', 12)) return 'loan';
            if (inChallenge('b', 32)) return 'debt';
            return 'investment';
        },
        item_upgrade: {
            'slime_goo': 21, 'slime_core_shard': 22, 'slime_core': 23,
            'stone': 31, 'copper_ore': 32, 'tin_ore': 33,
            'red_fabric': 41, 'pyrite_coin': 42, 'rusty_gear': 43,
            'rotten_flesh': 91, 'brain': 92,
            'coal': 101, 'iron_ore': 102, 'gold_ore': 103,
        },
        is_loan(id) {
            if (!id) return false;

            return id <= 51 || (id >= 91 && id <= 103);
        },
    },
    branches: ['lo'],
    gainMult() {
        let mult = D.dOne;

        if (hasUpgrade('s', 62)) mult = mult.times(upgradeEffect('s', 62));

        mult = mult.times(buyableEffect('lo', 32).coin_mult);

        if (hasUpgrade('m', 63)) mult = mult.times(upgradeEffect('m', 63));

        return mult;
    },
});
