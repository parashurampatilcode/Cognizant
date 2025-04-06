import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FilterControls from '../FilterControls';

// Mock axios
jest.mock('axios');

describe('FilterControls', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnReportData = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
    mockOnReportData.mockClear();
    axios.get.mockClear();
  });

  it('renders all dropdowns with default selections', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    // Check if all dropdowns are present
    expect(screen.getByRole('combobox', { name: 'Practice' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Market' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Off/On' })).toBeInTheDocument();

    // Check default values
    expect(screen.getByRole('combobox', { name: 'Practice' })).toHaveTextContent('All');
    expect(screen.getByRole('combobox', { name: 'Market' })).toHaveTextContent('All');
    expect(screen.getByRole('combobox', { name: 'Off/On' })).toHaveTextContent('All');
  });

  it('renders View Report button in disabled state initially', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    const viewReportButton = screen.getByRole('button', { name: 'View Report' });
    expect(viewReportButton).toBeInTheDocument();
    expect(viewReportButton).toBeDisabled();
  });

  it('enables View Report button when all filters have non-All values', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    // Change all filters to non-All values
    const practiceSelect = screen.getByRole('combobox', { name: 'Practice' });
    fireEvent.mouseDown(practiceSelect);
    fireEvent.click(screen.getByText('EPS PEGA'));

    const marketSelect = screen.getByRole('combobox', { name: 'Market' });
    fireEvent.mouseDown(marketSelect);
    fireEvent.click(screen.getByText('NA'));

    const locationSelect = screen.getByRole('combobox', { name: 'Off/On' });
    fireEvent.mouseDown(locationSelect);
    fireEvent.click(screen.getByText('onsite'));

    const viewReportButton = screen.getByRole('button', { name: 'View Report' });
    expect(viewReportButton).not.toBeDisabled();
  });

  it('calls API with correct parameters when View Report is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    // Set all filters
    const practiceSelect = screen.getByRole('combobox', { name: 'Practice' });
    fireEvent.mouseDown(practiceSelect);
    fireEvent.click(screen.getByText('EPS PEGA'));

    const marketSelect = screen.getByRole('combobox', { name: 'Market' });
    fireEvent.mouseDown(marketSelect);
    fireEvent.click(screen.getByText('NA'));

    const locationSelect = screen.getByRole('combobox', { name: 'Off/On' });
    fireEvent.mouseDown(locationSelect);
    fireEvent.click(screen.getByText('onsite'));

    // Click View Report
    const viewReportButton = screen.getByRole('button', { name: 'View Report' });
    fireEvent.click(viewReportButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/dashboard/report', {
        params: {
          practice: 'EPS PEGA',
          market: 'NA',
          location: 'onsite'
        }
      });
    });
  });

  it('handles practice filter changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    const practiceSelect = screen.getByRole('combobox', { name: 'Practice' });
    fireEvent.mouseDown(practiceSelect);
    fireEvent.click(screen.getByText('EPS PEGA'));
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      practice: 'EPS PEGA',
      market: 'All',
      location: 'All'
    });
  });

  it('handles market filter changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    const marketSelect = screen.getByRole('combobox', { name: 'Market' });
    fireEvent.mouseDown(marketSelect);
    fireEvent.click(screen.getByText('NA'));
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      practice: 'All',
      market: 'NA',
      location: 'All'
    });
  });

  it('handles location filter changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    const locationSelect = screen.getByRole('combobox', { name: 'Off/On' });
    fireEvent.mouseDown(locationSelect);
    fireEvent.click(screen.getByText('onsite'));
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      practice: 'All',
      market: 'All',
      location: 'onsite'
    });
  });

  it('maintains selected values after multiple changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} onReportData={mockOnReportData} />);
    
    // Change practice
    const practiceSelect = screen.getByRole('combobox', { name: 'Practice' });
    fireEvent.mouseDown(practiceSelect);
    fireEvent.click(screen.getByText('EPS IPM'));
    
    // Change market
    const marketSelect = screen.getByRole('combobox', { name: 'Market' });
    fireEvent.mouseDown(marketSelect);
    fireEvent.click(screen.getByText('GGM'));
    
    // Change location
    const locationSelect = screen.getByRole('combobox', { name: 'Off/On' });
    fireEvent.mouseDown(locationSelect);
    fireEvent.click(screen.getByText('offshore'));
    
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      practice: 'EPS IPM',
      market: 'GGM',
      location: 'offshore'
    });
  });
});