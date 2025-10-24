import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { SalesOrderStatus } from '../../types';

const SalesOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { salesOrders, parties, settings } = useData();
  const salesOrder = salesOrders.find(so => so.id === id);

  if (!salesOrder) {
    return <div className="text-center text-red-500">Sales Order not found.</div>;
  }

  const party = parties.find(p => p.id === salesOrder.partyId);

  const handleConvertToInvoice = () => {
    navigate('/invoices/new', { state: { salesOrder } });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Sales Order #SO-{salesOrder.salesOrderNumber}</h1>
            <div className="flex gap-2">
                 {salesOrder.status !== SalesOrderStatus.COMPLETED && (
                    <button 
                        onClick={handleConvertToInvoice} 
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Convert to Invoice
                    </button>
                 )}
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div><strong>Customer:</strong> {party?.name}</div>
            <div><strong>Date:</strong> {new Date(salesOrder.date).toLocaleDateString()}</div>
            <div><strong>Status:</strong> {salesOrder.status}</div>
            {salesOrder.quotationId && <div><strong>From Quote:</strong> Q-{salesOrder.quotationId}</div>}
        </div>

        <table className="w-full mb-6">
            <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {salesOrder.items.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2 text-right">{settings.currency}{item.rate.toFixed(2)}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{settings.currency}{(item.rate * item.quantity).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <div className="text-right text-xl font-bold">
            Grand Total: {settings.currency}{salesOrder.total.toFixed(2)}
        </div>
    </div>
  );
};

export default SalesOrderDetail;