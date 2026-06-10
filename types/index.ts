export type FieldStatus = "pass" | "fail" | "warning" | "missing";

export interface VerificationField {
    label: string;
    expected: string;
    extracted: string;
    status: FieldStatus;
    note?: string;
}

export interface VerificationResult {
    overallPass: boolean;
    processingTimeMs: number;
    fields: VerificationField[];
    rawExtracted: ExtractedLabel;
}

export interface ExtractedLabel {
    brandName?: string;
    classType?: string;
    alcoholContent?: string;
    netContents?: string;
    bottlerName?: string;
    bottlerAddress?: string;
    countryOfOrigin?: string;
    governmentWarning?: string;
}

export interface ApplicationData {
    brandName: string;
    classType: string;
    alcoholContent: string;
    netContents: string;
    bottlerName: string;
    bottlerAddress: string;
    countryOfOrigin: string;
}

export interface BatchItem {
    fileName: string;
    applicationData: ApplicationData;
    result?: VerificationResult;
    error?: string;
    status: "pending" | "processing" | "done" | "error";
}