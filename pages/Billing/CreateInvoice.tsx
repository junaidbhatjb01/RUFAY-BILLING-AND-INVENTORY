import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Invoice, InvoiceItem, PartyType, PaymentStatus, Product, Party, Payment, PaymentType, SalesOrder, SalesOrderStatus } from '../../types';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '../../components/ui/Icons';
import PartyModal from '../../components/modals/PartyModal';
import ProductModal from '../../components/modals/ProductModal';

const CreateInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { parties, addParty, products, addProduct, settings, addInvoice, addPayment, updateSalesOrderStatus } = useData();
  
  const fromSalesOrder: SalesOrder | undefined = location.state?.salesOrder;

  const isEditing = id !== undefined;
  // Note: Editing logic would need to be updated to use the new API-centric context functions.
  const existingInvoice = null; 

  const [partyId, setPartyId] = useState(fromSalesOrder?.partyId || existingInvoice?.partyId || '');
  const [date, setDate] = useState(existingInvoice?.date || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>(fromSalesOrder?.items || existingInvoice?.items || [{ productId: '', productName: '', rate: 0, quantity: 1, discount: 0 }]);
  const [tax, setTax] = useState(fromSalesOrder?.tax || existingInvoice?.tax || 0);
  
  const [amountPaidNow, setAmountPaidNow] = useState(0);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [paymentNotes, setPaymentNotes] = useState('');

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [addingProductIndex, setAddingProductIndex] = useState<number | null>(null);

  const customers = parties.filter(p => p.type === PartyType.CUSTOMER);

  const handleItemChange = <K extends keyof InvoiceItem,>(index: number, field: K, value: InvoiceItem[K]) => {
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
  
  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => {
      const itemTotal = item.rate * item.quantity;
      const discountAmount = itemTotal * (item.discount / 100);
      return acc + (itemTotal - discountAmount);
    }, 0);
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const { total } = calculateTotals();

  const handleSaveCustomer = async (newPartyData: Omit<Party, 'id'>) => {
    const newParty = await addParty(newPartyData);
    setPartyId(newParty.id);
    setIsCustomerModalOpen(false);
  };

  const openAddProductModal = (index: number) => {
    setAddingProductIndex(index);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (newProductData: Omit<Product, 'id'>) => {
    await addProduct(newProductData);
    setIsProductModalOpen(false);
    setAddingProductIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId || items.some(item => !item.productId || item.quantity <= 0)) {
        alert("Please fill all required fields: Customer and at least one valid item.");
        return;
    }

    const finalTotal = calculateTotals().total;
    let status = PaymentStatus.UNPAID;
    if (amountPaidNow > 0) {
        status = amountPaidNow >= finalTotal ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    }

    try {
        const newInvoiceData: Omit<Invoice, 'id' | 'invoiceNumber'> = {
            partyId,
            date,
            items,
            tax,
            total: finalTotal,
            amountPaid: amountPaidNow,
            status: status,
        };

        const newInvoice = await addInvoice(newInvoiceData, fromSalesOrder?.id);
        
        // TODO: Update stock logic to be API-driven
        
        if (amountPaidNow > 0) {
            await addPayment({
                partyId,
                invoiceId: newInvoice.id,
                amount: amountPaidNow,
                date,
                type: paymentType,
                direction: 'in',
                notes: paymentNotes,
            });
        }
        
        navigate('/invoices');
    } catch (error) {
        console.error("Failed to create invoice:", error);
        alert("Error: Could not create invoice.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
       {fromSalesOrder && <p className="mb-4 p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm">Converted from Sales Order #{fromSalesOrder.salesOrderNumber}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
            <div className="flex items-center gap-2 mt-1">
              <select id="customer" value={partyId} onChange={e => setPartyId(e.target.value)} required className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                <option value="">Select a customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-300 p-2 rounded-md hover:bg-teal-200 dark:hover:bg-teal-700">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2 border-t pt-4 dark:border-gray-700">Items</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded bg-gray-50 dark:bg-gray-700">
                <div className="col-span-4 flex items-center gap-1">
                    <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm">
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button type="button" onClick={() => openAddProductModal(index)} className="text-teal-500 p-1 rounded-full hover:bg-teal-100 dark:hover:bg-teal-700 flex-shrink-0">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="col-span-2"><input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value))} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm py-2 px-3 text-sm" /></div>
                <div className="col-span-2"><input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm py-2 px-3 text-sm" /></div>
                <div className="col-span-2"><input type="number" placeholder="Discount %" value={item.discount} onChange={e => handleItemChange(index, 'discount', parseFloat(e.target.value))} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm py-2 px-3 text-sm" /></div>
                <div className="col-span-1 text-right text-sm">
                   {settings.currency}{((item.rate * item.quantity) * (1 - item.discount / 100)).toFixed(2)}
                </div>
                <div className="col-span-1">
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="mt-4 flex items-center text-sm text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200">
          <PlusIcon className="w-4 h-4 mr-1" /> Add Item
        </button>
        {/* Totals and payment sections are visually similar */}
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={() => navigate('/invoices')} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">{isEditing ? 'Update' : 'Save'} Invoice</button>
        </div>
      </form>
      <PartyModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={(data) => handleSaveCustomer({ ...data, type: PartyType.CUSTOMER })}
        party={null}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(data) => handleSaveProduct(data)}
        product={null}
      />
    </div>
  );
};

export default CreateInvoice;