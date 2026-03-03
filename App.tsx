import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck } from 'lucide-react';
import { UploadScreen } from './components/UploadScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { Dashboard } from './components/Dashboard';
import { SettingsDialog } from './components/SettingsDialog';
import { parseFile, chunkArray } from './utils/fileParser';
import { processBatch } from './services/ai';
import { exportAnalyticsCSV, exportDiscrepanciesCSV, exportFullJSON, exportPayoutCSV } from './utils/exports';
import { AIResponse, Discrepancy } from './types';

type AppState = 'upload' | 'processing' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [apiKey, setApiKey] = useState('');

  // Processing state
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Data
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [auditResult, setAuditResult] = useState<AIResponse | null>(null);

  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') as 'gemini' | 'openrouter';
    const savedKey = localStorage.getItem('ai_apikey');
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveSettings = (settings: { provider: 'gemini' | 'openrouter', apiKey: string }) => {
    setProvider(settings.provider);
    setApiKey(settings.apiKey);
    localStorage.setItem('ai_provider', settings.provider);
    localStorage.setItem('ai_apikey', settings.apiKey);
    setIsSettingsOpen(false);
  };

  const handleProcessFiles = async (invoiceFile: File, rateCardFile?: File) => {
    if (!apiKey) {
      alert(`Please configure your ${provider === 'gemini' ? 'Gemini' : 'OpenRouter'} API Key in settings first.`);
      setIsSettingsOpen(true);
      return;
    }

    try {
      setAppState('processing');
      setIsComplete(false);

      const invoiceData = await parseFile(invoiceFile);
      setOriginalData(invoiceData);

      const rateCardData = rateCardFile ? await parseFile(rateCardFile) : [];

      // Merge chunks into 30 items per batch
      const batches = chunkArray(invoiceData, 30);
      setTotalBatches(batches.length);
      setCurrentBatch(0);

      let aggregatedSummary = {
        total_billed: 0,
        total_overcharge: 0,
        verified_payout: 0,
        total_shipments_analyzed: 0,
        error_count: 0
      };

      let allDiscrepancies: Discrepancy[] = [];

      for (let i = 0; i < batches.length; i++) {
        setCurrentBatch(i + 1);

        // Pass rate card context if available, otherwise just invoice batch
        const requestData = {
          invoice_batch: batches[i],
          ...(rateCardData.length > 0 && { reference_rate_card: rateCardData })
        };

        const response = await processBatch([requestData], provider, apiKey);

        aggregatedSummary.total_billed += response.summary.total_billed || 0;
        aggregatedSummary.total_overcharge += response.summary.total_overcharge || 0;
        aggregatedSummary.verified_payout += response.summary.verified_payout || 0;
        aggregatedSummary.total_shipments_analyzed += response.summary.total_shipments_analyzed || batches[i].length;
        aggregatedSummary.error_count += response.summary.error_count || (response.discrepancies?.length || 0);

        if (response.discrepancies) {
          allDiscrepancies = [...allDiscrepancies, ...response.discrepancies];
        }
      }

      setAuditResult({
        summary: aggregatedSummary,
        discrepancies: allDiscrepancies
      });

      setIsComplete(true);

    } catch (error: any) {
      console.error(error);
      alert(`Processing failed: ${error.message || 'Unknown error occurred'}`);
      setAppState('upload');
    }
  };

  const resetApp = () => {
    setAppState('upload');
    setAuditResult(null);
    setOriginalData([]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={resetApp}>
            <div className="bg-primary-600 p-2 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">BillingChecker</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors border border-slate-200"
          >
            <Settings size={16} /> Configuration
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        {appState === 'upload' && (
          <UploadScreen onFilesAccepted={handleProcessFiles} />
        )}

        {appState === 'processing' && (
          <ProcessingScreen
            totalBatches={totalBatches}
            currentBatch={currentBatch}
            isComplete={isComplete}
            onViewResults={() => setAppState('results')}
          />
        )}

        {appState === 'results' && auditResult && (
          <Dashboard
            result={auditResult}
            onExportAnalytics={() => exportAnalyticsCSV(auditResult)}
            onExportDiscrepancies={() => exportDiscrepanciesCSV(auditResult.discrepancies)}
            onExportJSON={() => exportFullJSON(auditResult)}
            onExportPayout={() => exportPayoutCSV(auditResult.discrepancies, originalData)}
          />
        )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsDialog
          initialProvider={provider}
          initialKey={apiKey}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}

export default App;
