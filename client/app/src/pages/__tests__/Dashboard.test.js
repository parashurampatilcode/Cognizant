import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Mock the child components
jest.mock('../../components/DashboardTable', () => {
  const MockDashboardTable = jest.fn(({ filters }, ref) => {
    React.useImperativeHandle(ref, () => ({
      refresh: jest.fn(),
    }));
    return <div data-testid="mock-dashboard-table">Dashboard Table</div>;
  });
  return React.forwardRef(MockDashboardTable);
});

jest.mock('../../components/FilterControls', () => {
  return function MockFilterControls({ onFilterChange }) {
    return <div data-testid="mock-filter-controls">Filter Controls</div>;
  };
});

describe('Dashboard', () => {
  it('renders dashboard components', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('View Report Data')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dashboard-table')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filter-controls')).toBeInTheDocument();
  });

  it('refreshes table data when View Report Data button is clicked', async () => {
    const mockRefresh = jest.fn();
    const { container } = render(<Dashboard />);
    
    // Mock the tableRef.current.refresh function
    const tableRef = {
      current: {
        refresh: mockRefresh
      }
    };
    
    // Get the button and click it
    const button = screen.getByText('View Report Data');
    fireEvent.click(button);

    // Verify the refresh was attempted
    expect(mockRefresh).toHaveBeenCalled();
  });
});