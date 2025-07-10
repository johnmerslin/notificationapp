import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  dateOfBirth: string;
  class: string;
  section: string;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  students: Student[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, otp: string) => Promise<boolean>;
  logout: () => void;
  registerStudent: (student: Omit<Student, 'id'>) => void;
  sendOTP: (phoneNumber: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, we'll start with auth flow
      router.replace('/auth/phone');
    }, 1000);
  }, []);

  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    // Simulate OTP verification
    if (otp === '1234') {
      const newUser: User = {
        id: '1',
        name: 'John Doe',
        phoneNumber,
        students: []
      };
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    router.replace('/auth/phone');
  };

  const registerStudent = (studentData: Omit<Student, 'id'>) => {
    if (!user) return;

    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
    };

    setUser({
      ...user,
      students: [...user.students, newStudent]
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      registerStudent,
      sendOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};