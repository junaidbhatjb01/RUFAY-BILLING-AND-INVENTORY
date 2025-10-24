
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Party, PartyType } from '../../types';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';
import { useNavigate } from 'react-router-dom';
import PartyModal from '../../components/modals/PartyModal';

const PartyList: React.FC = () => {
    // FIX: Replaced `setParties` with specific action functions from the context
    const { parties, addParty, updateParty, deleteParty, invoices, settings } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<Party | null>(null);
    const navigate = useNavigate();

    const partyBalances = useMemo(() => {
        const balances: { [key: string]: number } = {};
        parties.forEach(p => balances[p.id] = 0);
        
        invoices.forEach(inv => {
            if (balances[inv.partyId] !== undefined) {
                balances[inv.partyId] += (inv.total - inv.amountPaid);
            }
        });
        return balances;
    }, [parties, invoices]);


    const handleSaveParty = async (party: Party) => {
        if (editingParty) {
            // FIX: Use context function to update
            await updateParty(party);
        } else {
            // FIX: Use context function to add. The modal creates a temp ID we can ignore.
            const { id, ...partyData } = party;
            await addParty(partyData);
        }
        setEditingParty(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure? This will remove the party and all their records.")) {
            // FIX: Use context function to delete
            deleteParty(id);
        }
    };

    const openEditModal = (party: Party) => {
        setEditingParty(party);
        setIsModalOpen(true);
    };
    
    const openAddModal = () => {
        setEditingParty(null);
        setIsModalOpen(true);
    };

    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customers & Suppliers</h1>
                <button onClick={openAddModal} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Party
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {parties.map(party => (
                            <tr key={party.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/parties/${party.id}`)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{party.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${party.type === PartyType.CUSTOMER ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{party.type}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{party.phone}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${partyBalances[party.id] > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {settings.currency}{partyBalances[party.id].toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openEditModal(party)} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 mr-4"><EditIcon className="w-5 h-5 inline" /></button>
                                    <button onClick={() => handleDelete(party.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {parties.length === 0 && <p className="text-center py-8 text-gray-500">No customers or suppliers found. Add one to get started.</p>}
            </div>

            <PartyModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveParty}
                party={editingParty}
            />
         </div>
    );
};

export default PartyList;
