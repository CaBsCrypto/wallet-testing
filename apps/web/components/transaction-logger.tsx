"use client";

import { useTransactionLogger, LogType } from "../contexts/transaction-context";
import { Terminal, X, ChevronUp, ChevronDown, Check, AlertCircle, Activity, PenTool, Globe } from "lucide-react";
import { useEffect, useRef } from "react";

export function TransactionLogger() {
    const { logs, isOpen, setIsOpen, clearLogs } = useTransactionLogger();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isOpen]);

    if (logs.length === 0 && !isOpen) return null;

    const getIcon = (type: LogType) => {
        switch (type) {
            case 'success': return <Check className="w-4 h-4 text-green-400" />;
            case 'error': return <X className="w-4 h-4 text-red-400" />;
            case 'signature': return <PenTool className="w-4 h-4 text-pink-400" />;
            case 'network': return <Globe className="w-4 h-4 text-blue-400" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const getColor = (type: LogType) => {
        switch (type) {
            case 'success': return 'text-green-300';
            case 'error': return 'text-red-300';
            case 'signature': return 'text-pink-300';
            case 'network': return 'text-blue-300';
            default: return 'text-slate-300';
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 w-96 z-50 transition-all duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'}`}>
            <div className="bg-slate-950 border border-slate-800 rounded-lg shadow-2xl flex flex-col max-h-96 overflow-hidden">
                {/* Header */}
                <div
                    className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-purple-400" />
                        <span className="font-mono text-xs font-bold text-slate-300">BLOCKCHAIN_CONSOLE</span>
                        {logs.length > 0 && (
                            <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">
                                {logs.length}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); clearLogs(); }}
                            className="text-[10px] text-slate-500 hover:text-red-400 uppercase tracking-wider"
                        >
                            Clear
                        </button>
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
                    </div>
                </div>

                {/* Logs Body */}
                {isOpen && (
                    <div className="p-4 space-y-3 overflow-y-auto font-mono text-xs bg-slate-950/90 backdrop-blur-sm">
                        {logs.length === 0 && (
                            <div className="text-center text-slate-600 italic py-4">
                                Waiting for transaction activity...
                            </div>
                        )}
                        {logs.map((log) => (
                            <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">{getIcon(log.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className={`font-bold ${getColor(log.type)}`}>
                                                {log.message}
                                            </span>
                                            <span className="text-[10px] text-slate-600 shrink-0 ml-2">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit', fractionalSecondDigits: 2 })}
                                            </span>
                                        </div>
                                        {log.details && (
                                            <div className="mt-1 pl-2 border-l-2 border-slate-800 text-slate-500 break-all whitespace-pre-wrap">
                                                {log.details}
                                            </div>
                                        )}
                                        {log.hash && (
                                            <div className="mt-1">
                                                <a
                                                    href={`https://stellar.expert/explorer/testnet/tx/${log.hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline hover:text-blue-400 block truncate"
                                                >
                                                    View on Explorer ↗
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>
        </div>
    );
}
