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

const FlightDetailSection: React.FC<{flightInfo: Series, title: string}> = ({ flightInfo, title }) => {
    const LogoComponent = getAirlineLogo(flightInfo.airline);
    return (
        <div className="border rounded-lg dark:border-gray-600">
            <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                <div className="flex items-center">
                    {LogoComponent && <LogoComponent className="h-8 w-10 mr-3 object-contain" />}
                    <div>
                        <p className="font-bold text-lg">{flightInfo.airline}</p>
                        <p className="text-xs font-semibold">{title}</p>
                    </div>
                </div>
                <p className="ml-auto text-sm">PNR: <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{flightInfo.pnr}</span></p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold">{flightInfo.route.split('-')[0]}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Departure</p>
                    <p className="font-semibold">{new Date(flightInfo.departureDate).toLocaleDateString()}</p>
                    <p className="font-semibold">{new Date(flightInfo.departureDate).toLocaleTimeString()}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                   <p className="text-gray-500 dark:text-gray-400">&#8594;</p>
                   <p className="text-sm">{flightInfo.route}</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold">{flightInfo.route.split('-')[1]}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Arrival</p>
                    <p className="font-semibold">{new Date(flightInfo.arrivalDate).toLocaleDateString()}</p>
                    <p className="font-semibold">{new Date(flightInfo.arrivalDate).toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
};

const ClassicTicketTemplate: React.FC<TemplateProps> = ({ booking, seriesInfo, returnSeriesInfo, party, invoice, settings }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl mx-auto border-4 border-dashed border-gray-300 dark:border-gray-600">
            <header className="flex justify-between items-center pb-4 border-b-2 border-dashed dark:border-gray-600">
                <div>
                    <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">E-TICKET / ITINERARY</h1>
                    <p className="text-sm">Booking Ref: BKG-{booking.bookingNumber}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">{settings.businessName}</h2>
                    <p className="text-xs">{settings.phone}</p>
                </div>
            </header>

            <section className="my-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Passenger Details</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-2">
                    {booking.passengers.map((p, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <p className="font-bold text-xl">{p.name}</p>
                            <span className="text-sm font-medium bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">{p.type}</span>
                        </div>
                    ))}
                     <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-600">
                        Booked by: {party?.name} {party?.phone && `(${party.phone})`}
                     </p>
                </div>
            </section>
            
            <section className="my-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Flight Details</h3>
                {seriesInfo && <FlightDetailSection flightInfo={seriesInfo} title="Outbound Flight" />}
                {returnSeriesInfo && <FlightDetailSection flightInfo={returnSeriesInfo} title="Return Flight" />}
            </section>

            <footer className="mt-8 pt-4 border-t-2 border-dashed dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Payment Details:</p>
                        {settings.bankName && <p><strong>Bank:</strong> {settings.bankName}</p>}
                        {settings.accountNumber && <p><strong>Account #:</strong> {settings.accountNumber}</p>}
                        {settings.ifscCode && <p><strong>IFSC:</strong> {settings.ifscCode}</p>}
                        {settings.upiId && <p><strong>UPI ID:</strong> {settings.upiId}</p>}
                        <p className="mt-2">Total Amount: <span className="font-bold">{settings.currency}{booking.totalAmount.toFixed(2)}</span></p>
                        {invoice && <Link to={`/invoices/${booking.invoiceId}`} className="text-teal-600 dark:text-teal-400 hover:underline">View Invoice (INV-{invoice.invoiceNumber})</Link>}
                    </div>
                    {settings.upiQRCode && (
                        <div className="text-center">
                            <p className="font-semibold text-xs">Scan to Pay</p>
                            <img src={settings.upiQRCode} alt="UPI QR Code" className="h-24 w-24 object-contain" />
                        </div>
                    )}
                </div>
                <TicketFooterInfo />
                <p className="text-xs mt-4 text-center">Thank you for booking with {settings.businessName}. Please verify flight times with the airline prior to departure.</p>
            </footer>
        </div>
    );
};

export default ClassicTicketTemplate;
