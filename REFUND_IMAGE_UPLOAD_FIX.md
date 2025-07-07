# Refund Image Upload Fix

## Problem
When users upload images for refund requests, the images were not reaching the admin. The refund requests were being submitted but without the uploaded images.

## Root Cause Analysis

### 1. Wrong Controller Being Used
The tracking routes were using `requestRefundSimple` instead of the full `requestRefund` function:
- `requestRefundSimple`: Basic refund handling without image upload support
- `requestRefund`: Full refund handling with image upload support using multer middleware

### 2. Missing Upload Middleware
The routes were not configured with the necessary multer middleware for handling file uploads:
- Missing `uploadRefundImages` middleware
- Missing `handleUploadError` middleware

### 3. Storage Configuration Issue
The upload middleware was using `multer.memoryStorage()` which doesn't generate filenames, but the controller was trying to access `file.filename`.

### 4. Missing Routes Registration
The uploads routes (`/api/uploads`) were not registered in the main app, so uploaded images couldn't be served.

### 5. Access Control Issue
The uploads routes were restricted to admin only, but customers should be able to view their own uploaded refund images.

## Fixes Applied

### 1. Fixed Route Configuration
**Files Modified:**
- `backend/routes/tracking.routes.js`
- `backend/routes/tracking-fixed.routes.js`

**Changes:**
```javascript
// Before (BROKEN)
router.put('/refund/:trackingId', requestRefundSimple);

// After (FIXED)
router.put('/refund/:trackingId', uploadRefundImages, handleUploadError, requestRefund);
```

### 2. Fixed Upload Middleware
**File Modified:** `backend/middleware/upload.middleware.js`

**Changes:**
- Changed from `multer.memoryStorage()` to `multer.diskStorage()`
- Added proper filename generation: `refund-${timestamp}-${random}.ext`
- Added automatic directory creation for `uploads/refunds/`

### 3. Registered Upload Routes
**File Modified:** `backend/app.js`

**Changes:**
```javascript
// Added missing import
import uploadsRoutes from './routes/uploads.routes.js';

// Added missing route registration
app.use('/api/uploads', uploadsRoutes);
```

### 4. Fixed Access Control
**File Modified:** `backend/routes/uploads.routes.js`

**Changes:**
- Removed admin-only restriction for viewing refund images
- Added logic to allow customers to view their own uploaded images
- Added database lookup to verify image ownership

## How It Works Now

### 1. Image Upload Process
1. User selects images in RefundModal
2. FormData is created with images and refund details
3. Request sent to `/api/tracking/refund/:trackingId`
4. `uploadRefundImages` middleware processes files
5. Files saved to `uploads/refunds/` with unique names
6. `requestRefund` controller saves file metadata to database
7. Admin receives real-time notification with image count

### 2. Image Viewing Process
1. Admin views refund requests at `/api/admin/refunds`
2. Response includes image URLs: `/api/uploads/refunds/filename.ext`
3. Admin can click images to view full size
4. Access control ensures only admin or image owner can view

### 3. Database Storage
Images are stored in the tracking document under:
```javascript
payment: {
  refundImages: [{
    filename: 'refund-1750324640990-139354349.png',
    originalName: 'damage-photo.jpg',
    mimetype: 'image/jpeg',
    size: 1024000,
    uploadedAt: Date
  }]
}
```

## Testing

### Test Files Created
1. `test-refund-upload.html` - Test customer image upload
2. `test-admin-refunds.html` - Test admin viewing refund requests with images

### Test Steps
1. Open `test-refund-upload.html`
2. Enter valid tracking ID and user token
3. Select images and fill refund details
4. Submit request
5. Open `test-admin-refunds.html`
6. Enter admin token
7. Load refund requests
8. Verify images are visible and clickable

## Verification Points

### ✅ Customer Side
- [ ] Images can be selected in RefundModal
- [ ] FormData includes images in request
- [ ] Success message shows image count
- [ ] No errors during upload

### ✅ Admin Side
- [ ] Refund requests show image count
- [ ] Images are displayed as thumbnails
- [ ] Images can be clicked to view full size
- [ ] Image URLs are accessible

### ✅ Backend
- [ ] Files saved to `uploads/refunds/` directory
- [ ] Database contains image metadata
- [ ] Real-time notifications include image info
- [ ] Access control works correctly

## File Structure
```
backend/
├── uploads/
│   └── refunds/
│       ├── refund-1750324640990-139354349.png
│       └── refund-1750324644160-42641806.png
├── middleware/
│   └── upload.middleware.js (FIXED)
├── routes/
│   ├── tracking.routes.js (FIXED)
│   ├── tracking-fixed.routes.js (FIXED)
│   └── uploads.routes.js (FIXED)
├── controllers/
│   ├── tracking.controller.js (requestRefund function)
│   └── admin.refund.controller.js (admin viewing)
└── app.js (FIXED - added uploads routes)
```

## API Endpoints

### Customer Endpoints
- `PUT /api/tracking/refund/:trackingId` - Submit refund with images
- `GET /api/uploads/refunds/:filename` - View own uploaded images

### Admin Endpoints
- `GET /api/admin/refunds` - Get all refund requests with images
- `GET /api/admin/refunds/:trackingId` - Get specific refund details
- `PUT /api/admin/refunds/:trackingId/approve` - Approve refund
- `PUT /api/admin/refunds/:trackingId/reject` - Reject refund
- `GET /api/uploads/refunds/:filename` - View any refund image

## Security Features
- File type validation (images only)
- File size limit (10MB per file)
- Maximum file count (5 files)
- Access control (owner or admin only)
- Unique filename generation
- Path traversal protection

## Next Steps
1. Test the fix with real refund requests
2. Monitor admin dashboard for image visibility
3. Verify email notifications mention image attachments
4. Consider adding image compression for large files
5. Add image deletion functionality for cancelled refunds