export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
}

export enum PartyType {
  CUSTOMER = 'Customer',
  SUPPLIER = 'Supplier',
}

export interface Party {
  id: string;
  name:string;
  phone: string;
  email?: string;
  address: string;
  type: PartyType;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  rate: number;
  quantity: number;
  discount: number; // as a percentage
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  PARTIAL = 'Partial',
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  partyId: string;
  date: string;
  items: InvoiceItem[];
  tax: number; // as a percentage
  total: number;
  amountPaid: number;
  status: PaymentStatus;
}

export enum PaymentType {
  CASH = 'Cash',
  CARD = 'Card',
  BANK = 'Bank Transfer',
  UPI = 'UPI',
}

export interface Payment {
  id: string;
  partyId: string;
  invoiceId?: string;
  amount: number;
  date: string;
  type: PaymentType;
  direction: 'in' | 'out';
  notes?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Series {
  id: string;
  pnr: string;
  airline: string;
  route: string;
  departureDate: string;
  arrivalDate: string;
  totalSeats: number;
  availableSeats: number;
  purchasePricePerSeat: number;
}

export type PassengerType = 'Adult' | 'Child' | 'Infant';

export interface Passenger {
  name: string;
  type: PassengerType;
}

export interface Booking {
  id: string;
  bookingNumber: number;
  seriesId: string;
  returnSeriesId?: string;
  partyId: string;
  passengers: Passenger[];
  sellingPricePerSeat: number;
  returnSellingPricePerSeat?: number;
  totalAmount: number;
  bookingDate: string;
  invoiceId: string;
}

export interface Settings {
  businessName: string;
  logo: string | null; // base64 string
  address: string;
  email: string;
  phone: string;
  gstNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  upiQRCode: string | null;
  currency: '₹' | '$' | '€' | '£' | '¥' | 'A$' | 'C$';
  invoiceCounter: number;
  invoicePrefix?: string;
  bookingCounter: number;
  bookingPrefix?: string;
  quotationCounter: number;
  quotationPrefix?: string;
  salesOrderCounter: number;
  salesOrderPrefix?: string;
  invoiceTemplate?: 'classic' | 'modern' | 'compact' | 'creative' | 'professional';
  ticketTemplate?: 'classic' | 'modern' | 'minimalist' | 'boardingPass' | 'detailedItinerary';
}

// New Types for Auth & Sales Workflow
export interface User {
    id: string;
    email: string;
    role: 'admin' | 'staff';
    adminId?: string;
}

export enum QuotationStatus {
    DRAFT = 'Draft',
    SENT = 'Sent',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
}

export interface Quotation {
    id: string;
    quotationNumber: number;
    partyId: string;
    date: string;
    items: InvoiceItem[];
    tax: number;
    total: number;
    status: QuotationStatus;
    validUntil: string;
}

export enum SalesOrderStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    COMPLETED = 'Completed', // after invoicing
    CANCELLED = 'Cancelled',
}

export interface SalesOrder {
    id: string;
    salesOrderNumber: number;
    partyId: string;
    date: string;
    items: InvoiceItem[];
    tax: number;
    total: number;
    status: SalesOrderStatus;
    quotationId?: string;
}

// --- NEW: Online Flight Booking System Types ---

export interface FlightLeg {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  layoverDuration?: string;
}

export interface FlightItinerary {
  id: string;
  totalPrice: number;
  totalDuration: string;
  outboundLegs: FlightLeg[];
  returnLegs?: FlightLeg[];
}

export type TripType = 'one-way' | 'round-trip';
export type PassengerCounts = { adults: number; children: number; infants: number };

export interface OnlineBookingPassenger {
    name: string;
    mobile: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    type: PassengerType;
}

export interface OnlineBooking {
    id: string;
    itinerary: FlightItinerary;
    passengers: OnlineBookingPassenger[];
    searchCriteria: {
        from: string;
        to: string;
        departureDate: string;
        returnDate?: string;
        passengers: PassengerCounts;
        tripType: TripType;
    };
    pnr?: string;
    bookingDate: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
}


export interface DataContextType {
  products: Product[];
  parties: Party[];
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  series: Series[];
  bookings: Booking[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  onlineBookings: OnlineBooking[];
  settings: Settings;
  
  // Data modification functions
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  addParty: (party: Omit<Party, 'id'>) => Promise<Party>;
  updateParty: (party: Party) => Promise<void>;
  deleteParty: (partyId: string) => Promise<void>;
  
  updateSettings: (settings: Settings) => Promise<void>;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>, salesOrderId?: string) => Promise<Invoice>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;

  addQuotation: (quotation: Omit<Quotation, 'id' | 'quotationNumber'>) => Promise<Quotation>;
  updateQuotationStatus: (id: string, status: QuotationStatus) => Promise<void>;
  
  addSalesOrder: (salesOrder: Omit<SalesOrder, 'id' | 'salesOrderNumber'>) => Promise<SalesOrder>;
  updateSalesOrderStatus: (id: string, status: SalesOrderStatus) => Promise<void>;

  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;

  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (payment: Payment, originalPayment: Payment | null) => Promise<void>;
  deletePayment: (payment: Payment) => Promise<void>;

  addSeries: (series: Omit<Series, 'id'>) => Promise<void>;
  updateSeries: (series: Series) => Promise<void>;
  deleteSeries: (seriesId: string) => Promise<void>;

  addBooking: (bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'invoiceId'>) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;

  // New Online Booking Functions
  searchFlights: (
    from: string,
    to: string,
    departureDate: string,
    returnDate: string | undefined,
    passengers: PassengerCounts,
    tripType: TripType
  ) => Promise<FlightItinerary[]>;
  addOnlineBooking: (bookingData: Omit<OnlineBooking, 'id' | 'bookingDate' | 'status'>) => Promise<OnlineBooking>;
  updateOnlineBooking: (bookingId: string, pnr: string) => Promise<OnlineBooking>;

  isLoading: boolean;
  fetchData: () => Promise<void>;
  restoreData: (data: any) => Promise<void>;
}