import {
  BookingRecord,
  CollectorTask,
  NotificationItem,
} from "../types/travel";

export const bookingHistory: BookingRecord[] = [
  {
    id: "b1",
    bookingId: "BK-000245",
    packageName: "Haridwar Yatra",
    status: "Payment Pending",
    travelDate: "12 Jun 2026",
    amount: "₹15,000",
  },
  {
    id: "b2",
    bookingId: "BK-000198",
    packageName: "Dwarka Yatra",
    status: "Paid",
    travelDate: "01 Jul 2026",
    amount: "₹16,500",
  },
  {
    id: "b3",
    bookingId: "BK-000181",
    packageName: "Kedarnath Yatra",
    status: "Cancelled",
    travelDate: "22 Jul 2026",
    amount: "₹18,000",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Payment pending",
    message: "Complete Razorpay checkout to confirm your yatra booking.",
    time: "10 min ago",
  },
  {
    id: "n2",
    title: "Travel reminder",
    message: "Your Kerala booking is scheduled for next week.",
    time: "2 hours ago",
  },
  {
    id: "n3",
    title: "Booking paid",
    message: "Your Razorpay payment was verified successfully.",
    time: "1 day ago",
  },
];

export const collectorTasks: CollectorTask[] = [
  {
    id: "c1",
    title: "Follow up pending payment",
    description: "Help yatris complete Razorpay checkout for open bookings.",
    status: "Open",
  },
  {
    id: "c2",
    title: "Journey coordination",
    description: "Share reporting details for paid and upcoming bookings.",
    status: "In Review",
  },
];
