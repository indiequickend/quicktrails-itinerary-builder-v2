import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { backgroundColor: '#ffffff', padding: 0, fontFamily: 'Helvetica' },

    // --- PREMIUM HERO SECTION ---
    heroContainer: { position: 'relative', height: 350, backgroundColor: '#111827' },
    heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, objectFit: 'cover' },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },

    heroTopBar: { position: 'absolute', top: 40, left: 40, right: 40, flexDirection: 'row', alignItems: 'center' },
    logoImage: { height: 36, objectFit: 'contain' },
    logoFallback: { width: 40, height: 40, backgroundColor: '#F59E0B', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    logoFallbackText: { color: '#ffffff', fontSize: 20, fontFamily: 'Helvetica-Bold' },
    agencyName: { color: '#ffffff', fontSize: 14, fontFamily: 'Times-Bold', letterSpacing: 1 },

    heroBottom: { position: 'absolute', bottom: 40, left: 40, right: 40 },
    durationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    durationLine: { width: 30, height: 2, backgroundColor: '#FBBF24', marginRight: 10 },
    durationText: { color: '#FBBF24', fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 2 },
    tripTitle: { fontFamily: 'Times-Bold', fontSize: 40, color: '#ffffff', lineHeight: 1.1 },

    // --- MAIN CONTENT ---
    contentBody: { padding: 40 },
    noActivitiesText: { color: '#9CA3AF', fontSize: 12, fontFamily: 'Helvetica-Oblique', textAlign: 'center', marginTop: 30 },

    // --- TIMELINE LAYOUT ---
    dayWrapper: { flexDirection: 'row', marginBottom: 30 },
    timelineColumn: { width: 50, alignItems: 'center' },
    timelineCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
    timelineNumber: { color: '#ffffff', fontSize: 14, fontFamily: 'Helvetica-Bold' },
    timelineLine: { width: 2, flexGrow: 1, backgroundColor: '#E5E7EB', marginTop: 10, marginBottom: 10 },

    dayContent: { flex: 1, paddingBottom: 10 },
    dayTitle: { fontFamily: 'Times-Bold', fontSize: 24, color: '#111827', marginBottom: 12 },

    dayDescriptionBox: { backgroundColor: '#FFFBEB', borderLeft: '2px solid #FBBF24', paddingLeft: 12, paddingVertical: 8, marginBottom: 20 },
    dayDescriptionText: { fontSize: 11, color: '#4B5563', fontFamily: 'Helvetica-Oblique', lineHeight: 1.5 },

    // --- ACTIVITY CARDS ---
    activityCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 8, padding: 16, marginBottom: 16 },
    activityImage: { width: 150, height: 100, objectFit: 'cover', borderRadius: 6, marginRight: 16 },
    activityPlaceholder: { width: 150, height: 100, backgroundColor: '#E5E7EB', borderRadius: 6, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
    activityDetails: { flex: 1 },
    activityTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 6 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    tagPill: { backgroundColor: '#FEFCBF', color: '#975A16', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginRight: 6, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    activityDesc: { fontSize: 10, color: '#4B5563', lineHeight: 1.5, textAlign: 'justify' },

    // --- INCLUSIONS & EXCLUSIONS ---
    incExcWrapper: { flexDirection: 'row', marginTop: 20, paddingTop: 30, borderTop: '1px solid #E5E7EB' },
    incExcColumn: { flex: 1, paddingRight: 20 },
    incExcTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    incExcTitleIcon: { fontSize: 16, marginRight: 8 },
    incExcTitleText: { fontFamily: 'Times-Bold', fontSize: 20, color: '#111827' },
    listItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
    listIconWrapper: { marginRight: 8, marginTop: 3 },
    listTextWrapper: { flex: 1 }, // <-- ADD THIS LINE
    listText: { fontSize: 10, color: '#4B5563', lineHeight: 1.5 },

    // --- TERMS AND CONDITIONS ---
    termsWrapper: { marginTop: 30, paddingTop: 30, borderTop: '1px solid #E5E7EB' },
    termsTitle: { fontFamily: 'Times-Bold', fontSize: 20, color: '#111827', marginBottom: 20 },
    termsText: { fontSize: 9, color: '#6B7280', lineHeight: 1.6, textAlign: 'justify' }
});

