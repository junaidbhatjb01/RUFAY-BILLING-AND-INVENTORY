
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Invoice, PaymentStatus } from '../../types';

const PartyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { parties, invoices, settings } = useData();
  const navigate = useNavigate();

  const party = parties.find(p => p.id === id);
  const partyInvoices = useMemo(() => invoices.filter(inv => inv.partyId === id).sort((a,b) => b.invoiceNumber - a.invoiceNumber), [invoices, id]);
  
  const balance = useMemo(() => {
    return partyInvoices.reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);
  }, [partyInvoices]);

  if (!party) {
    return <div className="text-center text-red-500">Party not found.</div>;
  }
  
  const getStatusClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case PaymentStatus.UNPAID: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case PaymentStatus.PARTIAL: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6 border-b pb-4 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold">{party.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{party.phone}</p>
          <p className="text-gray-500 dark:text-gray-400">{party.address}</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-500 dark:text-gray-400">Total Balance</p>
          <p className={`text-3xl font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>{settings.currency}{balance.toFixed(2)}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {partyInvoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">INV-{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(invoice.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{settings.currency}{invoice.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500">{settings.currency}{(invoice.total-invoice.amountPaid).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                    {invoice.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {partyInvoices.length === 0 && <p className="text-center py-8 text-gray-500">No transactions found for this party.</p>}
      </div>
    </div>
  );
};

export default PartyDetail;