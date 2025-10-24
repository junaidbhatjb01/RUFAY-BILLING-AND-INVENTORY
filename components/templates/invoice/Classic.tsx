import React from 'react';
import { Invoice, Party, Payment, Settings } from '../../../types';
import { getAirlineLogo, extractAirlineName } from '../../ui/AirlineLogos';

interface TemplateProps {
    invoice: Invoice;
    party: Party;
    settings: Settings;
    associatedPayments: Payment[];
}

const ClassicInvoiceTemplate: React.FC<TemplateProps> = ({ invoice, party, settings, associatedPayments }) => {
    
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
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <header className="flex justify-between items-start pb-6 border-b dark:border-gray-700">
                <div className="flex items-center">
                    {settings.logo && <img src={settings.logo} alt="Business Logo" className="h-16 w-16 mr-4 object-contain" />}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{settings.businessName}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{settings.address}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{settings.email} | {settings.phone}</p>
                        {settings.gstNumber && <p className="text-sm text-gray-500 dark:text-gray-400">GSTIN: {settings.gstNumber}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400">INVOICE</h2>
                    <p className="text-sm"># INV-{invoice.invoiceNumber}</p>
                    <p className="text-sm">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </header>

            <section className="flex justify-between my-6">
                <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Bill To:</h3>
                    <p className="font-bold">{party?.name}</p>
                    <p>{party?.address}</p>
                    <p>{party?.phone}</p>
                    {party?.email && <p>{party.email}</p>}
                </div>
            </section>

            <section>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-sm font-semibold">Item</th>
                            <th className="p-3 text-sm font-semibold text-right">Rate</th>
                            <th className="p-3 text-sm font-semibold text-right">Qty</th>
                            <th className="p-3 text-sm font-semibold text-right">Discount</th>
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
                                    <td className="p-3 text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                                    <td className="p-3 text-right font-medium">{settings.currency}{((item.rate * item.quantity) * (1-item.discount/100)).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>
            
            <section className="flex justify-end mt-6">
                <div className="w-full max-w-xs text-sm">
                    <div className="flex justify-between py-1"><span className="text-gray-500 dark:text-gray-400">Subtotal:</span><span>{settings.currency}{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between py-1"><span className="text-gray-500 dark:text-gray-400">Tax ({invoice.tax}%):</span><span>{settings.currency}{taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between py-2 border-t-2 dark:border-gray-600 mt-2 font-bold text-lg"><span >Total:</span><span>{settings.currency}{invoice.total.toFixed(2)}</span></div>
                    <div className="flex justify-between py-1"><span className="text-gray-500 dark:text-gray-400">Amount Paid:</span><span>-{settings.currency}{invoice.amountPaid.toFixed(2)}</span></div>
                    <div className={`flex justify-between py-1 p-2 rounded font-semibold ${balanceDue > 0 ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <span >Balance Due:</span><span>{settings.currency}{balanceDue.toFixed(2)}</span>
                    </div>
                </div>
            </section>
            
            {associatedPayments.length > 0 && (
                <section className="mt-6 pt-4 border-t dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment History</h3>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-2 font-semibold">Date</th>
                                <th className="p-2 font-semibold">Type</th>
                                <th className="p-2 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {associatedPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td className="p-2">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="p-2">{payment.type}</td>
                                    <td className="p-2 text-right">{settings.currency}{payment.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            <footer className="mt-8 pt-6 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Payment Details:</p>
                        {settings.bankName && <p><strong>Bank:</strong> {settings.bankName}</p>}
                        {settings.accountNumber && <p><strong>Account #:</strong> {settings.accountNumber}</p>}
                        {settings.ifscCode && <p><strong>IFSC:</strong> {settings.ifscCode}</p>}
                        {settings.upiId && <p><strong>UPI ID:</strong> {settings.upiId}</p>}
                    </div>
                    {settings.upiQRCode && (
                        <div className="text-center">
                            <p className="font-semibold text-xs">Scan to Pay</p>
                            <img src={settings.upiQRCode} alt="UPI QR Code" className="h-24 w-24 object-contain" />
                        </div>
                    )}
                </div>
                <p className="mt-4 text-center">Thank you for your business!</p>
                <p className="text-center text-xs mt-1">RuFay – Bill Fast. Grow Smart.</p>
            </footer>
        </div>
    );
};

export default ClassicInvoiceTemplate;
