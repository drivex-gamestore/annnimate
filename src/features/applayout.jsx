import Loader from '@animations/components/Loader';
import Header from '@features/layout/header/Header';
export default async function AppLayout({ children }) {
  return (
    <>
      <Loader />
      <Header />
        <main class="flex-1 relative z-[2] bg-background" data-transition-content="true">
          {children}
        </main>
    </>
  );
}