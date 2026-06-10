"use client";
import { useCallback, useState } from "react";

interface Props {
    onFileSelect: (file: File) => void;
    file: File | null;
}

export default function DropZone({ onFileSelect, file }: Props) {
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) onFileSelect(dropped);
        },
        [onFileSelect]
    );

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
        ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
            onClick={() => document.getElementById("fileInput")?.click()}
        >
            <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
            />
            {file ? (
                <div className="space-y-3">
                    <img
                        src={URL.createObjectURL(file)}
                        alt="Label preview"
                        className="max-h-48 mx-auto rounded-lg shadow object-contain"
                    />
                    <p className="text-sm text-gray-600 font-medium">{file.name}</p>
                    <p className="text-xs text-blue-500">Click or drag to replace</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="text-5xl">🏷️</div>
                    <p className="text-lg font-semibold text-gray-700">
                        Drop label image here
                    </p>
                    <p className="text-sm text-gray-500">
                        or click to browse — JPG, PNG, WEBP supported
                    </p>
                </div>
            )}
        </div>
    );
}