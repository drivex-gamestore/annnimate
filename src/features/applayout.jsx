import Loader from '@animations/components/Loader';
export default async function AppLayout({ children }) {
  return (
    <>
      <Loader />
        <main class="flex-1 relative z-[2] bg-background" data-transition-content="true">
          {children}
        </main>
    </>
  );
}