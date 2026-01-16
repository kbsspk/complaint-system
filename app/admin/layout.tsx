import AdminSidebar from '@/components/AdminSidebar';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-background-light">
            <AdminSidebar user={session} />
            <main className="pl-64">
                {children}
            </main>
        </div>
    );
}
