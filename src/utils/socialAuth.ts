import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

// Google Sign-In Setup
// TODO: Replace this placeholder with your actual Web Client ID from the Google Cloud Console.
// Using a placeholder first.
export const GOOGLE_WEB_CLIENT_ID = '703800181468-5mb5i36g9vr75q2jjdjna9r8kp4ad403.apps.googleusercontent.com';

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
});

/**
 * Triggers native Google Sign-in flow and returns the ID Token and user info.
 */
export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        // Handles structure differences across various library versions
        const idToken = response.data?.idToken || (response as any).idToken;
        const user = response.data?.user || (response as any).user;

        if (!idToken) {
            throw new Error('Google Sign-In failed: No ID Token received.');
        }

        return {
            idToken,
            email: user?.email || undefined,
            name: user?.name || undefined,
        };
    } catch (error: any) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
};

/**
 * Triggers native Apple Sign-in flow and returns the Identity Token and user info.
 * Apple Sign-In is only supported on iOS.
 */
export const signInWithApple = async () => {
    try {
        if (Platform.OS !== 'ios') {
            throw new Error('Apple Sign-In is only supported on iOS devices.');
        }

        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        const { identityToken, fullName, email, user } = appleAuthRequestResponse;

        if (!identityToken) {
            throw new Error('Apple Sign-In failed: No identity token received.');
        }

        // Construct name if available (Apple only shares name on first successful auth)
        let name = undefined;
        if (fullName) {
            const givenName = fullName.givenName || '';
            const familyName = fullName.familyName || '';
            name = `${givenName} ${familyName}`.trim() || undefined;
        }

        return {
            identityToken,
            email: email || undefined,
            name: name || undefined,
            appleUserId: user,
        };
    } catch (error: any) {
        console.error('Apple Sign-In Error:', error);
        throw error;
    }
};
