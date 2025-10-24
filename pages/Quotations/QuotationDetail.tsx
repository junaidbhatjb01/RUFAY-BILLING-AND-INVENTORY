import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { QuotationStatus, SalesOrderStatus } from '../../types';

const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotations, parties, settings } = useData();
  const quotation = quotations.find(q => q.id === id);

  if (!quotation) {
    return <div className="text-center text-red-500">Quotation not found.</div>;
  }

  const party = parties.find(p => p.id === quotation.partyId);

  const handleConvertToSalesOrder = () => {
    navigate('/sales-orders/new', { state: { quotation } });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Quotation #{settings.quotationPrefix || ''}{quotation.quotationNumber}</h1>
            <div className="flex gap-2">
                 {quotation.status !== QuotationStatus.ACCEPTED && (
                    <button 
                        onClick={handleConvertToSalesOrder} 
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Convert to Sales Order
                    </button>
                 )}
            </div>
        </div>
        
        {/* Details Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div><strong>Customer:</strong> {party?.name}</div>
            <div><strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}</div>
            <div><strong>Status:</strong> {quotation.status}</div>
            <div><strong>Valid Until:</strong> {new Date(quotation.validUntil).toLocaleDateString()}</div>
        </div>

        {/* Items Table */}
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
                {quotation.items.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2 text-right">{settings.currency}{item.rate.toFixed(2)}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{settings.currency}{(item.rate * item.quantity).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Grand Total */}
        <div className="text-right text-xl font-bold">
            Grand Total: {settings.currency}{quotation.total.toFixed(2)}
        </div>
    </div>
  );
};

export default QuotationDetail;