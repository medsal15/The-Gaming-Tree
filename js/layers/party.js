addLayer('p', {
    name: 'Party Members',
    symbol: 'PM',
    startData() {
        return {
            points: new Decimal(0),
            unlockedUpgrades: [11],
            unlockedCols: 1,
            unlockedRows: 1,
            unlocked: false,
        };
    },
    layerShown() {
        return hasUpgrade('l', 33);
    },
    color: '#8FCE00',
    row: 2,
    position: 2,
    resource: 'party members',
    hotkeys: [
        {
            key: 'p',
            description: 'P: Reset for monsters',
            unlocked() {
                return player.p.unlocked;
            },
            onPress() {
                if (player.p.unlocked) doReset('p');
            },
        },
        {
            key: 'P',
            description: 'Shift + P: Display monsters layer',
            unlocked() {
                return player.p.unlocked;
            },
            onPress() {
                if (player.p.unlocked) showTab('p');
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
        'Members': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                //???
            ],
        },
    },
    upgrades: {
        //todo
        //todo XP buyable
        //todo Coin buyable
    },
    grid: {
        //todo tokens
    },
    type: 'static',
    baseResource: 'levels',
    baseAmount() {
        return player.l.points;
    },
    gainMult() {
        let div = new Decimal(1);

        // LB layer
        div = div.div(buyableEffect('lb', 23));

        return div;
    },
    requires: new Decimal('80'),
    exponent: new Decimal(1.1),
    base: new Decimal(2),
    roundUpCost: true,
    branches: ['l'],
    treasures: [
        103, 106, 109,
    ],
});
