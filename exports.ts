import * as Papa from 'papaparse';
import { AIResponse, Discrepancy } from '../types';

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportDiscrepanciesCSV = (discrepancies: Discrepancy[]) => {
    const csv = Papa.unparse(discrepancies);
    downloadFile(csv, 'discrepancies_report.csv', 'text/csv;charset=utf-8;');
};

export const exportPayoutCSV = (discrepancies: Discrepancy[], originalData: any[]) => {
    // Payout CSV: the clean file containing AWB, Provider, expected_amount (Billed - Overcharge)
    // If an AWB is not in discrepancies, expected_amount = original billed amount.
    const discMap = new Map(discrepancies.map(d => [d.awb, d]));

    const payoutData = originalData.map(row => {
        // Attempt to parse standard variations of AWB parsing
        const awb = row['AWB'] || row['Tracking Number'] || row['TrackingNumber'] || row['awb'];
        const billed = parseFloat(row['Billed Amount'] || row['Amount'] || row['BaseFreightRate'] || '0');

        const discrepancy = discMap.get(awb);
        const expected = discrepancy ? discrepancy.expected_amount : billed;

        return {
            AWB: awb,
            Provider: row['Provider'] || row['Logistics Partner'] || 'Unknown',
            Billed_Amount: billed,
            Expected_Amount: expected,
            Overcharge: discrepancy ? discrepancy.overcharge_amount : 0,
            Has_Discrepancy: !!discrepancy
        };
    });

    const csv = Papa.unparse(payoutData);
    downloadFile(csv, 'verified_payout.csv', 'text/csv;charset=utf-8;');
};

export const exportAnalyticsCSV = (response: AIResponse) => {
    const data = [
        { Metric: 'Total Shipments Analyzed', Value: response.summary.total_shipments_analyzed },
        { Metric: 'Total Billed Amount', Value: response.summary.total_billed },
        { Metric: 'Total Overcharge', Value: response.summary.total_overcharge },
        { Metric: 'Verified Payout', Value: response.summary.verified_payout },
        { Metric: 'Total Errors Found', Value: response.summary.error_count },
    ];
    const csv = Papa.unparse(data);
    downloadFile(csv, 'analytics_summary.csv', 'text/csv;charset=utf-8;');
};

export const exportFullJSON = (response: AIResponse) => {
    const json = JSON.stringify(response, null, 2);
    downloadFile(json, 'full_audit_results.json', 'application/json;charset=utf-8;');
};
