// Unit tests for BDAReportForm component
// Purpose: Test form validation, submission, and error handling

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BDAReportForm } from '../BDAReportForm';
import { BdaApi } from '@/lib/smartops/api/bda';

// Mock the API
vi.mock('@/lib/smartops/api/bda', () => ({
  BdaApi: {
    createReport: vi.fn(),
    updateReport: vi.fn(),
  },
}));

describe('BDAReportForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const defaultProps = {
    targetId: 'test-target-123',
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(<BDAReportForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/Assessment Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Physical Damage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Functional Status/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Desired effect/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Achieved effect/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recommendation/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<BDAReportForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /CREATE BDA/i });
    expect(submitButton).toBeDisabled();
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText(/Desired effect/i), {
      target: { value: 'Neutralize target' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Achieved effect/i), {
      target: { value: 'Target neutralized' },
    });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('calls BdaApi.createReport on form submission', async () => {
    const mockReport = {
      id: 'report-123',
      target_id: 'test-target-123',
      assessment_type: 'initial',
      physical_damage: 'MD',
      functional_damage: 'PMC',
      desired_effect: 'Neutralize target',
      achieved_effect: 'Target neutralized',
      confidence_level: 0.8,
      recommendation: 'monitor',
      collateral_damage_detected: false,
      classification_level: 'SECRET',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (BdaApi.createReport as any).mockResolvedValue(mockReport);

    render(<BDAReportForm {...defaultProps} />);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Desired effect/i), {
      target: { value: 'Neutralize target' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Achieved effect/i), {
      target: { value: 'Target neutralized' },
    });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /CREATE BDA/i }));
    
    await waitFor(() => {
      expect(BdaApi.createReport).toHaveBeenCalledWith(
        expect.objectContaining({
          target_id: 'test-target-123',
          desired_effect: 'Neutralize target',
          achieved_effect: 'Target neutralized',
        })
      );
    });
    
    expect(mockOnSuccess).toHaveBeenCalledWith(mockReport);
  });

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to create report';
    (BdaApi.createReport as any).mockRejectedValue(new Error(errorMessage));

    render(<BDAReportForm {...defaultProps} />);
    
    // Fill and submit
    fireEvent.change(screen.getByPlaceholderText(/Desired effect/i), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Achieved effect/i), {
      target: { value: 'Test' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /CREATE BDA/i }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<BDAReportForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /CANCEL/i }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows re-attack fields when recommendation is re_attack', () => {
    render(<BDAReportForm {...defaultProps} />);
    
    const recommendationSelect = screen.getByLabelText(/Recommendation/i);
    fireEvent.change(recommendationSelect, { target: { value: 're_attack' } });
    
    expect(screen.getByPlaceholderText(/Re-attack priority/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Re-attack rationale/i)).toBeInTheDocument();
  });

  it('pre-fills form when initialData is provided', () => {
    const initialData = {
      id: 'report-123',
      physical_damage: 'SVD',
      functional_damage: 'NMC',
      recommendation: 're_attack',
      confidence_level: 0.9,
    };

    render(<BDAReportForm {...defaultProps} initialData={initialData} />);
    
    expect(screen.getByDisplayValue(/Severe Damage/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Not Mission Capable/i)).toBeInTheDocument();
  });
});
