export interface InvoiceRow {
    TrackingNumber: string;
    ShipmentDate: string;
    OriginPincode: string;
    DestinationPincode: string;
    Weight: number;
    Zone: string;
    BaseFreightRate: number;
    CODFee: number;
    [key: string]: any;
}

export interface Discrepancy {
    awb: string;
    error_type: "Weight Overcharge" | "Zone Mismatch" | "Rate Deviation" | "Duplicate AWB" | "Incorrect COD Fee" | "RTO Overcharge" | "Non-Contracted Surcharges";
    billed_amount: number;
    expected_amount: number;
    overcharge_amount: number;
    explanation: string;
}

export interface AIResponseSummary {
    total_billed: number;
    total_overcharge: number;
    verified_payout: number;
    total_shipments_analyzed: number;
    error_count: number;
}

export interface AIResponse {
    summary: AIResponseSummary;
    discrepancies: Discrepancy[];
}
