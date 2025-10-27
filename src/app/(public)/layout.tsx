import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/footer';

export default function Layout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col relative">
      <PublicHeader />
      <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-8">
        {children}
        {modal}
        <Footer />
      </main>
    </div>
  );
}
