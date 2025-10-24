import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
// FIX: Import QuotationStatus enum to be used when updating quotation status.
import { Product, Party, Invoice, Expense, Payment, Settings, Series, Booking, Quotation, SalesOrder, DataContextType, PaymentStatus, SalesOrderStatus, QuotationStatus, FlightItinerary, OnlineBooking, PassengerCounts, TripType } from '../types';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const defaultSettings: Settings = {
  businessName: 'Your Business Name',
  logo: null,
  address: '123 Business St, City',
  email: 'contact@business.com',
  phone: '123-456-7890',
  gstNumber: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
  upiQRCode: null,
  currency: '₹',
  invoiceCounter: 1,
  bookingCounter: 1,
  quotationCounter: 1,
  salesOrderCounter: 1,
  invoiceTemplate: 'classic',
  ticketTemplate: 'classic',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { dataOwnerId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [onlineBookings, setOnlineBookings] = useState<OnlineBooking[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const fetchData = useCallback(async () => {
    if (dataOwnerId) {
      setIsLoading(true);
      try {
        const data = await api.getData(dataOwnerId);
        setProducts(data.products);
        setParties(data.parties);
        setInvoices(data.invoices);
        setExpenses(data.expenses);
        setPayments(data.payments);
        setSeries(data.series);
        setBookings(data.bookings);
        setQuotations(data.quotations);
        setSalesOrders(data.salesOrders);
        setOnlineBookings(data.onlineBookings || []);
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to fetch data", error);
        // Handle error, maybe logout user or show an error message
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false);
    }
  }, [dataOwnerId]);

  const restoreData = async (data: any) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    await api.restoreData(dataOwnerId, data);
    await fetchData(); // Refresh all data in the app
  };

  const updateSettings = async (settingsData: Settings) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    const updatedSettings = await api.updateSettings(dataOwnerId, settingsData);
    setSettings(updatedSettings);
  };

  // CRUD Functions that call the API
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const newProduct = await api.addProduct(dataOwnerId, productData);
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (productData: Product) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const updatedProduct = await api.updateProduct(dataOwnerId, productData);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const deleteProduct = async (productId: string) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    try {
        await api.deleteProduct(dataOwnerId, productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error: any) {
        console.error("Failed to delete product:", error);
        alert(error.message || "An unexpected error occurred while deleting the product.");
    }
  };

  const addParty = async (partyData: Omit<Party, 'id'>): Promise<Party> => {
      if(!dataOwnerId) throw new Error("User not authenticated");
      const newParty = await api.addParty(dataOwnerId, partyData);
      setParties(prev => [...prev, newParty]);
      return newParty;
  };

  const updateParty = async (partyData: Party) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    const updatedParty = await api.updateParty(dataOwnerId, partyData);
    setParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
  };

  const deleteParty = async (partyId: string) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    try {
      await api.deleteParty(dataOwnerId, partyId);
      setParties(prev => prev.filter(p => p.id !== partyId));
    } catch (error: any) {
      console.error("Failed to delete party:", error);
      alert(error.message || "An unexpected error occurred while deleting the party.");
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>, salesOrderId?: string): Promise<Invoice> => {
      if(!dataOwnerId) throw new Error("User not authenticated");
      const { invoice, newSettings } = await api.addInvoice(dataOwnerId, invoiceData);
      setInvoices(prev => [...prev, invoice]);
      setSettings(newSettings);
      if (salesOrderId) {
        await updateSalesOrderStatus(salesOrderId, SalesOrderStatus.COMPLETED);
      }
      return invoice;
  };

  const updateInvoice = async (invoiceData: Invoice) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const updatedInvoice = await api.updateInvoice(dataOwnerId, invoiceData);
    setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!dataOwnerId) throw new Error("User not authenticated");

    const linkedBooking = bookings.find(b => b.invoiceId === invoiceId);
    if (linkedBooking) {
      alert(`This invoice is linked to Booking BKG-${linkedBooking.bookingNumber}. Please delete the booking to remove this invoice.`);
      return; // Prevent deletion
    }

    try {
      const paymentsToDelete = payments.filter(p => p.invoiceId === invoiceId);
      
      const deletionPromises = paymentsToDelete.map(p => api.deletePayment(dataOwnerId, p.id));
      deletionPromises.push(api.deleteInvoice(dataOwnerId, invoiceId));
      
      await Promise.all(deletionPromises);
      
      setInvoices(prev => prev.filter(i => i.id !== invoiceId));
      setPayments(prev => prev.filter(p => !paymentsToDelete.some(ptd => ptd.id === p.id)));
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        alert("An error occurred while deleting the invoice. Please try again.");
    }
  };

  const addQuotation = async (quoteData: Omit<Quotation, 'id' | 'quotationNumber'>): Promise<Quotation> => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const { quotation, newSettings } = await api.addQuotation(dataOwnerId, quoteData);
    setQuotations(prev => [...prev, quotation]);
    setSettings(newSettings);
    return quotation;
  };
  
  const updateQuotationStatus = async (id: string, status: Quotation['status']) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const updated = await api.updateQuotation(dataOwnerId, {id, status});
    setQuotations(prev => prev.map(q => q.id === id ? updated : q));
  }

  const addSalesOrder = async (orderData: Omit<SalesOrder, 'id' | 'salesOrderNumber'>): Promise<SalesOrder> => {
      if(!dataOwnerId) throw new Error("User not authenticated");
      const { salesOrder, newSettings } = await api.addSalesOrder(dataOwnerId, orderData);
      setSalesOrders(prev => [...prev, salesOrder]);
      setSettings(newSettings);
      if (orderData.quotationId) {
        // FIX: Use QuotationStatus enum instead of string literal to avoid type error.
        await updateQuotationStatus(orderData.quotationId, QuotationStatus.ACCEPTED);
      }
      return salesOrder;
  };

  const updateSalesOrderStatus = async (id: string, status: SalesOrder['status']) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const updated = await api.updateSalesOrder(dataOwnerId, {id, status});
    setSalesOrders(prev => prev.map(so => so.id === id ? updated : so));
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const newExpense = await api.addExpense(dataOwnerId, expenseData);
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = async (expenseData: Expense) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const updatedExpense = await api.updateExpense(dataOwnerId, expenseData);
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  const deleteExpense = async (expenseId: string) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    await api.deleteExpense(dataOwnerId, expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const newPayment = await api.addPayment(dataOwnerId, paymentData);
    setPayments(prev => [...prev, newPayment]);

    if (newPayment.invoiceId && newPayment.direction === 'in') {
        const invoice = invoices.find(inv => inv.id === newPayment.invoiceId);
        if (invoice) {
            const newAmountPaid = invoice.amountPaid + newPayment.amount;
            const newStatus = newAmountPaid >= invoice.total ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
            await updateInvoice({ ...invoice, amountPaid: newAmountPaid, status: newStatus });
        }
    }
  };

  const updatePayment = async (paymentData: Payment, originalPayment: Payment | null) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    const updatedPayment = await api.updatePayment(dataOwnerId, paymentData);

    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));

    const oldInvoiceId = originalPayment?.invoiceId;
    const newInvoiceId = updatedPayment.invoiceId;
    
    // Only 'in' payments affect invoice balances
    const oldAmount = (originalPayment?.direction === 'in' ? originalPayment.amount : 0) || 0;
    const newAmount = updatedPayment.direction === 'in' ? updatedPayment.amount : 0;

    if (oldInvoiceId === newInvoiceId && oldAmount === newAmount) {
      // No change in invoice-related data
      return;
    }

    setInvoices(currentInvoices => {
        let nextInvoices = [...currentInvoices];
        const updates = new Map<string, number>();

        // Calculate the net change for each affected invoice
        if (oldInvoiceId) {
            updates.set(oldInvoiceId, (updates.get(oldInvoiceId) || 0) - oldAmount);
        }
        if (newInvoiceId) {
            updates.set(newInvoiceId, (updates.get(newInvoiceId) || 0) + newAmount);
        }

        const apiUpdatePromises: Promise<Invoice>[] = [];

        updates.forEach((amountChange, invoiceId) => {
            const invoiceIndex = nextInvoices.findIndex(inv => inv.id === invoiceId);
            if (invoiceIndex !== -1) {
                const invoice = nextInvoices[invoiceIndex];
                const newAmountPaid = Math.max(0, invoice.amountPaid + amountChange);
                const newStatus = newAmountPaid >= invoice.total
                    ? PaymentStatus.PAID
                    : (newAmountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);
                
                const updatedInvoice = { ...invoice, amountPaid: newAmountPaid, status: newStatus };
                nextInvoices[invoiceIndex] = updatedInvoice;
                apiUpdatePromises.push(api.updateInvoice(dataOwnerId, updatedInvoice));
            }
        });

        // Fire off API calls to persist changes
        Promise.all(apiUpdatePromises).catch(error => {
            console.error("Failed to update invoices after payment change:", error);
        });

        return nextInvoices;
    });
  };

  const deletePayment = async (payment: Payment) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    try {
      await api.deletePayment(dataOwnerId, payment.id);
      setPayments(prev => prev.filter(p => p.id !== payment.id));
      
      if (payment.invoiceId && payment.direction === 'in') {
        const invoice = invoices.find(inv => inv.id === payment.invoiceId);
        if (invoice) {
            const newAmountPaid = invoice.amountPaid - payment.amount;
            let newStatus: PaymentStatus;
            if (newAmountPaid >= invoice.total) {
                newStatus = PaymentStatus.PAID;
            } else if (newAmountPaid > 0) {
                newStatus = PaymentStatus.PARTIAL;
            } else {
                newStatus = PaymentStatus.UNPAID;
            }
            await updateInvoice({ ...invoice, amountPaid: Math.max(0, newAmountPaid), status: newStatus });
        }
      }
    } catch(error) {
      console.error("Failed to delete payment:", error);
      alert("An error occurred while deleting the payment.");
    }
  };

  const addSeries = async (seriesData: Omit<Series, 'id'>) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const newSeries = await api.addSeries(dataOwnerId, seriesData);
    setSeries(prev => [...prev, newSeries]);
  };

  const updateSeries = async (seriesData: Series) => {
    if(!dataOwnerId) throw new Error("User not authenticated");
    const updatedSeries = await api.updateSeries(dataOwnerId, seriesData);
    setSeries(prev => prev.map(s => s.id === updatedSeries.id ? updatedSeries : s));
  };
  
  const deleteSeries = async (seriesId: string) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    try {
        await api.deleteSeries(dataOwnerId, seriesId);
        setSeries(prev => prev.filter(s => s.id !== seriesId));
    } catch (error: any) {
        console.error("Failed to delete series:", error);
        alert(error.message || "An unexpected error occurred while deleting the series.");
    }
  };
  
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'invoiceId'>) => {
      if(!dataOwnerId) throw new Error("User not authenticated");
      const { booking, newInvoice, updatedSeries, newSettings } = await api.addBooking(dataOwnerId, bookingData);
      
      setBookings(prev => [...prev, booking]);
      setInvoices(prev => [...prev, newInvoice]);
      setSeries(prev => prev.map(s => {
          const updated = updatedSeries.find(us => us.id === s.id);
          return updated ? updated : s;
      }));
      setSettings(newSettings);
  };

  const deleteBooking = async (bookingId: string) => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    try {
        const bookingToDelete = bookings.find(b => b.id === bookingId);
        if (!bookingToDelete) return;
        
        const invoiceId = bookingToDelete.invoiceId;
        const paymentsToDelete = payments.filter(p => p.invoiceId === invoiceId);

        await api.deleteBooking(dataOwnerId, bookingId);
        
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        if (invoiceId) {
            setInvoices(prev => prev.filter(i => i.id !== invoiceId));
            setPayments(prev => prev.filter(p => !paymentsToDelete.some(ptd => ptd.id === p.id)));
        }

        const seatsToRestore = bookingToDelete.passengers.length;
        setSeries(prevSeries => prevSeries.map(s => {
            if (s.id === bookingToDelete.seriesId || s.id === bookingToDelete.returnSeriesId) {
                return { ...s, availableSeats: s.availableSeats + seatsToRestore };
            }
            return s;
        }));

    } catch (error) {
        console.error("Failed to delete booking:", error);
        alert("An error occurred while deleting the booking.");
    }
  };

  // --- New Online Booking Functions ---
  const searchFlights = async (
    from: string,
    to: string,
    departureDate: string,
    returnDate: string | undefined,
    passengers: PassengerCounts,
    tripType: TripType
  ): Promise<FlightItinerary[]> => {
    if (!dataOwnerId) throw new Error("User not authenticated");
    return await api.searchFlights(from, to, departureDate, returnDate, passengers, tripType);
  };

  const addOnlineBooking = async (bookingData: Omit<OnlineBooking, 'id' | 'bookingDate' | 'status'>): Promise<OnlineBooking> => {
      if (!dataOwnerId) throw new Error("User not authenticated");
      const newBooking = await api.addOnlineBooking(dataOwnerId, bookingData);
      setOnlineBookings(prev => [...prev, newBooking]);
      return newBooking;
  };
  
  const updateOnlineBooking = async (bookingId: string, pnr: string): Promise<OnlineBooking> => {
      if (!dataOwnerId) throw new Error("User not authenticated");
      const updatedBooking = await api.updateOnlineBooking(dataOwnerId, bookingId, pnr);
      setOnlineBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
      return updatedBooking;
  };

  return (
    <DataContext.Provider value={{
        products, parties, invoices, expenses, payments, series, bookings, quotations, salesOrders, onlineBookings, settings,
        addProduct, updateProduct, deleteProduct,
        addParty, updateParty, deleteParty,
        updateSettings, addInvoice, updateInvoice, deleteInvoice,
        addQuotation, updateQuotationStatus,
        addSalesOrder, updateSalesOrderStatus,
        addExpense, updateExpense, deleteExpense,
        addPayment, updatePayment, deletePayment,
        addSeries, updateSeries, deleteSeries,
        addBooking, deleteBooking,
        searchFlights, addOnlineBooking, updateOnlineBooking,
        isLoading, fetchData, restoreData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
