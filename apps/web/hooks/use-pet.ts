"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { getPet, mintPet, addXp, battlePet, changePetDesign, getPetStats, trainStat, buyPotion, buySmallPotion, playCryptoHunt, submitGameScore, Pet, PetStats } from '../lib/pet-contract';
import { useTransactionLogger } from '../contexts/transaction-context';

export function usePet() {
    const { address, isConnected } = useWallet();
    const { addLog } = useTransactionLogger();
    const [pet, setPet] = useState<Pet | null>(null);
    const [stats, setStats] = useState<PetStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPet = useCallback(async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            const data = await getPet(address);
            const statsData = await getPetStats(address);
            setPet(data);
            setStats(statsData);
            setError(null);
        } catch (err) {
            console.error("fetchPet Error raw:", err);
            // setError("Failed to fetch pet"); // Optional: don't show error if just no pet found
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        if (isConnected && address) {
            fetchPet();
        } else {
            setPet(null);
            setStats(null);
        }
    }, [isConnected, address, fetchPet]);

    const mint = async (name: string) => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Preparing to Mint Pet', `Name: ${name}`);
        try {
            const txHash = await mintPet(address, name);
            addLog('success', 'Pet Minted Successfully!', undefined, txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Mint Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const train = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Training Pet', 'Gaining XP...');
        try {
            const txHash = await addXp(address, 50);
            addLog('success', 'Training Complete', '+50 XP', txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Training Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const gainXp = async (amount: number, reason: string = "Bonus XP") => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Gaining XP', `${reason}: +${amount} XP`);
        try {
            const txHash = await addXp(address, amount);
            addLog('success', 'XP Gained!', `${reason} Complete`, txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'XP Gain Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const battle = async (move: "Fire" | "Water" | "Grass") => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Starting Battle', `Move: ${move}`);
        try {
            const txHash = await battlePet(address, move);
            addLog('success', 'Battle Recorded', 'Check the result!', txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Battle Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const evolve = async (design: string) => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Initiating Evolution', `Design: ${design}`);
        try {
            const txHash = await changePetDesign(address, design);
            addLog('success', 'Evolution Successful!', `Design changed to ${design}`, txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Evolution Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const release = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('warning', 'Releasing Pet', 'This action is permanent.');
        try {
            const { releasePet } = await import('../lib/pet-contract');
            const txHash = await releasePet(address);
            addLog('success', 'Pet Released', 'Goodbye, old friend.', txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Release Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const trainAttribute = async (type: "str" | "agi" | "int") => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', `Training ${type.toUpperCase()}`, 'Improving stats...');
        try {
            const txHash = await trainStat(address, type);
            addLog('success', 'Stat Improved!', `Trained ${type}`, txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Stat Training Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const buyEnergyPotion = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Buying Energy Potion', 'Cost: 50 Gold');
        try {
            const txHash = await buyPotion(address);
            addLog('success', 'Potion Purchased', '+100 Energy', txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Purchase Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const buySmallEnergyPotion = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Buying Small Potion', 'Cost: 10 Gold');
        try {
            const txHash = await buySmallPotion(address);
            addLog('success', 'Small Potion Purchased', '+20 Energy', txHash);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Purchase Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const hunt = async (moves: number[]) => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Starting Crypto Hunt', `Moves: ${moves.length}`);
        try {
            const txHash = await playCryptoHunt(address, moves);
            addLog('success', 'Hunt Complete', 'Check rewards!', txHash);
            await fetchPet();
            setTimeout(() => fetchPet(), 2000);
            return txHash;
        } catch (err: any) {
            console.error("Hunt Hook Error:", err);
            setError(err.message);
            addLog('error', 'Hunt Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    const submitScore = async (score: number, gameId: string) => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        addLog('info', 'Submitting Score', `Game: ${gameId}, Score: ${score}`);
        try {
            const txHash = await submitGameScore(address, score, gameId);
            addLog('success', 'Score Submitted', 'Rewards claimed!', txHash);
            await fetchPet();
            setTimeout(() => fetchPet(), 2000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            addLog('error', 'Submission Failed', err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        pet,
        stats,
        isLoading,
        error,
        mint,
        train,
        battle,
        hunt,
        evolve,
        release,
        trainAttribute,
        buyEnergyPotion,
        buySmallEnergyPotion,
        refresh: fetchPet,
        submitScore,
        gainXp
    };
}
