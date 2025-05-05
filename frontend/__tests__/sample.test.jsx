import React from 'react';
import { render, screen } from '@testing-library/react';
import { test, expect } from '@jest/globals';

const SimpleComponent = () => <div>Hello, World!</div>;

test('renders SimpleComponent', () => {
  render(<SimpleComponent />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});