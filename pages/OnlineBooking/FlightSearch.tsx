import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { FlightItinerary, TripType, PassengerCounts } from '../../types';
import { useNavigate } from 'react-router-dom';
import { getAirlineLogo } from '../../components/ui/AirlineLogos';
import { PlaneIcon } from '../../components/ui/Icons';

const FlightSearch: React.FC = () => {
    const { searchFlights, settings } = useData();
    const navigate = useNavigate();

    const [tripType, setTripType] = useState<TripType>('one-way');
    const [from, setFrom] = useState('DEL');
    const [to, setTo] = useState('BOM');
    const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState('');
    const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<FlightItinerary[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSearched(true);
        setResults([]);
        try {
            const flightResults = await searchFlights(
                from,
                to,
                departureDate,
                tripType === 'round-trip' ? returnDate : undefined,
                passengers,
                tripType
            );
            setResults(flightResults);
        } catch (error) {
            console.error(error);
            alert('Failed to search for flights.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectFlight = (itinerary: FlightItinerary) => {
        const searchCriteria = { from, to, departureDate, returnDate, passengers, tripType };
        navigate('/book-flight', { state: { itinerary, searchCriteria } });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Online Flight Search</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center"><input type="radio" name="tripType" value="one-way" checked={tripType === 'one-way'} onChange={() => setTripType('one-way')} className="mr-2" /> One Way</label>
                        <label className="flex items-center"><input type="radio" name="tripType" value="round-trip" checked={tripType === 'round-trip'} onChange={() => setTripType('round-trip')} className="mr-2" /> Round Trip</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input placeholder="From" type="text" value={from} onChange={e => setFrom(e.target.value.toUpperCase())} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                        <input placeholder="To" type="text" value={to} onChange={e => setTo(e.target.value.toUpperCase())} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                        <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border rounded-md p-2" />
                        <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required={tripType === 'round-trip'} disabled={tripType === 'one-way'} className="w-full bg-white dark:bg-gray-700 border rounded-md p-2 disabled:bg-gray-100 dark:disabled:bg-gray-600" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="grid grid-cols-3 gap-2">
                             <div><label className="text-xs">Adults</label><input type="number" min="1" value={passengers.adults} onChange={e => setPassengers({...passengers, adults: +e.target.value})} className="w-full bg-white dark:bg-gray-700 border rounded-md p-2"/></div>
                             <div><label className="text-xs">Children</label><input type="number" min="0" value={passengers.children} onChange={e => setPassengers({...passengers, children: +e.target.value})} className="w-full bg-white dark:bg-gray-700 border rounded-md p-2"/></div>
                             <div><label className="text-xs">Infants</label><input type="number" min="0" value={passengers.infants} onChange={e => setPassengers({...passengers, infants: +e.target.value})} className="w-full bg-white dark:bg-gray-700 border rounded-md p-2"/></div>
                        </div>
                        <div className="lg:col-start-4">
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400 flex items-center justify-center">
                                <PlaneIcon className="w-5 h-5 mr-2" />
                                {isLoading ? 'Searching...' : 'Search Flights'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                {results.length > 0 && (
                    <p className="text-xs text-gray-500 text-center mb-4">
                        Please note: Flight data is a high-quality simulation powered by AI for demonstration purposes and does not reflect live availability.
                    </p>
                )}
                {results.map(itinerary => (
                    <div key={itinerary.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col md:flex-row">
                       <div className="flex-grow p-4">
                           <ItineraryLegs legs={itinerary.outboundLegs} title="Outbound"/>
                           {itinerary.returnLegs && <ItineraryLegs legs={itinerary.returnLegs} title="Return" />}
                       </div>
                       <div className="w-full md:w-48 p-4 text-center border-t md:border-t-0 md:border-l dark:border-gray-700 flex flex-col justify-center items-center">
                           <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{settings.currency}{itinerary.totalPrice.toFixed(2)}</p>
                           <p className="text-xs text-gray-500">Total Price</p>
                           <button onClick={() => handleSelectFlight(itinerary)} className="text-sm bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2 w-full">Select</button>
                       </div>
                    </div>
                ))}
                 {searched && !isLoading && results.length === 0 && <p className="text-center py-8 text-gray-500">No flights found for this search. The AI model could not generate a result. Please try different criteria.</p>}
            </div>
        </div>
    );
};

const ItineraryLegs: React.FC<{legs: FlightItinerary['outboundLegs'], title: string}> = ({legs, title}) => {
    return (
        <div className="mb-2">
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            {legs.map((leg, index) => {
                 const Logo = getAirlineLogo(leg.airline);
                 return (
                     <React.Fragment key={index}>
                        <div className="flex items-center gap-4 text-sm">
                             {Logo && <Logo className="h-6 w-8 object-contain flex-shrink-0" />}
                            <div className="font-bold">{leg.from} &rarr; {leg.to}</div>
                            <div>{new Date(leg.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(leg.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div className="text-gray-500">{leg.duration}</div>
                            <div className="text-gray-500">{leg.flightNumber}</div>
                        </div>
                        {leg.layoverDuration && <div className="pl-12 text-xs text-red-500">Layover: {leg.layoverDuration}</div>}
                    </React.Fragment>
                 )
            })}
        </div>
    )
}

export default FlightSearch;