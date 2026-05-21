import { decode } from 'base64-arraybuffer';
import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export const uploadImageToSupabase = async (uri: string, folder?: string, productName?: string) => {
    try {
        const fileName = `${Date.now()}-${uri.split('/').pop()}`;

        const activeFolder = folder ?? 'halal-images';
        let pathFolder = activeFolder;
        const cleanProductName = productName
            ? productName.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '_').replace(/_+/g, '_')
            : 'unnamed_product';

        if (activeFolder === 'halal-images') {
            // Organize standard scans under a dedicated scan-product-images folder
            pathFolder = `scan-product-images/${cleanProductName}`;
        } else {
            // For other folders (like 'improvement-images'), nest under it
            pathFolder = `${activeFolder}/${cleanProductName}`;
        }

        const filePath = `${pathFolder}/${fileName}`;

        // Read file as base64
        const base64 = await RNFS.readFile(uri, 'base64');
        const arrayBuffer = decode(base64);

        const { data, error } = await supabase.storage
            .from('halal-images')
            .upload(filePath, arrayBuffer, {
                contentType: 'image/jpeg'
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('halal-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadImageToSupabase:', error);
        throw error;
    }
};
