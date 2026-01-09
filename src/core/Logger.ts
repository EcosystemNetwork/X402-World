import { create } from 'zustand';

export interface LogEntry {
    id: number;
    timestamp: number;
    message: string;
    type: 'info' | 'warn' | 'error';
}

interface LoggerState {
    logs: LogEntry[];
    addLog: (message: string, type?: 'info' | 'warn' | 'error') => void;
    clearLogs: () => void;
}

let nextId = 0;

export const useLogger = create<LoggerState>((set) => ({
    logs: [],
    addLog: (message, type = 'info') => set((state) => {
        const newLog: LogEntry = {
            id: nextId++,
            timestamp: Date.now(),
            message,
            type
        };
        // Keep last 50 logs
        const newLogs = [newLog, ...state.logs].slice(0, 50);
        return { logs: newLogs };
    }),
    clearLogs: () => set({ logs: [] })
}));

// Helper for non-React usage
export const Log = {
    info: (msg: string) => useLogger.getState().addLog(msg, 'info'),
    warn: (msg: string) => useLogger.getState().addLog(msg, 'warn'),
    error: (msg: string) => useLogger.getState().addLog(msg, 'error')
};
