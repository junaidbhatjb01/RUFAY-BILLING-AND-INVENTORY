import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { FlightItinerary, OnlineBookingPassenger, PassengerCounts, PassengerType, TripType } from '../../types';

const PassengerDetails: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addOnlineBooking, settings } = useData();

    const { itinerary, searchCriteria } = location.state as { itinerary: FlightItinerary, searchCriteria: { passengers: PassengerCounts, from: string, to: string, departureDate: string, returnDate?: string, tripType: TripType } };
    
    const createInitialPassengers = (counts: PassengerCounts) => {
        const p: Partial<OnlineBookingPassenger>[] = [];
        for (let i = 0; i < counts.adults; i++) p.push({ type: 'Adult' });
        for (let i = 0; i < counts.children; i++) p.push({ type: 'Child' });
        for (let i = 0; i < counts.infants; i++) p.push({ type: 'Infant' });
        return p;
    };

    const [passengers, setPassengers] = useState<Partial<OnlineBookingPassenger>[]>(
        createInitialPassengers(searchCriteria.passengers)
    );
    const [isLoading, setIsLoading] = useState(false);

    if (!itinerary) {
        return <div className="text-center">No flight selected. Please <a href="#/flight-search">search for a flight</a> first.</div>;
    }

    const handlePassengerChange = (index: number, field: keyof OnlineBookingPassenger, value: any) => {
        const newPassengers = [...passengers];
        newPassengers[index] = { ...newPassengers[index], [field]: value };
        setPassengers(newPassengers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await addOnlineBooking({
                itinerary,
                passengers: passengers as OnlineBookingPassenger[],
                searchCriteria,
            });
            alert('Booking created successfully! Your booking is now pending confirmation.');
            navigate('/pending-bookings');
        } catch (error) {
            console.error(error);
            alert('Failed to create booking.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Passenger Details</h1>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
                <p className="font-semibold">{searchCriteria.from} &rarr; {searchCriteria.to}</p>
                <p className="text-sm">Outbound: {new Date(searchCriteria.departureDate).toDateString()}</p>
                {searchCriteria.returnDate && <p className="text-sm">Return: {new Date(searchCriteria.returnDate).toDateString()}</p>}
                <p className="text-lg font-bold mt-2">Total Price: {settings.currency}{itinerary.totalPrice.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {passengers.map((p, index) => (
                    <div key={index} className="border-t pt-4 dark:border-gray-700">
                        <h3 className="font-semibold mb-2 capitalize">{p.type} {passengers.filter(pa => pa.type === p.type).indexOf(p) + 1}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Full Name" onChange={e => handlePassengerChange(index, 'name', e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                            <input type="email" placeholder="Email" onChange={e => handlePassengerChange(index, 'email', e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                            <input type="tel" placeholder="Mobile Number" onChange={e => handlePassengerChange(index, 'mobile', e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                            <input type="number" placeholder="Age" onChange={e => handlePassengerChange(index, 'age', Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                            <select defaultValue="" onChange={e => handlePassengerChange(index, 'gender', e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2">
                                <option value="" disabled>Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                ))}

                 <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/flight-search')} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400">
                        {isLoading ? 'Booking...' : 'Proceed to Book'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PassengerDetails;