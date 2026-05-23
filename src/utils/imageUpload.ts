import { Platform } from 'react-native';
import axiosInstance from '../api/axiosBase';
import { API_ENDPOINTS } from './constant';

/**
 * Upload a single image to S3 via the backend endpoint.
 * Uses native multipart/form-data — no base64 conversion needed.
 *
 * S3 key structure: product-images/{productName}/{timestamp}_{filename}
 *
 * @param uri          Local file URI of the image (e.g. file:///...)
 * @param productName  Product name used as the S3 sub-folder (optional)
 * @returns            Public S3 URL of the uploaded image
 */
export const uploadImageToBackend = async (uri: string, productName?: string): Promise<string> => {
    try {
        const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;

        // Ensure correct URI format for each platform
        const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;

        const formData = new FormData();
        formData.append('images', {
            uri: fileUri,
            type: 'image/jpeg',
            name: fileName,
        } as any);

        // Send productName so the backend can nest it under product-images/{productName}/
        if (productName && productName.trim().length > 0) {
            formData.append('productName', productName.trim());
        }

        const response = await axiosInstance.post(
            API_ENDPOINTS.UPLOAD_IMAGES,
            formData,
            {
                headers: {
                    // Do NOT set Content-Type manually — React Native's XHR will
                    // set it as 'multipart/form-data; boundary=--XXX' automatically.
                    // Manually setting it strips the boundary and causes a network error.
                    'Content-Type': undefined,
                },
                timeout: 60000, // Images take longer than regular API calls
            }
        );

        const urls: string[] = response.data?.urls;
        if (!urls || urls.length === 0) {
            throw new Error('No URL returned from upload endpoint.');
        }

        return urls[0];
    } catch (error) {
        console.error('Error in uploadImageToBackend:', error);
        throw error;
    }
};
