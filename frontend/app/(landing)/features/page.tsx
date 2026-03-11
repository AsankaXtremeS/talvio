import React from 'react'
import Image from 'next/image'
import FeaturesBg from '../images_landing/talvio_background.png'
import { Sparkles, Route, Mails, ContactRound, ClipboardClock} from 'lucide-react'
import { TbFileAi } from "react-icons/tb";
import { IoIosFlash } from "react-icons/io";
//import HeroPage from '../Hero/page';

type FeatureCard = {
  title: string
  description: string
  icon: React.ReactNode
}

const features: FeatureCard[] = [
  {
    title: 'AI Smart Matching',
    description: 'AI matches candidates to jobs based on skills, interests, and role requirements.',
    icon: <Sparkles size={25} className="text-indigo-600" />,
  },
  {
    title: 'End-to-End Hiring',
    description: 'Handle applications, interviews, chat, and documents in one unified system.',
    icon: <Route size={25} className="text-indigo-600" />,
  },
  {
    title: 'Auto Interview Responses',
    description: 'Automatically send professionalselection,rejection, or on-hold emails after interviews.',
    icon: <Mails size={25} className="text-indigo-600" />,
  },
  {
    title: 'Personalized Job Discovery',
    description: 'Students receive tailored internship and job recommendations that fit their profiles.',
    icon: <ContactRound size={25} className="text-indigo-600" />,
  },
  {
    title: 'Resume & Cover Letter AI',
    description: 'Refine resumes and cover letters using intelligent AI templates.',
    icon: <TbFileAi size={25} className="text-indigo-600"/>,
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Built-in file sharing, and interview scheduling for seamless communication.',
    icon: <ClipboardClock size={25} className="text-indigo-600" />,
  },
]

const FeaturesPage = () => {
  return (
    <div>
      <section className='relative min-h-screen w-full overflow-hidden py-20'>
        <Image
          src={FeaturesBg}
          alt='Features background'
          fill
          priority
          className='object-cover'
        />

        <div className='absolute inset-0 bg-white/30' />

        <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pt-5'>
          <div className='text-center'>
            <p className='font-medium text-blue-500 flex items-center justify-center gap-2'>
              <IoIosFlash size={20} className="text-indigo-600" />
              <span>Features</span>
            </p>

            <h2 className='mt-4 text-4xl text-[#333333] font-bold'>
              Everything You Need For Smart <br />
              <span className='text-blue-600'> Recruitment</span>
            </h2>

            <p className='mt-3 text-[20px] font-medium text-[#666666]' style={{ fontFamily: 'Roboto, sans-serif' }}>
              Our platform makes it simple for students and companies to find the best match
            </p>
          </div>

          <section className='mx-auto mt-12 w-full'>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className='group h-42.5 w-89.25 rounded-2xl border border-white/70 bg-white/85 p-7 shadow-md backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl'
                >
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600'>
                      {feature.icon}
                    </div>
                    <h3 className='text-base font-bold text-[#1a1f36]'>{feature.title}</h3>
                  </div>

                  <p className='text-sm leading-7 text-[#6b7280]'>{feature.description}</p>

                  <div className='mt-5 h-[2.5px] w-8 rounded-sm bg-linear-to-r from-blue-600 to-indigo-400 transition-all duration-300 group-hover:w-12' />
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default FeaturesPage