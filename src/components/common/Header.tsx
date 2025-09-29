import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import udgLogo from '../../assets/logoUDG.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logo}>
            <img src={udgLogo} alt="Logo Universidad de Guadalajara - Ir al inicio" />
          </Link>
        </div>
        <nav>
          <ul>
            <li><Link to="/lost-objects">Objetos perdidos</Link></li>
            <li><Link to="/objetos-encontrados">Objetos encontrados</Link></li>
            <li><Link to="/publicar-objeto">Publicar objeto</Link></li>
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