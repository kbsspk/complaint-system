'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';
import type { SessionPayload } from '@/lib/session';

export default function AdminSidebar({ user }: { user: SessionPayload }) {
    const pathname = usePathname();

    const links = [
        { href: '/admin/dashboard', label: 'รายการร้องเรียน', icon: 'list_alt' },
        ...(user.role === 'ADMIN' ? [{ href: '/admin/users', label: 'จัดการบัญชีผู้ใช้', icon: 'group' }] : []),
        { href: '/admin/dashboard/stats', label: 'สรุปการดำเนินการ', icon: 'bar_chart' },
    ];

    return (
        <aside className="w-64 bg-surface-dark text-white flex flex-col h-screen fixed left-0 top-0 border-r border-border-dark">
            <div className="p-6 border-b border-border-dark flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm truncate max-w-[140px]">{user.fullName || user.username}</span>
                    <span className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</span>
                </div>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border-dark">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    ออกจากระบบ
                </button>
            </div>
        </aside>
    );
}
