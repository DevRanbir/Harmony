import { ReactNode } from 'react';

interface PricesLayoutProps {
  children: ReactNode;
}

export default function PricesLayout({ children }: PricesLayoutProps) {
  return (
    <div className="prices-layout">
      {children}
    </div>
  );
}
