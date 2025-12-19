import React from 'react'

export default function ApplicationLogo({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#0b0b0b" />
        <path d="M7 12h10M7 8h10M7 16h10" stroke="#7b1818" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}