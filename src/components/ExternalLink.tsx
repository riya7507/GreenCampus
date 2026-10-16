import React from 'react';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children, className = '', ...rest }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 transition-opacity hover:opacity-80 active:opacity-70 ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
