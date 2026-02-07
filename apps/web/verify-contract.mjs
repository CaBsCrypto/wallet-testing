import { Contract, Networks, nativeToScVal, rpc, Address, TransactionBuilder, Account } from '@stellar/stellar-sdk';

const CONTRACT_ID = "CAAEXIKZ6XNQD2C2EQLM7WFSJE3JPLKYYAVRKPZV24FX67TJBLQLWNBX";
const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);
const OWNER = "GD2TBM7BEWAQGM5UPVDYKEFYEDEQLLJMBTTUGFVSWO67TQWGFPOV5SAQ";

async function main() {
    console.log(`Querying contract ${CONTRACT_ID} for pet of ${OWNER}...`);
    try {
        const contract = new Contract(CONTRACT_ID);
        const op = contract.call("get_pet", new Address(OWNER).toScVal());

        const source = new Account(OWNER, "0");
        const tx = new TransactionBuilder(source, { fee: "100", networkPassphrase: Networks.TESTNET })
            .addOperation(op)
            .setTimeout(30)
            .build();

        const result = await server.simulateTransaction(tx);
        console.log("Simulation Status:", result.status); // SUCCESS means contract exists and call succeeded (even if returning null)

        if (result.error) {
            console.error("Simulation Error:", result.error);
        } else {
            console.log("Contract is reachable!");
        }

    } catch (e) {
        console.error("Failed to query contract:", e.message);
    }
}

main();
