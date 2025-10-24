
import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Invoice, Party, PaymentStatus, PartyType, Product } from '../types';
import { AlertTriangleIcon, InvoiceIcon, MoneyIcon, PartyIcon, ProductIcon } from '../components/ui/Icons';

const DashboardCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { invoices, products, expenses, parties, settings } = useData();

  const stats = useMemo(() => {
    const totalSales = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const totalDues = totalSales - totalPaid;
    
    const stockValue = products.reduce((acc, prod) => acc + (prod.purchasePrice * prod.stock), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Simplified profit calculation
    const costOfGoodsSold = invoices.reduce((acc, inv) => {
      return acc + inv.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + (product ? product.purchasePrice * item.quantity : 0);
      }, 0);
    }, 0);

    const profit = totalSales - costOfGoodsSold - totalExpenses;

    return { totalSales, totalDues, stockValue, profit };
  }, [invoices, products, expenses]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= p.lowStockThreshold);
  }, [products]);

  const unpaidInvoices = useMemo(() => {
    return invoices.filter(inv => inv.status !== PaymentStatus.PAID);
  }, [invoices]);
  
  const getPartyName = (id: string) => parties.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Sales" value={`${settings.currency}${stats.totalSales.toFixed(2)}`} icon={<InvoiceIcon className="w-6 h-6 text-white"/>} color="bg-teal-500" />
        <DashboardCard title="Profit" value={`${settings.currency}${stats.profit.toFixed(2)}`} icon={<MoneyIcon className="w-6 h-6 text-white"/>} color="bg-green-500" />
        <DashboardCard title="Stock Value" value={`${settings.currency}${stats.stockValue.toFixed(2)}`} icon={<ProductIcon className="w-6 h-6 text-white"/>} color="bg-blue-500" />
        <DashboardCard title="Total Dues" value={`${settings.currency}${stats.totalDues.toFixed(2)}`} icon={<PartyIcon className="w-6 h-6 text-white"/>} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold flex items-center">
            <AlertTriangleIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Low Stock Alerts
          </h2>
          {lowStockProducts.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {lowStockProducts.map(p => (
                <li key={p.id} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-700">
                  <span>{p.name}</span>
                  <span className="font-semibold text-red-500">Qty: {p.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">No items are low on stock. Well done!</p>
          )}
          <Link to="/stock" className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 text-sm mt-4 inline-block">Manage Stock &rarr;</Link>
        </div>

        {/* Payment Reminders */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold flex items-center">
            <MoneyIcon className="w-5 h-5 mr-2 text-red-500" />
            Payment Reminders
          </h2>
          {unpaidInvoices.length > 0 ? (
             <ul className="mt-4 space-y-2 text-sm">
              {unpaidInvoices.slice(0, 5).map(inv => (
                <li key={inv.id} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-700">
                  <Link to={`/invoices/${inv.id}`} className="hover:underline">INV-{inv.invoiceNumber}</Link>
                  <span>{getPartyName(inv.partyId)}</span>
                  <span className="font-semibold text-red-500">{settings.currency}{(inv.total - inv.amountPaid).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">All payments are cleared. Great job!</p>
          )}
           <Link to="/invoices" className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 text-sm mt-4 inline-block">View All Invoices &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;