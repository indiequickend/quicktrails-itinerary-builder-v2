import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    // Default the entire document to Helvetica (matches Tailwind's default sans-serif)
    page: { backgroundColor: '#ffffff', padding: 0, fontFamily: 'Helvetica' },

    // --- PREMIUM HERO SECTION (Matches Live Preview) ---
    heroContainer: { position: 'relative', height: 350, backgroundColor: '#111827' },
    heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, objectFit: 'cover' },
    // Gradient fallback: using a slightly darker overlay to make white text pop
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },

    heroTopBar: { position: 'absolute', top: 40, left: 40, right: 40, flexDirection: 'row', alignItems: 'center' },
    logoImage: { height: 40, objectFit: 'contain' },
    logoFallback: { width: 40, height: 40, backgroundColor: '#F59E0B', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    logoFallbackText: { color: '#ffffff', fontSize: 20, fontFamily: 'Helvetica-Bold' },
    agencyName: { color: '#ffffff', fontSize: 14, fontFamily: 'Times-Bold', letterSpacing: 1 },

    heroBottom: { position: 'absolute', bottom: 40, left: 40, right: 40 },
    durationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    durationLine: { width: 30, height: 2, backgroundColor: '#FBBF24', marginRight: 10 },
    durationText: { color: '#FBBF24', fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 2 },

    // Using Times-Bold to perfectly match Tailwind's "font-serif font-bold"
    tripTitle: { fontFamily: 'Times-Bold', fontSize: 40, color: '#ffffff', lineHeight: 1.1 },

    // --- MAIN CONTENT ---
    contentBody: { padding: 40 },
    noActivitiesText: { color: '#9CA3AF', fontSize: 12, fontFamily: 'Helvetica-Oblique', textAlign: 'center', marginTop: 30 },

    // --- TIMELINE LAYOUT (Matches the Flex layout in Live Preview) ---
    dayWrapper: { flexDirection: 'row', marginBottom: 30 },
    timelineColumn: { width: 50, alignItems: 'center' },
    timelineCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
    timelineNumber: { color: '#ffffff', fontSize: 14, fontFamily: 'Helvetica-Bold' },
    timelineLine: { width: 2, flexGrow: 1, backgroundColor: '#E5E7EB', marginTop: 10, marginBottom: 10 },

    dayContent: { flex: 1, paddingBottom: 10 },
    dayTitle: { fontFamily: 'Times-Bold', fontSize: 24, color: '#111827', marginBottom: 12 },

    // Day Highlight Summary (Matches bg-amber-50/30 and border-amber-400)
    dayDescriptionBox: { backgroundColor: '#FFFBEB', borderLeft: '3px solid #FBBF24', paddingLeft: 12, paddingVertical: 8, marginBottom: 20 },
    dayDescriptionText: { fontSize: 11, color: '#4B5563', fontFamily: 'Helvetica-Oblique', lineHeight: 1.5 },

    // --- ACTIVITY CARDS (Matches bg-gray-50 border-gray-100 rounded-lg p-5) ---
    activityCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 8, padding: 16, marginBottom: 16 },
    activityImage: { width: 150, height: 100, objectFit: 'cover', borderRadius: 6, marginRight: 16 },
    activityPlaceholder: { width: 150, height: 100, backgroundColor: '#E5E7EB', borderRadius: 6, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
    activityDetails: { flex: 1 },
    activityTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 6 },

    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    tagPill: { backgroundColor: '#FEFCBF', color: '#975A16', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginRight: 6, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

    activityDesc: { fontSize: 10, color: '#4B5563', lineHeight: 1.5, textAlign: 'justify' }
});

const isValidImage = (url: any) => {
    return url && typeof url === 'string' && url.startsWith('http');
};

