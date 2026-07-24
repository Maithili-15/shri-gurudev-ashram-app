# ARCHITECTURE_GUIDE.md

Welcome to the **Shri Gurudev Ashram App** architecture guide! 

If you are coming from a traditional web development background (like Express, React for web, or Next.js), React Native app structures can initially look overwhelming with directories like `app/`, `src/`, `features/`, `services/`, `hooks/`, `store/`, and `backend/`.

This document explains **why** this project is structured the way it is, **how** data flows through every layer, and **how** each piece interacts—using real examples and file paths directly from this repository.

---

# Overall Architecture

## 1. Core Concepts Explained

* **What is React Native?**  
  React Native is a framework that allows you to write mobile applications using JavaScript/TypeScript and React. Unlike web React (which renders HTML DOM elements like `<div>`, `<span>`, `<button>`), React Native compiles your components down to **native mobile UI controls** (like Android `android.widget.TextView` or iOS `UILabel`). Instead of `<div>` and `<button>`, React Native uses `<View>`, `<Text>`, and `<TouchableOpacity>` or `<Pressable>`.

* **What is Expo?**  
  Expo is an ecosystem and framework built on top of React Native. Think of plain React Native like bare-bones Node.js, and Expo like Next.js for mobile. Expo handles native toolchains, camera access, push notifications, splash screens, fonts, and hot-reloading so you don't have to configure native Xcode or Android Studio Java/Objective-C build files manually unless needed.

* **What is Expo Router?**  
  Expo Router is a file-based router for React Native built into Expo (v56+ in this project). Just like Next.js App Router where `app/page.tsx` becomes `/` on the web, Expo Router maps files inside the `app/` directory directly to mobile screen navigation routes.

---

## 2. Why `app/` AND `src/`? (The Entry-Point Pattern)

Coming from Express or basic React apps, you might wonder: *Why not put all components and logic inside `app/`?*

* **`app/` is for ROUTING (Navigation entry points only)**  
  Expo Router automatically converts every screen component file inside `app/` into an accessible route screen. If you put reusable form components, modal dialogs, data services, or utility helpers directly inside `app/`, Expo Router might confuse them for screens and create accidental navigation routes for them!

* **`src/` is for DOMAIN LOGIC & UI BUILDING BLOCKS**  
  `src/` holds your application logic: state management, API service calls, TypeScript types, reusable UI components, styling, and feature modules.

### Real Example from THIS Repository:
Look at [`app/donation.tsx`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/app/donation.tsx):
```tsx
import DonationScreen from '../src/screens/donation/DonationScreen'

export default DonationScreen
```
`app/donation.tsx` acts purely as a **route entry point** for `/donation`. All of the actual form state, UI logic, and step-by-step donation code lives safely inside [`src/screens/donation/DonationScreen.tsx`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/screens/donation/DonationScreen.tsx).

---

## 3. Web Development vs. React Native Architecture Comparison

| Web (Express / Next.js) | This React Native + Expo App | Why it's different |
| :--- | :--- | :--- |
| **`pages/` or `app/`** | **`app/`** | Maps URL paths in web vs. screen stacks/tabs in mobile. |
| **`controllers/`** | **`src/services/` & Backend Routes** | In React Native, frontend services make HTTP/SDK calls; backend Express handles controller logic. |
| **`models/`** | **`src/types/` & `backend/src/models/`** | Mobile frontend uses TypeScript interfaces (`database.types.ts`), backend uses Mongoose/Supabase schemas. |
| **`views/`** | **`src/components/` & `src/features/`** | Web uses HTML/JSX templates; mobile uses React Native JSX with native styling abstractions. |
| **`middleware/`** | **`src/hooks/useProtectedRoute.ts` & `backend/src/middleware/`** | Screen guards occur on mobile navigation transitions; API authorization occurs on Express server middleware. |

---

# Folder-by-Folder Explanation

Here is the exact structure of this project and what belongs in each directory:

