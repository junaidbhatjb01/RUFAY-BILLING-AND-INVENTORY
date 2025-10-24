
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { InvoiceItem, PartyType, Quotation, QuotationStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '../../components/ui/Icons';

const CreateQuotation: React.FC = () => {
    const navigate = useNavigate();
    const { parties, products, addQuotation, settings } = useData();
    
    const [partyId, setPartyId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default 30 days validity
    const [items, setItems] = useState<InvoiceItem[]>([{ productId: '', productName: '', rate: 0, quantity: 1, discount: 0 }]);
    const [tax, setTax] = useState(0);

    const customers = parties.filter(p => p.type === PartyType.CUSTOMER);

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = items.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'productId') {
                    const product = products.find(p => p.id === String(value));
                    if (product) {
                        updatedItem.productName = product.name;
                        updatedItem.rate = product.sellingPrice;
                    }
                }
                return updatedItem;
            }
            return item;
        });
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { productId: '', productName: '', rate: 0, quantity: 1, discount: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const calculateTotal = () => {
        const subtotal = items.reduce((acc, item) => {
            const itemTotal = item.rate * item.quantity;
            const discountAmount = itemTotal * (item.discount / 100);
            return acc + (itemTotal - discountAmount);
        }, 0);
        const taxAmount = subtotal * (tax / 100);
        return subtotal + taxAmount;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const total = calculateTotal();
        const newQuotationData: Omit<Quotation, 'id' | 'quotationNumber'> = {
            partyId,
            date,
            validUntil,
            items,
            tax,
            total,
            status: QuotationStatus.DRAFT,
        };
        try {
            await addQuotation(newQuotationData);
            navigate('/quotations');
        } catch (error) {
            console.error("Failed to create quotation:", error);
            alert("Error: could not create quotation.");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Create New Quotation</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Customer and Date selectors similar to CreateInvoice */}
                <div>
                     <label>Customer</label>
                     <select value={partyId} onChange={e => setPartyId(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded p-2">
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white dark:bg-gray-700 border rounded p-2"/></div>
                    <div><label>Valid Until</label><input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-white dark:bg-gray-700 border rounded p-2"/></div>
                </div>

                {/* Items Section */}
                <h2 className="text-lg font-semibold border-t pt-4 dark:border-gray-700">Items</h2>
                 {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="flex-grow bg-white dark:bg-gray-600 border rounded p-2">
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(index, 'rate', Number(e.target.value))} className="w-24 bg-white dark:bg-gray-600 border rounded p-2" />
                        <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-20 bg-white dark:bg-gray-600 border rounded p-2" />
                        <button type="button" onClick={() => removeItem(index)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="text-teal-600 flex items-center"><PlusIcon className="w-4 h-4 mr-1"/>Add Item</button>

                {/* Total Section */}
                 <div className="text-right font-bold text-xl">Total: {settings.currency}{calculateTotal().toFixed(2)}</div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/quotations')} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Quotation</button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuotation;
