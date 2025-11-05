# CSV Unit Upload - Field Corrections

## Issue

The CSV template and upload API were using incorrect fields that didn't match the actual units table schema and UnitForm.jsx fields.

## Corrections Made

### ❌ Old Fields (Incorrect)

```csv
building_id,name,floor,rent_amount_kes,deposit_amount_kes,occupancy_status,bedrooms,bathrooms,property_type,notes
```

### ✅ New Fields (Correct - Matching Database & Form)

```csv
building_id,name,bedrooms,bathrooms,space_sqm,floor_number,amenities,has_dsq,rent_amount_kes,deposit_amount_kes
```

## Field Mapping

| Field                | Type    | Required | Description                       | Validation             |
| -------------------- | ------- | -------- | --------------------------------- | ---------------------- |
| `building_id`        | Integer | Yes      | Building ID (pre-filled)          | Must exist in database |
| `name`               | String  | Yes      | Unit name/number                  | Unique per building    |
| `bedrooms`           | Integer | Yes      | Number of bedrooms                | Must be > 0            |
| `bathrooms`          | Integer | Yes      | Number of bathrooms               | Must be > 0            |
| `space_sqm`          | Decimal | Yes      | Space in square meters            | Must be > 0            |
| `floor_number`       | Integer | Yes      | Floor number                      | Any integer            |
| `amenities`          | Text    | No       | Amenities (e.g., "WiFi, Balcony") | Optional               |
| `has_dsq`            | Boolean | No       | DSQ available                     | true/false/yes/no/1/0  |
| `rent_amount_kes`    | Decimal | Yes      | Monthly rent in KES               | Must be > 0            |
| `deposit_amount_kes` | Decimal | Yes      | Deposit amount in KES             | Must be > 0            |

## Files Updated

1. **`/api/csv-template/units/route.js`**

   - Updated headers to match correct fields
   - Updated sample data rows
   - Kept building_id pre-filled

2. **`/api/csv-upload/units/route.js`**

   - Removed validation for old fields (floor, occupancy_status, property_type, notes)
   - Added validation for new fields (bedrooms, bathrooms, space_sqm, floor_number, has_dsq, amenities)
   - Updated INSERT statement to use correct column names
   - Added boolean parser for has_dsq field
   - Updated success response to include bedrooms, bathrooms, space_sqm

3. **`CSVUnitUpload.jsx`**

   - Updated success table to display: Unit Name, Building, Bedrooms, Bathrooms, Space (sqm), Rent, Deposit
   - Added more columns to show complete unit information

4. **`csv_unit_upload_documentation.md`**
   - Updated field descriptions
   - Updated example CSV data
   - Corrected validation rules

## Database Schema Verified

```sql
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id),
    owner_id INTEGER,
    name VARCHAR(100) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    space_sqm DOUBLE PRECISION NOT NULL,
    floor_number INTEGER NOT NULL,
    amenities TEXT,
    has_dsq BOOLEAN DEFAULT FALSE,
    rent_amount_kes NUMERIC(10,2) NOT NULL,
    deposit_amount_kes NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_bedrooms CHECK (bedrooms > 0),
    CONSTRAINT valid_bathrooms CHECK (bathrooms > 0),
    CONSTRAINT valid_space CHECK (space_sqm > 0),
    CONSTRAINT valid_rent CHECK (rent_amount_kes > 0)
);
```

## Example CSV (Corrected)

```csv
building_id,name,bedrooms,bathrooms,space_sqm,floor_number,amenities,has_dsq,rent_amount_kes,deposit_amount_kes
5,A101,2,1,75,1,"WiFi, Balcony, Parking",false,25000,50000
5,A102,3,2,95,1,"WiFi, Gym Access, Security",true,30000,60000
5,A201,2,1,80,2,"WiFi, Balcony",false,28000,56000
```

## Key Changes Summary

### Removed Fields:

- ❌ `floor` → Replaced with `floor_number`
- ❌ `occupancy_status` → Not used in unit creation (set during tenant assignment)
- ❌ `property_type` → Not in schema
- ❌ `notes` → Not in schema

### Added Fields:

- ✅ `bedrooms` → Now required (was optional)
- ✅ `bathrooms` → Now required (was optional)
- ✅ `space_sqm` → Required for unit size
- ✅ `floor_number` → Replaces `floor`
- ✅ `amenities` → Optional text field
- ✅ `has_dsq` → Boolean for DSQ availability

### Validation Changes:

- `bedrooms` and `bathrooms` must be positive (> 0), not just non-negative
- `space_sqm` must be positive (> 0)
- `has_dsq` accepts: true/false, yes/no, 1/0
- Removed enum validation for occupancy_status and property_type

## Testing Recommendations

1. Download new CSV template - verify all fields are present
2. Upload sample CSV with valid data
3. Test validation:
   - Missing required fields (bedrooms, bathrooms, space_sqm, floor_number)
   - Invalid bedrooms/bathrooms (zero or negative)
   - Invalid space_sqm (zero or negative)
   - Invalid has_dsq values (not true/false/yes/no/1/0)
4. Verify units are created with all fields correctly saved
5. Check success table displays all unit information

## Status

✅ All files updated and validated
✅ No lint errors
✅ Fields match database schema
✅ Fields match UnitForm.jsx
✅ Documentation updated
