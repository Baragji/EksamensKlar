/**
 * Enterprise Security Manager
 * Implementerer security best practices, data encryption og access control
 */

class SecurityManager {
    constructor() {
        this.encryptionKey = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutter
        this.maxLoginAttempts = 5;
        this.loginAttempts = new Map();
        this.nonce = this.generateNonce();
        this.securityHeaders = {
            'Content-Security-Policy': `default-src 'self'; script-src 'self' 'nonce-${this.nonce}'; style-src 'self' 'nonce-${this.nonce}' 'unsafe-hashes' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;`,
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
        
        this.init();
    }

    async init() {
        await this.generateEncryptionKey();
        this.setupCSP();
        this.injectNonceToScripts();
        this.setupSessionManagement();
        this.setupInputSanitization();
        this.monitorSecurityEvents();
        
        console.log('🔒 Security Manager initialized with enterprise-level protection');
    }

    generateNonce() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '');
    }

    injectNonceToScripts() {
        // Replace nonce placeholders in HTML
        this.replaceNoncePlaceholders();
        
        // Add nonce to all inline scripts
        const scripts = document.querySelectorAll('script:not([src])');
        scripts.forEach(script => {
            if (!script.getAttribute('nonce')) {
                script.setAttribute('nonce', this.nonce);
            }
        });

        // Add nonce to all inline styles
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
            if (!style.getAttribute('nonce')) {
                style.setAttribute('nonce', this.nonce);
            }
        });

        // Make nonce available globally for dynamic script creation
        window.CSP_NONCE = this.nonce;
    }

    replaceNoncePlaceholders() {
        // Replace {{CSP_NONCE}} placeholders in script and style tags
        const elementsWithPlaceholder = document.querySelectorAll('[nonce*="{{CSP_NONCE}}"]');
        elementsWithPlaceholder.forEach(element => {
            const currentNonce = element.getAttribute('nonce');
            if (currentNonce && currentNonce.includes('{{CSP_NONCE}}')) {
                element.setAttribute('nonce', currentNonce.replace('{{CSP_NONCE}}', this.nonce));
            }
        });
    }

    getNonce() {
        return this.nonce;
    }

    // CSP Violation Reporting
    setupCSPReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            console.warn('CSP Violation:', {
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy,
                sourceFile: e.sourceFile,
                lineNumber: e.lineNumber
            });
            
            // Log to audit system
            this.logSecurityEvent('csp_violation', {
                type: e.violatedDirective,
                blocked: e.blockedURI,
                source: e.sourceFile
            });
        });
    }

    // Encryption & Decryption
    async generateEncryptionKey() {
        try {
            if (window.crypto && window.crypto.subtle) {
                this.encryptionKey = await window.crypto.subtle.generateKey(
                    {
                        name: 'AES-GCM',
                        length: 256
                    },
                    true,
                    ['encrypt', 'decrypt']
                );
            } else {
                // Fallback for older browsers
                this.encryptionKey = this.generateFallbackKey();
            }
        } catch (error) {
            console.warn('Encryption key generation failed, using fallback:', error);
            this.encryptionKey = this.generateFallbackKey();
        }
    }

    generateFallbackKey() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return array;
    }

    async encryptData(data) {
        try {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }

            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            if (this.encryptionKey.constructor === Uint8Array) {
                // Fallback encryption
                return this.fallbackEncrypt(dataBuffer, iv);
            }

            const encrypted = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                dataBuffer
            );

            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encrypted), iv.length);

            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    async decryptData(encryptedData) {
        try {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }

            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            const iv = data.slice(0, 12);
            const encrypted = data.slice(12);

            if (this.encryptionKey.constructor === Uint8Array) {
                // Fallback decryption
                return this.fallbackDecrypt(encrypted, iv);
            }

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                encrypted
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (error) {
            console.error('Decryption failed:', error);
            throw error;
        }
    }

    fallbackEncrypt(data, iv) {
        // Simple XOR encryption for fallback
        const key = this.encryptionKey;
        const encrypted = new Uint8Array(data.length);
        
        for (let i = 0; i < data.length; i++) {
            encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
        }
        
        const result = new Uint8Array(iv.length + encrypted.length);
        result.set(iv);
        result.set(encrypted, iv.length);
        
        return btoa(String.fromCharCode(...result));
    }

    fallbackDecrypt(encrypted, iv) {
        // Simple XOR decryption for fallback
        const key = this.encryptionKey;
        const decrypted = new Uint8Array(encrypted.length);
        
        for (let i = 0; i < encrypted.length; i++) {
            decrypted[i] = encrypted[i] ^ key[i % key.length] ^ iv[i % iv.length];
        }
        
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    }

    // Content Security Policy
    setupCSP() {
        // CSP should be delivered via HTTP headers, not meta tags
        // Meta tag CSP causes warnings for frame-ancestors directive
        // Commenting out to prevent browser warnings
        
        // const meta = document.createElement('meta');
        // meta.httpEquiv = 'Content-Security-Policy';
        // meta.content = this.securityHeaders['Content-Security-Policy'];
        // document.head.appendChild(meta);
        
        // Setup CSP violation reporting
        this.setupCSPReporting();
    }

    // Session Management
    setupSessionManagement() {
        this.sessionId = this.generateSessionId();
        this.lastActivity = Date.now();
        
        // Monitor user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });

        // Check session timeout
        setInterval(() => {
            this.checkSessionTimeout();
        }, 60000); // Check every minute
    }

    generateSessionId() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    checkSessionTimeout() {
        const now = Date.now();
        if (now - this.lastActivity > this.sessionTimeout) {
            this.handleSessionTimeout();
        }
    }

    handleSessionTimeout() {
        console.warn('🔒 Session timeout detected');
        
        // Clear sensitive data
        this.clearSensitiveData();
        
        // Notify user
        if (window.EventBus) {
            window.EventBus.emit('security:sessionTimeout', {
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        }
        
        // Redirect to login or show modal
        this.showSessionTimeoutModal();
    }

    clearSensitiveData() {
        // Clear localStorage sensitive data
        const sensitiveKeys = ['userToken', 'authData', 'personalData'];
        sensitiveKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }

    showSessionTimeoutModal() {
        const modal = document.createElement('div');
        modal.className = 'security-modal';
        modal.innerHTML = `
            <div class="security-modal-content">
                <h3>🔒 Session Udløbet</h3>
                <p>Din session er udløbet af sikkerhedsmæssige årsager.</p>
                <button onclick="location.reload()" class="btn-primary">Genindlæs Side</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Input Sanitization
    setupInputSanitization() {
        // Monitor all form inputs
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.sanitizeInput(event.target);
            }
        });
    }

    sanitizeInput(element) {
        const value = element.value;
        
        // Check for potential XSS
        if (this.detectXSS(value)) {
            console.warn('🔒 Potential XSS detected in input:', element.name || element.id);
            element.value = this.cleanXSS(value);
            
            // Log security event
            this.logSecurityEvent('xss_attempt', {
                element: element.name || element.id,
                originalValue: value,
                cleanedValue: element.value
            });
        }
        
        // Check for SQL injection patterns
        if (this.detectSQLInjection(value)) {
            console.warn('🔒 Potential SQL injection detected in input:', element.name || element.id);
            
            this.logSecurityEvent('sql_injection_attempt', {
                element: element.name || element.id,
                value: value
            });
        }
    }

    detectXSS(input) {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<img[^>]*onerror[^>]*>/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    }

    cleanXSS(input) {
        return input
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    detectSQLInjection(input) {
        const sqlPatterns = [
            /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
            /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
            /(script|javascript|vbscript|onload|onerror|onclick)/i
        ];
        
        return sqlPatterns.some(pattern => pattern.test(input));
    }

    // Rate Limiting
    checkRateLimit(action, limit = 10, timeWindow = 60000) {
        const now = Date.now();
        const key = `${action}_${this.sessionId}`;
        
        if (!this.rateLimits) {
            this.rateLimits = new Map();
        }
        
        const attempts = this.rateLimits.get(key) || [];
        const recentAttempts = attempts.filter(time => now - time < timeWindow);
        
        if (recentAttempts.length >= limit) {
            this.logSecurityEvent('rate_limit_exceeded', {
                action: action,
                attempts: recentAttempts.length,
                limit: limit
            });
            return false;
        }
        
        recentAttempts.push(now);
        this.rateLimits.set(key, recentAttempts);
        return true;
    }

    // Security Event Monitoring
    monitorSecurityEvents() {
        // Monitor console access attempts
        const originalConsole = window.console;
        window.console = new Proxy(originalConsole, {
            get: (target, prop) => {
                if (prop === 'log' || prop === 'warn' || prop === 'error') {
                    this.logSecurityEvent('console_access', { method: prop });
                }
                return target[prop];
            }
        });

        // Monitor DevTools
        let devtools = { open: false, orientation: null };
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.logSecurityEvent('devtools_opened', {
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent
                    });
                }
            } else {
                devtools.open = false;
            }
        }, 1000);
    }

    logSecurityEvent(type, data) {
        const event = {
            type: type,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            url: window.location.href,
            data: data
        };
        
        // Send to audit logger
        if (window.AuditLogger) {
            window.AuditLogger.log('security', event);
        }
        
        // Emit event for real-time monitoring
        if (window.EventBus) {
            window.EventBus.emit('security:event', event);
        }
    }

    // Data Validation
    validateData(data, schema) {
        try {
            // Basic schema validation
            for (const [key, rules] of Object.entries(schema)) {
                const value = data[key];
                
                if (rules.required && (value === undefined || value === null)) {
                    throw new Error(`Required field missing: ${key}`);
                }
                
                if (value !== undefined && rules.type && typeof value !== rules.type) {
                    throw new Error(`Invalid type for ${key}: expected ${rules.type}, got ${typeof value}`);
                }
                
                if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                    throw new Error(`Field ${key} exceeds maximum length of ${rules.maxLength}`);
                }
                
                if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                    throw new Error(`Field ${key} does not match required pattern`);
                }
            }
            
            return true;
        } catch (error) {
            this.logSecurityEvent('data_validation_failed', {
                error: error.message,
                data: data,
                schema: schema
            });
            throw error;
        }
    }

    // Secure Storage
    async secureStore(key, data) {
        try {
            const encrypted = await this.encryptData(data);
            localStorage.setItem(`secure_${key}`, encrypted);
            
            this.logSecurityEvent('secure_store', {
                key: key,
                dataType: typeof data
            });
        } catch (error) {
            console.error('Secure storage failed:', error);
            throw error;
        }
    }

    async secureRetrieve(key) {
        try {
            const encrypted = localStorage.getItem(`secure_${key}`);
            if (!encrypted) {
                return null;
            }
            
            const data = await this.decryptData(encrypted);
            
            this.logSecurityEvent('secure_retrieve', {
                key: key,
                success: true
            });
            
            return data;
        } catch (error) {
            this.logSecurityEvent('secure_retrieve', {
                key: key,
                success: false,
                error: error.message
            });
            console.error('Secure retrieval failed:', error);
            return null;
        }
    }

    // Security Headers Validation
    validateSecurityHeaders() {
        const requiredHeaders = [
            'Content-Security-Policy',
            'X-Frame-Options',
            'X-Content-Type-Options'
        ];
        
        const missingHeaders = requiredHeaders.filter(header => {
            const meta = document.querySelector(`meta[http-equiv="${header}"]`);
            return !meta;
        });
        
        if (missingHeaders.length > 0) {
            this.logSecurityEvent('missing_security_headers', {
                missingHeaders: missingHeaders
            });
        }
        
        return missingHeaders.length === 0;
    }

    // Get Security Status
    getSecurityStatus() {
        return {
            sessionId: this.sessionId,
            lastActivity: this.lastActivity,
            encryptionEnabled: !!this.encryptionKey,
            cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            sessionTimeoutEnabled: true,
            inputSanitizationEnabled: true,
            rateLimitingEnabled: true
        };
    }
}

// Initialize Security Manager
if (typeof window !== 'undefined') {
    window.SecurityManager = new SecurityManager();
}

// Export removed to fix syntax error - SecurityManager is available globally
// export default SecurityManager;