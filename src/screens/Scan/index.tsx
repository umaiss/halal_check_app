import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    Linking,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { RootStackParamList } from '../../navigation/types/RootParamList';
import Theme from '../../theme/theme';
import { SmallText, MediumText } from '../../components/text';
import { height, width } from '../../utils/dimensions';

type ScanNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scan'>;
type ScanRouteProp = RouteProp<RootStackParamList, 'Scan'>;

const PHOTO_SLOTS = [
    { k: 'front', label: 'Front of pack', sub: 'Brand & product name', hint: 'Show the front cover of the package.' },
    { k: 'back', label: 'Back of pack', sub: 'Manufacturer, barcode', hint: 'Show the back of the package.' },
    { k: 'ingredients', label: 'Ingredients', sub: 'Full ingredients list', hint: 'Zoom in on the ingredients list.' },
];

function Scan() {
    const navigation = useNavigation<ScanNavigationProp>();
    const route = useRoute<ScanRouteProp>();
    const slotKey = route.params?.slotKey || 'ingredients';

    const slot = PHOTO_SLOTS.find(s => s.k === slotKey) || PHOTO_SLOTS[2];
    const slotIndex = PHOTO_SLOTS.findIndex(s => s.k === slotKey);

    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);

    // Find format with lower photo resolution to keep file sizes small (under Nginx limits)
    // and speed up uploads, while remaining fully readable for Text Recognition.
    const format = React.useMemo(() => {
        if (!device?.formats) return undefined;
        
        // Filter formats that support photo capture and have valid photo dimensions
        const photoFormats = device.formats.filter(f => f.photoWidth && f.photoHeight);
        
        // Find a format close to 1080p (e.g. photoWidth between 1080 and 1920)
        // so that text recognition remains highly accurate, but file size is kept under 1MB.
        const idealFormat = photoFormats.find(f => f.photoWidth >= 1080 && f.photoWidth <= 1920);
        
        return idealFormat || photoFormats.find(f => f.photoWidth <= 1280) || device.formats[0];
    }, [device]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
    const [isShutterPressed, setIsShutterPressed] = useState(false);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission, requestPermission]);

    const handleSelectFromGallery = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
            });

            if (result.didCancel) return;

            if (result.errorCode) {
                Alert.alert('Gallery Error', result.errorMessage || 'Failed to open gallery');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.uri) {
                    navigation.navigate('MainTabs', {
                        screen: 'Home',
                        params: {
                            capturedPhoto: {
                                slotKey,
                                uri: asset.uri,
                            },
                            existingPhotos: route.params?.existingPhotos,
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error selecting from gallery in Scan screen:', error);
            Alert.alert('Error', 'Failed to process gallery selection.');
        }
    };

    const capturePhoto = async () => {
        if (!cameraRef.current || !device) {
            console.log('Camera not ready');
            return;
        }

        try {
            setIsProcessing(true);
            setIsShutterPressed(true);

            const photo = await cameraRef.current.takePhoto({
                flash: flashMode,
            });

            setIsShutterPressed(false);

            let imageUri: string;
            if (Platform.OS === 'android') {
                imageUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
            } else {
                imageUri = `file://${photo.path}`;
            }

            navigation.navigate('MainTabs', {
                screen: 'Home',
                params: {
                    capturedPhoto: {
                        slotKey,
                        uri: imageUri,
                    },
                    existingPhotos: route.params?.existingPhotos,
                }
            });
        } catch (error) {
            console.error('Error capturing photo:', error);
            Alert.alert('Error', 'Failed to capture photo. Please try again.');
            setIsShutterPressed(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSkip = () => {
        navigation.goBack();
    };

    if (!hasPermission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="camera-outline" size={64} color={Theme.color.COLOR_MUTED_2} />
                    <MediumText size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} textStyles={{ marginTop: 20, marginBottom: 8 }}>
                        Camera Permission Required
                    </MediumText>
                    <SmallText size={3.5} color={Theme.color.COLOR_MUTED} textAlign="center" textStyles={{ marginBottom: 30 }}>
                        We need camera access to scan ingredient labels
                    </SmallText>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={() => Linking.openSettings()}
                    >
                        <SmallText size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                            Open Settings
                        </SmallText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (device == null) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={64} color={Theme.color.COLOR_HARAM} />
                    <MediumText size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} textStyles={{ marginTop: 20, marginBottom: 8 }}>
                        No Camera Device Found
                    </MediumText>
                    <SmallText size={3.5} color={Theme.color.COLOR_MUTED} textAlign="center">
                        Please ensure your device has a working camera
                    </SmallText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.cameraContainer}>
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    format={format}
                    isActive={true}
                    photo={true}
                />

                {/* Ambient vignette overlay */}
                <View style={StyleSheet.absoluteFill}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(10, 16, 13, 0.4)' }} />
                </View>

                {/* Top Control Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center' }}>
                        <SmallText size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="rgba(255,255,255,0.6)" textStyles={{ letterSpacing: 1 }}>
                            PHOTO {slotIndex + 1} OF 3
                        </SmallText>
                        <MediumText size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                            {slot.label}
                        </MediumText>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.circleBtn,
                            { backgroundColor: flashMode === 'on' ? '#FFFFFF' : 'rgba(255,255,255,0.1)' }
                        ]}
                        onPress={() => setFlashMode(prev => prev === 'on' ? 'off' : 'on')}
                        activeOpacity={0.7}
                    >
                        <Icon 
                            name={flashMode === 'on' ? 'flash' : 'flash-outline'} 
                            size={18} 
                            color={flashMode === 'on' ? Theme.color.COLOR_INK : '#FFFFFF'} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Viewfinder brackets in center */}
                <View style={styles.viewfinderContainer}>
                    <View style={styles.scanFrame}>
                        {/* Brackets */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    {/* Helper Tip Banners */}
                    <View style={styles.tipWrapper}>
                        <View style={styles.tipContainer}>
                            <Icon name="information-circle" size={14} color={Theme.color.COLOR_PRIMARY_GREEN} style={{ marginRight: 6 }} />
                            <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color="#FFFFFF">
                                {slot.hint}
                            </SmallText>
                        </View>
                    </View>
                </View>

                {/* Progress Indicators */}
                <View style={styles.dotsContainer}>
                    {PHOTO_SLOTS.map((s, idx) => (
                        <View
                            key={s.k}
                            style={[
                                styles.dot,
                                {
                                    width: idx === slotIndex ? 24 : 8,
                                    backgroundColor: idx === slotIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)'
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Bottom Capture Panel */}
                <View style={styles.bottomBar}>
                    {/* Gallery Button */}
                    <TouchableOpacity
                        style={styles.squareBtn}
                        onPress={handleSelectFromGallery}
                        activeOpacity={0.7}
                    >
                        <Icon name="images-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Shutter Button */}
                    <TouchableOpacity
                        style={styles.shutterOuter}
                        onPress={capturePhoto}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.shutterInner,
                            {
                                width: isShutterPressed ? 56 : 68,
                                height: isShutterPressed ? 56 : 68,
                                borderRadius: isShutterPressed ? 28 : 34
                            }
                        ]}>
                            {isProcessing && <ActivityIndicator size="small" color={Theme.color.COLOR_PRIMARY_GREEN} />}
                        </View>
                    </TouchableOpacity>

                    {/* Skip / Cancel Button */}
                    <TouchableOpacity
                        style={styles.squareBtn}
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                            Skip
                        </SmallText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bottomBar: {
        alignItems: 'center',
        bottom: height(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 0,
        paddingHorizontal: width(7.4),
        position: 'absolute',
        right: 0,
        zIndex: 10,
    },
    bottomLeft: {
        borderBottomLeftRadius: 12,
        borderRightWidth: 0,
        borderTopWidth: 0,
        bottom: 0,
        left: 0,
    },
    bottomRight: {
        borderBottomRightRadius: 12,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        bottom: 0,
        right: 0,
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    circleBtn: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
        borderWidth: 1,
        height: 40,
        justifyContent: 'center',
        width: 40,
    },
    container: {
        backgroundColor: '#0A100D',
        flex: 1,
    },
    corner: {
        borderColor: '#FFFFFF',
        borderWidth: 3,
        height: 32,
        position: 'absolute',
        width: 32,
    },
    dot: {
        borderRadius: 4,
        height: 8,
        marginHorizontal: 3,
    },
    dotsContainer: {
        alignItems: 'center',
        bottom: height(21),
        flexDirection: 'row',
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 10,
    },
    errorContainer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: width(10.6),
    },
    permissionButton: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 12,
        paddingHorizontal: 34,
        paddingVertical: 14,
    },
    scanFrame: {
        height: '100%',
        position: 'relative',
        width: '100%',
    },
    shutterInner: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 8,
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    shutterOuter: {
        alignItems: 'center',
        borderColor: '#FFFFFF',
        borderRadius: 42,
        borderWidth: 3,
        height: 84,
        justifyContent: 'center',
        width: 84,
    },
    squareBtn: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 14,
        borderWidth: 1,
        height: 52,
        justifyContent: 'center',
        width: 52,
    },
    tipContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    tipWrapper: {
        alignItems: 'center',
        bottom: -height(7),
        left: 0,
        position: 'absolute',
        right: 0,
    },
    topBar: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 0,
        paddingHorizontal: width(5.3),
        position: 'absolute',
        right: 0,
        top: Platform.OS === 'ios' ? height(2) : height(4),
        zIndex: 10,
    },
    topLeft: {
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 12,
        left: 0,
        top: 0,
    },
    topRight: {
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 12,
        right: 0,
        top: 0,
    },
    viewfinderContainer: {
        alignItems: 'center',
        height: height(38),
        justifyContent: 'center',
        left: '50%',
        position: 'absolute',
        top: '50%',
        transform: [{ translateX: -width(38.5) }, { translateY: -height(25) }],
        width: width(77),
        zIndex: 5,
    },
});

export default Scan;
