import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3333;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Remove unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with actual production domain
    : ['http://localhost:3333', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
});

// Serve static files from the root directory
app.use(express.static('.'));

// Serve static files from playwright-report directory
app.use('/playwright-report', express.static('playwright-report'));

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'index.html'));
});

// API endpoint to get test results and diffs
app.get('/diffs', (req, res) => {
  try {
    const reportPath = 'playwright-report/report.json';
    
    if (!existsSync(reportPath)) {
      return res.status(404).json({ 
        error: 'Ingen test rapport fundet. Kør først: npx playwright test' 
      });
    }

    const reportData = JSON.parse(readFileSync(reportPath, 'utf8'));
    
    // Extract meaningful diff information
    const diffInfo = {
      timestamp: new Date().toISOString(),
      totalTests: reportData.stats?.total || 0,
      passed: reportData.stats?.passed || 0,
      failed: reportData.stats?.failed || 0,
      suites: reportData.suites?.map(suite => ({
        title: suite.title,
        tests: suite.tests?.map(test => ({
          title: test.title,
          status: test.outcome,
          duration: test.duration,
          errors: test.errors?.map(error => error.message) || [],
          attachments: test.results?.[0]?.attachments?.map(att => ({
            name: att.name,
            path: att.path,
            contentType: att.contentType
          })) || []
        })) || []
      })) || [],
      screenshots: findScreenshots()
    };

    res.json(diffInfo);
    
  } catch (error) {
    console.error('Fejl ved læsning af test rapport:', error);
    res.status(500).json({ 
      error: 'Kunne ikke læse test rapporten', 
      details: error.message 
    });
  }
});

// Find all screenshots in test results
function findScreenshots() {
  const screenshots = [];
  try {
    const fs = require('fs');
    const path = require('path');
    
    function findFiles(dir, fileList = []) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findFiles(filePath, fileList);
        } else if (file.endsWith('.png') || file.endsWith('.jpg')) {
          fileList.push({
            path: filePath,
            name: file,
            size: stat.size,
            modified: stat.mtime
          });
        }
      });
      
      return fileList;
    }
    
    if (existsSync('test-results')) {
      screenshots.push(...findFiles('test-results'));
    }
    
    if (existsSync('playwright-report')) {
      screenshots.push(...findFiles('playwright-report'));
    }
    
  } catch (error) {
    console.error('Fejl ved søgning efter screenshots:', error);
  }
  
  return screenshots;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UI Diff Server kører',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to get specific screenshot
app.get('/screenshot/:testId/:filename', (req, res) => {
  const { testId, filename } = req.params;
  const screenshotPath = join('test-results', testId, filename);
  
  if (existsSync(screenshotPath)) {
    res.sendFile(join(process.cwd(), screenshotPath));
  } else {
    res.status(404).json({ error: 'Screenshot ikke fundet' });
  }
});

// Get latest test run summary
app.get('/summary', (req, res) => {
  try {
    const lastRunPath = 'test-results/.last-run.json';
    
    if (existsSync(lastRunPath)) {
      const lastRun = JSON.parse(readFileSync(lastRunPath, 'utf8'));
      res.json(lastRun);
    } else {
      res.json({ message: 'Ingen tidligere test kørsel fundet' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔍 UI Diff Server kører på http://localhost:${PORT}`);
  console.log(`📊 Test resultater: http://localhost:${PORT}/diffs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});