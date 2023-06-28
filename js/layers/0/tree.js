'use strict';

//todo upgrades
//todo convertion
addLayer('t', {
    name: 'Tree',
    symbol: 'T',
    /** @returns {typeof player.t} */
    startData() {
        return {
            unlocked: false,
            short_mode: false,
            last_drops: [],
            trees: Object.fromEntries(layers.t.trees.all_trees.map(item => [item, { amount: D.dZero }])),
            current: false,
            health: D.dZero,
            convert: false,
        };
    },
    tooltip() {
        if (player.t.short_mode) {
            const style = item => {
                const color = tmp.lo.items[item].style['background-color'];
                return `<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(player.lo.items[item].amount)}</span>`;
            };

            return tmp.t.trees.items.map?.(style).join(', ');
        } else {
            const line = item => `${formatWhole(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`;

            return tmp.t.trees.items.map?.(line).join('<br>');
        }
    },
    layerShown() { return player[this.layer].unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#CC7700',
    row: 0,
    position: 2,
    resource: 'wood',
    hotkeys: [
        {
            key: 'T',
            description: 'Shift + T: Display tree layer',
            unlocked() { return player.t.unlocked; },
            onPress() { showTab('t'); },
        },
    ],
    tabFormat: {
        'Forest': {
            content: [
                () => {
                    const speed = layers.clo.time_speed('t');

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'];
                        return `<span style="color:${color};text-shadow:${color} 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items[item].amount)}</span> ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(tmp.t.trees.items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['t', 'short_mode']]
                ]],
                () => hasUpgrade('t', 12) ? ['row', [
                    ['display-text', 'Convert wood'],
                    'blank',
                    ['toggle', ['t', 'convert']],
                ]] : undefined,
                'blank',
                ['bar', 'health'],
                ['clickables', [1]],
                ['display-text', () => `Current damage: ${format(tmp.t.trees.damage)}`],
                ['display-text', () => `Chance to cut an additionnal piece of wood: ${layers.lo.items["*"].format_chance(tmp.t.trees.chance)}`],
                ['display-text', () => {
                    let drops = 'nothing';

                    const last_drops = player.t.last_drops;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));

                    return `Cut ${drops}`;
                }],
                'blank',
                ['display-text', () => {
                    /** @param {string} tree */
                    const row = tree => {
                        const regen = layers.t.trees.regen(tree);
                        return `<tr>\
                            <td>${capitalize(layers.t.trees.name(tree))}</td>\
                            <td>${format(player.t.trees[tree].amount)} / ${format(layers.t.trees.cap(tree))} ${regen.gt(0) ? `(+${format(regen)}/s)` : ''}</td>\
                            <td>${format(layers.t.trees.size(tree))}</td>\
                        </tr>`;
                    };

                    return `<table class="layer-table" style="--color:${tmp.t.color}">\
                        <tr>\
                            <td>Tree</td>\
                            <td>Amount</td>\
                            <td>Size</td>\
                        </tr>\
                        ${tmp.t.trees.trees.map(row).join('')}\
                    </table>`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'];
                        return `<span style="color:${color};text-shadow:${color} 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items[item].amount)}</span> ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(tmp.t.trees.items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('t')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/wood-axe.svg')`, },
            canClick() { return player.t.current && D.gt(player.t.health, 0); },
            onClick() {
                const damage = tmp.t.trees.damage.min(player.t.health),
                    type = player.t.current;
                if (!type) return;
                player.t.health = player.t.health.minus(damage).max(0);

                if (options.noRNG) {
                    const drops = player.t.last_drops = layers.t.trees.get_drops(type, damage.times(tmp.t.trees.chance));
                    layers.lo.items["*"].gain_drops(drops);
                } else if (tmp.t.trees.chance.gt(Math.random())) {
                    const drops = player.t.last_drops = layers.t.trees.get_drops(type, damage);
                    layers.lo.items["*"].gain_drops(drops);
                } else {
                    player.t.last_drops = [];
                }
            },
            onHold() {
                const damage = tmp.t.trees.damage.min(player.t.health),
                    type = player.t.current;
                if (!type) return;
                player.t.health = player.t.health.minus(damage).max(0);

                if (options.noRNG) {
                    const drops = player.t.last_drops = layers.t.trees.get_drops(type, damage.times(tmp.t.trees.chance));
                    layers.lo.items["*"].gain_drops(drops);
                } else if (tmp.t.trees.chance.gt(Math.random())) {
                    const drops = player.t.last_drops = layers.t.trees.get_drops(type, damage);
                    layers.lo.items["*"].gain_drops(drops);
                } else {
                    player.t.last_drops = [];
                }
            },
        },
    },
    /** @type {typeof layers.t.upgrades} */
    upgrades: {
        11: {
            title: 'Soaked Axe',
            description: 'Double tree health,<br>+50% tree size',
            effect() {
                return {
                    health: D.dTwo,
                    size: D(1.5),
                };
            },
            effectDisplay() {
                /** @type {{health: Decimal, size: Decimal}} */
                const effect = this.effect();
                return `*${format(effect.health)} tree health, *${format(effect.size)} tree size`;
            },
            cost: D(10),
            item: 'soaked_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        12: {
            title: 'Sawmill',
            description: 'Convert 1% of your logs into planks',
            effect() { return D(.01); },
            effectDisplay() { return `${this.effect().times(100)}%`; },
            cost: D(20),
            item: 'normal_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        13: {
            title: 'Wood Chips',
            description: 'Double tree growth speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(this.effect())}`; },
            cost: D(30),
            item: 'plank',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.t.trees.health;
                if (max.lte(0)) return 0;
                return D.div(player.t.health ?? max, max);
            },
            display() {
                return `${capitalize(tmp.t.trees.name)}<br>\
                ${format(player.t.health)} / ${format(tmp.t.trees.health)}`;
            },
            baseStyle: { 'background-color': 'brown' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
        },
    },
    /** @type {typeof layers.t.trees} */
    trees: {
        items: ['soaked_log', 'normal_log', 'plank'],
        trees() {
            const trees = ['driftwood', 'oak', 'birch'];

            return trees;
        },
        all_trees: ['driftwood', 'oak', 'birch'],
        health(type = player.t.current) {
            if (!type) return D.dZero;

            let health = D.dZero;
            switch (type) {
                case 'driftwood': health = D(5); break;
                case 'oak': health = D(15); break;
                case 'birch': health = D(10); break;
            }

            if (hasUpgrade('t', 11)) health = health.times(upgradeEffect('t', 11).health);

            return health;
        },
        chance(type = player.t.current) {
            if (!type) return D.dZero;

            let chance = D(1 / 10);

            return chance;
        },
        name(type = player.t.current) {
            switch (type) {
                default: case false: return 'none';
                case 'driftwood': return 'driftwood';
                case 'oak': return 'oak';
                case 'birch': return 'birch';
                case 'convertion': return 'convertion';
            }
        },
        regen(type = player.t.current) {
            if (!(type in player.t.trees) || player.t.trees[type].amount.gte(layers.t.trees.cap(type))) return D.dZero;

            let regen = D.dZero;
            switch (type) {
                default: return D.dZero;
                case 'driftwood':
                    regen = D(1 / 20);
                    break;
                case 'oak':
                    regen = player.t.trees.oak.amount.add(1).root(2).div(50);
                    break;
                case 'birch':
                    regen = player.t.trees.birch.amount.add(1).root(2).div(35);
                    break;
            }

            if (hasUpgrade('t', 13)) regen = regen.times(upgradeEffect('t', 13));

            return regen;
        },
        damage(type = player.t.current) {
            let damage = D.dOne;

            if (hasUpgrade('m', 62)) damage = damage.add(upgradeEffect('m', 62));

            damage = damage.add(buyableEffect('lo', 42).tree_damage);

            if (hasUpgrade('m', 51)) damage = damage.times(upgradeEffect('m', 51));

            return damage;
        },
        get_drops(type = player.t.current, amount = 1) {
            const drops = layers.lo.items["*"].get_drops(`tree:${type}`, D(amount));

            return drops;
        },
        size(type = player.t.current) {
            let size = D.dZero;
            switch (type) {
                case 'driftwood':
                    size = D(5);
                    break;
                case 'oak':
                    size = D(20);
                    break;
                case 'birch':
                    size = D(10);
                    break;
            }

            if (hasUpgrade('t', 11)) size = size.times(upgradeEffect('t', 11).size);

            return size;
        },
        random() {
            if (!Object.values(player.t.trees).some(({ amount }) => amount.gte(1))) return false;

            const trees = Object.entries(player.t.trees).filter(([, { amount }]) => amount.gte(1)),
                sum = trees.reduce((sum, [, { amount }]) => sum.add(amount), D.dZero);
            if (!trees.length) return false;

            let choice = sum.times(Math.random()),
                i = 0;
            while (choice.gt(0) && i < trees.length - 1) {
                const [, w] = trees[i];
                choice = choice.minus(w);
                i++;
            }

            return trees[i][0];
        },
        logs() {
            return this.items.filter(item => /log$/.test(item))
                .map(item => player.lo.items[item].amount)
                .reduce(D.add, D.dZero);
        },
        cap(type = false) {
            let cap = D.dZero;

            switch (type) {
                case 'driftwood': cap = D.dOne; break;
                case 'oak': cap = D(100); break;
                case 'birch': cap = D(100); break;
            }

            return cap;
        },
    },
    /** @type {typeof layers.t.convertion} */
    convertion: {
        from: ['soaked_log', 'normal_log'],
        rate(item) {
            if (!item || !this.from.includes(item)) return D.dZero;

            let percent = D.dZero;

            if (hasUpgrade('t', 12)) percent = percent.add(upgradeEffect('t', 12));

            let amount = player.lo.items[item].amount;

            return amount.times(percent);
        },
        efficiency(item) {
            if (!item || !this.from.includes(item)) return D.dZero;

            let efficiency = D.dZero;

            switch (item) {
                case 'soaked_log': efficiency = D.dOne; break;
                case 'normal_log': efficiency = D(5); break;
            }

            return efficiency;
        },
        per_second(item = 'plank') {
            if (item == 'plank') {
                return this.from.map(item => this.rate(item).times(this.efficiency(item))).reduce(D.add, 0);
            }

            if (!this.from.includes(item)) return D.dZero;

            return layers.t.convertion.rate(item).neg();
        },
    },
    /** @this {typeof layers.t} */
    update(diff) {
        if (!player.t.unlocked || !tmp.t.layerShown) return;

        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed('t'));

        // Grow trees
        tmp.t.trees.trees.forEach(tree => {
            const regen = layers.t.trees.regen(tree).times(diff);
            if (regen.eq(0)) return;

            player.t.trees[tree].amount = player.t.trees[tree].amount.add(regen);
        });

        // Convert logs to planks
        if (player.t.convert && tmp.t.convertion.per_second.gt(0)) {
            ['plank', ...layers.t.convertion.from].forEach(item => {
                const gain = layers.t.convertion.per_second(item);
                if (gain.eq(0)) return;

                player.lo.items[item].amount = player.lo.items[item].amount.add(gain.times(diff));
            });
        }
    },
    automate() {
        if (player.t.health.lte(0)) {
            // Tree is dead
            const type = player.t.current,
                drops = layers.t.trees.get_drops(type, layers.t.trees.size(type));

            player.t.last_drops.push(...drops);
            layers.lo.items['*'].gain_drops(drops);

            player.t.current = false;
        }

        if (!player.t.current && Object.values(player.t.trees).some(({ amount }) => amount.gte(1))) {
            // No tree and there is one available
            const trees = Object.entries(player.t.trees)
                .filter(([, { amount }]) => amount.gte(1))
                .map(([tree]) => tree),
                tree = trees[Math.floor(Math.random() * trees.length)];

            player.t.trees[tree].amount = player.t.trees[tree].amount.minus(1);
            player.t.health = layers.t.trees.health(tree);
            player.t.current = tree;
        }
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['convert'];

        layerDataReset(this.layer, keep);
        layers.t.trees.items.forEach(item => player.lo.items[item].amount = D.dZero);
    },
    branches: [() => false && player.f.unlocked ? 'f' : 'lo'],
});
