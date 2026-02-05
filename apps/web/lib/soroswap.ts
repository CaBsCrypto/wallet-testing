import {
    Address,
    Contract,
    Keypair,
    nativeToScVal,
    scValToNative, // Import this
    xdr,
    TransactionBuilder,
    Operation,
    Asset,
    Networks,
    rpc
} from '@stellar/stellar-sdk';

// Testnet Constants
export const ROUTER_ADDRESS = "CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD";
// USDC Issuer on Testnet
export const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const RPC_URL = "https://soroban-testnet.stellar.org";
const SERVER = new rpc.Server(RPC_URL);
const HORIZON_URL = "https://horizon-testnet.stellar.org";
// We don't need the full Horizon class if we just fetch
// But let's check sdk exports.
// Assuming 'Horizon' is exported from sdk.

// Helper to fetch account via Horizon
async function getHorizonAccount(address: string) {
    const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
    if (!res.ok) throw new Error("Account not found");
    return await res.json();
}

const NETWORK_PASSPHRASE = Networks.TESTNET;

// --- Helpers ---

export function getNativeContractId() {
    return Asset.native().contractId(NETWORK_PASSPHRASE);
}

export function getUSDCContractId() {
    const asset = new Asset("USDC", USDC_ISSUER);
    return asset.contractId(NETWORK_PASSPHRASE);
}

export async function checkUSDCTrust(userAddress: string): Promise<boolean> {
    try {
        const account = await getHorizonAccount(userAddress);
        return account.balances.some((b: any) =>
            (b.asset_type === 'credit_alphanum4' || b.asset_type === 'credit_alphanum12') &&
            b.asset_code === 'USDC' &&
            b.asset_issuer === USDC_ISSUER
        );
    } catch (e) {
        console.error("Error checking trust:", e);
        return false;
    }
}

export async function getUSDCBalance(userAddress: string): Promise<string> {
    try {
        const account = await getHorizonAccount(userAddress);
        const bal = account.balances.find((b: any) =>
            (b.asset_type === 'credit_alphanum4' || b.asset_type === 'credit_alphanum12') &&
            b.asset_code === 'USDC' &&
            b.asset_issuer === USDC_ISSUER
        );
        return bal ? bal.balance : "0.00";
    } catch (e) {
        // console.error("Error fetching balance:", e);
        return "0.00";
    }
}

export async function trustUSDC(userAddress: string) {
    const op = Operation.changeTrust({
        asset: new Asset("USDC", USDC_ISSUER)
    });
    // Skip simulation for classic operations
    return await submitTx(userAddress, [op], undefined, true);
}

export async function submitTx(
    sourceAddress: string,
    operations: xdr.Operation[],
    extraSigner?: Keypair,
    skipSimulation: boolean = false
): Promise<string> {
    const account = await SERVER.getAccount(sourceAddress);

    let tx = new TransactionBuilder(account, { fee: "1000", networkPassphrase: NETWORK_PASSPHRASE })
        .setTimeout(30);

    operations.forEach(op => tx.addOperation(op));

    const builtTx = tx.build();

    // ONLY simulate (prepare) if it involves Soroban smart contracts
    // For classic ops, we skip prepareTransaction because it doesn't handle them well in mixed mode
    let transactionToSign = builtTx;
    if (!skipSimulation) {
        transactionToSign = await SERVER.prepareTransaction(builtTx);
    }
    // REMOVED redundant signing here. We will sign at the end to ensure order/uniqueness relative to user sig.

    const { signTransaction } = await import('@stellar/freighter-api');
    const signedTxBundle = await signTransaction(transactionToSign.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });

    if (signedTxBundle.error) {
        throw new Error(signedTxBundle.error);
    }

    const finalTx = TransactionBuilder.fromXDR(signedTxBundle.signedTxXdr, NETWORK_PASSPHRASE);
    if (extraSigner) {
        finalTx.sign(extraSigner);
    }

    // console.log("Submitting XDR:", finalTx.toXDR());
    const sendVal = await SERVER.sendTransaction(finalTx);

    if (sendVal.status !== "PENDING") {
        console.error("Transaction Submission Failed Response:", JSON.stringify(sendVal, null, 2));
        throw new Error(`Transaction failed: ${sendVal.status} - ${(sendVal as any).errorResultXdr || 'Check console for details'}`);
    }

    const txHash = sendVal.hash;
    let attempts = 0;
    while (attempts < 20) {
        await new Promise(r => setTimeout(r, 2000));
        let txInfo = await SERVER.getTransaction(txHash);
        if (txInfo.status === "SUCCESS") return txHash;
        if (txInfo.status === "FAILED") throw new Error("Transaction Failed");
        attempts++;
    }
    return txHash;
}

