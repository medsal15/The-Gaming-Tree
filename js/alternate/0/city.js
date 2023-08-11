'use strict';

//todo
addLayer('c', {
    name: 'City',
    symbol: 'C',
    /** @returns {typeof player.c} */
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
        };
    },
    //tooltip() {return `${format(0)} buildings`;},
    layerShown() { return player.c.unlocked; },
    color: '#666677',
    row: 0,
    position: 1.5,
    resource: 'buildings',
    hotkeys: [
        {
            key: 'c',
            description: 'C: Display city layer',
            unlocked() { return tmp.m.layerShown; },
            onPress() { showTab('c'); },
        },
    ],
    tabFormat: {
        'City': {
            content: [
                //todo
            ],
        },
        'Buildings': {
            content: [
                //todo
            ],
        },
        'Research': {
            content: [
                //todo
            ],
            unlocked() { return false; },
        },
    },
    //todo grid
    //todo buyables
    //todo clickables
    /** @type {Layers['c']['buildings']} */
    buildings: {
        '*': {
            produce_mult() {
                return D.dOne;
            },
        },
        quarry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'stone quarry',
            style: {
                'background-color': '#BBBBBB',
                //todo image
            },
            produces(amount) {
                const built = D(amount ?? 0);

                /** @type {[string, Decimal][]} */
                const items = [['stone', D(1 / 90)]];

                items.forEach(([, amount], i) => items[i][1] = D.times(amount, built).times(tmp.c.buildings['*'].produce_mult));

                return {
                    items,
                };
            },
            cost(amount) {
                const built = D(amount ?? 0);

                //todo

                return [['stone', D.dZero]];
            },
        },
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        /** @type {(keyof player['c'])[]} */
        const keep = [],
            kept_ups = [...player[this.layer].upgrades];

        kept_ups.length = D.min(kept_ups.length, buyableEffect('lo', 23).m_hold.pow(tmp.a.change_efficiency).floor()).toNumber();

        layerDataReset(this.layer, keep);
        player.c.upgrades.push(...kept_ups);
    },
    branches: [['lo', 3]],
});
