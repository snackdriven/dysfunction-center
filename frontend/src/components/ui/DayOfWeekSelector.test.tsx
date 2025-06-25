import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayOfWeekSelector, useDayOfWeekSelector, type DayOfWeek } from './DayOfWeekSelector';

describe('DayOfWeekSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all days of the week', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('displays selected days correctly', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday', 'wednesday', 'friday']}
        onChange={mockOnChange}
      />
    );

    const mondayButton = screen.getByLabelText(/monday.*selected/i);
    const wednesdayButton = screen.getByLabelText(/wednesday.*selected/i);
    const fridayButton = screen.getByLabelText(/friday.*selected/i);
    const tuesdayButton = screen.getByLabelText(/tuesday.*not selected/i);

    expect(mondayButton).toHaveAttribute('aria-pressed', 'true');
    expect(wednesdayButton).toHaveAttribute('aria-pressed', 'true');
    expect(fridayButton).toHaveAttribute('aria-pressed', 'true');
    expect(tuesdayButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a day is clicked', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday']}
        onChange={mockOnChange}
      />
    );

    const tuesdayButton = screen.getByLabelText(/tuesday/i);
    fireEvent.click(tuesdayButton);

    expect(mockOnChange).toHaveBeenCalledWith(['monday', 'tuesday']);
  });

  it('removes day when clicked if already selected', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday', 'tuesday']}
        onChange={mockOnChange}
      />
    );

    const mondayButton = screen.getByLabelText(/monday.*selected/i);
    fireEvent.click(mondayButton);

    expect(mockOnChange).toHaveBeenCalledWith(['tuesday']);
  });

  it('shows quick selection buttons by default', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('All Days')).toBeInTheDocument();
    expect(screen.getByText('Weekdays')).toBeInTheDocument();
    expect(screen.getByText('Weekends')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('hides quick selection buttons when showSelectAll is false', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
        showSelectAll={false}
      />
    );

    expect(screen.queryByText('All Days')).not.toBeInTheDocument();
    expect(screen.queryByText('Weekdays')).not.toBeInTheDocument();
  });

  it('selects all days when "All Days" is clicked', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
      />
    );

    const allDaysButton = screen.getByText('All Days');
    fireEvent.click(allDaysButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ]);
  });

  it('selects weekdays when "Weekdays" is clicked', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
      />
    );

    const weekdaysButton = screen.getByText('Weekdays');
    fireEvent.click(weekdaysButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
    ]);
  });

  it('selects weekends when "Weekends" is clicked', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
      />
    );

    const weekendsButton = screen.getByText('Weekends');
    fireEvent.click(weekendsButton);

    expect(mockOnChange).toHaveBeenCalledWith(['saturday', 'sunday']);
  });

  it('clears selection when "Clear" is clicked', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday', 'tuesday']}
        onChange={mockOnChange}
      />
    );

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('shows selection summary', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday', 'wednesday', 'friday']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/3 days \(Mon, Wed, Fri\)/)).toBeInTheDocument();
  });

  it('shows "Every day" for all days selected', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Every day/)).toBeInTheDocument();
  });

  it('shows "Weekdays only" for weekday selection', () => {
    render(
      <DayOfWeekSelector
        selectedDays={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Weekdays only/)).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const mondayButton = screen.getByLabelText(/monday/i);
    expect(mondayButton).toBeDisabled();

    fireEvent.click(mondayButton);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders with label and description', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
        label="Select Days"
        description="Choose which days to track this habit"
      />
    );

    expect(screen.getByText('Select Days')).toBeInTheDocument();
    expect(screen.getByText('Choose which days to track this habit')).toBeInTheDocument();
  });

  it('uses compact variant correctly', () => {
    render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
        variant="compact"
      />
    );

    // In compact mode, only first letter should show
    expect(screen.getByText('M')).toBeInTheDocument(); // Monday
    // Since T appears for both Tuesday and Thursday, check for multiple T's
    expect(screen.getAllByText('T')).toHaveLength(2); // Tuesday and Thursday
  });

  it('supports different sizes', () => {
    const { rerender } = render(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
        size="sm"
      />
    );

    let mondayButton = screen.getByLabelText(/monday/i);
    expect(mondayButton).toHaveClass('h-8', 'w-8');

    rerender(
      <DayOfWeekSelector
        selectedDays={[]}
        onChange={mockOnChange}
        size="lg"
      />
    );

    mondayButton = screen.getByLabelText(/monday/i);
    expect(mondayButton).toHaveClass('h-12', 'w-12');
  });
});

describe('useDayOfWeekSelector hook', () => {
  function TestComponent({ initialDays }: { initialDays?: DayOfWeek[] }) {
    const {
      selectedDays,
      selectPattern,
      toggleDay,
      isSelected,
      getSelectedCount,
      getPatternName
    } = useDayOfWeekSelector(initialDays);

    return (
      <div>
        <div data-testid="selected-days">{JSON.stringify(selectedDays)}</div>
        <div data-testid="selected-count">{getSelectedCount()}</div>
        <div data-testid="pattern-name">{getPatternName()}</div>
        <button onClick={() => selectPattern('weekdays')}>Select Weekdays</button>
        <button onClick={() => toggleDay('monday')}>Toggle Monday</button>
        <div data-testid="monday-selected">{isSelected('monday').toString()}</div>
      </div>
    );
  }

  it('initializes with provided days', () => {
    render(<TestComponent initialDays={['monday', 'friday']} />);

    expect(screen.getByTestId('selected-days')).toHaveTextContent('["monday","friday"]');
    expect(screen.getByTestId('selected-count')).toHaveTextContent('2');
  });

  it('toggles day selection', () => {
    render(<TestComponent initialDays={[]} />);

    expect(screen.getByTestId('monday-selected')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Toggle Monday'));
    expect(screen.getByTestId('monday-selected')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Toggle Monday'));
    expect(screen.getByTestId('monday-selected')).toHaveTextContent('false');
  });

  it('selects pattern correctly', () => {
    render(<TestComponent initialDays={[]} />);

    fireEvent.click(screen.getByText('Select Weekdays'));
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Weekdays');
    expect(screen.getByTestId('selected-count')).toHaveTextContent('5');
  });

  it('recognizes pattern names correctly', () => {
    const { rerender } = render(<TestComponent initialDays={[]} />);
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('None');

    rerender(<TestComponent initialDays={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']} />);
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Weekdays');

    rerender(<TestComponent initialDays={['saturday', 'sunday']} />);
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Weekends');

    rerender(<TestComponent initialDays={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']} />);
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Every day');

    rerender(<TestComponent initialDays={['monday']} />);
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Monday');

    rerender(<TestComponent initialDays={['monday', 'wednesday']} />);
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Custom');
  });
});