```
shri-gurudev-ashram-app/
├── app/                  # Expo Router file-based screen routes
├── src/                  # Application domain code
│   ├── api/              # Axios HTTP client configuration
│   ├── assets/           # Dynamic app assets
│   ├── components/       # Reusable UI building blocks
│   ├── constants/        # Design system tokens & static configs
│   ├── features/         # Complex self-contained business modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # SDK initializers (Supabase JS Client)
│   ├── screens/          # Screen implementations (paired with app/)
│   ├── services/         # API & Backend data layer abstraction
│   ├── store/            # Global state stores (Zustand)
│   ├── types/            # TypeScript interfaces & database definitions
│   └── utils/            # Helper functions & validation logic
└── backend/              # Node.js + Express REST API Server
```

---

## `app/`

* **Category:** Navigation & Routing (UI Entry Points)
* **Why it exists:** Provides Expo Router with file paths to build the mobile screen stack and tab navigation.
* **What belongs here:** Screen entry wrappers, layout containers (`_layout.tsx`), route parameters, tab definitions.
* **What NEVER belongs here:** API call logic, complex form handlers, backend SQL/Mongoose queries, or raw reusable components.
* **Communicates with:** `src/screens/`, `src/store/`, `src/hooks/useProtectedRoute.ts`.

### Key Files in `app/`:
1. [`app/_layout.tsx`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/app/_layout.tsx) - Root layout wrapper. Loads fonts, restores authentication session (`syncSession`), handles top-level routing guards, and wraps the app with `QueryClientProvider`, `SafeAreaProvider`, and `GestureHandlerRootView`.
2. [`app/(auth)/`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/app/(auth)/) - Route Group for authentication screens (`login.tsx`, `splash.tsx`). Parentheses `()` mean this folder doesn't add a segment to the URL path.
3. [`app/(tabs)/`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/app/(tabs)/) - Bottom Tab Navigation group (`home.tsx`, `my-sevas.tsx`, `notifications.tsx`, `profile.tsx`, `travel/`, `seva/`).
4. [`app/(tabs)/travel/`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/app/(tabs)/travel/) - Nested stack for Travel Yatras (`index.tsx`, `package/`, `booking/`, `payment.tsx`, `success.tsx`).

---

## `src/`

* **Category:** Application Core Engine
* **Why it exists:** Isolates source code from Expo's file-system router so components can be modular, unit-tested, and clean.

---

## `src/services/`

* **Category:** Data & Networking Layer
* **Why it exists:** Encapsulates all external communication (Express REST API endpoints, Supabase queries, Firebase Auth). Components call service functions like `fetchPackages()` or `createBooking()` rather than embedding raw HTTP calls or database logic inside UI components.
* **What belongs here:** Functions that call `api.post()`, `supabase.from()`, or `auth()`. Data parsing and response mapping.
* **What NEVER belongs here:** JSX, React hooks, UI state, or styling code.
* **Communicates with:** Backend REST API via `src/api/axiosClient.ts`, Supabase DB via `src/lib/supabase.ts`, Zustand Stores (`src/store/`).

### Real Examples from THIS Project:
* [`src/services/packages.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/services/packages.ts): Direct Supabase client query fetching active travel packages (`supabase.from('travel_packages').select('*')`) and converting database rows into clean frontend `TravelPackage` types.
* [`src/services/bookings.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/services/bookings.ts): HTTP client calls (`api.post('/api/bookings', input)`) to create yatra bookings on the Express backend.
* [`src/services/auth.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/services/auth.ts): Integrates `@react-native-firebase/auth` phone OTP verification with Expo `SecureStore` token persistence and `/api/users/me` backend user profile retrieval.

---

## `src/features/`

* **Category:** Complex Business Modules (UI + State + Logic)
* **Why it exists:** Some screens or features are too complex to exist as a single file. For instance, the Yatra booking process requires a multi-passenger form with pricing calculations, Aadhaar document uploads, bus seat selection, and room preferences.
* **What belongs here:** High-level modular feature components like [`src/features/bookings/BookingForm.tsx`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/features/bookings/BookingForm.tsx).
* **What NEVER belongs here:** Generic atomic UI components (like a basic button or input spinner).
* **Communicates with:** `src/store/useBookingDraftStore.ts`, `src/services/bookings.ts`, `src/components/`.

---

## `src/components/`

* **Category:** Reusable UI Presentation Layer
* **Why it exists:** Houses pure presentational components used across multiple screens.
* **What belongs here:** `AppButton`, `AppInput`, `AppCard`, `AppModal`, `BottomSheet`, `LoadingState`, `ErrorState`, `CollectorIDCard`, `SevaReceipt`, `TravelReceipt`.
* **What NEVER belongs here:** Hardcoded screen route logic or full app workflow managers.

---

## `src/hooks/`

* **Category:** Custom React Hooks
* **Why it exists:** Shares reactive state logic, side effects, or lifecycle hooks across components.
* **Real Example:** [`src/hooks/useProtectedRoute.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/hooks/useProtectedRoute.ts) checks authentication status and automatically redirects unauthenticated users to the `/login` route.

