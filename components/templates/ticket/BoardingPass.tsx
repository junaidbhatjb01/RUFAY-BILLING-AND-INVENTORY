import React from 'react';
import { Booking, Series } from '../../../types';
import TicketFooterInfo from './TicketFooterInfo';
import { getAirlineLogo } from '../../ui/AirlineLogos';

interface TemplateProps {
    booking: Booking;
    seriesInfo: Series;
    returnSeriesInfo: Series | null;
}

const BoardingPassTicketTemplate: React.FC<TemplateProps> = ({ booking, seriesInfo, returnSeriesInfo }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4">
            <div className="space-y-4">
                <h2 className="text-center font-bold text-xl mb-4">Your E-Tickets</h2>
                {booking.passengers.map((passenger, index) => (
                    <div key={index}>
                        {seriesInfo && <BoardingPass flight={seriesInfo} passenger={passenger.name} />}
                        {returnSeriesInfo && <BoardingPass flight={returnSeriesInfo} passenger={passenger.name} isReturn={true} />}
                    </div>
                ))}
            </div>
             <div className="mt-4 p-4 border-t dark:border-gray-700">
                <TicketFooterInfo />
            </div>
        </div>
    );
};

const BoardingPass: React.FC<{ flight: Series, passenger: string, isReturn?: boolean }> = ({ flight, passenger, isReturn }) => {
    const LogoComponent = getAirlineLogo(flight.airline);
    return (
        <div className="font-mono bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md flex mb-4">
            <div className="p-4 border-r-2 border-dashed dark:border-gray-500 flex-grow">
                <div className="flex items-center text-xs text-gray-500">
                    {LogoComponent && <LogoComponent className="h-6 w-8 mr-2 object-contain" />}
                    {flight.airline} - {isReturn ? 'RETURN' : 'OUTBOUND'}
                </div>
                <div className="flex justify-between items-end mt-2">
                    <div>
                        <p className="text-xs">FROM</p>
                        <p className="text-2xl font-bold">{flight.route.split('-')[0]}</p>
                    </div>
                     <p className="text-lg">&rarr;</p>
                     <div>
                        <p className="text-xs">TO</p>
                        <p className="text-2xl font-bold">{flight.route.split('-')[1]}</p>
                    </div>
                </div>
                 <div className="flex justify-between mt-4 text-xs">
                    <div><p>PASSENGER</p><p className="font-bold">{passenger}</p></div>
                    <div><p>DATE</p><p className="font-bold">{new Date(flight.departureDate).toLocaleDateString()}</p></div>
                    <div><p>TIME</p><p className="font-bold">{new Date(flight.departureDate).toLocaleTimeString()}</p></div>
                 </div>
            </div>
            <div className="w-24 p-4 text-center flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-r-lg">
                 <p className="text-xs">PNR</p>
                 <p className="font-bold text-lg">{flight.pnr}</p>
                 <div className="w-16 h-16 bg-black mt-2"></div>
                 <p className="text-xs mt-1">SCAN ME</p>
            </div>
        </div>
    );
}

export default BoardingPassTicketTemplate;
