import { User } from '@/types';

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

export const setUser = (user: User) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

export const getUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};

export const removeUser = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
};

export const logout = () => {
    removeToken();
    removeUser();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
