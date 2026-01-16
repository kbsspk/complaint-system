
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// Register Thai font
Font.register({
    family: 'THSarabunNew',
    fonts: [
        { src: '/fonts/THSarabunNew.ttf' },
        { src: '/fonts/THSarabunNew.ttf', fontWeight: 'bold' },
        { src: '/fonts/THSarabunNew.ttf', fontStyle: 'italic' },
        { src: '/fonts/THSarabunNew.ttf', fontWeight: 'bold', fontStyle: 'italic' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'THSarabunNew',
        fontSize: 16,
        lineHeight: 1.3,
    },
    headerConfidential: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 18,
    },
    headerTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20, // Increased font size
        marginBottom: 5,
    },
    headerSubtitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    borderBox: {
        border: '1px solid #000',
        minHeight: '85%', // Changed from fixed height to minHeight to allow growth
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        alignItems: 'center',
        minHeight: 30,
        paddingLeft: 5,
        paddingRight: 5,
    },
    label: {
        marginRight: 5,
    },
    value: {
        flex: 1,
        borderBottom: '1px dotted #999',
        marginRight: 10,
        paddingLeft: 2,
    },
    checkbox: {
        width: 10,
        height: 10,
        border: '1px solid #000',
        marginRight: 3,
        marginLeft: 5,
    },
    signatureRow: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'space-between',
        flexWrap: 'nowrap', // Ensure no wrapping
        // Reduced padding to allow more space
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 20,
    },
    signatureBlock: {
        alignItems: 'center',
        width: '48%', // Slightly wider if space permits, or stick to 45% but tight
    },
    dottedLine: {
        borderBottom: '1px dotted #000',
        width: '100%',
        height: 15,
        marginBottom: 5,
    },
    imagePage: {
        padding: 30,
        alignItems: 'center',
        fontFamily: 'THSarabunNew',
    },
    evidenceImage: {
        maxWidth: '100%',
        maxHeight: '90%',
        marginBottom: 20,
        objectFit: 'contain',
    }
});

// Helper for checkboxes
const Checkbox = ({ label, checked }: { label: string, checked: boolean }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        <View style={[styles.checkbox, checked ? { backgroundColor: '#000' } : {}]} />
        <Text>{label}</Text>
    </View>
);

const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'd MMMM yyyy', { locale: th });
};

const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'HH:mm', { locale: th });
};

// Function to assist line breaking without ZWSP artifacts
const insertBreaks = (text: string): string[] => {
    if (!text) return [];

    // Try Intl.Segmenter
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        try {
            const segmenter = new (Intl as any).Segmenter('th', { granularity: 'word' });
            const segments = segmenter.segment(text);
            const words = [];
            for (const segment of segments) {
                words.push(segment.segment);
            }
            return words;
        } catch (e) {
            console.warn('Intl.Segmenter failed', e);
        }
    }

    // Fallback: Regex split
    // Return array of chunks
    // We want to keep the chars, just split.
    // Regex matches clusters.
    // text.match(...) returns array of matches.
    const clusters = text.match(/([^\u0E31\u0E34-\u0E3A\u0E47-\u0E4E])([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]*)/g);
    return clusters || [text];
};

