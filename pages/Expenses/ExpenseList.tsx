
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Expense } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../../components/ui/Icons';

const ExpenseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Expense) => void;
    expense: Expense | null;
}> = ({ isOpen, onClose, onSave, expense }) => {
    const [category, setCategory] = useState(expense?.category || '');
    const [amount, setAmount] = useState(expense?.amount || 0);
    const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(expense?.description || '');

    React.useEffect(() => {
        if (expense) {
            setCategory(expense.category); setAmount(expense.amount); setDate(expense.date); setDescription(expense.description);
        } else {
            setCategory(''); setAmount(0); setDate(new Date().toISOString().split('T')[0]); setDescription('');
        }
    }, [expense]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: expense?.id || Date.now().toString(), category, amount, date, description });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="text" placeholder="Category (e.g., Rent, Salary)" value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ExpenseList: React.FC = () => {
    // FIX: Replaced `setExpenses` with context action functions
    const { expenses, addExpense, updateExpense, deleteExpense, settings } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const handleSaveExpense = async (expense: Expense) => {
        if (editingExpense) {
            // FIX: Use context function to update
            await updateExpense(expense);
        } else {
            // FIX: Use context function to add
            const { id, ...expenseData } = expense;
            await addExpense(expenseData);
        }
        setEditingExpense(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure?")) {
            // FIX: Use context function to delete
            deleteExpense(id);
        }
    };
    
    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Expenses</h1>
                    <p className="text-gray-500 dark:text-gray-400">Total Expenses: {settings.currency}{totalExpenses.toFixed(2)}</p>
                </div>
                <button onClick={openAddModal} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Expense
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                            <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{expense.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{settings.currency}{expense.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{expense.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(expense)} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 mr-4"><EditIcon className="w-5 h-5 inline" /></button>
                                    <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {expenses.length === 0 && <p className="text-center py-8 text-gray-500">No expenses recorded yet.</p>}
            </div>

            <ExpenseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveExpense}
                expense={editingExpense}
            />
        </div>
    );
};

export default ExpenseList;
