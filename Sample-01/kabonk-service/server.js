require('dotenv').config({ path: './.env.local' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.API_PORT || 3003;

app.use(helmet());
app.use(express.json());


const { Surreal } = require('surrealdb.js');

const db = new Surreal();

async function initServer() {
  await db.connect('http://127.0.0.1:8000/rpc');
  await db.use({ namespace: 'test', database: 'test' });

  await db.signin({
    username: 'root',
    password: 'root'
  });

  // GET links
  app.get('/link', async (req, res) => {
     if (req.query.email) {
        const links = await db.query('SELECT * FROM link WHERE email = $email', {
            email: req.query.email,
        });
        console.log('links', links[0])
        return res.json(links[0]);
     }

    const links = await db.select('link');
    res.json(links);
  })

  // CREATE links
  app.post('/link', async (req, res) => {
    const link = req.body;
    const code = +new Date(); // TODO: generate a random code

    const newLink = await db.create('link', {
        email: link.email,
        code: +new Date(),
        timestamp: new Date(),
    })
    res.json(newLink);
  });

  const server = app.listen(port, () => console.log(`API Server listening on port ${port}`));
//   process.on('SIGINT', () => server.close());
}

initServer();
