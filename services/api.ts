// A mock API to simulate a backend.
// In a real app, this would be making fetch calls to a server.
import { User, Product, Party, Invoice, Settings, Quotation, SalesOrder, Expense, Payment, Series, Booking, InvoiceItem, PaymentStatus, FlightItinerary, OnlineBooking, TripType, PassengerCounts } from '../types';
import { GoogleGenAI } from '@google/genai';

const MOCK_DELAY = 300; // Simulate network latency

const defaultUserData = { 
    products: [], 
    parties: [], 
    invoices: [], 
    expenses: [], 
    payments: [], 
    series: [], 
    bookings: [], 
    quotations: [], 
    salesOrders: [], 
    onlineBookings: [],
    settings: { 
        businessName: 'RUFAY Travels', 
        logo: null, 
        address: '123 Business St', 
        email: 'my@business.com', 
        phone: '123-456-7890', 
        gstNumber: '', 
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        upiQRCode: null,
        currency: '₹', 
        invoiceCounter: 1, 
        invoicePrefix: 'INV-',
        bookingCounter: 1, 
        bookingPrefix: 'BKG-',
        quotationCounter: 1, 
        quotationPrefix: 'Q-',
        salesOrderCounter: 1,
        salesOrderPrefix: 'SO-',
        invoiceTemplate: 'classic',
        ticketTemplate: 'classic',
    } 
};

// Mock database in localStorage
const getDb = () => {
    const db = localStorage.getItem('rufay_cloud_db');
    if (db) {
        return JSON.parse(db);
    }
    // Initialize with an empty database. Users must sign up.
    return {
        users: [],
        data: {}
    };
};

const saveDb = (db: any) => {
    localStorage.setItem('rufay_cloud_db', JSON.stringify(db));
};

// --- AUTH ---
export const signup = (email: string, password: string): Promise<{ user: User, token: string }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const existingUser = db.users.find((u: any) => u.email === email);
            if (existingUser) {
                return reject(new Error('An account with this email already exists.'));
            }

            const isFirstUser = db.users.length === 0;
            const newUserId = `user-${Date.now()}`;
            // FIX: Explicitly type `newUser` to match the `User` interface (plus the password)
            // to ensure the 'role' property is correctly typed as '"admin" | "staff"' and not widened to 'string'.
            const newUser: User & { password: string } = {
                id: newUserId,
                email,
                password, // In a real app, this would be hashed
                role: isFirstUser ? 'admin' : 'staff',
                adminId: newUserId, // For admins, adminId is their own id
            };
            
            db.users.push(newUser);
            db.data[newUser.id] = JSON.parse(JSON.stringify(defaultUserData)); // Deep copy
            db.data[newUser.id].settings.email = email;

            saveDb(db);
            
            const { password: _, ...userToReturn } = newUser;
            const token = `mock-token-for-${userToReturn.id}`;

            resolve({ user: userToReturn, token });

        }, MOCK_DELAY);
    });
};


export const login = (email: string, password: string): Promise<{ user: User, token: string }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const userRecord = db.users.find((u: any) => u.email === email && u.password === password);
            if (userRecord) {
                const { password, ...user } = userRecord;
                const token = `mock-token-for-${user.id}`;
                resolve({ user, token });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, MOCK_DELAY);
    });
};

export const addStaff = (adminId: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const existingUser = db.users.find((u: any) => u.email === email);
            if (existingUser) {
                return reject(new Error('An account with this email already exists.'));
            }
            // FIX: Explicitly type `newStaff` to match the `User` interface (plus the password)
            // to ensure the 'role' property is correctly typed as 'staff' and not widened to 'string'.
            const newStaff: User & { password: string } = {
                id: `user-${Date.now()}`,
                email,
                password,
                role: 'staff',
                adminId,
            };
            db.users.push(newStaff);
            saveDb(db);
            const { password: _, ...staffToReturn } = newStaff;
            resolve(staffToReturn);
        }, MOCK_DELAY);
    });
};

