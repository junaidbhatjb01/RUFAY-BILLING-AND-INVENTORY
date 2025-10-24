import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { PrintIcon, ShareIcon } from '../../components/ui/Icons';
import ClassicInvoiceTemplate from '../../components/templates/invoice/Classic';
import ModernInvoiceTemplate from '../../components/templates/invoice/Modern';
import CompactInvoiceTemplate from '../../components/templates/invoice/Compact';
import CreativeInvoiceTemplate from '../../components/templates/invoice/Creative';
import ProfessionalInvoiceTemplate from '../../components/templates/invoice/Professional';


// To make TypeScript happy with the CDN-loaded libraries
declare const jspdf: any;
declare const html2canvas: any;

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices, parties, settings, payments } = useData();
  const [isSharing, setIsSharing] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);

  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return <div className="text-center text-red-500">Invoice not found.</div>;
  }

  const party = parties.find(p => p.id === invoice.partyId);
  const associatedPayments = payments.filter(p => p.invoiceId === invoice.id);
  
  const handlePrint = (copies: number) => {
    setIsPrintModalOpen(false);
    const printableArea = document.getElementById('printable-area');
    if (!printableArea) return;

    let printContainer = document.getElementById('print-container');
    if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        document.body.appendChild(printContainer);
    }

    printContainer.innerHTML = '';

    for (let i = 0; i < copies; i++) {
        const copy = document.createElement('div');
        copy.classList.add('print-copy');
        copy.innerHTML = printableArea.innerHTML;
        printContainer.appendChild(copy);
    }
    
    window.print();
    
    setTimeout(() => {
        if (printContainer) {
            printContainer.innerHTML = '';
        }
    }, 1000);
  };

  const handleSharePdf = async () => {
    setIsSharing(true);
    const invoiceElement = document.getElementById('printable-area');
    if (!invoiceElement || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert("PDF generation library is not available.");
        setIsSharing(false);
        return;
    }

    try {
        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const fileName = `Invoice-${settings.invoicePrefix || ''}${invoice.invoiceNumber}.pdf`;
        const pdfBlob = pdf.output('blob');

        if (navigator.share) {
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            await navigator.share({
                title: `Invoice ${settings.invoicePrefix || ''}${invoice.invoiceNumber}`,
                text: `Here is the invoice from ${settings.businessName}`,
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
    if (!invoice || !party) return null;
    
    const templateProps = {
        invoice,
        party,
        settings,
        associatedPayments,
    };

    switch (settings.invoiceTemplate) {
        case 'modern':
            return <ModernInvoiceTemplate {...templateProps} />;
        case 'compact':
            return <CompactInvoiceTemplate {...templateProps} />;
        case 'creative':
            return <CreativeInvoiceTemplate {...templateProps} />;
        case 'professional':
            return <ProfessionalInvoiceTemplate {...templateProps} />;
        case 'classic':
        default:
            return <ClassicInvoiceTemplate {...templateProps} />;
    }
  };


  return (
    <div>
        <div className="flex justify-end mb-4 print:hidden">
            <button onClick={() => setIsPrintModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mr-2">
                <PrintIcon className="w-5 h-5 mr-2" /> Print
            </button>
            <button onClick={handleSharePdf} disabled={isSharing} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center disabled:bg-gray-400">
                <ShareIcon className="w-5 h-5 mr-2" /> {isSharing ? 'Generating...' : 'Share PDF'}
            </button>
        </div>

        <div id="printable-area">
            {renderTemplate()}
        </div>

        {isPrintModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                    <h2 className="text-xl font-bold mb-4">Print Invoice</h2>
                    <label htmlFor="copies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Copies:</label>
                    <input
                        type="number"
                        id="copies"
                        value={printCopies}
                        onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                    />
                    <div className="flex justify-end mt-6">
                        <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button onClick={() => handlePrint(printCopies)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Print</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default InvoiceDetail;