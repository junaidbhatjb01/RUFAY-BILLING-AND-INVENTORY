import React, { useState } from 'react';
import { XIcon } from '../ui/Icons';
import { OnlineBooking } from '../../types';

interface UpdatePnrModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookingId: string, pnr: string) => Promise<void>;
    booking: OnlineBooking;
}

const UpdatePnrModal: React.FC<UpdatePnrModalProps> = ({ isOpen, onClose, onSave, booking }) => {
    const [pnr, setPnr] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pnr) {
            alert("Please enter a PNR.");
            return;
        }
        setIsLoading(true);
        try {
            await onSave(booking.id, pnr);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Update PNR</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm">Booking for: <span className="font-semibold">{booking.passengers[0].name}</span></p>
                    {/* FIX: Property 'flight' does not exist on type 'OnlineBooking'. Use 'itinerary.outboundLegs' instead. */}
                    <p className="text-sm">Flight: <span className="font-semibold">{booking.itinerary.outboundLegs[0]?.airline} {booking.itinerary.outboundLegs[0]?.flightNumber}</span></p>
                    <div>
                        <label htmlFor="pnr" className="block text-sm font-medium">PNR Number</label>
                        <input
                            type="text"
                            id="pnr"
                            value={pnr}
                            onChange={(e) => setPnr(e.target.value.toUpperCase())}
                            required
                            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                        />
                    </div>
                     <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400">
                           {isLoading ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePnrModal;