import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { BDAReportForm } from '../../../features/smartops/components/BDAReportForm';
import { BdaApi, type BdaReport } from '@/lib/smartops/api/bda';

export const Route = createFileRoute('/smartops/bda/create')({
    component: BDACreatePage
});

function BDACreatePage() {
    const navigate = useNavigate();
    const search = useSearch({ from: '/smartops/bda/create' });
    const targetId = (search as any).targetId || '';

    const handleSuccess = (report: BdaReport) => {
        navigate({ to: `/smartops/bda/${report.id}` });
    };

    const handleCancel = () => {
        navigate({ to: '/smartops/bda' });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <BDAReportForm
                targetId={targetId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
