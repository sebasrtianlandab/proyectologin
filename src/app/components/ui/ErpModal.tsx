"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const DURATION = 0.3;
const EASE_SOFT = [0.33, 1, 0.68, 1]; // easeOut suave

export interface ErpModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Clase del contenedor del overlay (fondo). Por defecto: fondo oscuro centrado. */
    overlayClassName?: string;
    /** Clase del panel (contenido). Por defecto: card blanca centrada. */
    contentClassName?: string;
    /** Si true, clic en el overlay cierra el modal. Default true. */
    closeOnOverlayClick?: boolean;
}

/**
 * Modal estándar ERP: apertura y cierre con fade + scale (desvanecido y suave).
 * Usar en todos los modales para comportamiento uniforme.
 */
export function ErpModal({
    open,
    onClose,
    children,
    overlayClassName = 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4',
    contentClassName = 'bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto card-glow',
    closeOnOverlayClick = true,
}: ErpModalProps) {
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DURATION, ease: EASE_SOFT }}
                    className={overlayClassName}
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: DURATION, ease: EASE_SOFT }}
                        className={contentClassName}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