---

## `src/constants/`

* **Category:** Configuration & Design System Tokens
* **Why it exists:** Ensures consistency in colors, margins, font sizes, and static options across the app.
* **What belongs here:** [`colors.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/constants/colors.ts), [`theme.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/constants/theme.ts), [`typography.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/constants/typography.ts), [`seva.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/constants/seva.ts).
* **What NEVER belongs here:** Dynamic runtime data, secrets, or API keys (secrets belong in `.env.local` / `.env.production`).

---

## `src/utils/`

* **Category:** Utility Functions & Helpers
* **Why it exists:** Pure utility functions with zero side effects.
* **What belongs here:** [`yatraPricing.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/utils/yatraPricing.ts) (calculates total travel price based on room & transport choices), [`apiErrors.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/utils/apiErrors.ts) (formats friendly backend error messages), [`validation.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/utils/validation.ts) (Zod/regex phone and Aadhaar checks).

---

## `src/types/`

* **Category:** Type System & Data Contracts
* **Why it exists:** Provides compile-time safety across frontend layers.
* **What belongs here:** [`database.types.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/types/database.types.ts) (Auto-generated TypeScript types matching Supabase PostgreSQL database tables), [`travel.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/types/travel.ts), [`seva.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/types/seva.ts).

---

## `src/store/`

