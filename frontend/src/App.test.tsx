import { render, screen } from '@testing-library/react';
import App from './App';

declare const test: any;
declare const expect: any;

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
