
import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';

const ReportCard: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
    </div>
);


const Reports: React.FC = () => {
    const { invoices, products, expenses, settings } = useData();

    const salesToday = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return invoices.filter(inv => inv.date === today).reduce((sum, inv) => sum + inv.total, 0);
    }, [invoices]);

    const salesThisMonth = useMemo(() => {
        const thisMonth = new Date().toISOString().slice(0, 7);
        return invoices.filter(inv => inv.date.startsWith(thisMonth)).reduce((sum, inv) => sum + inv.total, 0);
    }, [invoices]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Reports</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="font-semibold text-gray-700 dark:text-gray-300">Sales Today</h2>
                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{settings.currency}{salesToday.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="font-semibold text-gray-700 dark:text-gray-300">Sales This Month</h2>
                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{settings.currency}{salesThisMonth.toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard title="Sales Report" description="Detailed report of all sales by date, customer, and product."/>
                <ReportCard title="Profit & Loss" description="Summary of your revenue, costs, and expenses to calculate profit."/>
                <ReportCard title="Stock Summary" description="Current stock levels, low stock items, and stock value."/>
                <ReportCard title="Expense Report" description="Breakdown of all your business expenses by category and date."/>
                <ReportCard title="Party-wise Report" description="View outstanding balances and transaction history for each customer/supplier."/>
                <ReportCard title="GST Report" description="(Coming Soon) Generate reports for GST filing."/>
            </div>
            <p className="text-center mt-8 text-sm text-gray-500">More detailed reports are under development.</p>
        </div>
    );
};

export default Reports;