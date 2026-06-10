"use client";
import { ApplicationData } from "@/types";

interface Props {
    data: ApplicationData;
    onChange: (data: ApplicationData) => void;
}

const fields: { key: keyof ApplicationData; label: string; placeholder: string }[] = [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. OLD TOM DISTILLERY" },
    { key: "classType", label: "Class / Type", placeholder: "e.g. Kentucky Straight Bourbon Whiskey" },
    { key: "alcoholContent", label: "Alcohol Content", placeholder: "e.g. 45% Alc./Vol. (90 Proof)" },
    { key: "netContents", label: "Net Contents", placeholder: "e.g. 750 mL" },
    { key: "bottlerName", label: "Bottler / Producer Name", placeholder: "e.g. Old Tom Distillery, LLC" },
    { key: "bottlerAddress", label: "Bottler / Producer Address", placeholder: "e.g. Louisville, KY 40201" },
    { key: "countryOfOrigin", label: "Country of Origin", placeholder: "e.g. USA (leave blank if domestic)" },
];

export default function ApplicationForm({ data, onChange }: Props) {
    const handleChange = (key: keyof ApplicationData, value: string) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Application Data</h2>
            <p className="text-sm text-gray-500">
                Enter the information from the COLA application to verify against the label.
            </p>
            <div className="grid grid-cols-1 gap-4">
                {fields.map(({ key, label, placeholder }) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label}
                        </label>
                        <input
                            type="text"
                            value={data[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-400 transition"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}