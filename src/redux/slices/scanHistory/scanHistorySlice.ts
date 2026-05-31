import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScanHistoryItem, ScanHistoryState } from './types';
import type { RootState } from '../../store';

const initialState: ScanHistoryState = {
    items: [],
    maxItems: 50,
};

const scanHistorySlice = createSlice({
    name: 'scanHistory',
    initialState,
    reducers: {
        addScanToHistory: (state, action: PayloadAction<Omit<ScanHistoryItem, 'id' | 'timestamp'>>) => {
            const newScan: ScanHistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                ...action.payload,
            };

            // Add to the beginning of the array (newest first)
            state.items.unshift(newScan);

            // Remove oldest items if we exceed maxItems
            if (state.items.length > state.maxItems) {
                state.items = state.items.slice(0, state.maxItems);
            }
        },
        deleteScanFromHistory: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        clearAllHistory: (state) => {
            state.items = [];
        },
    },
});

export const { addScanToHistory, deleteScanFromHistory, clearAllHistory } = scanHistorySlice.actions;

// Selectors
export const selectAllScans = (state: RootState) => state.scanHistory.items;
export const selectScanCount = (state: RootState) => state.scanHistory.items.length;
export const selectScanById = (state: RootState, id: string) =>
    state.scanHistory.items.find(item => item.id === id);

export default scanHistorySlice.reducer;
