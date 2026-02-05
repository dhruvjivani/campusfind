const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🚀 Testing CampusFind API - Full CRUD Operations...\n');
  
  let token, token2, itemId, itemId2, itemId3, claimId, claimId2;
  
  try {
    // ============ AUTHENTICATION TESTS ============
    console.log('📝 === AUTHENTICATION ===\n');
    
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE}/`);
    console.log('✅ Health check passed:', health.data.message);
    
    console.log('\n2. Registering first user...');
    const timestamp = Date.now();
    const registerData = {
      student_id: `S${timestamp}`,
      email: `test.${timestamp}@conestogac.on.ca`,
      first_name: 'Test',
      last_name: 'User1',
      campus: 'Main',
      program: 'Testing',
      password: 'Test123'
    };
    
    const register = await axios.post(`${API_BASE}/api/auth/register`, registerData);
    console.log('✅ User registered:', register.data.user.email);
    token = register.data.token;
    
    console.log('\n3. Registering second user...');
    const registerData2 = {
      student_id: `S${timestamp + 1}`,
      email: `test2.${timestamp + 1}@conestogac.on.ca`,
      first_name: 'Test',
      last_name: 'User2',
      campus: 'Main',
      program: 'Testing',
      password: 'Test123'
    };
    
    const register2 = await axios.post(`${API_BASE}/api/auth/register`, registerData2);
    console.log('✅ Second user registered:', register2.data.user.email);
    token2 = register2.data.token;
    
    console.log('\n4. Testing login...');
    const login = await axios.post(`${API_BASE}/api/auth/login`, {
      email: registerData.email,
      password: 'Test123'
    });
    console.log('✅ Login successful');
    
    // ============ ITEMS CRUD TESTS ============
    console.log('\n\n📦 === ITEMS CRUD OPERATIONS ===\n');
    
    console.log('5. CREATE - Reporting found item...');
    const formData = new FormData();
    formData.append('title', 'iPhone 14 Pro');
    formData.append('category', 'electronics');
    formData.append('description', 'Found near library entrance');
    formData.append('location_found', 'Library Main Entrance');
    formData.append('campus', 'Main');
    
    const item = await axios.post(`${API_BASE}/api/items/found`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    itemId = item.data.item.id;
    console.log('✅ Item created:', item.data.item.title, '(ID:', itemId, ')');
    
    console.log('\n6. CREATE - Reporting lost item...');
    const formData2 = new FormData();
    formData2.append('title', 'Samsung Galaxy Watch');
    formData2.append('category', 'electronics');
    formData2.append('description', 'Lost at parking lot');
    formData2.append('location_lost', 'Parking Lot A');
    formData2.append('campus', 'Main');
    
    const lostItem = await axios.post(`${API_BASE}/api/items/lost`, formData2, {
      headers: {
        'Authorization': `Bearer ${token2}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    itemId2 = lostItem.data.item.id;
    console.log('✅ Lost item created:', lostItem.data.item.title, '(Status: lost)');
    
    console.log('\n7. READ - Getting single item...');
    const getItem = await axios.get(`${API_BASE}/api/items/${itemId}`);
    console.log('✅ Retrieved item:', getItem.data.title, 'by', getItem.data.first_name);
    
    console.log('\n8. READ - Getting all items with filters...');
    const items = await axios.get(`${API_BASE}/api/items?category=electronics&limit=10&page=1`);
    console.log(`✅ Retrieved ${items.data.count} items (Total: ${items.data.total})`);
    
    console.log('\n9. UPDATE - Updating item details...');
    const updateItem = await axios.put(`${API_BASE}/api/items/${itemId}`, {
      title: 'iPhone 14 Pro - Space Black',
      description: 'Found near library entrance, pristine condition'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Item updated:', updateItem.data.item.title);
    
    // ============ CLAIMS CRUD TESTS ============
    console.log('\n\n🎯 === CLAIMS CRUD OPERATIONS ===\n');
    
    console.log('10. CREATE - Submitting claim for item...');
    const claim = await axios.post(`${API_BASE}/api/claims`, {
      item_id: itemId2
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    claimId = claim.data.claim.id;
    console.log('✅ Claim submitted (ID:', claimId, ') with status:', claim.data.claim.status);
    
    console.log('\n11. CREATE - Creating another item for second claim...');
    const formData3 = new FormData();
    formData3.append('title', 'AirPods Pro Max');
    formData3.append('category', 'electronics');
    formData3.append('description', 'Found in cafeteria');
    formData3.append('location_found', 'Cafeteria');
    formData3.append('campus', 'Main');
    
    const item3 = await axios.post(`${API_BASE}/api/items/found`, formData3, {
      headers: {
        'Authorization': `Bearer ${token2}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    itemId3 = item3.data.item.id;
    console.log('✅ Second item created for claim test (ID:', itemId3, ')');
    
    console.log('\n12. CREATE - Submitting second claim...');
    const claim2 = await axios.post(`${API_BASE}/api/claims`, {
      item_id: itemId3
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    claimId2 = claim2.data.claim.id;
    console.log('✅ Second claim submitted (ID:', claimId2, ')');
    
    console.log('\n13. READ - Getting single claim...');
    const getClaim = await axios.get(`${API_BASE}/api/claims/${claimId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Retrieved claim for item:', getClaim.data.item_title);
    
    console.log('\n14. READ - Getting user claims...');
    const userClaims = await axios.get(`${API_BASE}/api/claims/user/my-claims`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${userClaims.data.count} user claims`);
    
    console.log('\n15. READ - Getting claims for specific item...');
    const itemClaims = await axios.get(`${API_BASE}/api/items/${itemId3}/claims`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${itemClaims.data.count} claims for this item`);
    
    console.log('\n16. UPDATE - Updating claim...');
    const updateClaim = await axios.put(`${API_BASE}/api/claims/${claimId2}`, {
      status: 'pending'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Claim updated with status:', updateClaim.data.claim.status);
    
    console.log('\n17. DELETE - Deleting pending claim...');
    const deleteClaim = await axios.delete(`${API_BASE}/api/claims/${claimId2}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Claim deleted successfully');
    
    // Verify item status reverted
    const itemAfterDelete = await axios.get(`${API_BASE}/api/items/${itemId3}`);
    console.log('   Item status reverted to:', itemAfterDelete.data.status);
    
    // ============ TEST SUMMARY ============
    console.log('\n\n📊 === TEST SUMMARY ===');
    console.log('✅ All CRUD Operations Completed Successfully!\n');
    console.log('Tested Operations:');
    console.log('  Authentication:');
    console.log('    ✓ User registration');
    console.log('    ✓ User login');
    console.log('  Items:');
    console.log('    ✓ CREATE - Report found/lost items');
    console.log('    ✓ READ - Get single item, Get all items with filters');
    console.log('    ✓ UPDATE - Update item details');
    console.log('  Claims:');
    console.log('    ✓ CREATE - Submit claims');
    console.log('    ✓ READ - Get claim, user claims, item claims');
    console.log('    ✓ UPDATE - Update claim status');
    console.log('    ✓ DELETE - Delete pending claim');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Details:', error.response?.data);
  }
}

testAPI();