export const getStaff = (adminId: string): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const staff = db.users
                .filter((u: any) => u.adminId === adminId && u.role === 'staff')
                .map(({ password, ...rest }: any) => rest);
            resolve(staff);
        }, MOCK_DELAY);
    });
};

export const changeEmail = (userId: string, newEmail: string, currentPassword: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const userIndex = db.users.findIndex((u: any) => u.id === userId);
            if (userIndex === -1) {
                return reject(new Error('User not found.'));
            }
            if (db.users[userIndex].password !== currentPassword) {
                return reject(new Error('Incorrect password.'));
            }
            db.users[userIndex].email = newEmail;
            saveDb(db);
            const { password, ...updatedUser } = db.users[userIndex];
            resolve(updatedUser);
        }, MOCK_DELAY);
    });
};

export const changePassword = (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const userIndex = db.users.findIndex((u: any) => u.id === userId);
            if (userIndex === -1) {
                return reject(new Error('User not found.'));
            }
            if (db.users[userIndex].password !== currentPassword) {
                return reject(new Error('Incorrect password.'));
            }
            db.users[userIndex].password = newPassword;
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- DATA (All functions now use ownerId) ---
export const getData = (ownerId: string): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            resolve(db.data[ownerId] || defaultUserData);
        }, MOCK_DELAY);
    });
};

export const exportData = (ownerId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            if (db.data[ownerId]) {
                resolve(db.data[ownerId]);
            } else {
                reject(new Error("No data found for this user."));
            }
        }, MOCK_DELAY);
    });
};

export const restoreData = (ownerId: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Basic validation to ensure the structure is somewhat correct
            if (data && data.settings && Array.isArray(data.products)) {
                const db = getDb();
                db.data[ownerId] = data;
                saveDb(db);
                resolve();
            } else {
                reject(new Error("Invalid backup file format."));
            }
        }, MOCK_DELAY);
    });
};


export const updateSettings = (ownerId: string, settings: Settings): Promise<Settings> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            db.data[ownerId].settings = settings;
            saveDb(db);
            resolve(settings);
        }, MOCK_DELAY);
    });
};

// --- PRODUCTS ---
export const addProduct = (ownerId: string, productData: Omit<Product, 'id'>): Promise<Product> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const newProduct = { ...productData, id: Date.now().toString() };
            db.data[ownerId].products.push(newProduct);
            saveDb(db);
            resolve(newProduct);
        }, MOCK_DELAY);
    });
};

export const updateProduct = (ownerId: string, productData: Product): Promise<Product> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].products.findIndex((p: Product) => p.id === productData.id);
            if (index > -1) {
                db.data[ownerId].products[index] = productData;
            }
            saveDb(db);
            resolve(productData);
        }, MOCK_DELAY);
    });
};

export const deleteProduct = (ownerId: string, productId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const data = db.data[ownerId];
            if (!data) {
                return reject(new Error("User data not found."));
            }

            const isProductInUse = 
                data.invoices?.some((i: Invoice) => i.items.some(item => item.productId === productId)) ||
                data.quotations?.some((q: Quotation) => q.items.some(item => item.productId === productId)) ||
                data.salesOrders?.some((so: SalesOrder) => so.items.some(item => item.productId === productId));

            if (isProductInUse) {
                return reject(new Error("Cannot delete product. It is part of an existing invoice, quotation, or sales order."));
            }

            data.products = data.products.filter((p: Product) => p.id !== productId);
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- PARTIES ---
export const addParty = (ownerId: string, partyData: Omit<Party, 'id'>): Promise<Party> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const newParty = { ...partyData, id: Date.now().toString() };
            db.data[ownerId].parties.push(newParty);
            saveDb(db);
            resolve(newParty);
        }, MOCK_DELAY);
    });
};

export const updateParty = (ownerId: string, partyData: Party): Promise<Party> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].parties.findIndex((p: Party) => p.id === partyData.id);
            if (index > -1) {
                db.data[ownerId].parties[index] = partyData;
            }
            saveDb(db);
            resolve(partyData);
        }, MOCK_DELAY);
    });
};

