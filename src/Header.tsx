import { Link } from 'react-router-dom';
import styles from './Header.module.css';
// Corregimos la ruta a la imagen para que sea relativa al archivo actual.
import udgLogo from '../../assets/logoUDG.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={udgLogo} alt="Logo Universidad de Guadalajara" />
          </Link>
        </div>
        <nav>
          <ul>
            {/* Usamos Link para la navegación interna de React */}
            <li><Link to="/objetos-perdidos">Objetos perdidos</Link></li>
            {/* TODO: Crear y enlazar la página de objetos encontrados */}
            <li><Link to="#">Objetos encontrados</Link></li>
            <li><Link to="#">Publicar objeto</Link></li>
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
