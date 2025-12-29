import React, { useEffect, useState } from 'react'
import axios from 'axios'
import BareButton from '@/Components/common/buttons/BareButton'

export default function NotificationSidebar({ open, onClose }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(route('notifications.index'))
        if (!cancelled) {
          setNotifications(response.data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar notificações', error)
      }
    }

    fetchNotifications()

    return () => {
      cancelled = true
    }
  }, [open])

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(route('notifications.mark-all-as-read'))
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() })),
      )
    } catch (error) {
      console.error('Erro ao marcar todas como lidas', error)
    }
  }

  const handleClearAll = async () => {
    try {
      await axios.delete(route('notifications.clear-all'))
      setNotifications([])
    } catch (error) {
      console.error('Erro ao limpar notificações', error)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-end transition-pointer-events ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`relative h-full w-full max-w-sm bg-white dark:bg-[#0b0b0b] shadow-xl ring-1 ring-black/10 dark:ring-black/40 transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notificações</h2>

          <div className="flex items-center gap-2">
            <BareButton
              type="button"
              onClick={handleMarkAllAsRead}
              className="hidden sm:inline-flex px-2 py-1 rounded-md text-[0.68rem] font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300/50 dark:hover:text-gray-300 dark:hover:bg-gray-800 border border-transparent"
            >
              Marcar como lidas
            </BareButton>

            <BareButton
              type="button"
              onClick={handleClearAll}
              className="hidden sm:inline-flex px-2 py-1 rounded-md text-[0.68rem] font-medium text-red-600 hover:bg-red-50 dark:text-red-400/50 dark:hover:text-red-400 dark:hover:bg-red-900/30 border border-transparent"
            >
              Limpar
            </BareButton>

            <BareButton
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Fechar notificações"
            >
              <span className="text-lg leading-none">x</span>
            </BareButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm text-gray-800 dark:text-gray-100">
          {(!notifications || notifications.length === 0) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Nenhuma notificação por enquanto.</p>
          )}

          {notifications && notifications.length > 0 && (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`rounded-md border px-3 py-2 text-xs shadow-sm dark:border-gray-800 ${
                    notification.is_read
                      ? 'bg-gray-50 text-gray-600 dark:bg-[#111] dark:text-gray-400'
                      : 'bg-white text-gray-800 border-indigo-100 dark:bg-[#151515] dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[0.74rem] leading-snug">{notification.title}</p>
                      {notification.message && (
                        <p className="mt-0.5 text-[0.7rem] leading-snug text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
