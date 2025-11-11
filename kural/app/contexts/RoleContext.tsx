import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'moderator' | 'booth_agent' | 'user' | null;

export interface UserData {
  _id: string;
  firstName: string;
  lastName?: string;
  mobileNumber: string;
  role: string;
  boothAllocation?: string;
  booth_id?: string;
  aci_id?: number;
  aci_name?: string;
  activeElection?: string;
  email?: string;
  status?: string;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
  assignedBooths?: string[];
  setAssignedBooths: (booths: string[] | undefined) => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(null);
  const [assignedBooths, setAssignedBooths] = useState<string[] | undefined>(undefined);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load role, booth assignments, and user data from AsyncStorage on app start
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('userRole');
        const savedBooths = await AsyncStorage.getItem('assignedBooths');
        const savedUserData = await AsyncStorage.getItem('userData');
        
        if (savedRole) {
          setRoleState(savedRole as UserRole);
        }
        
        if (savedBooths) {
          try {
            const booths = JSON.parse(savedBooths);
            if (Array.isArray(booths)) {
              setAssignedBooths(booths);
            }
          } catch (parseError) {
            console.warn('Failed to parse saved booths:', parseError);
          }
        }

        if (savedUserData) {
          try {
            const data = JSON.parse(savedUserData);
            console.log('🔍 RoleContext - Loaded userData from AsyncStorage:', data);
            console.log('🔍 RoleContext - booth_id in loaded data:', data.booth_id);
            setUserDataState(data);
          } catch (parseError) {
            console.warn('Failed to parse saved user data:', parseError);
          }
        }
      } catch (error) {
        console.error('Failed to load user role from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, []);

  // Persist role to AsyncStorage when it changes
  const setRole = async (newRole: UserRole) => {
    try {
      setRoleState(newRole);
      if (newRole) {
        await AsyncStorage.setItem('userRole', newRole);
      } else {
        await AsyncStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('Failed to save user role to storage:', error);
    }
  };

  // Persist booth assignments to AsyncStorage when they change
  const setAssignedBoothsPersistent = async (booths: string[] | undefined) => {
    try {
      setAssignedBooths(booths);
      if (booths && booths.length > 0) {
        await AsyncStorage.setItem('assignedBooths', JSON.stringify(booths));
      } else {
        await AsyncStorage.removeItem('assignedBooths');
      }
    } catch (error) {
      console.error('Failed to save assigned booths to storage:', error);
    }
  };

  // Persist user data to AsyncStorage when it changes
  const setUserData = async (data: UserData | null) => {
    try {
      setUserDataState(data);
      if (data) {
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Failed to save user data to storage:', error);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isLoading,
        assignedBooths,
        setAssignedBooths: setAssignedBoothsPersistent,
        userData,
        setUserData,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export { RoleContext };

// Default export to satisfy expo-router route requirements
export default RoleProvider;