export const deleteParty = (ownerId: string, partyId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const data = db.data[ownerId];
            if (!data) {
                return reject(new Error("User data not found."));
            }

            // Check for dependencies in various transaction arrays
            const hasTransactions = 
                data.invoices?.some((i: Invoice) => i.partyId === partyId) ||
                data.payments?.some((p: Payment) => p.partyId === partyId) ||
                data.bookings?.some((b: Booking) => b.partyId === partyId) ||
                data.quotations?.some((q: Quotation) => q.partyId === partyId) ||
                data.salesOrders?.some((so: SalesOrder) => so.partyId === partyId);

            if (hasTransactions) {
                return reject(new Error("Cannot delete this party. They have existing transactions. Please delete their transactions first."));
            }
            
            db.data[ownerId].parties = db.data[ownerId].parties.filter((p: Party) => p.id !== partyId);
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};


// --- INVOICES ---
export const addInvoice = (ownerId: string, invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<{invoice: Invoice, newSettings: Settings}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const settings = db.data[ownerId].settings;
            const newInvoice = { ...invoiceData, id: Date.now().toString(), invoiceNumber: settings.invoiceCounter };
            settings.invoiceCounter += 1;
            db.data[ownerId].invoices.push(newInvoice);
            db.data[ownerId].settings = settings;
            saveDb(db);
            resolve({ invoice: newInvoice, newSettings: settings });
        }, MOCK_DELAY);
    });
};

export const updateInvoice = (ownerId: string, invoiceData: Invoice): Promise<Invoice> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].invoices.findIndex((i: Invoice) => i.id === invoiceData.id);
            if (index > -1) {
                db.data[ownerId].invoices[index] = invoiceData;
            }
            saveDb(db);
            resolve(invoiceData);
        }, MOCK_DELAY);
    });
};

export const deleteInvoice = (ownerId: string, invoiceId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            db.data[ownerId].invoices = db.data[ownerId].invoices.filter((i: Invoice) => i.id !== invoiceId);
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- QUOTATIONS ---
export const addQuotation = (ownerId: string, quoteData: Omit<Quotation, 'id' | 'quotationNumber'>): Promise<{quotation: Quotation, newSettings: Settings}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const settings = db.data[ownerId].settings;
            const newQuotation = { ...quoteData, id: Date.now().toString(), quotationNumber: settings.quotationCounter };
            settings.quotationCounter += 1;
            db.data[ownerId].quotations.push(newQuotation);
            db.data[ownerId].settings = settings;
            saveDb(db);
            resolve({ quotation: newQuotation, newSettings: settings });
        }, MOCK_DELAY);
    });
};

export const updateQuotation = (ownerId: string, quoteData: Partial<Quotation> & { id: string }): Promise<Quotation> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].quotations.findIndex((q: Quotation) => q.id === quoteData.id);
            if (index > -1) {
                db.data[ownerId].quotations[index] = { ...db.data[ownerId].quotations[index], ...quoteData };
                saveDb(db);
                resolve(db.data[ownerId].quotations[index]);
            } else {
                reject(new Error("Quotation not found"));
            }
        }, MOCK_DELAY);
    });
}

// --- SALES ORDERS ---
export const addSalesOrder = (ownerId: string, orderData: Omit<SalesOrder, 'id' | 'salesOrderNumber'>): Promise<{salesOrder: SalesOrder, newSettings: Settings}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const settings = db.data[ownerId].settings;
            const newSalesOrder = { ...orderData, id: Date.now().toString(), salesOrderNumber: settings.salesOrderCounter };
            settings.salesOrderCounter += 1;
            db.data[ownerId].salesOrders.push(newSalesOrder);
            db.data[ownerId].settings = settings;
            saveDb(db);
            resolve({ salesOrder: newSalesOrder, newSettings: settings });
        }, MOCK_DELAY);
    });
};

