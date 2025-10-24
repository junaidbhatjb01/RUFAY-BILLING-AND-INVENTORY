import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const ConfirmedBookings: React.FC = () => {
    const { onlineBookings } = useData();
    const navigate = useNavigate();

    const confirmedBookings = useMemo(() =>
        onlineBookings.filter(b => b.status === 'Confirmed').sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()),
        [onlineBookings]
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Confirmed Bookings</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Booking Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Flight</th>
                             <th className="px-6 py-3 text-left text-xs font-medium uppercase">PNR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Primary Passenger</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {confirmedBookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/online-ticket/${booking.id}`)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(booking.bookingDate).toLocaleString()}</td>
                                {/* FIX: Property 'flight' does not exist on type 'OnlineBooking'. Use 'itinerary.outboundLegs' instead. */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.itinerary.outboundLegs[0]?.airline} {booking.itinerary.outboundLegs[0]?.flightNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{booking.pnr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.passengers[0].name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button className="text-teal-600 hover:underline">
                                        View Ticket
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {confirmedBookings.length === 0 && <p className="text-center py-8 text-gray-500">No confirmed bookings found.</p>}
            </div>
        </div>
    );
};

export default ConfirmedBookings;