# CSV Bulk Upload for Units - Documentation

## Overview

Added CSV bulk upload functionality to the Property Entry page, specifically for the "Add Units to Existing Building" option.

## Implementation Details

### 1. User Flow

1. User selects "Add Units to Existing Building" entry type
2. User selects a building from the dropdown
3. Once building is selected, user can choose between:
   - **Manual Entry (Form)** - Traditional form-based unit entry
   - **Bulk Upload (CSV)** - Upload multiple units via CSV file

### 2. CSV Template

- **Endpoint**: `/api/csv-template/units?building_id={id}`
- **Pre-filled**: Building ID is automatically included in the template
- **Columns**:
  - `building_id` - Pre-filled with selected building (required)
  - `name` - Unit name/number (required)
  - `bedrooms` - Number of bedrooms (required, must be positive)
  - `bathrooms` - Number of bathrooms (required, must be positive)
  - `space_sqm` - Space in square meters (required, must be positive)
  - `floor_number` - Floor number (required)
  - `amenities` - Amenities list (optional, e.g., "WiFi, Balcony, Parking")
  - `has_dsq` - DSQ available (optional, true/false/yes/no/1/0, defaults to false)
  - `rent_amount_kes` - Monthly rent in KES (required, must be positive)
  - `deposit_amount_kes` - Deposit amount in KES (required, must be positive)

### 3. CSV Upload API

- **Endpoint**: `/api/csv-upload/units`
- **Method**: POST
- **Max file size**: 5MB
- **Max rows**: 500 per upload

#### Validation Phases:

1. **Format Validation**:

   - Required fields: building_id, name, bedrooms, bathrooms, space_sqm, floor_number, rent_amount_kes, deposit_amount_kes
   - Number format validation for numeric fields
   - Boolean validation for has_dsq (true/false/yes/no/1/0)
   - Duplicate detection within CSV

2. **Database Validation**:
   - Building existence check
   - Unit name uniqueness check (within same building)
3. **Transaction Processing**:
   - All units inserted in a single transaction
   - Rollback on any error
   - Returns detailed success/error report

### 4. Files Created/Modified

#### New Files:

- `src/app/api/csv-template/units/route.js` - Template generation
- `src/app/api/csv-upload/units/route.js` - CSV upload processing
- `src/app/(dashboard)/dashboard/property_entry/CSVUnitUpload.jsx` - Upload UI component

#### Modified Files:

- `src/app/(dashboard)/dashboard/property_entry/page.jsx`:
  - Added `uploadMethod` state (manual/csv)
  - Added upload method radio buttons (only shown after building selection)
  - Conditional rendering: CSV upload component vs. manual form
  - Hide submit button when using CSV upload

### 5. Features

- ✅ Drag-and-drop file upload
- ✅ File size and type validation
- ✅ Building ID pre-filled in template
- ✅ Comprehensive error reporting with row numbers
- ✅ Success summary with created units
- ✅ Transaction-based processing (all-or-nothing)
- ✅ Duplicate unit name detection
- ✅ Building existence validation
- ✅ Automatic redirect to property records after successful upload

### 6. Error Handling

- Format errors: Invalid data types, missing required fields, enum values
- Database errors: Non-existent buildings, duplicate unit names
- System errors: File too large, parsing errors, transaction failures

### 7. Security

- File size limits (5MB)
- Row count limits (500 rows)
- Building ID validation
- Transaction rollback on errors

## Usage Example

### CSV Template (building_id=5):

```csv
building_id,name,bedrooms,bathrooms,space_sqm,floor_number,amenities,has_dsq,rent_amount_kes,deposit_amount_kes
5,A101,2,1,75,1,"WiFi, Balcony, Parking",false,25000,50000
5,A102,3,2,95,1,"WiFi, Gym Access, Security",true,30000,60000
5,A201,2,1,80,2,"WiFi, Balcony",false,28000,56000
```

## Testing Checklist

- [ ] Download template with correct building_id
- [ ] Upload valid CSV with multiple units
- [ ] Test validation: missing required fields
- [ ] Test validation: invalid building_id
- [ ] Test validation: duplicate unit names
- [ ] Test validation: invalid enum values
- [ ] Test drag-and-drop functionality
- [ ] Test file size limit (>5MB)
- [ ] Test row limit (>500 rows)
- [ ] Verify transaction rollback on error
- [ ] Verify success redirect to property records

## Notes

- Only available for "Add Units to Existing Building" option
- Upload method selection appears only after building is selected
- Building ID is locked to prevent accidental mismatches
- All units in CSV must belong to the same building
- Manual form remains available for single unit entry
