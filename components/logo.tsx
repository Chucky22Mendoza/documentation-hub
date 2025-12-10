import React from 'react';

export function Logo({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12 20.7 7" />
      <path d="M12 22V12" />
      <path d="m3.3 17 8.7-5" />
      <path d="m12 12 8.7 5" />

      {/* Abstract document lines inside segments */}
      <path d="M12 3.5 16 6" opacity="0.5" />
      <path d="M8 6 12 3.5" opacity="0.5" />
    </svg>
  );
}
