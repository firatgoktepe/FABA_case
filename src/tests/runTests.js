#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Starting Weather App Test Suite...\n')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${color}${text}${colors.reset}`
}

function runCommand(command, description) {
  console.log(colorize(`\n📋 ${description}`, colors.cyan))
  console.log(colorize(`Running: ${command}`, colors.yellow))
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log(colorize(`✅ ${description} completed successfully`, colors.green))
    return true
  } catch (error) {
    console.error(colorize(`❌ ${description} failed`, colors.red))
    console.error(error.message)
    return false
  }
}

function checkCoverageThreshold(coverageDir) {
  const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json')
  
  if (!fs.existsSync(coverageSummaryPath)) {
    console.log(colorize('⚠️  Coverage summary not found', colors.yellow))
    return false
  }

  try {
    const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'))
    const total = coverageSummary.total
    
    console.log(colorize('\n📊 Coverage Summary:', colors.cyan))
    console.log(`Lines: ${total.lines.pct}%`)
    console.log(`Functions: ${total.functions.pct}%`)
    console.log(`Branches: ${total.branches.pct}%`)
    console.log(`Statements: ${total.statements.pct}%`)
    
    const threshold = 90
    const coverageTypes = ['lines', 'functions', 'branches', 'statements']
    let allAboveThreshold = true
    
    coverageTypes.forEach(type => {
      if (total[type].pct < threshold) {
        console.log(colorize(`❌ ${type} coverage (${total[type].pct}%) is below threshold (${threshold}%)`, colors.red))
        allAboveThreshold = false
      } else {
        console.log(colorize(`✅ ${type} coverage (${total[type].pct}%) meets threshold (${threshold}%)`, colors.green))
      }
    })
    
    return allAboveThreshold
  } catch (error) {
    console.error(colorize('❌ Error reading coverage summary:', colors.red), error.message)
    return false
  }
}

function main() {
  const startTime = Date.now()
  let success = true
  
  // Test categories to run
  const testCategories = [
    {
      name: 'Unit Tests - Custom Hooks',
      command: 'npm test -- --testPathPattern=hooks --coverage=false --verbose',
      required: true
    },
    {
      name: 'Unit Tests - Components',
      command: 'npm test -- --testPathPattern=components --coverage=false --verbose',
      required: true
    },
    {
      name: 'Unit Tests - Services',
      command: 'npm test -- --testPathPattern=services --coverage=false --verbose',
      required: true
    },
    {
      name: 'Integration Tests',
      command: 'npm test -- --testPathPattern=integration --coverage=false --verbose',
      required: true
    },
    {
      name: 'Full Test Suite with Coverage',
      command: 'npm run test:coverage',
      required: true
    }
  ]
  
  // Run each test category
  for (const category of testCategories) {
    const result = runCommand(category.command, category.name)
    
    if (!result && category.required) {
      success = false
      console.log(colorize(`\n💥 Required test category "${category.name}" failed. Stopping execution.`, colors.red))
      break
    }
  }
  
  if (success) {
    // Check coverage thresholds
    const coverageDir = path.join(process.cwd(), 'coverage')
    const coverageMet = checkCoverageThreshold(coverageDir)
    
    if (!coverageMet) {
      success = false
      console.log(colorize('\n❌ Coverage thresholds not met', colors.red))
    }
  }
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  console.log(colorize('\n' + '='.repeat(60), colors.blue))
  
  if (success) {
    console.log(colorize('🎉 All tests passed successfully!', colors.green))
    console.log(colorize('✅ Coverage thresholds met', colors.green))
    console.log(colorize(`⏱️  Total time: ${duration}s`, colors.cyan))
    
    console.log(colorize('\n📂 Coverage reports generated:', colors.cyan))
    console.log('   - HTML: coverage/lcov-report/index.html')
    console.log('   - LCOV: coverage/lcov.info')
    console.log('   - Text: Check console output above')
    
    process.exit(0)
  } else {
    console.log(colorize('💥 Test suite failed!', colors.red))
    console.log(colorize(`⏱️  Time elapsed: ${duration}s`, colors.cyan))
    
    console.log(colorize('\n🔧 Possible fixes:', colors.yellow))
    console.log('   - Check test failures above')
    console.log('   - Ensure all dependencies are installed: npm install')
    console.log('   - Check if API mocks are properly configured')
    console.log('   - Review coverage reports for missing tests')
    
    process.exit(1)
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log(colorize('\n\n🛑 Test execution interrupted', colors.yellow))
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(colorize('\n💥 Uncaught exception:', colors.red), error.message)
  process.exit(1)
})

main() 