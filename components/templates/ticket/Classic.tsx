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
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm font-semibold">DEPARTURE</p>
                    <p className="text-lg font-bold">{flightInfo.route.split('-')[0]}</p>
                    <p>{new Date(flightInfo.departureDate).toLocaleDateString()}</p>
                    <p>{new Date(flightInfo.departureDate).toLocaleTimeString()}</p>
                </div>
                 <div>
                    <p className="text-sm font-semibold">ARRIVAL</p>
                    <p className="text-lg font-bold">{flightInfo.route.split('-')[1]}</p>
                    <p>{new Date(flightInfo.arrivalDate).toLocaleDateString()}</p>
                    <p>{new Date(flightInfo.arrivalDate).toLocaleTimeString()}</p>
                </div>
                 <div>
                     <p className="text-sm font-semibold">PNR</p>
                     <p className="font-mono bg-gray-200 dark:bg-gray-600 inline-block px-2 py-1 rounded">{flightInfo.pnr}</p>
                 </div>
            </div>
        </div>
    );
}

const ClassicTicketTemplate: React.FC<TemplateProps> = ({ booking, seriesInfo, returnSeriesInfo, party, invoice, settings }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <header className="flex justify-between items-start pb-6 border-b dark:border-gray-700">
        <div className="flex items-center">
            {settings.logo && <img src={settings.logo} alt="Business Logo" className="h-16 w-16 mr-4 object-contain" />}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{settings.businessName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{settings.address}</p>
            </div>
        </div>
        <div className="text-right">
            <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400">E-TICKET</h2>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Passenger(s):</h3>
            {booking.passengers.map((p, index) => (
                <p key={index} className="font-bold text-lg">{p.name} <span className="text-sm font-normal">({p.type})</span></p>
            ))}
        </div>
        <div className="md:text-right">
             <h3 className="font-semibold text-gray-700 dark:text-gray-300">Booking Reference:</h3>
             <p className="font-bold text-lg">{settings.bookingPrefix || ''}{booking.bookingNumber}</p>
             <Link to={`/invoices/${booking.invoiceId}`} className="text-sm text-teal-600 hover:underline">View Invoice #{settings.invoicePrefix || ''}{invoice.invoiceNumber}</Link>
        </div>
      </section>

      <section className="space-y-6">
        {seriesInfo && <FlightDetailSection flightInfo={seriesInfo} title="OUTBOUND" />}
        {returnSeriesInfo && <FlightDetailSection flightInfo={returnSeriesInfo} title="RETURN" />}
      </section>
      
      <TicketFooterInfo />
    </div>
  );
};

export default ClassicTicketTemplate;