// --- Atomic Features (Single Op) ---

export async function approveToken(
    userAddress: string,
    tokenAddress: string,
    amount: number
) {
    console.log("Approving token:", tokenAddress, "for user:", userAddress);
    const router = new Contract(ROUTER_ADDRESS);
    const amountBig = BigInt(Math.floor(amount * 10000000));

    // Debug Address Creation
    let tokenScAddress;
    try {
        const tokenContract = new Contract(tokenAddress);
        tokenScAddress = tokenContract.address().toScAddress();
    } catch (e) {
        console.error("Error creating Token Address:", e);
        throw e;
    }

    let routerScVal;
    try {
        routerScVal = router.address().toScVal();
    } catch (e) {
        console.error("Error creating Router Address ScVal:", e);
        throw e;
    }

    const latestLedger = await SERVER.getLatestLedger();
    const expirationLedger = latestLedger.sequence + 100000; // ~6 days

    const opApprove = Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(new xdr.InvokeContractArgs({
            contractAddress: tokenScAddress,
            functionName: "approve",
            args: [
                new Address(userAddress).toScVal(),
                routerScVal,
                nativeToScVal(amountBig, { type: "i128" }),
                nativeToScVal(expirationLedger, { type: "u32" })
            ]
        })),
        auth: []
    });

    return await submitTx(userAddress, [opApprove]);
}

export async function swapTokensOnly(
    userAddress: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: number
) {
    const router = new Contract(ROUTER_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 600;
    const amountInBig = BigInt(Math.floor(amountIn * 10000000));

    // Valid Path Construction for Swap
    const pathScVal = xdr.ScVal.scvVec(
        [
            new Contract(tokenIn).address().toScVal(),
            new Contract(tokenOut).address().toScVal()
        ]
    );

    const opSwap = Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(new xdr.InvokeContractArgs({
            contractAddress: router.address().toScAddress(),
            functionName: "swap_exact_tokens_for_tokens",
            args: [
                nativeToScVal(amountInBig, { type: "i128" }),
                nativeToScVal(BigInt(0), { type: "i128" }), // amountOutMin 0 for demo
                pathScVal,
                new Address(userAddress).toScVal(),
                nativeToScVal(BigInt(deadline), { type: "u64" })
            ]
        })),
        auth: []
    });

    return await submitTx(userAddress, [opSwap]);
}

// ... (Existing exports)

export async function getEstimatedOutput(
    userAddress: string,
    amountIn: number,
    tokenIn?: string,
    tokenOut?: string
): Promise<string> {
    const tIn = tokenIn || getNativeContractId();
    const tOut = tokenOut || getUSDCContractId();

    const router = new Contract(ROUTER_ADDRESS);
    const amountInBig = BigInt(Math.floor(amountIn * 10000000));

    const pathScVal = xdr.ScVal.scvVec([
        new Contract(tIn).address().toScVal(),
        new Contract(tOut).address().toScVal()
    ]);

    const op = Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(new xdr.InvokeContractArgs({
            contractAddress: router.address().toScAddress(),
            functionName: "get_amounts_out",
            args: [
                nativeToScVal(amountInBig, { type: "i128" }),
                pathScVal
            ]
        })),
        auth: []
    });

    try {
        const account = await SERVER.getAccount(userAddress);
        const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: NETWORK_PASSPHRASE })
            .addOperation(op)
            .setTimeout(30)
            .build();

        const sim = await SERVER.simulateTransaction(tx);

        if (rpc.Api.isSimulationSuccess(sim)) {
            const resultScVal = sim.result.retval;
            // Result is Vec<i128> (amounts). We want the last one (amountOut)
            const amounts = scValToNative(resultScVal) as bigint[];
            const amountOutBig = amounts[amounts.length - 1]; // Last item in path is output

            // Format to 2 decimals
            const val = Number(amountOutBig) / 10000000;
            return val.toFixed(2);
        }
    } catch (e) {
        console.error("Simulation failed:", e);
    }
    return "0.00";
}

