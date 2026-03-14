import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const uploadImageToSupabase = async (uri: string, folder: string = 'halal-images') => {
    try {
        const fileName = `${Date.now()}-${uri.split('/').pop()}`;
        const filePath = `${folder}/${fileName}`;

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
