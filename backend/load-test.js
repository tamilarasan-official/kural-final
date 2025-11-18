/**
 * Load Testing Script for Kural API
 * Tests system capacity for 1 Lakh+ concurrent users
 * 
 * Requirements:
 * npm install autocannon --save-dev
 * 
 * Usage:
 * node load-test.js [scenario]
 * 
 * Scenarios:
 * - warmup: Light load to warm up the system
 * - normal: Normal production load
 * - stress: High load stress test
 * - spike: Sudden spike test
 * - endurance: Long-running endurance test
 * - full: Complete 1 Lakh users simulation
 */

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const RESULTS_DIR = path.join(__dirname, 'load-test-results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test scenarios
const scenarios = {
    warmup: {
        name: 'Warmup Test',
        duration: 30,
        connections: 100,
        pipelining: 10,
        workers: 2
    },
    normal: {
        name: 'Normal Load Test',
        duration: 60,
        connections: 1000,
        pipelining: 10,
        workers: 4
    },
    stress: {
        name: 'Stress Test',
        duration: 120,
        connections: 5000,
        pipelining: 10,
        workers: 8
    },
    spike: {
        name: 'Spike Test',
        duration: 60,
        connections: 10000,
        pipelining: 10,
        workers: 12
    },
    endurance: {
        name: 'Endurance Test',
        duration: 600, // 10 minutes
        connections: 2000,
        pipelining: 10,
        workers: 6
    },
    full: {
        name: 'Full Load Test (1 Lakh Users)',
        duration: 300, // 5 minutes
        connections: 100000,
        pipelining: 10,
        workers: 12
    }
};

// Test endpoints
const endpoints = [{
        name: 'Health Check',
        path: '/health',
        method: 'GET'
    },
    {
        name: 'Login',
        path: '/api/v1/booths/login',
        method: 'POST',
        body: JSON.stringify({
            phone: '9876543210',
            password: 'test123'
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    },
    {
        name: 'Get Voters by Booth',
        path: '/api/v1/voter/booth/119/1',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer TOKEN_HERE'
        }
    },
    {
        name: 'Search Voters',
        path: '/api/v1/voter/search',
        method: 'POST',
        body: JSON.stringify({
            mobileNo: '98765',
            page: 1,
            limit: 50
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    },
    {
        name: 'Get Surveys',
        path: '/api/v1/surveys?page=1&limit=10',
        method: 'GET'
    }
];

// Run a single test
async function runTest(scenario, endpoint) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 Running: ${scenario.name} - ${endpoint.name}`);
    console.log(`${'='.repeat(80)}\n`);

    const config = {
        url: `${BASE_URL}${endpoint.path}`,
        method: endpoint.method,
        duration: scenario.duration,
        connections: scenario.connections,
        pipelining: scenario.pipelining,
        workers: scenario.workers,
        title: `${scenario.name} - ${endpoint.name}`,
        headers: endpoint.headers || {},
        body: endpoint.body || undefined
    };

    const instance = autocannon(config);

    // Progress tracking
    autocannon.track(instance, {
        renderProgressBar: true,
        renderResultsTable: true
    });

    return new Promise((resolve, reject) => {
        instance.on('done', (result) => {
            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${scenario.name.replace(/\s+/g, '_')}_${endpoint.name.replace(/\s+/g, '_')}_${timestamp}.json`;
            const filepath = path.join(RESULTS_DIR, filename);

            fs.writeFileSync(filepath, JSON.stringify(result, null, 2));

            // Display summary
            console.log(`\n${'='.repeat(80)}`);
            console.log(`📊 Test Results: ${scenario.name} - ${endpoint.name}`);
            console.log(`${'='.repeat(80)}`);
            console.log(`Total Requests:        ${result.requests.total}`);
            console.log(`Requests/sec:          ${result.requests.average}`);
            console.log(`Throughput:            ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/sec`);
            console.log(`Latency (avg):         ${result.latency.mean.toFixed(2)} ms`);
            console.log(`Latency (p50):         ${result.latency.p50.toFixed(2)} ms`);
            console.log(`Latency (p95):         ${result.latency.p95.toFixed(2)} ms`);
            console.log(`Latency (p99):         ${result.latency.p99.toFixed(2)} ms`);
            console.log(`Errors:                ${result.errors}`);
            console.log(`Timeouts:              ${result.timeouts}`);
            console.log(`Success Rate:          ${((result.requests.total - result.errors - result.timeouts) / result.requests.total * 100).toFixed(2)}%`);
            console.log(`Results saved to:      ${filepath}`);
            console.log(`${'='.repeat(80)}\n`);

            resolve(result);
        });

        instance.on('error', (error) => {
            console.error('❌ Test Error:', error);
            reject(error);
        });
    });
}

