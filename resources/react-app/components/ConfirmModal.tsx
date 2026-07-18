import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}