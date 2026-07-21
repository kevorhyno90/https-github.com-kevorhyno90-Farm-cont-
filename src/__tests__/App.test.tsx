import React from 'react';
import { render, screen } from '@testing-library/react';
import { FarmProvider } from '../context/FarmContext';

// Simple test to ensure the FarmProvider mounts without crashing
describe('FarmContext', () => {
  it('renders children with context', () => {
    render(
      <FarmProvider>
        <div data-testid="test-child">Child Component</div>
      </FarmProvider>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
