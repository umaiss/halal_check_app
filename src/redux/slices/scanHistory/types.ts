import { HalalCheckResponse } from '../../services/types';

export interface ScanHistoryItem {
    id: string;
    timestamp: number;
    ingredients: string;
    imageUri?: string;
    halalCheckResult: HalalCheckResponse | null;
}

export interface ScanHistoryState {
    items: ScanHistoryItem[];
    maxItems: number;
}
