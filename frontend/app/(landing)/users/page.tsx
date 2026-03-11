import React from 'react'
import Image from 'next/image'
import EmployeeBg from '../images_landing/employee_background.png'
import { FaCircleCheck } from "react-icons/fa6";

const features: string[] = [
  'AI-powered job and candidate matching',
  'End-to-end application and interview flow',
  'Automated interview response emails',
  'Built-in communication and file sharing',
]

const StarRating = ({ value }: { value: number }) => {
  const fullStars = Math.floor(value)
  const hasHalfStar = value - fullStars >= 0.5

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {Array.from({ length: 5 }).map((_, index) => {
        const isFull = index < fullStars
        const isHalf = index === fullStars && hasHalfStar
        const color = isFull || isHalf ? '#f59e0b' : '#d1d5db'

        return (
          <span key={index} style={{ color, fontSize: 14, lineHeight: 1 }}>
            ★
          </span>
        )
      })}
    </div>
  )
}

const UsersPage = () => {
  return (
    <div>
      <section className='relative min-h-screen w-full overflow-hidden py-20'>
        <Image
          src={EmployeeBg}
          alt='Employee background'
          fill
          priority
          className='object-cover'
        />
        <div className='relative z-10'>
        <section style={{ textAlign: "center", padding: "40px 20px 32px" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: "#4f6ef7", margin: "0 0 12px", letterSpacing: "-1px" }}>
          Built for Results
        </h1>
        <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>
          Smart features and proven success stories that deliver real outcomes.
        </p>
      </section>

      {/* Three-column layout */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 20,
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 24px 60px",
        alignItems: "start",
      }}>

        {/* LEFT — Job Seekers */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          borderRadius: 20,
          padding: "28px 28px 28px",
          borderLeft: "4px solid #4f6ef7",
          boxShadow: "0 4px 24px rgba(79,110,247,0.10)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>
          <span style={{
            display: "inline-block", background: "rgba(79,110,247,0.1)", color: "#4f6ef7",
            fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "4px 14px",
            marginBottom: 16, width: "fit-content"
          }}>For Job Seekers</span>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1f36", margin: "0 0 24px", lineHeight: 1.3 }}>
            Built for Students & Career Starters
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span >
                  <FaCircleCheck size={20} className="text-green-500"/>
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1f36" }}>{f}</span>
              </li>
            ))}
          </ul>

          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#4f6ef7,#6c87fa)",
            color: "#fff", border: "none", borderRadius: 30,
            padding: "11px 22px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            width: "fit-content", boxShadow: "0 4px 14px rgba(79,110,247,0.35)"
          }}>
            Signup as Jobseeker
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* CENTER — Testimonials */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 0 }}>
          {/* Testimonial 1 */}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", top: 0, left: 10,
              fontSize: 60, color: "#1a1f36", lineHeight: 1, fontFamily: "Georgia, serif", fontWeight: 900
            }}>&ldquo;</span>
            <div style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 18,
              padding: "24px 20px 20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              marginTop: 20,
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                <Image
                  src='https://randomuser.me/api/portraits/women/44.jpg'
                  alt='Jane Winday'
                  width={52}
                  height={52}
                  style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1f36", margin: "0 0 4px" }}>
                    &ldquo;This platform completely changed how I applied for internships.&rdquo;
                  </p>
                  <StarRating value={4.5} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.6 }}>
                I no longer send random applications. The AI recommendations matched my skills perfectly.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1f36" }}>Jane Winday</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Final year undergraduate</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 18,
              padding: "24px 20px 20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, background: "#e63b2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0
                }}>CT</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1f36", margin: "0 0 4px" }}>
                    &ldquo;We reduced our hiring time by more than 40%.&rdquo;
                  </p>
                  <StarRating value={4.5} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.6 }}>
                AI-ranked shortlisting and automated scheduling made recruitment efficient and stress-free. We now focus only on high-quality candidates.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1f36" }}>Jane Winday</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Creative Tech</span>
              </div>
            </div>
            <span style={{
              position: "absolute", bottom: 185, right: 16, transform: "rotate(180deg)",
              fontSize: 60, color: "#1a1f36", lineHeight: 1, fontFamily: "Georgia, serif", fontWeight: 900
            }}>&ldquo;</span>
            
          </div>
        </div>

        {/* RIGHT — Employers */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          borderRadius: 20,
          padding: "28px 28px 28px",
          borderRight: "4px solid #4f6ef7",
          boxShadow: "0 4px 24px rgba(79,110,247,0.10)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>
          <span style={{
            display: "inline-block", background: "rgba(79,110,247,0.1)", color: "#4f6ef7",
            fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "4px 14px",
            marginBottom: 16, width: "fit-content"
          }}>For Employers</span>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1f36", margin: "0 0 24px", lineHeight: 1.3 }}>
            Hire the Right Talent, Faster
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span >
                  <FaCircleCheck size={20} className="text-green-500"/>
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1f36" }}>{f}</span>
              </li>
            ))}
          </ul>

          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#4f6ef7,#6c87fa)",
            color: "#fff", border: "none", borderRadius: 30,
            padding: "11px 22px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            width: "fit-content", boxShadow: "0 4px 14px rgba(79,110,247,0.35)"
          }}>
            Signup as Employer
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </section>
      </div>
      </section>
    </div>
  )
}

export default UsersPage