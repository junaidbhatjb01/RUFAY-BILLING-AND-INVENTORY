
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '../../components/ui/Icons';
import { SalesOrderStatus } from '../../types';

const SalesOrderList: React.FC = () => {
  const { salesOrders, parties, settings } = useData();
  const navigate = useNavigate();

  const getPartyName = (partyId: string) => parties.find(p => p.id === partyId)?.name || 'N/A';
  
  const getStatusClass = (status: SalesOrderStatus) => {
    switch (status) {
      case SalesOrderStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case SalesOrderStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case SalesOrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <Link to="/sales-orders/new" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Sales Order
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">SO #</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {salesOrders.sort((a,b) => b.salesOrderNumber - a.salesOrderNumber).map(so => (
              <tr key={so.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/sales-orders/${so.id}`)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">SO-{so.salesOrderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getPartyName(so.partyId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(so.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{settings.currency}{so.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(so.status)}`}>
                    {so.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {salesOrders.length === 0 && <p className="text-center py-8 text-gray-500">No sales orders found.</p>}
      </div>
    </div>
  );
};

export default SalesOrderList;
