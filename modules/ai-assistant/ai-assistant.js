/**
 * AI Assistant Module - ExamKlar
 * Provides intelligent tutoring and assistance for protein purification learning
 */

class AIAssistant {
    constructor() {
        this.provider = localStorage.getItem('ai-provider') || 'hybrid';
        this.responseStyle = localStorage.getItem('ai-response-style') || 'detailed';
        this.usageLimit = parseInt(localStorage.getItem('ai-usage-limit')) || 100;
        this.privacyMode = localStorage.getItem('ai-privacy-mode') === 'true';
        this.apiKey = localStorage.getItem('openai-api-key');
        this.model = localStorage.getItem('ai-model') || 'gpt-3.5-turbo';
        
        this.conversations = JSON.parse(localStorage.getItem('ai-conversations')) || [];
        this.usage = JSON.parse(localStorage.getItem('ai-usage')) || { count: 0, month: new Date().getMonth() };
        
        this.initializeBackupResponses();
        this.updateStatus();
        this.loadRecentConversations();
    }
    
    initializeBackupResponses() {
        this.backupResponses = {
            // Basic protein questions
            "hvad er proteiner": {
                response: "Proteiner er store, komplekse biomolekyler der består af aminosyrer forbundet i polypeptidkæder. De har fire strukturniveauer: primær (aminosyresekvens), sekundær (α-helixer og β-sheets), tertiær (3D-folding) og kvaternær (flere subunits). Proteiner udfører mange vigtige funktioner som enzymer, strukturelle komponenter, transportmolekyler og regulatoriske faktorer.",
                followUp: ["Vil du vide mere om proteinstrukturer?", "Skal vi tale om proteinfunktioner?"]
            },
            
            "hvordan renser jeg proteiner": {
                response: "Proteinrensning følger typisk disse trin:\n\n1. **Cellelyse** - Frigør proteiner fra celler\n2. **Grov fraktionering** - Ammoniumsulfat fældning eller dialyse\n3. **Kromatografi**:\n   - Ion exchange (ladningsbaseret)\n   - Size exclusion (størrelsebaseret) \n   - Affinity (specifik binding)\n4. **Polering** - Finale rensning og koncentrering\n5. **Kvalitetskontrol** - SDS-PAGE, Western blot\n\nStrategien afhænger af dit target protein og ønskede renhed.",
                followUp: ["Hvilken type kromatografi skal du starte med?", "Har du problemer med et specifikt trin?"]
            },
            
            "ion exchange": {
                response: "Ion exchange chromatography separerer proteiner baseret på deres ladning:\n\n**Cation exchange** (negativ matrix):\n- Binder positive proteiner\n- pH skal være under proteinets pI\n- Eksempel: CM-Sepharose\n\n**Anion exchange** (positiv matrix):\n- Binder negative proteiner  \n- pH skal være over proteinets pI\n- Eksempel: DEAE-Sepharose\n\n**Tips**: Start med ion exchange da det kan håndtere store mængder og giver god initial separation.",
                followUp: ["Hvordan beregner jeg det rigtige pH?", "Hvilken salt gradient skal jeg bruge?"]
            },
            
            "troubleshooting": {
                response: "Almindelige proteinrensning problemer og løsninger:\n\n**Lav yield:**\n- Tjek protease inhibitorer\n- Optimer lyse conditions\n- Kontroller protein stabilitet\n\n**Protein aggregation:**\n- Sænk temperatur til 4°C\n- Juster pH væk fra pI\n- Tilføj salt eller detergent\n\n**Dårlig separation:**\n- Optimer buffer pH og salt\n- Prøv anden kromatografi type\n- Kontroller column packing\n\nHvad er dit specifikke problem?",
                followUp: ["Beskriv dit problem mere detaljeret", "Hvilken teknik bruger du?"]
            },
            
            "ph og pi": {
                response: "pH og pI (isoelektrisk punkt) er afgørende for proteinrensning:\n\n**pI** = pH hvor proteinet har netto ladning 0\n- pH < pI → protein positivt ladet\n- pH > pI → protein negativt ladet\n\n**Ion exchange strategi:**\n- Cation exchange: vælg pH < pI\n- Anion exchange: vælg pH > pI\n\n**Buffer valg:**\n- God buffering capacity ved arbejds-pH\n- Kompatibel med protein stabilitet\n- Eksempler: Tris (pH 7-9), Phosphat (pH 6-8), Acetate (pH 4-6)",
                followUp: ["Hvordan finder jeg mit proteins pI?", "Hvilke buffere anbefaler du?"]
            },
            
            "default": {
                response: "Det er et godt spørgsmål om protein purification! Jeg kan hjælpe med:\n\n• **Basale koncepter** - proteinstruktur, funktioner\n• **Rensnings strategier** - kromatografi, fraktionering\n• **Troubleshooting** - almindelige problemer og løsninger\n• **Praktisk hjælp** - buffer valg, pH beregninger\n• **Teknik forklaring** - SDS-PAGE, Western blot\n\nKan du være mere specifik om hvad du vil vide?",
                followUp: ["Spørg om en specifik teknik", "Beskriv dit eksperimentelle problem"]
            }
        };
    }
    
