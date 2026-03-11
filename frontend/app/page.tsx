import React from 'react';
import HomeComponent from '../components/landing_components/Home/Home';
import HeroPage from './(landing)/Hero/page';
import WrapperNav from '@/components/landing_components/Home/Navbar/WrapperNav';

const Page = () => {
  return (
    <>
      <WrapperNav />
      <HeroPage />
      <HomeComponent />
    </>

  );
};

export default Page;