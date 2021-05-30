const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'lvhknygy',
    password: 'iog3ZSF4FmLPS_SIbnoHCM22DTqdF5eD',
    host: 'batyr.db.elephantsql.com',
    port: 5432,
    database: 'lvhknygy'
});

module.exports = pool;