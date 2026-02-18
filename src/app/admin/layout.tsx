import { isAuthenticated } from '@/lib/admin-actions';
import AdminLayoutWrapper from './components/AdminLayoutWrapper';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuth = await isAuthenticated();

    return (
        <div className="admin-layout relative">
            <AdminLayoutWrapper>
                {children}
            </AdminLayoutWrapper>
        </div>
    );
}
