import React from 'react';
import WrapperNav from '@/components/landing_components/Home/Navbar/WrapperNav';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WrapperNav />
      <main>{children}</main>
    </>
  );
}