// Legacy function to satisfy imports temporarily or for advanced wallets
export async function mintMockToken(userAddress: string) { return {} as any; }
// --- LP Features ---

export async function getSoroswapRatio(userAddress: string, tokenIn: string, tokenOut: string): Promise<number> {
    // "1 unit" of Token In
    try {
        const est = await getEstimatedOutput(userAddress, 1, tokenIn, tokenOut);
        const val = parseFloat(est);
        console.log(`Ratio Est for 1 IN: ${val}`);
        if (val === 0) {
            console.warn("Ratio is 0, defaulting to 0.2 for demo");
            return 0.2; // Fallback so user can proceed
        }
        return val;
    } catch (e) {
        console.error("Failed to get ratio", e);
        return 0.2; // Fallback
    }
}

// XLM-USDC Pair Address (identified from logs)
export const XLM_USDC_PAIR = "CCBX3NZTCQLQFSPG7HBOKL4P2RVPOPVFHDNRTOSCCJWBTPL2GHEH7RQS";

export async function getLPBalance(userAddress: string): Promise<string> {
    try {
        const pair = new Contract(XLM_USDC_PAIR);
        const op = Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(new xdr.InvokeContractArgs({
                contractAddress: pair.address().toScAddress(),
                functionName: "balance",
                args: [new Address(userAddress).toScVal()]
            })),
            auth: []
        });

        // Simulate to get return value (read-only)
        const account = await SERVER.getAccount(userAddress);
        const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: NETWORK_PASSPHRASE })
            .addOperation(op)
            .setTimeout(30)
            .build();

        const sim = await SERVER.simulateTransaction(tx);
        if (rpc.Api.isSimulationSuccess(sim)) {
            const bal = scValToNative(sim.result.retval);
            const val = Number(bal) / 10000000; // Assuming 7 decimals for LP token too
            return val.toFixed(7);
        }
    } catch (e) {
        console.error("Failed to fetch LP Balance:", e);
    }
    return "0.0000000";
}

export async function addLiquidity(
    userAddress: string,
    tokenA: string, // XLM (Native)
    tokenB: string, // USDC
    amountA: number,
    amountB: number
) {
    const router = new Contract(ROUTER_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const amountADesired = BigInt(Math.floor(amountA * 10000000));
    const amountBDesired = BigInt(Math.floor(amountB * 10000000));

    console.log(`Adding Liquidity: ${amountA} XLM + ${amountB} USDC`);

    // Using add_liquidity (since Native is likely wrapped or treated as token)
    // Note: If one is native, we might need 'add_liquidity_native' if standard Soroswap implementation,
    // but standard Uniswap V2 style generic add_liquidity works if Native is wrapped.
    // However, usually Router has `add_liquidity` for 2 tokens.
    // Let's assume standard `add_liquidity` takes contract addresses.

    const op = Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(new xdr.InvokeContractArgs({
            contractAddress: router.address().toScAddress(),
            functionName: "add_liquidity",
            args: [
                new Contract(tokenA).address().toScVal(),
                new Contract(tokenB).address().toScVal(),
                nativeToScVal(amountADesired, { type: "i128" }),
                nativeToScVal(amountBDesired, { type: "i128" }),
                nativeToScVal(BigInt(0), { type: "i128" }), // min A (slippage 100%)
                nativeToScVal(BigInt(0), { type: "i128" }), // min B
                new Address(userAddress).toScVal(),
                nativeToScVal(BigInt(deadline), { type: "u64" })
            ]
        })),
        auth: []
    });

    return await submitTx(userAddress, [op]);
}

export async function swapTokens(a: any, b: any, c: any, d: any) { return ""; } // Legacy stub