export const updateSalesOrder = (ownerId: string, orderData: Partial<SalesOrder> & { id: string }): Promise<SalesOrder> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].salesOrders.findIndex((so: SalesOrder) => so.id === orderData.id);
            if (index > -1) {
                db.data[ownerId].salesOrders[index] = { ...db.data[ownerId].salesOrders[index], ...orderData };
                saveDb(db);
                resolve(db.data[ownerId].salesOrders[index]);
            } else {
                reject(new Error("Sales Order not found"));
            }
        }, MOCK_DELAY);
    });
}

// --- EXPENSES ---
export const addExpense = (ownerId: string, expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const newExpense = { ...expenseData, id: Date.now().toString() };
            db.data[ownerId].expenses.push(newExpense);
            saveDb(db);
            resolve(newExpense);
        }, MOCK_DELAY);
    });
};

export const updateExpense = (ownerId: string, expenseData: Expense): Promise<Expense> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].expenses.findIndex((e: Expense) => e.id === expenseData.id);
            if (index > -1) {
                db.data[ownerId].expenses[index] = expenseData;
            }
            saveDb(db);
            resolve(expenseData);
        }, MOCK_DELAY);
    });
};

export const deleteExpense = (ownerId: string, expenseId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            db.data[ownerId].expenses = db.data[ownerId].expenses.filter((e: Expense) => e.id !== expenseId);
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- PAYMENTS ---
export const addPayment = (ownerId: string, paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const newPayment = { ...paymentData, id: Date.now().toString() };
            db.data[ownerId].payments.push(newPayment);
            saveDb(db);
            resolve(newPayment);
        }, MOCK_DELAY);
    });
};

export const updatePayment = (ownerId: string, paymentData: Payment): Promise<Payment> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].payments.findIndex((p: Payment) => p.id === paymentData.id);
            if (index > -1) {
                db.data[ownerId].payments[index] = paymentData;
            }
            saveDb(db);
            resolve(paymentData);
        }, MOCK_DELAY);
    });
};

export const deletePayment = (ownerId: string, paymentId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            db.data[ownerId].payments = db.data[ownerId].payments.filter((p: Payment) => p.id !== paymentId);
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- SERIES ---
export const addSeries = (ownerId: string, seriesData: Omit<Series, 'id'>): Promise<Series> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const newSeries = { ...seriesData, id: Date.now().toString(), availableSeats: seriesData.totalSeats };
            db.data[ownerId].series.push(newSeries);
            saveDb(db);
            resolve(newSeries);
        }, MOCK_DELAY);
    });
};

export const updateSeries = (ownerId: string, seriesData: Series): Promise<Series> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const index = db.data[ownerId].series.findIndex((s: Series) => s.id === seriesData.id);
            if (index > -1) {
                db.data[ownerId].series[index] = seriesData;
            }
            saveDb(db);
            resolve(seriesData);
        }, MOCK_DELAY);
    });
};

