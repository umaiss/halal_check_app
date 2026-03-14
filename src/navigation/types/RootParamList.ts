export type RootStackParamList = {
    Onboarding: undefined;
    MainTabs: undefined;
    Profile: { userId: string };
    Settings: undefined;
    IngredientsResult: {
        ingredients: string;
        imageUri?: string;
        frontImage?: string;
        backImage?: string;
        ingredientsImage?: string;
        halalCheckResult?: any; // Pre-loaded result from history
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