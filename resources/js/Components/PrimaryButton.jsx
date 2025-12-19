import React from 'react'
import { motion } from 'framer-motion'

export default function PrimaryButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ translateY: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${className}`}
      style={{ background: '#7b1818', color: '#fff', boxShadow: '0 6px 18px rgba(123,24,24,0.18)' }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
