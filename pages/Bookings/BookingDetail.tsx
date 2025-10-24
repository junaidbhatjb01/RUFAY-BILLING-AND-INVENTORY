import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { PrintIcon, ShareIcon, TrashIcon } from '../../components/ui/Icons';
import { Booking, Party, Invoice, Series } from '../../types';
import ClassicTicketTemplate from '../../components/templates/ticket/Classic';
import ModernTicketTemplate from '../../components/templates/ticket/Modern';
import MinimalistTicketTemplate from '../../components/templates/ticket/Minimalist';
import BoardingPassTicketTemplate from '../../components/templates/ticket/BoardingPass';
import DetailedItineraryTicketTemplate from '../../components/templates/ticket/DetailedItinerary';


// To make TypeScript happy with the CDN-loaded libraries
declare const jspdf: any;
declare const html2canvas: any;

const BookingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { bookings, series, parties, invoices, settings, deleteBooking } = useData();
    const navigate = useNavigate();
    const [isSharing, setIsSharing] = useState(false);

    const booking = bookings.find(b => b.id === id);

    if (!booking) return <div className="text-center text-red-500">Booking not found.</div>;
    
    const seriesInfo = series.find(s => s.id === booking.seriesId);
    const returnSeriesInfo = booking.returnSeriesId ? series.find(s => s.id === booking.returnSeriesId) : null;
    const party = parties.find(p => p.id === booking.partyId);
    const invoice = invoices.find(i=>i.id===booking.invoiceId);

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = () => {
        if (booking && window.confirm(`Are you sure you want to delete Booking #${settings.bookingPrefix || ''}${booking.bookingNumber}? This will also delete the associated invoice and restore seat inventory.`)) {
            deleteBooking(booking.id).then(() => {
                navigate('/bookings');
            });
        }
    };
    
    const handleSharePdf = async () => {
        setIsSharing(true);
        const ticketElement = document.getElementById('printable-area');
        if (!ticketElement || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert("PDF generation library is not available.");
            setIsSharing(false);
            return;
        }

        try {
            const canvas = await html2canvas(ticketElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const fileName = `E-Ticket-${settings.bookingPrefix || ''}${booking.bookingNumber}.pdf`;
            const pdfBlob = pdf.output('blob');

            if (navigator.share) {
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                await navigator.share({
                    title: `E-Ticket ${settings.bookingPrefix || ''}${booking.bookingNumber}`,
                    text: `Here is your E-Ticket from ${settings.businessName}`,
                    files: [file],
                });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error("Error generating or sharing PDF:", error);
            alert("Failed to generate or share PDF.");
        } finally {
            setIsSharing(false);
        }
    };

    const renderTemplate = () => {
        if (!booking || !seriesInfo || !party || !invoice) return null;

        const templateProps = {
            booking,
            seriesInfo,
            returnSeriesInfo,
            party,
            invoice,
            settings
        };

        switch (settings.ticketTemplate) {
            case 'modern':
                return <ModernTicketTemplate {...templateProps} />;
            case 'minimalist':
                return <MinimalistTicketTemplate {...templateProps} />;
            case 'boardingPass':
                return <BoardingPassTicketTemplate {...templateProps} />;
            case 'detailedItinerary':
                return <DetailedItineraryTicketTemplate {...templateProps} />;
            case 'classic':
            default:
                return <ClassicTicketTemplate {...templateProps} />;
        }
    };


    return (
        <div>
            <div className="flex justify-end mb-4 print:hidden gap-2">
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center">
                    <TrashIcon className="w-5 h-5 mr-2" /> Delete Booking
                </button>
                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <PrintIcon className="w-5 h-5 mr-2" /> Print E-Ticket
                </button>
                 <button onClick={handleSharePdf} disabled={isSharing} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center disabled:bg-gray-400">
                    <ShareIcon className="w-5 h-5 mr-2" /> {isSharing ? 'Generating...' : 'Share PDF'}
                </button>
            </div>
            <div id="printable-area">
                {renderTemplate()}
            </div>
        </div>
    );
};

export default BookingDetail;