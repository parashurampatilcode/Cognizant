import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterControls from '../FilterControls';

describe('FilterControls', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders with default selections', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);
    
    // Check if all view type buttons are present
    expect(screen.getByRole('button', { name: 'practice view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'na view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ggm view' })).toBeInTheDocument();

    // Check if location dropdown is present with default value
    expect(screen.getByRole('combobox', { name: 'Location filter' })).toHaveTextContent('All');
  });

  it('handles view type changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);
    
    // Click NA View button
    fireEvent.click(screen.getByRole('button', { name: 'na view' }));
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      viewType: 'NA View',
      location: 'All'
    });
  });

  it('handles location changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);
    
    // Open dropdown and select Onsite
    const combobox = screen.getByRole('combobox', { name: 'Location filter' });
    fireEvent.mouseDown(combobox);
    fireEvent.click(screen.getByText('Onsite'));
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      viewType: 'Practice',
      location: 'Onsite'
    });
  });

  it('maintains selected values after multiple changes', () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);
    
    // Change view type to GGM View
    fireEvent.click(screen.getByRole('button', { name: 'ggm view' }));
    
    // Change location to Offshore
    const combobox = screen.getByRole('combobox', { name: 'Location filter' });
    fireEvent.mouseDown(combobox);
    fireEvent.click(screen.getByText('Offshore'));
    
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      viewType: 'GGM View',
      location: 'Offshore'
    });
  });
});
