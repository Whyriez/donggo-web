import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Trash2,
    RotateCcw,
    X,
    ShieldAlert,
    CheckCircle2,
    Database,
    Sparkles,
    Flame
} from 'lucide-react';

interface ResetDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ResetDataModal({ isOpen, onClose }: ResetDataModalProps) {
    const [selectedMode, setSelectedMode] = useState<'wipe' | 'seed'>('seed');
    const [confirmationInput, setConfirmationInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const isConfirmed = confirmationInput.trim().toUpperCase() === 'RESET';

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!isConfirmed) {
            setErrorMsg('Ketik kata RESET dengan benar untuk konfirmasi.');
            return;
        }

        setIsSubmitting(true);
        const endpoint = selectedMode === 'wipe' ? '/admin/system/reset-wipe' : '/admin/system/reset-seed';

        router.post(
            endpoint,
            { confirmation: 'RESET' },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setConfirmationInput('');
                    onClose();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setErrorMsg(Object.values(errors)[0] as string || 'Gagal melakukan reset data.');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-stone-900 leading-tight">
                                Manajemen Reset Database & Telemetri
                            </h2>
                            <p className="text-[11px] text-stone-500">
                                Opsi pembersihan data telemetri atau pemulihan data sampel awal
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleReset} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                    {/* Information Box */}
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Pemberitahuan Penghapusan Fisik (Hard Delete)</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                            Aksi reset ini menggunakan <strong>Hard Delete / Truncate permanen</strong>. 
                            Data telemetri yang dihapus <strong>tidak menggunakan Soft Delete</strong> (tidak tersimpan di database) sehingga data lama akan hilang total demi kebersihan analitik.
                        </p>
                    </div>

                    {/* Mode Options */}
                    <div className="space-y-2.5">
                        <label className="font-semibold text-stone-700 block">
                            Pilih Mode Tindakan Reset:
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Option 1: Re-seed Starter Demo */}
                            <div
                                onClick={() => !isSubmitting && setSelectedMode('seed')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                                    selectedMode === 'seed'
                                        ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-400/20'
                                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-stone-900 text-xs">
                                            Reset & Isi Data Sampel
                                        </span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="resetMode"
                                        checked={selectedMode === 'seed'}
                                        onChange={() => setSelectedMode('seed')}
                                        className="text-orange-600 focus:ring-orange-500 mt-1 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[11px] text-stone-500 leading-relaxed">
                                    Membersihkan log lama dan mengisi ulang <strong>7 profil siswa contoh, 81 video plays, dan 49 sesi dubbing</strong> dari Seeder untuk presentasi/pengujian.
                                </p>
                            </div>

                            {/* Option 2: Hard Wipe Clean */}
                            <div
                                onClick={() => !isSubmitting && setSelectedMode('wipe')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                                    selectedMode === 'wipe'
                                        ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-400/20'
                                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                            <Flame className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-stone-900 text-xs">
                                            Kosongkan Total (0)
                                        </span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="resetMode"
                                        checked={selectedMode === 'wipe'}
                                        onChange={() => setSelectedMode('wipe')}
                                        className="text-rose-600 focus:ring-rose-500 mt-1 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[11px] text-stone-500 leading-relaxed">
                                    Menghapus bersih seluruh data siswa dan riwayat log (kembali ke <strong>0</strong>). Cocok untuk mulai mengumpulkan <strong>data riil aplikasi Android</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What is Kept Safe */}
                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-between text-stone-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-[11px]">
                                Akun Admin Login & Katalog Cerita Rakyat tetap aman terjaga.
                            </span>
                        </div>
                        <span className="font-mono text-[10px] text-stone-400 font-semibold uppercase">Aman</span>
                    </div>

                    {/* Confirmation Input Box */}
                    <div className="space-y-2 pt-1 border-t border-stone-100">
                        <label className="block text-xs font-semibold text-stone-800">
                            Ketik kata <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">RESET</span> untuk mengonfirmasi:
                        </label>
                        <input
                            type="text"
                            value={confirmationInput}
                            onChange={(e) => setConfirmationInput(e.target.value)}
                            placeholder="Ketik RESET"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs font-mono transition-all outline-hidden"
                            autoComplete="off"
                        />
                        {errorMsg && (
                            <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>
                        )}
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={!isConfirmed || isSubmitting}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-semibold text-xs transition-all shadow-xs cursor-pointer ${
                                !isConfirmed || isSubmitting
                                    ? 'bg-stone-300 cursor-not-allowed opacity-70'
                                    : selectedMode === 'wipe'
                                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                                    : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
                            }`}
                        >
                            {isSubmitting ? (
                                <span>Sedang Memproses...</span>
                            ) : selectedMode === 'wipe' ? (
                                <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Bersih Database (0)</span>
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset & Isi Data Sampel</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
