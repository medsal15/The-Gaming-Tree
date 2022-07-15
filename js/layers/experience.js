addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            unlockedUpgrades: [],
            level: new Decimal(0),
            health: new Decimal(10),
            kills: new Decimal(0),
        };
    },
    tooltip() {
        return `${formatWhole(player.xp.points)} experience<br>${formatWhole(player.xp.kills)} kills`;
    },
    color: '#7FBF7F',
    row: 0,
    resource: 'experience',
    hotkeys: [
        {
            key: 'ArrowLeft',
            description: '←: Move to previous tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + tabs.length - 1) % tabs.length];
            },
        },
        {
            key: 'ArrowRight',
            description: '→: Move to next tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + 1) % tabs.length];
            },
        },
        {
            key: 'X',
            description: 'Shift + X: Display experience points layer',
            unlocked() {
                return player.xp.unlocked;
            },
            onPress() {
                if (player.xp.unlocked) showTab('xp');
            },
        },
    ],
    tabFormat: {
        'Enemy': {
            content: [
                [
                    'display-text',
                    () => `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} experience
                    and <span style="color:#9F9F5F;font-size:1.5em;">${format(player.xp.kills, 0)}</span> kills`,
                ],
                'blank',
                ['bar', 'health'],
                ['display-text', () => {
                    let text = '';
                    if (options.colorLevels) {
                        text = layers.xp.enemyColor();
                    } else {
                        text = `Level ${formatWhole(player.xp.level)}`;
                    }
                    return `${text} slime`
                }],
                ['clickables', [1]],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} experience
                    and <span style="color:#9F9F5F;font-size:1.5em;">${format(player.xp.kills, 0)}</span> kills`,
                ],
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
            shouldNotify() { return canAffordLayerUpgrade('xp'); },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/gladius.svg')`, },
            canClick() { return player.xp.health.gt(0); },
            onClick() { player.xp.health = player.xp.health.minus(tmp.xp.clickDamage); },
            onHold() { player.xp.health = player.xp.health.minus(tmp.xp.clickDamage.div(10)); },
        },
    },
    upgrades: {
        11: {
            title: 'Sharper sword',
            description: 'Double damage',
            effect() { return new Decimal(2); },
            unlocked() { return player.xp.kills.gte(5); },
            cost: new Decimal(5),
        },
        12: {
            title: 'Stronger monsters',
            description: 'Adds 10 to enemy health, but gain 50% more experience',
            effect() { return { bonus_health: new Decimal(10), xp_multiplier: new Decimal(1.5) }; },
            unlocked() { return player.xp.kills.gte(10); },
            cost: new Decimal(10),
            onPurchase() {
                player.xp.health = player.xp.health.add(10);
            }
        },
        13: {
            title: 'High quality enemy drops',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost experience gain';
                }

                let formula = '4√(kills + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.kills.add(1).root(4); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(20); },
            cost: new Decimal(20),
        },
        21: {
            title: 'Life drain',
            description() {
                if (!shiftDown) {
                    return 'Enemy health boosts base damage';
                }

                let formula = 'health / 20';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.health.max(0).div(20); },
            effectDisplay() { return `+${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(30); },
            cost: new Decimal(100),
        },
        22: {
            title: 'Sword trap',
            description: 'Passively deal 5% of your damage every second',
            unlocked() { return player.xp.kills.gte(50); },
            cost: new Decimal(200),
        },
        23: {
            title: 'Bloody sword',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost damage';
                }

                let formula = 'log4(kills + 4)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.kills.add(4).log(4); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(70); },
            cost: new Decimal(300),
        },
        31: {
            title: 'Second roll',
            description() {
                if (!shiftDown) {
                    return 'Enemy max health boosts XP gain';
                }

                let formula = 'log2(max health/100 + 2)';

                return `Formula: ${formula}`;
            },
            effect() { return tmp.xp.enemyHealth.max(0).add(4).log(4); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(90); },
            cost: new Decimal(500),
        },
        32: {
            title: 'Kiting',
            description() {
                if (!shiftDown) {
                    return 'XP boosts damage';
                }

                let formula = 'log10(XP + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.points.max(0).add(10).log(10); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(125); },
            cost: new Decimal(1_500),
        },
        33: {
            title: 'Level up',
            description() {
                if (!shiftDown) {
                    return `Damage multiplies itself, double enemy health, unlock levels (coming soon)`;
                }

                let formula = 'log10(damage + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return tmp.xp.clickDamage.max(0).add(10).log(10); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(160); },
            cost: new Decimal(4_000),
        },
    },
    /** @param {number} diff */
    update(diff) {
        if (hasUpgrade('xp', 22)) {
            let damage = tmp.xp.clickDamage.times(.05).times(diff);

            player.xp.health = player.xp.health.minus(damage);
        }
    },
    automate() {
        if (player.xp.health.lte(0)) {
            player.xp.points = player.xp.points.add(tmp.xp.enemyExperience);

            player.xp.kills = player.xp.kills.add(1);
            player.xp.level = player.xp.kills.div(10).root(2).floor();
            player.xp.health = layers.xp.enemyHealth();
        }
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp.enemyHealth;
                return player.xp.health.div(max);
            },
            display() { return `${format(player.xp.health)} / ${format(tmp.xp.enemyHealth)}`; },
            baseStyle: { 'background-color': 'red' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
        },
    },
    type: 'none',
    enemyColor() {
        /** @type {number} */
        let l = player.xp.level.toNumber();
        if (isNaN(l)) {
            return `Level ${player.xp.level}`;
        } else if (!isFinite(l)) {
            return 'Rainbow';
        }

        const colors = ['black', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'white'];

        let color = [];
        do {
            const c = l % colors.length;

            l -= c;
            color.push(colors[c]);
        } while (l > 0);

        let c = color.join(' ');
        return c.replace(/^(.)/, s => s.toUpperCase());
    },
    enemyHealth() {
        let base = new Decimal(2).pow(player.xp.level).times(10);

        if (hasUpgrade('xp', 12)) base = base.add(upgradeEffect('xp', 12).bonus_health);

        return base;
    },
    enemyExperience() {
        /** @type {Decimal} */
        let xp_gain = player.xp.level.add(1);

        if (hasUpgrade('xp', 12)) xp_gain = xp_gain.times(upgradeEffect('xp', 12).xp_multiplier);
        if (hasUpgrade('xp', 13)) xp_gain = xp_gain.times(upgradeEffect('xp', 13));
        if (hasUpgrade('xp', 31)) xp_gain = xp_gain.times(upgradeEffect('xp', 31));

        return xp_gain;
    },
    clickDamage() {
        let damage = new Decimal(1);

        if (hasUpgrade('xp', 21)) damage = damage.add(upgradeEffect('xp', 21));

        if (hasUpgrade('xp', 11)) damage = damage.times(upgradeEffect('xp', 11));
        if (hasUpgrade('xp', 32)) damage = damage.times(upgradeEffect('xp', 32));
        if (hasUpgrade('xp', 33)) damage = damage.times(upgradeEffect('xp', 33));

        return damage;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = ['unlockedUpgrades'];

        layerDataReset(this.layer, keep);
    },
});
