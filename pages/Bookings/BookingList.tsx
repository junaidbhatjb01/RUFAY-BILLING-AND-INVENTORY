import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '../../components/ui/Icons';
import { Booking } from '../../types';

const BookingList: React.FC = () => {
  const { bookings, parties, series, settings } = useData();
  const navigate = useNavigate();

  const getPartyName = (partyId: string) => parties.find(p => p.id === partyId)?.name || 'N/A';
  const getSeriesInfo = (seriesId: string) => series.find(s => s.id === seriesId);

  const getPassengerDisplay = (booking: Booking) => {
    if (booking.passengers && booking.passengers.length > 0) {
      const primaryPassenger = booking.passengers[0].name;
      const totalPassengers = booking.passengers.length;
      return totalPassengers > 1 ? `${primaryPassenger} (+${totalPassengers - 1})` : primaryPassenger;
    }
    // @ts-ignore - Fallback for old data structure
    return booking.passengerName || 'N/A';
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Link to="/bookings/new" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Booking
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Booking #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">PNR / Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Passengers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.sort((a,b) => b.bookingNumber - a.bookingNumber).map(booking => {
              const seriesInfo = getSeriesInfo(booking.seriesId);
              return (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{settings.bookingPrefix || ''}{booking.bookingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getPartyName(booking.partyId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{seriesInfo?.pnr} ({seriesInfo?.route})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getPassengerDisplay(booking)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{settings.currency}{booking.totalAmount.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-center py-8 text-gray-500">No bookings found. Create your first one!</p>}
      </div>
    </div>
  );
};

export default BookingList;