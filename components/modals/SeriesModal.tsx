import React, { useState, useEffect } from 'react';
import { Series } from '../../types';
import { XIcon } from '../ui/Icons';
import { airlineNames } from '../ui/AirlineLogos'; // Import the list of airlines

interface SeriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (series: Series) => void;
    series: Series | null;
}

const SeriesModal: React.FC<SeriesModalProps> = ({ isOpen, onClose, onSave, series: editingSeries }) => {
    const [pnr, setPnr] = useState('');
    const [airline, setAirline] = useState('');
    const [route, setRoute] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [totalSeats, setTotalSeats] = useState(0);
    const [purchasePricePerSeat, setPurchasePricePerSeat] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (editingSeries) {
                setPnr(editingSeries.pnr);
                setAirline(editingSeries.airline);
                setRoute(editingSeries.route);
                setDepartureDate(editingSeries.departureDate);
                setArrivalDate(editingSeries.arrivalDate);
                setTotalSeats(editingSeries.totalSeats);
                setPurchasePricePerSeat(editingSeries.purchasePricePerSeat);
            } else {
                setPnr('');
                setAirline('');
                setRoute('');
                setDepartureDate('');
                setArrivalDate('');
                setTotalSeats(0);
                setPurchasePricePerSeat(0);
            }
        }
    }, [editingSeries, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const seriesData: Series = {
            id: editingSeries?.id || Date.now().toString(),
            pnr,
            airline,
            route,
            departureDate,
            arrivalDate,
            totalSeats,
            availableSeats: editingSeries ? editingSeries.availableSeats : totalSeats, // Preserve available seats on edit
            purchasePricePerSeat,
        };
        onSave(seriesData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{editingSeries ? 'Edit Series' : 'Add New Series'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="PNR" value={pnr} onChange={e => setPnr(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        <select
                            value={airline}
                            onChange={e => setAirline(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                        >
                            <option value="">Select Airline</option>
                            {airlineNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <input type="text" placeholder="Route (e.g., JFK-LAX)" value={route} onChange={e => setRoute(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs">Departure</label>
                             <input type="datetime-local" value={departureDate} onChange={e => setDepartureDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="text-xs">Arrival</label>
                            <input type="datetime-local" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="number" placeholder="Total Seats" value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        <input type="number" placeholder="Purchase Price / Seat" value={purchasePricePerSeat} onChange={e => setPurchasePricePerSeat(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Series</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SeriesModal;
