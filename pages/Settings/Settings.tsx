import React, { useState, ChangeEvent, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Settings as AppSettings, User } from '../../types';
import ChangeEmailModal from '../../components/modals/ChangeEmailModal';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import StaffModal from '../../components/modals/StaffModal';
import * as api from '../../services/api';

const Settings: React.FC = () => {
    const { settings, updateSettings, restoreData } = useData();
    const { user, dataOwnerId, addStaff } = useAuth();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
    const [qrCodePreview, setQrCodePreview] = useState<string | null>(settings.upiQRCode);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [editingCounter, setEditingCounter] = useState<string | null>(null);

    useEffect(() => {
        setLocalSettings(settings);
        setLogoPreview(settings.logo);
        setQrCodePreview(settings.upiQRCode);
    }, [settings]);

    const fetchStaff = async () => {
        if (user?.role === 'admin') {
            const staff = await api.getStaff(user.id);
            setStaffList(staff);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [user]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isCounter = name.includes('Counter');
        setLocalSettings({ 
            ...localSettings, 
            [name]: isCounter ? Math.max(1, parseInt(value)) : value 
        });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'qrCode') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (type === 'logo') {
                    setLogoPreview(base64String);
                    setLocalSettings({ ...localSettings, logo: base64String });
                } else {
                    setQrCodePreview(base64String);
                    setLocalSettings({ ...localSettings, upiQRCode: base64String });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        updateSettings(localSettings).then(() => {
            alert('Settings saved successfully!');
            setEditingCounter(null); // Lock all counters after saving
        }).catch(err => {
            alert('Failed to save settings.');
            console.error(err);
        });
    };

    const handleAddStaff = async (email: string, password: string) => {
        try {
            await addStaff(email, password);
            setIsStaffModalOpen(false);
            fetchStaff(); // Refresh staff list
        } catch (error: any) {
            alert(`Failed to add staff: ${error.message}`);
        }
    };
    
    const handleBackup = async () => {
        if (!dataOwnerId) return;
        try {
            const data = await api.exportData(dataOwnerId);
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const date = new Date().toISOString().split('T')[0];
            link.download = `rufay-backup-${date}.json`;
            link.click();
        } catch (error) {
            console.error("Backup failed:", error);
            alert("Could not create backup.");
        }
    };

    const handleRestore = async () => {
        if (!backupFile) {
            alert("Please select a backup file first.");
            return;
        }
        if (!window.confirm("WARNING: This will overwrite ALL existing data. This action cannot be undone. Are you sure you want to proceed?")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') throw new Error("Could not read file");
                const data = JSON.parse(content);
                await restoreData(data);
                alert("Data restored successfully! The app will now reload.");
                window.location.reload();
            } catch (error) {
                console.error("Restore failed:", error);
                alert("Failed to restore data. The backup file might be corrupted or invalid.");
            }
        };
        reader.readAsText(backupFile);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Account Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" value={user?.email || ''} readOnly className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 cursor-not-allowed" />
                    </div>
                     <div className="flex items-end gap-4">
                        <button onClick={() => setIsEmailModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 h-fit">Change Email</button>
                        <button onClick={() => setIsPasswordModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 h-fit">Change Password</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
                <div className="mb-4">
                    {staffList.map(staff => (
                        <div key={staff.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md mb-2">
                           <p>{staff.email}</p>
                           <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">STAFF</span>
                        </div>
                    ))}
                     {staffList.length === 0 && <p className="text-sm text-gray-500">No staff members have been added.</p>}
                </div>
                <button onClick={() => setIsStaffModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Add Staff</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Business Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" name="businessName" placeholder="Business Name" value={localSettings.businessName} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="text" name="phone" placeholder="Phone" value={localSettings.phone} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="email" name="email" placeholder="Email" value={localSettings.email} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <textarea name="address" placeholder="Address" value={localSettings.address} onChange={handleChange} className="w-full md:col-span-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Logo</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} className="w-full text-sm" />
                        {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-4 h-20 w-20 object-contain rounded-md border p-1 dark:border-gray-600" />}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                 <h2 className="text-xl font-semibold mb-4">Payment / Bank Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" name="gstNumber" placeholder="GST Number" value={localSettings.gstNumber} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                     <select name="currency" value={localSettings.currency} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                        <option value="₹">Indian Rupee (₹)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">British Pound (£)</option>
                        <option value="¥">Japanese Yen (¥)</option>
                        <option value="A$">Australian Dollar (A$)</option>
                        <option value="C$">Canadian Dollar (C$)</option>
                     </select>
                    <input type="text" name="bankName" placeholder="Bank Name" value={localSettings.bankName} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="text" name="accountNumber" placeholder="Account Number" value={localSettings.accountNumber} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="text" name="ifscCode" placeholder="IFSC Code" value={localSettings.ifscCode} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <input type="text" name="upiId" placeholder="UPI ID" value={localSettings.upiId} onChange={handleChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload UPI QR Code</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'qrCode')} className="w-full text-sm" />
                        {qrCodePreview && <img src={qrCodePreview} alt="QR Code Preview" className="mt-4 h-24 w-24 object-contain rounded-md border p-1 dark:border-gray-600" />}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Numbering & Prefixes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Set the prefix and the <strong>next number</strong> for your documents. 
                    <span className="font-bold"> Warning:</span> Modifying the next number can lead to duplicates if set to a number that has already been used.
                </p>

                {([
                    { type: 'invoice', label: 'Invoice' },
                    { type: 'quotation', label: 'Quotation' },
                    { type: 'salesOrder', label: 'Sales Order' },
                    { type: 'booking', label: 'Booking' }
                ]).map(({ type, label }) => {
                    const prefixKey = `${type}Prefix` as keyof AppSettings;
                    const counterKey = `${type}Counter` as keyof AppSettings;
                    
                    return (
                        <div key={type} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4 pb-4 border-b dark:border-gray-700 last:border-b-0 last:pb-0 last:mb-0">
                            <label className="font-medium text-gray-700 dark:text-gray-300">{label}</label>
                            <input 
                                type="text" 
                                name={prefixKey}
                                placeholder="Prefix" 
                                value={(localSettings[prefixKey] as string) || ''} 
                                onChange={handleChange} 
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                            />
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    name={counterKey} 
                                    value={localSettings[counterKey] as number}
                                    min="1"
                                    onChange={handleChange} 
                                    disabled={editingCounter !== type}
                                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setEditingCounter(editingCounter === type ? null : type)}
                                    className={`px-3 py-2 text-sm rounded-md flex-shrink-0 ${editingCounter === type ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                                >
                                    {editingCounter === type ? 'Lock' : 'Edit'}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Invoice Preferences</h2>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">Choose a layout for your invoices.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="invoiceTemplate" value="classic" checked={localSettings.invoiceTemplate === 'classic'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Classic</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="invoiceTemplate" value="modern" checked={localSettings.invoiceTemplate === 'modern'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Modern</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="invoiceTemplate" value="compact" checked={localSettings.invoiceTemplate === 'compact'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Compact</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="invoiceTemplate" value="creative" checked={localSettings.invoiceTemplate === 'creative'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Creative</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="invoiceTemplate" value="professional" checked={localSettings.invoiceTemplate === 'professional'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Professional</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Ticket Preferences</h2>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">Choose a layout for your E-Tickets.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="ticketTemplate" value="classic" checked={localSettings.ticketTemplate === 'classic'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Classic</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="ticketTemplate" value="modern" checked={localSettings.ticketTemplate === 'modern'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Modern</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="ticketTemplate" value="minimalist" checked={localSettings.ticketTemplate === 'minimalist'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Minimalist</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="ticketTemplate" value="boardingPass" checked={localSettings.ticketTemplate === 'boardingPass'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Boarding Pass</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="ticketTemplate" value="detailedItinerary" checked={localSettings.ticketTemplate === 'detailedItinerary'} onChange={handleChange} className="form-radio h-4 w-4 text-teal-600" />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Detailed Itinerary</span>
                        </label>
                    </div>
                </div>
            </div>

             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Download a single file containing all your business data.</p>
                        <button onClick={handleBackup} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Backup Data</button>
                    </div>
                    <div>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Restore data from a backup file. <span className="font-bold text-red-500">This will overwrite all current data.</span></p>
                         <div className="flex items-center gap-2">
                            <input type="file" accept=".json" onChange={(e) => setBackupFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm" />
                            <button onClick={handleRestore} disabled={!backupFile} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 flex-shrink-0">Import & Restore</button>
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button onClick={handleSave} className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 font-semibold">Save All Settings</button>
            </div>
            
            <ChangeEmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
            <StaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSave={handleAddStaff} />

        </div>
    );
};

export default Settings;