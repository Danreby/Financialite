import React from 'react'
import { Link } from '@inertiajs/react'
import ArrowIcon from '@/Components/common/icons/ArrowIcon'

export default function Pagination({ links = [] }) {
  if (!links || links.length <= 1) return null

  return (
    <nav className="mt-4 flex justify-center">
      <ul className="inline-flex items-center gap-1 text-xs">
        {links.map((link, index) => {
          const key = `${link.label ?? index}-${index}`

          const isFirst = index === 0
          const isLast = index === links.length - 1

          if (!link.url) {
            return (
              <li key={key}>
                <span className="px-2.5 py-1 rounded border border-transparent text-gray-400 dark:text-gray-600 inline-flex items-center justify-center">
                  {isFirst && <ArrowIcon type="left" size={14} />}
                  {isLast && <ArrowIcon type="right" size={14} />}
                  {!isFirst && !isLast && (
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                  )}
                </span>
              </li>
            )
          }

          const isActive = link.active

          return (
            <li key={key}>
              <Link
                href={link.url}
                preserveScroll
                preserveState
                className={
                  isActive
                    ? 'px-2.5 py-1 rounded border border-rose-500 bg-rose-500 text-white shadow-sm'
                    : 'px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-[#111] dark:text-gray-200 dark:hover:bg-gray-800'
                }
              >
                <span className="inline-flex items-center justify-center gap-1">
                  {isFirst && <ArrowIcon type="left" size={14} />}
                  {isLast && <ArrowIcon type="right" size={14} />}
                  {!isFirst && !isLast && (
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
