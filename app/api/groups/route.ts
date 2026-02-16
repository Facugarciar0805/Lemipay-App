import { NextResponse } from "next/server";
import { rpc, Contract, scValToNative, nativeToScVal, TransactionBuilder, Account } from "@stellar/stellar-sdk";
import { getWalletGroups } from "@/lib/supabase/wallet-groups";
import {
    STELLAR_CONFIG,
    getSorobanServer,
    formatXlm
} from "@/lib/stellar-client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    try {
        // 1. IDs desde Supabase
        const groupIds = await getWalletGroups(address);
        const server = getSorobanServer();
        const networkPassphrase = STELLAR_CONFIG.networkPassphrase;

        // 2. Definición de contratos
        const groupsContract = new Contract(STELLAR_CONFIG.contracts.groups);
        const treasuryContract = new Contract(STELLAR_CONFIG.contracts.treasury);

        // Necesitamos una instancia de Account para construir la transacción de simulación
        // Usamos el address del usuario con una secuencia de "0" ya que no vamos a enviarla realmente
        const sourceAccount = new Account(address, "0");

        const groupsData = await Promise.all(groupIds.map(async (id) => {
            try {
                const bigId = BigInt(id);
                const scId = nativeToScVal(bigId, { type: "u64" });

                // --- SIMULACIÓN GET_GROUP ---
                // Construimos la transacción completa para que Soroban la acepte
                const txGroup = new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase })
                    .addOperation(groupsContract.call("get_group", scId))
                    .setTimeout(0)
                    .build();

                const groupSim = await server.simulateTransaction(txGroup);

                if (!rpc.Api.isSimulationSuccess(groupSim)) {
                    console.error(`Simulación fallida para grupo ${id}`);
                    return null;
                }
                const groupInfo = scValToNative(groupSim.result.retval);

                // --- SIMULACIÓN BALANCE TOTAL ---
                const txRounds = new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase })
                    .addOperation(treasuryContract.call("get_group_rounds", scId))
                    .setTimeout(0)
                    .build();

                const roundsSim = await server.simulateTransaction(txRounds);

                let totalStroops = BigInt(0);
                if (rpc.Api.isSimulationSuccess(roundsSim)) {
                    const roundIds: bigint[] = scValToNative(roundsSim.result.retval);

                    for (const rId of roundIds) {
                        const txRound = new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase })
                            .addOperation(treasuryContract.call("get_fund_round", nativeToScVal(rId, { type: "u64" })))
                            .setTimeout(0)
                            .build();

                        const rSim = await server.simulateTransaction(txRound);
                        if (rpc.Api.isSimulationSuccess(rSim)) {
                            const rData = scValToNative(rSim.result.retval);
                            totalStroops += BigInt(rData.funded_amount);
                        }
                    }
                }

                return {
                    id: id.toString(),
                    name: `Grupo #${id}`,
                    member_count: groupInfo.members.length,
                    balance: `${formatXlm(totalStroops)} USDC`, // Usa tus 7 decimales
                    color: Number(id) % 2 === 0 ? "primary" : "secondary",
                };
            } catch (err) {
                console.error(`Error procesando grupo ${id}:`, err);
                return null;
            }
        }));

        return NextResponse.json({
            groups: groupsData.filter(g => g !== null)
        });

    } catch (error) {
        console.error("Error crítico en API de grupos:", error);
        return NextResponse.json({ groups: [] }, { status: 500 });
    }
}