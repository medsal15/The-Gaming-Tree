'use strict';

addLayer('sp', {
    name: 'splitter',
    symbol: 'SP',
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
        };
    },
    layerShown() { return hasUpgrade('a', 33); },
    tooltip() { return `${formatWhole(player.lo.items.stardust.amount)} stardust`; },
    color: '#773377',
    nodeStyle: {
        'background-image': 'linear-gradient(to left, #EE2233 50%, #0044BB 50%)',
        'background-origin': 'border-box',
    },
    row: 2,
    position: 2.5,
    hotkeys: [
        {
            key: 'A',
            description: 'Shift + A: Display splitter layer',
            unlocked() { return tmp.sp.layerShown; },
            onPress() { showTab('sp'); },
        },
    ],
    tabFormat: {
        'Alternate': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('sp'), layers.tic.time_speed('sp'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                [
                    'display-text',
                    () => `You have <span style="color:${tmp.xp.enemies.star.color};text-shadow:${tmp.xp.enemies.star.color} 0 0 10px;font-size:1.5em;">\
                        ${formatWhole(player.lo.items.stardust.amount)}</span> ${capitalize(tmp.lo.items.stardust.name)}\
                        </span>`
                ],
                'blank',
                ['display-text', `<span class="warning">Splitting a layer will decrease the cost to alternate other layers</span>`],
                ['display-text', () => `<span class="warning">Layer effects are ^${format(tmp.a.change_efficiency)} as efficient between alternate and normal layers</span>`],
                'blank',
                ['upgrade-tree', [
                    [11, 12, 13],
                    [21, 22, 23],
                    [31, 32, 33],
                    [41, 42, 43, 44, 45],
                ]],
                () => {
                    if (hasUpgrade('a', 11)) {
                        return ['clickable', 11];
                    }
                },
            ],
            buttonStyle: {
                'border-image-source'() { return tmp.a.nodeStyle['background-image']; },
                'border-image-slice': '1',
            },
        },
    },
    clickables: {
        11: {
            style: {
                'background-image': `url('./resources/images/gladius.svg')`,
                'background-color'() { return tmp.xp.enemies.star.color; },
                'background-origin': 'border-box',
            },
            onClick() {
                player.star.time = tmp.star.star.time;
                showTab('none');
                showNavTab('star');
            },
            tooltip: 'Fight the star to earn more stardust',
            canClick: true,
        },
    },
    //todo upgrades
    // remember to lock upg 33 behind all the others
    type: 'none',
    doReset(layer) { },
    branches: ['fr'],
});
