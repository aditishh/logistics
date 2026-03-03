import React, { useCallback, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface UploadScreenProps {
    onFilesAccepted: (invoiceFile: File, rateCardFile?: File) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onFilesAccepted }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [rateCardFile, setRateCardFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!invoiceFile) setInvoiceFile(file);
            else if (!rateCardFile) setRateCardFile(file);
        }
    }, [invoiceFile, rateCardFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'rateCard') => {
        if (e.target.files?.[0]) {
            if (type === 'invoice') setInvoiceFile(e.target.files[0]);
            if (type === 'rateCard') setRateCardFile(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Automate Billing Verification
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Upload your logistics invoices and rate cards. Our AI engine will cross-verify weight slabs, zones, and detect overcharges instantly.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Invoice Target */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">1. Master Invoice File (CSV/Excel)</label>
                    <div
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:bg-slate-50 ${isDragging ? 'border-primary-500 bg-primary-50' : invoiceFile ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}
                    >
                        <input
                            type="file" accept=".csv,.xlsx,.xls,.json"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, 'invoice')}
                        />
                        {invoiceFile ? (
                            <div className="flex flex-col items-center gap-3 text-green-700">
                                <div className="p-3 bg-green-100 rounded-full"><File className="w-8 h-8" /></div>
                                <div>
                                    <p className="font-semibold">{invoiceFile.name}</p>
                                    <p className="text-xs opacity-80">Ready to parse</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-500 group-hover:text-primary-600 transition-colors">
                                <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow group-hover:scale-105 transition-all"><UploadCloud className="w-8 h-8" /></div>
                                <p className="text-sm">Drag and drop your invoice here<br />or <span className="font-semibold text-primary-600 underline">browse files</span></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rate Card Target */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">2. Brand Rate Card (Optional if context fed)</label>
                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:bg-slate-50 ${rateCardFile ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}
                    >
                        <input
                            type="file" accept=".csv,.xlsx,.xls,.json"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, 'rateCard')}
                        />
                        {rateCardFile ? (
                            <div className="flex flex-col items-center gap-3 text-green-700">
                                <div className="p-3 bg-green-100 rounded-full"><File className="w-8 h-8" /></div>
                                <div>
                                    <p className="font-semibold">{rateCardFile.name}</p>
                                    <p className="text-xs opacity-80">Reference linked</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-500 group-hover:text-primary-600 transition-colors">
                                <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow group-hover:scale-105 transition-all"><UploadCloud className="w-8 h-8" /></div>
                                <p className="text-sm">Drag and drop your rate card here<br />or <span className="font-semibold text-primary-600 underline">browse files</span></p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => invoiceFile && onFilesAccepted(invoiceFile, rateCardFile || undefined)}
                    disabled={!invoiceFile}
                    className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${invoiceFile
                            ? 'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/30 transform hover:-translate-y-1 active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    Start Audit Processing
                </button>
            </div>

            {!invoiceFile && (
                <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm max-w-2xl mx-auto">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                        The system accepts <strong>CSV, Excel (XLSX), or JSON</strong> formats. Uploading a custom rate card allows for precise checking of Non-Contracted Surcharges and Rate Deviations. Otherwise, general overcharge detection (e.g. Weight slabs, zone mismatches) will apply default logic based on expected standard matrices.
                    </p>
                </div>
            )}
        </div>
    );
};
