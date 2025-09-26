import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSession {
  mobileNumber: string;
  userId: string;
  isLoggedIn: boolean;
}

const SESSION_KEY = 'user_session';

export const saveUserSession = async (mobileNumber: string): Promise<void> => {
  try {
    const session: UserSession = {
      mobileNumber,
      userId: `user_${mobileNumber}`, // Generate user ID from mobile number
      isLoggedIn: true,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving user session:', error);
  }
};

export const getUserSession = async (): Promise<UserSession | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

export const clearUserSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const session = await getUserSession();
    return session?.isLoggedIn || false;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};
