"use client";

import React, { useState, useEffect } from 'react'

interface CountryData {
  name: { common: string };
  idd?: { root?: string; suffixes?: string[] };
}

interface CountryCode {
  name: string;
  code: string;
}

const ContactForm = () => {
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+94",
    phone: "",
    message: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ✅ Moved fetch inside useEffect (top-level await not allowed in client components)
  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");
        if (!res.ok) {
          console.warn("Failed to fetch country codes", res.status, res.statusText);
          setCountryCodes([{ name: "Sri Lanka", code: "+94" }, { name: "United States", code: "+1" }]);
          return;
        }

        const data = await res.json();
        
        if (!Array.isArray(data)) {
          console.warn("Expected array from restcountries API, got:", typeof data);
          setCountryCodes([{ name: "Sri Lanka", code: "+94" }, { name: "United States", code: "+1" }]);
          return;
        }

        const codes = (data as CountryData[])
          .map((c) => ({
            name: c.name?.common || "Unknown",
            code: c.idd?.root
              ? c.idd.root + (c.idd?.suffixes?.[0] || "")
              : "",
          }))
          .filter((c) => c.code)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (codes.length === 0) {
          setCountryCodes([{ name: "Sri Lanka", code: "+94" }, { name: "United States", code: "+1" }]);
        } else {
          setCountryCodes(codes);
        }
      } catch (err) {
        console.error("Error fetching country codes:", err);
        setCountryCodes([{ name: "Sri Lanka", code: "+94" }, { name: "United States", code: "+1" }]);
      }
    };
    fetchCountryCodes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: 30,
    border: `1.5px solid ${focused === field ? "#4f6ef7" : "#e2e5f0"}`,
    fontSize: 14,
    color: "#1a1f36",
    background: "#fff",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  });

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        width: "94%",
        marginLeft: "auto",
        padding: "36px 32px 28px",
        boxShadow: "0 8px 40px rgba(79,110,247,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        transform: "scale(0.96)",
        transformOrigin: "top right",
      }}
    >
      <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1a1f36", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
        Get in Touch
      </h2>
      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 28px" }}>
        You can reach us anytime
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <input name="firstName" value={form.firstName} onChange={handleChange}
            onFocus={() => setFocused("firstName")} onBlur={() => setFocused(null)}
            placeholder="First name" style={inputStyle("firstName")} />
          <input name="lastName" value={form.lastName} onChange={handleChange}
            onFocus={() => setFocused("lastName")} onBlur={() => setFocused(null)}
            placeholder="Last name" style={inputStyle("lastName")} />
        </div>

        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#b0b7c9", display: "flex", alignItems: "center" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </span>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
            placeholder="Your email" style={{ ...inputStyle("email"), paddingLeft: 42 }} />
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: 14, border: `1.5px solid ${focused === "phone" ? "#4f6ef7" : "#e2e5f0"}`, borderRadius: 30, overflow: "hidden", background: "#fff", transition: "border-color 0.2s" }}>
          <div style={{ position: "relative" }}>
            <button type="button" onClick={() => setShowDropdown((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "13px 14px 13px 18px", background: "none", border: "none", borderRight: "1.5px solid #e2e5f0", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1a1f36", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
              {form.countryCode}
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: "#9ca3af" }}>
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showDropdown && (
              <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1.5px solid #e2e5f0", borderRadius: 12, zIndex: 50, minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", overflow: "auto", maxHeight: 200 }}>
                {countryCodes.map((c) => (
                  <button
                    key={`${c.name}-${c.code}`}  
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, countryCode: c.code })); 
                      setShowDropdown(false);
                    }}
                    style={{ display: "block", width: "100%", padding: "9px 16px", textAlign: "left", background: form.countryCode === c.code ? "#f0f4ff" : "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#1a1f36", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {c.name} ({c.code}) 
                  </button>
                ))}
              </div>
            )}
          </div>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange}
            onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
            placeholder="Phone Number"
            style={{ flex: 1, padding: "13px 16px", border: "none", outline: "none", fontSize: 14, color: "#1a1f36", fontFamily: "'DM Sans', sans-serif", background: "transparent" }} />
        </div>

        <div style={{ position: "relative", marginBottom: 18 }}>
          <textarea name="message" value={form.message} onChange={handleChange}
            onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
            placeholder="How can we help ?" maxLength={120} rows={4}
            style={{ ...inputStyle("message"), borderRadius: 16, paddingBottom: 28 }} />
          <span style={{ position: "absolute", right: 16, bottom: 12, fontSize: 12, color: "#b0b7c9" }}>
            {form.message.length}/120
          </span>
        </div>

        <button type="submit" className="submit-btn"
          style={{ width: "100%", padding: "15px", borderRadius: 30, background: "linear-gradient(135deg,#4f6ef7 0%,#5b7cf7 100%)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 16, transition: "opacity 0.2s, transform 0.15s", boxShadow: "0 4px 18px rgba(79,110,247,0.35)", letterSpacing: "0.2px" }}>
          {submitted ? " Message Sent!" : "Submit"}
        </button>

        <p style={{ fontSize: 12.5, color: "#9ca3af", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
          By contacting us you agree to our{" "}
          <a href="/terms-of-service" style={{ color: "#4f6ef7", fontWeight: 600, textDecoration: "none" }} className="footer-link">Terms of service</a>{" "}
          and{" "}
          <a href="/privacy-policy" style={{ color: "#4f6ef7", fontWeight: 600, textDecoration: "none" }} className="footer-link">Privacy Policy</a>
        </p>
      </form>
    </div>
  );
}

export default ContactForm;