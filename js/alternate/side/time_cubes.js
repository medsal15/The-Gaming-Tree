'use strict';

//todo
addLayer('tic', {
    name: 'Time Cubes',
    image: './resources/images/cube.svg',
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    /** @returns {typeof player.tic} */
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            invert: false,
            chal: {
                speed: D.dOne,
                time: D.dZero,
            },
        };
    },
    resource: 'time cubes',
    tooltip() { return `Time speed: *${format(tmp.tic.time_speed)}`; },
    layerShown() { return player.tic.unlocked; },
    color: '#FF00FF',
    row: 'side',
    position: 1.5,
    tabFormat: {
        'Seal': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.tic.time_speed)} seconds/s`],
                'blank',
                ['layer-proxy', ['b', [['challenge', 81]]]],
            ],
            unlocked() { return !hasChallenge('b', 81) || inChallenge('b', 81); },
        },
        'Generation': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.tic.time_speed)} seconds/s`],
                ['display-text', () => `${layerColor('tic', format(player.tic.points), 'font-size:1.5em;')} time cubes`],
                'blank',
                ['clickable', 11],
            ],
            unlocked() { return hasChallenge('b', 81); },
        },
    },
    clickables: {
        11: {
            title() {
                if (player.tic.invert) return 'Restore time speed but stop producing time cubes';
                else return 'Reverse time speed but start producing time cubes';
            },
            onClick() { player.tic.invert = !player.tic.invert; },
        },
    },
    /** @type {typeof layers.tic.time_speed} */
    time_speed(layer) {
        let speed = player.tic.points.add(10).log10();

        const main = [
            'xp', 'm', 't',
            'l', 'lo', 'f',
            'b', 's', 'a',
        ];

        if (main.includes(layer)) speed = speed.pow(tmp.a.change_efficiency);

        if (player.tic.invert) speed = speed.neg();

        if (inChallenge('b', 81)) speed = speed.times(player.tic.chal.speed);

        return speed;
    },
    update(diff) {
        if (inChallenge('b', 81)) {
            player.tic.chal.time = D.add(player.tic.chal.time, diff);
            if (player.tic.chal.time.gte(1)) {
                player.tic.chal.speed = D(Math.random() * 3 - 1);
            }
        }
        if (player.tic.invert) {
            addPoints('tic', diff);
        }
    },
});
