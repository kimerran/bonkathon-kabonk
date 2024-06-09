require('dotenv').config({ path: './.env.local' });
const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58');

const rpcUrl = process.env.SOLANA_RPC_URL;
const senderPrivateKey = process.env.GIVER_PRIVATE_KEY;
const bonkTokenMintAddress = process.env.TOKEN_MINT_ADDRESS;
const connection = new solanaWeb3.Connection(rpcUrl, 'finalized');

// Function to create a Keypair from a base58 encoded secret key string
const createKeypairFromBase58 = base58String => {
  const secretKeyBytes = bs58.decode(base58String);
  return solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);
};

const keypair = createKeypairFromBase58(senderPrivateKey);

const getAssociatedTokenAddress = async ownerAddress => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(new solanaWeb3.PublicKey(ownerAddress), {
    programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // Token program ID, usually constant
  });

  let hasBonkATA = false;
  tokenAccounts.value.forEach(accountInfo => {
    const data = Buffer.from(accountInfo.account.data);
    const foundMint = new solanaWeb3.PublicKey(data.slice(0, 32)).toBase58();
    if (foundMint === bonkTokenMintAddress) {
      hasBonkATA = true;
    }
  });

  return hasBonkATA;
};

const createAssociatedTokenAccount2 = async recipientAddress => {
  await splToken.createAssociatedTokenAccount(
    connection,
    keypair,
    new solanaWeb3.PublicKey(bonkTokenMintAddress),
    new solanaWeb3.PublicKey(recipientAddress)
  );
};

module.exports.getAssociatedTokenAddress = getAssociatedTokenAddress;
module.exports.createAssociatedTokenAccount2 = createAssociatedTokenAccount2;

module.exports.createAssociatedTokenAccount = async (senderPrivateKey, mintAddress, recipientAddress) => {
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
