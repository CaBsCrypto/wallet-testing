"use client";

import { useState, useEffect } from 'react';
import { isAllowed, setAllowed, requestAccess, getAddress } from '@stellar/freighter-api';

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    isConnecting: boolean;
}

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        isConnected: false,
        address: null,
        isConnecting: true,
    });

    const connect = async () => {
        setState(prev => ({ ...prev, isConnecting: true }));
        try {
            // requestAccess triggers the popup and returns the address if authorized
            const response = await requestAccess();
            // The response itself might be the object or contain address/error
            // Based on types seen in getAddress.ts: { address: string, error?: ... }
            if (response && response.address) {
                setState({
                    isConnected: true,
                    address: response.address,
                    isConnecting: false
                });
                return response.address;
            }
        } catch (e) {
            console.error("Connection failed", e);
        }
        setState(prev => ({ ...prev, isConnecting: false }));
        return null;
    };

    const checkConnection = async () => {
        try {
            // isAllowed returns { isAllowed: boolean }
            const allowedRes = await isAllowed();
            if (allowedRes && allowedRes.isAllowed) {
                const { address } = await getAddress();
                if (address) {
                    setState({
                        isConnected: true,
                        address,
                        isConnecting: false
                    });
                    return;
                }
            }
        } catch (e) {
            console.warn("Freighter check failed", e);
        }
        setState(prev => ({ ...prev, isConnecting: false }));
    };

    useEffect(() => {
        checkConnection();
    }, []);

    return { ...state, connect };
}
