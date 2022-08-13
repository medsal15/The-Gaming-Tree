let modInfo = {
	name: 'The Gaming Tree',
	id: 'thegamingtreev3',
	author: 'medsal15',
	pointsName: 'points',
	modFiles: [
		'moreutils.js', 'tree.js',
		'layers/automation.js', 'layers/achievements.js',
		'layers/experience.js',
		'layers/level.js', 'layers/loot.js',

		'devtools.js',
	],

	discordName: '',
	discordLink: '',
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 12,  // In hours
};

// Set your version in num and name
let VERSION = {
	num: '0.2',
	name: '',
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2</h3><br>
		- Buff attack holding<br>
		- Added Levels and Loot.<br>
		- Update endgame: ???<br>
	<h3>v0.1.1</h3><br>
		- Fix memory error in experience with enemy color enabled.<br>
	<h3>v0.1</h3><br>
		- Added XP.<br>
		- Update endgame: 9 XP upgrades.`;

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ['enemyColor', 'onKill']

/**
 * @returns {Decimal}
 */
function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints);
}

// Determines if it should show points/sec
/**
 * @returns {Boolean}
 */
function canGenPoints() {
	return false;
}

// Calculate points/sec!
/**
 * @returns {Decimal}
 */
function getPointGen() {
	return new Decimal(0);
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
	return {};
}

// Display extra things at the top of the page
var displayThings = []

// Determines when the game "ends"
/**
 * @returns {Boolean}
 */
function isEndgame() {
	return false;
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
/**
 * @returns {Number}
 */
function maxTickLength() {
	return (3600); // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
/** @param {string} oldVersion */
function fixOldSave(oldVersion) {
}
