require('dotenv').config({ path: './.env.local' });

const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58');

// const base58String = process.env.GIVER_PRIVATE_KEY;
const rpcUrl = process.env.SOLANA_RPC_URL;
const senderPrivateKey = process.env.GIVER_PRIVATE_KEY;
const bonkTokenMintAddress = process.env.TOKEN_MINT_ADDRESS;
// const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com', 'finalized');

const connection = new solanaWeb3.Connection(rpcUrl, 'finalized');

// Function to create a Keypair from a base58 encoded secret key string
const createKeypairFromBase58 = base58String => {
  const secretKeyBytes = bs58.decode(base58String);
  return solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);
};

const getAssociatedTokenAddress = async ownerAddress => {
  return await splToken.getAssociatedTokenAddress(
    new solanaWeb3.PublicKey(bonkTokenMintAddress),
    new solanaWeb3.PublicKey(ownerAddress)
  );
};

const transferBONKto = async (recipientAddress, amount) => {
  const SENDR_BONK_ATA = await getAssociatedTokenAddress('5MaVSc3pAWv6XLYndqeMLd4HNp5smEe4xrnvq94KxEPu');
  const RECVR_BONK_ATA = await getAssociatedTokenAddress(recipientAddress);
  const keypair = createKeypairFromBase58(senderPrivateKey);
  console.log('params', {
    SENDR_BONK_ATA,
    RECVR_BONK_ATA
  });

  const setComputeUnitInstruction = solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 100000 // increase as needed
  });

  const setComputeUnitLimitInstruction = solanaWeb3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 50000
  });

  const createAtaInstruction = splToken.createAssociatedTokenAccountInstruction(
    keypair.publicKey,
    RECVR_BONK_ATA,
    new solanaWeb3.PublicKey(recipientAddress),
    new solanaWeb3.PublicKey(bonkTokenMintAddress)
  );

  const splTransferInstruction = splToken.createTransferInstruction(
    SENDR_BONK_ATA,
    RECVR_BONK_ATA,
    new solanaWeb3.PublicKey('5MaVSc3pAWv6XLYndqeMLd4HNp5smEe4xrnvq94KxEPu'),
    Number(amount),
    [keypair]
  );

  const blockhash = await connection.getLatestBlockhash();
  const messagev0 = new solanaWeb3.TransactionMessage({
    payerKey: keypair.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: [
      setComputeUnitInstruction,
      setComputeUnitLimitInstruction,
      createAtaInstruction,
      splTransferInstruction
    ]
  }).compileToV0Message();

  const transaction = new solanaWeb3.VersionedTransaction(messagev0);

  transaction.sign([keypair]);

  const signature = await connection.sendTransaction(transaction);
  console.log('Transaction Signature:', signature);
  return signature;

  // Verify transaction receipt
  // const status = await connection.confirmTransaction({
  //   blockhash: blockhash.blockhash,
  //   lastValidBlockHeight: blockhash.lastValidBlockHeight,
  //   signature: signature,
  //   commitment: 'finalized'
  // });
  // console.log('Transaction Status:', status);
};

module.exports.transferBONKto = transferBONKto;

// async function main() {
//   //   const hasBonkATA = await getAssociatedTokenAddress('CnUZW3CLt3FF38SQHGZWtz3xGYLptYYcPhUZjdwT3cEB');
//   //   console.log(hasBonkATA);

//   transferBONKto('ESKdbZcy1wpbdHyx7LNYMS6mJs91smrA6mk6w649S6QB');
// }

// main();
