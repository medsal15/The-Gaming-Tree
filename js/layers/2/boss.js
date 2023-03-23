'use strict';

addLayer('b', {
    name: 'boss',
    symbol: 'B',
    /** @returns {Player['b']} */
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
    row: 2,
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
            goalDescription: 'Kill another thousand slimes',
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
        // Relics
        51: {
            name: 'The Broken Clock',
            challengeDescription: 'Time is much slower. All passive content is affected.',
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
    },
    automate() {
        if (player.b.auto_start && !player.b.activeChallenge) {
            const id = [11, 12, 21, 22].find(id => tmp.b.challenges[id]?.unlocked && !hasChallenge('b', id));
            if (id) startChallenge('b', id);
        }
    },
    type: 'custom',
    getResetGain() {
        /** @type {[string, DecimalSource][]} */
        const thresholds = [['slime', 1e3]];

        let amount = D(thresholds.filter(([type, kills]) => player.xp.kills[type].gte(kills)).length);

        return amount.minus(player.b.points).min(1);
    },
    baseAmount() {
        if (player.b.points.lt(1)) return player.xp.kills.slime;
        return D.dZero;
    },
    getNextAt() {
        if (player.b.points.lt(1)) return D(1000);
        return D.dInf;
    },
    canReset() {
        if (player.b.points.lt(1)) return player.xp.kills.slime.gte(1000);
        return false;
    },
    prestigeButtonText() {
        if (player.b.points.eq(0)) return `Your next boss will be at ${format(1e3)} slime kills`;
        return 'There are no more bosses to fight';
    },
    prestigeNotify() { return tmp.b.getResetGain.gte(1); },
    roundUpCost: true,
    autoPrestige: true,
    branches: ['l', () => inChallenge('b', 31) ? 'xp' : undefined],
});
