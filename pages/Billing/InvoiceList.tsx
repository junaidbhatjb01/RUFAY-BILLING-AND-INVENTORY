import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';
import { PaymentStatus } from '../../types';

const InvoiceList: React.FC = () => {
  const { invoices, deleteInvoice, parties, settings } = useData();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleClearFilters = () => {
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(invoice => {
        if (statusFilter === 'All') return true;
        return invoice.status === statusFilter;
      })
      .filter(invoice => {
        // Using string comparison for 'YYYY-MM-DD' is reliable and avoids timezone issues.
        if (startDate && invoice.date < startDate) return false;
        if (endDate && invoice.date > endDate) return false;
        return true;
      })
      .sort((a, b) => b.invoiceNumber - a.invoiceNumber);
  }, [invoices, statusFilter, startDate, endDate]);

  const getPartyName = (partyId: string) => {
    return parties.find(p => p.id === partyId)?.name || 'N/A';
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      deleteInvoice(id);
    }
  };
  
  const getStatusClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case PaymentStatus.UNPAID: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case PaymentStatus.PARTIAL: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const statusOptions: (PaymentStatus | 'All')[] = ['All', PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.PARTIAL];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link to="/invoices/new" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Invoice
        </Link>
      </div>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm font-medium mr-3">Status:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {statusOptions.map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 first:rounded-l-lg last:rounded-r-lg transition-colors duration-150 ${statusFilter === status ? 'bg-teal-600 text-white z-10' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
             <label htmlFor="startDate" className="text-sm font-medium">From:</label>
             <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
          </div>
          <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-sm font-medium">To:</label>
              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
          </div>
          <button onClick={handleClearFilters} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Clear Filters</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{settings.invoicePrefix || ''}{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getPartyName(invoice.partyId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(invoice.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{settings.currency}{invoice.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                    {invoice.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={e => e.stopPropagation()}>
                  <Link to={`/invoices/${invoice.id}/edit`} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 mr-4"><EditIcon className="w-5 h-5 inline" /></Link>
                  <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInvoices.length === 0 && <p className="text-center py-8 text-gray-500">No invoices match the current filters.</p>}
      </div>
    </div>
  );
};

export default InvoiceList;