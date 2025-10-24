import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/Billing/CreateInvoice';
import InvoiceList from './pages/Billing/InvoiceList';
import InvoiceDetail from './pages/Billing/InvoiceDetail';
import ProductList from './pages/Stock/ProductList';
import PartyList from './pages/Parties/PartyList';
import ExpenseList from './pages/Expenses/ExpenseList';
import PaymentList from './pages/Payments/PaymentList';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import PartyDetail from './pages/Parties/PartyDetail';
import SeriesList from './pages/Series/SeriesList';
import BookingList from './pages/Bookings/BookingList';
import CreateBooking from './pages/Bookings/CreateBooking';
import BookingDetail from './pages/Bookings/BookingDetail';
import AboutPage from './pages/About';
import Login from './pages/auth/Login';
import QuotationList from './pages/Quotations/QuotationList';
import CreateQuotation from './pages/Quotations/CreateQuotation';
import QuotationDetail from './pages/Quotations/QuotationDetail';
import SalesOrderList from './pages/SalesOrders/SalesOrderList';
import CreateSalesOrder from './pages/SalesOrders/CreateSalesOrder';
import SalesOrderDetail from './pages/SalesOrders/SalesOrderDetail';

// New Online Booking Imports
import FlightSearch from './pages/OnlineBooking/FlightSearch';
import PassengerDetails from './pages/OnlineBooking/PassengerDetails';
import PendingBookings from './pages/OnlineBooking/PendingBookings';
import ConfirmedBookings from './pages/OnlineBooking/ConfirmedBookings';
import OnlineTicketDetail from './pages/OnlineBooking/OnlineTicketDetail';


const ProtectedRoute: React.FC<{ children: React.ReactElement, adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/" replace />; // Or a dedicated "Access Denied" page
  }

  return children;
};

const AppContent: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { fetchData, isLoading } = useData();

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, fetchData]);

    if (isLoading && isAuthenticated) {
        return <div className="flex justify-center items-center h-screen"><div>Loading Your Business Data...</div></div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={
                <ProtectedRoute>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/invoices" element={<InvoiceList />} />
                            <Route path="/invoices/new" element={<CreateInvoice />} />
                            <Route path="/invoices/:id" element={<InvoiceDetail />} />
                            <Route path="/invoices/:id/edit" element={<CreateInvoice />} />

                            <Route path="/quotations" element={<QuotationList />} />
                            <Route path="/quotations/new" element={<CreateQuotation />} />
                            <Route path="/quotations/:id" element={<QuotationDetail />} />

                            <Route path="/sales-orders" element={<SalesOrderList />} />
                            <Route path="/sales-orders/new" element={<CreateSalesOrder />} />
                            <Route path="/sales-orders/:id" element={<SalesOrderDetail />} />

                            <Route path="/stock" element={<ProductList />} />
                            <Route path="/parties" element={<PartyList />} />
                            <Route path="/parties/:id" element={<PartyDetail />} />
                            <Route path="/expenses" element={<ExpenseList />} />
                            <Route path="/payments" element={<PaymentList />} />
                            <Route path="/series" element={<SeriesList />} />
                            <Route path="/bookings" element={<BookingList />} />
                            <Route path="/bookings/new" element={<CreateBooking />} />
                            <Route path="/bookings/:id" element={<BookingDetail />} />
                            <Route path="/about" element={<AboutPage />} />

                             {/* Online Booking Routes */}
                            <Route path="/flight-search" element={<FlightSearch />} />
                            <Route path="/book-flight" element={<PassengerDetails />} />
                            <Route path="/pending-bookings" element={<PendingBookings />} />
                            <Route path="/confirmed-bookings" element={<ConfirmedBookings />} />
                            <Route path="/online-ticket/:id" element={<OnlineTicketDetail />} />
                            
                            <Route path="/reports" element={<ProtectedRoute adminOnly={true}><Reports /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>} />

                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <DataProvider>
              <AppContent />
          </DataProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;