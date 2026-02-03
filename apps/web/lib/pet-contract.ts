import {
    xdr,
    TransactionBuilder,
    Networks,
    Contract,
    Address,
    scValToNative,
    nativeToScVal,
    rpc,
    Account,
} from '@stellar/stellar-sdk';

// import { signTransaction } from '@stellar/freighter-api'; // Removed static import

const CONTRACT_ID = "CCSO2GRRRTSEMSPLVDIDLBDAKWEQAQEUHCXENY54QXT3VTRKHLE6K3OH";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new rpc.Server(RPC_URL);

export interface Pet {
    name: string;
    owner: string;
    birth_date: number;
    level: number;
    xp: number;
    design: string;
}

export async function getPet(ownerAddress: string): Promise<Pet | null> {
    const contract = new Contract(CONTRACT_ID);
    const key = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol("Pet"),
        new Address(ownerAddress).toScVal(),
    ]);

    // We query the contract instance/persistent storage directly for the Pet entry
    // The contract uses DataKey::Pet(Address) which maps to [Symbol("Pet"), Address] in the ledger key

    // However, client-side it's easier to use specific "get_pet" View function if we made one.
    // In our contract we have: pub fn get_pet(env: Env, owner: Address) -> Option<Pet>

    const operation = contract.call("get_pet", new Address(ownerAddress).toScVal());

    // For view functions we simulate
    console.log("Simulating get_pet for:", ownerAddress);
    try {
        const transaction = new TransactionBuilder(
            new Account(ownerAddress, "0"), // Sequence 0 for simulation
            { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
        )
            .addOperation(operation)
            .setTimeout(30)
            .build();

        const result = await server.simulateTransaction(transaction);
        console.log("get_pet simulation result:", JSON.stringify(result, null, 2));

        // Basic check for success
        // In newer SDK, check `rpc.Api.isSimulationSuccess`
        if (rpc.Api.isSimulationSuccess(result)) {
            if (!result.result?.retval) return null;

            const val = result.result.retval;
            // ... continuation

            if (val.switch().name === 'scvVoid') return null; // Option::None

            // Result is Option<Pet>
            // If Some, it's just the Pet struct (because soroban-sdk unwraps Option in return if it can, wait)
            // Actually soroban returns ScVal corresponding to the type. Option<T> is T or Void.

            // Let's rely on scValToNative for parsing basic structs if possible, 
            // but often manual parsing is safer for detailed structs unless we have generated bindings.
            // Let's try native:
            const raw = scValToNative(val);
            if (!raw) return null;

            // scValToNative for struct returns an object with keys.
            // ensure types match
            return {
                name: raw.name,
                owner: raw.owner,
                birth_date: Number(raw.birth_date),
                level: raw.level,
                xp: Number(raw.xp),
                design: raw.design
            } as Pet;
        }

        console.error("Simulation failed:", result);
        return null;
    } catch (e) {
        console.error("getPet internal error:", e);
        throw e;
    }
}

export async function mintPet(ownerAddress: string, name: string): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("mint_pet",
        new Address(ownerAddress).toScVal(),
        nativeToScVal(name, { type: "string" })
    );

    return submitTx(ownerAddress, op);
}

export async function addXp(ownerAddress: string, amount: number): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    // method: add_xp(owner, amount)
    const op = contract.call("add_xp",
        new Address(ownerAddress).toScVal(),
        nativeToScVal(amount, { type: "u64" })
    );

    return submitTx(ownerAddress, op);
}

export async function releasePet(ownerAddress: string): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("release_pet",
        new Address(ownerAddress).toScVal()
    );
    return submitTx(ownerAddress, op);
}

async function submitTx(signerAddress: string, operation: xdr.Operation): Promise<string> {
    const account = await server.getAccount(signerAddress);

    const transaction = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(operation)
        .setTimeout(180)
        .build();

    // Simulate first to get resources (Soroban data)
    console.log("Simulating transaction for:", signerAddress);
    const simulation = await server.simulateTransaction(transaction);

    if (rpc.Api.isSimulationError(simulation)) {
        console.error("Simulation failed (raw):", simulation);
        console.error("Simulation failed (json):", JSON.stringify(simulation, null, 2));
        // Try to extract extra info if available
        if ((simulation as any).events) {
            console.error("Simulation events:", JSON.stringify((simulation as any).events, null, 2));
        }
        if ((simulation as any).error) {
            console.error("Simulation error string:", (simulation as any).error);
        }
        throw new Error("Transaction simulation failed. Check console for details.");
    }

    // Prepare transaction (append Soroban data)
    console.log("Preparing transaction...");
    const preparedTransaction = await server.prepareTransaction(transaction);

    // Sign with Freighter
    console.log("Signing transaction...");
    const { signTransaction } = await import('@stellar/freighter-api');
    const signedTx = await signTransaction(preparedTransaction.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });

    if (signedTx.error) {
        throw new Error(signedTx.error);
    }

    // Submit
    console.log("Submitting transaction...");
    const sendVal = await server.sendTransaction(TransactionBuilder.fromXDR(signedTx.signedTxXdr, NETWORK_PASSPHRASE));

    if (sendVal.status !== "PENDING" && sendVal.status !== "SUCCESS") {
        // Detailed error logging
        console.error("Full SendTransaction Response:", JSON.stringify(sendVal, null, 2));

        let errorMsg = `Transaction failed: ${sendVal.status}`;
        if (sendVal.status === "ERROR" && (sendVal as any).errorResultXdr) {
            errorMsg += ` - ResultXDR: ${(sendVal as any).errorResultXdr}`;
        }

        throw new Error(errorMsg);
    }

    // Poll for confirmation
    const txHash = sendVal.hash;
    console.log(`Submitted ${txHash} - Waiting for confirmation...`);

    let status = sendVal.status;
    let attempts = 0;
    while (attempts < 10) { // Max wait 20s (2s * 10)
        await new Promise(r => setTimeout(r, 2000));

        try {
            const txInfo = await server.getTransaction(txHash);
            if (txInfo.status === "SUCCESS") {
                console.log("Transaction Confirmed!");
                return txHash;
            } else if (txInfo.status === "FAILED") {
                console.error("Transaction Failed Async:", txInfo);
                throw new Error(`Transaction failed during consensus: ${JSON.stringify(txInfo.resultXdr)}`);
            }
        } catch (e) {
            // Ignore 404s while pending
            console.log("Waiting for ingestion...");
        }
        attempts++;
    }

    // If we timeout, we still return hash but warn user
    console.warn("Transaction timed out waiting for confirmation (but might still succeed).");
    return txHash;
}
