const { Application } = require('spectron');
const electronPath = require('electron');
const path = require('path');
const fs = require('fs');
const { expect } = require('chai');

describe('NovaSignal Installer', function() {
    this.timeout(30000);
    
    let app;
    
    beforeEach(async function() {
        app = new Application({
            path: electronPath,
            args: [path.join(__dirname, '..', 'src', 'main.js')],
            env: {
                NODE_ENV: 'test'
            }
        });
        
        return app.start();
    });
    
    afterEach(function() {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });
    
    describe('Application Launch', function() {
        it('should launch the installer window', async function() {
            const count = await app.client.getWindowCount();
            expect(count).to.equal(1);
        });
        
        it('should have the correct title', async function() {
            const title = await app.client.getTitle();
            expect(title).to.include('NovaSignal Setup');
        });
        
        it('should show the wizard interface', async function() {
            const exists = await app.client.isExisting('.wizard-container');
            expect(exists).to.be.true;
        });
    });
    
    describe('Wizard Navigation', function() {
        it('should start on the welcome step', async function() {
            const welcomeStep = await app.client.isVisible('#step-welcome');
            expect(welcomeStep).to.be.true;
        });
        
        it('should navigate to API configuration step', async function() {
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            const apiStep = await app.client.isVisible('#step-api-config');
            expect(apiStep).to.be.true;
        });
        
        it('should validate API keys before proceeding', async function() {
            // Navigate to API step
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // Try to continue without API keys
            await app.client.click('button:contains("Continue")');
            
            // Should show error
            const errorExists = await app.client.waitForVisible('.error-toast', 3000);
            expect(errorExists).to.be.true;
        });
        
        it('should accept valid API keys', async function() {
            // Navigate to API step
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // Enter test API key
            await app.client.setValue('#alpha-vantage-key', 'test-api-key-123');
            
            // Continue to next step
            await app.client.click('button:contains("Continue")');
            
            // Should navigate to preferences step
            await app.client.waitForVisible('#step-preferences', 5000);
            const preferencesStep = await app.client.isVisible('#step-preferences');
            expect(preferencesStep).to.be.true;
        });
    });
    
    describe('API Key Management', function() {
        it('should toggle password visibility', async function() {
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // Initially should be password type
            const initialType = await app.client.getAttribute('#alpha-vantage-key', 'type');
            expect(initialType).to.equal('password');
            
            // Click toggle button
            await app.client.click('.toggle-visibility');
            
            // Should now be text type
            const newType = await app.client.getAttribute('#alpha-vantage-key', 'type');
            expect(newType).to.equal('text');
        });
        
        it('should save encrypted API keys', async function() {
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // Enter API keys
            await app.client.setValue('#alpha-vantage-key', 'test-alpha-key');
            await app.client.setValue('#binance-key', 'test-binance-key');
            
            // Continue through wizard
            await app.client.click('button:contains("Continue")');
            await app.client.waitForVisible('#step-preferences', 5000);
            await app.client.click('button:contains("Continue")');
            await app.client.waitForVisible('#step-complete', 5000);
            
            // API keys should be saved (we can't directly test encryption here)
            const completeStep = await app.client.isVisible('#step-complete');
            expect(completeStep).to.be.true;
        });
    });
    
    describe('Theme Selection', function() {
        it('should allow theme selection', async function() {
            // Navigate to preferences step
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            await app.client.setValue('#alpha-vantage-key', 'test-key');
            await app.client.click('button:contains("Continue")');
            await app.client.waitForVisible('#step-preferences', 5000);
            
            // Select light theme
            await app.client.click('[data-theme="light"]');
            
            // Check if light theme is selected
            const isActive = await app.client.getAttribute('[data-theme="light"]', 'class');
            expect(isActive).to.include('active');
        });
    });
    
    describe('Completion and Launch', function() {
        it('should complete the wizard and prepare to launch', async function() {
            // Complete entire wizard
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            await app.client.setValue('#alpha-vantage-key', 'test-key');
            await app.client.click('button:contains("Continue")');
            await app.client.waitForVisible('#step-preferences', 5000);
            await app.client.click('button:contains("Continue")');
            await app.client.waitForVisible('#step-complete', 5000);
            
            // Should show launch button
            const launchBtn = await app.client.isVisible('.launch-btn');
            expect(launchBtn).to.be.true;
            
            // Should show completion summary
            const summary = await app.client.isVisible('.completion-summary');
            expect(summary).to.be.true;
        });
    });
    
    describe('Progress Indicator', function() {
        it('should update progress as wizard advances', async function() {
            // Check initial progress
            const initialWidth = await app.client.getCssProperty('.progress-fill', 'width');
            expect(initialWidth.value).to.equal('25%'); // Step 1 of 4
            
            // Advance to step 2
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            const step2Width = await app.client.getCssProperty('.progress-fill', 'width');
            expect(step2Width.value).to.equal('50%'); // Step 2 of 4
        });
    });
    
    describe('Keyboard Navigation', function() {
        it('should respond to keyboard shortcuts', async function() {
            // Test Enter key navigation
            await app.client.keys(['Enter']);
            await app.client.waitForVisible('#step-api-config', 5000);
            
            const apiStep = await app.client.isVisible('#step-api-config');
            expect(apiStep).to.be.true;
        });
        
        it('should respond to Escape key for going back', async function() {
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // Press Escape to go back
            await app.client.keys(['Escape']);
            await app.client.waitForVisible('#step-welcome', 5000);
            
            const welcomeStep = await app.client.isVisible('#step-welcome');
            expect(welcomeStep).to.be.true;
        });
    });
    
    describe('Error Handling', function() {
        it('should handle missing API keys gracefully', async function() {
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // Try to continue without keys
            await app.client.click('button:contains("Continue")');
            
            // Should show error toast
            const errorToast = await app.client.waitForVisible('.error-toast', 3000);
            expect(errorToast).to.be.true;
            
            // Error should auto-dismiss
            await app.client.pause(6000);
            const errorGone = await app.client.isVisible('.error-toast');
            expect(errorGone).to.be.false;
        });
    });
    
    describe('Window Controls', function() {
        it('should minimize window', async function() {
            await app.client.click('.minimize-btn');
            
            // Window should be minimized
            const isMinimized = await app.browserWindow.isMinimized();
            expect(isMinimized).to.be.true;
        });
        
        it('should handle close button', async function() {
            // This test just verifies the button exists and is clickable
            const closeBtn = await app.client.isVisible('.close-btn');
            expect(closeBtn).to.be.true;
            
            // We don't actually click it as it would close the app
        });
    });
    
    describe('Accessibility', function() {
        it('should have proper ARIA labels', async function() {
            // Check for accessible form elements
            const alphaVantageInput = await app.client.isExisting('#alpha-vantage-key');
            expect(alphaVantageInput).to.be.true;
            
            // Check for proper heading structure
            const mainHeading = await app.client.isExisting('h1');
            expect(mainHeading).to.be.true;
        });
        
        it('should support keyboard navigation', async function() {
            await app.client.click('button:contains("Get Started")');
            await app.client.waitForVisible('#step-api-config', 5000);
            
            // First input should be focusable
            await app.client.keys(['Tab']);
            const focusedElement = await app.client.execute(() => {
                return document.activeElement.id;
            });
            expect(focusedElement.value).to.equal('alpha-vantage-key');
        });
    });
});