export type RootStackParamList = {
    Onboarding: undefined;
    MainTabs: undefined;
    Profile: { userId: string };
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
    Scan: undefined;
    Login: undefined;
    Signup: undefined;
    Upload: undefined;
};

export type BottomTabParamList = {
    Home: undefined;
    History: undefined;
    Profile: undefined;
};