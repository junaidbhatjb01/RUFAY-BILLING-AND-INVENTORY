import React from 'react';
import { Link } from 'react-router-dom';
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

const FlightDetailRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`font-semibold ${className}`}>{value}</p>
    </div>
);

const ModernTicketTemplate: React.FC<TemplateProps> = ({ booking, seriesInfo, returnSeriesInfo, party, invoice, settings }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
            <header className="p-6 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{settings.businessName}</h1>
                    <p className="text-sm text-gray-500">Travel Itinerary</p>
                </div>
                <div className="text-right">
                    {settings.logo && <img src={settings.logo} alt="Logo" className="h-12 w-auto" />}
                </div>
            </header>
            
            <div className="flex flex-col md:flex-row">
                <div className="flex-grow p-6">
                    <h2 className="text-lg font-bold mb-4">Passengers</h2>
                    <div className="space-y-2">
                        {booking.passengers.map((p, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                                <p className="font-medium text-lg">{p.name}</p>
                                <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">{p.type}</span>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-lg font-bold mt-6 mb-4">Flight Details</h2>
                    <div className="space-y-4">
                        {seriesInfo && <FlightCard flight={seriesInfo} title="Outbound"/>}
                        {returnSeriesInfo && <FlightCard flight={returnSeriesInfo} title="Return"/>}
                    </div>

                </div>

                <aside className="w-full md:w-64 bg-teal-50 dark:bg-teal-900 p-6">
                    <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                        <FlightDetailRow label="Booking Ref" value={`${settings.bookingPrefix || ''}${booking.bookingNumber}`} className="text-teal-600 dark:text-teal-400" />
                        <FlightDetailRow label="Booked By" value={party.name} />
                        <FlightDetailRow label="Total Amount" value={`${settings.currency}${booking.totalAmount.toFixed(2)}`} />
                         {invoice && <Link to={`/invoices/${booking.invoiceId}`} className="text-teal-600 dark:text-teal-400 hover:underline block pt-2 border-t mt-2 dark:border-gray-700">View Invoice &rarr;</Link>}
                    </div>
                </aside>
            </div>
            <footer className="p-6 bg-white dark:bg-gray-800">
                 <TicketFooterInfo />
            </footer>
        </div>
    );
};

const FlightCard: React.FC<{ flight: Series, title: string }> = ({ flight, title }) => {
    const LogoComponent = getAirlineLogo(flight.airline);
    return (
        <div className="border rounded-lg dark:border-gray-700">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center">
                    {LogoComponent && <LogoComponent className="h-6 w-8 mr-2 object-contain" />}
                    <p className="font-semibold">{title}: {flight.airline}</p>
                </div>
                <p className="text-xs">PNR: <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{flight.pnr}</span></p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                     <p className="text-xl font-bold">{flight.route.split('-')[0]}</p>
                     <p className="text-xs">{new Date(flight.departureDate).toLocaleDateString()}</p>
                     <p className="text-xs">{new Date(flight.departureDate).toLocaleTimeString()}</p>
                </div>
                 <div className="text-center text-sm text-gray-500">
                    <p>&#8594;</p>
                    <p>{flight.route}</p>
                 </div>
                 <div className="text-center">
                     <p className="text-xl font-bold">{flight.route.split('-')[1]}</p>
                     <p className="text-xs">{new Date(flight.arrivalDate).toLocaleDateString()}</p>
                     <p className="text-xs">{new Date(flight.arrivalDate).toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    )
}

export default ModernTicketTemplate;