import PreloaderWrapper from '@animations/utils/PreloaderWrapper';
import Header from '@features/layout/header/Header';
export default async function AppLayout({ children }) {
  return (
    <>
      <PreloaderWrapper />
      <Header />
        <main class="flex-1 relative z-[2] bg-background" data-transition-content="true">
          {children}
        </main>
    </>
  );
}