export const deleteSeries = (ownerId: string, seriesId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const data = db.data[ownerId];
            if (!data) {
                return reject(new Error("User data not found."));
            }
            
            const isSeriesInUse = data.bookings?.some((b: Booking) => b.seriesId === seriesId || b.returnSeriesId === seriesId);

            if (isSeriesInUse) {
                return reject(new Error("Cannot delete series. It has existing bookings. Please delete associated bookings first."));
            }

            data.series = data.series.filter((s: Series) => s.id !== seriesId);
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- BOOKINGS ---
export const addBooking = (ownerId: string, bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'invoiceId'>): Promise<{ booking: Booking, newInvoice: Invoice, updatedSeries: Series[], newSettings: Settings }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const settings = db.data[ownerId].settings;
            const series = db.data[ownerId].series;
            
            const outboundSeries = series.find((s: Series) => s.id === bookingData.seriesId);
            const returnSeries = bookingData.returnSeriesId ? series.find((s: Series) => s.id === bookingData.returnSeriesId) : null;
            
            const invoiceItems: InvoiceItem[] = [];
            if(outboundSeries) {
                invoiceItems.push({
                    productId: `ticket-${outboundSeries.pnr}`,
                    productName: `Flight: ${outboundSeries.airline} - ${outboundSeries.route}`,
                    rate: bookingData.sellingPricePerSeat,
                    quantity: bookingData.passengers.length,
                    discount: 0
                });
            }

            if (returnSeries) {
                invoiceItems.push({
                    productId: `ticket-${returnSeries.pnr}`,
                    productName: `Return Flight: ${returnSeries.airline} - ${returnSeries.route}`,
                    rate: bookingData.returnSellingPricePerSeat || 0,
                    quantity: bookingData.passengers.length,
                    discount: 0
                });
            }
            
            const newInvoice = {
                id: Date.now().toString(),
                invoiceNumber: settings.invoiceCounter,
                partyId: bookingData.partyId,
                date: new Date().toISOString().split('T')[0],
                items: invoiceItems,
                tax: 0,
                total: bookingData.totalAmount,
                amountPaid: 0,
                status: PaymentStatus.UNPAID
            };
            db.data[ownerId].invoices.push(newInvoice);

            const newBooking = { ...bookingData, id: newInvoice.id, invoiceId: newInvoice.id, bookingNumber: settings.bookingCounter };
            db.data[ownerId].bookings.push(newBooking);

            const updatedSeries: Series[] = [];
            const seatsNeeded = bookingData.passengers.length;
            db.data[ownerId].series = series.map((s: Series) => {
                if (s.id === bookingData.seriesId) {
                    const updated = { ...s, availableSeats: s.availableSeats - seatsNeeded };
                    updatedSeries.push(updated);
                    return updated;
                }
                if (s.id === bookingData.returnSeriesId) {
                    const updated = { ...s, availableSeats: s.availableSeats - seatsNeeded };
                    updatedSeries.push(updated);
                     return updated;
                }
                return s;
            });

            settings.invoiceCounter += 1;
            settings.bookingCounter += 1;
            db.data[ownerId].settings = settings;

            saveDb(db);
            resolve({ booking: newBooking, newInvoice, updatedSeries, newSettings: settings });
        }, MOCK_DELAY);
    });
};

export const deleteBooking = (ownerId: string, bookingId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const data = db.data[ownerId];
            
            const bookingIndex = data.bookings.findIndex((b: Booking) => b.id === bookingId);
            if (bookingIndex === -1) {
                return reject(new Error("Booking not found"));
            }
            
            const bookingToDelete = data.bookings[bookingIndex];
            const seatsToRestore = bookingToDelete.passengers.length;

            // Restore seats
            data.series = data.series.map((s: Series) => {
                if (s.id === bookingToDelete.seriesId || s.id === bookingToDelete.returnSeriesId) {
                    return { ...s, availableSeats: s.availableSeats + seatsToRestore };
                }
                return s;
            });
            
            // Delete associated invoice and payments
            const invoiceId = bookingToDelete.invoiceId;
            if (invoiceId) {
                data.invoices = data.invoices.filter((i: Invoice) => i.id !== invoiceId);
                data.payments = data.payments.filter((p: Payment) => p.invoiceId !== invoiceId);
            }
            
            // Delete booking
            data.bookings.splice(bookingIndex, 1);
            
            saveDb(db);
            resolve();
        }, MOCK_DELAY);
    });
};

// --- NEW: ONLINE FLIGHT BOOKING ---

let aiInstance: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
    if (aiInstance) {
        return aiInstance;
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not configured in environment variables. Flight search is unavailable.");
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
}

