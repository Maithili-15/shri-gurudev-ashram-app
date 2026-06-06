import api from "../api/axiosClient";
import { getFriendlyApiError } from "../utils/apiErrors";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

export type CreateRazorpayOrderResponse = {
  order: RazorpayOrder;
  booking: unknown;
};

export type VerifyRazorpayPaymentInput = {
  bookingId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function createRazorpayOrder(
  bookingId: string,
): Promise<CreateRazorpayOrderResponse> {
  try {
    const { data } = await api.post<CreateRazorpayOrderResponse>(
      "/api/payments/create-order",
      { bookingId },
    );
    return data;
  } catch (error) {
    throw new Error(
      getFriendlyApiError(
        error,
        "Could not prepare payment. Please try again.",
        [
          {
            match: /Booking is already paid/i,
            message: "This booking is already paid.",
          },
          {
            match: /Not enough seats available/i,
            message: "Not enough seats are available for this booking.",
          },
          {
            match: /Booking is not pending payment/i,
            message: "This booking is no longer pending payment.",
          },
        ],
      ),
    );
  }
}

export async function verifyRazorpayPayment(
  input: VerifyRazorpayPaymentInput,
): Promise<void> {
  try {
    await api.post("/api/payments/verify", input);
  } catch (error) {
    throw new Error(
      getFriendlyApiError(error, "Payment failed. Please try again.", [
        {
          match: /Booking is already paid/i,
          message: "This booking is already paid.",
        },
        {
          match: /Invalid Razorpay signature/i,
          message: "Payment failed because the signature was invalid.",
        },
        {
          match: /Razorpay payment has already been processed/i,
          message: "This payment has already been processed.",
        },
      ]),
    );
  }
}
