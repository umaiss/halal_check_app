import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const uploadImageToSupabase = async (uri: string, folder: string = 'halal-images', productName?: string) => {
    try {
        const fileName = `${Date.now()}-${uri.split('/').pop()}`;
        
        let pathFolder = folder;
        const cleanProductName = productName
            ? productName.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '_').replace(/_+/g, '_')
            : 'unnamed_product';

        if (folder === 'halal-images') {
            // Replace generic 'halal-images' folder with product name
            pathFolder = cleanProductName;
        } else {
            // For other folders (like 'improvement-images'), nest under it
            pathFolder = `${folder}/${cleanProductName}`;
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
