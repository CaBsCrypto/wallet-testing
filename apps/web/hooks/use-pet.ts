"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { getPet, mintPet, addXp, battlePet, changePetDesign, getPetStats, trainStat, buyPotion, buySmallPotion, Pet, PetStats } from '../lib/pet-contract';

export function usePet() {
    const { address, isConnected } = useWallet();
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
            console.error("fetchPet Error stringified:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
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
        try {
            const txHash = await mintPet(address, name);
            // Wait a bit for network propagation (simple trick, better to use polling)
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const train = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const txHash = await addXp(address, 50); // Fixed 50 XP per training for MVP
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const battle = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const txHash = await battlePet(address);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const evolve = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const txHash = await changePetDesign(address, "dragon");
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const release = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const { releasePet } = await import('../lib/pet-contract');
            const txHash = await releasePet(address);
            setTimeout(() => fetchPet(), 4000); // Should return null after release
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const trainAttribute = async (type: "str" | "agi" | "int") => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const txHash = await trainStat(address, type);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const buyEnergyPotion = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const txHash = await buyPotion(address);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const buySmallEnergyPotion = async () => {
        if (!address) return;
        setIsLoading(true);
        setError(null);
        try {
            const txHash = await buySmallPotion(address);
            setTimeout(() => fetchPet(), 4000);
            return txHash;
        } catch (err: any) {
            setError(err.message);
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
        train, // Original train (adds XP directly), kept for compatibility or remove? Let's keep.
        battle,
        evolve,
        release,
        trainAttribute,
        buyEnergyPotion,
        buySmallEnergyPotion,
        refresh: fetchPet
    };
}
