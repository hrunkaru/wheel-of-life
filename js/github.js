/**
 * GitHub API Module - Handles reading and writing encrypted data to GitHub repository
 * Requires a fine-grained Personal Access Token with Contents read/write permissions
 */

const GitHubModule = {
    // Configuration - will be set from app
    owner: 'hrunkaru',
    repo: 'wheel-of-life',
    branch: 'main',
    dataPath: 'data/wheel-of-life.json.encrypted',

    // Storage keys
    PAT_STORAGE_KEY: 'github_pat',

    /**
     * Gets the stored GitHub PAT from localStorage
     * @returns {string|null} - The stored PAT or null
     */
    getStoredPAT() {
        return localStorage.getItem(this.PAT_STORAGE_KEY);
    },

    /**
     * Stores the GitHub PAT in localStorage
     * @param {string} pat - Personal Access Token
     */
    storePAT(pat) {
        localStorage.setItem(this.PAT_STORAGE_KEY, pat);
    },

    /**
     * Clears the stored GitHub PAT
     */
    clearPAT() {
        localStorage.removeItem(this.PAT_STORAGE_KEY);
    },

    /**
     * Fetches the encrypted data file from GitHub
     * @param {string} pat - GitHub Personal Access Token
     * @returns {Promise<Object>} - Object with {content: string, sha: string}
     */
    async fetchEncryptedData(pat) {
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${pat}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (response.status === 404) {
                // File doesn't exist yet - return null
                return { content: null, sha: null };
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`GitHub API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            // GitHub returns content as base64 encoded
            const content = atob(data.content.replace(/\n/g, ''));

            return {
                content: content,
                sha: data.sha // SHA is needed for updating the file
            };
        } catch (error) {
            console.error('Error fetching data from GitHub:', error);
            throw error;
        }
    },

    /**
     * Commits encrypted data to GitHub
     * @param {string} pat - GitHub Personal Access Token
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @param {string|null} sha - SHA of existing file (null for new file)
     * @param {string} message - Commit message
     * @returns {Promise<Object>} - Response from GitHub API
     */
    async commitEncryptedData(pat, encryptedData, sha, message = 'Update wheel-of-life data') {
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`;

            // GitHub API expects content to be base64 encoded
            const contentBase64 = btoa(encryptedData);

            const body = {
                message: message,
                content: contentBase64,
                branch: this.branch
            };

            // Include SHA if updating existing file
            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${pat}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`GitHub API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error committing data to GitHub:', error);
            throw error;
        }
    },

    /**
     * Tests if a PAT is valid by making a simple API call
     * @param {string} pat - GitHub Personal Access Token
     * @returns {Promise<boolean>} - True if PAT is valid
     */
    async testPAT(pat) {
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${pat}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error testing PAT:', error);
            return false;
        }
    },

    /**
     * Gets the GitHub repository URL
     * @returns {string} - Repository URL
     */
    getRepoURL() {
        return `https://github.com/${this.owner}/${this.repo}`;
    },

    /**
     * Gets the direct URL to the encrypted data file
     * @returns {string} - File URL
     */
    getDataFileURL() {
        return `${this.getRepoURL()}/blob/${this.branch}/${this.dataPath}`;
    }
};
