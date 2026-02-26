import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanHistoryItem } from '../redux/slices/scanHistory/types';

const STORAGE_KEY = '@scan_history';
const MAX_ITEMS = 50;

export const scanHistoryStorage = {
    // Get all scan history
    async getHistory(): Promise<ScanHistoryItem[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error('Error loading scan history:', error);
            return [];
        }
    },

    // Add new scan to history
    async addScan(scan: Omit<ScanHistoryItem, 'id' | 'timestamp'>): Promise<ScanHistoryItem[]> {
        try {
            const history = await this.getHistory();

            const newScan: ScanHistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                ...scan,
            };

            // Add to beginning (newest first)
            const updatedHistory = [newScan, ...history];

            // Keep only MAX_ITEMS
            const trimmedHistory = updatedHistory.slice(0, MAX_ITEMS);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
            return trimmedHistory;
        } catch (error) {
            console.error('Error adding scan to history:', error);
            throw error;
        }
    },

    // Delete specific scan
    async deleteScan(id: string): Promise<ScanHistoryItem[]> {
        try {
            const history = await this.getHistory();
            const updatedHistory = history.filter(item => item.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
            return updatedHistory;
        } catch (error) {
            console.error('Error deleting scan from history:', error);
            throw error;
        }
    },

    // Clear all history
    async clearHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing scan history:', error);
            throw error;
        }
    },
};
