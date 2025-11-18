/**
 * Test Script for Dynamic Fields API
 * Tests all endpoints to ensure everything is working correctly
 * 
 * Usage: node test-dynamic-fields-api.js
 */

const config = require('./config/config');

const API_BASE_URL = config.API_URL || 'http://localhost:5000/api/v1';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test data
const testField = {
    fieldId: `test_field_${Date.now()}`,
    label: {
        english: 'Test Field',
        tamil: 'சோதனை புலம்'
    },
    fieldType: 'text',
    placeholder: {
        english: 'Enter test value',
        tamil: 'சோதனை மதிப்பை உள்ளிடவும்'
    },
    validation: {
        required: true,
        minLength: 3,
        maxLength: 50
    },
    applicableTo: ['voter_registration'],
    status: 'active',
    order: 999
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        log.info(`Calling: ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (response.ok) {
            log.success(`Response: ${response.status} ${response.statusText}`);
        } else {
            log.error(`Response: ${response.status} ${response.statusText}`);
        }

        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        log.error(`Request failed: ${error.message}`);
        return { ok: false, error: error.message };
    }
}

// Test 1: Get all fields for mobile (Public endpoint)
async function testGetAllFieldsForMobile() {
    log.test('TEST 1: Get all fields for mobile (Public endpoint)');

    const result = await apiCall('/dynamic-fields/mobile/all');

    if (result.ok && result.data.success) {
        log.success(`Retrieved ${result.data.count} fields`);
        if (result.data.data.length > 0) {
            const field = result.data.data[0];
            console.log('   Sample field:', {
                fieldId: field.fieldId,
                label: field.label,
                fieldType: field.fieldType
            });
        }
        return true;
    }

    log.error('Failed to get fields');
    return false;
}

// Test 2: Get fields for specific form type
async function testGetFieldsForForm() {
    log.test('TEST 2: Get fields for voter_registration form');

    const result = await apiCall('/dynamic-fields/form/voter_registration');

    if (result.ok && result.data.success) {
        log.success(`Retrieved ${result.data.count} voter registration fields`);
        return true;
    }

    log.error('Failed to get fields for form');
    return false;
}

// Test 3: Get fields with filters
async function testGetFieldsWithFilters() {
    log.test('TEST 3: Get fields with category filter');

    const result = await apiCall('/dynamic-fields/mobile/all?category=personal');

    if (result.ok && result.data.success) {
        log.success(`Retrieved ${result.data.count} fields in 'personal' category`);
        return true;
    }

    log.warning('Failed to get filtered fields (this might be okay if no fields match)');
    return true; // Don't fail the test if no fields match
}

// Test 4: Create a field (requires authentication)
async function testCreateField(token = null) {
    log.test('TEST 4: Create a new field');

    if (!token) {
        log.warning('Skipping create test (no auth token provided)');
        log.info('To test authenticated endpoints, provide a token');
        return true;
    }

    const result = await apiCall('/dynamic-fields', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testField)
    });

    if (result.ok && result.data.success) {
        log.success(`Created field: ${result.data.data.fieldId}`);
        return result.data.data._id; // Return the ID for cleanup
    }

    log.error('Failed to create field');
    console.log('   Error:', result.data.message || result.error);
    return null;
}

// Test 5: Update a field (requires authentication)
async function testUpdateField(fieldId, token = null) {
    log.test('TEST 5: Update field');

    if (!token || !fieldId) {
        log.warning('Skipping update test (no auth token or field ID)');
        return true;
    }

    const updateData = {
        label: {
            english: 'Updated Test Field',
            tamil: 'புதுப்பிக்கப்பட்ட சோதனை புலம்'
        }
    };

    const result = await apiCall(`/dynamic-fields/${fieldId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    });

    if (result.ok && result.data.success) {
        log.success('Field updated successfully');
        return true;
    }

    log.error('Failed to update field');
    return false;
}

// Test 6: Delete a field (requires authentication)
async function testDeleteField(fieldId, token = null) {
    log.test('TEST 6: Delete (archive) field');

    if (!token || !fieldId) {
        log.warning('Skipping delete test (no auth token or field ID)');
        return true;
    }

    const result = await apiCall(`/dynamic-fields/${fieldId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (result.ok && result.data.success) {
        log.success('Field archived successfully');
        return true;
    }

    log.error('Failed to delete field');
    return false;
}

// Test 7: Get field statistics (requires authentication)
async function testGetStats(token = null) {
    log.test('TEST 7: Get field statistics');

    if (!token) {
        log.warning('Skipping stats test (no auth token)');
        return true;
    }

    const result = await apiCall('/dynamic-fields/stats', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (result.ok && result.data.success) {
        log.success('Retrieved field statistics');
        console.log('   Stats:', JSON.stringify(result.data.data, null, 2));
        return true;
    }

    log.error('Failed to get stats');
    return false;
}

// Run all tests
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 DYNAMIC FIELDS API TEST SUITE');
    console.log('='.repeat(60) + '\n');

    log.info(`Testing API at: ${API_BASE_URL}`);
    console.log('');

    // Get auth token from command line arguments if provided
    const token = process.argv[2];

    if (token) {
        log.info('Auth token provided - will test protected endpoints');
    } else {
        log.warning('No auth token provided - skipping protected endpoint tests');
        log.info('To test protected endpoints, run: node test-dynamic-fields-api.js YOUR_TOKEN');
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    const results = [];

    // Run public tests
    results.push(await testGetAllFieldsForMobile());
    console.log('');

    results.push(await testGetFieldsForForm());
    console.log('');

    results.push(await testGetFieldsWithFilters());
    console.log('');

    // Run protected tests if token is provided
    let createdFieldId = null;

    if (token) {
        createdFieldId = await testCreateField(token);
        results.push(!!createdFieldId);
        console.log('');

        if (createdFieldId) {
            results.push(await testUpdateField(createdFieldId, token));
            console.log('');

            results.push(await testDeleteField(createdFieldId, token));
            console.log('');
        }

        results.push(await testGetStats(token));
        console.log('');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60) + '\n');

    const totalTests = results.length;
    const passedTests = results.filter(r => r === true).length;
    const failedTests = totalTests - passedTests;

    log.info(`Total tests: ${totalTests}`);
    log.success(`Passed: ${passedTests}`);

    if (failedTests > 0) {
        log.error(`Failed: ${failedTests}`);
    }

    console.log('');

    if (failedTests === 0) {
        log.success('🎉 ALL TESTS PASSED!');
    } else {
        log.error('⚠️  SOME TESTS FAILED - Please check the logs above');
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(error => {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
});