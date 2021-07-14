addLayer("xp", {
    name: "Experience Points",
    symbol: "XP",
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
        };
    },
    color: "#7FBF7F",
    row: 0,
    resource: "experience",
    hotkeys: [
        {
            key: "x",
            description: "X: Reset for experience points",
            onPress() {
                if (player.xp.unlocked) doReset("xp");
            },
        }
    ],
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "upgrades",
            ],
            shouldNotify() {
                return canAffordLayerUpgrade("xp");
            }
        },
    },
    upgrades: {
        11: {
            title: "Experience 11",
            description: "Start generating points",
            cost: new Decimal(1),
        },
        12: {
            title: "Experience 12",
            description: "Triple point gain",
            cost: new Decimal(5),
            unlocked() {
                return tmp[this.layer].upgrades[12].unlocked || hasUpgrade("xp", 11);
            },
        },
        13: {
            title: "Experience 13",
            description: "Double XP gain",
            cost: new Decimal(25),
            unlocked() {
                return tmp[this.layer].upgrades[13].unlocked || hasUpgrade("xp", 11);
            },
        },
        21: {
            title: "Experience 21",
            description() {
                if (!shiftDown) {
                    return "XP boosts point gain";
                }

                let formula = "log5(<code>XP</code>+5)";

                return `Formula: ${formula}`;
            },
            effect() {
                let mult = player[this.layer].points.add(5).log(5);

                return mult;
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(50),
            unlocked() {
                return tmp[this.layer].upgrades[21].unlocked || (hasUpgrade("xp", 11) && hasUpgrade("xp", 12) && hasUpgrade("xp", 13));
            },
        },
        22: {
            title: "Experience 22",
            description() {
                if (!shiftDown) {
                    return "Points boost point gain";
                }

                let formula = "3√(<code>points</code>+1)";

                return `Formula: ${formula}`;
            },
            effect() {
                let mult = player.points.add(1).root(3);

                return mult;
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(200),
            unlocked() {
                return tmp[this.layer].upgrades[22].unlocked || (hasUpgrade("xp", 11) && hasUpgrade("xp", 12) && hasUpgrade("xp", 13));
            },
        },
        23: {
            title: "Experience 23",
            description() {
                if (!shiftDown) {
                    return "XP boosts XP gain";
                }

                let formula = "log10(<code>XP</code>+10)";

                return `Formula: ${formula}`;
            },
            effect() {
                let mult = player[this.layer].points.add(10).log(10);

                return mult;
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(800),
            unlocked() {
                return tmp[this.layer].upgrades[22].unlocked || (hasUpgrade("xp", 11) && hasUpgrade("xp", 12) && hasUpgrade("xp", 13));
            },
        },
        31: {
            title: "Experience 31",
            description() {
                if (!shiftDown) {
                    return "Points boost XP gain";
                }

                let formula = "9√(<code>points</code>+1)";

                return `Formula: ${formula}`;
            },
            effect() {
                let mult = player.points.add(1).root(9);

                return mult;
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(1600),
            unlocked() {
                return tmp[this.layer].upgrades[31].unlocked || (hasUpgrade("xp", 21) && hasUpgrade("xp", 22) && hasUpgrade("xp", 23));
            },
        },
        32: {
            title: "Experience 32",
            description: "XP upgrades multiply points gain",
            effect() {
                let mult = new Decimal(player.xp.upgrades.length);

                return mult;
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(4800),
            unlocked() {
                return tmp[this.layer].upgrades[32].unlocked || (hasUpgrade("xp", 21) && hasUpgrade("xp", 22) && hasUpgrade("xp", 23));
            },
        },
        33: {
            title: "Experience 33",
            description: "Unlock a new layer<br />Square root of XP upgrades multiply XP gain",
            effect() {
                let mult = new Decimal(player.xp.upgrades.length);

                mult = mult.root(2);

                return mult;
            },
            effectDisplay() {
                return `*${format(this.effect())}`;
            },
            cost: new Decimal(14400),
            unlocked() {
                return tmp[this.layer].upgrades[33].unlocked || (hasUpgrade("xp", 21) && hasUpgrade("xp", 22) && hasUpgrade("xp", 23));
            },
        },
    },
    type: "normal",
    baseResource: "points",
    baseAmount() {
        return player.points;
    },
    requires: new Decimal(10),
    exponent: new Decimal(.5),
    gainMult() {
        let mult = new Decimal(1);

        if (hasUpgrade("xp", 13)) mult = mult.times(2);
        if (hasUpgrade("xp", 23)) mult = mult.times(upgradeEffect("xp", 23));
        if (hasUpgrade("xp", 31)) mult = mult.times(upgradeEffect("xp", 31));
        if (hasUpgrade("xp", 33)) mult = mult.times(upgradeEffect("xp", 33));

        return mult;
    },
});
