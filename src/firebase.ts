import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
// Configure Google Workspace scopes
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

// Force Google prompt to ensure account selection and re-authorization is seamless
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

let isSigningIn = false;
let cachedAccessToken: string | null = sessionStorage.getItem('gmailToken');

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Fallback for email-password users logged in but session storage is blank (e.g. reload on clean storage)
        if (user.providerData && user.providerData.some(p => p.providerId === 'password')) {
          cachedAccessToken = 'email-password-offline-token';
          sessionStorage.setItem('gmailToken', cachedAccessToken);
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else {
          // If we don't have a cached session-level access token, we trigger standard sign-in prompt again.
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem('gmailToken', cachedAccessToken);
    
    // Auto-sync/register user to our backend
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
      })
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Email & Password Sign Up Helper
export const emailAndPasswordSignUp = async (email: string, password: string): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const finalPassword = password.length >= 6 ? password : password.padEnd(6, '9');
    const result = await createUserWithEmailAndPassword(auth, email, finalPassword);
    cachedAccessToken = 'email-password-offline-token';
    sessionStorage.setItem('gmailToken', cachedAccessToken);

    // Register user to backend
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: result.user.uid,
        email: result.user.email,
        name: result.user.email?.split('@')[0] || 'Email User',
      })
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

// Email & Password Sign In Helper
export const emailAndPasswordSignIn = async (email: string, password: string): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const finalPassword = password.length >= 6 ? password : password.padEnd(6, '9');
    const result = await signInWithEmailAndPassword(auth, email, finalPassword);
    cachedAccessToken = 'email-password-offline-token';
    sessionStorage.setItem('gmailToken', cachedAccessToken);

    // Sync state/metadata with backend
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: result.user.uid,
        email: result.user.email,
        name: result.user.email?.split('@')[0] || 'Email User',
      })
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
