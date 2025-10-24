import React from 'react';
import { Booking, Series, Party, Settings } from '../../../types';
import TicketFooterInfo from './TicketFooterInfo';
import { getAirlineLogo } from '../../ui/AirlineLogos';

interface TemplateProps {
    booking: Booking;
    seriesInfo: Series;
    returnSeriesInfo: Series | null;
    party: Party;
    settings: Settings;
}

const MinimalistTicketTemplate: React.FC<TemplateProps> = ({ booking, seriesInfo, returnSeriesInfo, settings }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-wider text-gray-800 dark:text-gray-200">TRAVEL ITINERARY</h1>
                <p className="text-sm text-gray-500">Booking Reference: BKG-{booking.bookingNumber}</p>
            </header>

            <section className="mb-8">
                <h2 className="text-lg font-medium border-b dark:border-gray-600 pb-2 mb-4">Passenger Information</h2>
                {booking.passengers.map((p, index) => (
                    <div key={index} className="flex justify-between items-baseline mb-1">
                        <p className="text-lg">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.type}</p>
                    </div>
                ))}
            </section>
            
            <section className="space-y-6">
                <h2 className="text-lg font-medium border-b dark:border-gray-600 pb-2 mb-4">Flight Details</h2>
                {seriesInfo && <FlightSection flight={seriesInfo} />}
                {returnSeriesInfo && <FlightSection flight={returnSeriesInfo} isReturn={true} />}
            </section>
             <footer className="mt-8 pt-4 border-t dark:border-gray-600 text-sm text-gray-500">
                <p>This document confirms your booking with {settings.businessName}.</p>
                <p>Total amount paid: {settings.currency}{booking.totalAmount.toFixed(2)}</p>
                <TicketFooterInfo />
            </footer>
        </div>
    );
};

const FlightSection: React.FC<{ flight: Series, isReturn?: boolean }> = ({ flight, isReturn }) => {
    const LogoComponent = getAirlineLogo(flight.airline);
    return (
        <div>
            <h3 className="font-semibold flex items-center">
                {LogoComponent && <LogoComponent className="h-5 w-7 mr-2 object-contain" />}
                {isReturn ? 'Return' : 'Outbound'}: {flight.airline} &middot; PNR {flight.pnr}
            </h3>
            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                    <p className="font-bold">{flight.route.split('-')[0]}</p>
                    <p>{new Date(flight.departureDate).toLocaleString()}</p>
                </div>
                <div className="text-center text-gray-400">&rarr;</div>
                <div>
                    <p className="font-bold">{flight.route.split('-')[1]}</p>
                    <p>{new Date(flight.arrivalDate).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};


export default MinimalistTicketTemplate;