export const PremiumItineraryPDF = ({ itineraryData }: { itineraryData: any }) => {
    // Correctly pulling 'heroImage' from the Zustand store
    const { tripTitle, durationText, heroImage, b2bDetails, brandSettings, days } = itineraryData;

    // Determine Branding
    const activeAgencyName = b2bDetails?.isB2B && b2bDetails?.agencyName
        ? b2bDetails.agencyName
        : brandSettings?.companyName || '';

    const activeLogoUrl = b2bDetails?.isB2B
        ? (b2bDetails.logoUrl ? b2bDetails.logoUrl : null)
        : brandSettings.primaryLogoUrl;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* =========================================
                    PREMIUM HERO SECTION (Full Bleed)
                ========================================= */}
                <View style={styles.heroContainer}>
                    {isValidImage(heroImage) && <Image src={heroImage} style={styles.heroImage} />}
                    <View style={styles.heroOverlay}></View>

                    {/* Top Bar Branding */}
                    <View style={styles.heroTopBar}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {isValidImage(activeLogoUrl) ? (
                                <Image src={activeLogoUrl} style={styles.logoImage} />
                            ) : null}
                            <Text style={styles.agencyName}>{activeAgencyName}</Text>
                        </View>
                    </View>

                    {/* Bottom Title Area */}
                    <View style={styles.heroBottom}>
                        <View style={styles.durationRow}>
                            <View style={styles.durationLine}></View>
                            <Text style={styles.durationText}>{durationText || 'Duration Not Set'}</Text>
                        </View>
                        <Text style={styles.tripTitle}>{tripTitle || 'Untitled Itinerary'}</Text>
                    </View>
                </View>

                {/* =========================================
                    MAIN TIMELINE CONTENT
                ========================================= */}
                <View style={styles.contentBody}>
                    {(!days || days.length === 0) ? (
                        <Text style={styles.noActivitiesText}>Your itinerary schedule will appear here.</Text>
                    ) : (
                        days.map((day: any, dayIndex: number) => (
                            <View key={dayIndex} style={styles.dayWrapper} wrap={false}>

                                {/* LEFT: Timeline Line & Circle */}
                                <View style={styles.timelineColumn}>
                                    <View style={styles.timelineCircle}>
                                        <Text style={styles.timelineNumber}>{day.dayNumber}</Text>
                                    </View>
                                    {/* Draw the connecting line only if it's not the last day */}
                                    {dayIndex !== days.length - 1 && (
                                        <View style={styles.timelineLine}></View>
                                    )}
                                </View>

                                {/* RIGHT: Day Content */}
                                <View style={styles.dayContent}>
                                    <Text style={styles.dayTitle}>{day.dayTitle || `Day ${day.dayNumber}`}</Text>

                                    {/* Day Highlight Summary */}
                                    {day.dayDescription && (
                                        <View style={styles.dayDescriptionBox}>
                                            <Text style={styles.dayDescriptionText}>{day.dayDescription}</Text>
                                        </View>
                                    )}

                                    {/* Activities Layout */}
                                    {(!day.activities || day.activities.length === 0) ? (
                                        <Text style={{ fontSize: 10, color: '#9CA3AF' }}>No activities scheduled yet.</Text>
                                    ) : (
                                        day.activities.map((act: any, actIndex: number) => (
                                            <View key={actIndex} style={styles.activityCard} wrap={false}>

                                                {/* Activity Image */}
                                                {isValidImage(act.imageUrl) ? (
                                                    <Image src={act.imageUrl} style={styles.activityImage} />
                                                ) : (
                                                    <View style={styles.activityPlaceholder}>
                                                        <Text style={{ fontSize: 24 }}>📸</Text>
                                                    </View>
                                                )}

                                                {/* Activity Text */}
                                                <View style={styles.activityDetails}>
                                                    <Text style={styles.activityTitle}>{act.title}</Text>

                                                    {/* Tags/Pills */}
                                                    {act.tags && act.tags.length > 0 && (
                                                        <View style={styles.tagsRow}>
                                                            {act.tags.map((tag: string, tIndex: number) => (
                                                                <Text key={tIndex} style={styles.tagPill}>{tag}</Text>
                                                            ))}
                                                        </View>
                                                    )}

                                                    <Text style={styles.activityDesc}>
                                                        {act.description || 'No detailed description available for this activity.'}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>

            </Page>
        </Document>
    );
};