/**
 * Crypto Module - Handles encryption and decryption of wheel-of-life data
 * Uses Web Crypto API with AES-GCM and PBKDF2 key derivation
 */

const CryptoModule = {
    // Configuration
    PBKDF2_ITERATIONS: 100000,
    KEY_LENGTH: 256,

    /**
     * Derives an encryption key from a password using PBKDF2
     * @param {string} password - User's encryption password
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey>} - Derived encryption key
     */
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveKey']
        );

        // Derive AES-GCM key from password
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: this.KEY_LENGTH
            },
            false,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Encrypts data with a password
     * @param {Object} data - Data object to encrypt
     * @param {string} password - Encryption password
     * @returns {Promise<string>} - Base64 encoded encrypted data with salt and IV
     */
    async encrypt(data, password) {
        try {
            // Generate random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Derive key from password
            const key = await this.deriveKey(password, salt);

            // Convert data to JSON and then to buffer
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));

            // Encrypt the data
            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                dataBuffer
            );

            // Combine salt + IV + encrypted data
            const combined = new Uint8Array(
                salt.byteLength + iv.byteLength + encryptedBuffer.byteLength
            );
            combined.set(salt, 0);
            combined.set(iv, salt.byteLength);
            combined.set(new Uint8Array(encryptedBuffer), salt.byteLength + iv.byteLength);

            // Convert to base64 for storage
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data: ' + error.message);
        }
    },

    /**
     * Decrypts data with a password
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @param {string} password - Decryption password
     * @returns {Promise<Object>} - Decrypted data object
     */
    async decrypt(encryptedData, password) {
        try {
            // Convert base64 to buffer
            const combined = this.base64ToArrayBuffer(encryptedData);

            // Extract salt, IV, and encrypted data
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const encrypted = combined.slice(28);

            // Derive key from password
            const key = await this.deriveKey(password, salt);

            // Decrypt the data
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encrypted
            );

            // Convert buffer to JSON
            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decryptedBuffer);

            return JSON.parse(decryptedText);
        } catch (error) {
            console.error('Decryption error:', error);
            // Check if it's likely a wrong password
            if (error.name === 'OperationError' || error.message.includes('decrypt')) {
                throw new Error('Decryption failed - incorrect password or corrupted data');
            }
            throw new Error('Failed to decrypt data: ' + error.message);
        }
    },

    /**
     * Converts ArrayBuffer to Base64 string
     * @param {Uint8Array} buffer - Buffer to convert
     * @returns {string} - Base64 encoded string
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Converts Base64 string to ArrayBuffer
     * @param {string} base64 - Base64 encoded string
     * @returns {Uint8Array} - Decoded buffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    /**
     * Validates password strength (optional helper)
     * @param {string} password - Password to validate
     * @returns {Object} - {valid: boolean, message: string}
     */
    validatePassword(password) {
        if (!password || password.length < 8) {
            return {
                valid: false,
                message: 'Password must be at least 8 characters long'
            };
        }
        return {
            valid: true,
            message: 'Password is valid'
        };
    }
};
