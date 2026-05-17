export interface PasswordRequirements {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
}

export const validatePassword = (password: string): PasswordRequirements => {
    return {
        minLength: password.length >= 6,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=[\]{}:<>?.,/~]/.test(password)
    };
};

export const isPasswordValid = (requirements: PasswordRequirements): boolean => {
    return Object.values(requirements).every(req => req === true);
};