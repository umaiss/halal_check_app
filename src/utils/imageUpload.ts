import ImageResizer from '@bam.tech/react-native-image-resizer';
import { store } from '../redux/store';
import { API_ENDPOINTS, BASE_URL } from './constant';

/**
 * Upload a single image to S3 via the backend endpoint.
 * Uses native multipart/form-data — no base64 conversion needed.
 * Resizes the image client-side to ensure sizes stay under Nginx limits (~150KB).
 *
 * @param uri          Local file URI of the image (e.g. file:///...)
 * @param productName  Product name used as the S3 sub-folder (optional)
 * @returns            Public S3 URL of the uploaded image
 */
export const uploadImageToBackend = async (uri: string, productName?: string): Promise<string> => {
    try {
        // Ensure correct URI format for each platform.
        // Android returns content:// URIs for picked images which must not be prefixed with file://.
        let fileUri = uri;
        if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
            fileUri = `file://${uri}`;
        }

        console.log('Original image path for upload:', fileUri);

        // Resize the image to maximum 1200x1200px at 60% quality.
        // This keeps file size extremely small (usually < 200KB) and avoids 413 Payload Too Large on Nginx.
        let uploadUri = fileUri;
        let uploadName = uri.split('/').pop() || `image_${Date.now()}.jpg`;

        try {
            console.log('Compressing image on client-side...');
            const resized = await ImageResizer.createResizedImage(
                fileUri,
                1200,
                1200,
                'JPEG',
                60,
                0,
                null,
                true
            );
            uploadUri = resized.uri;
            uploadName = resized.name || uploadName;
            console.log('Resized image path:', uploadUri, 'Size:', resized.size);
        } catch (resizeError) {
            console.error('Failed to resize image, uploading original as fallback:', resizeError);
        }

        const formData = new FormData();
        formData.append('images', {
            uri: uploadUri,
            type: 'image/jpeg',
            name: uploadName,
        } as any);

        // Send productName so the backend can nest it under product-images/{productName}/
        if (productName && productName.trim().length > 0) {
            formData.append('productName', productName.trim());
        }

        // Get authentication token manually from Redux store to authorize the request
        const token = store.getState().auth?.token;
        const headers: any = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Use standard fetch instead of Axios.
        // This avoids Axios-specific FormData serialization issues on Android and
        // ensures the multipart boundary is correctly set by the native bridge.
        console.log('Sending upload request to:', `${BASE_URL}${API_ENDPOINTS.UPLOAD_IMAGES}`);
        const response = await fetch(`${BASE_URL}${API_ENDPOINTS.UPLOAD_IMAGES}`, {
            method: 'POST',
            body: formData,
            headers: {
                ...headers,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload response error status:', response.status, 'body:', errorText);
            throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Upload response data:', responseData);

        const urls: string[] = responseData?.urls;
        if (!urls || urls.length === 0) {
            throw new Error('No URL returned from upload endpoint.');
        }

        return urls[0];
    } catch (error) {
        console.error('Error in uploadImageToBackend:', error);
        throw error;
    }
};
