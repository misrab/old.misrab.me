var Sequelize = require('sequelize')
, sequelize = null;


var pg_url = '';
if (process.env.NODE_ENV=='production') {
	pg_url = process.env.HEROKU_POSTGRESQL_AQUA_URL;
} 
else if (process.env.NODE_ENV=='staging')  {	
	pg_url = process.env.HEROKU_POSTGRESQL_CHARCOAL_URL;
}
else {
	pg_url = process.env.POSTGRESQL_LOCAL_URL;
}

var match = pg_url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
// trim password to work with local ' ' setup
sequelize = new Sequelize(match[5], match[1], match[2].trim(), {
  dialect:  'postgres',
  protocol: 'postgres',
  port:     match[4],
  host:     match[3],
  logging:  console.log,
  omitNull: true
});

var pg = {
	url: 					pg_url,
	Sequelize: 				Sequelize,
	sequelize: 				sequelize,
	
	Blogpost: 				sequelize.import(__dirname + '/blogpost'),
	Project:				sequelize.import(__dirname + '/project'),
	User: 					sequelize.import(__dirname + '/user')
}

/*
 *	Associations
 */

    
    
module.exports = pg;