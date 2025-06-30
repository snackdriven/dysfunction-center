import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  phase: string;
  testName: string;
  status: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL' | 'CRITICAL_FAIL' | 'SKIP';
  issues: string[];
  recommendations: string[];
  duration: number;
  timestamp: string;
  details?: any;
}

export interface PhaseReport {
  phaseName: string;
  totalTests: number;
  passed: number;
  conditionalPassed: number;
  failed: number;
  criticalFailed: number;
  skipped: number;
  overallStatus: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL' | 'CRITICAL_FAIL';
  results: TestResult[];
  duration: number;
  timestamp: string;
}

export interface ComprehensiveReport {
  executionId: string;
  timestamp: string;
  totalDuration: number;
  environment: {
    url: string;
    userAgent: string;
    viewport: { width: number; height: number };
  };
  summary: {
    totalPhases: number;
    totalTests: number;
    totalPassed: number;
    totalConditionalPassed: number;
    totalFailed: number;
    totalCriticalFailed: number;
    totalSkipped: number;
    overallStatus: PhaseReport['overallStatus'];
    successRate: number;
  };
  phases: PhaseReport[];
  recommendations: {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  };
}

export class TestReporter {
  private executionId: string;
  private startTime: number;
  private reportDir: string;

  constructor() {
    this.executionId = `test-run-${Date.now()}`;
    this.startTime = Date.now();
    this.reportDir = path.join(process.cwd(), 'test-reports');
    
    // Ensure report directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  generateComprehensiveReport(phases: PhaseReport[], environment: any): ComprehensiveReport {
    const totalDuration = Date.now() - this.startTime;
    
    // Calculate summary statistics
    const summary = {
      totalPhases: phases.length,
      totalTests: 0,
      totalPassed: 0,
      totalConditionalPassed: 0,
      totalFailed: 0,
      totalCriticalFailed: 0,
      totalSkipped: 0,
      overallStatus: 'PASS' as PhaseReport['overallStatus'],
      successRate: 0
    };

    phases.forEach(phase => {
      summary.totalTests += phase.totalTests;
      summary.totalPassed += phase.passed;
      summary.totalConditionalPassed += phase.conditionalPassed;
      summary.totalFailed += phase.failed;
      summary.totalCriticalFailed += phase.criticalFailed;
      summary.totalSkipped += phase.skipped;
    });

    // Calculate overall status
    if (summary.totalCriticalFailed > 0) {
      summary.overallStatus = 'CRITICAL_FAIL';
    } else if (summary.totalFailed > 0) {
      summary.overallStatus = 'FAIL';
    } else if (summary.totalConditionalPassed > 0) {
      summary.overallStatus = 'CONDITIONAL_PASS';
    } else {
      summary.overallStatus = 'PASS';
    }

    // Calculate success rate
    const successfulTests = summary.totalPassed + summary.totalConditionalPassed;
    summary.successRate = summary.totalTests > 0 ? 
      Math.round((successfulTests / summary.totalTests) * 100) : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(phases);

    const report: ComprehensiveReport = {
      executionId: this.executionId,
      timestamp: new Date().toISOString(),
      totalDuration,
      environment,
      summary,
      phases,
      recommendations
    };

    return report;
  }

  private generateRecommendations(phases: PhaseReport[]): ComprehensiveReport['recommendations'] {
    const recommendations = {
      critical: [] as string[],
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[]
    };

    phases.forEach(phase => {
      phase.results.forEach(result => {
        result.recommendations.forEach(rec => {
          switch (result.status) {
            case 'CRITICAL_FAIL':
              if (!recommendations.critical.includes(rec)) {
                recommendations.critical.push(rec);
              }
              break;
            case 'FAIL':
              if (!recommendations.high.includes(rec)) {
                recommendations.high.push(rec);
              }
              break;
            case 'CONDITIONAL_PASS':
              if (!recommendations.medium.includes(rec)) {
                recommendations.medium.push(rec);
              }
              break;
            default:
              if (!recommendations.low.includes(rec)) {
                recommendations.low.push(rec);
              }
              break;
          }
        });
      });
    });

    return recommendations;
  }

  saveReport(report: ComprehensiveReport, format: 'json' | 'html' | 'markdown' = 'json'): string {
    const fileName = `${this.executionId}.${format}`;
    const filePath = path.join(this.reportDir, fileName);

    switch (format) {
      case 'json':
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
        break;
      case 'html':
        fs.writeFileSync(filePath, this.generateHTMLReport(report));
        break;
      case 'markdown':
        fs.writeFileSync(filePath, this.generateMarkdownReport(report));
        break;
    }

    return filePath;
  }

