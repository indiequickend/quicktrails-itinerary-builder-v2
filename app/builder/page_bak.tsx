'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getItineraryById, saveItinerary, createItinerary } from '@/actions/Itinerary';
import { getCatalogItems } from '@/actions/catalog';
import { useItineraryStore } from '@/store/useItineraryStore';
import DraggableWindow from 'react-draggable';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { getBrandSettings } from '@/actions/settings';
import B2BPanel from '@/components/B2BPanel';
import { CldUploadWidget } from 'next-cloudinary';
import { Editor } from '@tinymce/tinymce-react';

// --- NEW IMPORTS FOR PDF GENERATION ---
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

function BuilderWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const itineraryId = searchParams.get('id') || null;

    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(!!itineraryId);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false); // <-- Track PDF generation state

    const nodeRef = useRef(null);
    const previewRef = useRef<HTMLDivElement>(null); // <-- Ref to target the Live Preview wrapper

    const [catalogItems, setCatalogItems] = useState<any[]>([]);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogFilter, setCatalogFilter] = useState('ALL');
    const [toolboxTab, setToolboxTab] = useState<'SETUP' | 'CATALOG'>('SETUP');

    const [newInclusion, setNewInclusion] = useState('');
    const [newExclusion, setNewExclusion] = useState('');

    const {
        tripTitle, setTripTitle,
        durationText, setDurationText,
        days, addDay, removeDay, updateDayTitle, updateDayDescription, addActivityToDay, moveActivity, removeActivity,
        b2bDetails,
        heroImage, setHeroImage,
        brandSettings, setBrandSettings,
        inclusions, updateInclusion, addInclusion, removeInclusion, setInclusions,
        exclusions, updateExclusion, addExclusion, removeExclusion, setExclusions,
        terms, setTerms,
        loadItinerary
    } = useItineraryStore();

    useEffect(() => {
        setTimeout(() => {
            setIsMounted(true);
        }, 100);
        async function fetchDraft() {
            const brandData = await getBrandSettings();
            if (brandData) {
                setBrandSettings({
                    companyName: brandData.companyName || '',
                    primaryLogoUrl: brandData.primaryLogoUrl || ''
                });

                if (!itineraryId) {
                    setInclusions(brandData.defaultInclusions || []);
                    setExclusions(brandData.defaultExclusions || []);
                    setTerms(brandData.defaultTerms || '');
                }
            }

            if (itineraryId) {
                const res = await getItineraryById(itineraryId);
                if (res.success && res.data) loadItinerary(res.data);
                setIsLoading(false);

                if (res.data.inclusions.length === 0) setInclusions(brandData.defaultInclusions || []);
                if (res.data.exclusions.length === 0) setExclusions(brandData.defaultExclusions || []);
                if (res.data.terms === '') setTerms(brandData.defaultTerms || '');
            }
        }
        fetchDraft();
    }, [itineraryId, loadItinerary, setBrandSettings]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const res = await getCatalogItems(1, 50, catalogSearch);
            if (res.success) {
                let filtered = res.items;
                if (catalogFilter !== 'ALL') filtered = filtered.filter((item: any) => item.type === catalogFilter);
                setCatalogItems(filtered);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [catalogSearch, catalogFilter]);

    const activeAgencyName = b2bDetails?.isB2B && b2bDetails?.agencyName
        ? b2bDetails.agencyName
        : brandSettings.companyName;

    const activeLogoUrl = b2bDetails?.isB2B
        ? (b2bDetails?.logoUrl ? b2bDetails.logoUrl : null)
        : brandSettings.primaryLogoUrl;

    const handleSave = async () => {
        setIsSaving(true);
        const dataToSave = {
            tripTitle,
            durationText,
            b2bDetails,
            days,
            inclusions,
            exclusions,
            terms,
            heroGallery: heroImage ? [heroImage] : []
        };

        if (itineraryId) {
            const res = await saveItinerary(itineraryId, dataToSave);
            if (res.success) alert("Itinerary updated successfully!");
            else alert("Failed to update.");
        } else {
            const res = await createItinerary(dataToSave);
            if (res.success) {
                alert("New itinerary created successfully!");
                router.replace(`/builder?id=${res.newId}`);
            } else {
                alert("Failed to create.");
            }
        }
        setIsSaving(false);
    };

    // --- PDF GENERATION FUNCTION ---
    const handleDownloadPDF = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);

        try {
            // 1. Capture the DOM element as a Canvas
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,           // Higher resolution for crisp text/images
                useCORS: true,      // CRITICAL: Required for fetching Cloudinary images
                logging: false,
                backgroundColor: '#ffffff' // Ensure white background
            });

            // 2. Convert canvas to image data
            const imgData = canvas.toDataURL('image/png');

            // 3. Initialize jsPDF (A4 standard)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // 4. Calculate scaling to fit the A4 width perfectly
            const imgWidthInMm = pdfWidth;
            const imgHeightInMm = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeightInMm;
            let position = 0;

            // 5. Add the first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidthInMm, imgHeightInMm);
            heightLeft -= pdfHeight;

            // 6. Loop and add new pages if the itinerary is long
            while (heightLeft > 0) {
                position = heightLeft - imgHeightInMm;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidthInMm, imgHeightInMm);
                heightLeft -= pdfHeight;
            }

            // 7. Trigger the download with a customized filename
            const fileName = tripTitle
                ? `${tripTitle.replace(/\s+/g, '_')}_QuickTrails.pdf`
                : 'QuickTrails_Itinerary.pdf';

            pdf.save(fileName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("There was an error generating the PDF. Please check the console.");
        } finally {
            setIsExporting(false);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === 'CATALOG') {
            const item = catalogItems[source.index];
            const destDayIndex = parseInt(destination.droppableId.split('-')[1]);

            const mappedActivity = {
                instanceId: `temp-${Date.now()}`,
                title: item.title,
                description: item.description || '',
                imageUrl: item.images && item.images.length > 0 ? item.images[0].url : '',
                tags: [item.type, item.location, item.estimatedDuration].filter(Boolean)
            };
            addActivityToDay(destDayIndex, mappedActivity, destination.index);
            return;
        }

        if (source.droppableId.startsWith('DAY-') && destination.droppableId.startsWith('DAY-')) {
            const sourceDayIndex = parseInt(source.droppableId.split('-')[1]);
            const destDayIndex = parseInt(destination.droppableId.split('-')[1]);
            moveActivity(sourceDayIndex, destDayIndex, source.index, destination.index);
        }
    };

    if (!isMounted) return null;
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-500 font-medium">Loading workspace...</div></div>;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50 text-sm relative">

                {/* FLOATING TOOLBOX WIDGET (Unchanged) */}
                <DraggableWindow nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
                    {/* ... Keep all existing toolbox code ... */}
                    <div ref={nodeRef} className="absolute top-6 left-6 w-80 bg-white shadow-2xl rounded-md border border-gray-200 z-50 flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="drag-handle bg-gray-900 text-white p-3 flex justify-between items-center cursor-move shrink-0">
                            <span className="font-semibold text-xs uppercase tracking-wider">🧰 Builder Toolbox</span>
                        </div>

                        {/* ================= TABS NAVIGATION ================= */}
                        <div className="flex border-b border-gray-100 shrink-0 bg-gray-50">
                            <button
                                onClick={() => setToolboxTab('SETUP')}
                                className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${toolboxTab === 'SETUP' ? 'border-b-2 border-amber-500 text-amber-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Trip Setup
                            </button>
                            <button
                                onClick={() => setToolboxTab('CATALOG')}
                                className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${toolboxTab === 'CATALOG' ? 'border-b-2 border-amber-500 text-amber-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Catalog
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="overflow-y-auto flex-grow flex flex-col p-5">
                            {/* ================= TAB 1: TRIP SETUP ================= */}
                            {toolboxTab === 'SETUP' && (
                                <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                                    {/* <h2 className="font-serif font-bold text-gray-900 mb-3 text-lg">Trip Setup</h2> */}
                                    <div className="space-y-3 mb-6">
                                        <input type="text" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} placeholder="Trip Title" className="w-full p-2 border border-gray-300 rounded outline-none" />
                                        <input type="text" value={durationText} onChange={(e) => setDurationText(e.target.value)} placeholder="Duration" className="w-full p-2 border border-gray-300 rounded outline-none" />
                                        {/* CLOUDINARY HERO IMAGE UPLOAD */}
                                        <div>
                                            <CldUploadWidget
                                                uploadPreset="quicktrails_preset"
                                                onSuccess={(result: any) => setHeroImage(result.info.secure_url)}
                                            >
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="w-full py-2 px-3 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex justify-between items-center transition"
                                                    >
                                                        <span className="truncate">{heroImage ? 'Change Cover Image' : 'Upload Cover Image'}</span>
                                                        <span>📸</span>
                                                    </button>
                                                )}
                                            </CldUploadWidget>

                                            {/* Tiny thumbnail preview inside the toolbox */}
                                            {heroImage && (
                                                <div className="mt-2 w-full rounded border border-gray-200 overflow-hidden">
                                                    <img src={heroImage} alt="Hero Preview" className="w-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <B2BPanel />
                                        {/* ITINERARY SPECIFIC INCLUSIONS */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <label className="block text-sm font-serif font-bold text-gray-900 mb-2">Inclusions</label>
                                            <div className="space-y-1 mb-2 max-h-32 overflow-y-auto pr-1">
                                                {inclusions.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-1.5 bg-green-50 text-green-800 text-xs rounded border border-green-100 group">
                                                        <div className="flex items-center gap-1.5 flex-grow mr-2">
                                                            <span className="text-green-600 font-bold shrink-0">✓</span>
                                                            <input
                                                                type="text"
                                                                value={item}
                                                                onChange={(e) => updateInclusion(idx, e.target.value)}
                                                                className="bg-transparent border-none outline-none flex-grow text-xs focus:ring-1 focus:ring-green-400 rounded px-1"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeInclusion(idx)} className="text-green-600 hover:text-red-500 font-bold leading-none px-1 text-base opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    value={newInclusion}
                                                    onChange={(e) => setNewInclusion(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newInclusion.trim()) {
                                                            addInclusion(newInclusion.trim());
                                                            setNewInclusion('');
                                                        }
                                                    }}
                                                    placeholder="Add inclusion..."
                                                    className="flex-grow p-1.5 text-xs border border-gray-300 rounded focus:ring-amber-500 outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (newInclusion.trim()) { addInclusion(newInclusion.trim()); setNewInclusion(''); }
                                                    }}
                                                    className="px-2 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 border border-gray-300"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                        {/* ITINERARY SPECIFIC EXCLUSIONS */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-serif font-bold text-gray-900 mb-2">Exclusions</label>
                                            <div className="space-y-1 mb-2 max-h-32 overflow-y-auto pr-1">
                                                {exclusions.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-1.5 bg-red-50 text-red-800 text-xs rounded border border-red-100 group">
                                                        <div className="flex items-center gap-1.5 flex-grow mr-2">
                                                            <span className="text-red-600 font-bold shrink-0">✗</span>
                                                            <input
                                                                type="text"
                                                                value={item}
                                                                onChange={(e) => updateExclusion(idx, e.target.value)}
                                                                className="bg-transparent border-none outline-none flex-grow text-xs focus:ring-1 focus:ring-red-400 rounded px-1"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeExclusion(idx)} className="text-red-600 hover:text-red-800 font-bold leading-none px-1 text-base opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    value={newExclusion}
                                                    onChange={(e) => setNewExclusion(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newExclusion.trim()) {
                                                            addExclusion(newExclusion.trim());
                                                            setNewExclusion('');
                                                        }
                                                    }}
                                                    placeholder="Add exclusion..."
                                                    className="flex-grow p-1.5 text-xs border border-gray-300 rounded focus:ring-amber-500 outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (newExclusion.trim()) { addExclusion(newExclusion.trim()); setNewExclusion(''); }
                                                    }}
                                                    className="px-2 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 border border-gray-300"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ================= TAB 2: MASTER CATALOG ================= */}
                            {toolboxTab === 'CATALOG' && (
                                <div className="flex flex-col flex-grow min-h-0 animate-in fade-in slide-in-from-right-2 duration-200">
                                    {/* <h2 className="font-serif font-bold text-gray-900 mb-3 text-lg">Master Catalog</h2> */}

                                    {/* Filters */}
                                    <div className="space-y-3 mb-4 shrink-0">
                                        <input type="text" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} placeholder="Search catalog..." className="w-full py-2 px-3 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-amber-500 shadow-sm" />
                                        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                            {['ALL', 'HOTEL', 'ACTIVITY', 'TRANSFER'].map(f => (
                                                <button key={f} onClick={() => setCatalogFilter(f)} className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold shrink-0 transition ${catalogFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{f}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Catalog Droppable Zone */}
                                    <Droppable droppableId="CATALOG" isDropDisabled={true}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="overflow-y-auto space-y-3 pr-1 pb-4 min-h-[100px]">
                                                {catalogItems.map((item, index) => {
                                                    let colorTheme = 'text-gray-600'; let bgTheme = 'bg-gray-100'; let barTheme = 'bg-gray-400';
                                                    if (item.type === 'HOTEL') { colorTheme = 'text-amber-600'; bgTheme = 'bg-amber-50'; barTheme = 'bg-amber-500'; }
                                                    else if (item.type === 'ACTIVITY') { colorTheme = 'text-blue-600'; bgTheme = 'bg-blue-50'; barTheme = 'bg-blue-500'; }
                                                    else if (item.type === 'TRANSFER') { colorTheme = 'text-green-700'; bgTheme = 'bg-green-50'; barTheme = 'bg-green-500'; }

                                                    return (
                                                        <Draggable key={String(item._id)} draggableId={String(item._id)} index={index}>
                                                            {(provided, snapshot) => {
                                                                const child = (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={provided.draggableProps.style} /* <-- CRITICAL FIX 1 */
                                                                        className={`group relative flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-white shadow-sm cursor-grab hover:shadow-md transition ${snapshot.isDragging ? 'shadow-2xl border-amber-500 z-[99999] opacity-90' : ''}`}
                                                                    >
                                                                        <div className={`w-1 h-full absolute left-0 top-0 bottom-0 ${barTheme} rounded-l-md`}></div>

                                                                        <div className="ml-2 flex-grow">
                                                                            <div className="flex items-center gap-3">
                                                                                {item.images?.length > 0 ? (
                                                                                    <img src={item.images[0].url} alt={item.title} className="w-15 h-15 object-cover rounded bg-gray-100 shrink-0" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-3xl">📸</div>
                                                                                )}
                                                                                <div>
                                                                                    <div className="flex justify-between items-start mb-1">
                                                                                        <span className={`text-[9px] font-bold ${colorTheme} uppercase tracking-wider ${bgTheme} px-1.5 py-0.5 rounded`}>{item.type}</span>
                                                                                    </div>
                                                                                    <p className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</p>
                                                                                    <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">📍 {item.location}</p>

                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );

                                                                // CRITICAL FIX 2: Teleport it outside the Toolbox when dragging
                                                                if (snapshot.isDragging && typeof document !== 'undefined') {
                                                                    return createPortal(child, document.body);
                                                                }
                                                                return child;
                                                            }}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )}
                        </div>
                    </div>
                </DraggableWindow>

                {/* PANE 1: THE DAY BUILDER */}
                <div className="w-[35%] h-full overflow-y-auto border-r border-gray-200 bg-gray-100 p-8 pl-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-serif font-bold text-gray-900 text-2xl">Daily Schedule</h2>
                        <div className="flex items-center space-x-2">
                            {/* NEW PDF EXPORT BUTTON */}
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isExporting}
                                className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded shadow-sm disabled:opacity-50"
                            >
                                {isExporting ? 'Generating PDF...' : '📄 Export PDF'}
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded shadow-sm disabled:opacity-50">{isSaving ? 'Saving...' : '💾 Save'}</button>
                            <button onClick={addDay} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded shadow-sm">+ Add Day</button>
                        </div>
                    </div>

                    {/* ... Keep all existing builder code (days mapping, terms editor, etc.) ... */}
                    {/* The Droppable DAY zones remain exactly the same as your provided code */}
                    <div className="space-y-4 pb-16">
                        {days.map((day, dayIndex) => (
                            <div key={dayIndex} className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
                                <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <span className="font-medium text-gray-900 text-xs uppercase tracking-wider">Day {day.dayNumber}</span>
                                    <button onClick={() => removeDay(dayIndex)} className="text-xs text-red-600 hover:text-red-800 font-medium">Remove</button>
                                </div>
                                <div className="p-2 border-b border-gray-100">
                                    <input type="text" value={day.dayTitle} onChange={(e) => updateDayTitle(dayIndex, e.target.value)} placeholder="Day Title..." className="w-full p-2 font-medium text-gray-900 bg-transparent outline-none focus:bg-white rounded transition" />
                                    <textarea
                                        rows={2}
                                        value={day.dayDescription || ''}
                                        onChange={(e) => updateDayDescription(dayIndex, e.target.value)}
                                        placeholder="Write a short highlight summary for this day..."
                                        className="w-full p-2 text-sm text-gray-700 bg-gray-50 outline-none focus:bg-white focus:ring-1 focus:ring-amber-500 rounded transition resize-none"
                                    />
                                </div>

                                {/* Day Droppable Zone */}
                                <Droppable droppableId={`DAY-${dayIndex}`}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef} {...provided.droppableProps}
                                            className={`p-3 m-2 min-h-[100px] border-2 border-dashed rounded transition ${snapshot.isDraggingOver ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
                                        >
                                            {day.activities?.map((act: any, actIndex: number) => {
                                                // Check for DB _id first, fallback to the temp instanceId
                                                const safeId = act._id ? String(act._id) : act.instanceId;

                                                return (
                                                    <Draggable key={safeId} draggableId={safeId} index={actIndex}>
                                                        {(provided, snapshot) => {
                                                            const child = (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={provided.draggableProps.style}
                                                                    className={`p-2 mb-2 bg-white border border-gray-200 rounded flex justify-between items-center shadow-sm cursor-grab ${snapshot.isDragging ? 'shadow-xl border-amber-500 z-[99999]' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {/* Render the thumbnail if it exists */}
                                                                        {act.imageUrl ? (
                                                                            <img src={act.imageUrl} alt={act.title} className="w-10 h-10 object-cover rounded bg-gray-100 shrink-0" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">📸</div>
                                                                        )}
                                                                        <div>
                                                                            <span className="font-medium text-gray-900 text-sm">{act.title}</span>
                                                                            <div className="flex gap-1 mt-0.5">
                                                                                {act.tags?.slice(0, 2).map((tag: string, i: number) => (
                                                                                    <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded uppercase">{tag}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => removeActivity(dayIndex, actIndex)} className="text-gray-400 hover:text-red-500 text-lg leading-none px-2">×</button>
                                                                </div>
                                                            );

                                                            if (snapshot.isDragging && typeof document !== 'undefined') return createPortal(child, document.body);
                                                            return child;
                                                        }}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                            {(!day.activities || day.activities.length === 0) && (
                                                <div className="text-center text-xs text-gray-400 mt-4 pointer-events-none">Drop catalog items here</div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>

                    <div className="pb-32">
                        <h2 className="font-serif font-bold text-gray-900 text-2xl">Terms & Conditions</h2>
                        <div className="bg-white rounded-md mb-4">
                            <Editor
                                apiKey="2ynva9q28qhx9bv959e24zywnc0zngkixss4y09fxl5ke4of"
                                value={terms || ''}
                                onEditorChange={(content) => setTerms(content)}
                                init={{
                                    height: 450,
                                    menubar: false,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code'
                                    ],
                                    toolbar: 'undo redo | blocks | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat | help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #374151; }',
                                    nonbreaking_wrap: false
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* PANE 2: THE LIVE PREVIEW */}
                <div className="w-[65%] h-full overflow-y-auto bg-gray-300 p-8">

                    {/* --- ATTACH PREVIEW REF HERE --- */}
                    <div ref={previewRef} className="max-w-3xl mx-auto bg-white min-h-[1056px] shadow-2xl border border-gray-200 relative">

                        {/* PREMIUM HERO SECTION */}
                        <div className="relative w-full h-[450px] bg-gray-900 overflow-hidden rounded-t-lg">
                            {heroImage ? (
                                <img src={heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-80" crossOrigin="anonymous" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
                                    Paste a Hero Image URL in the toolbox
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20"></div>

                            <div className="absolute top-10 left-12 right-12 flex justify-between items-center z-10">
                                <div className="flex items-center gap-4">
                                    {activeLogoUrl ? (
                                        <img src={activeLogoUrl} alt={activeAgencyName} className="h-10 w-auto object-contain" crossOrigin="anonymous" />
                                    ) : null}
                                    <span className="font-serif tracking-widest text-lg font-bold text-white drop-shadow-md">
                                        {activeAgencyName}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute bottom-12 left-12 right-12 z-10">
                                <p className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3 drop-shadow-md flex items-center gap-2">
                                    <span className="w-8 h-0.5 bg-amber-400 inline-block"></span>
                                    {durationText || ''}
                                </p>
                                <h1 className="text-5xl font-serif font-bold text-white leading-tight drop-shadow-xl max-w-2xl">
                                    {tripTitle || 'Untitled Itinerary'}
                                </h1>
                            </div>
                        </div>

                        {/* ... Keep all existing Live Preview rendering code ... */}
                        <div className="p-16">
                            {days.length === 0 ? <p className="text-gray-400 italic text-center mt-10">Your itinerary schedule will appear here.</p> : (
                                <div className="space-y-12">
                                    {days.map((day, index) => (
                                        <div key={index} className="flex gap-8">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">{day.dayNumber}</div>
                                                {index !== days.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-4"></div>}
                                            </div>
                                            <div className="pt-1 w-full">
                                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{day.dayTitle || `Day ${day.dayNumber}`}</h3>
                                                {day.dayDescription && (
                                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 italic border-l-2 border-amber-400 pl-4 py-1 bg-amber-50/30">
                                                        {day.dayDescription}
                                                    </p>
                                                )}

                                                {!day.activities || day.activities.length === 0 ? (
                                                    <p className="text-gray-500 text-sm mb-4">No activities scheduled yet.</p>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {day.activities.map((act: any) => {
                                                            const displayId = act._id ? String(act._id) : act.instanceId;
                                                            return (
                                                                <div key={displayId} className="flex flex-col sm:flex-row gap-6 p-5 border border-gray-100 rounded-lg bg-gray-50 shadow-sm">
                                                                    <div className="w-full sm:w-48 h-32 shrink-0 rounded-md overflow-hidden bg-gray-200 border border-gray-100 shadow-inner">
                                                                        {act.imageUrl ? (
                                                                            <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover transition hover:scale-105 duration-700" crossOrigin="anonymous" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-3xl">📸</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <h4 className="font-bold text-xl text-gray-900 mb-1">{act.title}</h4>
                                                                        {act.tags && act.tags.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                                {act.tags.map((tag: string, i: number) => (
                                                                                    <span key={i} className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                                                                                        {tag}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                                                            {act.description || 'No detailed description available for this activity.'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {(inclusions.length > 0 || exclusions.length > 0) && (
                            <div className="px-16 pb-16 pt-8 bg-white">
                                <hr className="mb-12 border-gray-200" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {inclusions.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                <span className="text-green-600">✓</span> Inclusions
                                            </h3>
                                            <ul className="space-y-3">
                                                {inclusions.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                                        <span className="text-green-500 mt-0.5 text-[10px]">✦</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {exclusions.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                <span className="text-red-600">✗</span> Exclusions
                                            </h3>
                                            <ul className="space-y-3">
                                                {exclusions.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                                        <span className="text-red-400 mt-0.5 text-[10px]">✦</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {terms && terms.trim() !== '' && (
                            <div className="px-16 pb-16 bg-white">
                                <hr className="mb-8 border-gray-200" />
                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                                    Terms & Conditions
                                </h3>
                                <div
                                    className="text-gray-600 leading-relaxed space-y-3 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-800 [&_b]:font-bold [&_b]:text-gray-800"
                                    dangerouslySetInnerHTML={{ __html: terms }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-500">Initializing builder...</div>}>
            <BuilderWorkspace />
        </Suspense>
    );
}