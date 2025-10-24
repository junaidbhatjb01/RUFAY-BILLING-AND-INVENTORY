import React from 'react';
import { Booking, Series, Party, Invoice, Settings } from '../../../types';
import TicketFooterInfo from './TicketFooterInfo';
import { getAirlineLogo } from '../../ui/AirlineLogos';

interface TemplateProps {
    booking: Booking;
    seriesInfo: Series;
    returnSeriesInfo: Series | null;
    party: Party;
    invoice: Invoice;
    settings: Settings;
}

const DetailedItineraryTicketTemplate: React.FC<TemplateProps> = ({ booking, seriesInfo, returnSeriesInfo, party, settings, invoice }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 shadow-md">
            <header className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold">Travel Itinerary</h1>
                    <p className="text-gray-500">Prepared for: {party.name}</p>
                </div>
                <div className="text-right text-sm">
                    <p className="font-bold">{settings.businessName}</p>
                    <p>{settings.phone}</p>
                </div>
            </header>

            <section className="my-6">
                <h2 className="font-bold mb-2">Passengers</h2>
                <ul className="list-disc list-inside">
                    {booking.passengers.map((p, i) => <li key={i}>{p.name} ({p.type})</li>)}
                </ul>
            </section>
            
            <section className="my-6">
                 <h2 className="font-bold mb-2">Flights</h2>
                 <div className="space-y-4">
                    {seriesInfo && <FlightDetails flight={seriesInfo} />}
                    {returnSeriesInfo && <FlightDetails flight={returnSeriesInfo} isReturn />}
                 </div>
            </section>
            
            <section className="my-6 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <TicketFooterInfo />
            </section>
            
            <footer className="mt-8 pt-4 border-t dark:border-gray-700 text-xs text-center text-gray-500">
                <p>Booking {settings.bookingPrefix || ''}{booking.bookingNumber} | Invoice {settings.invoicePrefix || ''}{invoice.invoiceNumber} | Total: {settings.currency}{booking.totalAmount.toFixed(2)}</p>
                <p>Thank you for choosing {settings.businessName}.</p>
            </footer>
        </div>
    );
};

const FlightDetails: React.FC<{ flight: Series, isReturn?: boolean }> = ({ flight, isReturn }) => {
    const LogoComponent = getAirlineLogo(flight.airline);
    return (
        <div className="border p-4 rounded-md dark:border-gray-600">
            <div className="flex items-center font-semibold">
                {LogoComponent && <LogoComponent className="h-6 w-8 mr-2 object-contain" />}
                <span>{isReturn ? 'Return Flight' : 'Outbound Flight'}: {flight.airline} ({flight.pnr})</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                    <p className="font-bold">Departure</p>
                    <p>{flight.route.split('-')[0]}</p>
                    <p>{new Date(flight.departureDate).toLocaleString()}</p>
                </div>
                <div>
                     <p className="font-bold">Arrival</p>
                     <p>{flight.route.split('-')[1]}</p>
                     <p>{new Date(flight.arrivalDate).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};


export default DetailedItineraryTicketTemplate;