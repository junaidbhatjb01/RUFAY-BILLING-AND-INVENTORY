
import React, { useState, useEffect } from 'react';
import { Party, PartyType } from '../../types';
import { XIcon } from '../ui/Icons';

const PartyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (party: Party) => void;
    party: Party | null;
}> = ({ isOpen, onClose, onSave, party }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState<PartyType>(PartyType.CUSTOMER);

    useEffect(() => {
        if (isOpen) {
            if (party) {
                setName(party.name); 
                setPhone(party.phone); 
                setEmail(party.email || '');
                setAddress(party.address); 
                setType(party.type);
            } else {
                setName(''); 
                setPhone(''); 
                setEmail('');
                setAddress(''); 
                setType(PartyType.CUSTOMER);
            }
        }
    }, [party, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: party?.id || Date.now().toString(), name, phone, email, address, type });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                 <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{party ? 'Edit Party' : 'Add New Party'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="email" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <textarea placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <select value={type} onChange={e => setType(e.target.value as PartyType)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                        <option value={PartyType.CUSTOMER}>Customer</option>
                        <option value={PartyType.SUPPLIER}>Supplier</option>
                    </select>
                     <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Party</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartyModal;