import { isAuthenticated } from '@/lib/admin-actions';
import AdminSession from './components/AdminSession';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuth = await isAuthenticated();

    return (
        <div className="admin-layout relative">
            {isAuth && <AdminSession timeoutMs={600000} />}
            {children}
        </div>
    );
}
