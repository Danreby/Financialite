import { AnimatePresence, motion } from 'framer-motion';

const maxWidthClassMap = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    maxWidth = '2xl',
    closeOnOverlay = true,
    children,
}) {
    const handleOverlayClick = () => {
        if (closeOnOverlay) {
            onClose?.();
        }
    };

    const widthClass = maxWidthClassMap[maxWidth] ?? maxWidthClassMap['2xl'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gray-500/75"
                        onClick={handleOverlayClick}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        className={`relative mb-6 w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all sm:mx-auto ${widthClass}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                        {(title || onClose) && (
                            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 dark:bg-gray-900 px-4 py-3">
                                {title && (
                                    <h2
                                        id="modal-title"
                                        className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                                    >
                                        {title}
                                    </h2>
                                )}

                                {onClose && (
                                    <button
                                        type="button"
                                        onClick={() => onClose?.()}
                                        className="inline-flex rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                        aria-label="Fechar modal"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="px-4 py-5 sm:p-6">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
