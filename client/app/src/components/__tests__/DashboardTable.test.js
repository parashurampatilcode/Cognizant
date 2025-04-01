import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardTable from '../DashboardTable';
import * as XLSX from 'xlsx';
import * as htmlToImage from 'html-to-image';

// Mock the external dependencies
jest.mock('xlsx');
jest.mock('html-to-image');
jest.mock('../../services/dashboardApi', () => ({
  getDashboardSummary: jest.fn().mockResolvedValue([
    { id: 1, name: 'Test Data 1', value: 100 },
    { id: 2, name: 'Test Data 2', value: 200 },
  ]),
}));

describe('DashboardTable', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it('renders export buttons', () => {
    render(<DashboardTable />);
    expect(screen.getByTitle('Export Excel')).toBeInTheDocument();
    expect(screen.getByTitle('Export Image')).toBeInTheDocument();
    expect(screen.getByTitle('Copy Data')).toBeInTheDocument();
  });

  it('handles Excel export', () => {
    render(<DashboardTable />);
    const exportButton = screen.getByTitle('Export Excel');
    fireEvent.click(exportButton);
    
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();
  });

  it('handles image export', async () => {
    htmlToImage.toPng.mockResolvedValue('data:image/png;base64,fake-image-data');
    
    render(<DashboardTable />);
    const exportImageButton = screen.getByTitle('Export Image');
    fireEvent.click(exportImageButton);
    
    expect(htmlToImage.toPng).toHaveBeenCalled();
  });

  it('handles copy data', async () => {
    // Mock document.execCommand as fallback
    document.execCommand = jest.fn();
    
    render(<DashboardTable />);
    const copyButton = screen.getByTitle('Copy Data');
    await fireEvent.click(copyButton);
    
    // Check if either clipboard API or execCommand was used
    expect(
      navigator.clipboard.writeText.mock.calls.length +
      document.execCommand.mock.calls.length
    ).toBeGreaterThan(0);
  });
});

