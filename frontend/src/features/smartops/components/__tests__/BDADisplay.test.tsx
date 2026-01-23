// Unit tests for BDADisplay component
// Purpose: Test data loading, display, and interaction

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BDADisplay } from '../BDADisplay';
import { BdaApi } from '@/lib/smartops/api/bda';

// Mock the API
vi.mock('@/lib/smartops/api/bda', () => ({
  BdaApi: {
    getReports: vi.fn(),
    getReportImagery: vi.fn(),
    updateReport: vi.fn(),
  },
}));

describe('BDADisplay', () => {
  const mockOnStatusChange = vi.fn();
  const defaultProps = {
    targetId: 'test-target-123',
    onStatusChange: mockOnStatusChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (BdaApi.getReports as any).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<BDADisplay {...defaultProps} />);
    
    expect(screen.getByText(/Loading BDA Data/i)).toBeInTheDocument();
  });

  it('displays empty state when no reports exist', async () => {
    (BdaApi.getReports as any).mockResolvedValue([]);
    (BdaApi.getReportImagery as any).mockResolvedValue([]);

    render(<BDADisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/No BDA Data Available/i)).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load BDA data';
    (BdaApi.getReports as any).mockRejectedValue(new Error(errorMessage));

    render(<BDADisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error Loading BDA/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays report data when available', async () => {
    const mockReports = [{
      id: 'report-123',
      target_id: 'test-target-123',
      physical_damage: 'MD',
      physical_damage_percentage: 45,
      functional_damage: 'PMC',
      confidence_level: 0.85,
      recommendation: 'monitor',
      collateral_damage_detected: false,
      status: 'draft',
      assessment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analyst_id: 'analyst-1',
      desired_effect: 'Neutralize target',
      achieved_effect: 'Partially neutralized',
      classification_level: 'SECRET',
    }];

    (BdaApi.getReports as any).mockResolvedValue(mockReports);
    (BdaApi.getReportImagery as any).mockResolvedValue([]);

    render(<BDADisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Moderate Damage/i)).toBeInTheDocument();
      expect(screen.getByText(/Partially Mission Capable/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitor/i)).toBeInTheDocument();
    });
  });

  it('displays imagery when available', async () => {
    const mockReports = [{
      id: 'report-123',
      target_id: 'test-target-123',
      physical_damage: 'MD',
      functional_damage: 'PMC',
      confidence_level: 0.85,
      recommendation: 'monitor',
      collateral_damage_detected: false,
      status: 'draft',
      assessment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analyst_id: 'analyst-1',
      desired_effect: 'Test',
      achieved_effect: 'Test',
      classification_level: 'SECRET',
    }];

    const mockImagery = [
      {
        id: 'img-1',
        bda_report_id: 'report-123',
        is_pre_strike_baseline: true,
        image_url: '/test/pre-strike.jpg',
        collection_date: new Date().toISOString(),
        classification_level: 'SECRET',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'img-2',
        bda_report_id: 'report-123',
        is_pre_strike_baseline: false,
        image_url: '/test/post-strike.jpg',
        collection_date: new Date().toISOString(),
        classification_level: 'SECRET',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    (BdaApi.getReports as any).mockResolvedValue(mockReports);
    (BdaApi.getReportImagery as any).mockResolvedValue(mockImagery);

    render(<BDADisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/PRE-STRIKE/i)).toBeInTheDocument();
      expect(screen.getByText(/POST-STRIKE/i)).toBeInTheDocument();
    });
  });

  it('allows re-evaluation when report is in draft status', async () => {
    const mockReports = [{
      id: 'report-123',
      target_id: 'test-target-123',
      physical_damage: 'MD',
      functional_damage: 'PMC',
      confidence_level: 0.85,
      recommendation: 'monitor',
      collateral_damage_detected: false,
      status: 'draft',
      assessment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analyst_id: 'analyst-1',
      desired_effect: 'Test',
      achieved_effect: 'Test',
      classification_level: 'SECRET',
    }];

    (BdaApi.getReports as any).mockResolvedValue(mockReports);
    (BdaApi.getReportImagery as any).mockResolvedValue([]);

    render(<BDADisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Re-evaluate Effects/i)).toBeInTheDocument();
    });
  });
});