const isValidImage = (url: any) => {
    return url && typeof url === 'string' && url.startsWith('http');
};

// Helper function: Converts TinyMCE HTML into React-PDF text elements (keeps bullets, paragraphs, and BOLD!)
const renderRichText = (html: string) => {
    if (!html) return null;

    // 1. Convert structural tags to plain text formatting (newlines and bullets)
    const textWithBoldTags = html
        .replace(/<li>/gi, '• ')           // Turn list items into bullet points
        .replace(/<\/li>/gi, '\n')         // Add a newline after list items
        .replace(/<\/p>|<br\s*\/?>/gi, '\n\n') // Turn paragraphs/breaks into double newlines
        // 2. Strip ALL HTML tags EXCEPT <strong> and <b>
        .replace(/<\/?(?!(strong|b)\b)[a-z0-9]+[^>]*>/gi, '')
        .replace(/\n\s*\n/g, '\n\n')       // Clean up any excessive empty lines
        // replace &nbsp; with regular space and trim leading/trailing whitespace
        .replace(/&nbsp;/g, ' ')
        .trim();

    // 3. Split the resulting string by <strong> or <b> tags
    const parts = textWithBoldTags.split(/(<strong>[\s\S]*?<\/strong>|<b>[\s\S]*?<\/b>)/gi);

    // 4. Map over the array and render nested <Text> components for bold sections
    return parts.map((part, index) => {
        if (/^<(strong|b)>/i.test(part)) {
            // Strip the tags to get the inner text
            const cleanBoldText = part.replace(/<\/?(strong|b)>/gi, '');
            return (
                <Text key={index} style={{ fontFamily: 'Helvetica-Bold', color: '#374151' }}>
                    {cleanBoldText}
                </Text>
            );
        }
        // Return normal unformatted text
        return <Text key={index}>{part}</Text>;
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PremiumItineraryPDF = ({ itineraryData, debugLayout = false }: { itineraryData: any, debugLayout?: boolean }) => {
    // EXTRACT TERMS ALONG WITH INCLUSIONS/EXCLUSIONS
    const { tripTitle, durationText, heroImage, b2bDetails, brandSettings, days, inclusions = [], exclusions = [], terms = '' } = itineraryData;

    const activeAgencyName = b2bDetails?.isB2B && b2bDetails?.agencyName ? b2bDetails.agencyName : brandSettings?.companyName || '';
    const activeLogoUrl = b2bDetails?.isB2B && b2bDetails?.logoUrl ? b2bDetails.logoUrl : brandSettings?.primaryLogoUrl;

    return (
        <Document>
            <Page size="A4" style={styles.page} debug={debugLayout}>

                {/* HERO SECTION */}
                <View style={styles.heroContainer} wrap={false}>
                    {isValidImage(heroImage) && <Image src={heroImage} style={styles.heroImage} />}
                    <View style={styles.heroOverlay}></View>
                    <View style={styles.heroTopBar}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {isValidImage(activeLogoUrl) ? (
                                <Image src={activeLogoUrl} style={styles.logoImage} />
                            ) : (
                                <View style={styles.logoFallback}>
                                    <Text style={styles.logoFallbackText}>{activeAgencyName.charAt(0)}</Text>
                                </View>
                            )}
                            <Text style={styles.agencyName}>{activeAgencyName}</Text>
                        </View>
                    </View>
                    <View style={styles.heroBottom}>
                        <View style={styles.durationRow}>
                            <View style={styles.durationLine}></View>
                            <Text style={styles.durationText}>{durationText || 'Duration Not Set'}</Text>
                        </View>
                        <Text style={styles.tripTitle}>{tripTitle || 'Untitled Itinerary'}</Text>
                    </View>
                </View>

                {/* MAIN CONTENT */}
                <View style={styles.contentBody}>
                    {(!days || days.length === 0) ? (
                        <Text style={styles.noActivitiesText}>Your itinerary schedule will appear here.</Text>
                    ) : (
                        days.map((day: any, dayIndex: number) => (
                            <View key={dayIndex} style={styles.dayWrapper} wrap={false}>
                                <View style={styles.timelineColumn}>
                                    <View style={styles.timelineCircle}>
                                        <Text style={styles.timelineNumber}>{day.dayNumber}</Text>
                                    </View>
                                    {dayIndex !== days.length - 1 && <View style={styles.timelineLine}></View>}
                                </View>
                                <View style={styles.dayContent}>
                                    <Text style={styles.dayTitle}>{day.dayTitle || `Day ${day.dayNumber}`}</Text>
                                    {day.dayDescription && (
                                        <View style={styles.dayDescriptionBox}>
                                            <Text style={styles.dayDescriptionText}>{day.dayDescription}</Text>
                                        </View>
                                    )}
                                    {(!day.activities || day.activities.length === 0) ? (
                                        <Text style={{ fontSize: 10, color: '#9CA3AF' }}>No activities scheduled yet.</Text>
                                    ) : (
                                        day.activities.map((act: any, actIndex: number) => (
                                            <View key={actIndex} style={styles.activityCard} wrap={false}>
                                                {isValidImage(act.imageUrl) ? (
                                                    <Image src={act.imageUrl} style={styles.activityImage} />
                                                ) : (
                                                    <View style={styles.activityPlaceholder}>
                                                        <Text style={{ fontSize: 24 }}>📸</Text>
                                                    </View>
                                                )}
                                                <View style={styles.activityDetails}>
                                                    <Text style={styles.activityTitle}>{act.title}</Text>
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

                    {/* =========================================
                        INCLUSIONS & EXCLUSIONS
                    ========================================= */}
                    {(inclusions.length > 0 || exclusions.length > 0) && (
                        <View style={styles.incExcWrapper} wrap={false}>

                            {/* Inclusions Column */}
                            <View style={styles.incExcColumn}>
                                {inclusions.length > 0 && (
                                    <>
                                        <View style={styles.incExcTitleRow}>
                                            <Svg viewBox="0 0 24 24" width={18} height={18} style={{ marginRight: 6 }}>
                                                <Path d="M20 6L9 17l-5-5" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                            <Text style={styles.incExcTitleText}>Inclusions</Text>
                                        </View>
                                        {inclusions.map((item: string, idx: number) => (
                                            <View key={idx} style={styles.listItem}>
                                                <View style={styles.listIconWrapper}>
                                                    <Svg viewBox="0 0 24 24" width={8} height={8}>
                                                        <Path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#34D399" />
                                                    </Svg>
                                                </View>
                                                {/* ADD THE STYLE HERE */}
                                                <View style={styles.listTextWrapper}>
                                                    <Text style={styles.listText}>{item}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>

                            {/* Exclusions Column */}
                            <View style={styles.incExcColumn}>
                                {exclusions.length > 0 && (
                                    <>
                                        <View style={styles.incExcTitleRow}>
                                            <Svg viewBox="0 0 24 24" width={18} height={18} style={{ marginRight: 6 }}>
                                                <Path d="M18 6L6 18M6 6l12 12" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                            <Text style={styles.incExcTitleText}>Exclusions</Text>
                                        </View>
                                        {exclusions.map((item: string, idx: number) => (
                                            <View key={idx} style={styles.listItem}>
                                                <View style={styles.listIconWrapper}>
                                                    <Svg viewBox="0 0 24 24" width={8} height={8}>
                                                        <Path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#F87171" />
                                                    </Svg>
                                                </View>
                                                {/* ADD THE STYLE HERE */}
                                                <View style={styles.listTextWrapper}>
                                                    <Text style={styles.listText}>{item}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {/* =========================================
                        TERMS AND CONDITIONS (PDF FORMATTED)
                    ========================================= */}
                    {terms && terms.trim() !== '' && (
                        <View style={styles.termsWrapper} wrap={false}>
                            <Text style={styles.termsTitle}>Terms & Conditions</Text>
                            <Text style={styles.termsText}>
                                {/* Call the new rich text renderer here! */}
                                {renderRichText(terms)}
                            </Text>
                        </View>
                    )}

                </View>
            </Page>
        </Document>
    );
};