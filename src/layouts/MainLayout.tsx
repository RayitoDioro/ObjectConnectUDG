import type { ReactNode } from 'react';
// A veces, las herramientas de compilación prefieren las rutas sin la extensión del archivo,
// ya que están configuradas para resolverlas automáticamente. Vamos a intentarlo así.
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Se definen los 'props' que el componente espera recibir.
// En este caso, 'children', que es el contenido que irá dentro del layout.
interface MainLayoutProps {
  children: ReactNode;
}

// Se usa una exportación nombrada ('export const') para ser más explícitos.
// Esto requiere que al importarlo se usen llaves: import { MainLayout } from ...
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
};

