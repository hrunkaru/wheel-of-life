/**
 * Main Application Logic - Wheel of Life Tracker
 * Coordinates authentication, data loading, and user interactions
 */

const App = {
    // Application state
    state: {
        authenticated: false,
        pat: null,
        password: null,
        data: null,
        currentSHA: null,
        currentView: 'dashboard' // dashboard, history, settings
    },

    // Storage keys
    PASSWORD_STORAGE_KEY: 'encryption_password_hash',
    REMEMBER_PASSWORD_KEY: 'remember_password',

    /**
     * Initializes the application
     */
    async init() {
        console.log('Initializing Wheel of Life Tracker...');

        // Check if PAT is stored
        const storedPAT = GitHubModule.getStoredPAT();

        if (storedPAT) {
            console.log('Found stored PAT');
            this.state.pat = storedPAT;
            // Show password prompt
            this.showPasswordPrompt();
        } else {
            // Show PAT setup
            this.showPATSetup();
        }

        // Set up event listeners
        this.setupEventListeners();
    },

    /**
     * Sets up event listeners for the application
     */
    setupEventListeners() {
        // PAT form submission
        const patForm = document.getElementById('pat-form');
        if (patForm) {
            patForm.addEventListener('submit', (e) => this.handlePATSubmit(e));
        }

        // Password form submission
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        }

        // New entry form submission
        const entryForm = document.getElementById('entry-form');
        if (entryForm) {
            entryForm.addEventListener('submit', (e) => this.handleEntrySubmit(e));
        }

        // Navigation
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(btn.dataset.view);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    /**
     * Handles PAT form submission
     */
    async handlePATSubmit(e) {
        e.preventDefault();

        const patInput = document.getElementById('pat-input');
        const pat = patInput.value.trim();

        if (!pat) {
            this.showError('Please enter a valid GitHub PAT');
            return;
        }

        // Show loading
        this.showLoading('Validating PAT...');

        try {
            // Test if PAT is valid
            const isValid = await GitHubModule.testPAT(pat);

            if (!isValid) {
                this.hideLoading();
                this.showError('Invalid PAT or insufficient permissions. Please check your token.');
                return;
            }

            // Store PAT
            GitHubModule.storePAT(pat);
            this.state.pat = pat;

            this.hideLoading();
            this.showSuccess('PAT validated and stored successfully!');

            // Move to password prompt
            setTimeout(() => this.showPasswordPrompt(), 1000);
        } catch (error) {
            this.hideLoading();
            this.showError('Error validating PAT: ' + error.message);
        }
    },

    /**
     * Handles password form submission
     */
    async handlePasswordSubmit(e) {
        e.preventDefault();

        const passwordInput = document.getElementById('password-input');
        const rememberCheckbox = document.getElementById('remember-password');
        const password = passwordInput.value;

        // Validate password
        const validation = CryptoModule.validatePassword(password);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        this.state.password = password;

        // Remember password option (store encrypted hash)
        if (rememberCheckbox && rememberCheckbox.checked) {
            localStorage.setItem(this.REMEMBER_PASSWORD_KEY, 'true');
            // Note: We don't actually store the password, just the preference
            // User still needs to enter it, but we could add auto-fill in future
        }

        // Show loading
        this.showLoading('Loading your data...');

        try {
            // Fetch encrypted data from GitHub
            const { content, sha } = await GitHubModule.fetchEncryptedData(this.state.pat);

            if (content === null) {
                // No data file exists yet - initialize with empty data
                console.log('No existing data found. Initializing...');
                this.state.data = this.createEmptyData();
                this.state.currentSHA = null;
                this.state.authenticated = true;

                this.hideLoading();
                this.showSuccess('Welcome! Let\'s create your first entry.');
                this.showMainApp();
            } else {
                // Decrypt the data
                try {
                    this.state.data = await CryptoModule.decrypt(content, password);
                    this.state.currentSHA = sha;
                    this.state.authenticated = true;

                    this.hideLoading();
                    this.showSuccess('Data loaded successfully!');
                    this.showMainApp();
                } catch (decryptError) {
                    this.hideLoading();
                    this.showError('Failed to decrypt data. Please check your password.');
                    this.state.password = null;
                }
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Error loading data: ' + error.message);
        }
    },

    /**
     * Handles new entry form submission
     */
    async handleEntrySubmit(e) {
        e.preventDefault();

        // Collect ratings from all sliders
        const ratings = {
            body: parseInt(document.getElementById('rating-body').value),
            mind: parseInt(document.getElementById('rating-mind').value),
            soul: parseInt(document.getElementById('rating-soul').value),
            friends: parseInt(document.getElementById('rating-friends').value),
            romance: parseInt(document.getElementById('rating-romance').value),
            family: parseInt(document.getElementById('rating-family').value),
            mission: parseInt(document.getElementById('rating-mission').value),
            money: parseInt(document.getElementById('rating-money').value),
            growth: parseInt(document.getElementById('rating-growth').value)
        };

        const notes = document.getElementById('entry-notes').value.trim();

        // Create new entry
        const entry = {
            id: this.generateUUID(),
            timestamp: new Date().toISOString(),
            ratings: ratings,
            notes: notes
        };

        // Add to data
        this.state.data.entries.push(entry);

        // Save to GitHub
        await this.saveData('Add new wheel-of-life entry');

        // Reset form
        e.target.reset();

        // Update visualization
        this.renderDashboard();
    },

    /**
     * Saves data to GitHub
     */
    async saveData(commitMessage = 'Update wheel-of-life data') {
        this.showLoading('Saving to GitHub...');

        try {
            // Encrypt data
            const encrypted = await CryptoModule.encrypt(this.state.data, this.state.password);

            // Commit to GitHub
            const response = await GitHubModule.commitEncryptedData(
                this.state.pat,
                encrypted,
                this.state.currentSHA,
                commitMessage
            );

            // Update SHA for next save
            this.state.currentSHA = response.content.sha;

            this.hideLoading();
            this.showSuccess('Data saved successfully!');
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to save data: ' + error.message);
            throw error;
        }
    },

    /**
     * Creates empty data structure
     */
    createEmptyData() {
        return {
            entries: [],
            version: '1.0'
        };
    },

    /**
     * Generates a UUID v4
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Shows PAT setup screen
     */
    showPATSetup() {
        document.getElementById('pat-setup').classList.remove('hidden');
        document.getElementById('password-prompt').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    },

    /**
     * Shows password prompt screen
     */
    showPasswordPrompt() {
        document.getElementById('pat-setup').classList.add('hidden');
        document.getElementById('password-prompt').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    },

    /**
     * Shows main application
     */
    showMainApp() {
        document.getElementById('pat-setup').classList.add('hidden');
        document.getElementById('password-prompt').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        // Render initial view
        this.renderDashboard();
    },

    /**
     * Renders the dashboard view
     */
    renderDashboard() {
        // Get latest entry
        const latestEntry = this.state.data.entries[this.state.data.entries.length - 1];

        if (latestEntry) {
            // Update chart
            WheelChart.render(latestEntry.ratings);

            // Update stats
            document.getElementById('total-entries').textContent = this.state.data.entries.length;
            document.getElementById('last-updated').textContent = new Date(latestEntry.timestamp).toLocaleDateString();
        } else {
            document.getElementById('total-entries').textContent = '0';
            document.getElementById('last-updated').textContent = 'Never';
        }
    },

    /**
     * Switches between views
     */
    switchView(view) {
        this.state.currentView = view;

        // Update active nav
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show appropriate content
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`${view}-view`).classList.remove('hidden');

        // Render view-specific content
        if (view === 'history') {
            this.renderHistory();
        }
    },

    /**
     * Renders history view
     */
    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        // Sort entries by date (newest first)
        const sortedEntries = [...this.state.data.entries].reverse();

        sortedEntries.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'history-entry';
            entryEl.innerHTML = `
                <div class="entry-date">${new Date(entry.timestamp).toLocaleString()}</div>
                <div class="entry-ratings">
                    ${Object.entries(entry.ratings).map(([key, val]) =>
                        `<span class="rating-badge">${key}: ${val}</span>`
                    ).join('')}
                </div>
                ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
            `;
            historyList.appendChild(entryEl);
        });
    },

    /**
     * Logs out user
     */
    logout() {
        if (confirm('Are you sure you want to log out? You will need to enter your password again.')) {
            this.state.authenticated = false;
            this.state.password = null;
            this.showPasswordPrompt();
        }
    },

    /**
     * Shows loading indicator
     */
    showLoading(message) {
        const loader = document.getElementById('loading');
        const loaderText = document.getElementById('loading-text');
        if (loader && loaderText) {
            loaderText.textContent = message;
            loader.classList.remove('hidden');
        }
    },

    /**
     * Hides loading indicator
     */
    hideLoading() {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.classList.add('hidden');
        }
    },

    /**
     * Shows error message
     */
    showError(message) {
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            setTimeout(() => errorEl.classList.add('hidden'), 5000);
        } else {
            alert('Error: ' + message);
        }
    },

    /**
     * Shows success message
     */
    showSuccess(message) {
        const successEl = document.getElementById('success-message');
        if (successEl) {
            successEl.textContent = message;
            successEl.classList.remove('hidden');
            setTimeout(() => successEl.classList.add('hidden'), 3000);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