export const searchFlights = async (
  from: string,
  to: string,
  departureDate: string,
  returnDate: string | undefined,
  passengers: PassengerCounts,
  tripType: TripType
): Promise<FlightItinerary[]> => {
  
  const passengerText = `${passengers.adults} Adult(s), ${passengers.children} Child(ren), ${passengers.infants} Infant(s)`;
  const tripText = tripType === 'round-trip' ? `a round trip from ${from} to ${to}, departing on ${departureDate} and returning on ${returnDate}` : `a one-way trip from ${from} to ${to}, departing on ${departureDate}`;

  const prompt = `
    You are an expert flight data API simulator. Your task is to generate a highly realistic, plausible, and internally consistent list of 5 flight itineraries for a user searching for ${tripText} for ${passengerText}. The results must feel like they are from a real, live booking system.

    **CRITICAL RULES FOR REALISM:**
    1.  **Airlines & Routes:** Only use real, well-known airlines that plausibly fly the specified route (or a logical connecting route). For example, for DEL-DXB, use Emirates, IndiGo, Air India, etc. For DEL-JFK, use Air India, American Airlines, or connecting flights via major hubs like DXB (Emirates) or DOH (Qatar Airways).
    2.  **Pricing:** Calculate a believable total price in INR. The price should reflect the route, trip type (round-trip is more expensive but often cheaper per leg than two one-ways), number of passengers (apply reasonable fares for adults, children, and infants), and whether it's direct or connecting. Do not generate random low prices.
    3.  **Layovers:** For connecting flights, ensure the layover airport is a logical hub for the airline. Layover duration must be realistic, between 45 minutes and 5 hours.
    4.  **Chronology:** All departure and arrival times must be chronologically sequential and correct. The arrival time must be the departure time plus the flight duration (and layover for subsequent legs).
    5.  **Flight Numbers:** Use realistic flight number formats (e.g., 'EK-215', '6E-2048').
    6.  **Data Consistency:** Ensure 'totalDuration' accurately reflects the sum of 'duration' for all legs plus any 'layoverDuration'.

    **RESPONSE FORMAT (MANDATORY):**
    - Respond ONLY with a valid JSON array of objects. Do not include any introductory text, explanations, or markdown formatting like \`\`\`json.
    - The JSON must strictly adhere to this structure:
    [
      {
        "id": "string (unique identifier)",
        "totalPrice": number,
        "totalDuration": "string (e.g., '14h 30m')",
        "outboundLegs": [
          {
            "airline": "string",
            "flightNumber": "string",
            "from": "string (airport code)",
            "to": "string (airport code)",
            "departureTime": "string (ISO 8601 format)",
            "arrivalTime": "string (ISO 8601 format)",
            "duration": "string (e.g., '8h 15m')",
            "layoverDuration": "string (optional, only if another leg follows, e.g., '2h 45m')"
          }
        ],
        "returnLegs": [ /* (optional, same structure as outboundLegs, only for round-trip) */ ]
      }
    ]
  `;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error("Error in searchFlights:", error);
    alert(error.message || "An error occurred while searching for flights. Please check your API key configuration and try again.");
    return [];
  }
};

export const addOnlineBooking = (ownerId: string, bookingData: Omit<OnlineBooking, 'id' | 'bookingDate' | 'status'>): Promise<OnlineBooking> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const newBooking: OnlineBooking = {
                ...bookingData,
                id: `online-bkg-${Date.now()}`,
                bookingDate: new Date().toISOString(),
                status: 'Pending',
            };
            if (!db.data[ownerId].onlineBookings) {
                 db.data[ownerId].onlineBookings = [];
            }
            db.data[ownerId].onlineBookings.push(newBooking);
            saveDb(db);
            resolve(newBooking);
        }, MOCK_DELAY);
    });
};

export const updateOnlineBooking = (ownerId: string, bookingId: string, pnr: string): Promise<OnlineBooking> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const bookings = db.data[ownerId].onlineBookings as OnlineBooking[];
            const index = bookings.findIndex(b => b.id === bookingId);
            if (index > -1) {
                bookings[index].pnr = pnr;
                bookings[index].status = 'Confirmed';
                saveDb(db);
                resolve(bookings[index]);
            } else {
                reject(new Error("Booking not found"));
            }
        }, MOCK_DELAY);
    });
};