    // Main AI query method
    async query(message, context = {}) {
        try {
            // Check usage limits
            if (!this.checkUsageLimit()) {
                return this.createResponse("Du har nået din månedlige usage limit. Prøv igen næste måned eller juster dine indstillinger.", 'limit');
            }
            
            // Increment usage
            this.incrementUsage();
            
            // Route to appropriate AI provider
            switch (this.provider) {
                case 'openai':
                    return await this.queryOpenAI(message, context);
                case 'local':
                    return await this.queryLocalAI(message, context);
                case 'hybrid':
                    return await this.queryHybrid(message, context);
                case 'disabled':
                    return this.getBackupResponse(message);
                default:
                    return this.getBackupResponse(message);
            }
        } catch (error) {
            console.error('AI query error:', error);
            return this.getBackupResponse(message);
        }
    }
    
    // OpenAI integration
    async queryOpenAI(message, context) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        
        const systemPrompt = this.getSystemPrompt();
        const conversationHistory = this.getRecentHistory(5);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500,
                presence_penalty: 0.6
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        return this.createResponse(aiResponse, 'openai');
    }
    
    // Local AI (WebLLM or similar)
    async queryLocalAI(message, context) {
        // For now, return enhanced backup response
        // In a real implementation, this would use WebLLM or transformers.js
        const backup = this.getBackupResponse(message);
        
        // Enhance with local processing
        backup.response = `[Local AI] ${backup.response}`;
        backup.source = 'local';
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return backup;
    }
    
    // Hybrid approach
    async queryHybrid(message, context) {
        try {
            // Try OpenAI first if available
            if (this.apiKey && navigator.onLine) {
                return await this.queryOpenAI(message, context);
            }
        } catch (error) {
            console.log('OpenAI unavailable, falling back to local');
        }
        
        // Fall back to local/backup
        return this.queryLocalAI(message, context);
    }
    
    // Backup response system
    getBackupResponse(message) {
        const query = message.toLowerCase();
        
        // Find best matching response
        for (const [key, responseData] of Object.entries(this.backupResponses)) {
            if (key !== 'default' && query.includes(key)) {
                return this.createResponse(responseData.response, 'backup', responseData.followUp);
            }
        }
        
        // Default response
        const defaultData = this.backupResponses.default;
        return this.createResponse(defaultData.response, 'backup', defaultData.followUp);
    }
    
    // Create standardized response object
    createResponse(text, source, followUp = [], confidence = 0.8) {
        return {
            text,
            source,
            followUp,
            confidence,
            timestamp: new Date().toISOString(),
            responseStyle: this.responseStyle
        };
    }
    
    // System prompt for AI
    getSystemPrompt() {
        const styleInstructions = {
            'detailed': 'Giv detaljerede, uddannelsesmæssige svar med eksempler og forklaringer.',
            'concise': 'Vær kort og præcis. Kom til pointen hurtigt.',
            'conversational': 'Svar i en venlig, samtaleagtig tone som en hjælpsom mentor.',
            'technical': 'Brug præcis videnskabelig terminologi og tekniske detaljer.'
        };
        
        return `Du er en ekspert i protein purification og biochemistry. Du hjælper studerende med at lære proteinrensning, kromatografi og relaterede teknikker.

Stil: ${styleInstructions[this.responseStyle]}

Emner du kan hjælpe med:
- Protein struktur og funktion
- Kromatografi teknikker (ion exchange, size exclusion, affinity)
- Buffer systemer og pH optimering  
- Troubleshooting af purification problemer
- SDS-PAGE og protein analyse
- Eksperimentel design

Svar altid på dansk og fokuser på praktisk, anvendelig viden. Hvis du ikke er sikker, sig det og foreslå hvor brugeren kan finde mere information.`;
    }
    
    // Get recent conversation history
    getRecentHistory(count = 5) {
        const recent = this.conversations.slice(-count * 2); // Last few exchanges
        return recent.map(conv => ({
            role: conv.role,
            content: conv.message
        }));
    }
    
    // Usage tracking
    checkUsageLimit() {
        const currentMonth = new Date().getMonth();
        
        // Reset usage if new month
        if (this.usage.month !== currentMonth) {
            this.usage = { count: 0, month: currentMonth };
            this.saveUsage();
        }
        
        return this.usage.count < this.usageLimit;
    }
    
    incrementUsage() {
        this.usage.count++;
        this.saveUsage();
    }
    
    saveUsage() {
        localStorage.setItem('ai-usage', JSON.stringify(this.usage));
    }
    
    // Conversation management
    addToConversation(role, message, response = null) {
        this.conversations.push({
            role,
            message,
            response,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 conversations
        if (this.conversations.length > 50) {
            this.conversations = this.conversations.slice(-50);
        }
        
        this.saveConversations();
    }
    
    saveConversations() {
        localStorage.setItem('ai-conversations', JSON.stringify(this.conversations));
    }
    
    loadRecentConversations() {
        const recentSection = document.getElementById('recent-conversations');
        const conversationList = document.getElementById('conversation-list');
        
        if (!conversationList) return;
        
        if (this.conversations.length === 0) {
            recentSection.style.display = 'none';
            return;
        }
        
        recentSection.style.display = 'block';
        
        const recent = this.conversations.slice(-5).reverse();
        conversationList.innerHTML = recent.map(conv => `
            <div class="conversation-item" onclick="loadConversation('${conv.timestamp}')">
                <div class="conversation-preview">${conv.message.substring(0, 100)}...</div>
                <div class="conversation-time">${new Date(conv.timestamp).toLocaleString('da-DK')}</div>
            </div>
        `).join('');
    }
    
    // Status management
    updateStatus() {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (!indicator || !statusText) return;
        
        if (this.provider === 'disabled') {
            indicator.className = 'status-indicator offline';
            indicator.textContent = '🚫';
            statusText.textContent = 'AI Disabled';
        } else if (!navigator.onLine) {
            indicator.className = 'status-indicator offline';
            indicator.textContent = '🔴';
            statusText.textContent = 'Offline - Backup Mode';
        } else if (this.provider === 'openai' && !this.apiKey) {
            indicator.className = 'status-indicator degraded';
            indicator.textContent = '🟡';
            statusText.textContent = 'API Key Needed';
        } else {
            indicator.className = 'status-indicator online';
            indicator.textContent = '🟢';
            statusText.textContent = 'AI Services Online';
        }
    }
    
    // Settings management
    updateProvider(provider) {
        this.provider = provider;
        localStorage.setItem('ai-provider', provider);
        this.updateStatus();
        
        // Show/hide API config
        const apiConfig = document.getElementById('api-config');
        if (apiConfig) {
            apiConfig.style.display = provider === 'openai' ? 'block' : 'none';
        }
    }
    
    updateResponseStyle(style) {
        this.responseStyle = style;
        localStorage.setItem('ai-response-style', style);
    }
    
    updateUsageLimit(limit) {
        this.usageLimit = limit;
        localStorage.setItem('ai-usage-limit', limit.toString());
    }
    
    updatePrivacyMode(enabled) {
        this.privacyMode = enabled;
        localStorage.setItem('ai-privacy-mode', enabled.toString());
        
        if (enabled) {
            this.updateProvider('local');
        }
    }
    
    saveAPIKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai-api-key', key);
        this.updateStatus();
    }
    
    updateModel(model) {
        this.model = model;
        localStorage.setItem('ai-model', model);
    }
}

