function producedafter(seconds = 60) {
    if (!canGenPoints()) {
        console.log('nothing');
        return;
    }

    player.points = new Decimal(0);
    player.devSpeed = new Decimal(seconds);

    setTimeout(() => {
        player.devSpeed = new Decimal(1e-50);
        console.log(`points: ${format(player.points)}`);
        Object.keys(layers).forEach(id => {
            if (tmp[id].type == 'none') return;
            console.log(`${tmp[id].name}: ${format(tmp[id].resetGain)}`);
        });
        player.devSpeed = new Decimal(1);
    }, 1000);
}

/**
 * @param {(d: Decimal) => Decimal} fn
 */
function checkfunction(fn, iterations = 3, start = 1, step = 10) {
    if (typeof fn != 'function') return;

    if (!iterations) iterations = 3;
    if (!start) start = 1;
    if (!step) step = 1;

    console.log(`0 => ${format(fn(new Decimal(0)))}`);
    let num = new Decimal(start);
    while (iterations > 0) {
        console.log(`${format(num)} => ${format(fn(num))}`);

        num = num.times(step);
        iterations--;
    }
}
