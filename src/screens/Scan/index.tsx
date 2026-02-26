import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Linking, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
// 1. Core Camera components
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
// 2. Text Recognition - using ML Kit for static image processing
import TextRecognition from 'react-native-text-recognition';
// 3. Navigation types
import { RootStackParamList, BottomTabParamList } from '../../navigation/types/RootParamList';
import Icon from 'react-native-vector-icons/Ionicons';
import Theme from '../../theme/theme';

type ScanNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'Scan'>,
    NativeStackNavigationProp<RootStackParamList>
>;

function Scan() {
    const navigation = useNavigation<ScanNavigationProp>();

    // --- 1. Permission and Device Setup ---
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);

    // State management
    const [isProcessing, setIsProcessing] = useState(false);

    // Request permissions on component load
    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    // --- 2. Process Captured Image with Text Recognition ---
    const processImageWithTextRecognition = async (imagePath: string) => {
        try {
            console.log('Processing image:', imagePath);

            // Process the image file with ML Kit Text Recognition
            const result = await TextRecognition.recognize(imagePath);
            // const result = null

            console.log('Text Recognition Result:', JSON.stringify(result, null, 2));

            // Extract text from result
            let extractedText = '';

            if (result && result.text) {
                // ML Kit returns text directly
                extractedText = result.text.trim();
            } else if (result && result.blocks && Array.isArray(result.blocks) && result.blocks.length > 0) {
                // Extract text from blocks if text property doesn't exist
                extractedText = result.blocks
                    .map((block: any) => {
                        if (typeof block === 'string') return block;
                        return block.text || block.blockText || '';
                    })
                    .filter((text: string) => text && text.length > 0)
                    .join(' ');
            }

            if (extractedText.length > 0) {
                // Clean and format the extracted text
                const cleanedText = extractedText
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\n+/g, ' ') // Replace newlines with space
                    .trim(); // Remove leading/trailing whitespace

                console.log("Raw extracted text:", extractedText);
                console.log("Cleaned extracted text:", cleanedText);

                return cleanedText;
            }

            return null;
        } catch (error) {
            console.error('Error processing image with text recognition:', error);
            throw error;
        }
    };

    // --- 3. Capture and Process Image ---
    const captureAndProcessImage = async () => {
        if (!cameraRef.current || !device) {
            console.log('Camera not ready');
            return;
        }

        try {
            setIsProcessing(true);

            // Capture photo
            const photo = await cameraRef.current.takePhoto({
                flash: 'off',
            });

            console.log('Photo captured:', photo.path);

            // Set image path - ML Kit expects file:// URI on Android, direct path on iOS
            let imagePath: string;
            let imageUri: string;

            if (Platform.OS === 'android') {
                // Android: ensure file:// prefix
                imagePath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
                imageUri = imagePath;
            } else {
                // iOS: use direct path
                imagePath = photo.path.startsWith('file://') ? photo.path.replace('file://', '') : photo.path;
                imageUri = `file://${imagePath}`;
            }

            console.log('Image path for processing:', imagePath);

            // Process the captured image
            const extractedText = await processImageWithTextRecognition(imagePath);

            // Navigate to results screen
            if (extractedText) {
                navigation.navigate('IngredientsResult', {
                    ingredients: extractedText,
                    imageUri: imageUri,
                });
            } else {
                // Show error and stay on camera screen
                Alert.alert('No Text Detected', 'Please try again with better lighting and clear text.');
            }

        } catch (error) {
            console.error('Error capturing/processing image:', error);
            Alert.alert('Error', 'Error processing image. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 3. Permission and Device Error Handling ---
    if (!hasPermission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="camera-outline" size={64} color={Theme.color.COLOT_SUBTEXT} />
                    <Text style={styles.errorTitle}>Camera Permission Required</Text>
                    <Text style={styles.errorText}>
                        We need camera access to scan ingredient labels
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={() => Linking.openSettings()}
                    >
                        <Text style={styles.permissionButtonText}>Open Settings</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (device == null) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={64} color={Theme.color.COLOR_RED} />
                    <Text style={styles.errorTitle}>No Camera Device Found</Text>
                    <Text style={styles.errorText}>
                        Please ensure your device has a working camera
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // --- 4. Render Camera and Overlay ---
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.cameraContainer}>
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    photo={true}
                />

                {/* --- Enhanced Overlay with Frame and Capture Button --- */}
                <View style={styles.overlay}>
                    {/* Top Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Scan Ingredients</Text>
                        <Text style={styles.headerSubtitle}>Position the label within the frame</Text>
                    </View>

                    {/* Scanning Frame */}
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                        <View style={styles.scanLine} />
                    </View>

                    {/* Capture Button */}
                    <View style={styles.captureButtonContainer}>
                        <TouchableOpacity
                            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
                            onPress={captureAndProcessImage}
                            disabled={isProcessing}
                            activeOpacity={0.8}
                        >
                            <View style={styles.captureButtonInner}>
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <View style={styles.captureIcon} />
                                )}
                            </View>
                        </TouchableOpacity>
                        {!isProcessing && (
                            <Text style={styles.captureHint}>Tap to capture</Text>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    cameraContainer: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingBottom: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    scanFrame: {
        width: '85%',
        aspectRatio: 1,
        alignSelf: 'center',
        position: 'relative',
        marginVertical: 20,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: Theme.color.COLOR_BLUE,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 12,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 12,
    },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Theme.color.COLOR_BLUE,
        opacity: 0.6,
    },
    captureButtonContainer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    captureButtonDisabled: {
        opacity: 0.6,
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.color.COLOR_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
    },
    captureHint: {
        color: 'white',
        fontSize: 14,
        marginTop: 12,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Theme.color.COLOR_TEXT,
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: Theme.color.COLOT_SUBTEXT,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: Theme.color.COLOR_BLUE,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    permissionButtonText: {
        color: Theme.color.COLOR_WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Scan;

