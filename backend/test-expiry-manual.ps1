# Manual Testing Guide for Expiry Functionality
# Copy and paste these commands in PowerShell to test expiry features

# Note: Make sure your server is running on port 5000 first!

# ===================================
# STEP 1: Create a farmer account (if not exists)
# ===================================
Invoke-RestMethod -Uri "http://localhost:5000/api/users/register" -Method POST -ContentType "application/json" -Body '{"name":"Test Farmer","email":"farmer@test.com","password":"password123","type":"farmer","address":"Test Farm Address","phone":"1234567890"}'

# ===================================
# STEP 2: Login as farmer to get token
# ===================================
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" -Method POST -ContentType "application/json" -Body '{"email":"farmer@test.com","password":"password123"}'
$token = $loginResponse.token
Write-Host "Token: $token"

# ===================================
# STEP 3: Create test products with different expiry dates
# ===================================

# Create EXPIRED product (expired 6 days ago)
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method POST -ContentType "application/json" -Headers $headers -Body '{"productName":"Expired Apples","price":25.50,"lastPrice":30.00,"description":"Already expired apples","quantityInStock":50,"expiryDate":"2025-09-15T00:00:00.000Z"}'

# Create product EXPIRING SOON (expires in 4 days)
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method POST -ContentType "application/json" -Headers $headers -Body '{"productName":"Bananas Expiring Soon","price":15.00,"lastPrice":18.00,"description":"Bananas expiring within 7 days","quantityInStock":100,"expiryDate":"2025-09-25T00:00:00.000Z"}'

# Create FRESH product (expires in future)
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method POST -ContentType "application/json" -Headers $headers -Body '{"productName":"Fresh Oranges","price":35.00,"lastPrice":40.00,"description":"Fresh oranges, good for weeks","quantityInStock":75,"expiryDate":"2025-10-15T00:00:00.000Z"}'

# ===================================
# STEP 4: Test utility endpoints
# ===================================

# Check system health (shows expiry statistics)
Write-Host "`n=== SYSTEM HEALTH ===" -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:5000/api/utility/health" -Method GET

# Check products expiring within 7 days
Write-Host "`n=== PRODUCTS EXPIRING SOON (7 days) ===" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/api/utility/expiring-soon" -Method GET

# Check products expiring within 10 days
Write-Host "`n=== PRODUCTS EXPIRING SOON (10 days) ===" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/api/utility/expiring-soon?days=10" -Method GET

# ===================================
# STEP 5: Test cart functionality with expired products
# ===================================

# Get all products to find their IDs
$products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET
$expiredProduct = $products.list | Where-Object { $_.productName -like "*Expired*" } | Select-Object -First 1
$freshProduct = $products.list | Where-Object { $_.productName -like "*Fresh*" } | Select-Object -First 1

Write-Host "`n=== TESTING CART WITH EXPIRED PRODUCT ===" -ForegroundColor Red
if ($expiredProduct) {
    Write-Host "Trying to add expired product: $($expiredProduct.productName)"
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/cart" -Method POST -ContentType "application/json" -Headers $headers -Body "{`"productId`":`"$($expiredProduct._id)`",`"quantity`":2}"
    } catch {
        Write-Host "Expected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== TESTING CART WITH FRESH PRODUCT ===" -ForegroundColor Green
if ($freshProduct) {
    Write-Host "Adding fresh product: $($freshProduct.productName)"
    Invoke-RestMethod -Uri "http://localhost:5000/api/cart" -Method POST -ContentType "application/json" -Headers $headers -Body "{`"productId`":`"$($freshProduct._id)`",`"quantity`":3}"
}

# ===================================
# STEP 6: Clean up expired products
# ===================================
Write-Host "`n=== CLEANING UP EXPIRED PRODUCTS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/utility/expired-products" -Method DELETE

# ===================================
# STEP 7: Verify cleanup worked
# ===================================
Write-Host "`n=== SYSTEM HEALTH AFTER CLEANUP ===" -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:5000/api/utility/health" -Method GET

Write-Host "`n✅ Expiry testing completed!" -ForegroundColor Green