// Run all tests for a scenario
async function runScenario(scenarioName) {
    const scenario = scenarios[scenarioName];

    if (!scenario) {
        console.error(`❌ Unknown scenario: ${scenarioName}`);
        console.log('Available scenarios:', Object.keys(scenarios).join(', '));
        process.exit(1);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 Starting Load Test Scenario: ${scenario.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Duration:     ${scenario.duration}s`);
    console.log(`Connections:  ${scenario.connections}`);
    console.log(`Pipelining:   ${scenario.pipelining}`);
    console.log(`Workers:      ${scenario.workers}`);
    console.log(`Base URL:     ${BASE_URL}`);
    console.log(`${'='.repeat(80)}\n`);

    const results = [];

    // Run tests for each endpoint
    for (const endpoint of endpoints) {
        try {
            const result = await runTest(scenario, endpoint);
            results.push({
                endpoint: endpoint.name,
                result
            });

            // Wait between tests
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error(`❌ Error testing ${endpoint.name}:`, error.message);
        }
    }

    // Generate summary report
    generateSummaryReport(scenario, results);
}

// Generate summary report
function generateSummaryReport(scenario, results) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📈 SUMMARY REPORT: ${scenario.name}`);
    console.log(`${'='.repeat(80)}\n`);

    const summary = {
        scenario: scenario.name,
        timestamp: new Date().toISOString(),
        totalRequests: 0,
        totalErrors: 0,
        totalTimeouts: 0,
        avgRequestsPerSec: 0,
        avgLatency: 0,
        endpoints: []
    };

    results.forEach(({ endpoint, result }) => {
        summary.totalRequests += result.requests.total;
        summary.totalErrors += result.errors;
        summary.totalTimeouts += result.timeouts;
        summary.avgRequestsPerSec += result.requests.average;
        summary.avgLatency += result.latency.mean;

        summary.endpoints.push({
            name: endpoint,
            requests: result.requests.total,
            requestsPerSec: result.requests.average,
            latency: result.latency.mean,
            errors: result.errors,
            successRate: ((result.requests.total - result.errors - result.timeouts) / result.requests.total * 100).toFixed(2)
        });
    });

    summary.avgRequestsPerSec = (summary.avgRequestsPerSec / results.length).toFixed(2);
    summary.avgLatency = (summary.avgLatency / results.length).toFixed(2);
    summary.overallSuccessRate = ((summary.totalRequests - summary.totalErrors - summary.totalTimeouts) / summary.totalRequests * 100).toFixed(2);

    console.table(summary.endpoints);

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 OVERALL METRICS`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Total Requests:        ${summary.totalRequests.toLocaleString()}`);
    console.log(`Avg Requests/sec:      ${summary.avgRequestsPerSec}`);
    console.log(`Avg Latency:           ${summary.avgLatency} ms`);
    console.log(`Total Errors:          ${summary.totalErrors}`);
    console.log(`Total Timeouts:        ${summary.totalTimeouts}`);
    console.log(`Overall Success Rate:  ${summary.overallSuccessRate}%`);
    console.log(`${'='.repeat(80)}\n`);

    // Save summary
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryFile = path.join(RESULTS_DIR, `SUMMARY_${scenario.name.replace(/\s+/g, '_')}_${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log(`✅ Summary saved to: ${summaryFile}\n`);

    // Performance assessment
    assessPerformance(summary);
}

// Assess performance and provide recommendations
function assessPerformance(summary) {
    console.log(`${'='.repeat(80)}`);
    console.log(`💡 PERFORMANCE ASSESSMENT`);
    console.log(`${'='.repeat(80)}\n`);

    const issues = [];
    const recommendations = [];

    // Check success rate
    if (parseFloat(summary.overallSuccessRate) < 99) {
        issues.push(`Low success rate: ${summary.overallSuccessRate}%`);
        recommendations.push('- Increase server capacity or optimize error handling');
    }

    // Check latency
    if (parseFloat(summary.avgLatency) > 500) {
        issues.push(`High average latency: ${summary.avgLatency}ms`);
        recommendations.push('- Optimize database queries');
        recommendations.push('- Add Redis caching');
        recommendations.push('- Enable compression');
    }

    // Check errors
    if (summary.totalErrors > summary.totalRequests * 0.01) {
        issues.push(`High error rate: ${(summary.totalErrors / summary.totalRequests * 100).toFixed(2)}%`);
        recommendations.push('- Review application logs');
        recommendations.push('- Check database connection pool');
        recommendations.push('- Verify error handling logic');
    }

    if (issues.length > 0) {
        console.log('⚠️  Issues Found:');
        issues.forEach(issue => console.log(`   ${issue}`));
        console.log('\n📋 Recommendations:');
        recommendations.forEach(rec => console.log(`   ${rec}`));
    } else {
        console.log('✅ System performance is excellent!');
        console.log('   All metrics are within acceptable ranges.');
    }

    console.log(`\n${'='.repeat(80)}\n`);
}

// Main execution
const scenarioArg = process.argv[2] || 'warmup';

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🚀 KURAL API LOAD TESTING TOOL 🚀                         ║
║                                                                               ║
║                  Testing capacity for 1 Lakh+ users                          ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

runScenario(scenarioArg)
    .then(() => {
        console.log('✅ Load testing completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Load testing failed:', error);
        process.exit(1);
    });