import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global teardown for Comprehensive Frontend Testing Protocol
 * Generates final reports and cleanup
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Comprehensive Frontend Testing Protocol Complete');
  console.log('=' .repeat(60));
  
  try {
    // Read execution metadata
    const metadataPath = path.join(process.cwd(), 'test-results', 'execution-metadata.json');
    let metadata: any = {};
    
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    }
    
    // Generate summary of test artifacts
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const playwrightReportDir = path.join(process.cwd(), 'playwright-report');
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    
    const artifacts = {
      screenshots: 0,
      videos: 0,
      traces: 0,
      reports: 0
    };
    
    // Count artifacts
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      artifacts.screenshots = files.filter(f => f.endsWith('.png')).length;
      artifacts.videos = files.filter(f => f.endsWith('.webm')).length;
      artifacts.traces = files.filter(f => f.endsWith('.zip')).length;
      artifacts.reports = files.filter(f => f.endsWith('.json') || f.endsWith('.xml')).length;
    }
    
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      artifacts.screenshots += files.filter(f => f.endsWith('.png')).length;
    }
    
    // Generate final summary
    const finalSummary = {
      ...metadata,
      completedAt: new Date().toISOString(),
      artifacts,
      locations: {
        testResults: testResultsDir,
        playwrightReport: playwrightReportDir,
        screenshots: screenshotsDir,
        reports: path.join(process.cwd(), 'test-reports')
      }
    };
    
    // Save final summary
    fs.writeFileSync(
      path.join(process.cwd(), 'test-results', 'final-summary.json'),
      JSON.stringify(finalSummary, null, 2)
    );
    
    // Print summary to console
    console.log('📊 Test Execution Summary:');
    console.log(`   Duration: ${metadata.executionId ? 'See execution metadata' : 'Unknown'}`);
    console.log(`   Screenshots: ${artifacts.screenshots}`);
    console.log(`   Videos: ${artifacts.videos}`);
    console.log(`   Traces: ${artifacts.traces}`);
    console.log(`   Reports: ${artifacts.reports}`);
    
    console.log('\n📁 Generated Artifacts:');
    console.log(`   Test Results: ${testResultsDir}`);
    console.log(`   HTML Report: ${playwrightReportDir}/index.html`);
    console.log(`   Screenshots: ${screenshotsDir}`);
    
    // Check if HTML report exists and provide access instructions
    const htmlReportIndex = path.join(playwrightReportDir, 'index.html');
    if (fs.existsSync(htmlReportIndex)) {
      console.log('\n🌐 View HTML Report:');
      console.log(`   npx playwright show-report`);
      console.log(`   or open: ${htmlReportIndex}`);
    }
    
    // Provide next steps
    console.log('\n📚 Next Steps:');
    console.log('   1. Review the HTML report for detailed test results');
    console.log('   2. Check screenshots for visual validation');
    console.log('   3. Address any failing tests based on recommendations');
    console.log('   4. Re-run specific test phases if needed:');
    console.log('      npx playwright test phase1-navigation-layout.spec.ts');
    console.log('      npx playwright test phase2-dashboard-components.spec.ts');
    console.log('      npx playwright test comprehensive-test-runner.spec.ts');
    
    console.log('\n✨ Thank you for using the Comprehensive Frontend Testing Protocol!');
    
  } catch (error) {
    console.error('⚠️ Error during teardown:', error);
  }
  
  console.log('=' .repeat(60));
}

export default globalTeardown; 