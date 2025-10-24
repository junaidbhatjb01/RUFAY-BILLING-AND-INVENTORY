import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '../../components/ui/Icons';
import { QuotationStatus } from '../../types';

const QuotationList: React.FC = () => {
  const { quotations, parties, settings } = useData();
  const navigate = useNavigate();

  const getPartyName = (partyId: string) => parties.find(p => p.id === partyId)?.name || 'N/A';

  const getStatusClass = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.ACCEPTED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case QuotationStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case QuotationStatus.SENT: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotations / Estimates</h1>
        <Link to="/quotations/new" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Quotation
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quote #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {quotations.sort((a,b) => b.quotationNumber - a.quotationNumber).map(quote => (
              <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/quotations/${quote.id}`)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{settings.quotationPrefix || ''}{quote.quotationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getPartyName(quote.partyId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(quote.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{settings.currency}{quote.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(quote.status)}`}>
                    {quote.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotations.length === 0 && <p className="text-center py-8 text-gray-500">No quotations found.</p>}
      </div>
    </div>
  );
};

export default QuotationList;