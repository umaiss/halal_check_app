import { HalalCheckResponse } from '../../services/types';

export interface ScanHistoryItem {
    id: string;
    timestamp: number;
    ingredients: string;
    imageUri?: string;
    frontImage?: string;
    backImage?: string;
    ingredientsImage?: string;
    halalCheckResult: HalalCheckResponse | null;
}

export interface ScanHistoryState {
    items: ScanHistoryItem[];
    maxItems: number;
}
