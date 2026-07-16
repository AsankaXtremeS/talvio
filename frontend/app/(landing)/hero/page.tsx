import Image from 'next/image'
import React from 'react'
import { PiMedalFill } from 'react-icons/pi'
import { FileText, BadgeCheck } from 'lucide-react'
import { BsStars } from 'react-icons/bs'
import Link from 'next/link'

const heroBg = '/images/landing/talvio-hero-bg.png'
const heroBottomRight = '/images/landing/ne 1.png'

const Hero = () => {
  return (
    <section id='home' className='relative h-screen w-full overflow-hidden'>
      <Image
        src={heroBg}
        alt='Hero background'
        fill
        priority
        className='object-cover'
      />

      <Image
        src={heroBottomRight}
        alt='Hero bottom right element'
        width={550}
        height={550}
        className='absolute bottom-0 right-30 z-10'
      />

      <div className='absolute left-18 top-18 z-20 inline-flex items-center gap-2 rounded-full text-sm font-medium text-gray-700'>
        <PiMedalFill size={22} className='text-[#FF9500]' />
        <span>Game Changing Platform</span>
      </div>

      <div className='absolute left-18 top-23 z-20'>
        <h1 className='text-4xl font-black leading-tight tracking-tight text-[#333333] sm:text-4xl md:text-6xl'>
          Find the Right Job
          <br />
          Faster.
          <br />
          Grow Your Career.
        </h1>
      </div>

      <div className='absolute left-18 top-80 z-20'>
        <p className='text-lg leading-relaxed text-gray-600'>
          An AI-powered platform that intelligently connects students and <br />
          companies, delivering personalized job matches and automating the <br />
          recruitment process from application to interview response.
        </p>
      </div>

      <div className='absolute left-18 top-105 z-20'>
        <div className='flex flex-wrap items-center gap-4'>
          <Link href='/register'>
            <button className='rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 py-3.5 font-medium text-white transition-all hover:scale-105 hover:shadow-xl'>
              Get Started
            </button>
          </Link>
          <button className='rounded-full border-2 border-gray-300 px-8 py-3.5 font-medium text-gray-700 transition-colors hover:border-blue-600 hover:text-blue-600 hover:scale-105 hover:shadow-xl'>
            Explore
          </button>
        </div>
      </div>

      <div className='absolute bottom-8 left-18 z-20 flex items-start gap-10'>
        <div>
          <div className='text-4xl font-black leading-none text-[#333333]'>200+</div>
          <div className='mt-1 text-[13px] font-medium leading-5 text-[#666666]'>
            Employees
            <br />
            Joined
          </div>
        </div>
        <div>
          <div className='text-4xl font-black leading-none text-[#333333]'>30+</div>
          <div className='mt-1 text-[13px] font-medium leading-5 text-[#666666]'>
            Companies
            <br />
            Joined
          </div>
        </div>
        <div>
          <div className='text-4xl font-black leading-none text-[#333333]'>98%</div>
          <div className='mt-1 text-[13px] font-medium leading-5 text-[#666666]'>
            Satisfied
            <br />
            Rate
          </div>
        </div>
      </div>

      <div
        className='absolute left-230 top-15 z-20 inline-flex -translate-x-5 items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md'
        style={{
          animationName: 'float',
          animationDuration: '3s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0ms',
        }}
      >
        <span className='inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600'>
          <FileText size={15} className='text-indigo-600' />
        </span>
        <span className='text-[13px] font-semibold text-gray-800'>AI Resume Tools</span>
      </div>

      <div
        className='absolute left-180 top-[28%] z-20 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md'
        style={{
          animationName: 'float',
          animationDuration: '3s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '200ms',
        }}
      >
        <span className='inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600'>
          <BsStars size={15} className='text-indigo-600' />
        </span>
        <span className='text-[13px] font-semibold text-gray-800'>Smart Matching</span>
      </div>

      <div
        className='absolute right-30 top-[23%] z-20 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md'
        style={{
          animationName: 'float',
          animationDuration: '3s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '350ms',
        }}
      >
        <span className='inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600'>
          <BadgeCheck size={15} className='text-indigo-600' />
        </span>
        <span className='text-[13px] font-semibold text-gray-800'>Verified Employers</span>
      </div>
    </section>
  )
}

export default Hero
