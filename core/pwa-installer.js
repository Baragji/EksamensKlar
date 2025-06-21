/**
 * PWA Installation Helper
 * Handles app installation prompts and PWA-specific features
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installButton = null;
        this.init();
    }

    init() {
        this.checkInstallation();
        this.setupInstallPrompt();
        this.createInstallUI();
        this.setupInstallationTracking();
        this.handleStandaloneMode();
    }

    checkInstallation() {
        // Check if app is already installed
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;

        if (this.isInstalled) {
            console.log('🎉 ExamKlar er installeret som app!');
            this.hideInstallPrompts();
        }
    }

    setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 App installation er tilgængelig');
            
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            
            // Store the event for later use
            this.deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton();
        });

        // Listen for app installation
        window.addEventListener('appinstalled', (e) => {
            console.log('🎉 ExamKlar blev installeret!');
            this.isInstalled = true;
            this.hideInstallPrompts();
            this.trackInstallation('success');
            this.showInstallationSuccess();
        });
    }

    createInstallUI() {
        // Create install banner
        const installBanner = document.createElement('div');
        installBanner.id = 'install-banner';
        installBanner.className = 'install-banner hidden';
        installBanner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h3>Installer ExamKlar</h3>
                    <p>Få hurtig adgang fra din hjemmeskærm</p>
                </div>
                <div class="install-actions">
                    <button id="install-app-btn" class="btn btn-primary">Installer</button>
                    <button id="dismiss-install-btn" class="btn btn-secondary">Senere</button>
                </div>
            </div>
        `;

        // Add styles
        if (!document.getElementById('pwa-styles')) {
            const style = document.createElement('style');
            style.id = 'pwa-styles';
            style.textContent = `
                .install-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    padding: 1rem;
                    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }

                .install-banner.show {
                    transform: translateY(0);
                }

                .install-banner.hidden {
                    display: none;
                }

                .install-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .install-icon {
                    font-size: 2rem;
                }

                .install-text h3 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1.1rem;
                }

                .install-text p {
                    margin: 0;
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .install-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-left: auto;
                }

                .install-actions .btn {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                    min-height: auto;
                }

                .install-success {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--success-color);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 1001;
                    animation: slideInSuccess 0.5s ease, slideOutSuccess 0.5s ease 3s forwards;
                }

                @keyframes slideInSuccess {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes slideOutSuccess {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }

                @media (max-width: 768px) {
                    .install-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 0.75rem;
                    }

                    .install-actions {
                        margin-left: 0;
                    }
                }

                /* Hide install prompt when in standalone mode */
                @media (display-mode: standalone) {
                    .install-banner {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(installBanner);

        // Bind events
        document.getElementById('install-app-btn').addEventListener('click', () => {
            this.promptInstall();
        });

        document.getElementById('dismiss-install-btn').addEventListener('click', () => {
            this.dismissInstallPrompt();
        });
    }

    showInstallButton() {
        if (this.isInstalled) return;

        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('hidden');
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }
    }

    hideInstallPrompts() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.classList.add('hidden');
            }, 300);
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('❌ Installation ikke tilgængelig');
            this.showManualInstallInstructions();
            return;
        }

        try {
            // Show the installation prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`📱 Installation valg: ${outcome}`);
            this.trackInstallation(outcome);
            
            if (outcome === 'accepted') {
                console.log('✅ Bruger accepterede installation');
            } else {
                console.log('❌ Bruger afviste installation');
            }
            
            // Clear the prompt
            this.deferredPrompt = null;
            this.hideInstallPrompts();
            
        } catch (error) {
            console.error('❌ Installation fejlede:', error);
            this.trackInstallation('error');
        }
    }

    dismissInstallPrompt() {
        this.hideInstallPrompts();
        this.trackInstallation('dismissed');
        
        // Don't show again for 7 days
        localStorage.setItem('examklar-install-dismissed', Date.now() + (7 * 24 * 60 * 60 * 1000));
    }

    showManualInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <h3>📱 Installer på iOS</h3>
                <ol>
                    <li>Tryk på Del-knappen <strong>⬆️</strong> nederst</li>
                    <li>Scroll ned og vælg <strong>"Føj til hjemmeskærm"</strong></li>
                    <li>Tryk <strong>"Tilføj"</strong> for at installere</li>
                </ol>
            `;
        } else if (isAndroid) {
            instructions = `
                <h3>📱 Installer på Android</h3>
                <ol>
                    <li>Tryk på menu-knappen <strong>⋮</strong> øverst</li>
                    <li>Vælg <strong>"Installer app"</strong> eller <strong>"Føj til hjemmeskærm"</strong></li>
                    <li>Tryk <strong>"Installer"</strong> for at installere</li>
                </ol>
            `;
        } else {
            instructions = `
                <h3>💻 Installer på Desktop</h3>
                <ol>
                    <li>Klik på install-ikonet i adresselinjen</li>
                    <li>Eller gå til browser menu og vælg "Installer ExamKlar"</li>
                    <li>Følg anvisningerne for at installere</li>
                </ol>
            `;
        }

        this.showModal('Installer ExamKlar', instructions);
    }

    showInstallationSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'install-success';
        successMessage.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.5rem;">🎉</span>
                <div>
                    <div style="font-weight: bold;">ExamKlar installeret!</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Find appen på din hjemmeskærm</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 4000);
    }

    setupInstallationTracking() {
        // Track installation analytics
        const installData = {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };

        if (this.isInstalled) {
            localStorage.setItem('examklar-install-data', JSON.stringify(installData));
        }
    }

    trackInstallation(outcome) {
        const event = {
            type: 'pwa_install',
            outcome: outcome,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };

        // Store in localStorage for analytics
        const events = JSON.parse(localStorage.getItem('examklar-analytics') || '[]');
        events.push(event);
        localStorage.setItem('examklar-analytics', JSON.stringify(events));

        console.log('📊 Installation tracked:', event);
    }

    handleStandaloneMode() {
        if (this.isInstalled) {
            // Add specific styles for standalone mode
            document.body.classList.add('standalone-mode');
            
            // Add status bar padding for iOS
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                document.body.style.paddingTop = 'env(safe-area-inset-top)';
            }

            // Handle app lifecycle events
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    console.log('📱 App blev genåbnet');
                    this.handleAppResume();
                } else {
                    console.log('📱 App blev minimeret');
                    this.handleAppPause();
                }
            });
        }
    }

    handleAppResume() {
        // Refresh data when app resumes
        if (window.dashboard && typeof window.dashboard.update === 'function') {
            window.dashboard.update();
        }
    }

    handleAppPause() {
        // Save any pending data when app is paused
        if (window.storage && typeof window.storage.saveAll === 'function') {
            window.storage.saveAll();
        }
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Add modal styles
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1002;
                    animation: fadeIn 0.3s ease;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    animation: slideIn 0.3s ease;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .modal-header h2 {
                    margin: 0;
                    color: var(--primary-color);
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .modal-body ol {
                    padding-left: 1.5rem;
                }

                .modal-body li {
                    margin-bottom: 0.5rem;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Close modal events
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        });
    }

    closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Public methods
    checkIfInstallable() {
        return !!this.deferredPrompt;
    }

    getInstallationStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            platform: this.getPlatform()
        };
    }

    getPlatform() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return 'iOS';
        if (/Android/.test(navigator.userAgent)) return 'Android';
        if (/Windows/.test(navigator.userAgent)) return 'Windows';
        if (/Mac/.test(navigator.userAgent)) return 'macOS';
        return 'Unknown';
    }
}

// Initialize PWA installer
const pwaInstaller = new PWAInstaller();

// Export for global use
window.pwaInstaller = pwaInstaller;
