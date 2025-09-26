import { Link } from 'react-router-dom';
import styles from './Header.module.css';
// Corregimos la ruta a la imagen para que sea relativa al archivo actual.
import udgLogo from '../../assets/logoUDG.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <img src={udgLogo} alt="Logo Universidad de Guadalajara" />
        </div>
        <nav>
          <ul>
            <li><a href="#">Objetos perdidos</a></li>
            <li><a href="#">Objetos encontrados</a></li>
            <li><a href="#">Publicar objeto</a></li>
          </ul>
        </nav>
        <div className={styles.headerRight}>
          <Link to={"/login"} className={styles.loginBtn}>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

