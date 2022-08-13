addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            level: new Decimal(0),
            health: new Decimal(10),
            kills: new Decimal(0),
            last_drops: [],
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
            unlocked() { return player.xp.unlocked; },
            onPress() { if (player.xp.unlocked) showTab('xp'); },
        },
    ],
    tabFormat: {
        'Enemy': {
            content: [
                [
                    'display-text',
                    () => `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} experience
                    and <span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${format(player.xp.kills, 0)}</span> kills`,
                ],
                'blank',
                ['bar', 'health'],
                ['display-text', () => {
                    let text = '';
                    if (options.colorLevels && false) {
                        // Buggy
                        text = layers.xp.enemyColor();
                    } else {
                        text = `Level ${formatWhole(player.xp.level)}`;
                    }
                    return `${text} slime`
                }],
                ['clickables', [1]],
                ['display-text', () => `Current damage: ${format(tmp.xp.clickDamage)}`],
                'blank',
                ['display-text', () => {
                    if (!hasUpgrade('lo', 11) || player.xp.kills.lte(0)) return;

                    let text = 'Enemy dropped ';
                    if (!player.xp.last_drops.length) text += 'nothing';
                    else text += player.xp.last_drops.map/**@param {[string, Decimal]}*/(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`).join(', ');

                    return text;
                }],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => `You have ${layerColor('xp', format(player.xp.points, 0), 'font-size:1.5em;')} experience
                    and <span style="color:#9F9F5F;text-shadow:#9F9F5F 0 0 10px;font-size:1.5em;">${format(player.xp.kills, 0)}</span> kills`,
                ],
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('xp')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return player.xp.health.gt(0); },
            onClick() { player.xp.health = player.xp.health.minus(tmp.xp.clickDamage); },
            onHold() { player.xp.health = player.xp.health.minus(tmp.xp.clickDamage.div(5)); },
        },
    },
    upgrades: {
        11: {
            title: 'Sharper sword',
            description: 'Double damage',
            effect() { return new Decimal(2); },
            unlocked() { return player.xp.kills.gte(5) || player.l.unlocked || player.lo.shown; },
            cost: new Decimal(5),
        },
        12: {
            title: 'Stronger monsters',
            description: 'Adds 10 to enemy health, but gain 50% more experience',
            effect() { return { bonus_health: new Decimal(10), xp_multiplier: new Decimal(1.5) }; },
            unlocked() { return player.xp.kills.gte(10) || player.l.unlocked || player.lo.shown; },
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
            unlocked() { return player.xp.kills.gte(20) || player.l.unlocked || player.lo.shown; },
            cost: new Decimal(20),
        },
        21: {
            title: 'Life drain',
            description() {
                if (!shiftDown) {
                    return 'Enemy health boosts base damage';
                }

                let formula = '2√(health / 20)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.health.max(0).div(20).root(2); },
            effectDisplay() { return `+${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(30) || player.l.unlocked || player.lo.shown; },
            cost: new Decimal(100),
        },
        22: {
            title: 'Sword trap',
            description() { return `Passively deal ${this.effect().times(100)}% of your damage every second`; },
            unlocked() { return player.xp.kills.gte(50) || player.l.unlocked || player.lo.shown; },
            effect() {
                let base = new Decimal(.1);

                base = base.add(tmp.l.skills.trapping.effect);

                return base;
            },
            effectDisplay() { return `${format(tmp.xp.clickDamage.times(this.effect()))} passive damage per second`; },
            cost: new Decimal(200),
        },
        23: {
            title: 'Bloody sword',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost damage';
                }

                let formula = 'log8(kills + 8)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.kills.add(8).log(8); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(70) || player.l.unlocked || player.lo.shown; },
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
            unlocked() { return player.xp.kills.gte(90) || player.l.unlocked || player.lo.shown; },
            cost: new Decimal(500),
        },
        32: {
            title: 'Kiting',
            description() {
                if (!shiftDown) {
                    return 'XP boosts damage';
                }

                let formula = 'log100(XP + 100)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.points.max(0).add(100).log(100); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(125) || player.l.unlocked || player.lo.shown; },
            cost: new Decimal(1_500),
        },
        33: {
            title: 'Level up',
            description() {
                if (!shiftDown) {
                    return `Damage multiplies itself, double enemy health, unlock levels and loot`;
                }

                let formula = 'log25(damage + 25)';

                return `Formula: ${formula}`;
            },
            effect() { return tmp.xp.clickDamage.max(0).add(25).log(25); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(160) || player.l.unlocked || player.lo.shown; },
            cost: new Decimal(4_000),
        },
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
    /** @param {number} diff */
    update(diff) {
        let passive_damage = Decimal.dZero;

        if (hasUpgrade('xp', 22)) passive_damage = passive_damage.add(tmp.xp.clickDamage.times(upgradeEffect('xp', 22)));

        if (passive_damage.gt(0)) {
            /** @type {Decimal} */
            let damage = tmp.xp.clickDamage.times(passive_damage).times(diff);

            if (damage.gte(player.xp.health)) player.xp.health = Decimal.dZero;
            else player.xp.health = player.xp.health.minus(damage);
        }
    },
    automate() {
        if (player.xp.health.gt(tmp.xp.enemyHealth)) player.xp.health = tmp.xp.enemyHealth;
        if (player.xp.health.lte(0)) {
            // XP gain
            /** @type {Decimal} */
            let xp_gain = tmp.xp.enemyExperience;

            xp_gain = xp_gain.times(tmp.l.skills.learning.effect);

            // Kills
            let kills_gain = Decimal.dOne;

            // Apply gains
            player.xp.last_drops = layers.lo.items.onKill('slime', player.xp.level, kills_gain);

            player.xp.points = player.xp.points.add(xp_gain);
            player.xp.kills = player.xp.kills.add(kills_gain);

            /** @type {Decimal} */
            let level = player.xp.kills.div(10).root(2);
            level = level.times(tmp.l.skills.evolving.effect);
            player.xp.level = level.floor();

            player.xp.health = layers.xp.enemyHealth();
        }
    },
    type: 'none',
    enemyColor() {
        //todo improve to use Decimals
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

            l = Math.floor(l / colors.length);
            color.push(colors[c]);
        } while (l > 0);

        let c = color.join(' ');
        return c.replace(/^(.)/, s => s.toUpperCase());
    },
    enemyHealth() {
        let base = new Decimal(2).pow(player.xp.level).times(10);

        if (hasUpgrade('xp', 12)) base = base.add(upgradeEffect('xp', 12).bonus_health);

        if (hasUpgrade('xp', 33)) base = base.times(2);

        base = base.div(buyableEffect('lo', 11));

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
        damage = damage.add(buyableEffect('lo', 12));

        if (hasUpgrade('xp', 11)) damage = damage.times(upgradeEffect('xp', 11));
        if (hasUpgrade('xp', 23)) damage = damage.times(upgradeEffect('xp', 23));
        if (hasUpgrade('xp', 32)) damage = damage.times(upgradeEffect('xp', 32));
        if (hasUpgrade('xp', 33)) damage = damage.times(upgradeEffect('xp', 33));

        damage = damage.times(tmp.l.skills.attacking.effect);

        return damage;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        let keep = [];

        layerDataReset(this.layer, keep);
    },
});
