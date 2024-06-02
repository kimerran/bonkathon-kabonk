require('dotenv').config({ path: './.env.local' });
const { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } = require('@solana/spl-token');
const bs58 = require('bs58');

const base58String = process.env.GIVER_PRIVATE_KEY;

const createKeypairFromBase58 = base58String => {
  // Decode the base58 string to get the secret key bytes
  const secretKeyBytes = bs58.decode(base58String);

  // Create a Keypair from the secret key bytes
  const keypair = Keypair.fromSecretKey(secretKeyBytes);

  return keypair;
};

(async () => {
  // Connect to cluster
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

  // // Generate a new wallet keypair and airdrop SOL
  // const fromWallet = Keypair.generate();
  // const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);

  // // Wait for airdrop confirmation
  // await connection.confirmTransaction(fromAirdropSignature);

  // // Generate a new wallet to receive newly minted token
  // const toWallet = Keypair.generate();

  // // Create new token mint
  // const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
  console.log('base58', base58String);

  const fromWallet = createKeypairFromBase58(base58String);
  const mint = new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');

  // Get the token account of the fromWallet address, and if it does not exist, create it
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey);

  // Get the token account of the toWallet address, and if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    new PublicKey('37UmxWZnDREabCPaQ5NWsTqVQiZB8ojw7CgJDch78wQf')
  );

  console.log('fromTokenAccount:', fromTokenAccount.address.toBase58());
  console.log('toTokenAccount:', toTokenAccount.address.toBase58());

  // // Mint 1 new token to the "fromTokenAccount" account we just created
  // let signature = await mintTo(
  //     connection,
  //     fromWallet,
  //     mint,
  //     fromTokenAccount.address,
  //     fromWallet.publicKey,
  //     1000000000
  // );
  // console.log('mint tx:', signature);

  // Transfer the new token to the "toTokenAccount" we just created
  signature = transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    11
  );
})();