* **Category:** Global State Management (Zustand)
* **Why it exists:** Holds global application state accessible from any component without prop drilling.
* **What belongs here:** 
  1. [`useAuthStore.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/store/useAuthStore.ts): Active user profile, Aadhaar verification state, and session hydration.
  2. [`useBookingDraftStore.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/store/useBookingDraftStore.ts): Persisted draft of multi-passenger yatra booking using `@react-native-async-storage/async-storage`.
  3. [`useSevaStore.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/src/store/useSevaStore.ts): Active Seva booking draft, selected dates, and pricing choices.

---

# Backend Architecture (`backend/`)

The backend is a standalone Node.js Express TypeScript server located inside the [`backend/`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/backend) directory.

```
backend/src/
├── app.ts                 # Express app initialization, rate limiters, route mounts
├── server.ts              # HTTP server listener entry point
├── errors.ts              # Custom HttpError classes
├── controllers/           # Business controller handlers (collector.ts, donations.ts)
├── middleware/            # Auth & file upload middleware (auth.ts, donationAuth.ts, upload.ts)
├── models/                # Mongoose database models (user.ts, donation.ts, donationHead.ts)
├── routes/                # Express API routes (bookings.ts, payments.ts, seva.ts, etc.)
├── services/              # Third-party integrations (supabaseAdmin.ts, firebaseAdmin.ts, razorpay.ts, mongo.ts)
└── utils/                 # Backend helpers
```

## How It Differs From Traditional MVC:
Traditional Express apps use a strict `Router -> Controller -> Service -> Model` split. In this repository:
* High-volume endpoints (e.g., [`backend/src/routes/bookings.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/backend/src/routes/bookings.ts) and [`backend/src/routes/payments.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/backend/src/routes/payments.ts)) combine routing and transactional logic directly using **Supabase Admin Service Role SDK** (`supabaseAdmin`).
* Donation and Collector features use Mongoose Models ([`backend/src/models/donation.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/backend/src/models/donation.ts)) with Express controllers ([`backend/src/controllers/donations.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/backend/src/controllers/donations.ts)).

---

# How Data Flows (Complete Request Diagrams)

Below are the complete, step-by-step request and data flow paths for the primary features in the app.

## 1. Login Flow

```
[User inputs Phone Number on Login Screen]
                  │
                  ▼
[login.tsx] ──> Calls requestPhoneOtp() in [src/services/auth.ts]
                  │
                  ▼
[Firebase Auth SDK] ──> Sends SMS OTP to User Phone
                  │
                  ▼
[User inputs 6-digit OTP code]
                  │
                  ▼
[confirmPhoneOtp()] ──> Validates code with Firebase
                  │
                  ▼
[getIdToken()] ──> Obtains Firebase Bearer ID Token
                  │
                  ├──> Saved into Expo SecureStore (shri_gurudev_firebase_id_token)
                  │
                  ▼
[HTTP POST /api/auth/verify-firebase-token] ──> [backend/src/routes/donationAuth.ts]
                  │
                  ▼
[HTTP GET /api/users/me] ──> Returns User Profile JSON
                  │
                  ▼
[useAuthStore.setUser(user)] ──> Global Zustand State updated
                  │
                  ▼
[app/_layout.tsx] ──> Redirects User to Home Tab (or Onboarding if incomplete)
```

---

## 2. Travel Packages Flow

```
[User navigates to Travel Tab]
                  │
                  ▼
[(tabs)/travel/index.tsx] ──> Triggers React useEffect or TanStack Query
                  │
                  ▼
[src/services/packages.ts] ──> Calls fetchPackages()
                  │
                  ▼
[src/lib/supabase.ts] ──> Executes SQL Query via Supabase JS SDK:
                            supabase.from('travel_packages').select('*').eq('is_active', true)
                  │
                  ▼
[Supabase Cloud Database (PostgreSQL)] ──> Returns raw travel package rows
                  │
                  ▼
[mapPackageRow()] ──> Parses currency, inclusions JSON, formats prices
                  │
                  ▼
[Travel Screen UI] ──> Renders package cards using <TripCard /> component
```

---

## 3. Booking Flow

```
[User selects Yatra & fills passenger details in BookingForm.tsx]
                  │
                  ▼
[useBookingDraftStore] ──> Updates draft in real-time & persists to AsyncStorage
                  │
                  ▼
[User clicks "Proceed to Confirmation"]
                  │
                  ▼
[src/services/bookings.ts] ──> Calls createBooking(input)
                  │
                  ▼
[axiosClient.ts] ──> Attaches Authorization: Bearer <Firebase_JWT> header
                  │
                  ▼
[HTTP POST /api/bookings] ──> Hits [backend/src/routes/bookings.ts]
                  │
                  ▼
[backend/src/middleware/auth.ts] ──> Decodes Firebase token via firebaseAdmin SDK
                  │
                  ▼
[backend/src/routes/bookings.ts] ──> Validates seat availability & identity verification status
                  │
                  ▼
[Supabase DB] ──> Inserts into 'bookings' table & decrements remaining seats
                  │
                  ▼
[Express Response] ──> Returns created booking object with booking_reference
                  │
                  ▼
[useBookingDraftStore.resetDraft()] ──> Clears draft state from storage
                  │
                  ▼
[Navigation] ──> Navigates to app/(tabs)/travel/payment.tsx with bookingId
```

---

## 4. Payment Flow (Razorpay Integration)

```
[User taps "Pay Now" on Payment Screen]
                  │
                  ▼
[src/services/payments.ts] ──> Calls createPaymentOrder(bookingId)
                  │
                  ▼
[HTTP POST /api/payments/create-order] ──> [backend/src/routes/payments.ts]
                  │
                  ▼
[Razorpay Node SDK] ──> Generates official Razorpay Order ID (order_Nxxxxxxx)
                  │
                  ▼
[Mobile Frontend] ──> Receives Order ID & launches Razorpay Native Checkout Modal
                  │
                  ▼
[User completes payment via UPI / Card / Netbanking]
                  │
                  ▼
[Razorpay Native SDK] ──> Returns { razorpay_payment_id, razorpay_signature }
                  │
                  ▼
[src/services/payments.ts] ──> Calls verifyPayment(...)
                  │
                  ▼
[HTTP POST /api/payments/verify] ──> [backend/src/routes/payments.ts]
                  │
                  ▼
[HMAC SHA256 Signature Verification] ──> Backend verifies signature using Razorpay Secret
                  │
                  ├──> Updates booking status to 'paid' in Supabase
                  ├──> Sends Push Notification via Expo Notifications
                  │
                  ▼
[Navigation] ──> Navigates to app/(tabs)/travel/success.tsx with TravelReceipt
```

---

## 5. Seva Flow

```
[User opens Seva Screen & picks Seva Type (e.g. Annadan / Yajman)]
                  │
                  ▼
[src/services/seva.ts] ──> Calls fetchSevaMonthlyAvailability(type, month)
                  │
                  ▼
[HTTP GET /api/seva/availability] ──> [backend/src/routes/seva.ts]
                  │
                  ▼
[Backend Response] ──> Returns date-by-date availability & capacity metrics
                  │
                  ▼
[User selects available date & fills sankalp details]
                  │
                  ▼
[createSevaBooking()] ──> HTTP POST /api/seva ──> Saved to DB with status 'pending'
                  │
                  ▼
[createSevaOrder()] ──> Razorpay Checkout ──> Payment Verification
                  │
                  ▼
[UI Screen] ──> Renders <SevaReceipt /> component with booking reference
```

---

## 6. Donation Flow

```
[User opens app/donation.tsx] ──> Renders [src/screens/donation/DonationScreen.tsx]
                  │
                  ▼
[src/services/donation.ts] ──> Calls getDonationHeads()
                  │
                  ▼
[donationAxiosClient.ts] ──> HTTP GET /api/public/donation-heads
                  │
                  ▼
[backend/src/models/donationHead.ts] ──> Queries MongoDB donation_heads collection
                  │
                  ▼
[User fills donation form & clicks Donate]
                  │
                  ▼
[createDonation()] ──> HTTP POST /api/donations/create
                  │
                  ▼
[backend/src/models/donation.ts] ──> Creates pending record in MongoDB donations collection
                  │
                  ▼
[Razorpay Checkout] ──> Payment Completed
                  │
                  ▼
[backend/src/services/donationReceipt.ts] ──> Generates PDF receipt static file
                  │
                  ▼
[UI Screen] ──> Renders receipt download link & confirmation summary
```

---

# Why Things Are Separated

1. **Why isn't `BookingForm` inside `app/(tabs)/travel/booking/index.tsx`?**  
   Putting a 1,000-line complex form component directly in a routing file makes code maintenance difficult and hurts hot-reloading performance. Keeping `app/` routes clean allows routing logic to remain concise while the feature module handles internal step state.

2. **Why aren't API calls directly inside UI components?**  
   If every screen called `axios.get()` or `fetch()` directly:
   * Endpoints would be duplicated across multiple screens.
   * Changing an API path or error handler would require editing dozens of UI files.
   * Testing components without real network calls would be extremely difficult.

3. **Why do `services/` exist?**  
   Services create an abstraction boundary (API contract). The UI components don't care whether data comes from Supabase, Express, or local mock data—they simply invoke `fetchPackages()` and expect structured JavaScript objects in return.

4. **Why are TypeScript types stored centrally in `src/types/`?**  
   Storing types in one directory ensures the frontend state stores, API services, and React components share the exact same interface definitions.

---

# How State Flows

Here is when to use each state mechanism in this app:

```
┌─────────────────────────────────────────────────────────┐
│                    React UI Layer                       │
└───────────────────────────┬─────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Local State  │    │  Navigation  │    │  Global State   │
│ (useState)   │    │  Parameters  │    │    (Zustand)    │
└──────────────┘    └──────────────┘    └─────────────────┘
 UI toggles, text    Route IDs, active  Auth user, persisted
 input state, tabs   package params     booking drafts
```

* **Local State (`useState`, `useReducer`):** Used for ephemeral, component-level UI state (e.g., is a modal dropdown open, active tab index, current text field input).
* **Navigation Parameters (Expo Router `useLocalSearchParams`):** Used to pass simple routing identifiers between screens (e.g., passing `bookingId` from the booking confirmation screen to the payment screen).
* **Global App State (Zustand Stores in `src/store/`):** Used when data must survive across screen transitions or be persisted across app restarts (e.g., user session, multi-step passenger form draft).
* **Server Cache State (TanStack React Query in `src/api/queryClient.ts`):** Used for caching, refetching, and synchronizing server data.

---

# Common Development Workflow

## Scenario 1: Adding a New Mobile Screen
1. Create screen implementation in `src/screens/new-feature/NewFeatureScreen.tsx`.
2. Add route file in `app/new-feature.tsx` exporting the screen component.
3. If navigation guard is needed, update `src/hooks/useProtectedRoute.ts` or [`app/_layout.tsx`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/app/_layout.tsx).

## Scenario 2: Adding a New Backend Endpoint
1. Define route handler in `backend/src/routes/myNewRoute.ts`.
2. Mount the router in [`backend/src/app.ts`](file:///c:/Users/abuna/Desktop/proj/shri-gurudev-ashram-app/backend/src/app.ts) (e.g., `app.use('/api/my-feature', myNewRouter)`).
3. Call endpoint from mobile service in `src/services/myFeature.ts`.

## Scenario 3: Adding a New Database Column (End-to-End Trace)

Let's say you want to add a `passport_number` column for travel packages:

```
[1. PostgreSQL DB]  ──> Add 'passport_number' column to 'bookings' table
       │
       ▼
[2. Supabase Types] ──> Update src/types/database.types.ts with new column definition
       │
       ▼
[3. Frontend Types] ──> Update Booking interface in src/types/travel.ts
       │
       ▼
[4. Backend Route]  ──> Update backend/src/routes/bookings.ts to accept passportNumber body parameter
       │
       ▼
[5. Service Layer]  ──> Update CreateBookingInput & mapBookingRow() in src/services/bookings.ts
       │
       ▼
[6. Component UI]   ──> Add Passport Number <AppInput /> in src/features/bookings/BookingForm.tsx
```

---

# Architecture Decisions

### 1. Why Expo Router?
* **Pros:** Native file-system routing identical to modern React web frameworks, automatic deep linking support, built-in tab/stack layouts.
* **Cons:** Strict file naming rules; routing files must remain light.

### 2. Why Services & Zustand over Redux?
* **Pros:** Zustand requires zero boilerplate compared to Redux Toolkit. Services keep API logic decoupled from UI components without complex middleware.
* **Cons:** Requires discipline to keep service calls outside of components.

### 3. Why Dual Database (Supabase PostgreSQL + MongoDB)?
* **Pros:** 
  - **Supabase (PostgreSQL):** Used for Yatra bookings, travel packages, and user profiles where relational integrity, transactional locks, and seat counts matter.
  - **MongoDB:** Used for flexible donation records, collector hierarchies, dynamic donation heads, and leaderboard tracking.
* **Cons:** Developers must manage connection pools and configuration for two database systems.

---

# Repository Dependency Graph

Here is how code layers depend on one another:

```
                  ┌──────────────────────────────┐
                  │          app/ Routes         │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    src/screens & features    │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌──────────────────┐            ┌──────────────────┐
       │   src/components │            │   src/store      │
       └──────────────────┘            └────────┬─────────┘
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │   src/services   │
                                       └────────┬─────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌─────────────────────────────────┐                           ┌─────────────────────────────────┐
│     src/lib/supabase SDK        │                           │  backend Express REST API       │
└────────────────┬────────────────┘                           └────────────────┬────────────────┘
                 │                                                             │
                 ▼                                                             ▼
┌─────────────────────────────────┐                           ┌─────────────────────────────────┐
│ Supabase Cloud Database (PG)    │                           │ MongoDB + Supabase Admin DB     │
└─────────────────────────────────┘                           └─────────────────────────────────┘
```

---

# Mental Model

If you only remember **five things** about this architecture:

1. **`app/` is for routing, `src/` is for logic:** Keep routing entry files thin wrappers; put screens, components, and state inside `src/`.
2. **Components never fetch data directly:** Components invoke functions in `src/services/`, keeping UI decoupled from networking logic.
3. **Zustand handles global app state:** User sessions live in `useAuthStore`, and booking form progress is auto-saved in `useBookingDraftStore`.
4. **Data flows strictly downwards:** `Services/Stores` ➔ `Features/Screens` ➔ `Reusable Components`.
5. **The backend bridges mobile to databases:** While basic package lists read directly from Supabase for speed, critical operations (bookings, payments, donations, verification) pass through the Node.js Express server (`backend/`).
