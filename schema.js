// autogenerated by sql-generate v1.1.0 on Sun Nov 08 2015 16:36:21 GMT-0500 (EST)

var sql = require('sql');


/**
 * SQL definition for public.votes
 */
exports.votes = sql.define({
	name: 'votes',
	columns: [
		{ name: 'id' },
		{ name: 'event_name' },
		{ name: 'phone_no' },
		{ name: 'choice' }
	]
});