// Global AI instance
let aiAssistant;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    aiAssistant = new AIAssistant();
    
    // Load settings from localStorage
    loadSettings();
    
    console.log('AI Assistant initialized:', aiAssistant.provider);
});

// UI Functions
function openChat() {
    window.location.href = 'chat.html';
}

function getSmartFeedback() {
    // This would typically be called from quiz module
    alert('Smart feedback feature - integrate with quiz system');
}

function getLearningPath() {
    // Generate personalized learning recommendations
    alert('Learning path feature - analyze user progress and recommend next steps');
}

function getPerformanceInsights() {
    // Show detailed analytics
    alert('Performance insights - show learning analytics and patterns');
}

function updateAIProvider() {
    const select = document.getElementById('ai-provider');
    if (select && aiAssistant) {
        aiAssistant.updateProvider(select.value);
    }
}

function updateResponseStyle() {
    const select = document.getElementById('response-style');
    if (select && aiAssistant) {
        aiAssistant.updateResponseStyle(select.value);
    }
}

function updateUsageLimit() {
    const slider = document.getElementById('usage-limit');
    const display = document.getElementById('limit-value');
    
    if (slider && display && aiAssistant) {
        const value = parseInt(slider.value);
        display.textContent = value;
        aiAssistant.updateUsageLimit(value);
    }
}

