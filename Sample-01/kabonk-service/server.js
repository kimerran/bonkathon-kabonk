require('dotenv').config({ path: './.env.local' });

const solanaWeb3 = require('@solana/web3.js');

const { sendTokenTransaction } = require('./send-token');
const { createAssociatedTokenAccount } = require('./create-ata');

const bs58 = require('bs58');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.API_PORT || 3003;
const giverPrivateKey = process.env.GIVER_PRIVATE_KEY;
const bonkTokenMintAddress = process.env.TOKEN_MINT_ADDRESS;

app.use(helmet());
app.use(express.json());

const { Surreal, RecordId } = require('surrealdb.js');

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
        email: req.query.email
      });
      console.log('links', links[0]);
      return res.json(links[0]);
    }

    const links = await db.select('link');
    res.json(links);
  });

  // CREATE links
  app.post('/link', async (req, res) => {
    const link = req.body;
    const code = +new Date(); // TODO: generate a random code

    const newLink = await db.create('link', {
      email: link.email,
      code: +new Date(),
      timestamp: new Date()
    });
    res.json(newLink);
  });

  // CREATE claims
  // this just creates a database entry after the claim has been performed
  app.post('/claim', async (req, res) => {
    const claim = req.body;

    // check if already existing
    const isExisting = await db.query('SELECT * FROM claim WHERE email = $email', {
      email: claim.email
    });
    console.log('isExisting', isExisting);
    if (isExisting[0].length > 0) {
      return res.json(isExisting[0][0]);
    }

    const newClaim = await db.create('claim', {
      email: claim.email,
      referrer: claim.referrer,
      amount: claim.amount
    });
    return res.json(newClaim[0]);
  });

  // CHECK if already claimed
  app.get('/claim', async (req, res) => {
    const { email } = req.query;
    if (email) {
      const isClaimed = await db.query('SELECT * FROM claim WHERE email = $email', {
        email
      });
      return res.json(isClaimed[0][0]);
    }
    return res.json({ error: 'No email provided' });
  });

  // CREATE wallets
  app.post('/wallet', async (req, res) => {
    const { email } = req.body;

    // check if already existing
    const isExisting = await db.query('SELECT * FROM wallet WHERE email = $email', {
      email
    });
    console.log('isExisting wallet', isExisting);
    if (isExisting[0].length > 0) {
      return res.json(isExisting[0][0]);
    }

    const newPair = solanaWeb3.Keypair.generate();

    const ataTxSign = await createAssociatedTokenAccount(
      giverPrivateKey,
      bonkTokenMintAddress,
      newPair.publicKey.toString()
    );

    const newWallet = await db.create('wallet', {
      email,
      public: newPair.publicKey.toString(),
      secret: bs58.encode(newPair.secretKey),
      ataTxSign
    });
    res.json(newWallet);
  });

  // GET wallet by email
  app.get('/wallet/', async (req, res) => {
    const { email } = req.query;
    if (email) {
      const wallet = await db.query('SELECT * FROM wallet WHERE email = $email', {
        email
      });
      return res.json(wallet[0][0]);
    }

    return res.json({ error: 'No email provided' });
  });

  app.post('/send-token', async (req, res) => {
    const { recipient, amount, claimId } = req.body;
    console.log('body', req.body);

    try {
      const signature = await sendTokenTransaction(giverPrivateKey, bonkTokenMintAddress, recipient, req.body.amount);
      // const signature = '1RnioJ1mpzT4FKPgAkuKhi6HKeTzyAUfSfyXZMgNkDsdQ24xhxqBVBAPfVfnZKLeGoABQCQUC2DbhbZz7F5VMyd'
      console.log('signature', signature);

      const docId = new RecordId('claim', claimId);
      // console.log('docId',docId)
      // update claim
      const updated = await db.update(docId, {
        signature,
        status: 'submitted',
        amount
      });

      console.log('updated', updated);

      const retrieved = await db.select(docId);
      return res.json(retrieved);
    } catch (error) {
      console.log(error);
      res.json('error');
    }
  });

  const server = app.listen(port, () => console.log(`API Server listening on port ${port}`));
  //   process.on('SIGINT', () => server.close());
}

initServer();
