import styles from './Home.module.css';
import Card from '../../ui/Card'; // Usamos el nuevo componente Card

const Home = () => {
  return (
    <>
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
            <Card
              status="lost"
              imageUrl=""
              altText="Mochila Negra"
              title="Mochila Negra en CUCEI"
              date="15/May/2024"
              location="Edificio A"
            />
            <Card
              status="lost"
              imageUrl=""
              altText="Celular"
              title="Celular en Biblioteca"
              date="16/May/2024"
              location="Piso 2"
            />
          </div>
        </div>

        <div className={styles.column}>
          <h2>OBJETOS ENCONTRADOS</h2>
          <div className={styles.cardsContainer}>
            <Card
              status="found"
              imageUrl=""
              altText="Llaves"
              title="Llaves cerca de la Biblioteca"
              date="15/May/2024"
              location="Llavero rojo"
            />
            <Card
              status="found"
              imageUrl=""
              altText="Lentes"
              title="Lentes de armazón negro"
              date="16/May/2024"
              location="Encontrados en la cafetería"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

