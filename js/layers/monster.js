addLayer('m', {
    name: 'Monsters',
    symbol: 'M',
    startData() {
        return {
            points: new Decimal(0),
            unlockedUpgrades: [11],
            unlockedChallenges: [],
            unlocked: false,
        };
    },
    layerShown() {
        return hasUpgrade('c', 33);
    },
    color: '#A30000',
    row: 2,
    position: 0,
    resource: 'monster',
    hotkeys: [
        {
            key: 'm',
            description: 'M: Reset for monsters',
            unlocked() {
                return player.m.unlocked;
            },
            onPress() {
                if (player.m.unlocked) doReset('m');
            },
        },
        {
            key: 'M',
            description: 'Shift + M: Display monsters layer',
            unlocked() {
                return player.m.unlocked;
            },
            onPress() {
                if (player.m.unlocked) showTab('m');
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
        'Champions': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'challenges',
            ],
            shouldNotify() {
                return canCompleteLayerChallenge('m');
            },
            glowColor: '#FFA500',
        },
    },
    upgrades: {
        //todo
        //todo XP buyable
        //todo Coin buyable
    },
    challenges: {
        11: {
            name: 'Healthy',
            challengeDescription() {
                if (!shiftDown) {
                    let root = new Decimal(1).div(new Decimal(2).pow(new Decimal(challengeCompletions(this.layer, this.id)).add(1)));

                    return `Reset XP, L and C<br>Point gain is ^${formatWhole(root)}`;
                }

                let formula = '2^(completions + 1)';

                return formula;
            },
            goalDescription() {
                if (!shiftDown) {
                    let target = new Decimal(10).pow(challengeCompletions(this.layer, this.id)).times(new Decimal('1e40'));

                    return `Reach ${format(target)}`;
                }

                let formula = '1e40 * 10^completions points';

                return formula;
            },
            rewardDescription: 'Increases point gain',
            rewardEffect() {
                let effect = new Decimal(1.1).pow(challengeCompletions(this.layer, this.id));

                return effect;
            },
            rewardDisplay() {
                if (!shiftDown) {
                    return `*${format(this.rewardEffect())}`;
                }

                let formula = '1.1^completions';

                return formula;
            },
            canComplete() {
                let target = new Decimal(10).pow(challengeCompletions(this.layer, this.id)).times(new Decimal('1e40'));

                return player.points.gte(target);
            },
            unlocked() {
                return player[this.layer].unlockedChallenges.includes(+this.id);
            },
            onEnter() {
                layerDataReset('xp');
                layerDataReset('l');
                layerDataReset('c');
            },
            completionLimit() {
                return 1;
            },
        },
        12: {
            name: 'Poisonous',
            challengeDescription() {
                if (!shiftDown) {
                    let loss = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(99);

                    return `Reset XP, L and C<br>Lose ${formatWhole(loss)}% of your XP and Coins each second`;
                }

                let formula = 'min(99, completions+1)';

                return formula;
            },
            goalDescription() {
                if (!shiftDown) {
                    let target = new Decimal(10).pow(challengeCompletions(this.layer, this.id)).times(new Decimal('1e40'));

                    return `Reach ${format(target)}`;
                }

                let formula = '1e40 * 10^completions points';

                return formula;
            },
            rewardDescription: 'Increases xp, coin and level gain',
            rewardEffect() {
                let effect = new Decimal(1.1).pow(challengeCompletions(this.layer, this.id));

                return effect;
            },
            rewardDisplay() {
                if (!shiftDown) {
                    return `*${format(this.rewardEffect())}`;
                }

                let formula = '1.1^completions';

                return formula;
            },
            unlocked() {
                return player[this.layer].unlockedChallenges.includes(+this.id);
            },
            onEnter() {
                layerDataReset('xp');
                layerDataReset('l');
                layerDataReset('c');
            },
            completionLimit() {
                return 10;
            },
        },
        //todo forgetful: less xp
        //todo reducer: less l
        //todo broke: less c
    },
    update(diff) {
        if (inChallenge(this.layer, 12)) {
            // Drain
            let drain = new Decimal(challengeCompletions(this.layer, 12)).add(1).min(99);

            player.xp.points = player.xp.points.minus(player.xp.points.times(drain).times(diff));
            player.c.points = player.c.points.minus(player.c.points.times(drain).times(diff));
            player.l.points = player.l.points.minus(player.l.points.times(drain).times(diff)).floor();
        }
    },
    type: 'static',
    baseResource: 'points',
    baseAmount() {
        return player.points;
    },
    requires: new Decimal('1e40'),
    exponent: new Decimal(3),
    base: new Decimal(3),
    roundUpCost: true,
    branches: ['c'],
});