function updatePrivacyMode() {
    const checkbox = document.getElementById('privacy-mode');
    if (checkbox && aiAssistant) {
        aiAssistant.updatePrivacyMode(checkbox.checked);
    }
}

function saveAPIKey() {
    const input = document.getElementById('openai-key');
    if (input && aiAssistant) {
        aiAssistant.saveAPIKey(input.value);
    }
}

function updateModel() {
    const select = document.getElementById('model-selection');
    if (select && aiAssistant) {
        aiAssistant.updateModel(select.value);
    }
}

function loadConversation(timestamp) {
    // Load specific conversation - would navigate to chat with history
    window.location.href = `chat.html?conversation=${timestamp}`;
}

function loadSettings() {
    // Load AI provider
    const providerSelect = document.getElementById('ai-provider');
    if (providerSelect) {
        providerSelect.value = localStorage.getItem('ai-provider') || 'hybrid';
    }
    
    // Load response style
    const styleSelect = document.getElementById('response-style');
    if (styleSelect) {
        styleSelect.value = localStorage.getItem('ai-response-style') || 'detailed';
    }
    
    // Load usage limit
    const limitSlider = document.getElementById('usage-limit');
    const limitDisplay = document.getElementById('limit-value');
    if (limitSlider && limitDisplay) {
        const limit = parseInt(localStorage.getItem('ai-usage-limit')) || 100;
        limitSlider.value = limit;
        limitDisplay.textContent = limit;
    }
    
    // Load privacy mode
    const privacyCheckbox = document.getElementById('privacy-mode');
    if (privacyCheckbox) {
        privacyCheckbox.checked = localStorage.getItem('ai-privacy-mode') === 'true';
    }
    
    // Load API key (just check if exists, don't show value)
    const apiKeyInput = document.getElementById('openai-key');
    if (apiKeyInput && localStorage.getItem('openai-api-key')) {
        apiKeyInput.placeholder = 'API key saved (click to change)';
    }
    
    // Load model selection
    const modelSelect = document.getElementById('model-selection');
    if (modelSelect) {
        modelSelect.value = localStorage.getItem('ai-model') || 'gpt-3.5-turbo';
    }
}

// Export for use in other modules
window.AIAssistant = AIAssistant;
