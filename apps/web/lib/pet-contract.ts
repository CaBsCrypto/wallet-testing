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

const CONTRACT_ID = "CBO3K25CONABBA7L3KZNT2Q3L6WCZGWF42BAANGH22BDX5657QQLYHKR";

// ... existing code ...

export async function submitGameScore(ownerAddress: string, score: number, gameId: string): Promise<string> {
    console.log("Calling submit_game_score with:", { ownerAddress, score, gameId, contract: CONTRACT_ID });
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("submit_game_score",
        new Address(ownerAddress).toScVal(),
        nativeToScVal(score, { type: "u32" }), // Changed to u32
        nativeToScVal(gameId, { type: "symbol" })
    );
    return submitTx(ownerAddress, op);
}

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

export interface PetStats {
    strength: number;
    agility: number;
    intelligence: number;
    energy: number;
    last_update: number;
    wins: number;
    losses: number;
    gold: number;
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

export async function getPetStats(ownerAddress: string): Promise<PetStats | null> {
    const contract = new Contract(CONTRACT_ID);
    const operation = contract.call("get_stats", new Address(ownerAddress).toScVal());

    try {
        const transaction = new TransactionBuilder(
            new Account(ownerAddress, "0"),
            { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
        )
            .addOperation(operation)
            .setTimeout(30)
            .build();

        const result = await server.simulateTransaction(transaction);

        if (rpc.Api.isSimulationSuccess(result)) {
            const val = result.result?.retval;
            if (!val) {
                console.warn("getPetStats: No retval in simulation result");
                return null;
            }
            const raw = scValToNative(val);
            console.log("getPetStats Raw:", raw); // Debug Log
            if (!raw) return null;

            return {
                strength: Number(raw.strength),
                agility: Number(raw.agility),
                intelligence: Number(raw.intelligence),
                energy: Number(raw.energy),
                last_update: Number(raw.last_update),
                wins: Number(raw.wins),
                losses: Number(raw.losses),
                gold: Number(raw.gold),
            } as PetStats;
        }
        return null;
    } catch (e) {
        console.error("getPetStats error:", e);
        return null;
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

// 1: Win, 2: Loss, 0: Draw
export async function battlePet(ownerAddress: string, move: "Fire" | "Water" | "Grass"): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("battle",
        new Address(ownerAddress).toScVal(),
        nativeToScVal(move, { type: "symbol" })
    );
    return submitTx(ownerAddress, op);
}

// Hunt Result: returns array of symbols
export async function playCryptoHunt(ownerAddress: string, moves: number[]): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("play_hunt",
        new Address(ownerAddress).toScVal(),
        xdr.ScVal.scvVec(
            moves.map(m => nativeToScVal(m, { type: "u32" }))
        )
    );
    // SDK uses ScVal for arrays differently? Let's check docs or use nativeToScVal which handles arrays.
    // nativeToScVal([1, 2], { type: "vec" }) is typical?
    // Actually, passing array to nativeToScVal usually works automagically for Vec.
    return submitTx(ownerAddress, op);
}

export async function changePetDesign(ownerAddress: string, newDesign: string): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("change_design",
        new Address(ownerAddress).toScVal(),
        nativeToScVal(newDesign, { type: "string" })
    );
    return submitTx(ownerAddress, op);
}

export async function trainStat(ownerAddress: string, stat: "str" | "agi" | "int"): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("train_stat",
        new Address(ownerAddress).toScVal(),
        nativeToScVal(stat, { type: "symbol" })
    );
    return submitTx(ownerAddress, op);
}

export async function buyPotion(ownerAddress: string): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("buy_potion",
        new Address(ownerAddress).toScVal()
    );
    return submitTx(ownerAddress, op);
}

export async function buySmallPotion(ownerAddress: string): Promise<string> {
    const contract = new Contract(CONTRACT_ID);
    const op = contract.call("buy_small_potion",
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
            // events is array of strings or objects. Try to find log events.
            const events = (simulation as any).events;
            console.error("Simulation events:", JSON.stringify(events, null, 2));
            // Check for panic/abort events
        }

        // Try to get a readable error
        let errorDetail = "Unknown Simulation Error";
        if ((simulation as any).error) {
            errorDetail = (simulation as any).error; // Often a string "HostError: ..."
        } else if (typeof simulation === 'string') {
            errorDetail = simulation;
        }

        console.error(`Simulation failed details: ${errorDetail}`);
        throw new Error(`Transaction simulation failed: ${errorDetail}`);
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

    if (sendVal.status !== "PENDING") {
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
