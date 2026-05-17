export const translateAuthError = (errorMessage: string): string => {
    // Errores de contraseña
    if (errorMessage.includes('Password should be at least') || errorMessage.includes('password'))
        return 'La contraseña debe cumplir los siguientes requisitos: mínimo 6 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (!@#$%^&*).';
    else if (errorMessage.includes('Password should contain'))
        return 'La contraseña sigue sin cumplir con todos los requisitos de seguridad. Revisa los indicadores.';

    // Error de email ya registrado
    if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
        return 'Este correo electrónico ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.';
    }

    // Error de email inválido
    if (errorMessage.includes('Invalid email') || errorMessage.includes('invalid email')) {
        return 'El correo electrónico no es válido. Verifica que esté escrito correctamente.';
    }

    // Error de credenciales incorrectas
    if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid credentials')) {
        return 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
    }

    // Error de email no confirmado
    if (errorMessage.includes('Email not confirmed')) {
        return 'Debes confirmar tu correo electrónico. Revisa tu bandeja de entrada y spam.';
    }

    // Error de rate limit
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        return 'Demasiados intentos. Por favor, espera una hora antes de intentar nuevamente.';
    }

    // Si no coincide con ningún patrón, devolver mensaje genérico
    return 'Ocurrió un error inesperado. Por favor, verifica tus datos e intenta nuevamente.';
};