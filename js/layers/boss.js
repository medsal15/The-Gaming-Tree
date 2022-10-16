addLayer('b', {
    name: 'Boss',
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            auto_enter: true,
        };
    },
    color: '#990000',
    row: 3, // Prevents reset on shop prestige
    displayRow: 2,
    position: 0,
    resource: 'boss',
    layerShown() { return player.b.unlocked || player.xp.kills.gte(900); },
    tooltipLocked() { return 'You do not feel safe killing so many slimes anymore'; },
    hotkeys: [
        {
            key: 'b',
            description: 'B: Complete boss challenge (if you can)',
            unlocked() { return player.b.unlocked },
            onPress() { if (canCompleteChallenge('b', player.b.activeChallenge)) completeChallenge('b', player.b.activeChallenge); },
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
                ['display-text', '<span style="color:#990000;font-weight:bold">Once you enter a boss challenge, you cannot exit!</span>'],
                ['challenges', [1]],
            ],
        },
        'Minibosses': {
            content: [
                ['display-text', '<span style="color:#BB0000;font-weight:bold">Once you enter a miniboss challenge, you cannot exit!</span>'],
                ['display-text', '<span style="color:#60C0F0;font-weight:bold">These challenges are not required to progress</span>'],
                ['challenges', [2]],
            ],
            unlocked() { return hasChallenge('b', 11); },
            buttonStyle: { 'border-color': '#BB0000' },
        },
        'Relics': {
            content: [
                ['display-text', '<span style="color:#60C0F0;font-weight:bold">These challenges are not required to progress</span>'],
                ['challenges', []],
            ],
            unlocked() { return hasChallenge('b', 12); },
            buttonStyle: { 'border-color': '#60C0F0' },
        },
    },
    challenges: {
        11: {
            name: 'The Slime King',
            challengeDescription: `You've killed a thousand slimes and must now endure the Slime King's wrath.<br>\
            Fortunately, a new layer will be unlocked just for you<br><br>\
            Slime health is multiplied by 100`,
            goalDescription: `Let's see you try to kill a thousand slimes now`,
            canComplete() { return player.xp.kills.gte(1000) && player.xp.type == 'slime'; },
            rewardDescription() {
                if (!hasChallenge(this.layer, this.id)) {
                    return 'As if you could beat the Slime King';
                }
                return `The Slime King, defeated, leaves only a map on the floor.<br>\
                Keep the Ore layer and... Are these skeletons?`;
            },
            onEnter() { layerDataReset('lo', ['shown']); },
            onExit() { rowReset(layers[this.layer].row, this.layer); },
            onComplete() { layerDataReset('lo', ['shown']); },
            buttonStyle() { if (inChallenge(this.layer, this.id)) return { 'display': 'none' }; },
        },
        12: {
            name: 'The Lich CEO',
            challengeDescription: `You've killed ${formatWhole(2_500)} skeletons.\
            Did you think skeletons are free? They're not. You're in debt now.<br>\
            The Lich CEO opens a shop though, maybe there's something useful in there.<br><br>\
            Your debt make you lose 1% of your previous layers' currencies and items every second`,
            goalDescription: `Pay off your debts.`,
            canComplete() { return hasUpgrade('s', 41); },
            rewardDescription() {
                if (!hasChallenge(this.layer, this.id)) {
                    return `You're too poor to see the reward`;
                }
                return `The Lich CEO admits you're a better business partner than enemy.<br>\
                The Shop doesn't close and get a ship to fight the Lich CEO's sworn enemies.`;
            },
            onEnter() { layerDataReset('lo', ['shown']); layerDataReset('s'); },
            onExit() { rowReset(layers[this.layer].row, this.layer); },
            onComplete() { layerDataReset('lo', ['shown']); },
            unlocked() { return player.b.best.gte(2); },
            buttonStyle() { if (inChallenge(this.layer, this.id)) return { 'display': 'none' }; },
        },
        21: {
            name: 'The Slime Queen',
            challengeDescription() {
                return `Stuck in ${layerColor('b', 'The Slime King')}, but all other layers are disabled.<br>\
                You can only kill slimes.`;
            },
            goalDescription: 'Kill a thousand slimes',
            canComplete() { return player.xp.kills.gte(1000); },
            rewardDescription: 'Autobuy and unlock more XP upgrades, and double slime drops',
            countsAs: [11],
            onEnter() { layerDataReset('xp', ['ignore_type_warning']); },
            onExit() { rowReset(layers[this.layer].row, this.layer); },
            buttonStyle() {
                const style = {
                    'background-color': '#BB0000',
                };
                if (inChallenge(this.layer, this.id)) style['display'] = 'none';
                return style;
            },
        },
    },
    update(diff) {
        if (inChallenge('b', 12)) {
            if (!hasUpgrade('s', 11) && player.xp.points.gte(100)) {
                // XP
                const xp_loss = player.xp.points.div(100).floor().times(diff);
                player.xp.points = player.xp.points.minus(xp_loss).max(0);
            }
            if (!hasUpgrade('s', 12) && player.xp.kills.gte(100)) {
                // Kills
                const kill_loss = player.xp.kills.div(100).floor().times(diff);
                player.xp.kills = player.xp.kills.minus(kill_loss).max(0);
            }
            if (!hasUpgrade('s', 13) && player.l.points.gte(100)) {
                // Levels (I feel like this will bite me in the butt in the future)
                const level_loss = player.l.points.div(100).floor().times(diff);
                player.l.points = player.l.points.minus(level_loss).max(0);
            }
            // Items
            Object.entries(player.lo.items).forEach(/**@param {[string, Decimal]}*/([item, amount]) => {
                if (player.lo.items[item].lt(100) || tmp.lo.items[item].debtFree) return;
                let item_loss = amount.div(100).floor().times(diff);
                player.lo.items[item] = player.lo.items[item].minus(item_loss).max(0);
            });
        }
    },
    automate() {
        if (player.b.auto_enter && !player.b.activeChallenge) {
            // Auto start bosses because
            if (player.b.points.lte(1) && !inChallenge(this.layer, 11) && !hasChallenge(this.layer, 11)) {
                startChallenge(this.layer, 11);
            } else if (player.b.points.lte(2) && !inChallenge(this.layer, 12) && !hasChallenge(this.layer, 12)) {
                startChallenge(this.layer, 12);
            }
        }
    },
    type: 'custom',
    baseAmount() { return player.xp.kills; },
    getResetGain() {
        if (player.b.points.lt(1) && player.xp.kills.gte(1e3)) return D.dOne;
        if (player.b.points.lt(2) && player.xp.type == 'skeleton' && player.xp.kills.gte(2.5e3)) return D.dOne;
        return D.dZero;
    },
    getNextAt(canMax = false) {
        if (player.b.points.lt(1)) return D(1e3);
        if (player.b.points.lt(2) && player.xp.type == 'skeleton') return D(2.5e3);
        return D.dInf;
    },
    canReset() { return tmp.b.getResetGain.gte(1); },
    prestigeNotify() { return tmp.b.getResetGain.gte(1); },
    prestigeButtonText() {
        const nextAt = tmp.b.getNextAt;
        if (!isFinite(nextAt.mag) || !isFinite(nextAt.sign) || !isFinite(nextAt.layer)) {
            if (player.b.points.lt(2) && player.xp.type != 'skeleton') return `Kill skeletons for the next boss`;
            return 'There are no more bosses to unlock';
        }
        return `You will fight your next boss at ${format(nextAt)} kills`;
    },
    doReset(layer) {
        // Ensures that it still acts like a row 3 layer
        if (layers[layer].row <= this.row) return;

        let keep = ['shown', 'activeChallenge'];

        layerDataReset(this.layer, keep);
    },
    roundUpCost: true,
    autoPrestige: true,
    symbol: 'B',
    branches: ['l', () => { if (inChallenge('b', 21)) return 'xp' }],
});
