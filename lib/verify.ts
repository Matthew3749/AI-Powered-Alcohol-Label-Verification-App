import {
    ApplicationData,
    ExtractedLabel,
    VerificationField,
    VerificationResult,
} from "@/types";

export const GOVERNMENT_WARNING =
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

function normalize(str: string): string {
    return str
        .toLowerCase()
        .replace(/[''`]/g, "'")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function compareBrandName(expected: string, extracted: string): VerificationField {
    const norm_e = normalize(expected);
    const norm_x = normalize(extracted);
    const exactMatch = norm_e === norm_x;

    return {
        label: "Brand Name",
        expected,
        extracted,
        status: exactMatch ? "pass" : "fail",
        note: !exactMatch ? "Brand name does not match application" : undefined,
    };
}

function parseABV(str: string): number | null {
    const match = str.match(/(\d+(?:\.\d+)?)\s*%/);
    return match ? parseFloat(match[1]) : null;
}

function compareABV(expected: string, extracted: string): VerificationField {
    const exp = parseABV(expected);
    const ext = parseABV(extracted);

    if (exp === null || ext === null) {
        return {
            label: "Alcohol Content",
            expected,
            extracted,
            status: "warning",
            note: "Could not parse ABV value — manual review recommended",
        };
    }

    const diff = Math.abs(exp - ext);
    const status = diff <= 0.1 ? "pass" : "fail";

    return {
        label: "Alcohol Content",
        expected,
        extracted,
        status,
        note: diff > 0.1 ? `ABV mismatch: ${diff.toFixed(1)}% difference` : undefined,
    };
}

function compareGovernmentWarning(extracted: string): VerificationField {
    const hasAllCaps = extracted.includes("GOVERNMENT WARNING:");
    const normalizedExtracted = extracted.replace(/\s+/g, " ").trim();
    const normalizedRequired = GOVERNMENT_WARNING.replace(/\s+/g, " ").trim();
    const textMatch =
        normalizedExtracted.toLowerCase() === normalizedRequired.toLowerCase();

    let status: VerificationField["status"] = "fail";
    let note: string | undefined;

    if (hasAllCaps && textMatch) {
        status = "pass";
    } else if (!hasAllCaps) {
        note = "'GOVERNMENT WARNING:' must appear in all caps";
    } else if (!textMatch) {
        note = "Warning text does not match required TTB language exactly";
    }

    return {
        label: "Government Warning",
        expected: GOVERNMENT_WARNING,
        extracted,
        status,
        note,
    };
}

function compareField(
    label: string,
    expected: string,
    extracted: string
): VerificationField {
    if (!extracted || extracted.trim() === "") {
        return {
            label,
            expected,
            extracted: "",
            status: "missing",
            note: `${label} not found on label`,
        };
    }

    const match = normalize(expected) === normalize(extracted);
    return {
        label,
        expected,
        extracted,
        status: match ? "pass" : "fail",
        note: !match ? `${label} does not match application` : undefined,
    };
}

export function verifyLabel(
    application: ApplicationData,
    extracted: ExtractedLabel,
    processingTimeMs: number
): VerificationResult {
    const fields: VerificationField[] = [
        compareBrandName(application.brandName, extracted.brandName ?? ""),
        compareField("Class/Type", application.classType, extracted.classType ?? ""),
        compareABV(application.alcoholContent, extracted.alcoholContent ?? ""),
        compareField("Net Contents", application.netContents, extracted.netContents ?? ""),
        compareField("Bottler Name", application.bottlerName, extracted.bottlerName ?? ""),
        compareField(
            "Bottler Address",
            application.bottlerAddress,
            extracted.bottlerAddress ?? ""
        ),
        compareField(
            "Country of Origin",
            application.countryOfOrigin,
            extracted.countryOfOrigin ?? ""
        ),
        compareGovernmentWarning(extracted.governmentWarning ?? ""),
    ];

    const overallPass = fields.every(
        (f) => f.status === "pass" || f.status === "warning"
    );

    return { overallPass, processingTimeMs, fields, rawExtracted: extracted };
}