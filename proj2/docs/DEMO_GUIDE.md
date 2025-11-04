# End-to-End Demo Guide

This guide provides step-by-step instructions for recording an end-to-end demo video showcasing the complete order lifecycle from student → vendor → robot assignment.

## Prerequisites

1. Backend server running on `http://localhost:3000`
2. Frontend client running (typically on `http://localhost:5173` or similar)
3. Database seeded with sample data (or use the seed script)
4. Telemetry simulator enabled (optional, for robot visualization)

## Demo Script

### Step 1: Setup (Record this)
1. Start the backend server: `npm run dev` (or `npm run dev:telemetry` for telemetry)
2. Start the frontend client: `cd client && npm run dev`
3. Show the application is running by navigating to the home page

### Step 2: Student Places Order (Record this)
1. **As a Student:**
   - Navigate to the home page
   - Click "Login" and register/log in as a student (or use existing account)
   - Browse restaurants
   - Click on a restaurant to view menu
   - Add items to cart
   - Click "Checkout" or cart icon
   - Enter delivery location (e.g., "Engineering Building, Room 201")
   - Place order
   - Show order confirmation

### Step 3: View Order as Student (Record this)
1. Navigate to "My Orders" page
2. Show the order in CREATED status
3. Click on the order to view tracking page
4. Show order details, items, delivery location

### Step 4: Vendor Kiosk View (Record this)
1. **Logout as student**
2. **Login as Vendor:**
   - Register/log in as a vendor
   - Header should show "Vendor Kiosk" link
   - Navigate to `/vendor/kiosk`

### Step 5: Vendor Manages Order (Record this)
1. **In Vendor Kiosk:**
   - Show order list with the order in CREATED status
   - Show status filter tabs (ALL, CREATED, PREPARING, etc.)
   - Click on the order card
   - Show order details in the modal:
     - Order items
     - Total amount
     - Delivery location
     - Current status
   - Update status: CREATED → PREPARING
     - Click the transition button or use status update
     - Show status change in real-time
   - Update status: PREPARING → READY
     - Show status update
     - **Emphasize**: Robot assignment should automatically happen when status becomes READY
     - Show robot assignment indicator in order details

### Step 6: Robot Assignment (Record this)
1. Show that robot is now assigned:
   - In order details modal, show "Robot Assigned" section
   - Show robot ID
2. Navigate to Fleet Dashboard (`/fleet`)
3. Show the assigned robot in the fleet dashboard:
   - Robot status should be ASSIGNED
   - Show robot location, battery, etc.

### Step 7: Order Tracking (Record this)
1. **Switch back to student account**
2. Navigate to order tracking page
3. Show:
   - Progress bar with current status (READY or ASSIGNED)
   - Robot information (if assigned)
   - Estimated delivery time
   - Real-time status updates

### Step 8: Complete Order Lifecycle (Record this)
1. **As Vendor:**
   - Show order progression:
     - CREATED → PREPARING → READY
   - Robot automatically assigned
2. **Optional:** Show EN_ROUTE and DELIVERED status transitions
   - These could be triggered automatically or manually
3. Show final order state as DELIVERED

## Key Points to Emphasize

1. **Seamless Handoff**: Show how order moves from student to vendor to robot
2. **Automatic Robot Assignment**: When vendor marks order as READY, robot is automatically assigned
3. **Real-time Updates**: Show polling/updates happening in both student and vendor views
4. **Authorization**: Show that vendors can only see/manage their own orders
5. **Status Transitions**: Highlight the workflow: CREATED → PREPARING → READY → ASSIGNED → EN_ROUTE → DELIVERED

## Recording Tips

1. Use screen recording software (e.g., OBS, QuickTime, Loom)
2. Record at 1080p or higher resolution
3. Narrate the steps as you go
4. Highlight UI elements with mouse movements
5. Show network tab (optional) to demonstrate API calls
6. Keep video under 5-7 minutes for best engagement
7. Show both student and vendor perspectives clearly

## Sample Test Data

For a smooth demo, you may want to seed the database with:
- At least one vendor user
- At least one student user
- A restaurant associated with the vendor
- Menu items for the restaurant
- At least one available robot

Use the seed script: `npm run seed` or check `scripts/check-and-seed.js`

## Troubleshooting

- **No orders showing**: Make sure vendor ID matches between order and vendor account
- **Robot not assigning**: Check that:
  - Order has delivery location coordinates
  - At least one robot is available (status: IDLE)
  - Robot assignment service is working
- **Status not updating**: Verify authentication tokens are valid
- **CORS errors**: Ensure backend CORS is configured correctly

## Video Upload

After recording:
1. Edit video to remove any mistakes or pauses
2. Add annotations/text overlays for key moments
3. Export in a common format (MP4, WebM)
4. Upload to video hosting (YouTube, Vimeo, etc.)
5. Update README.md with link to demo video

---

**Note**: This demo guide documents the expected flow. The actual implementation allows vendors to manage orders through the kiosk interface with real-time updates and automatic robot assignment.

