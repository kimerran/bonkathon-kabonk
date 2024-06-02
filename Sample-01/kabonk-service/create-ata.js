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

module.exports.createAssociatedTokenAccount = async (senderPrivateKey, mintAddress, recipientAddress) => {
  const keypair = createKeypairFromBase58(senderPrivateKey);
  //   const owner = keypair.publicKey
  // Connect to the Solana devnet
  const connection = new solanaWeb3.Connection(rpcUrl, 'finalized');

  const associatedTokenAddress = await splToken.getAssociatedTokenAddress(
    new solanaWeb3.PublicKey(mintAddress),
    new solanaWeb3.PublicKey(recipientAddress)
  );

  //   splToken.getOrCreateAssociatedTokenAccount(connection, keypair, new solanaWeb3.PublicKey(mintAddress), new solanaWeb3.PublicKey(recipientAddress))
  // const instruction = splToken.createAssociatedTokenAccountInstruction(
  //     payer.publicKey,       // Payer who will fund the creation
  //     associatedTokenAddress, // The associated token account address
  //     owner,                  // Owner of the new token account
  //     mint                    // Token mint address
  // );

  const transaction = new solanaWeb3.Transaction().add(
    splToken.createAssociatedTokenAccountInstruction(
      keypair.publicKey,
      associatedTokenAddress,
      new solanaWeb3.PublicKey(recipientAddress),
      new solanaWeb3.PublicKey(mintAddress)
    )
  );

  // Send the transaction without waiting for confirmation
  try {
    // const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [keypair]);
    const signature = await connection.sendTransaction(transaction, [keypair]);
    return signature;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
};
