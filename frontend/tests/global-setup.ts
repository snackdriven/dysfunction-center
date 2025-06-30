import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for Comprehensive Frontend Testing Protocol
 * Prepares environment and validates prerequisites
 */
async function globalSetup(config: FullConfig) {
  console.log('🧪 Initializing Comprehensive Frontend Testing Protocol...');
  
  // Ensure test directories exist
  const testDirs = [
    'test-results',
    'test-reports', 
    'playwright-report',
    'screenshots'
  ];
  
  for (const dir of testDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
  
  // Clean up old test artifacts
  const artifactDirs = ['test-results', 'screenshots'];
  for (const dir of artifactDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.json') || file.endsWith('.xml')) {
          fs.unlinkSync(path.join(dirPath, file));
        }
      }
      console.log(`🧹 Cleaned up old artifacts in: ${dir}`);
    }
  }
  
  // Validate that the application is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Validating application accessibility...');
    
    // Try to reach the application
    const response = await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    if (!response || !response.ok()) {
      throw new Error(`Application not accessible. Status: ${response?.status()}`);
    }
    
    // Basic smoke test
    const title = await page.title();
    console.log(`✅ Application accessible. Title: "${title}"`);
    
    // Check for basic page structure
    const bodyContent = await page.locator('body').textContent();
    if (!bodyContent || bodyContent.trim().length === 0) {
      console.warn('⚠️  Warning: Page appears to have no content');
    }
    
    // Capture initial application state
    await page.screenshot({ 
      path: 'test-results/initial-app-state.png',
      fullPage: true 
    });
    
    console.log('📸 Captured initial application state');
    
  } catch (error) {
    console.error('❌ Application validation failed:', error);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
  
  // Create test execution metadata
  const metadata = {
    executionId: `test-run-${Date.now()}`,
    timestamp: new Date().toISOString(),
    environment: {
      baseURL: config.projects[0].use?.baseURL || 'http://localhost:3000',
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    config: {
      timeout: config.timeout,
      retries: config.retries,
      workers: config.workers,
      reporter: config.reporter
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'test-results', 'execution-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('📋 Test execution metadata saved');
  console.log('🚀 Comprehensive testing protocol ready to execute');
  console.log('=' .repeat(60));
}

export default globalSetup; 