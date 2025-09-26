import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; 2025 Universidad de Guadalajara. Todos los derechos reservados.</p>
      <div className={styles.footerLinks}>
        <a href="#">Contacto</a>
        <a href="#">Mapa del sitio</a>
        <a href="#">Aviso de Privacidad</a>
      </div>
    </footer>
  );
};

export default Footer;

