import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    };
  };
});

test('renders Executive Dysfunction Center title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Executive Dysfunction Center/i);
  expect(titleElement).toBeInTheDocument();
});
