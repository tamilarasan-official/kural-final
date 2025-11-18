const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testBoothSurveyStats() {
    try {
        console.log('\n=== TESTING BOOTH SURVEY STATS API ===\n');

        const aci_id = '111';
        const booth_id = 'BOOTH001';

        console.log(`Testing with aci_id=${aci_id}, booth_id=${booth_id}\n`);

        const response = await axios.get(`${BASE_URL}/surveys/booth-stats`, {
            params: {
                aci_id: aci_id,
                booth_id: booth_id
            }
        });

        console.log('✅ API Response:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            const { activeSurveys, totalResponses, surveys } = response.data.data;

            console.log('\n📊 SUMMARY:');
            console.log(`  Active Surveys: ${activeSurveys}`);
            console.log(`  Total Responses: ${totalResponses}`);
            console.log('\n📋 SURVEY BREAKDOWN:');

            surveys.forEach((survey, index) => {
                console.log(`  ${index + 1}. ${survey.surveyTitle}`);
                console.log(`     Survey ID: ${survey.surveyId}`);
                console.log(`     Form ID: ${survey.formId}`);
                console.log(`     Responses: ${survey.responseCount}`);
                console.log('');
            });

            console.log('✅ EXPECTED BEHAVIOR:');
            console.log('  - Survey 1 ("test"): Should show 2 responses');
            console.log('  - Survey 2 ("jello-123456"): Should show 1 response');
            console.log('  - Total: 3 responses across 2 active surveys');
            console.log('  - Dashboard & Reports should now show "3 surveys completed"');
        }

    } catch (error) {
        console.error('❌ Error testing booth survey stats:', error.response ? .data || error.message);
    }
}

testBoothSurveyStats();