  private generateHTMLReport(report: ComprehensiveReport): string {
    const statusColors = {
      'PASS': '#22c55e',
      'CONDITIONAL_PASS': '#f59e0b',
      'FAIL': '#ef4444',
      'CRITICAL_FAIL': '#dc2626'
    };

    const statusIcons = {
      'PASS': '✅',
      'CONDITIONAL_PASS': '⚠️',
      'FAIL': '❌',
      'CRITICAL_FAIL': '🚨'
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Frontend Testing Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 2rem; }
        .header p { margin: 0; opacity: 0.9; }
        .content { padding: 2rem; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .summary-card { background: #f8fafc; border-radius: 6px; padding: 1rem; border-left: 4px solid #e2e8f0; }
        .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
        .phase { margin-bottom: 2rem; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
        .phase-header { background: #f8fafc; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
        .phase-content { padding: 1rem; }
        .test-result { margin-bottom: 1rem; padding: 1rem; border-radius: 6px; border-left: 4px solid #e2e8f0; }
        .recommendations { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 1rem; margin-top: 2rem; }
        .recommendations h3 { margin-top: 0; color: #92400e; }
        .rec-list { list-style: none; padding: 0; }
        .rec-item { margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Comprehensive Frontend Testing Report</h1>
            <p>Executive Dysfunction Center - Testing Protocol Execution</p>
            <p>Generated: ${report.timestamp}</p>
            <p>Execution ID: ${report.executionId}</p>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Overall Status</h3>
                    <div class="status-badge" style="background-color: ${statusColors[report.summary.overallStatus]}; color: white;">
                        ${statusIcons[report.summary.overallStatus]} ${report.summary.overallStatus}
                    </div>
                </div>
                <div class="summary-card">
                    <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Success Rate</h3>
                    <div style="font-size: 1.5rem; font-weight: bold; color: ${report.summary.successRate >= 80 ? '#22c55e' : report.summary.successRate >= 60 ? '#f59e0b' : '#ef4444'};">
                        ${report.summary.successRate}%
                    </div>
                </div>
                <div class="summary-card">
                    <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Total Tests</h3>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #374151;">${report.summary.totalTests}</div>
                </div>
                <div class="summary-card">
                    <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Duration</h3>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #374151;">${Math.round(report.totalDuration / 1000)}s</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>✅ Passed</td><td>${report.summary.totalPassed}</td><td>${Math.round((report.summary.totalPassed / report.summary.totalTests) * 100)}%</td></tr>
                    <tr><td>⚠️ Conditional Pass</td><td>${report.summary.totalConditionalPassed}</td><td>${Math.round((report.summary.totalConditionalPassed / report.summary.totalTests) * 100)}%</td></tr>
                    <tr><td>❌ Failed</td><td>${report.summary.totalFailed}</td><td>${Math.round((report.summary.totalFailed / report.summary.totalTests) * 100)}%</td></tr>
                    <tr><td>🚨 Critical Failed</td><td>${report.summary.totalCriticalFailed}</td><td>${Math.round((report.summary.totalCriticalFailed / report.summary.totalTests) * 100)}%</td></tr>
                    <tr><td>⏭️ Skipped</td><td>${report.summary.totalSkipped}</td><td>${Math.round((report.summary.totalSkipped / report.summary.totalTests) * 100)}%</td></tr>
                </tbody>
            </table>

            ${report.phases.map(phase => `
                <div class="phase">
                    <div class="phase-header">
                        <h2 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: ${statusColors[phase.overallStatus]};">${statusIcons[phase.overallStatus]}</span>
                            ${phase.phaseName}
                        </h2>
                        <p style="margin: 0.5rem 0 0 0; color: #6b7280;">
                            ${phase.totalTests} tests • ${Math.round(phase.duration / 1000)}s
                        </p>
                    </div>
                    <div class="phase-content">
                        ${phase.results.map(result => `
                            <div class="test-result" style="border-left-color: ${statusColors[result.status]};">
                                <h4 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                    ${statusIcons[result.status]} ${result.testName}
                                    <span style="font-size: 0.75rem; background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">${result.duration}ms</span>
                                </h4>
                                ${result.issues.length > 0 ? `
                                    <div style="margin-bottom: 0.5rem;">
                                        <strong>Issues:</strong>
                                        <ul style="margin: 0.25rem 0 0 1rem;">
                                            ${result.issues.map(issue => `<li>${issue}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${result.recommendations.length > 0 ? `
                                    <div>
                                        <strong>Recommendations:</strong>
                                        <ul style="margin: 0.25rem 0 0 1rem;">
                                            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}

            ${Object.entries(report.recommendations).some(([, recs]) => recs.length > 0) ? `
                <div class="recommendations">
                    <h3>📚 Recommendations Summary</h3>
                    ${Object.entries(report.recommendations).map(([priority, recs]) => 
                        recs.length > 0 ? `
                            <div style="margin-bottom: 1rem;">
                                <h4 style="margin: 0 0 0.5rem 0; text-transform: capitalize;">${priority} Priority</h4>
                                <ul class="rec-list">
                                    ${recs.map(rec => `<li class="rec-item">${rec}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''
                    ).join('')}
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
  }

  private generateMarkdownReport(report: ComprehensiveReport): string {
    const statusEmojis = {
      'PASS': '✅',
      'CONDITIONAL_PASS': '⚠️',
      'FAIL': '❌',
      'CRITICAL_FAIL': '🚨'
    };

    return `# 🧪 Comprehensive Frontend Testing Report

**Executive Dysfunction Center - Testing Protocol Execution**

- **Generated:** ${report.timestamp}
- **Execution ID:** ${report.executionId}
- **Duration:** ${Math.round(report.totalDuration / 1000)}s

## 📊 Summary

| Metric | Value |
|--------|-------|
| Overall Status | ${statusEmojis[report.summary.overallStatus]} **${report.summary.overallStatus}** |
| Success Rate | **${report.summary.successRate}%** |
| Total Tests | ${report.summary.totalTests} |
| Total Phases | ${report.summary.totalPhases} |

### Test Results Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Passed | ${report.summary.totalPassed} | ${Math.round((report.summary.totalPassed / report.summary.totalTests) * 100)}% |
| ⚠️ Conditional Pass | ${report.summary.totalConditionalPassed} | ${Math.round((report.summary.totalConditionalPassed / report.summary.totalTests) * 100)}% |
| ❌ Failed | ${report.summary.totalFailed} | ${Math.round((report.summary.totalFailed / report.summary.totalTests) * 100)}% |
| 🚨 Critical Failed | ${report.summary.totalCriticalFailed} | ${Math.round((report.summary.totalCriticalFailed / report.summary.totalTests) * 100)}% |
| ⏭️ Skipped | ${report.summary.totalSkipped} | ${Math.round((report.summary.totalSkipped / report.summary.totalTests) * 100)}% |

## 📋 Phase Results

${report.phases.map(phase => `
### ${statusEmojis[phase.overallStatus]} ${phase.phaseName}

**Duration:** ${Math.round(phase.duration / 1000)}s | **Tests:** ${phase.totalTests}

${phase.results.map(result => `
#### ${statusEmojis[result.status]} ${result.testName} (${result.duration}ms)

${result.issues.length > 0 ? `
**Issues:**
${result.issues.map(issue => `- ${issue}`).join('\n')}
` : ''}

${result.recommendations.length > 0 ? `
**Recommendations:**
${result.recommendations.map(rec => `- ${rec}`).join('\n')}
` : ''}
`).join('\n')}
`).join('\n')}

## 📚 Recommendations Summary

${Object.entries(report.recommendations).map(([priority, recs]) => 
  recs.length > 0 ? `
### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority

${recs.map(rec => `- ${rec}`).join('\n')}
` : ''
).join('\n')}

---

*Generated by Executive Dysfunction Center Comprehensive Testing Protocol*
`;
  }

  printConsoleReport(report: ComprehensiveReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TESTING PROTOCOL RESULTS');
    console.log('='.repeat(80));
    console.log(`Execution ID: ${report.executionId}`);
    console.log(`Total Duration: ${Math.round(report.totalDuration / 1000)}s`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    
    const statusIcon = this.getStatusIcon(report.summary.overallStatus);
    console.log(`Overall Status: ${statusIcon} ${report.summary.overallStatus}`);
    
    console.log('\n📋 PHASE SUMMARY:');
    console.log('-'.repeat(80));

    report.phases.forEach(phase => {
      const phaseIcon = this.getStatusIcon(phase.overallStatus);
      console.log(`${phaseIcon} ${phase.phaseName}`);
      console.log(`   Tests: ${phase.totalTests} | Pass: ${phase.passed} | Conditional: ${phase.conditionalPassed} | Fail: ${phase.failed} | Critical: ${phase.criticalFailed} | Skip: ${phase.skipped}`);
    });

    console.log('\n📊 DETAILED RESULTS:');
    console.log('-'.repeat(80));
    console.log(`✅ Passed: ${report.summary.totalPassed} (${Math.round((report.summary.totalPassed/report.summary.totalTests)*100)}%)`);
    console.log(`⚠️  Conditional Pass: ${report.summary.totalConditionalPassed} (${Math.round((report.summary.totalConditionalPassed/report.summary.totalTests)*100)}%)`);
    console.log(`❌ Failed: ${report.summary.totalFailed} (${Math.round((report.summary.totalFailed/report.summary.totalTests)*100)}%)`);
    console.log(`🚨 Critical Failed: ${report.summary.totalCriticalFailed} (${Math.round((report.summary.totalCriticalFailed/report.summary.totalTests)*100)}%)`);
    console.log(`⏭️  Skipped: ${report.summary.totalSkipped} (${Math.round((report.summary.totalSkipped/report.summary.totalTests)*100)}%)`);

    if (report.recommendations.critical.length > 0) {
      console.log('\n🚨 CRITICAL RECOMMENDATIONS:');
      report.recommendations.critical.forEach(rec => console.log(`   - ${rec}`));
    }

    if (report.recommendations.high.length > 0) {
      console.log('\n⚠️  HIGH PRIORITY RECOMMENDATIONS:');
      report.recommendations.high.forEach(rec => console.log(`   - ${rec}`));
    }

    console.log('\n📁 Report files saved to:', this.reportDir);
    console.log('='.repeat(80));
  }

  private getStatusIcon(status: PhaseReport['overallStatus']): string {
    switch (status) {
      case 'PASS': return '✅';
      case 'CONDITIONAL_PASS': return '⚠️';
      case 'FAIL': return '❌';
      case 'CRITICAL_FAIL': return '🚨';
      default: return '❓';
    }
  }
} 