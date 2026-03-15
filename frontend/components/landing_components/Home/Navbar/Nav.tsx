"use client";
import Navlogo from '@/components/landing_components/Helper/Logo'
import { NAV_LINKS } from '@/constant/constant'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Nav = () => {
  const [navBg, setNavBg] = useState(false);
  const [activeHash, setActiveHash] = useState('home');
  const pathname = usePathname();

  const isScrolled = navBg;

  useEffect(() => {
    const getScrollTop = () => window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    const handler = () => {
      setNavBg(getScrollTop() > 0);
    };

    handler();
    window.addEventListener('scroll', handler, { passive: true });

    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveHash(hash);
    };

    syncHash();
    window.addEventListener('hashchange', syncHash);

    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <div
      className={`fixed z-100 h-[8vh] w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-stone-100 shadow-md backdrop-blur-sm text-gray-800'
          : 'bg-transparent text-gray-700'
      }`}
    >
      <div className='flex items-center h-full justify-between w-[90%] x1:w-[80%] mx-auto'>
        {/*LOGO*/}
        <div >
          <Navlogo/>
        </div>
        {/*NAVLINKS*/}
        <div className='hidden lg:flex items-center space-x-10'>
          {NAV_LINKS.map((link) => {
            const sectionHash = link.url.split('#')[1] || 'home';
            const isActive = pathname === '/' && activeHash === sectionHash;

            return(
              <Link
                key={link.id}
                href={link.url}
                onClick={() => setActiveHash(sectionHash)}
                className={`group relative text-[15px] font-medium transition-colors duration-300 ${
                  isActive
                    ? 'text-[#2563eb]'
                    : isScrolled
                      ? 'text-[#666666] hover:text-[#333333]'
                      : 'text-[#666666] hover:text-[#333333]'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <p>{link.label}</p>
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-indigo-600 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            )
          })}
        </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button 
                className="px-6 py-2 bg-linear-to-r from-[#5f33e2] to-[#2563eb] text-white text-[15px] font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Login
            </button>
            </Link>
            <Link href="/register">
              <button 
                className="px-6 py-2 bg-linear-to-r border border-blue-700 text-gray-900 text-[15px] font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Signup
            </button>
            </Link>
          </div>
        </div>
      

      
      </div>
    
  )
}

export default Nav