'use client'

import React from 'react'

const Footer = () => {
  return (
    <div>
        <footer
          style={{
            background: 'linear-gradient(135deg,#3b4fd8 0%,#5b3fa8 100%)',
            padding: '22px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href='#'
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              <svg viewBox='0 0 24 24' fill='currentColor' style={{ width: 17, height: 17 }}>
                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
              </svg>
            </a>
            <a
              href='#'
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              <svg viewBox='0 0 24 24' fill='currentColor' style={{ width: 16, height: 16 }}>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>
            <a
              href='#'
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              <svg viewBox='0 0 24 24' fill='currentColor' style={{ width: 17, height: 17 }}>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
              </svg>
            </a>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, textAlign: 'center' }}>
            © 2025 Talvio. All rights reserved. |{' '}
            <a href='/privacy-policy' className='footer-link' style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>
              Privacy Policy
            </a>{' '}
            |{' '}
            <a href='/terms-of-service' className='footer-link' style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>
              Terms of Service
            </a>
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'background 0.2s',
            }}
          >
            <svg viewBox='0 0 20 20' fill='currentColor' style={{ width: 18, height: 18 }}>
              <path fillRule='evenodd' d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z' clipRule='evenodd' />
            </svg>
          </button>
        </footer>
    </div>
  )
}

export default Footer