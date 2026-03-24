'use client';

import { useState } from 'react';
import { useItineraryStore } from '@/store/useItineraryStore';
import { pdf } from '@react-pdf/renderer';
import { PremiumItineraryPDF } from '@/components/pdf/PremiumItineraryPDF';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false }
);

export default function ExportMenu() {
    // Calling the hook without arguments returns the entire state object!
    const itineraryData = useItineraryStore();
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [debugMode, setDebugMode] = useState(false);

    // --- PDF EXPORT HANDLER ---
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            // Generate the PDF blob in-memory using React-PDF
            const blob = await pdf(<PremiumItineraryPDF itineraryData={itineraryData} />).toBlob();

            // Create a temporary hidden link to trigger the browser download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Clean up the file name
            const safeTitle = (itineraryData.tripTitle || 'Package').replace(/\s+/g, '_');
            link.download = `${safeTitle}_Itinerary.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to export PDF. Ensure all image URLs are valid.");
        }
        setIsExporting(false);
    };

    // --- PDF PREVIEW HANDLER ---
    const handlePreviewPDF = () => {
        setShowPreview(true);
    };

    // --- WORD (DOCX) EXPORT HANDLER ---
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleExportWord = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/export-docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itineraryData),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const safeTitle = (itineraryData.tripTitle || 'Package').replace(/\s+/g, '_');
            link.href = url;
            link.download = `${safeTitle}_Itinerary.docx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Word Export failed:", error);
            alert("Failed to export Word document. Make sure the API route exists.");
        }
        setIsExporting(false);
    };

    return (
        <>
            <div className="relative group inline-block">
                {/* Primary Dropdown Trigger */}
                <button
                    disabled={isExporting}
                    className="px-4 py-1.5 bg-amber-600 text-white text-xs font-medium rounded shadow-sm hover:bg-amber-700 transition disabled:opacity-50"
                >
                    {isExporting ? 'Generating...' : 'Export As ▼'}
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                        onClick={handlePreviewPDF}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 font-medium transition"
                    >
                        👁️ Preview PDF
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 font-medium transition"
                    >
                        📄 Export PDF
                    </button>
                    {/* <button
                    onClick={handleExportWord}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                    📝 Download Word (.docx)
                </button> */}
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900/90 backdrop-blur-sm p-4">
                    <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-t-lg shadow-lg">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-medium">Document Preview</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    // Toggle debug layout on double click or similar mechanism, for now add a simple switch
                                    setDebugMode(!debugMode);
                                }}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm transition"
                            >
                                Toggle Debug Overlay
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded text-sm font-medium transition"
                            >
                                {isExporting ? 'Exporting...' : 'Export PDF'}
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div id="pdf-viewer-container" className="flex-1 w-full bg-gray-100 rounded-b-lg overflow-hidden border border-gray-700">
                        <PDFViewer key={debugMode ? 'debug-on' : 'debug-off'} width="100%" height="100%" className="border-0">
                            {/* We use a hacky key to re-render if we need to implement state-based debug toggling, for now we just pass a hardcoded debuglyout */}
                            <PremiumItineraryPDF itineraryData={itineraryData} debugLayout={debugMode} />
                        </PDFViewer>
                    </div>
                </div>
            )}
        </>
    );
}