addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            unlocked: true,
            points: D(0),
            level: D(0),
            health: (tmp.xp?.enemyHealth) ?? D(10),
            kills: D(0),
            type: 'slime',
            last_drops: [],
            ignore_type_warning: false,
        };
    },
    tooltip() {
        return `${formatWhole(player.xp.points)} experience<br>${formatWhole(player.xp.kills)} kills`;
    },
    color: '#7FBF7F',
    row: 0,
    position: 0,
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
                    if (options.colorLevels) {
                        text = layers.xp.enemyColor();
                    } else {
                        text = `Level ${formatWhole(player.xp.level)}`;
                    }
                    return `${text} ${player.xp.type}`
                }],
                ['clickables', [1]],
                () => tmp.xp.types.length > 1 ? ['row', [
                    ['display-text', 'Ignore type change warning'],
                    'blank',
                    ['toggle', ['xp', 'ignore_type_warning']],
                ]] : '',
                ['display-text', () => `Current damage: ${format(tmp.xp.clickDamage)}`],
                'blank',
                ['display-text', () => {
                    if (!hasUpgrade('lo', 11) || player.xp.kills.lte(0)) return;

                    let text = 'Enemy dropped ';
                    if (!player.xp.last_drops.length) text += 'nothing';
                    else
                        text += new Intl.ListFormat('en').format(player.xp.last_drops.map/**@param {[string, Decimal]}*/(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));

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
            style: { 'background-image': `url('./resources/images/previous-button.svg')` },
            unlocked() { return tmp.xp.types.length > 1; },
            canClick() { return player.xp.type != tmp.xp.types[0]; },
            onClick() {
                if (!player.xp.ignore_type_warning && !confirm('Are you sure you want to change enemy type?\nThis will reset XP')) return;
                const i = tmp.xp.types.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.types[0];
                else player.xp.type = tmp.xp.types[i - 1];

                layers[this.layer].doReset('xp', true);
            },
        },
        12: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return player.xp.health.gt(0); },
            onClick() { player.xp.health = player.xp.health.minus(tmp.xp.clickDamage); },
            onHold() { player.xp.health = player.xp.health.minus(tmp.xp.clickDamage.div(3)); },
        },
        13: {
            style: { 'background-image': `url('./resources/images/next-button.svg')` },
            unlocked() { return tmp.xp.types.length > 1; },
            canClick() { return player.xp.type != tmp.xp.types[tmp.xp.types.length - 1]; },
            onClick() {
                if (!player.xp.ignore_type_warning && !confirm('Are you sure you want to change enemy type?\nThis will reset XP')) return;
                const i = tmp.xp.types.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.types[0];
                else player.xp.type = tmp.xp.types[i + 1];

                layers[this.layer].doReset('xp', true);
            },
        },
    },
    upgrades: {
        11: {
            title: 'Sharper sword',
            description: 'Double damage',
            effect() { return D(2); },
            unlocked() { return player.xp.kills.gte(5) || player.l.unlocked || player.lo.shown; },
            cost: D(5),
        },
        12: {
            title: 'Stronger monsters',
            description: 'Adds 10 to enemy health, but gain 50% more experience',
            effect() { return { bonus_health: D(10), xp_multiplier: D(1.5) }; },
            unlocked() { return player.xp.kills.gte(10) || player.l.unlocked || player.lo.shown; },
            cost: D(10),
            onPurchase() {
                player.xp.health = player.xp.health.add(10);
            },
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
            effect() { return player.xp.kills.max(0).add(1).root(4); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(20) || player.l.unlocked || player.lo.shown; },
            cost: D(20),
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
            cost: D(100),
        },
        22: {
            title: 'Sword trap',
            description() { return `Passively deal ${formatWhole(this.effect().times(100))}% of your damage every second`; },
            unlocked() { return player.xp.kills.gte(50) || player.l.unlocked || player.lo.shown; },
            effect() {
                let base = D(.25);

                return base;
            },
            effectDisplay() { return `${format(tmp.xp.clickDamage.times(this.effect()))} passive damage per second`; },
            cost: D(200),
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
            effect() { return player.xp.kills.max(0).add(8).log(8); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(70) || player.l.unlocked || player.lo.shown; },
            cost: D(300),
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
            cost: D(500),
        },
        32: {
            title: 'Kiting',
            description() {
                if (!shiftDown) {
                    return 'XP boosts damage';
                }

                let formula = 'log50(XP + 50)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.points.max(0).add(50).log(50); },
            effectDisplay() { return `*${format(tmp[this.layer].upgrades[this.id].effect)}`; },
            unlocked() { return player.xp.kills.gte(125) || player.l.unlocked || player.lo.shown; },
            cost: D(1_500),
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
            cost: D(4_000),
        },
        41: {
            title: 'Double kills',
            description: 'Double kill gain',
            effect() { return D(2); },
            unlocked() { return hasChallenge('b', 21); },
            cost: D(8_000),
        },
        42: {
            title: 'Life stone',
            description() {
                if (!shiftDown) return 'Enemy health boosts ore drops';
                let formula = 'log7(health + 7)';

                return `Formula: ${formula}`;
            },
            effect() { return player.xp.health.add(7).log(7); },
            effectDisplay() { return `*${format(this.effect())}`; },
            unlocked() { return hasChallenge('b', 21); },
            cost: D(80_000),
        },
        43: {
            title: 'Slime crown',
            description() {
                if (!hasChallenge('b', 12)) return 'Looks good on your head.<br>You might want to fight another boss';
                return 'Skeletons can drop slime items, but only at 10% of the rate';
            },
            effect() {
                const active = hasUpgrade(this.layer, this.id) && hasChallenge('b', 12) && player.xp.type == 'skeleton';
                return {
                    active,
                    mult: D(.1),
                };
            },
            unlocked() { return hasChallenge('b', 21); },
            cost: D(8e6),
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
    update(diff) {
        let passive_damage = D.dZero;

        if (hasUpgrade('xp', 22)) passive_damage = passive_damage.add(upgradeEffect('xp', 22));
        passive_damage = passive_damage.add(buyableEffect('lo', 13));

        if (passive_damage.gt(0)) {
            /** @type {Decimal} */
            let damage = tmp.xp.clickDamage.times(passive_damage).times(diff);

            player.xp.health = player.xp.health.minus(damage);
        }
    },
    automate() {
        if (player.xp.health.gt(tmp.xp.enemyHealth)) player.xp.health = tmp.xp.enemyHealth;
        if (player.xp.health.lte(0)) {
            /** @type {Decimal} */
            let xp_gain = tmp.xp.enemyExperience;
            /** @type {Decimal} */
            let kills_gain = tmp.xp.enemyKills;

            // Apply gains
            player.xp.last_drops = layers.lo.items.onKill(player.xp.type, player.xp.level, kills_gain);

            player.xp.points = player.xp.points.add(xp_gain);
            player.xp.total = player.xp.total.add(xp_gain);
            player.xp.best = player.xp.best.max(player.xp.points);
            player.xp.kills = player.xp.kills.add(kills_gain);

            /** @type {Decimal} */
            let level = player.xp.kills.div(10).root(2);
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
        /** @type {Decimal} */
        let health;
        switch (player.xp.type) {
            default:
            case 'slime':
                health = D(2).pow(player.xp.level).times(10);
                break;
            case 'skeleton':
                health = D(3).pow(player.xp.level).times(40);
                break;
            case 'pirate':
                health = D(4).pow(player.xp.level).times(90);
                break;
        }

        if (hasUpgrade('xp', 12)) health = health.add(upgradeEffect('xp', 12).bonus_health);

        if (hasUpgrade('xp', 33)) health = health.times(2);

        if (inChallenge('b', 11) && player.xp.type == 'slime') health = health.times(10);

        return health;
    },
    enemyExperience() {
        /** @type {Decimal} */
        let xp_gain;
        switch (player.xp.type) {
            default:
            case 'slime':
                xp_gain = player.xp.level.add(1);
                break;
            case 'skeleton':
                xp_gain = player.xp.level.add(1).times(3);
                break;
            case 'pirate':
                xp_gain = player.xp.level.add(2).times(4);
                break;
        }

        if (hasUpgrade('xp', 12)) xp_gain = xp_gain.times(upgradeEffect('xp', 12).xp_multiplier);
        if (hasUpgrade('xp', 13)) xp_gain = xp_gain.times(upgradeEffect('xp', 13));
        if (hasUpgrade('xp', 31)) xp_gain = xp_gain.times(upgradeEffect('xp', 31));
        xp_gain = xp_gain.times(tmp.l.skills['learning'].effect.xp_mult);
        if (hasUpgrade('s', 11)) xp_gain = xp_gain.times(upgradeEffect('s', 11));
        if (hasUpgrade('s', 51)) xp_gain = xp_gain.times(upgradeEffect('s', 51));

        return xp_gain.max(1);
    },
    enemyKills() {
        let kills = D.dOne;

        if (hasUpgrade('s', 12)) kills = kills.times(upgradeEffect('s', 12));
        if (hasUpgrade('s', 51)) kills = kills.times(upgradeEffect('s', 51));
        if (hasUpgrade('xp', 41)) kills = kills.times(upgradeEffect('xp', 41));

        return kills.max(1);
    },
    clickDamage() {
        let damage = D(1);

        if (hasUpgrade('xp', 21)) damage = damage.add(upgradeEffect('xp', 21));
        damage = damage.add(buyableEffect('lo', 11));

        if (hasUpgrade('xp', 11)) damage = damage.times(upgradeEffect('xp', 11));
        if (hasUpgrade('xp', 23)) damage = damage.times(upgradeEffect('xp', 23));
        if (hasUpgrade('xp', 32)) damage = damage.times(upgradeEffect('xp', 32));
        if (hasUpgrade('xp', 33)) damage = damage.times(upgradeEffect('xp', 33));
        damage = damage.times(tmp.l.skills['attack'].effect);
        if (hasUpgrade('o', 21)) damage = damage.times(upgradeEffect('o', 21));
        damage = damage.times(buyableEffect('lo', 21));

        return damage.max(1);
    },
    doReset(layer, force = false) {
        if (!force && layers[layer].row <= this.row) return;

        let keep = ['type', 'last_drops', 'ignore_type_warning'];

        /** @type {number[]} */
        let kept_upgrades = [];
        /** @type {Decimal} */
        let kept_amount = buyableEffect('lo', 12).xp_keep;
        if (kept_amount.gt(0)) kept_upgrades = [...player.xp.upgrades];
        if (kept_amount.lt(kept_upgrades.length)) kept_upgrades.length = kept_amount.toNumber();

        layerDataReset(this.layer, keep);

        player.xp.upgrades = [...kept_upgrades];
    },
    types() {
        if (inChallenge('b', 21)) return ['slime'];

        const types = ['slime'];

        if (hasChallenge('b', 11)) types.push('skeleton');
        if (hasChallenge('b', 12)) types.push('pirate');

        return types;
    },
});
