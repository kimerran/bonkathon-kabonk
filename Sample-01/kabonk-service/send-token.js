require('dotenv').config({ path: './.env.local' });
const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58');

const rpcUrl = process.env.SOLANA_RPC_URL;

// Function to create a Keypair from a base58 encoded secret key string
const createKeypairFromBase58 = base58String => {
  const secretKeyBytes = bs58.decode(base58String);
  return solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);
};

module.exports.sendTokenTransaction = async (senderPrivateKey, mintAddress, recipientAddress, amount) => {
  // Example base58 encoded secret key string
  const keypair = createKeypairFromBase58(senderPrivateKey);

  // Connect to the Solana devnet
  const connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');

  // SPL Token details
  // const mintAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'; // The mint address of the token
  // const recipientAddress = '37UmxWZnDREabCPaQ5NWsTqVQiZB8ojw7CgJDch78wQf'; // The recipient's public key

  // Fetch the associated token accounts
  console.log('recipientAddress', recipientAddress);

  console.log('fromTokenAccount getting...');
  const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new solanaWeb3.PublicKey(mintAddress),
    keypair.publicKey
  );
  console.log('fromTokenAccount getting... done');

  console.log('toTokenAccount getting...');

  //   const associatedTokenAddress = await splToken.getAssociatedTokenAddress(
  //     new solanaWeb3.PublicKey(mintAddress),
  //     new solanaWeb3.PublicKey(recipientAddress)
  //   );
  const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new solanaWeb3.PublicKey(mintAddress),
    new solanaWeb3.PublicKey(recipientAddress)
  );

  console.log('toTokenAccount getting... done', toTokenAccount.address.toString());

  //   console.log('ata', associatedTokenAddress);

  // Create the transaction
  const transaction = new solanaWeb3.Transaction().add(
    splToken.createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      keypair.publicKey,
      Number(amount) //1e5 // Amount of tokens to transfer (adjust as needed, here 1 token with 6 decimals)
    )
  );

  // Send the transaction without waiting for confirmation
  try {
    const signature = await connection.sendTransaction(transaction, [keypair]);
    return signature;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
};
