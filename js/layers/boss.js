addLayer('b', {
    name: 'Boss',
    startData() {
        return {
            points: Decimal.dZero,
            unlocked: false,
            auto_enter: true,
        };
    },
    color: '#990000',
    row: 2,
    resource: 'boss',
    layerShown() { return player.b.unlocked || player.xp.kills.gte(900); },
    tooltipLocked() { return 'You do not feel safe killing so many slimes anymore'; },
    hotkeys: [
        {
            key: 'b',
            description: 'B: Reset for bosses',
            unlocked() { return player.b.unlocked },
            onPress() { if (player.b.unlocked) doReset('b'); },
        },
        {
            key: 'B',
            description: 'Shift + B: Display boss layer',
            unlocked() { return player.b.unlocked },
            onPress() { if (player.b.unlocked) showTab('b'); },
        },
    ],
    tabFormat: {
        'Bosses': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                ['display-text', '<span style="color:red;font-weight:bold">Once you enter a boss challenge, you cannot exit!</span>'],
                ['challenges', [1]],
            ],
        },
    },
    challenges: {
        11: {
            name: 'The Slime King',
            challengeDescription: `You've killed a thousand slimes and must now endure the Slime King's wrath.<br>
            Fortunately, a new layer will be unlocked just for you<br><br>
            Slime health is multiplied by 100`,
            goalDescription: `Let's see you try to kill a thousand slimes now`,
            canComplete() { return player.xp.kills.gte(1000); },
            rewardDescription() {
                if (!hasChallenge(this.layer, this.id)) {
                    return 'As if you could beat the Slime King';
                }
                return `The Slime King, defeated, leaves only a map on the floor.<br>
                Keep the Ore layer and... Are these skeletons?`;
            },
            onEnter() { layerDataReset('lo', ['shown']); },
            onExit() { rowReset(layers[this.layer].row, this.layer); },
            onComplete() { layerDataReset('lo', ['shown']); },
        },
    },
    automate() {
        if (player.b.auto_enter) {
            // Auto start bosses because
            if (player.b.points.eq(1) && !inChallenge(this.layer, 11) && !hasChallenge(this.layer, 11)) {
                startChallenge(this.layer, 11);
            }
        }
    },
    type: 'custom',
    baseAmount() { return player.xp.kills; },
    getResetGain() {
        if (player.b.points.lt(1)) {
            if (player.xp.kills.gte(1e3)) return Decimal.dOne;
        }
        return Decimal.dZero;
    },
    getNextAt(canMax = false) {
        if (player.b.points.lt(1)) return new Decimal(1e3);
        return Decimal.dInf;
    },
    canReset() { return tmp.b.getResetGain.gte(1); },
    prestigeNotify() { return tmp.b.getResetGain.gte(1); },
    prestigeButtonText() {
        const nextAt = tmp.b.getNextAt;
        if (!isFinite(nextAt.mag) || !isFinite(nextAt.sign) || !isFinite(nextAt.layer)) return 'There are no more bosses to fight';
        return `You will fight your next boss at ${format(nextAt)} kills`;
    },
    roundUpCost: true,
    autoPrestige() { return player.b.points.eq(0); },
    symbol: 'B',
    position: 0,
    branches: ['l'],
});
