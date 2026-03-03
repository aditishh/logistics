import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface SettingsDialogProps {
    onClose: () => void;
    onSave: (settings: { provider: 'gemini' | 'openrouter'; apiKey: string }) => void;
    initialProvider: 'gemini' | 'openrouter';
    initialKey: string;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose, onSave, initialProvider, initialKey }) => {
    const [provider, setProvider] = useState<'gemini' | 'openrouter'>(initialProvider);
    const [apiKey, setApiKey] = useState(initialKey);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">AI Provider Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Select Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setProvider('gemini')}
                                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${provider === 'gemini'
                                        ? 'border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500'
                                        : 'border-slate-200 hover:border-primary-300 text-slate-600'
                                    }`}
                            >
                                <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="font-medium text-sm">Google Gemini</span>
                            </button>

                            <button
                                onClick={() => setProvider('openrouter')}
                                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${provider === 'openrouter'
                                        ? 'border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500'
                                        : 'border-slate-200 hover:border-primary-300 text-slate-600'
                                    }`}
                            >
                                <div className="w-4 h-4 rounded-full bg-slate-800 flex-shrink-0" />
                                <span className="font-medium text-sm">OpenRouter</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={`Enter ${provider === 'gemini' ? 'Gemini' : 'OpenRouter'} API Key`}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-slate-500">
                            Keys are stored locally in your browser and never sent to our servers.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ provider, apiKey })}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg shadow-sm shadow-primary-500/30 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={16} /> Save Setup
                    </button>
                </div>
            </div>
        </div>
    );
};
