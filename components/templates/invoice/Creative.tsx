import React from 'react';
import { Invoice, Party, Settings } from '../../../types';
import { getAirlineLogo, extractAirlineName } from '../../ui/AirlineLogos';

interface TemplateProps {
    invoice: Invoice;
    party: Party;
    settings: Settings;
}

const CreativeInvoiceTemplate: React.FC<TemplateProps> = ({ invoice, party, settings }) => {
    const balanceDue = invoice.total - invoice.amountPaid;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg flex flex-col md:flex-row">
            <aside className="w-full md:w-1/3 bg-teal-500 text-white p-8 rounded-l-lg">
                <h1 className="text-3xl font-bold mb-4">{settings.businessName}</h1>
                <div className="space-y-2 text-sm">
                    <p>{settings.address}</p>
                    <p>{settings.email}</p>
                    <p>{settings.phone}</p>
                </div>
                <div className="mt-8 border-t border-teal-400 pt-4">
                    <h3 className="font-semibold">Bill To:</h3>
                    <p className="font-bold text-lg">{party?.name}</p>
                    <p className="text-sm">{party?.address}</p>
                </div>
                <div className="mt-8">
                    <p className="text-sm">TOTAL DUE</p>
                    <p className="text-4xl font-bold">{settings.currency}{balanceDue.toFixed(2)}</p>
                </div>
            </aside>
            <main className="w-full md:w-2/3 p-8">
                <div className="text-right mb-8">
                    <h2 className="text-4xl font-bold text-gray-700 dark:text-gray-300">INVOICE</h2>
                    <p className="text-gray-500"># {settings.invoicePrefix || ''}{invoice.invoiceNumber}</p>
                    <p className="text-gray-500">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                 <table className="w-full text-left text-sm mb-8">
                    <thead className="border-b-2 dark:border-gray-600">
                        <tr>
                            <th className="py-2">Description</th>
                            <th className="py-2 text-right">Rate</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {invoice.items.map((item, index) => {
                            const airlineName = extractAirlineName(item.productName);
                            const LogoComponent = airlineName ? getAirlineLogo(airlineName) : null;
                            return (
                                <tr key={index}>
                                    <td className="py-2">
                                        <div className="flex items-center">
                                            {LogoComponent && <LogoComponent className="h-5 w-7 mr-2 object-contain"/>}
                                            <span>{item.productName}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 text-right">{settings.currency}{item.rate.toFixed(2)}</td>
                                    <td className="py-2 text-right">{item.quantity}</td>
                                    <td className="py-2 text-right">{settings.currency}{((item.rate * item.quantity) * (1-item.discount/100)).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 <div className="flex justify-end">
                    <div className="w-full max-w-xs text-sm">
                        <div className="flex justify-between py-1"><span className="text-gray-500 dark:text-gray-400">Grand Total:</span><span className="font-bold">{settings.currency}{invoice.total.toFixed(2)}</span></div>
                        <div className="flex justify-between py-1"><span className="text-gray-500 dark:text-gray-400">Amount Paid:</span><span className="font-bold">-{settings.currency}{invoice.amountPaid.toFixed(2)}</span></div>
                    </div>
                 </div>
            </main>
        </div>
    );
};

export default CreativeInvoiceTemplate;