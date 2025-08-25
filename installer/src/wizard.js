// Wizard state management
let currentStep = 1;
const totalSteps = 4;
let apiKeys = {};
let preferences = {
    theme: 'dark',
    autoUpdates: true,
    betaUpdates: false,
    analytics: true,
    crashReports: true
};

// Initialize wizard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load existing setup data if any
        const setupCheck = await window.electronAPI.checkSetup();
        if (setupCheck) {
            // If setup is already complete, load existing data
            const existingKeys = await window.electronAPI.loadApiKeys();
            if (existingKeys.success) {
                populateApiKeys(existingKeys.keys);
            }
        }
        
        updateProgress();
    } catch (error) {
        console.error('Error initializing wizard:', error);
    }
});

// Navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show current step
    const stepElement = document.getElementById(`step-${getStepName(step)}`);
    if (stepElement) {
        stepElement.classList.add('active');
    }
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((s, index) => {
        s.classList.toggle('active', index + 1 <= step);
    });
}

function getStepName(step) {
    const stepNames = ['welcome', 'api-config', 'preferences', 'complete'];
    return stepNames[step - 1];
}

function updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
}

// Validation functions
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return true; // Welcome step always valid
        case 2:
            return validateApiKeys();
        case 3:
            return validatePreferences();
        case 4:
            return true; // Complete step always valid
        default:
            return true;
    }
}

function validateApiKeys() {
    // Collect API keys from form
    const alphaVantageKey = document.getElementById('alpha-vantage-key')?.value.trim() || '';
    const binanceKey = document.getElementById('binance-key')?.value.trim() || '';
    const polygonKey = document.getElementById('polygon-key')?.value.trim() || '';
    
    apiKeys = {
        'alpha-vantage': alphaVantageKey,
        'binance': binanceKey,
        'polygon': polygonKey
    };
    
    // At least one API key should be provided
    const hasAtLeastOneKey = Object.values(apiKeys).some(key => key.length > 0);
    
    if (!hasAtLeastOneKey) {
        showError('Please provide at least one API key to continue.');
        return false;
    }
    
    return true;
}

function validatePreferences() {
    // Collect preferences
    preferences.theme = document.querySelector('.theme-option.active')?.dataset.theme || 'dark';
    preferences.autoUpdates = document.getElementById('auto-updates')?.checked || false;
    preferences.betaUpdates = document.getElementById('beta-updates')?.checked || false;
    preferences.analytics = document.getElementById('analytics')?.checked || false;
    preferences.crashReports = document.getElementById('crash-reports')?.checked || false;
    
    return true;
}

function populateApiKeys(keys) {
    if (keys['alpha-vantage']) {
        document.getElementById('alpha-vantage-key').value = keys['alpha-vantage'];
    }
    if (keys['binance']) {
        document.getElementById('binance-key').value = keys['binance'];
    }
    if (keys['polygon']) {
        document.getElementById('polygon-key').value = keys['polygon'];
    }
}

// UI Interaction functions
function toggleVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function minimizeWindow() {
    window.electronAPI.minimizeWindow();
}

function closeWindow() {
    window.electronAPI.closeWindow();
}

function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <div class="toast-icon">⚠️</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .error-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                animation: slideInRight 0.3s ease;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0 4px;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <div class="toast-icon">✅</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add success toast styles
    if (!document.querySelector('#success-toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'success-toast-styles';
        styles.textContent = `
            .success-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
                animation: slideInRight 0.3s ease;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Theme selection
document.addEventListener('click', (e) => {
    if (e.target.closest('.theme-option')) {
        const themeOption = e.target.closest('.theme-option');
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        themeOption.classList.add('active');
    }
});

// Launch application
async function launchApplication() {
    try {
        // Show loading state
        const launchBtn = document.querySelector('.launch-btn');
        const originalText = launchBtn.innerHTML;
        launchBtn.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Launching...</span>
        `;
        launchBtn.disabled = true;
        
        // Add loading spinner styles
        if (!document.querySelector('#loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'loading-styles';
            styles.textContent = `
                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Save API keys
        const saveResult = await window.electronAPI.saveApiKeys(apiKeys);
        if (!saveResult.success) {
            throw new Error(saveResult.error || 'Failed to save API keys');
        }
        
        // Save preferences to localStorage for the main app
        localStorage.setItem('novasignal-preferences', JSON.stringify(preferences));
        
        showSuccess('Configuration saved successfully!');
        
        // Wait a moment then launch
        setTimeout(async () => {
            try {
                const launchResult = await window.electronAPI.startApplication();
                if (launchResult.success) {
                    showSuccess('NovaSignal is starting...');
                }
            } catch (error) {
                console.error('Error launching application:', error);
                showError('Failed to launch application: ' + error.message);
                
                // Restore button
                launchBtn.innerHTML = originalText;
                launchBtn.disabled = false;
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error in launch process:', error);
        showError('Setup failed: ' + error.message);
        
        // Restore button
        const launchBtn = document.querySelector('.launch-btn');
        launchBtn.innerHTML = `
            <span>Launch NovaSignal</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0l8 8-8 8v-5H0V5h8V0z"/>
            </svg>
        `;
        launchBtn.disabled = false;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'Enter':
            if (currentStep < totalSteps) {
                nextStep();
            } else {
                launchApplication();
            }
            break;
        case 'Escape':
            if (currentStep > 1) {
                previousStep();
            }
            break;
    }
});

// Auto-focus first input on API config step
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const apiStep = document.getElementById('step-api-config');
        if (apiStep && apiStep.classList.contains('active')) {
            const firstInput = apiStep.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['class'] 
    });
});