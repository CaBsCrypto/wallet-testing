import {
    Contract,
    TransactionBuilder,
    BASE_FEE,
    SorobanRpc,
    xdr,
    Networks,
    TimeoutInfinite,
    nativeToScVal,
    scValToNative
} from "soroban-client";
import { signTransaction, sendTransaction } from "@stellar/freighter-api";

// Update this after deployment!
export const CONTRACT_ID = "CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new SorobanRpc.Server(RPC_URL);

export async function mintPet(owner: string, name: string) {
    const contract = new Contract(CONTRACT_ID);

    // Method: mint_pet(owner: Address, name: String) -> u64
    const args = [
        new xdr.ScVal.scvAddress(xdr.Address.fromString(owner)),
        nativeToScVal(name, { type: "string" })
    ];

    const op = contract.call("mint_pet", ...args);

    const tx = await buildTx(owner, op);
    return submitTx(tx);
}

export async function getPet(owner: string) {
    const contract = new Contract(CONTRACT_ID);

    // Simulation for read-only
    // We need to build a transaction just to simulate (or use getAccount in newer SDKs helpers)
    // For simplicity using raw simulation here

    // NOTE: In V1/V2 RPC, we can simulate easier.
    // This is a placeholder for the read logic.
    return null;
}

async function buildTx(source: string, op: xdr.Operation) {
    const account = await server.getAccount(source);

    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(op)
        .setTimeout(TimeoutInfinite)
        .build();

    // Prepare/Simulate first to get cost? For MVP we just sign.
    const prepared = await server.prepareTransaction(tx);
    return prepared;
}

async function submitTx(tx: any) {
    const signed = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
    if (signed) {
        const res = await sendTransaction({ transactionXdr: signed, networkPassphrase: NETWORK_PASSPHRASE });
        return res;
    }
}
