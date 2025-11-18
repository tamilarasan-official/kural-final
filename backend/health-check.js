const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
    const startTime = Date.now();
    try {
        let response;
        if (method === 'GET') {
            response = await axios.get(url);
        } else if (method === 'POST') {
            response = await axios.post(url, data);
        }

        const responseTime = Date.now() - startTime;
        const status = response.status === expectedStatus ? '✅ PASS' : '⚠️  WARN';

        if (response.status === expectedStatus) {
            results.passed++;
        } else {
            results.warnings++;
        }

        let performanceColor = colors.green;
        if (responseTime > 500) performanceColor = colors.red;
        else if (responseTime > 200) performanceColor = colors.yellow;

        console.log(`${status} ${colors.cyan}${name}${colors.reset}`);
        console.log(`    ${colors.blue}${method} ${url}${colors.reset}`);
        console.log(`    Response: ${response.status} | Time: ${performanceColor}${responseTime}ms${colors.reset}`);

        if (response.data) {
            if (response.data.success !== undefined) {
                console.log(`    Success: ${response.data.success ? '✅' : '❌'}`);
            }
            if (response.data.data) {
                const dataInfo = typeof response.data.data === 'object' ?
                    Object.keys(response.data.data).join(', ') :
                    'data returned';
                console.log(`    Data: ${dataInfo}`);
            }
        }
        console.log('');

        return response.data;
    } catch (error) {
        results.failed++;
        const responseTime = Date.now() - startTime;
        console.log(`${colors.red}❌ FAIL${colors.reset} ${colors.cyan}${name}${colors.reset}`);
        console.log(`    ${colors.blue}${method} ${url}${colors.reset}`);
        console.log(`    Error: ${error.response?.status || 'Network Error'} | Time: ${responseTime}ms`);
        console.log(`    Message: ${error.response?.data?.message || error.message}`);
        console.log('');
        return null;
    }
}

async function runHealthChecks() {
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.cyan}API HEALTH CHECK SUITE${colors.reset}`);
    console.log(`${colors.blue}Testing: ${BASE_URL}${colors.reset}`);
    console.log('='.repeat(80) + '\n');

    // ========================================
    // VOTER APIs
    // ========================================
    console.log(`${colors.yellow}📋 VOTER MANAGEMENT APIs${colors.reset}\n`);

    await testEndpoint(
        'Get Voters by Booth',
        'GET',
        `${BASE_URL}/voter/by-booth/111/BOOTH001?page=1&limit=50`
    );

    await testEndpoint(
        'Search Voters',
        'POST',
        `${BASE_URL}/voter/search`, { Name: 'kumar', aci_id: '111', booth_id: 'BOOTH001' }
    );

    // ========================================
    // SURVEY APIs
    // ========================================
    console.log(`${colors.yellow}📊 SURVEY MANAGEMENT APIs${colors.reset}\n`);

    const surveysData = await testEndpoint(
        'Get All Surveys',
        'GET',
        `${BASE_URL}/surveys?aci_id=111&limit=10`
    );

    if (surveysData && surveysData.data && surveysData.data.length > 0) {
        const firstSurvey = surveysData.data[0];

        await testEndpoint(
            'Get Survey by ID',
            'GET',
            `${BASE_URL}/surveys/${firstSurvey._id}`
        );

        await testEndpoint(
            'Get Completed Voters for Survey',
            'GET',
            `${BASE_URL}/surveys/${firstSurvey._id}/completed-voters`
        );
    }

    await testEndpoint(
        'Get Booth Survey Stats',
        'GET',
        `${BASE_URL}/surveys/booth-stats?aci_id=111&booth_id=BOOTH001`
    );

    await testEndpoint(
        'Get Survey Progress',
        'GET',
        `${BASE_URL}/surveys/progress?aci_id=111`
    );

    // ========================================
    // DYNAMIC FIELDS APIs
    // ========================================
    console.log(`${colors.yellow}🔧 DYNAMIC FIELDS APIs${colors.reset}\n`);

    await testEndpoint(
        'Get All Voter Fields',
        'GET',
        `${BASE_URL}/voter-fields`
    );

    // ========================================
    // RESULTS SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.cyan}TEST RESULTS SUMMARY${colors.reset}`);
    console.log('='.repeat(80));
    console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
    console.log('='.repeat(80));

    const total = results.passed + results.warnings + results.failed;
    const successRate = ((results.passed / total) * 100).toFixed(2);

    console.log(`\n${colors.cyan}Success Rate: ${successRate}%${colors.reset}`);

    if (results.failed === 0 && results.warnings === 0) {
        console.log(`${colors.green}🎉 ALL TESTS PASSED!${colors.reset}\n`);
    } else if (results.failed === 0) {
        console.log(`${colors.yellow}⚠️  SOME WARNINGS - Check performance${colors.reset}\n`);
    } else {
        console.log(`${colors.red}❌ SOME TESTS FAILED - Check logs above${colors.reset}\n`);
    }

    // ========================================
    // LOAD CAPACITY WARNING
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.yellow}⚠️  LOAD CAPACITY WARNING${colors.reset}`);
    console.log('='.repeat(80));
    console.log('Current system can handle:');
    console.log(`  ${colors.green}✅ Single booth operations (tested with 10,002 voters)${colors.reset}`);
    console.log(`  ${colors.yellow}⚠️  10-50 concurrent booth agents (estimated, may be slow)${colors.reset}`);
    console.log(`  ${colors.red}❌ 1,000+ concurrent users (will fail without optimizations)${colors.reset}`);
    console.log('\nCRITICAL FIXES REQUIRED:');
    console.log('  1. Add database indexes');
    console.log('  2. Implement Redis caching');
    console.log('  3. Add rate limiting');
    console.log('  4. Configure connection pooling');
    console.log('  5. Set up load balancer');
    console.log('\nSee API_HEALTH_CHECK.md for detailed recommendations');
    console.log('='.repeat(80) + '\n');
}

// Run the health checks
runHealthChecks().catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
});