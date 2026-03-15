import React from 'react';
import WrapperNav from '@/components/landing_components/Home/Navbar/WrapperNav';
import Footer from '@/components/landing_components/Home/Navbar/Footer/Footer';
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