export const ComplaintPdf = ({ complaint }: { complaint: any }) => {
    let evidenceFiles: string[] = [];
    try {
        if (complaint.evidence_files) {
            evidenceFiles = JSON.parse(complaint.evidence_files);
        }
    } catch (e) { }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.headerConfidential}>-ลับ-</Text>
                <Text style={styles.headerTitle}>แบบบันทึกการรับเรื่องร้องเรียน สำนักงานสาธารณสุขจังหวัดสมุทรปราการ</Text>
                <Text style={styles.headerSubtitle}>(แบบอิเล็กทรอนิกส์)</Text>

                <View style={styles.borderBox}>
                    {/* 1. Date Received / Channel */}
                    <View style={{ borderBottom: '1px solid #000', padding: 5 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                            <Text style={styles.label}>1. วันที่รับ</Text>
                            <Text style={[styles.value, { flex: 0.5 }]}>{formatDate(complaint.received_date || complaint.created_at)}</Text>
                            <Text style={styles.label}>เวลา</Text>
                            <Text style={[styles.value, { flex: 0.5 }]}>{formatTime(complaint.created_at)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <Text style={{ marginRight: 5 }}>ช่องทางที่ร้องเรียน:</Text>
                            <Checkbox label="มาพบด้วยตนเอง" checked={complaint.channel === 'WALK_IN'} />
                            <Checkbox label="โทรศัพท์" checked={complaint.channel === 'PHONE'} />
                            <Checkbox label="Line OA" checked={complaint.channel === 'LINE_OA'} />
                            <Checkbox label="จดหมาย" checked={complaint.channel === 'LETTER'} />
                            <Checkbox label="อื่นๆ" checked={!['WALK_IN', 'PHONE', 'LINE_OA', 'LETTER'].includes(complaint.channel)} />
                            {!['WALK_IN', 'PHONE', 'LINE_OA', 'LETTER'].includes(complaint.channel) && (
                                <Text style={{ borderBottom: '1px dotted #000', minWidth: 50 }}> {complaint.channel} </Text>
                            )}
                        </View>
                    </View>

                    {/* 2. Complainant Info */}
                    <View style={{ borderBottom: '1px solid #000', padding: 5 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                            <Text style={styles.label}>2. ผู้ร้องเรียน ชื่อ-สกุล</Text>
                            <Text style={[styles.value, { flex: 1 }]}>{complaint.complainant_name}</Text>
                            <Text style={styles.label}>บัตรประจำตัวเลขที่</Text>
                            <Text style={[styles.value, { flex: 0.8 }]}>{complaint.id_card}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                            <Text style={styles.label}>ที่อยู่</Text>
                            <Text style={styles.value}>{complaint.official_letter_address || '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                            <Text style={styles.label}>โทรศัพท์</Text>
                            <Text style={[styles.value, { flex: 0.6 }]}>{complaint.phone || '-'}</Text>
                            <Text style={styles.label}>e-mail address</Text>
                            <Text style={styles.value}>{complaint.official_letter_email || '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ marginRight: 5 }}>การรับแจ้งผลดำเนินการ</Text>
                            <Checkbox label="ไม่ต้องการ" checked={false} />
                            <Checkbox label="ต้องการให้แจ้ง ผ่านช่องทาง" checked={true} />
                            <Text style={{ borderBottom: '1px dotted #000', minWidth: 100 }}>
                                {complaint.official_letter_email ? 'Email' : 'ไปรษณีย์'}
                            </Text>
                        </View>
                    </View>

                    {/* 3. Related Acts */}
                    <View style={{ borderBottom: '1px solid #000', padding: 5 }}>
                        <Text style={[styles.label, { marginBottom: 5 }]}>3. ประเด็นร้องเรียน</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {[
                                'ยา', 'อาหาร', 'เครื่องสำอาง', 'วัตถุอันตราย', 'เครื่องมือแพทย์',
                                'สถานประกอบการเพื่อสุขภาพ', 'สถานพยาบาล', 'ผลิตภัณฑ์สมุนไพร',
                                'พืชกระท่อม', 'สุขาภิบาลอาหาร', 'อื่นๆ'
                            ].map((act, i) => (
                                <Checkbox
                                    key={i}
                                    label={act}
                                    checked={(() => {
                                        if (!complaint.related_acts) return false;
                                        try {
                                            const acts = typeof complaint.related_acts === 'string'
                                                ? JSON.parse(complaint.related_acts)
                                                : complaint.related_acts;
                                            return Array.isArray(acts) && acts.includes(act);
                                        } catch { return false; }
                                    })()}
                                />
                            ))}
                        </View>
                    </View>

                    {/* 4. Subject */}
                    <View style={{ borderBottom: '1px solid #000', padding: 5, flexDirection: 'row' }}>
                        <Text style={styles.label}>4. เรื่อง</Text>
                        <Text style={styles.value}>{complaint.product_name ? `ร้องเรียนผลิตภัณฑ์/บริการ ${complaint.product_name}` : 'ร้องเรียนทั่วไป'}</Text>
                    </View>

                    {/* 5. Details */}
                    {/* Use minHeight to allow content to grow. If content is very long, it will push content down. */}
                    <View style={{ minHeight: 150, padding: 5, paddingBottom: 20 }}>
                        <Text style={styles.label}>5. รายละเอียด (อาจแนบบันทึกรายละเอียดเพิ่มเติมกรณีมีข้อมูลหรือรายละเอียดมาก)</Text>
                        {/* wrap={true} is default, but ensuring it's not single line */}
                        <Text
                            style={{ marginTop: 5, textIndent: 20, textAlign: 'justify' }}
                            hyphenationCallback={(word) => [word]}
                        >
                            {insertBreaks(complaint.details).map((word, i) => (
                                <Text key={i}>{word}</Text>
                            ))}
                        </Text>
                    </View>

                    {/* Declaration - push to bottom if there's space, otherwise just flow */}
                    <View style={{ padding: 5, marginTop: 20 }}>
                        <Text style={{ textAlign: 'center' }}>
                            ข้าพเจ้าขอรับรองว่าข้อเท็จจริงที่ได้ยื่นร้องเรียนต่อสำนักงานสาธารณสุขจังหวัดสมุทรปราการเป็นความจริงทุกประการ
                            และขอรับผิดชอบต่อข้อเท็จจริงดังกล่าวข้างต้นทั้งหมด และข้าพเจ้ารับทราบว่าการนำความเท็จมาร้องเรียนต่อเจ้าหน้าที่
                            ซึ่งทำให้ผู้อื่นได้รับความเสียหาย เป็นความผิดตามประมวลกฎหมายอาญาฐานแจ้งความเท็จต่อพนักงานเจ้าหน้าที่
                        </Text>

                        <View style={styles.signatureRow}>
                            <View style={styles.signatureBlock}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%', marginTop: 20 }}>
                                    <Text>ลงชื่อ</Text>
                                    <View style={{ borderBottom: '1px dotted #000', flex: 1, marginHorizontal: 5 }} />
                                    <Text>ผู้ร้องเรียน</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                    <Text>(</Text>
                                    <View style={{ borderBottom: '1px dotted #000', width: 120, marginHorizontal: 5 }} >
                                        <Text style={{ textAlign: 'center' }}>{complaint.complainant_name}</Text>
                                    </View>
                                    <Text>)</Text>
                                </View>
                            </View>

                            <View style={styles.signatureBlock}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%', marginTop: 20 }}>
                                    <Text>รับเรื่องโดย ลงชื่อ</Text>
                                    <View style={{ borderBottom: '1px dotted #000', flex: 1, marginHorizontal: 5 }} />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                    <Text>(</Text>
                                    <View style={{ borderBottom: '1px dotted #000', width: 120, marginHorizontal: 5 }} />
                                    <Text>)</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 6. Evidence - Footer */}
                    <View style={{ padding: 5, borderTop: '1px solid #000' }}>
                        <Text style={styles.label}>6. หลักฐานเบื้องต้นที่ได้ยื่นประกอบคำร้องเรียน ดังนี้ (ถ้ามี)</Text>
                        <View style={{ marginTop: 5, marginLeft: 10 }}>
                            {evidenceFiles.length > 0 ? (
                                <Text>ดูเอกสารแนบท้าย</Text>
                            ) : (
                                <>
                                    <View style={styles.dottedLine} />
                                    <View style={styles.dottedLine} />
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Page>

            {/* Evidence Images Pages */}
            {evidenceFiles.map((file, index) => {
                const isImage = file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                if (isImage) {
                    return (
                        <Page key={index} size="A4" style={styles.imagePage}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>เอกสารแนบ {index + 1}</Text>
                            <Image src={file} style={styles.evidenceImage} />
                        </Page>
                    );
                }
                return null;
            })}
        </Document>
    );
};
