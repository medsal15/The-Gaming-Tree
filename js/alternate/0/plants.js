'use strict';

//todo plant mutations
//todo plant effects
addLayer('p', {
    name: 'Plants',
    symbol: 'P',
    /** @returns {typeof player.p} */
    startData() {
        return {
            unlocked: false,
            mode: 'place',
            plant: '',
            plants: Object.fromEntries(
                Object.keys(layers.p.plants).map(plant => [plant, {
                    seeds: D(plant == 'wheat'), // Wheat starts with 1 seed
                    harvested: D.dZero,
                    dead: D.dZero,
                }])
            ),
        };
    },
    tooltip() { return `${formatWhole(Object.values(player.p.grid).filter(data => data.plant != '').length)} planted plants`; },
    layerShown() { return player[this.layer].unlocked; },
    deactivated() { return inChallenge('b', 31); },
    color: '#88CC00',
    row: 0,
    position: 2.5,
    resource: 'plants',
    hotkeys: [
        {
            key: 'p',
            description: 'P: Display plants layer',
            unlocked() { return player.p.unlocked; },
            onPress() { showTab('p'); },
        },
    ],
    tabFormat: {
        'Garden': {
            content: [
                ['clickables', [1]],
                'blank',
                'grid',
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (Object.keys(layers.p.plants).some(plant => tmp.p.plants[plant].notify)) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
        'Plants': {
            content: [
                ['row', [
                    ['display-text', 'Currently planting (blank for none)'],
                    'blank',
                    ['drop-down', ['plant', () => ['', ...Object.keys(layers.p.plants).filter(plant => plant != '*' && (tmp.p.plants[plant].unlocked ?? true))]]],
                ]],
                'blank',
                ['display-text', () => {
                    /** @param {string} plant */
                    const row = plant_id => {
                        const tmplant = tmp.p.plants[plant_id],
                            produces = tmplant.produces.map(item => `${format(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`);

                        return `<tr>\
                                <td rowspan="2">${capitalize(tmplant.name)}</td>\
                                <td rowspan="2">\
                                    Maturation: ${formatTime(tmplant.maturation)}<br><br>\
                                    Lifespan: ${formatTime(tmplant.ages.at(-1)[1])}\
                                </td>\
                                <td>${format(player.p.plants[plant_id].seeds)} seeds</td>\
                            </tr>\
                            <tr>\
                                <td>${produces.join('<br>')}</td>\
                            </tr>`;
                    };

                    //todo include effects & mutations

                    return `<table class="layer-table" style="--color:${tmp.p.color};">\
                            <tr>\
                                <th>Name</th>\
                                <th>Life</th>\
                                <th>Amount</th>\
                            </tr>\
                            ${Object.keys(layers.p.plants).filter(plant => plant != '*' && (tmp.p.plants[plant].unlocked ?? true)).map(row).join('')}\
                        </table>`;
                }],
            ],
        },
    },
    clickables: {
        11: {
            display: 'Set current mode to planting',
            canClick() { return player.p.mode != 'place'; },
            onClick() { player.p.mode = 'place'; },
        },
        12: {
            display: 'Set current mode to harvesting or destroying',
            canClick() { return player.p.mode != 'harvest'; },
            onClick() { player.p.mode = 'harvest'; },
        },
    },
    /** @type {Layer<'p'>['grid']} */
    grid: {
        cols: 5,
        rows: 5,
        getStartData(_) {
            return {
                plant: '',
                age: D.dZero,
            };
        },
        getCanClick(data, _) {
            switch (player.p.mode) {
                case 'place':
                    return data.plant == '' && player.p.plant != '' && D.gte(player.p.plants[player.p.plant].seeds, 1);
                case 'harvest':
                    return data.plant != '';
            }
        },
        onClick(data, _) {
            switch (player.p.mode) {
                case 'place':
                    if (data.plant == '' && player.p.plant != '' && D.gte(player.p.plants[player.p.plant].seeds, 1)) {
                        data.plant = player.p.plant;
                        data.age = D.dZero;
                        player.p.plants[data.plant].seeds = D.minus(player.p.plants[data.plant].seeds, 1);
                    }
                    return;
                case 'harvest':
                    if (data.plant != '') {
                        // Get items
                        const drops = layers.p.plants[data.plant].produce(data.age),
                            seeds = layers.p.plants[data.plant].seeds(data.age);
                        layers.lo.items['*'].gain_drops(drops);
                        player.p.plants[data.plant].seeds = D.add(player.p.plants[data.plant].seeds, seeds);

                        if (drops.length) player.p.plants[data.plant].harvested = D.add(player.p.plants[data.plant].harvested, 1);

                        // Wipe
                        data.plant = '';
                        data.age = D.dZero;
                    }
                    return;
            }
        },
        getStyle(data, _) {
            if (!(data.plant in layers.p.plants)) return {};

            const plant = tmp.p.plants[data.plant],
                stage = plant.ages.findIndex(([from, to]) => D.gt(data.age, from) && D.lte(data.age, to)),
                image = plant.images[stage];

            return Object.assign(
                {},
                plant.style.general,
                plant.style.grid ?? {},
                {
                    'background-image': `url(${image})`,
                    'background-repeat': 'no-repeat',
                    'background-origin': 'border-box',
                    'background-position': 'center',
                },
            );
        },
        getTooltip(data, _) {
            if (data?.plant in tmp.p.plants) return capitalize(tmp.p.plants[data.plant].name);
            return 'Empty';
        },
    },
    //todo? upgrades
    /** @type {Layers['p']['plants']} */
    plants: {
        '*': {
        },
        wheat: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.p.plants).find(plant => layers.p.plants[plant] == this); },
            name: 'wheat',
            style: {
                general: {
                    'background-color': '#FFDDBB',
                },
            },
            ages: [
                [-1, 2 * 60],
                [2 * 60, 4 * 60],
                [4 * 60, 6 * 60],
                [6 * 60, 8 * 60],
                [8 * 60, 14 * 60], // mature
                [14 * 60, 16 * 60], // wilting
            ],
            maturation: 8 * 60,
            images: [
                'resources/images/plants/wheat/age1.png',
                'resources/images/plants/wheat/age2.png',
                'resources/images/plants/wheat/age3.png',
                'resources/images/plants/wheat/age4.png',
                'resources/images/plants/wheat/age5.png',
                'resources/images/plants/wheat/age6.png',
            ],
            produce(age) {
                if (D.lte(age, 480)) return [];

                /** @type {[string, Decimal][]} */
                const items = [['wheat', D.dOne]];

                if (D.gt(age, 900)) items.forEach(([, amount], i) => items[i][1] = amount.div(2));

                return items;
            },
            produces: ['wheat'],
            seeds(age) {
                if (D.lte(age, 480) || D.gt(age, 900) || D.gt(player.p.plants[this.id].seeds, 1e3)) return D.dOne;

                return D(1.5);
            },
            notify() { return Object.values(player.p.grid).some(data => data.plant == this.id && D.gt(data.age, tmp.p.plants[this.id].maturation)); },
        },
    },
    update(diff) {
        Object.entries(player.p.grid).forEach(([, data]) => {
            if (data.plant == '') return;

            data.age = D.add(data.age, diff);
            if (D.gte(data.age, tmp.p.plants[data.plant].ages.at(-1)[1])) {
                // Oops, plant is dead
                const drops = layers.p.plants[data.plant].produce(data.age),
                    seeds = layers.p.plants[data.plant].seeds(data.age);
                layers.lo.items['*'].gain_drops(drops);
                player.p.plants[data.plant].seeds = D.add(player.p.plants[data.plant].seeds, seeds);

                player.p.plants[data.plant].dead = D.add(player.p.plants[data.plant].dead, 1);

                // Wipe
                data.plant = '';
                data.age = D.dZero;
            }
        });
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = [],
            kept_ups = [...player.p.upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 62).t_hold.pow(tmp.a.change_efficiency)).toNumber();

        layerDataReset(this.layer, keep);
        player.p.upgrades.push(...kept_ups);
    },
    branches: [[() => player.f.unlocked ? 'f' : 'lo', 3]],
    prestigeNotify() {
        return Object.values(player.p.plants).some(data => D.gte(data.seeds, 1)) &&
            Object.entries(player.p.grid)
                .some(([id, data]) =>
                    Math.floor(id / 100) > 0 && Math.floor(id / 100) <= tmp.p.grid.rows &&
                    id % 100 > 0 && id % 100 <= tmp.p.grid.cols &&
                    data.plant == ''
                );
    },
});
