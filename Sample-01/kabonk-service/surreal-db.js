// import { Surreal } from 'surrealdb.js';

const { Surreal } = require('surrealdb.js');

const db = new Surreal();

async function main() {
  try {
    // Connect to the database
    // await db.connect('http://127.0.0.1:8000/rpc', {
    // 	// Set the namespace and database for the connection
    // 	namespace: 'test',
    // 	database: 'test',

    // 	// Set the authentication details for the connection
    // 	auth: {
    // 		namespace: 'test',
    // 		database: 'test',
    // 		// scope: 'user',
    // 		username: 'root',
    // 		password: 'root',
    // 	},
    // });

    await db.connect('http://127.0.0.1:8000/rpc');
    await db.use({ namespace: 'test', database: 'test' });

    await db.signin({
      username: 'root',
      password: 'root'
    });

    // Create a new person with a random id
    const created = await db.create('person', {
      title: 'Founder & CEO',
      name: {
        first: 'Tobie',
        last: 'Morgan Hitchcock'
      },
      marketing: true,
      identifier: Math.random().toString(36).substr(2, 10)
    });

    // Update a person record with a specific id
    const updated = await db.merge('person:ivoapfu92vwglmgew4wn', {
      marketing: true,
      what: 'updated'
    });

    // Select all people records
    const people = await db.select('person');

    // Perform a custom advanced query
    const groups = await db.query('SELECT marketing, count() FROM type::table($tb) GROUP BY marketing', {
      tb: 'person'
    });
  } catch (e) {
    console.error('ERROR', e);
  }
}

main();
