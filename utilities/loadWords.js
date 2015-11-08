// This file parses the json file listing keywords for each choice
// into an easily consumable 'associated array'

var fs = require('fs')
var keywordsDict = JSON.parse(fs.readFileSync('./utilities/teamNames.json', 'utf8'));

var result = {}

var createDictionaryOfValidKeywords = function() {
	for (key in keywordsDict) {
		keyWordsList = keywordsDict[key];
		for (var i = 0; i < keyWordsList.length; ++i) {
			result[keyWordsList[i].toLowerCase()] = key.toLowerCase();
		}
	}

	return result
}

module.exports.createDictionaryOfValidKeywords = createDictionaryOfValidKeywords 