Contract,
    TransactionBuilder,
    BASE_FEE,
    rpc,
    xdr,
    Networks,
    TimeoutInfinite,
    nativeToScVal,
    scValToNative,
} from "@stellar/stellar-sdk";
// import { signTransaction, isConnected } from "@stellar/freighter-api";

// Deployed Contract ID
export const CONTRACT_ID = "CAYVRO47NUSEGITMC4F7DGUYBO37KJE5LMKPRRF4HJBEAELUDJ53IFVI";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new rpc.Server(RPC_URL);

export async function fundAccount(address: string) {
    const response = await fetch(`https://friendbot.stellar.org?addr=${address}`);
    return response.json();
}

export async function mintPet(owner: string, name: string) {
    // Check connection first
    const { isConnected } = await import("@stellar/freighter-api");
    if (!(await isConnected())) {
        throw new Error("Wallet not connected");
    }

    const contract = new Contract(CONTRACT_ID);

    // Method: mint_pet(owner: Address, name: String) -> u64
    // nativeToScVal handles Address conversion automatically if formatted correctly
    const args = [
        nativeToScVal(owner, { type: "address" }),
        nativeToScVal(name, { type: "string" })
    ];

    const op = contract.call("mint_pet", ...args);

    const tx = await buildTx(owner, op);
    return submitTx(tx);
}

export async function getPet(owner: string) {
    // Read-only usually doesn't need signature, but needs "simulateTransaction"
    const contract = new Contract(CONTRACT_ID);
    const key = nativeToScVal(owner, { type: "address" });

    // For now, returning null as placeholder until we implement the read logic properly
    // which involves simulating a call to get_pet or reading storage directly
    return null;
}

async function buildTx(source: string, op: xdr.Operation) {
    console.log("Building transaction for:", source);
    let account;
    try {
        account = await server.getAccount(source);
    } catch (e) {
        console.error("Error fetching account:", e);
        throw new Error(`Account not found or network error. Please fund your wallet on Testnet.`);
    }

    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(op)
        .setTimeout(TimeoutInfinite)
        .build();

    console.log("Simulating transaction...");
    // Simulate to get footprint/resources
    let simulated;
    try {
        simulated = await server.simulateTransaction(tx);
    } catch (e) {
        console.error("Simulation threw error:", e);
        throw e;
    }

    console.log("Simulation Result:", simulated);

    // Cast to any to check error or use rpc.Api.isSimulationError if available
    // note: rpc.Api.isSimulationError(simulated) handles standard error responses
    if (rpc.Api.isSimulationError(simulated)) {
        console.error("Simulation failed logic:", simulated);
        throw new Error(`Simulation failed.`);
    }

    // Assemble transaction with recommended resources
    return server.prepareTransaction(tx, simulated);
}

async function submitTx(tx: any) {
    console.log("Requesting signature...");
    // 1. Sign with Wallet
    const { signTransaction } = await import("@stellar/freighter-api");
    const signResult = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });

    if (signResult.error) {
        throw new Error(signResult.error);
    }

    const signedXdr = signResult.signedTxXdr;

    if (signedXdr) {
        console.log("Signed. Submitting to network...");
        // 2. Submit to network
        const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

        const res = await server.sendTransaction(signedTx);
        console.log("Submission Result:", res);

        if (res.status === "PENDING" || res.status === "SUCCESS") {
            return res;
        }
        if (res.status === "ERROR") {
            console.error("Submission Error Details:", res);
            throw new Error(`Transaction failed with status ERROR.`);
        }
        return res;
    } else {
        throw new Error("User canceled signature or signing failed.");
    }
}
