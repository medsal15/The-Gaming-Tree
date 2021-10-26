let modInfo = {
	name: 'The Gaming Tree',
	id: 'thegamingtree',
	author: 'medsal15',
	pointsName: 'points',
	modFiles: [
		'moreutils.js', 'tree.js',
		'layers/achievements.js',
		'layers/experience.js',
		'layers/level.js', 'layers/coin.js',

		'devtools.js',
	],

	discordName: '',
	discordLink: '',
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 12,  // In hours
};

// Set your version in num and name
let VERSION = {
	num: '0.2',
	name: 'Money and Power',
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2</h3><br>
		- Added L & C layers.<br>
		- Added achievements.<br>
		- Update endgame: 9 level and 9 coin upgrades.<br>
	<h3>v0.1</h3><br>
		- Added XP layer.<br>
		- Update endgame: 9 experience upgrades.`;

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ['blowUpEverything']

/**
 * @returns {Boolean}
 */
function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints);
}

// Determines if it should show points/sec
/**
 * @returns {Boolean}
 */
function canGenPoints() {
	return hasUpgrade('xp', 11);
}

// Calculate points/sec!
/**
 * @returns {Decimal}
 */
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0);

	let gain = new Decimal(1);

	// XP layer
	if (hasUpgrade('xp', 12)) gain = gain.times(upgradeEffect('xp', 12));
	if (hasUpgrade('xp', 21)) gain = gain.times(upgradeEffect('xp', 21));
	if (hasUpgrade('xp', 23)) gain = gain.times(upgradeEffect('xp', 23));
	gain = gain.times(buyableEffect('xp', 12));
	gain = gain.times(buyableEffect('xp', 13).points);

	// L layer
	if (hasUpgrade('l', 12)) gain = gain.times(upgradeEffect('l', 12));

	// C layer
	if (hasUpgrade('c', 11)) gain = gain.times(upgradeEffect('c', 11));

	return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
	return { };
}

// Display extra things at the top of the page
var displayThings = [ ]

// Determines when the game "ends"
/**
 * @returns {Boolean}
 */
function isEndgame() {
	return player.l.upgrades.length + player.c.upgrades.length >= 18;
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = { }

// You can change this if you have things that can be messed up by long tick lengths
/**
 * @returns {Number}
 */
function maxTickLength() {
	return(3600); // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) { }
