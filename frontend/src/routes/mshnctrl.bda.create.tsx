import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { BDAReportForm } from '@/features/bda/BDAReportForm';
import { BdaApi, type BdaReport } from '@/lib/mshnctrl/api/bda';

export const Route = createFileRoute('/mshnctrl/bda/create')({
    component: BDACreatePage
});

function BDACreatePage() {
    const navigate = useNavigate();
    const search = useSearch({ from: '/mshnctrl/bda/create' });
    const targetId = (search as any).targetId || '';

    const handleSuccess = (report: BdaReport) => {
        navigate({ to: `/mshnctrl/bda/${report.id}` });
    };

    const handleCancel = () => {
        navigate({ to: '/mshnctrl/bda' });
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
