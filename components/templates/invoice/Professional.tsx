import React from 'react';
import { Invoice, Party, Settings } from '../../../types';
import { getAirlineLogo, extractAirlineName } from '../../ui/AirlineLogos';

interface TemplateProps {
    invoice: Invoice;
    party: Party;
    settings: Settings;
}

const ProfessionalInvoiceTemplate: React.FC<TemplateProps> = ({ invoice, party, settings }) => {
    const balanceDue = invoice.total - invoice.amountPaid;

    return (
        <div className="bg-white dark:bg-gray-800 p-8 shadow-md border-t-8 border-blue-600">
            <header className="flex justify-between items-start pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{settings.businessName}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{settings.address}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-light text-gray-500">INVOICE</h2>
                    <p className="font-bold text-lg"># INV-{invoice.invoiceNumber}</p>
                </div>
            </header>

            <section className="grid grid-cols-3 gap-4 my-8">
                <div className="col-span-2">
                    <h3 className="font-semibold text-gray-500 text-sm">BILLED TO</h3>
                    <p className="font-bold text-lg">{party?.name}</p>
                    <p>{party?.address}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-semibold text-gray-500 text-sm">DATE OF ISSUE</h3>
                    <p className="font-bold text-lg">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </section>

            <section>
                <table className="w-full text-left">
                    <thead className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        <tr>
                            <th className="p-3 text-sm font-semibold">DESCRIPTION</th>
                            <th className="p-3 text-sm font-semibold text-right">RATE</th>
                            <th className="p-3 text-sm font-semibold text-right">QTY</th>
                            <th className="p-3 text-sm font-semibold text-right">LINE TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {invoice.items.map((item, index) => {
                            const airlineName = extractAirlineName(item.productName);
                            const LogoComponent = airlineName ? getAirlineLogo(airlineName) : null;
                            return (
                                <tr key={index}>
                                    <td className="p-3 font-medium">
                                        <div className="flex items-center">
                                            {LogoComponent && <LogoComponent className="h-5 w-7 mr-2 object-contain"/>}
                                            <span>{item.productName}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">{settings.currency}{item.rate.toFixed(2)}</td>
                                    <td className="p-3 text-right">{item.quantity}</td>
                                    <td className="p-3 text-right font-medium">{settings.currency}{((item.rate * item.quantity) * (1-item.discount/100)).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>
            
            <section className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-sm text-gray-500">
                    <p className="font-bold text-gray-700 dark:text-gray-300">Payment Instructions</p>
                    <p>Bank: {settings.bankName}</p>
                    <p>Account: {settings.accountNumber}</p>
                </div>
                <div className="text-right">
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <p className="text-gray-500">Total Amount Due</p>
                        <p className="font-bold text-3xl text-blue-700 dark:text-blue-300">{settings.currency}{balanceDue.toFixed(2)}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfessionalInvoiceTemplate;
