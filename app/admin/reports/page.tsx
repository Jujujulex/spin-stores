import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

async function getReports() {
    const currentUser = await getSessionUser();

    if (!currentUser) {
        redirect('/login');
    }

    // For now, simple admin check (you can add isAdmin field to User model later)
    // This is a placeholder - in production, add proper admin role checking

    const reports = await prisma.report.findMany({
        include: {
            reporter: {
                select: {
                    id: true,
                    username: true,
                    walletAddress: true,
                },
            },
            product: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return reports;
}

export default async function AdminReportsPage() {
    const reports = await getReports();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Reports Dashboard
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Reporter
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Target
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(report.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <Link
                                                href={`/users/${report.reporter.id}`}
                                                className="hover:text-blue-600 dark:hover:text-blue-400"
                                            >
                                                {report.reporter.username || report.reporter.walletAddress.slice(0, 8)}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700">
                                                {report.targetType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {report.targetType === 'PRODUCT' && report.product ? (
                                                <Link
                                                    href={`/products/${report.product.id}`}
                                                    className="hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {report.product.title}
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/users/${report.targetId}`}
                                                    className="hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    View User
                                                </Link>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div>
                                                <p className="font-medium">{report.reason}</p>
                                                {report.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                                        {report.description.slice(0, 50)}
                                                        {report.description.length > 50 && '...'}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : report.status === 'REVIEWED'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    }`}
                                            >
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No reports found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
