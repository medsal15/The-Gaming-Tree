'use strict';

addLayer('bin', {
    name: 'Bingo',
    image: './resources/images/conway-life-glider.svg',
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    startData() {
        return {
            unlocked: false,
            points: D(5),
            cards: {},
            rolled: [],
            respecs: D.dZero,
            show: '',
            bingo_notify: true,
            time: D.dZero,
        };
    },
    layerShown() { return player.bin.unlocked; },
    color: '#445599',
    row: 'side',
    position: 2.5,
    resource: 'bingo bucks',
    type: 'none',
    tabFormat: {
        'Seal': {
            content: [
                ['layer-proxy', ['b', [['challenge', 82]]]],
            ],
            unlocked() { return !hasChallenge('b', 82) || inChallenge('b', 82); },
        },
        'Bingo': {
            content: [
                ['display-text', () => `You have ${layerColor('bin', format(player.bin.points), 'font-size:1.5em;')} ${tmp.bin.resource}`],
                ['display-text', `You gain 1 bingo bucks when you roll a number on a bingo card`],
                'blank',
                ['display-text', () => `Last ball rolled: ${player.bin.rolled.length ? formatWhole(player.bin.rolled.at(-1)) : 'none'}`],
                ['bar', 'roll'],
                ['clickables', [1]],
                ['drop-down-double', ['show', () => [
                    ['', 'none'],
                    ...tmp.bin.cards.list.map(layer => [layer, tmp[layer].name]),
                ]]],
                ['display-text', () => {
                    if (player.bin.show == '') return tmp.bin.balls.grid;
                    return tmp.bin.cards.show_card;
                }],
            ],
        },
    },
    cards: {
        list() { return Object.keys(player.bin.cards); },
        possibles() {
            /** @type {(keyof Layers)[]} */
            const layers = [
                'xp_alt', 'c', 'p',
                'to', //'k', //'fr', //todo
                //'bl', //'v', //'sp', //todo
            ];

            return layers.filter(layer => player[layer].unlocked && tmp[layer].layerShown);
        },
        availables() { return tmp.bin.cards.possibles.filter(layer => !(layer in player.bin.cards)); },
        cost() {
            const base = D.div(player.bin.respecs, 100).add(2);

            return base.pow(tmp.bin.cards.list.length).times(5);
        },
        cost_formula: '5 * (2 + respecs / 100) ^ bingo cards',
        create_card() {
            /** @type {number[]} */
            const card = [];
            for (let i = 0; i < 25; i++) {
                const n = layers.bin.balls.roll_ball();
                if (card.includes(n)) i--;
                else card.push(n);
            }
            return card;
        },
        bingo() {
            if (player.bin.rolled.length < 5) return false;

            /** @param {number[]} spots */
            const check_rows = spots => {
                return Array.from({ length: 5 }).some(
                    (_, i) => spots.slice(i * 5, (i + 1) * 5)
                        .every(num => player.bin.rolled.includes(num))
                );
            },
                /** @param {number[]} spots */
                check_cols = spots => {
                    return Array.from({ length: 5 }).some(
                        (_, i) => spots.filter((_, j) => j % 5 == i)
                            .every(num => player.bin.rolled.includes(num))
                    );
                },
                /** @param {number[]} spots */
                check_diags = spots => {
                    return player.bin.rolled.includes(spots[12]) && (
                        [0, 6, 18, 24].every(i => player.bin.rolled.includes(spots[i])) ||
                        [4, 8, 16, 20].every(i => player.bin.rolled.includes(spots[i]))
                    );
                },
                bingos = Object.entries(player.bin.cards)
                    .filter(([, { spots }]) => check_rows(spots) || check_cols(spots) || check_diags(spots));

            if (!bingos.length) return false;

            return bingos.map(([layer]) => layer);
        },
        show_card(card = player.bin.show) {
            if (!card) return;

            const bingo = player.bin.cards[card]?.spots;
            if (!bingo) return;

            const rows = Array.from(
                { length: 5 },
                (_, i) => `<tr>${bingo.slice(i * 5, (i + 1) * 5)
                    .map(i => {
                        let style = [];

                        if (player.bin.rolled.includes(i)) style.push('color: #77BB77');

                        return `<td style="${style.join(';')}">${formatWhole(i)}</td>`;
                    })
                    .join('')}<tr>`
            ).join('');
            return `<table class="layer-table" style="--color:${tmp[card].color};">\
                    ${rows}\
                </table>`;
        },
        multipliers(layer) {
            //todo apply to other layers
            if (!layer) {
                return Object.fromEntries(
                    tmp.bin.cards.possibles
                        .map(layer => [layer, layers.bin.cards.multipliers(layer)])
                );
            }
            if (!tmp.bin.cards.possibles.includes(layer)) return D.dOne;

            //todo compute bingo progress
            return D.dOne;
        },
    },
    balls: {
        roll_ball() { return Math.floor(Math.random() * (tmp.bin.balls.max - tmp.bin.balls.min) + tmp.bin.balls.min); },
        roll_new_ball() {
            if (player.bin.rolled.length > (tmp.bin.balls.max - tmp.bin.balls.min)) return;

            let n;
            do {
                n = layers.bin.balls.roll_ball();
            } while (player.bin.rolled.includes(n));

            return n;
        },
        time: D.dTen,
        min: 1,
        max: 100,
        grid() {
            const side = Math.ceil((tmp.bin.balls.max - tmp.bin.balls.min) ** .5),
                /** @type {(x: number, y: number) => string} */
                num = (x, y) => {
                    const n = x * side + y + tmp.bin.balls.min;
                    if (n > tmp.bin.balls.max) return '';
                    const rolled = player.bin.rolled.includes(n);
                    return (rolled ? '<span style="color:#77BB77">' : '') + formatWhole(n) + (rolled ? '</span>' : '');
                },
                rows = Array.from(
                    { length: side },
                    (_, i) => `<tr>` +
                        Array.from({ length: side }, (_, j) => `<td>${num(i, j)}</td>`).join('') +
                        `</tr>`
                ).join('');
            return `<table class="layer-table" style="--color:${tmp.bin.color};">\
                    ${rows}\
                </table>`;
        },
    },
    clickables: {
        11: {
            title: 'Respec Bingo Cards',
            canClick() { return tmp.bin.cards.list.length > 0; },
            onClick() {
                player.bin.cards = {};
                player.bin.respecs = D.add(player.bin.respecs, 1);
                player.bin.points = layers.bin.cards.cost();
            },
            unlocked() { return !inChallenge('b', 82); },
        },
        12: {
            title: 'New Bingo Card',
            canClick() { return tmp.bin.cards.availables.length > 0 && D.gte(player.bin.points, tmp.bin.cards.cost); },
            onClick() {
                const availables = tmp.bin.cards.availables;

                if (D.lt(player.bin.points, tmp.bin.cards.cost) || availables.length <= 0) return;

                const layer = availables[Math.floor(Math.random() * availables.length)];

                player.bin.cards[layer] = layers.bin.cards.create_card();
            },
            unlocked() { return !inChallenge('b', 82); },
        },
    },
    bars: {
        roll: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.bin.balls.time;
                return D.div(player.bin.time ?? max, max);
            },
            display() {
                let text = `${formatTime(player.bin.time)} / ${formatTime(tmp.bin.balls.time)}`;

                return text;
            },
            textStyle: { 'color': 'gray', },
        },
    },
    prestigeNotify() { return tmp.bin.cards.availables.length > 0 && D.gte(player.bin.points, tmp.bin.cards.cost); },
    update(diff) {
        if (!tmp.bin.layerShown) return;

        //player.bin.time = D.add(player.bin.time, diff);

        if (player.bin.time.gte(tmp.bin.balls.time)) {
            // Roll a new ball
            player.bin.time = D.minus(player.bin.time, tmp.bin.balls.time);
            const ball = layers.bin.balls.roll_new_ball();

            if (typeof ball === 'undefined') return;
            player.bin.rolled.push(ball);

            const includes = Object.values(player.bin.cards)
                .filter(({ spots }) => spots.includes(ball))
                .length;
            player.bin.points = D.add(player.bin.points, includes);

            // Check for bingos
            const bingo = tmp.bin.cards.bingo;
            if (bingo) {
                Object.entries(player.bin.cards).forEach(([layer, data]) => {
                    if (bingo.includes(layer)) data.wins = D.add(data.wins, 1);
                    else data.wins = D.dZero;

                    data.spots = layers.bin.cards.create_card();
                });
                player.bin.rolled = [];

                doPopup('achievement', `${listFormat.format(bingo.map(layer => tmp[layer].name))}`, 'Bingo!', 3, tmp.bin.color);
            }
        }
    },
    shouldNotify() { return inChallenge('b', 82) && canCompleteChallenge('b', 82); },
});
