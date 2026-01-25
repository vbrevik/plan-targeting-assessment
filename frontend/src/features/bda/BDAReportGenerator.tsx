// BDA Report Generator Component
// Purpose: Generate and export BDA reports in various formats

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BdaApi, type GenerateReportRequest, type BdaReportTemplate, type ReportGenerationResponse } from '@/lib/smartops/api/bda';
import { FileDown, FileText, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BDAReportGeneratorProps {
    reportId: string;
    reportStatus: string;
}

export const BDAReportGenerator: React.FC<BDAReportGeneratorProps> = ({ 
    reportId,
    reportStatus 
}) => {
    const [templates, setTemplates] = useState<BdaReportTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Form state
    const [selectedTemplate, setSelectedTemplate] = useState<string>('initial');
    const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'json' | 'kml'>('html');
    const [includeImagery, setIncludeImagery] = useState(true);
    const [includeComponents, setIncludeComponents] = useState(true);
    const [includePeerReviews, setIncludePeerReviews] = useState(false);
    const [includeHistory, setIncludeHistory] = useState(false);
    const [classification, setClassification] = useState<'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED'>('SECRET');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await BdaApi.getReportTemplates();
            setTemplates(data);
            if (data.length > 0) {
                setSelectedTemplate(data[0].type);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        setSuccess(null);

        try {
            const request: GenerateReportRequest = {
                bda_report_id: reportId,
                template_type: selectedTemplate as any,
                format: selectedFormat,
                include_imagery: includeImagery,
                include_components: includeComponents,
                include_peer_reviews: includePeerReviews,
                include_history: includeHistory,
                classification: classification,
            };

            const result = await BdaApi.generateReport(reportId, request);

            // Handle blob downloads (HTML, PDF, KML)
            if (result instanceof Blob) {
                const url = window.URL.createObjectURL(result);
                const a = document.createElement('a');
                a.href = url;
                
                // Determine file extension
                let extension = 'html';
                if (selectedFormat === 'pdf') extension = 'pdf';
                else if (selectedFormat === 'kml') extension = 'kml';
                else if (selectedFormat === 'json') extension = 'json';
                
                a.download = `bda_report_${reportId}_${selectedTemplate}.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                setSuccess(`Report generated and downloaded successfully`);
            } else {
                // JSON response
                setSuccess(`Report generated: ${JSON.stringify(result)}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'pdf': return <FileText size={14} />;
            case 'html': return <FileText size={14} />;
            case 'json': return <FileText size={14} />;
            case 'kml': return <FileText size={14} />;
            default: return <FileDown size={14} />;
        }
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm animate-pulse">Loading templates...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Report Generation & Export
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-[9px] text-red-400">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-[9px] text-emerald-400">{success}</span>
                    </div>
                )}

                {/* Template Selection */}
                <div>
                    <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                        Report Template
                    </label>
                    <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[9px] px-2 py-1.5 rounded"
                    >
                        {templates.map((template) => (
                            <option key={template.type} value={template.type}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {templates.find(t => t.type === selectedTemplate)?.description && (
                        <p className="text-[8px] text-slate-500 mt-1">
                            {templates.find(t => t.type === selectedTemplate)?.description}
                        </p>
                    )}
                </div>

                {/* Format Selection */}
                <div>
                    <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                        Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['html', 'json', 'kml', 'pdf'] as const).map((format) => (
                            <button
                                key={format}
                                    onClick={() => setSelectedFormat(format)}
                                    className={cn(
                                        "p-2 border rounded text-[9px] font-black uppercase flex items-center justify-center gap-1.5 transition-colors",
                                        selectedFormat === format
                                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                    )}
                                >
                                    {getFormatIcon(format)}
                                    {format.toUpperCase()}
                                </button>
                        ))}
                    </div>
                </div>

                {/* Include Options */}
                <div>
                    <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                        Include Sections
                    </label>
                    <div className="space-y-1.5">
                        {[
                            { key: 'imagery', label: 'Imagery', checked: includeImagery, setter: setIncludeImagery },
                            { key: 'components', label: 'Component Assessments', checked: includeComponents, setter: setIncludeComponents },
                            { key: 'reviews', label: 'Peer Reviews', checked: includePeerReviews, setter: setIncludePeerReviews },
                            { key: 'history', label: 'Version History', checked: includeHistory, setter: setIncludeHistory },
                        ].map(({ key, label, checked, setter }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => setter(e.target.checked)}
                                    className="w-3 h-3 rounded border-slate-700 bg-slate-900 text-blue-500"
                                />
                                <span className="text-[9px] text-slate-400">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Classification */}
                <div>
                    <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                        Classification Level
                    </label>
                    <select
                        value={classification}
                        onChange={(e) => setClassification(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[9px] px-2 py-1.5 rounded"
                    >
                        <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                        <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                        <option value="SECRET">SECRET</option>
                    </select>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={generating || reportStatus === 'draft'}
                    className={cn(
                        "w-full text-[9px] font-black uppercase py-3",
                        generating ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"
                    )}
                >
                    {generating ? (
                        <>
                            <Loader2 size={12} className="mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download size={12} className="mr-2" />
                            Generate & Download Report
                        </>
                    )}
                </Button>

                {reportStatus === 'draft' && (
                    <p className="text-[8px] text-yellow-400 text-center">
                        Report must be submitted before generating final reports
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
