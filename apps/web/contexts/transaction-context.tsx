"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LogType = 'info' | 'success' | 'error' | 'warning' | 'signature' | 'network';

export interface LogEntry {
    id: string;
    timestamp: number;
    type: LogType;
    message: string;
    details?: string;
    hash?: string;
}

interface TransactionContextType {
    logs: LogEntry[];
    addLog: (type: LogType, message: string, details?: string, hash?: string) => void;
    clearLogs: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const addLog = (type: LogType, message: string, details?: string, hash?: string) => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            type,
            message,
            details,
            hash
        };

        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs

        // Auto-open on important events
        if (type === 'signature' || type === 'error' || type === 'success') {
            setIsOpen(true);
        }
    };

    const clearLogs = () => setLogs([]);

    return (
        <TransactionContext.Provider value={{ logs, addLog, clearLogs, isOpen, setIsOpen }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactionLogger() {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransactionLogger must be used within a TransactionProvider');
    }
    return context;
}
