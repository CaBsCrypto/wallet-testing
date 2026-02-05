
import {
    Address,
    Asset,
    Operation,
    Keypair,
    TransactionBuilder,
    Networks,
    rpc
} from '@stellar/stellar-sdk';
import { submitTx } from './soroswap'; // Re-use our robust submitter

// A specialized function to Mint a Standard Stellar Asset (CIP-00 Style NFT)
// In a real app, this would point to a Wasm Contract, but for "The Artist" tier,
// teaching how to Issue an Asset Key is fundamental.

const NETWORK_PASSPHRASE = Networks.TESTNET;

export async function mintStellarAsset(
    userAddress: string,
    assetCode: string,
    ipfsHash: string // We'll just fake this metadata usage for now or put it in a ManageData op
) {
    console.log(`Minting Asset ${assetCode} for ${userAddress}`);

    // 1. Generate a new Issuer Keypair (The DNA of the NFT)
    const issuerKey = Keypair.random();
    console.log("New Issuer Generated:", issuerKey.publicKey());

    // 2. The Asset
    const newAsset = new Asset(assetCode, issuerKey.publicKey());

    // 3. User must Trust the asset first (Stellar Rule)
    const opTrust = Operation.changeTrust({
        asset: newAsset,
        limit: "1" // NFT logic: limit 1
    });

    // 4. Issuer must Payment 1 unit to User
    const opPayment = Operation.payment({
        source: issuerKey.publicKey(),
        destination: userAddress,
        asset: newAsset,
        amount: "1"
    });

    // 5. Issuer locks the asset (sets weight to 0) so no more can be minted -> True NFT
    const opLock = Operation.setOptions({
        source: issuerKey.publicKey(),
        masterWeight: 0,
        lowThreshold: 0,
        medThreshold: 0,
        highThreshold: 0
    });

    // 6. We also need to Create the Issuer Account on ledger (Fund it)
    // The User pays for the creation of the Artist Account (Issuer)
    const opCreateAccount = Operation.createAccount({
        destination: issuerKey.publicKey(),
        startingBalance: "2" // Min balance for an account + some rent
    });

    // Special flow: The tx requires User Signature (to pay) AND Issuer Signature (to pay back asset)
    // We can bundle this.

    // Note: submitTx in soroswap.ts handles extra signers if we pass them.
    // We need to pass [opCreateAccount, opTrust, opPayment, opLock]
    // Signers: User (primary), Issuer (secondary)

    return await submitTx(
        userAddress,
        [opCreateAccount, opTrust, opPayment, opLock],
        issuerKey, // Extra signer
        true // skipSimulation: TRUE (Classic Ops don't need Soroban simulation)
    );
}

// Mock AI Image Generator (Client-side simulation logic helper)
export const MOCK_AI_IMAGES = [
    "/assets/ai-mocks/cyberpunk-cat.png",
    "/assets/ai-mocks/neon-city.png",
    "/assets/ai-mocks/abstract-energy.png",
    "/assets/ai-mocks/space-ape.png",
    "/assets/ai-mocks/nano-banana.png"
];

export function getRandomAIImage(prompt?: string) {
    if (!prompt) return MOCK_AI_IMAGES[Math.floor(Math.random() * MOCK_AI_IMAGES.length)];

    const lower = prompt.toLowerCase();
    if (lower.includes("cat")) return "/assets/ai-mocks/cyberpunk-cat.png";
    if (lower.includes("city") || lower.includes("neon")) return "/assets/ai-mocks/neon-city.png";
    if (lower.includes("space") || lower.includes("ape")) return "/assets/ai-mocks/space-ape.png";
    if (lower.includes("banana")) return "/assets/ai-mocks/nano-banana.png";

    return MOCK_AI_IMAGES[Math.floor(Math.random() * MOCK_AI_IMAGES.length)];
}
