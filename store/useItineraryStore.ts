import { create } from 'zustand';

interface BuilderState {
    tripTitle: string;
    setTripTitle: (title: string) => void;
    days: any[];
    addDay: () => void;
    updateDayTitle: (index: number, title: string) => void;
    updateDayDescription: (index: number, description: string) => void;
    setDayImage: (index: number, url: string) => void;
    // Add to the BuilderState interface:
    setB2bDetails: (details: any) => void;
    b2bDetails: {
        isB2B: boolean;
        agencyName: string;
        logoUrl: string;
    };
    loadItinerary: (data: any) => void;
    durationText: string;
    setDurationText: (text: string) => void;

    removeDay: (index: number) => void;

    addActivityToDay: (dayIndex: number, activity: any, dropIndex: number) => void;
    moveActivity: (sourceDayIndex: number, destDayIndex: number, sourceIndex: number, destIndex: number) => void;
    removeActivity: (dayIndex: number, activityIndex: number) => void;

    heroImage: string;
    setHeroImage: (url: string) => void;

    brandSettings: {
        companyName: string;
        primaryLogoUrl: string;
    };
    setBrandSettings: (settings: any) => void;

    inclusions: string[];
    setInclusions: (inclusions: string[]) => void;
    updateInclusion: (index: number, text: string) => void;
    addInclusion: (text: string) => void;
    removeInclusion: (index: number) => void;

    exclusions: string[];
    setExclusions: (exclusions: string[]) => void;
    updateExclusion: (index: number, text: string) => void;
    addExclusion: (text: string) => void;
    removeExclusion: (index: number) => void;

    terms: string;
    setTerms: (text: string) => void;
}

export const useItineraryStore = create<BuilderState>((set) => ({
    tripTitle: '6 Days North Bengal Expedition', // Default placeholder
    durationText: '5 Nights / 6 Days',
    days: [
        { dayNumber: 1, dayTitle: 'Arrival in Darjeeling', activities: [] },
    ],
    setTripTitle: (title) => set({ tripTitle: title }),
    addDay: () => set((state) => ({
        days: [...state.days, { dayNumber: state.days.length + 1, dayTitle: 'New Day', activities: [] }]
    })),
    updateDayTitle: (index, title) => set((state) => {
        const newDays = [...state.days];
        newDays[index].dayTitle = title;
        return { days: newDays };
    }),
    updateDayDescription: (index, description) => set((state) => {
        const newDays = [...state.days];
        newDays[index].dayDescription = description;
        return { days: newDays };
    }),
    setDayImage: (index, url) => set((state) => {
        const newDays = [...state.days];
        newDays[index].dayHighlightImage = url;
        return { days: newDays };
    }),
    b2bDetails: { isB2B: false, agencyName: '', logoUrl: '' },
    setB2bDetails: (details) => set({ b2bDetails: details }),
    loadItinerary: (data) => set({
        tripTitle: data.tripTitle || '',
        durationText: data.durationText || '',
        heroImage: data.heroGallery?.[0] || '',
        b2bDetails: data.b2bDetails || { isB2B: false, agencyName: '', logoUrl: '' },
        days: data.days || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        terms: data.terms || '',
        // Map any other fields your schema uses
    }),
    setDurationText: (text) => set({ durationText: text }),
    removeDay: (index) => set((state) => {
        // Filter out the deleted day
        const updatedDays = state.days.filter((_, i) => i !== index);

        // Automatically re-number the remaining days (1, 2, 3...)
        updatedDays.forEach((day, i) => {
            day.dayNumber = i + 1;
        });

        return { days: updatedDays };
    }),
    addActivityToDay: (dayIndex, activity, dropIndex) => set((state) => {
        const newDays = [...state.days];
        if (!newDays[dayIndex].activities) newDays[dayIndex].activities = [];
        newDays[dayIndex].activities.splice(dropIndex, 0, activity);

        return { days: newDays };
    }),

    moveActivity: (sourceDayIndex, destDayIndex, sourceIndex, destIndex) => set((state) => {
        const newDays = [...state.days];
        // Remove from source
        const [movedItem] = newDays[sourceDayIndex].activities.splice(sourceIndex, 1);
        // Add to destination
        if (!newDays[destDayIndex].activities) newDays[destDayIndex].activities = [];
        newDays[destDayIndex].activities.splice(destIndex, 0, movedItem);
        return { days: newDays };
    }),

    removeActivity: (dayIndex, activityIndex) => set((state) => {
        const newDays = [...state.days];
        newDays[dayIndex].activities.splice(activityIndex, 1);
        return { days: newDays };
    }),

    heroImage: '',
    setHeroImage: (url) => set({ heroImage: url }),

    brandSettings: { companyName: 'QuickTrails', primaryLogoUrl: '' },
    setBrandSettings: (settings) => set({ brandSettings: settings }),

    inclusions: [],
    setInclusions: (inclusions) => set({ inclusions }),
    updateInclusion: (index, text) => set((state) => {
        const newArr = [...state.inclusions];
        newArr[index] = text;
        return { inclusions: newArr };
    }),
    addInclusion: (text) => set((state) => ({ inclusions: [...state.inclusions, text] })),
    removeInclusion: (index) => set((state) => ({
        inclusions: state.inclusions.filter((_, i) => i !== index)
    })),

    exclusions: [],
    setExclusions: (exclusions) => set({ exclusions }),
    updateExclusion: (index, text) => set((state) => {
        const newArr = [...state.exclusions];
        newArr[index] = text;
        return { exclusions: newArr };
    }),
    addExclusion: (text) => set((state) => ({ exclusions: [...state.exclusions, text] })),
    removeExclusion: (index) => set((state) => ({
        exclusions: state.exclusions.filter((_, i) => i !== index)
    })),

    terms: '',
    setTerms: (text) => set({ terms: text }),
}));