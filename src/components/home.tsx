import styles from './home.module.css';
import { Link } from 'react-router-dom';
import udgLogo from '../assets/logoUDG.png';

const Home = () => {
    return(
        <>
      <div className={styles.header}>
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
      </div>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p>Plataforma Oficial</p>
            <h1>Objetos Perdidos y Encontrados UDG</h1>
            <p>Encuentra o reporta objetos perdidos en la comunidad universitaria.</p>
          </div>
        </section>

        <section className={styles.itemsSection}>
          <div className={styles.column}>
            <h2>OBJETOS PERDIDOS</h2>
            <div className={styles.cardsContainer}>
              <article className={`${styles.card} ${styles.lost}`}>
                <img src="" alt="Mochila Negra" />
                <div className={styles.cardContent}>
                  <span className={`${styles.statusTag} ${styles.lostTag}`}>¡PERDIDO!</span>
                  <h4>Mochila Negra en CUCEI</h4>
                  <p className={styles.meta}>Reportado: 15/May/2024</p>
                  <p className={styles.meta}>Ubicación: Edificio A</p>
                </div>
              </article>
              <article className={`${styles.card} ${styles.lost}`}>
                <img src="" alt="Celular" />
                <div className={styles.cardContent}>
                  <span className={`${styles.statusTag} ${styles.lostTag}`}>¡PERDIDO!</span>
                  <h4>Celular en Biblioteca</h4>
                  <p className={styles.meta}>Reportado: 16/May/2024</p>
                  <p className={styles.meta}>Ubicación: Piso 2</p>
                </div>
              </article>
            </div>
          </div>

          <div className={styles.column}>
            <h2>OBJETOS ENCONTRADOS</h2>
            <div className={styles.cardsContainer}>
              <article className={`${styles.card} ${styles.found}`}>
                <img src="" alt="Llaves" />
                <div className={styles.cardContent}>
                  <span className={`${styles.statusTag} ${styles.foundTag}`}>¡ENCONTRADO!</span>
                  <h4>Llaves cerca de la Biblioteca</h4>
                  <p className={styles.meta}>Reportado: 15/May/2024</p>
                  <p className={styles.meta}>Descripción: Llavero rojo</p>
                </div>
              </article>
              <article className={`${styles.card} ${styles.found}`}>
                <img src="" alt="Lentes" />
                <div className={styles.cardContent}>
                  <span className={`${styles.statusTag} ${styles.foundTag}`}>¡ENCONTRADO!</span>
                  <h4>Lentes de armazón negro</h4>
                  <p className={styles.meta}>Reportado: 16/May/2024</p>
                  <p className={styles.meta}>Descripción: Encontrados en la cafetería</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 Universidad de Guadalajara. Todos los derechos reservados.</p>
        <div className={styles.footerLinks}>
          <a href="#">Contacto</a>
          <a href="#">Mapa del sitio</a>
          <a href="#">Aviso de Privacidad</a>
        </div>
      </footer>
    </>
    )
}

export default Home;