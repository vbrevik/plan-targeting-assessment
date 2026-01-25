// BDA Imagery Upload Component
// Purpose: Upload and manage post-strike imagery for BDA reports

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BdaApi, type BdaImagery, type SensorType } from '@/lib/smartops/api/bda';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';

interface BDAImageryUploadProps {
    reportId: string;
    onSuccess?: (imagery: BdaImagery) => void;
    onCancel?: () => void;
}

export const BDAImageryUpload: React.FC<BDAImageryUploadProps> = ({
    reportId,
    onSuccess,
    onCancel,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Form state
    const [collectionDate, setCollectionDate] = useState<string>(new Date().toISOString());
    const [collectionPlatform, setCollectionPlatform] = useState<string>('');
    const [sensorType, setSensorType] = useState<SensorType | undefined>();
    const [groundSampleDistance, setGroundSampleDistance] = useState<number | undefined>();
    const [cloudCover, setCloudCover] = useState<number | undefined>();
    const [qualityScore, setQualityScore] = useState<number | undefined>();
    const [isPreStrike, setIsPreStrike] = useState<boolean>(false);
    const [classificationLevel, setClassificationLevel] = useState<string>('SECRET');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select an image file');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('bda_report_id', reportId);
            formData.append('collection_date', collectionDate);
            if (collectionPlatform) {
                formData.append('collection_platform', collectionPlatform);
            }
            if (sensorType) {
                formData.append('sensor_type', sensorType);
            }
            if (groundSampleDistance !== undefined) {
                formData.append('ground_sample_distance_cm', groundSampleDistance.toString());
            }
            if (cloudCover !== undefined) {
                formData.append('cloud_cover_percentage', cloudCover.toString());
            }
            if (qualityScore !== undefined) {
                formData.append('quality_score', qualityScore.toString());
            }
            formData.append('is_pre_strike_baseline', isPreStrike.toString());
            formData.append('classification_level', classificationLevel);

            // Upload file using multipart endpoint
            const imagery = await BdaApi.uploadImageryFile(formData);
            onSuccess?.(imagery);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload imagery');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Upload Imagery
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

                    {/* File Selection */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Image File</label>
                        <div className="border-2 border-dashed border-slate-800 rounded p-6 text-center">
                            <input
                                type="file"
                                accept="image/*,.tif,.tiff,.nitf"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="imagery-upload"
                            />
                            <label
                                htmlFor="imagery-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                <Camera size={32} className="text-slate-500" />
                                <span className="text-[10px] text-slate-400">
                                    {selectedFile ? selectedFile.name : 'Click to select image'}
                                </span>
                                {selectedFile && (
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[8px]">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </Badge>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Collection Metadata */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Collection Date & Time</label>
                        <input
                            type="datetime-local"
                            value={collectionDate.substring(0, 16)}
                            onChange={(e) => setCollectionDate(new Date(e.target.value).toISOString())}
                            required
                            className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Collection Platform</label>
                            <input
                                type="text"
                                placeholder="e.g. Sentinel-2, F-16"
                                value={collectionPlatform}
                                onChange={(e) => setCollectionPlatform(e.target.value)}
                                className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Sensor Type</label>
                            <select
                                value={sensorType || ''}
                                onChange={(e) => setSensorType(e.target.value ? (e.target.value as SensorType) : undefined)}
                                className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select sensor type</option>
                                <option value="SAR">SAR - Synthetic Aperture Radar</option>
                                <option value="EO">EO - Electro-Optical</option>
                                <option value="IR">IR - Infrared</option>
                                <option value="FMV">FMV - Full Motion Video</option>
                                <option value="Commercial">Commercial Satellite</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Quality */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">GSD (cm)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Ground sample distance"
                                value={groundSampleDistance || ''}
                                onChange={(e) => setGroundSampleDistance(e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Cloud Cover (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                value={cloudCover || ''}
                                onChange={(e) => setCloudCover(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">
                                Quality Score: {qualityScore ? (qualityScore * 100).toFixed(0) + '%' : 'N/A'}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={qualityScore || 0}
                                onChange={(e) => setQualityScore(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Baseline Flag */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                            <input
                                type="checkbox"
                                checked={isPreStrike}
                                onChange={(e) => setIsPreStrike(e.target.checked)}
                                className="rounded border-slate-800"
                            />
                            Pre-Strike Baseline Image
                        </label>
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

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                        <Button
                            type="submit"
                            disabled={isUploading || !selectedFile}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase h-9"
                        >
                            <Upload size={14} className="mr-2" />
                            {isUploading ? 'UPLOADING...' : 'UPLOAD IMAGERY'}
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
