import React from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import ContactForm from '@/components/landing/ContactForm'

const contactBg = '/images/landing/contact_background.png'

const supportCategories = [
  {
    title: 'Customer Support',
    description:
      'Our support team is available around the clock to address any concerns or queries you may have.',
  },
  {
    title: 'Feedback and Suggestions',
    description:
      'Our support team is available around the clock to address any concerns or queries you may have.',
  },
  {
    title: 'Media Inquiries',
    description:
      'Our support team is available around the clock to address any concerns or queries you may have.',
  },
]

export const ContactSection = () => {
  return (
    <section id='contact' className='relative min-h-screen w-full overflow-hidden py-20'>
      <Image
        src={contactBg}
        alt='Contact background'
        fill
        priority
        className='object-cover'
      />
      <div className='absolute inset-0 bg-white/20' />

      <div className='relative z-10'>
        <main
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
            padding: '40px 48px 60px',
            alignItems: 'start',
          }}
        >
          <div style={{ paddingRight: 40, paddingTop: 10 }}>
            <h1
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: '#4f6ef7',
                margin: '0 0 32px',
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
              }}
            >
              Contact Us
            </h1>

            <p
              style={{
                fontSize: 15,
                color: '#4b5563',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                margin: '92px 0 56px',
              }}
            >
              {`Email, call, or complete the form to learn how
NexHire can solve your carrier problem.
info@NexHire.io
+94 123 456`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 20 }}>
              {supportCategories.map((cat, i) => (
                <div
                  key={i}
                  style={i > 0 ? { borderLeft: '1px solid #d1d5db', paddingLeft: 8 } : undefined}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#1a1f36',
                        whiteSpace: 'nowrap',
                        margin: '0 0 8px',
                      }}
                    >
                      {cat.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#6b7280',
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </main>
      </div>
    </section>
  )
}

const ContactPage = () => {
  redirect('/#contact')
}

export default ContactPage
