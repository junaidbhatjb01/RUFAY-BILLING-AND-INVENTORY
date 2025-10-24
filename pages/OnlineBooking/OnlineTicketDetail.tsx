import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { PrintIcon, ShareIcon } from '../../components/ui/Icons';
import { getAirlineLogo } from '../../components/ui/AirlineLogos';
import TicketFooterInfo from '../../components/templates/ticket/TicketFooterInfo';
import { FlightLeg } from '../../types';

declare const jspdf: any;
declare const html2canvas: any;

const OnlineTicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { onlineBookings, settings } = useData();
    const [isSharing, setIsSharing] = useState(false);

    const booking = onlineBookings.find(b => b.id === id);

    if (!booking) {
        return <div className="text-center text-red-500">Booking not found.</div>;
    }

    const handlePrint = () => window.print();

    const handleSharePdf = async () => {
        setIsSharing(true);
        const ticketElement = document.getElementById('printable-area');
        if (!ticketElement) {
            alert("Could not find ticket element.");
            setIsSharing(false);
            return;
        }

        try {
            const canvas = await html2canvas(ticketElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const fileName = `Ticket-${booking.pnr || 'CONFIRMED'}.pdf`;
            const pdfBlob = pdf.output('blob');

            if (navigator.share) {
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                await navigator.share({ title: `E-Ticket ${booking.pnr}`, files: [file] });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error("PDF share error:", error);
            alert("Failed to share PDF.");
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4 print:hidden">
                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mr-2"><PrintIcon className="w-5 h-5 mr-2" /> Print</button>
                <button onClick={handleSharePdf} disabled={isSharing} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-400"><ShareIcon className="w-5 h-5 mr-2" /> {isSharing ? 'Generating...' : 'Share PDF'}</button>
            </div>

            <div id="printable-area" className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl mx-auto border-4 border-dashed border-gray-300 dark:border-gray-600">
                 <header className="flex justify-between items-center pb-4 border-b-2 border-dashed dark:border-gray-600">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">E-TICKET</h1>
                        {booking.pnr && <p className="text-sm">PNR: <span className="font-mono font-bold">{booking.pnr}</span></p>}
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{settings.businessName}</h2>
                        <p className="text-xs">{settings.phone}</p>
                    </div>
                </header>

                <section className="my-6">
                    <h3 className="text-lg font-semibold mb-2">Passengers</h3>
                    {booking.passengers.map((p, index) => (
                        <p key={index} className="font-bold text-xl">{p.name} <span className="text-sm font-normal">({p.type})</span></p>
                    ))}
                </section>

                <section className="space-y-6">
                    <FlightItinerarySection legs={booking.itinerary.outboundLegs} title="Outbound Journey" />
                    {booking.itinerary.returnLegs && <FlightItinerarySection legs={booking.itinerary.returnLegs} title="Return Journey" />}
                </section>
                
                <footer className="mt-8 pt-4 border-t-2 border-dashed dark:border-gray-600">
                    <TicketFooterInfo />
                    <p className="text-xs mt-4 text-center">Thank you for booking with {settings.businessName}</p>
                </footer>
            </div>
        </div>
    );
};

const FlightItinerarySection: React.FC<{legs: FlightLeg[], title: string}> = ({legs, title}) => (
    <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{title}</h3>
        {legs.map((leg, index) => {
            const LogoComponent = getAirlineLogo(leg.airline);
            return (
                <React.Fragment key={index}>
                    <div className="border rounded-lg dark:border-gray-600 mb-2">
                        <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                            {LogoComponent && <LogoComponent className="h-6 w-8 mr-3 object-contain" />}
                            <p className="font-bold">{leg.airline} <span className="font-normal text-sm text-gray-500">{leg.flightNumber}</span></p>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{leg.from}</p>
                                <p className="text-xs">Departure</p>
                                <p className="font-semibold">{new Date(leg.departureTime).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <p>&rarr;</p>
                                <p className="text-xs">{leg.duration}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{leg.to}</p>
                                <p className="text-xs">Arrival</p>
                                <p className="font-semibold">{new Date(leg.arrivalTime).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    {leg.layoverDuration && (
                        <div className="text-center text-xs text-red-500 mb-2 font-semibold">
                           &#8628; Layover in {leg.to}: {leg.layoverDuration}
                        </div>
                    )}
                </React.Fragment>
            )
        })}
    </div>
)

export default OnlineTicketDetail;