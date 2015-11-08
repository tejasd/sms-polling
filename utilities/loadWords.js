// This file parses the json file listing keywords for each choice
// into an easily consumable 'associated array'

var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));

var pathPrefix = './utilities/keywords/'

var readMultipleKeywordFiles = function() {
	var result = {};

	for (var i = 0; i < config.keywordFiles.length; ++i) {
		var compKeywords = JSON.parse(fs.readFileSync(pathPrefix + config.keywordFiles[i], 'utf8'));
		result[config.events[i]] = createDictionaryOfValidKeywords(compKeywords);
	}

	return result;
}

var createDictionaryOfValidKeywords = function(givenDict) {
	var newDict = {}
	for (key in givenDict) {
		keyWordsList = givenDict[key];
		for (var i = 0; i < keyWordsList.length; ++i) {
			newDict[keyWordsList[i].toLowerCase()] = key.toLowerCase();
		}
	}

	return newDict;
}

module.exports.voteKeywords = readMultipleKeywordFiles();
module.exports.eventKeywords = config.keywordToEvent;



// {
// 	"jhalak": {jhalak's keywords dictionary},
// 	"chaos": {chaos' keyword dictionary}
// }

