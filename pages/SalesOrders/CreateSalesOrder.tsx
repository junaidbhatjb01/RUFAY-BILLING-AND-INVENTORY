import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { InvoiceItem, PartyType, SalesOrder, SalesOrderStatus, Quotation, QuotationStatus } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateSalesOrder: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { parties, addSalesOrder, updateQuotationStatus } = useData();

    const fromQuotation: Quotation | undefined = location.state?.quotation;

    const [partyId, setPartyId] = useState(fromQuotation?.partyId || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<InvoiceItem[]>(fromQuotation?.items || []);
    const [tax, setTax] = useState(fromQuotation?.tax || 0);

    const customers = parties.filter(p => p.type === PartyType.CUSTOMER);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const total = items.reduce((sum, item) => {
             const itemTotal = item.rate * item.quantity;
             const discountAmount = itemTotal * (item.discount / 100);
             return sum + (itemTotal - discountAmount);
        }, 0) * (1 + tax / 100);
        
        const newSalesOrderData: Omit<SalesOrder, 'id' | 'salesOrderNumber'> = {
            partyId,
            date,
            items,
            tax,
            total,
            status: SalesOrderStatus.PENDING,
            quotationId: fromQuotation?.id,
        };
        try {
            await addSalesOrder(newSalesOrderData);
            navigate('/sales-orders');
        } catch (error) {
            alert("Failed to create sales order.");
        }
    };

    // The form would be very similar to CreateQuotation.tsx
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Create Sales Order</h1>
            {fromQuotation && <p className="mb-4 p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm">Converted from Quotation #Q-{fromQuotation.quotationNumber}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                     <label>Customer</label>
                     <select value={partyId} onChange={e => setPartyId(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded p-2">
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                </div>
                 {/* Item display and totals would go here, pre-filled if converting */}
                 <div className="pt-4 flex justify-end">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Sales Order</button>
                </div>
            </form>
        </div>
    );
};

export default CreateSalesOrder;