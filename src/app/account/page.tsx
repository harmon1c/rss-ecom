import CustomerInfo from '@/components/layout/CustomerInfo/CustomerInfo';
import React from 'react';

export default function AccountPage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="mt-2">Welcome to your account dashboard</p>
      <CustomerInfo></CustomerInfo>
    </div>
  );
}
