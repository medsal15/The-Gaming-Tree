'use strict';

//todo implement 52 (through Casino)
//todo exception for 32: final "enemy" drop
addLayer('b', {
    name: 'boss',
    symbol: 'B',
    /** @returns {typeof player.b} */
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            auto_start: true,
        };
    },
    tooltipLocked() { return 'Danger approaches'; },
    layerShown() { return player.b.unlocked || tmp.xp.total.kills.gte(500); },
    color: '#AA5555',
    row: 3, // The shop exits the challenge otherwise
    displayRow: 2,
    position: 0,
    resource: 'bosses',
    hotkeys: [
        {
            key: 'B',
            description: 'Shift + B: Display boss layer',
            unlocked() { return player.b.unlocked; },
            onPress() { if (player.b.unlocked) showTab('b'); },
        },
    ],
    tabFormat: {
        'Bosses': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                () => {
                    const speed = layers.clo.time_speed('b');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `<span style="color:#AA5555;">Boss challenges ${player.b.auto_start ? 'are automatically entered and ' : ''}cannot be exited.</span>`],
                'blank',
                ['challenges', [1, 2]],
            ],
        },
        'Mini-Bossess': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                () => {
                    const speed = layers.clo.time_speed('b');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', '<span style="color:#AA5555;">Mini-boss challenges cannot be exited.</span>'],
                ['display-text', '<span style="color:#00CCCC;">Mini-boss challenges are optional.</span>'],
                'blank',
                ['challenges', [3, 4]],
            ],
            unlocked() { return hasChallenge('b', 11); },
            buttonStyle: { 'border-color': '#CC6666', },
        },
        'Relics': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                () => {
                    const speed = layers.clo.time_speed('b');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', '<span style="color:#00CCCC;">Relic challenges are optional.</span>'],
                'blank',
                ['challenges', [5, 6]],
            ],
            unlocked() { return hasChallenge('b', 31); },
            buttonStyle: { 'border-color': '#7777EE', },
        },
    },
    challenges: {
        // Bosses
        11: {
            name: 'Slime King\'s Wrath',
            challengeDescription: 'Slime health is multiplied by 5, unlock a new layer.',
            goalDescription: 'Kill another thousand slimes.',
            canComplete() { return player.xp.kills.slime.gte(1_000); },
            rewardDescription() {
                if (!hasChallenge(this.layer, this.id)) {
                    return 'The Slime King has a lot of treasure, surely you can find something of use in there.';
                } else {
                    return `Unlock goblins and keep the new layer. Your experience upgrades are always visible and ${layerColor('xp', tmp.xp.upgrades[22].title, 'text-shadow:#000 0 0 10px')}'s effect is doubled.`;
                }
            },
            unlocked() { return player.b.points.gte(1); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = {};
                if (active && active < 50 && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        12: {
            name: 'The Goblin CEO',
            challengeDescription: 'All resource gains are divided by log10(amount + 10), unlock a new layer.',
            goalDescription: 'Pay off your loan.',
            canComplete() { return hasUpgrade('s', 51); },
            rewardDescription() { return `Unlock zombies and keep the new layer. Your mining upgrades are always visible and ${layerColor('xp', tmp.xp.upgrades[22].title, 'text-shadow:#000 0 0 10px')} also affects all enemies at half its amount.`; },
            unlocked() { return player.b.points.gte(2); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = {};
                if (active && active < 50 && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        // Mini-bosses
        31: {
            name: 'Slime Prince\'s Anger',
            challengeDescription: 'You can only fight slimes, and their health is multiplied by 2.5. Most other layers are disabled.',
            goalDescription: 'Kill 250 slimes',
            canComplete() { return player.xp.kills.slime.gte(250); },
            rewardDescription: 'New XP upgrades, slime item drops are doubled.',
            unlocked() { return hasChallenge('b', 11); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#CC6666', };
                if (active && active < 50 && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        32: {
            name: 'The Goblin President',
            challengeDescription: 'Lose 1% (rounded down) of your lower rows resources every second.<br>Get new debts to pay off.<br>Double price of final debt.',
            goalDescription: 'Pay off your debt',
            canComplete() { return hasUpgrade('s', 51); },
            rewardDescription: 'Your portfolio grows, goblin item drops are doubled.',
            unlocked() { return hasChallenge('b', 12); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#CC6666', };
                if (active && active < 50 && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        // Relics
        51: {
            name: 'The Broken Clock',
            challengeDescription: 'Time is much slower. This affects all passive content.',
            goalDescription: 'Fix The Clock',
            canComplete() { return [41, 42, 43].every(id => hasUpgrade('clo', id)); },
            rewardDescription: 'Unlock The Clock, a special layer to speed time up.',
            unlocked() { return hasChallenge('b', 31); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#7777EE', };
                if (active && active < 50 && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            // Removes repair upgrades
            onEnter() { player.clo.upgrades = player.clo.upgrades.filter(id => Math.floor(id / 10) != 4); },
        },
        52: {
            name: 'Misfortune',
            challengeDescription: 'Item drops are changed (only affects unlocked items)',
            goalDescription: '???',
            canComplete: false,
            rewardDescription: 'Unlock The Casino, a special layer to change your luck.',
            unlocked() { return hasChallenge('b', 32); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#7777EE', };
                if (active && active < 50 && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
    },
    automate() {
        if (player.b.auto_start && !player.b.activeChallenge) {
            const id = [11, 12, 21, 22].find(id => tmp.b.challenges[id]?.unlocked && !hasChallenge('b', id));
            if (id) startChallenge('b', id);
        }
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (inChallenge('b', 32)) {
            /** @param {DecimalSource} amount */
            const get_loss = amount => {
                const loss = D.div(amount, 100).floor().times(diff);
                if (isNaN(loss.mag) || isNaN(loss.sign) || isNaN(loss.layer)) return D.dZero;
                return loss;
            };

            if (!hasUpgrade('s', 11)) {
                player.xp.points = player.xp.points.minus(get_loss(player.xp.points)).max(0);
            }
            if (!hasUpgrade('s', 12)) {
                const total = tmp.xp.total.kills,
                    loss = get_loss(total);
                if (loss.gt(0)) Object.entries(player.xp.kills).forEach(([type, kills]) => {
                    const l = kills.div(total).times(loss);
                    player.xp.kills[type] = kills.minus(l).max(0);
                });
            }
            if (!hasUpgrade('s', 13)) {
                player.l.points = player.l.points.minus(get_loss(player.l.points));
            }
            // Items
            Object.entries(player.lo.items).forEach(([item, { amount }]) => {
                const upg = layers.s.investloans.item_upgrade[item] ?? false;
                if (!upg || !hasUpgrade('s', upg)) player.lo.items[item].amount = amount.minus(get_loss(amount));
            });
        }
    },
    type: 'custom',
    getResetGain() {
        if (player.b.points.lt(1)) return D(+player.xp.kills.slime.gte(1_000));
        if (player.b.points.lt(2)) return D(+player.xp.kills.goblin.gte(1_000));
        return D.dZero;
    },
    baseAmount() {
        if (player.b.points.lt(1)) return player.xp.kills.slime;
        if (player.b.points.lt(2)) return player.xp.kills.goblin;
        return D.dZero;
    },
    getNextAt() {
        if (player.b.points.lt(1)) return D(1_000);
        if (player.b.points.lt(2)) return D(1_000);
        return D.dInf;
    },
    canReset() {
        if (player.b.points.lt(1)) return player.xp.kills.slime.gte(1_000);
        if (player.b.points.lt(2)) return player.xp.kills.goblin.gte(1_000);
        return false;
    },
    prestigeButtonText() {
        if (player.b.points.eq(0)) return `Your next boss will be at ${format(this.getNextAt())} ${layers.xp.enemy.name('slime')} kills`;
        if (player.b.points.eq(1)) return `Your next boss will be at ${format(this.getNextAt())} ${layers.xp.enemy.name('goblin')} kills`;
        return 'There are no more bosses to fight';
    },
    prestigeNotify() { return tmp.b.getResetGain.gte(1); },
    roundUpCost: true,
    autoPrestige: true,
    branches: ['l', () => inChallenge('b', 31) ? 'xp' : undefined],
});
