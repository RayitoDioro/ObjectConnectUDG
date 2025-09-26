import { useState } from 'react';
import styles from './Login.module.css';
//import udgLogo from '../../assets/leonUDG.png'; // La ruta cambia
import udgLogo from '../../../assets/leonUDG.png'

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <img src={udgLogo} alt="Logo UDG León" className={styles.logo} />
                        <h2 id="form-title">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                    </div>

                    <div className={styles.cardContent}>
                        <form id="login-form">
                            <input type="email" placeholder="Correo electrónico" required />
                            {!isLogin && (
                                <input type="text" placeholder="Nombre completo" />
                            )}
                            <input type="password" placeholder="Contraseña" required />
                            <button type="submit" className={`${styles.btn} ${styles.mainBtn}`}>
                                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                            </button>
                        </form>

                        <button className={`${styles.btn} ${styles.googleBtn}`}>
                            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className={styles.googleIcon} />
                            <span>{isLogin ? 'Iniciar con Google' : 'Registrarse con Google'}</span>
                        </button>

                        <p className={styles.toggleText}>
                            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                            <span id="toggle-link" className={styles.link} onClick={toggleForm}>
                                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

