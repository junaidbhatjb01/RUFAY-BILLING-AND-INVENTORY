
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Booking, Invoice, Party, PartyType, PaymentStatus, Series, Passenger, PassengerType, InvoiceItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '../../components/ui/Icons';
import PartyModal from '../../components/modals/PartyModal';

// Local type for managing form state with a stable ID for each passenger
type PassengerWithId = Passenger & { id: string };

const CreateBooking: React.FC = () => {
    const navigate = useNavigate();
    // FIX: Replaced direct state setters with context action functions
    const { series, parties, addParty, addBooking, settings } = useData();

    const [seriesId, setSeriesId] = useState('');
    const [returnSeriesId, setReturnSeriesId] = useState('');
    const [partyId, setPartyId] = useState('');
    const [passengers, setPassengers] = useState<PassengerWithId[]>([{ id: Date.now().toString(), name: '', type: 'Adult' }]);
    const [sellingPricePerSeat, setSellingPricePerSeat] = useState(0);
    const [returnSellingPricePerSeat, setReturnSellingPricePerSeat] = useState(0);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    
    const customers = parties.filter(p => p.type === PartyType.CUSTOMER);
    const availableSeries = series.filter(s => s.availableSeats > 0);
    
    const selectedSeries = useMemo(() => series.find(s => s.id === seriesId), [series, seriesId]);
    const selectedReturnSeries = useMemo(() => series.find(s => s.id === returnSeriesId), [series, returnSeriesId]);

    const handlePassengerChange = (id: string, field: 'name' | 'type', value: string) => {
        setPassengers(currentPassengers =>
            currentPassengers.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            )
        );
    };

    const addPassenger = () => {
        setPassengers([...passengers, { id: Date.now().toString(), name: '', type: 'Adult' }]);
    };

    const removePassenger = (id: string) => {
        if (passengers.length > 1) {
            setPassengers(passengers.filter(p => p.id !== id));
        }
    };

    const totalAmount = useMemo(() => {
        const outboundCost = passengers.length * sellingPricePerSeat;
        const returnCost = returnSeriesId ? passengers.length * returnSellingPricePerSeat : 0;
        return outboundCost + returnCost;
    }, [passengers.length, sellingPricePerSeat, returnSeriesId, returnSellingPricePerSeat]);

    const handleSaveCustomer = async (newPartyData: Omit<Party, 'id'>) => {
        // FIX: Use context function to add a party
        const newParty = await addParty(newPartyData);
        setPartyId(newParty.id);
        setIsCustomerModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const seatsNeeded = passengers.length;
        if (!seriesId || !partyId || sellingPricePerSeat <= 0 || passengers.some(p => !p.name)) {
            alert("Please fill all required fields: Outbound Series, Customer, Passenger Names, and Prices.");
            return;
        }

        if (!selectedSeries || selectedSeries.availableSeats < seatsNeeded) {
            alert("Not enough available seats in the selected outbound series.");
            return;
        }

        if (returnSeriesId) {
             if (!selectedReturnSeries || selectedReturnSeries.availableSeats < seatsNeeded) {
                alert("Not enough available seats in the selected return series.");
                return;
            }
             if (returnSellingPricePerSeat <= 0) {
                 alert("Please enter a valid selling price for the return flight.");
                 return;
             }
        }
        
        // Strip temporary 'id' from passengers before saving
        const passengersToSave: Passenger[] = passengers.map(({ id, ...rest }) => rest);

        // FIX: Use a single context function to handle the complex booking transaction
        try {
            const newBookingData: Omit<Booking, 'id' | 'bookingNumber' | 'invoiceId'> = {
                seriesId,
                returnSeriesId: returnSeriesId || undefined,
                partyId,
                passengers: passengersToSave,
                sellingPricePerSeat,
                returnSellingPricePerSeat: returnSellingPricePerSeat || undefined,
                totalAmount,
                bookingDate: new Date().toISOString().split('T')[0],
            };
            
            await addBooking(newBookingData);
            
            // Navigate after successful booking
            navigate(`/bookings`); // Navigate to list to see the new booking
        } catch (error) {
            console.error("Failed to create booking:", error);
            alert("Error: Could not create booking.");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Booking</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Flight & Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="customer" className="block text-sm font-medium">Customer</label>
                        <div className="flex items-center gap-2 mt-1">
                            <select id="customer" value={partyId} onChange={e => setPartyId(e.target.value)} required className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3">
                                <option value="">Select customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="bg-teal-100 dark:bg-teal-800 p-2 rounded-md"><PlusIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Passenger Details */}
                <div className="border-t pt-4 dark:border-gray-700">
                    <h2 className="font-semibold mb-2">Passenger Details</h2>
                    {passengers.map((p) => (
                        <div key={p.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                            <div className="col-span-6"><input type="text" placeholder="Passenger Name" value={p.name} onChange={e => handlePassengerChange(p.id, 'name', e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" /></div>
                            <div className="col-span-4">
                                <select value={p.type} onChange={e => handlePassengerChange(p.id, 'type', e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                                    <option value="Adult">Adult</option><option value="Child">Child</option><option value="Infant">Infant</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                {passengers.length > 1 && <button type="button" onClick={() => removePassenger(p.id)} className="text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-800"><TrashIcon className="w-5 h-5"/></button>}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addPassenger} className="text-sm text-teal-600 hover:underline flex items-center mt-2"><PlusIcon className="w-4 h-4 mr-1"/>Add Another Passenger</button>
                </div>

                {/* Outbound Flight */}
                <div className="border-t pt-4 dark:border-gray-700">
                    <h2 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Outbound Flight</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="series" className="block text-xs">Select Series</label>
                            <select id="series" value={seriesId} onChange={e => setSeriesId(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                                <option value="">Select ticket series</option>
                                {availableSeries.map(s => <option key={s.id} value={s.id}>{s.pnr} | {s.route} ({s.availableSeats} seats)</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-xs">Selling Price / Seat</label>
                            <input type="number" id="price" value={sellingPricePerSeat} onChange={e => setSellingPricePerSeat(Number(e.target.value))} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                </div>

                 {/* Return Flight */}
                <div className="border-t pt-4 dark:border-gray-700">
                    <h2 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">Return Flight (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="return_series" className="block text-xs">Select Series</label>
                            <select id="return_series" value={returnSeriesId} onChange={e => setReturnSeriesId(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                                <option value="">None</option>
                                {availableSeries.map(s => <option key={s.id} value={s.id}>{s.pnr} | {s.route} ({s.availableSeats} seats)</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="return_price" className="block text-xs">Selling Price / Seat</label>
                            <input type="number" id="return_price" value={returnSellingPricePerSeat} onChange={e => setReturnSellingPricePerSeat(Number(e.target.value))} disabled={!returnSeriesId} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 disabled:bg-gray-100 dark:disabled:bg-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="text-right border-t pt-4 dark:border-gray-700">
                    <p className="text-xl font-bold">Total Amount: {settings.currency}{totalAmount.toFixed(2)}</p>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/bookings')} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Create Booking & Invoice</button>
                </div>
            </form>
            <PartyModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSave={(data) => handleSaveCustomer({ ...data, type: PartyType.CUSTOMER })} party={null}/>
        </div>
    );
};

export default CreateBooking;
