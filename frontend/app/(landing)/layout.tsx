import React from 'react';
import WrapperNav from '@/components/landing/Home/Navbar/WrapperNav';
import Footer from '@/components/landing/Home/Footer/Footer';
import LandingScrollbarToggle from '@/components/layout/LandingScrollbarToggle';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingScrollbarToggle />
      <WrapperNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
