import styles from './Card.module.css';

type CardProps = {
  status: 'lost' | 'found';
  imageUrl: string;
  altText: string;
  title: string;
  date: string;
  location: string;
};

const Card = ({ status, imageUrl, altText, title, date, location }: CardProps) => {
  const isLost = status === 'lost';
  const tagText = isLost ? '¡PERDIDO!' : '¡ENCONTRADO!';
  const cardStyle = isLost ? styles.lost : styles.found;
  const tagStyle = isLost ? styles.lostTag : styles.foundTag;

  return (
    <article className={`${styles.card} ${cardStyle}`}>
      <img src={imageUrl} alt={altText} onError={(e) => (e.currentTarget.style.display = 'none')} />
      <div className={styles.cardContent}>
        <span className={`${styles.statusTag} ${tagStyle}`}>{tagText}</span>
        <h4>{title}</h4>
        <p className={styles.meta}>Reportado: {date}</p>
        <p className={styles.meta}>{isLost ? 'Ubicación' : 'Descripción'}: {location}</p>
      </div>
    </article>
  );
};

export default Card;

