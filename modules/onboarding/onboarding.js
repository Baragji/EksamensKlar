// Advanced Onboarding System with AI Learning Path Generation
class OnboardingSystem {
    constructor() {
        this.currentStep = 0;
        this.steps = ['welcome', 'subject', 'content', 'timeline', 'generate'];
        this.userData = {
            subject: null,
            subjectEmoji: null,
            content: [],
            examDate: null,
            daysToExam: null,
            learningPlan: null
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkFirstTime();
    }

    checkFirstTime() {
        // Check if user has already completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('examklar_onboarding_completed');
        if (hasCompletedOnboarding) {
            // Redirect to main app
            window.location.href = '../../index.html';
            return;
        }
        
        // Show welcome step
        this.showStep('welcome');
    }

    setupEventListeners() {
        // Subject selection
        document.querySelectorAll('.subject-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectSubject(e));
        });

        // Custom subject input
        document.getElementById('customSubject').addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                this.enableContinueButton('continueSubject');
            } else {
                this.disableContinueButton('continueSubject');
            }
        });

        // Timeline selection
        document.querySelectorAll('.timeline-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectTimeline(e));
        });

        // Exam date input
        document.getElementById('examDate').addEventListener('change', (e) => {
            this.calculateDaysFromDate(e.target.value);
        });

        // File upload
        document.getElementById('fileUpload').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Enter key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeStep = document.querySelector('.onboarding-step.active');
                const continueBtn = activeStep.querySelector('.btn-primary:not(:disabled)');
                if (continueBtn && continueBtn.textContent.includes('Fortsæt')) {
                    e.preventDefault();
                    this.nextStep();
                }
            }
        });
    }

    showStep(stepName) {
        // Hide all steps
        document.querySelectorAll('.onboarding-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        document.getElementById(`step-${stepName}`).classList.add('active');
        
        // Update current step index
        this.currentStep = this.steps.indexOf(stepName);

        // Handle step-specific logic
        if (stepName === 'generate') {
            this.generateLearningPlan();
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            const nextStepName = this.steps[this.currentStep + 1];
            this.showStep(nextStepName);
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            const prevStepName = this.steps[this.currentStep - 1];
            this.showStep(prevStepName);
        }
    }

    selectSubject(e) {
        // Remove previous selection
        document.querySelectorAll('.subject-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Select current
        e.currentTarget.classList.add('selected');
        
        // Store selection
        this.userData.subject = e.currentTarget.dataset.subject;
        this.userData.subjectEmoji = e.currentTarget.dataset.emoji;
        
        // Enable continue button
        this.enableContinueButton('continueSubject');

        // Clear custom input
        document.getElementById('customSubject').value = '';
    }

    addCustomSubject() {
        const customInput = document.getElementById('customSubject');
        const subjectName = customInput.value.trim();
        
        if (!subjectName) {
            alert('Indtast venligst et emne navn');
            return;
        }

        // Store custom subject
        this.userData.subject = subjectName;
        this.userData.subjectEmoji = this.getEmojiForSubject(subjectName);

        // Clear previous selections
        document.querySelectorAll('.subject-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Show selected custom subject
        customInput.style.background = 'var(--primary-gradient)';
        customInput.style.color = 'white';
        customInput.readOnly = true;

        // Enable continue button
        this.enableContinueButton('continueSubject');
    }

    getEmojiForSubject(subject) {
        const subjectLower = subject.toLowerCase();
        
        // Science & Math
        if (subjectLower.includes('matematik') || subjectLower.includes('math')) return '📐';
        if (subjectLower.includes('fysik') || subjectLower.includes('physics')) return '⚡';
        if (subjectLower.includes('kemi') || subjectLower.includes('chemistry')) return '🧪';
        if (subjectLower.includes('biologi') || subjectLower.includes('biology')) return '🧬';
        
        // Languages
        if (subjectLower.includes('engelsk') || subjectLower.includes('english')) return '🇬🇧';
        if (subjectLower.includes('dansk') || subjectLower.includes('danish')) return '🇩🇰';
        if (subjectLower.includes('tysk') || subjectLower.includes('german')) return '🇩🇪';
        if (subjectLower.includes('fransk') || subjectLower.includes('french')) return '🇫🇷';
        
        // Other subjects
        if (subjectLower.includes('historie') || subjectLower.includes('history')) return '📜';
        if (subjectLower.includes('musik') || subjectLower.includes('music')) return '🎵';
        if (subjectLower.includes('kunst') || subjectLower.includes('art')) return '🎨';
        if (subjectLower.includes('programmering') || subjectLower.includes('programming')) return '💻';
        
        return '📚'; // Default
    }

    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            this.processFile(file);
        });
        
        this.updateContentPreview();
    }

    processFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = {
                name: file.name,
                type: file.type,
                size: file.size,
                content: e.target.result,
                processed: false
            };
            
            this.userData.content.push(content);
            this.updateContentPreview();
        };
        
        if (file.type.startsWith('text/')) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    }

    processText() {
        const textContent = document.getElementById('textContent').value.trim();
        if (!textContent) return;

        const content = {
            name: 'Indsat tekst',
            type: 'text/plain',
            size: textContent.length,
            content: textContent,
            processed: false
        };

        this.userData.content.push(content);
        this.updateContentPreview();
        document.getElementById('textContent').value = '';
    }

    importFromWeb() {
        const url = document.getElementById('webUrl').value.trim();
        if (!url) return;

        // Simulate web import (in real implementation, you'd use a service)
        const content = {
            name: `Web import: ${url}`,
            type: 'text/html',
            size: 0,
            content: url,
            processed: false
        };

        this.userData.content.push(content);
        this.updateContentPreview();
        document.getElementById('webUrl').value = '';
    }

    updateContentPreview() {
        const preview = document.getElementById('contentPreview');
        const previewList = document.getElementById('previewList');
        
        if (this.userData.content.length > 0) {
            preview.style.display = 'block';
            previewList.innerHTML = this.userData.content.map(item => `
                <div class="content-item">
                    <span class="content-icon">${this.getFileIcon(item.type)}</span>
                    <span class="content-name">${item.name}</span>
                    <span class="content-size">${this.formatFileSize(item.size)}</span>
                    <button onclick="onboarding.removeContent('${item.name}')" class="remove-btn">✕</button>
                </div>
            `).join('');
            
            // FIXED: Auto-scroll to show uploaded content + success feedback
            preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Show success toast
            this.showToast(`✅ ${this.userData.content[this.userData.content.length - 1].name} tilføjet`, 'success');
        } else {
            preview.style.display = 'none';
        }
    }
    
    // Add toast notification method
    showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('onboarding-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'onboarding-toast';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        
        // Set toast styling based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            info: '#3b82f6'
        };
        toast.style.backgroundColor = colors[type] || colors.info;
        toast.textContent = message;
        
        // Show and auto-hide toast
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    getFileIcon(type) {
        if (type.startsWith('text/')) return '📄';
        if (type.startsWith('image/')) return '🖼️';
        if (type.includes('pdf')) return '📕';
        if (type.includes('word')) return '📘';
        return '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    removeContent(name) {
        this.userData.content = this.userData.content.filter(item => item.name !== name);
        this.updateContentPreview();
    }

    selectTimeline(e) {
        // Remove previous selection
        document.querySelectorAll('.timeline-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Select current
        e.currentTarget.classList.add('selected');
        
        // Store selection
        this.userData.daysToExam = parseInt(e.currentTarget.dataset.days);
        
        // Calculate exam date
        const examDate = new Date();
        examDate.setDate(examDate.getDate() + this.userData.daysToExam);
        this.userData.examDate = examDate.toISOString().split('T')[0];
        
        // Update preview
        this.updateTimelinePreview();
        
        // Enable continue button
        this.enableContinueButton('continueTimeline');

        // Clear custom date
        document.getElementById('examDate').value = '';
    }

    calculateDays() {
        const examDate = document.getElementById('examDate').value;
        if (!examDate) return;

        this.calculateDaysFromDate(examDate);
    }

    calculateDaysFromDate(dateString) {
        const examDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);

        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            document.getElementById('daysCalculated').innerHTML = 
                '<span style="color: var(--error-color)">⚠️ Datoen skal være i fremtiden</span>';
            this.disableContinueButton('continueTimeline');
            return;
        }

        this.userData.daysToExam = diffDays;
        this.userData.examDate = dateString;

        document.getElementById('daysCalculated').innerHTML = 
            `<span style="color: var(--success-color)">📅 ${diffDays} dage til eksamen</span>`;

        // Clear timeline options
        document.querySelectorAll('.timeline-option').forEach(option => {
            option.classList.remove('selected');
        });

        this.updateTimelinePreview();
        this.enableContinueButton('continueTimeline');
    }

    updateTimelinePreview() {
        const preview = document.getElementById('timelinePreview');
        const totalDays = this.userData.daysToExam;
        
        // Calculate optimal study plan
        const dailyTime = totalDays > 30 ? 20 : totalDays > 14 ? 30 : totalDays > 7 ? 45 : 60;
        const weeklyGoal = Math.min(7, Math.max(3, Math.floor(totalDays / 2)));

        document.getElementById('totalDays').textContent = totalDays;
        document.getElementById('dailyTime').textContent = dailyTime;
        document.getElementById('weeklyGoal').textContent = weeklyGoal;

        preview.style.display = 'block';
    }

    async generateLearningPlan() {
        // Show generation with proper UX feedback
        document.getElementById('generationStatus').style.display = 'block';
        document.getElementById('generationResult').style.display = 'none';

        const steps = document.querySelectorAll('.thinking-step');
        
        // Animate through steps with proper timing for UX
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Mark current step as active
            step.classList.add('active');
            step.classList.remove('completed');
            
            // Give user time to see AI "thinking"
            await this.delay(800);
            
            // Mark as completed and move to next
            step.classList.remove('active');
            step.classList.add('completed');
            
            // Short pause before next step
            await this.delay(300);
        }

        // Generate learning plan
        this.userData.learningPlan = this.createLearningPlan();

        // Final pause for completion effect
        await this.delay(500);

        // Show result with animation
        document.getElementById('generationStatus').style.display = 'none';
        document.getElementById('generationResult').style.display = 'block';
        
        // Populate plan summary
        this.showPlanSummary();
    }

    createLearningPlan() {
        const { subject, daysToExam, content } = this.userData;
        
        // Calculate plan parameters
        const dailyTime = daysToExam > 30 ? 20 : daysToExam > 14 ? 30 : daysToExam > 7 ? 45 : 60;
        const weeklyGoal = Math.min(7, Math.max(3, Math.floor(daysToExam / 2)));
        const totalSessions = Math.floor(daysToExam * (weeklyGoal / 7));
        
        // Generate content modules
        const modules = this.generateContentModules();
        
        return {
            subject,
            daysToExam,
            dailyTime,
            weeklyGoal,
            totalSessions,
            modules,
            created: new Date().toISOString()
        };
    }

    generateContentModules() {
        const { subject, daysToExam } = this.userData;
        
        // Base modules for any subject
        const baseModules = [
            { name: 'Grundlæggende koncepter', sessions: Math.ceil(daysToExam * 0.3) },
            { name: 'Fordybelse og praksis', sessions: Math.ceil(daysToExam * 0.4) },
            { name: 'Repetition og test', sessions: Math.ceil(daysToExam * 0.3) }
        ];

        // Subject-specific modules
        const subjectModules = this.getSubjectSpecificModules(subject);
        
        return [...baseModules, ...subjectModules];
    }

    getSubjectSpecificModules(subject) {
        const subjectLower = subject.toLowerCase();
        
        if (subjectLower.includes('matematik')) {
            return [
                { name: 'Algebra og ligninger', sessions: 3 },
                { name: 'Geometri og trigonometri', sessions: 3 },
                { name: 'Funktioner og grafer', sessions: 2 }
            ];
        }
        
        if (subjectLower.includes('kemi')) {
            return [
                { name: 'Atomteori og bindinger', sessions: 2 },
                { name: 'Kemiske reaktioner', sessions: 3 },
                { name: 'Organisk kemi', sessions: 2 }
            ];
        }
        
        // Default modules for other subjects
        return [
            { name: 'Teori og definitioner', sessions: 2 },
            { name: 'Praktiske øvelser', sessions: 2 }
        ];
    }

    showPlanSummary() {
        const plan = this.userData.learningPlan;
        const summary = document.getElementById('planSummary');
        
        summary.innerHTML = `
            <div class="plan-overview">
                <div class="plan-stat">
                    <span class="stat-number">${plan.daysToExam}</span>
                    <span class="stat-label">Dage til eksamen</span>
                </div>
                <div class="plan-stat">
                    <span class="stat-number">${plan.dailyTime}</span>
                    <span class="stat-label">Min/dag</span>
                </div>
                <div class="plan-stat">
                    <span class="stat-number">${plan.totalSessions}</span>
                    <span class="stat-label">Samlede sessioner</span>
                </div>
            </div>
            
            <div class="modules-preview">
                <h3>📚 Dine læringsmoduler:</h3>
                <div class="modules-list">
                    ${plan.modules.map(module => `
                        <div class="module-preview">
                            <span class="module-name">${module.name}</span>
                            <span class="module-sessions">${module.sessions} sessioner</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async startLearning() {
        try {
            // Show loading state
            const button = document.querySelector('button[onclick="startLearning()"]');
            if (button) {
                button.innerHTML = '<span class="loading-luxury"></span> Gemmer...';
                button.disabled = true;
            }

            // Save onboarding data FIRST
            await this.saveOnboardingData();
            console.log('✅ Onboarding data saved');
            
            // DEBUG: Check if data was actually saved
            const savedData = localStorage.getItem('examklar_onboarding_data');
            console.log('🔍 DEBUG: Saved onboarding data:', savedData ? JSON.parse(savedData) : 'NO DATA');
            
            if (button) {
                button.innerHTML = '<span class="loading-luxury"></span> Genererer læringsplan...';
            }
            await this.delay(800); // Give user feedback
            
            // CRITICAL FIX: Ensure DataBridge initialization completes BEFORE redirect
            let initSuccess = false;
            if (window.DataBridge) {
                console.log('🔄 Initializing training data...');
                console.log('🔍 DEBUG: DataBridge available:', !!window.DataBridge);
                
                // Check if onboarding data exists before trying to initialize
                const onboardingCheck = window.DataBridge.getOnboardingData();
                console.log('🔍 DEBUG: Onboarding data check:', onboardingCheck);
                
                initSuccess = window.DataBridge.initializeFromOnboarding();
                console.log('🔍 DEBUG: Initialization result:', initSuccess);
                
                if (initSuccess) {
                    console.log('✅ Training data initialized successfully');
                    if (button) {
                        button.innerHTML = '<span class="loading-luxury"></span> Forbereder dashboard...';
                    }
                    await this.delay(500);
                } else {
                    console.error('❌ Failed to initialize training data');
                    throw new Error('DataBridge initialization failed');
                }
            } else {
                console.error('❌ DataBridge not available');
                throw new Error('DataBridge not available');
            }
            
            // Mark onboarding as completed
            localStorage.setItem('examklar_onboarding_completed', 'true');
            
            // Success feedback before redirect
            if (button) {
                button.innerHTML = '✅ Færdig! Starter din læringsrejse...';
            }
            await this.delay(1000);
            
            // ONLY redirect after data is ready
            console.log('🚀 Redirecting to main app with initialized data');
            window.location.href = '../../index.html';
            
        } catch (error) {
            console.error('❌ Critical error in startLearning:', error);
            
            // Show detailed error to user in development
            const button = document.querySelector('button[onclick="startLearning()"]');
            if (button) {
                button.innerHTML = '❌ Fejl opstået - prøver igen...';
                button.disabled = false;
            }
            
            // Log full error details for debugging
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                userData: this.userData,
                hasDataBridge: !!window.DataBridge,
                onboardingData: localStorage.getItem('examklar_onboarding_data')
            });
            
            // Don't redirect on error - let user try again
        }
    }

    async viewDashboard() {
        try {
            // Save onboarding data (wait for completion)
            await this.saveOnboardingData();
            
            // DEBUG: Check if data was actually saved
            const savedData = localStorage.getItem('examklar_onboarding_data');
            console.log('🔍 DEBUG: Saved onboarding data for dashboard:', savedData ? JSON.parse(savedData) : 'NO DATA');
            
            // Add a small delay to ensure localStorage write completes
            await this.delay(100);
            
            // CRITICAL FIX: Ensure DataBridge initialization before redirect
            let initSuccess = false;
            if (window.DataBridge) {
                console.log('🔄 Initializing training data for dashboard...');
                console.log('🔍 DEBUG: DataBridge available for dashboard:', !!window.DataBridge);
                
                // Check if onboarding data exists before trying to initialize
                const onboardingCheck = window.DataBridge.getOnboardingData();
                console.log('🔍 DEBUG: Onboarding data check for dashboard:', onboardingCheck);
                
                initSuccess = window.DataBridge.initializeFromOnboarding();
                console.log('🔍 DEBUG: Dashboard initialization result:', initSuccess);
                
                if (initSuccess) {
                    console.log('✅ Training data initialized for dashboard');
                } else {
                    console.error('❌ Failed to initialize training data for dashboard');
                    throw new Error('DataBridge initialization failed for dashboard');
                }
            } else {
                console.error('❌ DataBridge not available for dashboard');
                throw new Error('DataBridge not available for dashboard');
            }
            
            // Mark onboarding as completed
            localStorage.setItem('examklar_onboarding_completed', 'true');
            
            // Redirect to dashboard only after data is ready
            console.log('🚀 Redirecting to dashboard with initialized data');
            window.location.href = '../dashboard/index.html';
        } catch (error) {
            console.error('❌ Critical error in viewDashboard:', error);
            
            // Log full error details for debugging
            console.error('Full dashboard error details:', {
                message: error.message,
                stack: error.stack,
                userData: this.userData,
                hasDataBridge: !!window.DataBridge,
                onboardingData: localStorage.getItem('examklar_onboarding_data')
            });
            
            alert('Der opstod en fejl. Prøv igen eller kontakt support.\n\nFejl: ' + error.message);
        }
    }

    async saveOnboardingData() {
        console.log('🔍 DEBUG: Starting saveOnboardingData with userData:', this.userData);
        
        // Create subject
        const subjectManager = {
            subjects: JSON.parse(localStorage.getItem('examklar_subjects') || '[]')
        };

        const newSubject = {
            id: 'subject_' + Date.now(),
            name: this.userData.subject,
            description: `Eksamen om ${this.userData.daysToExam} dage`,
            color: 'blue',
            emoji: this.userData.subjectEmoji,
            createdAt: new Date().toISOString(),
            examDate: this.userData.examDate,
            learningPlan: this.userData.learningPlan,
            contentCount: this.userData.content.length,
            flashcardCount: 0,
            quizCount: 0
        };

        subjectManager.subjects.push(newSubject);
        localStorage.setItem('examklar_subjects', JSON.stringify(subjectManager.subjects));
        localStorage.setItem('examklar_current_subject', newSubject.id);

        // Generate sample flashcards and quizzes based on subject
        await this.generateSampleContent(newSubject.id);

        // Save content if any
        if (this.userData.content.length > 0) {
            this.userData.content.forEach((content, index) => {
                localStorage.setItem(
                    `examklar_content_${newSubject.id}_${index}`,
                    JSON.stringify(content)
                );
            });
        }

        // Save onboarding completion data - ensure all critical fields are present
        const onboardingDataToSave = {
            subject: this.userData.subject || 'Ukendt Emne',
            subjectEmoji: this.userData.subjectEmoji || '📚',
            examDate: this.userData.examDate || null,
            daysToExam: this.userData.daysToExam || 14,
            content: this.userData.content || [],
            learningPlan: this.userData.learningPlan || null,
            completed: true,
            savedAt: new Date().toISOString()
        };
        
        console.log('🔍 DEBUG: Saving onboarding data:', onboardingDataToSave);
        localStorage.setItem('examklar_onboarding_data', JSON.stringify(onboardingDataToSave));
        
        // Verify it was saved
        const verification = localStorage.getItem('examklar_onboarding_data');
        console.log('🔍 DEBUG: Verification - saved data:', verification ? JSON.parse(verification) : 'FAILED TO SAVE');
        
        console.log('✅ Onboarding data saved successfully');
    }

    async generateSampleContent(subjectId) {
        // Generate sample flashcards
        const sampleCards = this.generateSampleFlashcards();
        localStorage.setItem(`examklar_flashcards_${subjectId}`, JSON.stringify(sampleCards));
        
        // Generate sample quizzes
        const sampleQuizzes = this.generateSampleQuizzes();
        localStorage.setItem(`examklar_quizzes_${subjectId}`, JSON.stringify(sampleQuizzes));
        
        console.log('✅ Sample content generated');
    }

    generateSampleFlashcards() {
        const subject = this.userData.subject.toLowerCase();
        
        if (subject.includes('matematik')) {
            return [
                {
                    id: 'card_1',
                    front: 'Hvad er Pythagoras sætning?',
                    back: 'a² + b² = c² hvor c er hypotenusen i en retvinklet trekant',
                    category: 'geometri',
                    difficulty: 2,
                    created: new Date().toISOString()
                },
                {
                    id: 'card_2',
                    front: 'Hvordan løser man en andengradsligning?',
                    back: 'Brug formlen: x = (-b ± √(b²-4ac)) / 2a',
                    category: 'algebra',
                    difficulty: 3,
                    created: new Date().toISOString()
                }
            ];
        }
        
        if (subject.includes('kemi')) {
            return [
                {
                    id: 'card_1',
                    front: 'Hvad er pH skalaen?',
                    back: 'En skala fra 0-14 der måler surhed. 7 er neutral, under 7 er surt, over 7 er basisk',
                    category: 'syre-base',
                    difficulty: 2,
                    created: new Date().toISOString()
                },
                {
                    id: 'card_2',
                    front: 'Hvad sker der ved en kemisk reaktion?',
                    back: 'Atomer omarrangeres til nye molekyler, men intet atom går tabt (massens bevarelse)',
                    category: 'reaktioner',
                    difficulty: 1,
                    created: new Date().toISOString()
                }
            ];
        }
        
        // Default cards for any subject
        return [
            {
                id: 'card_1',
                front: `Hvilke grundlæggende koncepter er vigtige i ${this.userData.subject}?`,
                back: 'Dette er en placeholder - tilføj dit eget indhold gennem flashcard modulet',
                category: 'grundlag',
                difficulty: 1,
                created: new Date().toISOString()
            },
            {
                id: 'card_2',
                front: `Hvordan forbereder jeg mig bedst til ${this.userData.subject} eksamen?`,
                back: 'Læs regelmæssigt, lav flashcards, tag quizzer og stil spørgsmål til AI assistenten',
                category: 'metode',
                difficulty: 1,
                created: new Date().toISOString()
            }
        ];
    }

    generateSampleQuizzes() {
        const subject = this.userData.subject.toLowerCase();
        
        if (subject.includes('matematik')) {
            return [
                {
                    id: 'quiz_1',
                    title: 'Grundlæggende Matematik',
                    questions: [
                        {
                            id: 'q1',
                            question: 'Hvad er 2 + 2?',
                            options: ['3', '4', '5', '6'],
                            correct: 1,
                            explanation: '2 + 2 = 4. Dette er grundlæggende addition.'
                        },
                        {
                            id: 'q2',
                            question: 'Hvad er roden af 16?',
                            options: ['2', '4', '6', '8'],
                            correct: 1,
                            explanation: '√16 = 4, fordi 4 × 4 = 16'
                        }
                    ],
                    created: new Date().toISOString()
                }
            ];
        }
        
        // Default quiz for any subject
        return [
            {
                id: 'quiz_1',
                title: `${this.userData.subject} - Intro Quiz`,
                questions: [
                    {
                        id: 'q1',
                        question: `Hvor godt kender du ${this.userData.subject}?`,
                        options: ['Ikke så godt', 'Lidt', 'Ret godt', 'Meget godt'],
                        correct: 2,
                        explanation: 'Dette er en selvvurdering - vælg det niveau der passer dig bedst.'
                    }
                ],
                created: new Date().toISOString()
            }
        ];
    }

    enableContinueButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
        }
    }

    disableContinueButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for template buttons
function nextStep() {
    window.onboarding.nextStep();
}

function prevStep() {
    window.onboarding.prevStep();
}

function addCustomSubject() {
    window.onboarding.addCustomSubject();
}

function processText() {
    window.onboarding.processText();
}

function importFromWeb() {
    window.onboarding.importFromWeb();
}

function calculateDays() {
    window.onboarding.calculateDays();
}

async function startLearning() {
    await window.onboarding.startLearning();
}

async function viewDashboard() {
    await window.onboarding.viewDashboard();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.onboarding = new OnboardingSystem();
});
