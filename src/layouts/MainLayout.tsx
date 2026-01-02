import type { ReactNode } from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </>
  );
};

