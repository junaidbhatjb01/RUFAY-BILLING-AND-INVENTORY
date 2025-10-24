import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { OnlineBooking } from '../../types';
import UpdatePnrModal from '../../components/modals/UpdatePnrModal';

const PendingBookings: React.FC = () => {
    const { onlineBookings, updateOnlineBooking } = useData();
    const [selectedBooking, setSelectedBooking] = useState<OnlineBooking | null>(null);

    const pendingBookings = useMemo(() =>
        onlineBookings.filter(b => b.status === 'Pending').sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()),
        [onlineBookings]
    );

    const handleUpdatePnr = async (bookingId: string, pnr: string) => {
        try {
            await updateOnlineBooking(bookingId, pnr);
            setSelectedBooking(null); // Close modal on success
        } catch (error) {
            console.error(error);
            alert('Failed to update PNR.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Pending Bookings</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Booking Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Flight</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Primary Passenger</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingBookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(booking.bookingDate).toLocaleString()}</td>
                                {/* FIX: Property 'flight' does not exist on type 'OnlineBooking'. Use 'itinerary.outboundLegs' instead. */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.itinerary.outboundLegs[0]?.airline} {booking.itinerary.outboundLegs[0]?.flightNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.passengers[0].name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => setSelectedBooking(booking)} className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                                        Update PNR
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pendingBookings.length === 0 && <p className="text-center py-8 text-gray-500">No pending bookings found.</p>}
            </div>

            {selectedBooking && (
                <UpdatePnrModal
                    isOpen={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onSave={handleUpdatePnr}
                    booking={selectedBooking}
                />
            )}
        </div>
    );
};

export default PendingBookings;