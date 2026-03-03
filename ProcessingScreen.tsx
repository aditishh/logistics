import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingScreenProps {
    totalBatches: number;
    currentBatch: number;
    isComplete: boolean;
    onViewResults: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
    totalBatches,
    currentBatch,
    isComplete,
    onViewResults
}) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let timer: any;
        if (!isComplete) {
            timer = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isComplete]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const progress = totalBatches === 0 ? 0 : (currentBatch / totalBatches) * 100;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full text-center relative overflow-hidden">

                {/* Background glow */}
                <div className={`absolute -top-24 -left-24 w-48 h-48 bg-primary-400/20 rounded-full blur-3xl transition-opacity duration-1000 ${isComplete ? 'opacity-100 bg-green-400/20' : 'opacity-50 animate-pulse'}`} />

                {!isComplete ? (
                    <div className="relative z-10 flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Shipments</h2>
                        <p className="text-slate-500 mb-8 max-w-[250px] mx-auto">
                            Cross-referencing weight slabs, zones, and expected base freight...
                        </p>

                        <div className="w-full space-y-2 mb-6">
                            <div className="flex justify-between text-sm font-medium text-slate-700">
                                <span>Batch {currentBatch} of {totalBatches}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="text-sm font-mono bg-slate-50 text-slate-600 px-4 py-2 rounded-lg border border-slate-100 inline-block">
                            Elapsed: {formatTime(elapsed)}
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Audit Complete!</h2>
                        <p className="text-slate-500 mb-8">
                            Successfully matched and verified all records. Total time: {formatTime(elapsed)}
                        </p>

                        <button
                            onClick={onViewResults}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                        >
                            View Dashboard summary
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
