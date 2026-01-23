// BDA Peer Review Component
// Purpose: Display and manage peer review workflow

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BdaApi, type BdaPeerReview, type BdaReviewSummary } from '@/lib/smartops/api/bda';
import { CheckCircle2, XCircle, Clock, AlertTriangle, User, Calendar, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BDAPeerReviewProps {
    reportId: string;
    readOnly?: boolean;
}

export const BDAPeerReview: React.FC<BDAPeerReviewProps> = ({ 
    reportId,
    readOnly = false 
}) => {
    const [reviews, setReviews] = useState<BdaPeerReview[]>([]);
    const [summary, setSummary] = useState<BdaReviewSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [reportId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [reviewsData, summaryData] = await Promise.all([
                BdaApi.getReportReviews(reportId),
                BdaApi.getReviewSummary(reportId),
            ]);
            setReviews(reviewsData);
            setSummary(summaryData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'cancelled': return 'bg-slate-800 text-slate-400';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'urgent': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'high': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'low': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'needs_rework': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'approve': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'approve_with_changes': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'reject': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'request_clarification': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getChecklistItems = (review: BdaPeerReview) => {
        return [
            { label: 'Imagery Reviewed', checked: review.imagery_reviewed },
            { label: 'Damage Categories Correct', checked: review.damage_categories_correct },
            { label: 'Functional Assessment Complete', checked: review.functional_assessment_complete },
            { label: 'Component Assessments Reviewed', checked: review.component_assessments_reviewed },
            { label: 'Collateral Damage Assessed', checked: review.collateral_damage_assessed },
            { label: 'Weaponeering Validated', checked: review.weaponeering_validated },
            { label: 'Recommendations Justified', checked: review.recommendations_justified },
            { label: 'Classification Appropriate', checked: review.classification_appropriate },
        ];
    };

    const getCompletionPercentage = (review: BdaPeerReview) => {
        const items = getChecklistItems(review);
        const completed = items.filter(i => i.checked).length;
        return Math.round((completed / items.length) * 100);
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm animate-pulse">Loading reviews...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-red-400 text-sm">{error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Peer Review Quality Control
                    </CardTitle>
                    {summary && (
                        <div className="flex items-center gap-2">
                            <Badge className="text-[7px] uppercase font-black py-0.5 px-1.5 bg-slate-800">
                                {summary.completed_reviews}/{summary.total_reviews} Complete
                            </Badge>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {summary && summary.total_reviews === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No peer reviews assigned yet
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/50">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <User size={12} className="text-slate-500" />
                                                <span className="text-sm font-black text-white">
                                                    {review.reviewer_name || review.reviewer_id}
                                                </span>
                                                {review.reviewer_role && (
                                                    <span className="text-[9px] text-slate-500">
                                                        ({review.reviewer_role})
                                                    </span>
                                                )}
                                                <Badge className={cn(
                                                    "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                    getStatusColor(review.review_status)
                                                )}>
                                                    {review.review_status.replace('_', ' ')}
                                                </Badge>
                                                <Badge className={cn(
                                                    "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                    getPriorityColor(review.priority)
                                                )}>
                                                    {review.priority}
                                                </Badge>
                                                {review.due_date && (
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                                        <Calendar size={10} />
                                                        Due: {new Date(review.due_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Assessment */}
                                            {review.review_status === 'completed' && (
                                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                                    <Badge className={cn(
                                                        "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                        getQualityColor(review.overall_quality)
                                                    )}>
                                                        Quality: {review.overall_quality.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge className={cn(
                                                        "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                        getRecommendationColor(review.recommendation)
                                                    )}>
                                                        {review.recommendation.replace('_', ' ')}
                                                    </Badge>
                                                    {review.time_spent_minutes && (
                                                        <span className="text-[9px] text-slate-500">
                                                            {review.time_spent_minutes} min
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Completion Progress */}
                                        {review.review_status === 'in_progress' && (
                                            <div className="text-right">
                                                <div className="text-[9px] text-slate-500 mb-1">Progress</div>
                                                <div className="text-sm font-black text-slate-400">
                                                    {getCompletionPercentage(review)}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Checklist */}
                                    {review.review_status !== 'pending' && (
                                        <div className="mt-3 p-2 bg-slate-950/40 rounded border border-slate-800/50">
                                            <div className="text-[8px] text-slate-600 mb-2 uppercase font-black">
                                                Quality Checklist ({getCompletionPercentage(review)}%)
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {getChecklistItems(review).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 text-[8px]">
                                                        {item.checked ? (
                                                            <CheckCircle2 size={10} className="text-emerald-400" />
                                                        ) : (
                                                            <XCircle size={10} className="text-slate-600" />
                                                        )}
                                                        <span className={cn(
                                                            item.checked ? "text-slate-400" : "text-slate-600"
                                                        )}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Comments */}
                                    {review.review_comments && (
                                        <div className="mt-2 p-2 bg-slate-950/40 rounded border border-slate-800/50">
                                            <div className="text-[8px] text-slate-600 mb-1 uppercase font-black">
                                                Review Comments
                                            </div>
                                            <p className="text-[9px] text-slate-400">{review.review_comments}</p>
                                        </div>
                                    )}
                                    
                                    {/* Strengths/Weaknesses */}
                                    {(review.strengths || review.weaknesses) && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {review.strengths && (
                                                <div className="p-2 bg-emerald-500/5 rounded border border-emerald-500/20">
                                                    <div className="text-[8px] text-emerald-400 mb-1 uppercase font-black">
                                                        Strengths
                                                    </div>
                                                    <p className="text-[9px] text-slate-400">{review.strengths}</p>
                                                </div>
                                            )}
                                            {review.weaknesses && (
                                                <div className="p-2 bg-orange-500/5 rounded border border-orange-500/20">
                                                    <div className="text-[8px] text-orange-400 mb-1 uppercase font-black">
                                                        Weaknesses
                                                    </div>
                                                    <p className="text-[9px] text-slate-400">{review.weaknesses}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Required Changes / Clarification */}
                                    {review.required_changes && (
                                        <div className="mt-2 p-2 bg-yellow-500/5 rounded border border-yellow-500/20">
                                            <div className="text-[8px] text-yellow-400 mb-1 uppercase font-black">
                                                Required Changes
                                            </div>
                                            <p className="text-[9px] text-slate-400">{review.required_changes}</p>
                                        </div>
                                    )}
                                    
                                    {review.clarification_questions && (
                                        <div className="mt-2 p-2 bg-blue-500/5 rounded border border-blue-500/20">
                                            <div className="text-[8px] text-blue-400 mb-1 uppercase font-black">
                                                Clarification Questions
                                            </div>
                                            <p className="text-[9px] text-slate-400">{review.clarification_questions}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
