export type RootStackParamList = {
    Onboarding: undefined;
    MainTabs: {
        screen: 'Home';
        params?: {
            capturedPhoto?: { slotKey: 'front' | 'back' | 'ingredients'; uri: string };
            existingPhotos?: {
                front?: string;
                back?: string;
                ingredients?: string;
            };
        };
    } | undefined;
    Settings: undefined;
    IngredientsResult: {
        ingredients: string;
        ingredients_hash: string;
        imageUri?: string;
        frontImage?: string;
        backImage?: string;
        ingredientsImage?: string;
        productName?: string;
        halalCheckResult?: any; // Pre-loaded result from history
        chatgpt_result?: any;   // Used when we load a cached record from DB
    };
    Scan: {
        slotKey?: 'front' | 'back' | 'ingredients';
        existingPhotos?: {
            front?: string;
            back?: string;
            ingredients?: string;
        };
    };
    Login: undefined;
    Signup: undefined;
    Upload: undefined;
};

export type BottomTabParamList = {
    Home: {
        capturedPhoto?: { slotKey: 'front' | 'back' | 'ingredients'; uri: string };
        existingPhotos?: {
            front?: string;
            back?: string;
            ingredients?: string;
        };
    };
    History: undefined;
    Profile: undefined;
};