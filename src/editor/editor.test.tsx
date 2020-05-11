import React from 'react';
import { render } from '@testing-library/react';
import Editor from './editor';

test('renders learn react link', () => {
  const { getByText } = render(<Editor />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
