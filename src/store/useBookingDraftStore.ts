import { create } from "zustand";
import { TravelPackage } from "../types/travel";
import { BusType, RoomType, TransportType } from "../utils/yatraPricing";

export type BookingDraftValues = {
  transportType: TransportType | "";
  busType: BusType | "";
  roomType: RoomType | "";
  fullName: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  dob: string;
  age: string;
  numberOfTravelers: string;
  specialNotes: string;
};

export type BookingDraftState = {
  selectedPackage: TravelPackage | null;
} & BookingDraftValues & {
    setSelectedPackage: (packageItem: TravelPackage) => void;
    updateField: <K extends keyof BookingDraftValues>(
      field: K,
      value: BookingDraftValues[K],
    ) => void;
    resetDraft: () => void;
  };

const initialState: BookingDraftValues = {
  transportType: "",
  busType: "",
  roomType: "",
  fullName: "",
  phoneNumber: "",
  whatsappNumber: "",
  address: "",
  dob: "",
  age: "",
  numberOfTravelers: "1",
  specialNotes: "",
};

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  selectedPackage: null,
  ...initialState,
  setSelectedPackage: (packageItem) => set({ selectedPackage: packageItem }),
  updateField: (field, value) =>
    set({ [field]: value } as Partial<BookingDraftState>),
  resetDraft: () => set({ selectedPackage: null, ...initialState }),
}));
