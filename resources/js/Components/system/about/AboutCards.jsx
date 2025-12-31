import React from 'react'
import { motion } from 'framer-motion'

export function FeatureCard({ icon, title, description, variants }) {
  return (
    <motion.div
      className="group relative bg-white dark:bg-[#0b0b0b] rounded-2xl p-6 shadow-md ring-1 ring-black/5 dark:ring-white/10 hover:shadow-lg hover:ring-blue-500/20 dark:hover:ring-blue-500/30 transition-all duration-300 overflow-hidden"
      variants={variants}
      whileHover={{ y: -5 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

export function SocialCard({ icon, label, url, variants }) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-white dark:bg-[#0b0b0b] rounded-2xl p-6 text-center shadow-md ring-1 ring-black/5 dark:ring-white/10 hover:shadow-lg transition-all duration-300 overflow-hidden"
      variants={variants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {label}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          Visite meu perfil
        </p>
      </div>
    </motion.a>
  )
}

export function TechCard({ icon, name, variants }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 hover:shadow-md transition-shadow duration-300"
      variants={variants}
      whileHover={{ y: -5 }}
    >
      <span className="text-3xl mb-3">{icon}</span>
      <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 text-center">{name}</p>
    </motion.div>
  )
}
