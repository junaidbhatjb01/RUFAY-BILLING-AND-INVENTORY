import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Payment, PaymentType, Invoice, PaymentStatus, Party } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../../components/ui/Icons';

const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (payment: Payment, originalPayment: Payment | null) => void;
    payment: Payment | null;
}> = ({ isOpen, onClose, onSave, payment: editingPayment }) => {
    const { parties, invoices, settings } = useData();
    const [partyId, setPartyId] = useState(editingPayment?.partyId || '');
    const [invoiceId, setInvoiceId] = useState(editingPayment?.invoiceId || '');
    const [amount, setAmount] = useState(editingPayment?.amount || 0);
    const [date, setDate] = useState(editingPayment?.date || new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<PaymentType>(editingPayment?.type || PaymentType.CASH);
    const [direction, setDirection] = useState<'in' | 'out'>(editingPayment?.direction || 'in');
    const [notes, setNotes] = useState(editingPayment?.notes || '');

    useEffect(() => {
        if (editingPayment) {
            setPartyId(editingPayment.partyId);
            setInvoiceId(editingPayment.invoiceId || '');
            setAmount(editingPayment.amount);
            setDate(editingPayment.date);
            setType(editingPayment.type);
            setDirection(editingPayment.direction);
            setNotes(editingPayment.notes || '');
        } else {
            // Reset form
            setPartyId(''); setInvoiceId(''); setAmount(0); setDate(new Date().toISOString().split('T')[0]);
            setType(PaymentType.CASH); setDirection('in'); setNotes('');
        }
    }, [editingPayment]);

    const availableInvoices = useMemo(() => {
        if (!partyId) return [];
        return invoices.filter(inv =>
            inv.partyId === partyId && (inv.status === PaymentStatus.UNPAID || inv.status === PaymentStatus.PARTIAL)
        );
    }, [partyId, invoices]);
    
    const selectedInvoice = useMemo(() => invoices.find(inv => inv.id === invoiceId), [invoiceId, invoices]);
    const balanceDue = selectedInvoice ? selectedInvoice.total - selectedInvoice.amountPaid : 0;

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!partyId || amount <= 0) {
            alert("Please select a party and enter a valid amount.");
            return;
        }
        onSave({ 
            id: editingPayment?.id || Date.now().toString(), 
            partyId, invoiceId: invoiceId || undefined, amount, date, type, direction, notes 
        }, editingPayment);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{editingPayment ? 'Edit Payment' : 'Add New Payment'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Party</label>
                        <select value={partyId} onChange={e => setPartyId(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1">
                            <option value="">Select Party</option>
                            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Direction</label>
                            <select value={direction} onChange={e => setDirection(e.target.value as 'in' | 'out')} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1">
                                <option value="in">Payment In</option>
                                <option value="out">Payment Out</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Amount</label>
                        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1" />
                        {selectedInvoice && <p className="text-xs text-yellow-600 mt-1">Invoice Balance: {balanceDue.toFixed(2)}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Payment Type</label>
                        <select value={type} onChange={e => setType(e.target.value as PaymentType)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1">
                            {Object.values(PaymentType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Link to Invoice (Optional)</label>
                        <select value={invoiceId} onChange={e => setInvoiceId(e.target.value)} disabled={!partyId || direction === 'out'} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 disabled:bg-gray-200 dark:disabled:bg-gray-600">
                            <option value="">None</option>
                            {availableInvoices.map(inv => <option key={inv.id} value={inv.id}>{settings.invoicePrefix || ''}{inv.invoiceNumber} ({inv.total - inv.amountPaid} due)</option>)}
                        </select>
                    </div>
                    <textarea placeholder="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PaymentList: React.FC = () => {
    // FIX: Replaced `setPayments` and `setInvoices` with context action functions
    const { payments, addPayment, updatePayment, deletePayment, parties, invoices, settings } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    
    const getPartyName = (partyId: string) => parties.find(p => p.id === partyId)?.name || 'N/A';

    const handleSavePayment = async (payment: Payment, originalPayment: Payment | null) => {
        if (originalPayment) {
            await updatePayment(payment, originalPayment);
        } else {
            const { id, ...paymentData } = payment;
            await addPayment(paymentData);
        }
        setEditingPayment(null);
    };

    const handleDelete = (paymentId: string) => {
        const paymentToDelete = payments.find(p => p.id === paymentId);
        if (paymentToDelete && window.confirm("Are you sure? This will update any linked invoice.")) {
            deletePayment(paymentToDelete);
        }
    };

    const openEditModal = (payment: Payment) => {
        setEditingPayment(payment);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingPayment(null);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Payments</h1>
                <button onClick={openAddModal} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Payment
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Party</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{getPartyName(p.partyId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.type} {p.invoiceId && `(${(settings.invoicePrefix || '')}${invoices.find(i=>i.id===p.invoiceId)?.invoiceNumber})`}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${p.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                    {p.direction === 'in' ? '+' : '-'} {settings.currency}{p.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(p)} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 mr-4"><EditIcon className="w-5 h-5 inline" /></button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && <p className="text-center py-8 text-gray-500">No payments recorded yet.</p>}
            </div>

            <PaymentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePayment}
                payment={editingPayment}
            />
        </div>
    );
};

export default PaymentList;