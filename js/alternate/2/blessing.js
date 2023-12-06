'use strict';

addLayer('bl', {
    name: 'Blessing',
    symbol: 'BL',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
        };
    },
    color: '#55AAAA',
    row: 2,
    position: 0.5,
    resource: 'blessings',
    //todo tooltip with blessings completed
    layerShown() { return player[this.layer].unlocked; },
    hotkeys: [
        {
            key: 'b',
            description: 'B: Display blessing layer',
            unlocked() { return player.bl.unlocked; },
            onPress() { showTab('bl'); },
        }
    ],
    tabFormat: {
        'Blessings': {
            content: [
                //todo display amount
                'blank',
                //todo respec clickable
                'blank',
                //todo list main blessings
            ],
        },
        //todo bonus blessings
        //todo artifacts blessings
    },
    type: 'none',
    branches() {
        if (inChallenge('b', 31)) return ['xp_alt'];
        return ['to'];
    },
});
