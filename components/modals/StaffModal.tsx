
import React, { useState } from 'react';
import { XIcon } from '../ui/Icons';

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (email: string, password: string) => Promise<void>;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            await onSave(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to add staff.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setIsLoading(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Add New Staff Member</h2>
                    <button onClick={handleClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="email" placeholder="Staff Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={handleClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400">
                           {isLoading ? 'Adding...' : 'Add Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffModal;
