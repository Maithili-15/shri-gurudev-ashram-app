export type TravelPackage = {
  id: string;
  title: string;
  price: string;
  priceAmount?: number;
  duration: string;
  description: string;
};

export type BookingStatus = 'pending' | 'verified' | 'rejected' | 'confirmed';

export type Booking = {
  id: string;
  bookingReference: string;
  packageId: string;
  userId: string;
  travelerCount: number;
  specialNotes: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BookingStatus;
  createdAt?: string;
};

export type CreateBookingInput = {
  packageId: string;
  travelerCount: number;
  specialNotes?: string;
  totalAmount: number;
};

export type BookingRecord = {
  id: string;
  bookingId: string;
  packageName: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  travelDate: string;
  amount: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
};

export type CollectorTask = {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Review' | 'Approved';
};
