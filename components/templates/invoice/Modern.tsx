import React from 'react';
import { Invoice, Party, Payment, Settings } from '../../../types';
import { getAirlineLogo, extractAirlineName } from '../../ui/AirlineLogos';

interface TemplateProps {
    invoice: Invoice;
    party: Party;
    settings: Settings;
    associatedPayments: Payment[];
}

const ModernInvoiceTemplate: React.FC<TemplateProps> = ({ invoice, party, settings, associatedPayments }) => {
    
    const calculateSubtotal = () => {
        return invoice.items.reduce((acc, item) => {
            const itemTotal = item.rate * item.quantity;
            const discountAmount = itemTotal * (item.discount / 100);
            return acc + (itemTotal - discountAmount);
        }, 0);
    };
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (invoice.tax / 100);
    const balanceDue = invoice.total - invoice.amountPaid;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <header className="flex justify-between items-start p-8 bg-teal-50 dark:bg-teal-900">
                <div className="flex items-center">
                    {settings.logo && <img src={settings.logo} alt="Business Logo" className="h-16 w-16 mr-4 object-contain" />}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{settings.businessName}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{settings.address}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400">INVOICE</h2>
                    <p className="text-sm"># INV-{invoice.invoiceNumber}</p>
                    <p className="text-sm">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </header>
            
            <div className="p-8">
                <section className="flex justify-between my-6">
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Bill To:</h3>
                        <p className="font-bold">{party?.name}</p>
                        <p>{party?.address}</p>
                        <p>{party?.phone}</p>
                    </div>
                     <div className="text-right">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Payment Due:</h3>
                        <p className={`font-bold text-2xl ${balanceDue > 0 ? 'text-red-500' : 'text-green-500'}`}>{settings.currency}{balanceDue.toFixed(2)}</p>
                    </div>
                </section>

                <section>
                    <table className="w-full text-left">
                        <thead className="border-b-2 dark:border-teal-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold">Item</th>
                                <th className="p-3 text-sm font-semibold text-right">Rate</th>
                                <th className="p-3 text-sm font-semibold text-right">Qty</th>
                                <th className="p-3 text-sm font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {invoice.items.map((item, index) => {
                                const airlineName = extractAirlineName(item.productName);
                                const LogoComponent = airlineName ? getAirlineLogo(airlineName) : null;
                                return (
                                <tr key={index}>
                                    <td className="p-3">
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
                
                <section className="flex justify-end mt-6">
                    <div className="w-full max-w-xs text-sm">
                        <div className="flex justify-between py-1"><span>Subtotal:</span><span>{settings.currency}{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between py-1"><span>Tax ({invoice.tax}%):</span><span>{settings.currency}{taxAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between py-2 mt-2 font-bold text-lg"><span>Total:</span><span>{settings.currency}{invoice.total.toFixed(2)}</span></div>
                    </div>
                </section>

                <footer className="mt-8 pt-6 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                     <p className="text-center">Thank you for your business!</p>
                </footer>
            </div>
        </div>
    );
};

export default ModernInvoiceTemplate;
