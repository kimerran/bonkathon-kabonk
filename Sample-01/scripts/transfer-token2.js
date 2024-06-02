require('dotenv').config({ path: './.env.local' });

const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58');

const base58String = process.env.GIVER_PRIVATE_KEY;

// Function to create a Keypair from a base58 encoded secret key string
const createKeypairFromBase58 = base58String => {
  const secretKeyBytes = bs58.decode(base58String);
  return solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);
};

// Function to send an SPL token transfer transaction without waiting for confirmation
const sendTokenTransaction = async () => {
  // Example base58 encoded secret key string
  const keypair = createKeypairFromBase58(base58String);

  // Connect to the Solana devnet
  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

  // SPL Token details
  const mintAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'; // The mint address of the token
  const recipientAddress = '37UmxWZnDREabCPaQ5NWsTqVQiZB8ojw7CgJDch78wQf'; // The recipient's public key

  // Fetch the associated token accounts
  const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new solanaWeb3.PublicKey(mintAddress),
    keypair.publicKey
  );

  const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new solanaWeb3.PublicKey(mintAddress),
    new solanaWeb3.PublicKey(recipientAddress)
  );

  // Create the transaction
  const transaction = new solanaWeb3.VersionedTransaction().add(
    splToken.createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      keypair.publicKey,
      1e5 // Amount of tokens to transfer (adjust as needed, here 1 token with 6 decimals)
    )
  );

  // Send the transaction without waiting for confirmation
  connection
    .sendTransaction(transaction, [keypair])
    .then(signature => {
      console.log('Transaction submitted. Signature:', signature);
      // You can continue with other actions here
    })
    .catch(error => {
      console.error('Error submitting transaction:', error);
    });

  console.log('Transaction sent. Not waiting for confirmation.');
};

// Call the sendTokenTransaction function
sendTokenTransaction();
