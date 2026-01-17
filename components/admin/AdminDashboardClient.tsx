'use client';

import { useState } from 'react';
import AcceptComplaintModal from './AcceptComplaintModal';
import RejectComplaintModal from './RejectComplaintModal';
import ManualComplaintForm from './ManualComplaintForm';
import { format, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { getOfficers } from '@/actions/officer-actions';
import { useEffect } from 'react';

import AssignComplaintModal from './AssignComplaintModal';
import { Complaint, User } from '@/lib/types';

export default function AdminDashboardClient({ complaints, role }: { complaints: Complaint[], currentUser: User | null, role: string }) {
    const [activeTab, setActiveTab] = useState<'INCOMING' | 'ACTIVE' | 'REJECTED'>('INCOMING');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isManualFormOpen, setIsManualFormOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [officerFilter, setOfficerFilter] = useState('ALL');
    const [officers, setOfficers] = useState<{ id: number; full_name: string }[]>([]);

    useEffect(() => {
        if (role === 'ADMIN') {
            getOfficers().then(setOfficers);
        }
    }, [role]);

    // Filter complaints based on tab and search term
    const filteredComplaints = complaints.filter(c => {
        // Tab Filter
        let matchesTab = false;
        if (activeTab === 'INCOMING') matchesTab = c.status === 'PENDING';
        else if (activeTab === 'ACTIVE') matchesTab = ['IN_PROGRESS', 'RESOLVED'].includes(c.status);
        else if (activeTab === 'REJECTED') matchesTab = c.status === 'REJECTED';

        if (!matchesTab) return false;

        // Status Filter
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'INVESTIGATED') {
                if (c.status !== 'IN_PROGRESS' || !c.investigation_date) return false;
            } else if (statusFilter === 'IN_PROGRESS') {
                if (c.status !== 'IN_PROGRESS' || c.investigation_date) return false;
            } else {
                if (c.status !== statusFilter) return false;
            }
        }

        // Officer Filter
        if (officerFilter === 'UNASSIGNED') {
            if (c.responsible_person_id) return false;
        } else if (officerFilter !== 'ALL') {
            // For Admin selecting specific officer
            if (c.responsible_person_id !== Number(officerFilter)) return false;
        }

        // Search Filter
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            (c.complaint_number?.toLowerCase().includes(lowerTerm)) ||
            (c.complainant_name?.toLowerCase().includes(lowerTerm)) ||
            (c.product_name?.toLowerCase().includes(lowerTerm)) ||
            (c.shop_name?.toLowerCase().includes(lowerTerm)) ||
            (c.details?.toLowerCase().includes(lowerTerm))
        );
    });

    const handleAcceptClick = (c: Complaint) => {
        setSelectedComplaint(c);
        setIsAcceptModalOpen(true);
    };

    const handleRejectClick = (c: Complaint) => {
        setSelectedComplaint(c);
        setIsRejectModalOpen(true);
    };

    const handleSuccess = () => {
        // In a real app with optimization, we might update local state, 
        // but revalidatePath in action refreshes the page so this component re-renders with new props.
        // We just need to close modals.
        setIsAcceptModalOpen(false);
        setIsRejectModalOpen(false);
        setIsManualFormOpen(false);
        setIsAssignModalOpen(false);
    };

    const handleAssignClick = (c: Complaint) => {
        setSelectedComplaint(c);
        setIsAssignModalOpen(true);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการเรื่องร้องเรียน</h1>
                    <p className="text-gray-500 text-sm mt-1">จัดการและติดตามสถานะเรื่องร้องเรียน</p>
                </div>
                <button
                    onClick={() => setIsManualFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    + เพิ่มเรื่องร้องเรียน
                </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="ค้นหาตามเลขรับเรื่อง, ชื่อผู้ร้อง, ผลิตภัณฑ์, สถานประกอบการ..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="ALL">สถานะทั้งหมด</option>
                        <option value="IN_PROGRESS">อยู่ระหว่างดำเนินการ</option>
                        <option value="INVESTIGATED">ตรวจสอบแล้ว</option>
                        <option value="RESOLVED">ดำเนินการเสร็จสิ้น</option>
                    </select>

                    {role === 'ADMIN' && (
                        <select
                            value={officerFilter}
                            onChange={(e) => setOfficerFilter(e.target.value)}
                            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white max-w-[200px]"
                        >
                            <option value="ALL">เจ้าหน้าที่ทั้งหมด</option>
                            <option value="UNASSIGNED">รอมอบหมาย</option>
                            {officers.map(off => (
                                <option key={off.id} value={off.id}>{off.full_name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b mb-6">
                <button
                    onClick={() => setActiveTab('INCOMING')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'INCOMING'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    เรื่องรับใหม่ (PENDING)
                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                        {complaints.filter(c => c.status === 'PENDING').length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ACTIVE'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    ดำเนินการ (Active)
                </button>
                <button
                    onClick={() => setActiveTab('REJECTED')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'REJECTED'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    ปฏิเสธ (Rejected)
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-border-light text-xs uppercase font-semibold text-gray-500 tracking-wider">
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4 w-32">วันที่แจ้ง</th>
                                <th className="p-4 w-48">ผู้ร้องเรียน</th>
                                <th className="p-4">เรื่อง/รายละเอียด</th>
                                <th className="p-4 w-32">ระยะเวลาที่เหลือ</th>
                                <th className="p-4 w-32">ผู้รับผิดชอบ</th>
                                <th className="p-4 w-32">สถานะ</th>
                                <th className="p-4 w-40 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map((complaint) => (
                                    <tr key={complaint.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-xs font-mono text-gray-500">#{complaint.id}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {complaint.created_at ? format(new Date(complaint.created_at), 'd MMM yyyy', { locale: th }) : '-'}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-medium text-gray-800">{complaint.complainant_name}</div>
                                            <div className="text-xs text-gray-500">{complaint.phone}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-medium text-blue-600">
                                                <span className="text-gray-500 mr-1">ผลิตภัณฑ์:</span>
                                                {complaint.product_name || '-'}
                                            </div>
                                            {complaint.shop_name && (
                                                <div className="text-xs text-gray-600 font-medium mb-1">
                                                    <span className="opacity-75">สถานประกอบการ:</span> {complaint.shop_name}
                                                </div>
                                            )}
                                            {complaint.complaint_number && (
                                                <div className="mt-1 text-xs text-green-700 bg-green-50 inline-block px-1.5 py-0.5 rounded">
                                                    เลขรับ: {complaint.complaint_number}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            {(() => {
                                                if (!complaint.received_date) return <span className="text-gray-400">-</span>;
                                                const endDate = complaint.investigation_date ? new Date(complaint.investigation_date) : new Date();
                                                const daysPassed = differenceInDays(endDate, new Date(complaint.received_date));
                                                const remaining = 50 - daysPassed;

                                                let colorClass = "text-green-600 bg-green-50";
                                                if (remaining < 0) colorClass = "text-red-600 bg-red-50";
                                                else if (remaining <= 7) colorClass = "text-amber-600 bg-amber-50";

                                                return (
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md font-medium ${colorClass}`}>
                                                        {remaining < 0 ? `เกิน ${Math.abs(remaining)} วัน` : `${remaining} วัน`}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="flex flex-col gap-2">
                                                {complaint.responsible_person_name ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                                                        <span>{complaint.responsible_person_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">รอการมอบหมาย</span>
                                                )}

                                                {role === 'ADMIN' && activeTab === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleAssignClick(complaint)}
                                                        className="self-start text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                                                    >
                                                        {complaint.responsible_person_name ? 'เปลี่ยนผู้รับผิดชอบ' : 'มอบหมาย'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {(() => {
                                                if (complaint.status === 'RESOLVED') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <span className="size-1.5 rounded-full bg-current mr-1.5"></span>
                                                            ดำเนินการเสร็จสิ้น
                                                        </span>
                                                    );
                                                }
                                                if (complaint.status === 'REJECTED') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <span className="size-1.5 rounded-full bg-current mr-1.5"></span>
                                                            ถูกปฏิเสธ
                                                        </span>
                                                    );
                                                }
                                                if (complaint.status === 'IN_PROGRESS') {
                                                    if (complaint.investigation_date) {
                                                        return (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                <span className="size-1.5 rounded-full bg-current mr-1.5"></span>
                                                                ตรวจสอบแล้ว
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                            <span className="size-1.5 rounded-full bg-current mr-1.5"></span>
                                                            อยู่ระหว่างดำเนินการ
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <span className="size-1.5 rounded-full bg-current mr-1.5"></span>
                                                        รอตรวจสอบ
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {/* Actions based on tab */}
                                            {activeTab === 'INCOMING' && (
                                                <>
                                                    <a href={`/admin/complaints/${complaint.id}`} className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                                                        ดูรายละเอียด
                                                    </a>
                                                    <button
                                                        onClick={() => handleRejectClick(complaint)}
                                                        className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        ปฏิเสธ
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptClick(complaint)}
                                                        className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 shadow-sm"
                                                    >
                                                        รับเรื่อง
                                                    </button>
                                                </>
                                            )}
                                            {activeTab === 'ACTIVE' && (
                                                <div className="flex justify-end gap-2 items-center">
                                                    <a href={`/admin/complaints/${complaint.id}`} className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                                                        ดูรายละเอียด
                                                    </a>
                                                    {/* Assign button moved to Responsible Person column */}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400 bg-gray-50/30">
                                        ไม่พบข้อมูลในหมวดหมู่นี้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {
                isAcceptModalOpen && selectedComplaint && (
                    <AcceptComplaintModal
                        complaint={selectedComplaint}
                        onClose={() => setIsAcceptModalOpen(false)}
                        onSuccess={handleSuccess}
                    />
                )
            }
            {
                isRejectModalOpen && selectedComplaint && (
                    <RejectComplaintModal
                        complaintId={selectedComplaint.id}
                        onClose={() => setIsRejectModalOpen(false)}
                        onSuccess={handleSuccess}
                    />
                )
            }
            {
                isManualFormOpen && (
                    <ManualComplaintForm
                        onClose={() => setIsManualFormOpen(false)}
                        onSuccess={handleSuccess}
                    />
                )
            }
            {
                isAssignModalOpen && selectedComplaint && (
                    <AssignComplaintModal
                        complaintId={selectedComplaint.id}
                        currentOfficerId={selectedComplaint.responsible_person_id ?? undefined}
                        onClose={() => setIsAssignModalOpen(false)}
                        onSuccess={handleSuccess}
                    />
                )
            }
        </div >
    );
}
