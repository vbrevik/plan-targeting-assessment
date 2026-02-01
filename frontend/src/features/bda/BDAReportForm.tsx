// BDA Report Form Component
// Purpose: Create and edit BDA assessments with full NATO COPD & JP 3-60 fields

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BdaApi, type CreateBdaReportRequest, type BdaReport, type PhysicalDamage, type FunctionalDamage, type AssessmentType, type Recommendation, type EffectLevel, type StrikeCorrelation, type WeaponPerformance, type CivcasCredibility, type AssessmentQuality } from '@/lib/mshnctrl/api/bda';
import { Save, X, AlertCircle, Crosshair } from 'lucide-react';

interface BDAReportFormProps {
    targetId: string;
    strikeId?: string;
    initialData?: Partial<BdaReport>;
    onSuccess?: (report: BdaReport) => void;
    onCancel?: () => void;
}

export const BDAReportForm: React.FC<BDAReportFormProps> = ({
    targetId,
    strikeId,
    initialData,
    onSuccess,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [strikes, setStrikes] = useState<StrikeCorrelation[]>([]);

    // Form state
    const [selectedStrikeId, setSelectedStrikeId] = useState<string | undefined>(strikeId || initialData?.strike_id);
    const [assessmentType, setAssessmentType] = useState<AssessmentType>(initialData?.assessment_type || 'initial');
    const [physicalDamage, setPhysicalDamage] = useState<PhysicalDamage>(initialData?.physical_damage || 'ND');
    const [physicalDamagePercentage, setPhysicalDamagePercentage] = useState<number | undefined>(initialData?.physical_damage_percentage);
    const [damageDescription, setDamageDescription] = useState<string>(initialData?.damage_description || '');
    const [functionalDamage, setFunctionalDamage] = useState<FunctionalDamage>(initialData?.functional_damage || 'FMC');
    const [estimatedRepairTime, setEstimatedRepairTime] = useState<number | undefined>(initialData?.estimated_repair_time_hours);
    const [preStrikeBaseline, setPreStrikeBaseline] = useState<string>(initialData?.pre_strike_capability_baseline || '');
    const [desiredEffect, setDesiredEffect] = useState<string>(initialData?.desired_effect || '');
    const [achievedEffect, setAchievedEffect] = useState<string>(initialData?.achieved_effect || '');
    const [effectLevel, setEffectLevel] = useState<EffectLevel | undefined>(initialData?.effect_level);
    const [unintendedEffects, setUnintendedEffects] = useState<string>(initialData?.unintended_effects || '');
    const [confidenceLevel, setConfidenceLevel] = useState<number>(initialData?.confidence_level || 0.8);
    const [assessmentQuality, setAssessmentQuality] = useState<AssessmentQuality | undefined>(initialData?.assessment_quality);
    const [limitingFactors, setLimitingFactors] = useState<string>(initialData?.limiting_factors || '');
    const [recommendation, setRecommendation] = useState<Recommendation>(initialData?.recommendation || 'monitor');
    const [reAttackPriority, setReAttackPriority] = useState<number | undefined>(initialData?.re_attack_priority);
    const [reAttackRationale, setReAttackRationale] = useState<string>(initialData?.re_attack_rationale || '');
    const [alternativeMunitions, setAlternativeMunitions] = useState<string>(initialData?.alternative_munitions || '');
    const [collateralDamageDetected, setCollateralDamageDetected] = useState<boolean>(initialData?.collateral_damage_detected || false);
    const [civcasCredibility, setCivcasCredibility] = useState<CivcasCredibility | undefined>(initialData?.civcas_credibility);
    const [civilianCasualties, setCivilianCasualties] = useState<number | undefined>(initialData?.civilian_casualties_estimate);
    const [cdeVsActual, setCdeVsActual] = useState<string>(initialData?.cde_vs_actual_comparison || '');

    // Weaponeering Validation (Phase 2)
    const [weaponPerformance, setWeaponPerformance] = useState<WeaponPerformance | undefined>(initialData?.weapon_performance_vs_predicted);
    const [munitionReliability, setMunitionReliability] = useState<string>(initialData?.munition_reliability || '');
    const [cepMeters, setCepMeters] = useState<number | undefined>(initialData?.circular_error_probable_meters);
    const [penetrationDepth, setPenetrationDepth] = useState<number | undefined>(initialData?.penetration_depth_meters);

    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [classificationLevel, setClassificationLevel] = useState<string>(initialData?.classification_level || 'SECRET');

    React.useEffect(() => {
        if (targetId) {
            BdaApi.getStrikesByTarget(targetId)
                .then((data) => setStrikes(data))
                .catch((err) => console.error('Failed to fetch strikes:', err));
        }
    }, [targetId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const request: CreateBdaReportRequest = {
                target_id: targetId,
                strike_id: selectedStrikeId,
                assessment_type: assessmentType,
                physical_damage: physicalDamage,
                physical_damage_percentage: physicalDamagePercentage,
                damage_description: damageDescription || undefined,
                functional_damage: functionalDamage,
                estimated_repair_time_hours: estimatedRepairTime,
                pre_strike_capability_baseline: preStrikeBaseline || undefined,
                desired_effect: desiredEffect,
                achieved_effect: achievedEffect,
                effect_level: effectLevel,
                unintended_effects: unintendedEffects || undefined,
                confidence_level: confidenceLevel,
                assessment_quality: assessmentQuality,
                limiting_factors: limitingFactors || undefined,
                recommendation: recommendation,
                re_attack_priority: reAttackPriority,
                re_attack_rationale: reAttackRationale || undefined,
                alternative_munitions: alternativeMunitions || undefined,
                collateral_damage_detected: collateralDamageDetected,
                civcas_credibility: civcasCredibility,
                civilian_casualties_estimate: civilianCasualties,
                cde_vs_actual_comparison: cdeVsActual || undefined,
                weapon_performance_vs_predicted: weaponPerformance,
                munition_reliability: munitionReliability || undefined,
                circular_error_probable_meters: cepMeters,
                penetration_depth_meters: penetrationDepth,
                classification_level: classificationLevel,
                notes: notes || undefined,
            };

            const report = await BdaApi.createReport(request);
            onSuccess?.(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create BDA report');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {initialData ? 'Edit BDA Assessment' : 'Create BDA Assessment'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400 text-[10px]">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Strike Selection */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2">
                            <Crosshair size={12} className="text-blue-500" /> Strike Association
                        </label>
                        <select
                            value={selectedStrikeId || ''}
                            onChange={(e) => {
                                const id = e.target.value;
                                setSelectedStrikeId(id || undefined);
                                if (id) {
                                    const strike = strikes.find(s => s.id === id);
                                    if (strike) {
                                        // Auto-populate weapon system and munition type if not already set
                                        if (!munitionReliability) setMunitionReliability('Nominal');
                                        if (strike.circular_error_probable_meters && !cepMeters) {
                                            setCepMeters(strike.circular_error_probable_meters);
                                        }
                                    }
                                }
                            }}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">-- SELECT STRIKE MISSION --</option>
                            {strikes.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.weapon_system} - {s.munition_type} ({new Date(s.time_on_target).toLocaleTimeString()} - {new Date(s.time_on_target).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                        {!strikes.length && (
                            <p className="text-[8px] text-slate-600 italic">No historical strikes found for this target ID.</p>
                        )}
                        {selectedStrikeId && strikes.find(s => s.id === selectedStrikeId) && (
                            <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded text-[9px] text-blue-300 font-mono">
                                <div>Weapon: {strikes.find(s => s.id === selectedStrikeId)?.weapon_system}</div>
                                <div>Munition: {strikes.find(s => s.id === selectedStrikeId)?.munition_type}</div>
                            </div>
                        )}
                    </div>

                    {/* Assessment Type */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Assessment Type</label>
                        <select
                            value={assessmentType}
                            onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="initial">Initial (within 24h)</option>
                            <option value="interim">Interim (24-72h)</option>
                            <option value="final">Final (72h+)</option>
                        </select>
                    </div>

                    {/* Physical Damage */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Physical Damage (JP 3-60)</label>
                        <select
                            value={physicalDamage}
                            onChange={(e) => setPhysicalDamage(e.target.value as PhysicalDamage)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="ND">ND - No Damage (0% capability loss)</option>
                            <option value="SD">SD - Slight Damage (&lt;10% capability loss)</option>
                            <option value="MD">MD - Moderate Damage (10-50% capability loss)</option>
                            <option value="SVD">SVD - Severe Damage (50-90% capability loss)</option>
                            <option value="D">D - Destroyed (&gt;90% capability loss)</option>
                        </select>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Damage percentage (0-100)"
                            value={physicalDamagePercentage || ''}
                            onChange={(e) => setPhysicalDamagePercentage(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                            placeholder="Damage description..."
                            value={damageDescription}
                            onChange={(e) => setDamageDescription(e.target.value)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[60px]"
                        />
                    </div>

                    {/* Functional Damage */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Functional Status (JP 3-60)</label>
                        <select
                            value={functionalDamage}
                            onChange={(e) => setFunctionalDamage(e.target.value as FunctionalDamage)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="FMC">FMC - Fully Mission Capable</option>
                            <option value="PMC">PMC - Partially Mission Capable</option>
                            <option value="NMC">NMC - Not Mission Capable</option>
                        </select>
                        <input
                            type="number"
                            min="0"
                            placeholder="Estimated repair time (hours)"
                            value={estimatedRepairTime || ''}
                            onChange={(e) => setEstimatedRepairTime(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                            placeholder="Pre-strike capability baseline..."
                            value={preStrikeBaseline}
                            onChange={(e) => setPreStrikeBaseline(e.target.value)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[60px]"
                        />
                    </div>

                    {/* Effects Assessment */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Effects Assessment</label>
                        <input
                            type="text"
                            placeholder="Desired effect"
                            value={desiredEffect}
                            onChange={(e) => setDesiredEffect(e.target.value)}
                            required
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Achieved effect"
                            value={achievedEffect}
                            onChange={(e) => setAchievedEffect(e.target.value)}
                            required
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        />
                        <select
                            value={effectLevel || ''}
                            onChange={(e) => setEffectLevel(e.target.value ? (e.target.value as EffectLevel) : undefined)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select effect level (optional)</option>
                            <option value="first_order">First Order (immediate physical)</option>
                            <option value="second_order">Second Order (operational/systemic)</option>
                            <option value="third_order">Third Order (strategic/behavioral)</option>
                        </select>
                        <textarea
                            placeholder="Unintended effects (optional)"
                            value={unintendedEffects}
                            onChange={(e) => setUnintendedEffects(e.target.value)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[60px]"
                        />
                    </div>

                    {/* Confidence & Quality */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">
                                Confidence Level: {(confidenceLevel * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={confidenceLevel}
                                onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Assessment Quality</label>
                            <select
                                value={assessmentQuality || ''}
                                onChange={(e) => setAssessmentQuality(e.target.value ? e.target.value as AssessmentQuality : undefined)}
                                className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                            >
                                <option value="high">High (Multi-source imagery)</option>
                                <option value="medium">Medium (Single-source imagery)</option>
                                <option value="low">Low (SIGINT/HUMINT only)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <h4 className="text-[9px] font-black text-blue-400 uppercase flex items-center gap-2">
                            <Crosshair size={12} /> Weaponeering Validation (Phase 2)
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase">Weapon Performance</label>
                                <select
                                    value={weaponPerformance || ''}
                                    onChange={(e) => setWeaponPerformance(e.target.value ? e.target.value as WeaponPerformance : undefined)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select performance...</option>
                                    <option value="exceeded">Exceeded Predicted</option>
                                    <option value="met">Met Predicted</option>
                                    <option value="below">Below Predicted</option>
                                    <option value="failed">Weapon System Failure</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase">Munition Reliability</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nominal, Fuzing Error..."
                                    value={munitionReliability}
                                    onChange={(e) => setMunitionReliability(e.target.value)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase">Actual CEP (Meters)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Distance from DMPI"
                                    value={cepMeters || ''}
                                    onChange={(e) => setCepMeters(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase">Penetration (Meters)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Actual depth"
                                    value={penetrationDepth || ''}
                                    onChange={(e) => setPenetrationDepth(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Limiting Factors</label>
                        <textarea
                            placeholder="Weather, resolution, masking, etc."
                            value={limitingFactors}
                            onChange={(e) => setLimitingFactors(e.target.value)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[60px]"
                        />
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Recommendation</label>
                        <select
                            value={recommendation}
                            onChange={(e) => setRecommendation(e.target.value as Recommendation)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="effect_achieved">Effect Achieved</option>
                            <option value="monitor">Monitor</option>
                            <option value="re_attack">Re-attack</option>
                            <option value="re_weaponeer">Re-weaponeer</option>
                        </select>
                        {(recommendation === 're_attack' || recommendation === 're_weaponeer') && (
                            <>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    placeholder="Re-attack priority (1-5)"
                                    value={reAttackPriority || ''}
                                    onChange={(e) => setReAttackPriority(e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                />
                                <textarea
                                    placeholder="Re-attack rationale..."
                                    value={reAttackRationale}
                                    onChange={(e) => setReAttackRationale(e.target.value)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[60px]"
                                />
                                <input
                                    type="text"
                                    placeholder="Alternative munitions (optional)"
                                    value={alternativeMunitions}
                                    onChange={(e) => setAlternativeMunitions(e.target.value)}
                                    className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                />
                            </>
                        )}
                    </div>

                    {/* Collateral Damage */}
                    <div className="space-y-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-lg">
                        <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                            <input
                                type="checkbox"
                                checked={collateralDamageDetected}
                                onChange={(e) => setCollateralDamageDetected(e.target.checked)}
                                className="rounded border-slate-800"
                            />
                            Collateral Damage Detected
                        </label>

                        {collateralDamageDetected && (
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase">CIVCAS Credibility</label>
                                    <select
                                        value={civcasCredibility || ''}
                                        onChange={(e) => setCivcasCredibility(e.target.value ? e.target.value as CivcasCredibility : undefined)}
                                        className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select credibility...</option>
                                        <option value="no_credibility">No Credibility</option>
                                        <option value="possible">Possible</option>
                                        <option value="credible">Credible</option>
                                        <option value="confirmed">Confirmed</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase">Casualty Estimate</label>
                                    <input
                                        type="number"
                                        placeholder="Est. CIVCAS"
                                        value={civilianCasualties || ''}
                                        onChange={(e) => setCivilianCasualties(e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">CDE vs Actual Comparison</label>
                            <textarea
                                placeholder="Explain variance from pre-strike CDE predictions..."
                                value={cdeVsActual}
                                onChange={(e) => setCdeVsActual(e.target.value)}
                                className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[60px]"
                            />
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Classification Level</label>
                        <select
                            value={classificationLevel}
                            onChange={(e) => setClassificationLevel(e.target.value)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="UNCLASS">UNCLASS</option>
                            <option value="CUI">CUI</option>
                            <option value="SECRET">SECRET</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Additional Notes</label>
                        <textarea
                            placeholder="Analyst notes, observations, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[100px]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !desiredEffect || !achievedEffect}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase h-9"
                        >
                            <Save size={14} className="mr-2" />
                            {isSubmitting ? 'SUBMITTING...' : initialData ? 'UPDATE BDA' : 'CREATE BDA'}
                        </Button>
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="border-slate-800 text-slate-500 hover:text-white text-[9px] font-black uppercase h-9"
                            >
                                <X size={14} className="mr-2" />
                                CANCEL
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
