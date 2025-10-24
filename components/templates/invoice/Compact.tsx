import React from 'react';
import { Invoice, Party, Settings } from '../../../types';
import { getAirlineLogo, extractAirlineName } from '../../ui/AirlineLogos';

interface TemplateProps {
    invoice: Invoice;
    party: Party;
    settings: Settings;
}

const CompactInvoiceTemplate: React.FC<TemplateProps> = ({ invoice, party, settings }) => {
    const balanceDue = invoice.total - invoice.amountPaid;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 shadow-md text-sm">
            <header className="grid grid-cols-2 gap-4 pb-4 border-b dark:border-gray-700">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{settings.businessName}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{settings.address}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{settings.email} | {settings.phone}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400">INVOICE</h2>
                    <p className="text-xs"># {settings.invoicePrefix || ''}{invoice.invoiceNumber}</p>
                    <p className="text-xs">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </header>

            <section className="my-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-xs">BILL TO:</h3>
                <p className="font-bold">{party?.name}</p>
                <p className="text-xs">{party?.address}</p>
                <p className="text-xs">{party?.phone}</p>
            </section>

            <section>
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-2 font-semibold">Item</th>
                            <th className="p-2 font-semibold text-right">Rate</th>
                            <th className="p-2 font-semibold text-right">Qty</th>
                            <th className="p-2 font-semibold text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {invoice.items.map((item, index) => {
                            const airlineName = extractAirlineName(item.productName);
                            const LogoComponent = airlineName ? getAirlineLogo(airlineName) : null;
                            return (
                                <tr key={index}>
                                    <td className="p-2">
                                        <div className="flex items-center">
                                            {LogoComponent && <LogoComponent className="h-4 w-6 mr-2 object-contain"/>}
                                            <span>{item.productName}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 text-right">{settings.currency}{item.rate.toFixed(2)}</td>
                                    <td className="p-2 text-right">{item.quantity}</td>
                                    <td className="p-2 text-right font-medium">{settings.currency}{((item.rate * item.quantity) * (1-item.discount/100)).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="border-t-2 dark:border-gray-600 font-semibold">
                        <tr>
                            <td colSpan={3} className="p-2 text-right">Total:</td>
                            <td className="p-2 text-right">{settings.currency}{invoice.total.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="p-2 text-right">Paid:</td>
                            <td className="p-2 text-right">-{settings.currency}{invoice.amountPaid.toFixed(2)}</td>
                        </tr>
                        <tr className={`${balanceDue > 0 ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : ''}`}>
                            <td colSpan={3} className="p-2 text-right">Balance Due:</td>
                            <td className="p-2 text-right">{settings.currency}{balanceDue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>
        </div>
    );
};

export default CompactInvoiceTemplate;