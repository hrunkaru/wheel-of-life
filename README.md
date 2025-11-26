# 🎯 Wheel of Life Tracker

A privacy-focused web application to track your life balance across 9 key areas, with encrypted data storage on GitHub.

## 📊 What is the Wheel of Life?

The Wheel of Life is a self-assessment tool that helps you visualize balance across different life areas. This app tracks 3 major categories:

### 💚 Health
- **Body**: Physical fitness, nutrition, sleep
- **Mind**: Mental clarity, learning, cognitive health
- **Soul**: Spirituality, inner peace, purpose

### 💙 Relationships
- **Friends**: Social connections, friendships
- **Romance**: Romantic relationships, intimacy
- **Family**: Family bonds, connections

### 🧡 Work
- **Mission**: Purpose, meaningful work, impact
- **Money**: Financial security, income
- **Growth**: Career development, skills, learning

## ✨ Features

- **🔐 Private & Encrypted**: Your data is encrypted with AES-GCM before being stored
- **📱 Access Anywhere**: Works on any device with a web browser
- **📈 Visual Tracking**: Beautiful radar charts show your life balance
- **📜 History**: Track changes over time
- **🚫 No Server Required**: Pure client-side application hosted on GitHub Pages
- **💾 GitHub Storage**: Data backed up automatically to your GitHub repository

## 🔒 Security Model

**Two-Layer Security:**

1. **GitHub Personal Access Token (PAT)**: Allows the app to read/write to your repository
   - Stored in browser localStorage (persistent on same device)
   - Required for saving data
   - Can be revoked anytime

2. **Encryption Password**: Encrypts/decrypts your actual data
   - Never stored anywhere
   - Required each session (or optionally remembered)
   - Even with repo access, data is unreadable without this password

**Result**: Your data is encrypted at rest in GitHub. Even if someone gets your PAT, they cannot read your life ratings without your encryption password.

## 🚀 Setup Instructions

### Step 1: Deploy to GitHub Pages

1. Fork or clone this repository to your GitHub account
2. Go to repository Settings → Pages
3. Under "Source", select `main` branch and `/ (root)` folder
4. Click "Save"
5. Wait a few minutes for deployment
6. Your app will be available at: `https://[your-username].github.io/wheel-of-life/`

### Step 2: Create GitHub Personal Access Token

1. Go to [GitHub Settings → Tokens (Fine-grained)](https://github.com/settings/tokens?type=beta)
2. Click **"Generate new token"**
3. Configure the token:
   - **Token name**: `Wheel of Life Tracker`
   - **Expiration**: `1 year` (or your preference)
   - **Repository access**: `Only select repositories`
     - Select: `[your-username]/wheel-of-life`
   - **Permissions**:
     - Repository permissions → Contents: **Read and write**
4. Click **"Generate token"**
5. **Copy the token** (you'll only see it once!)

### Step 3: First-Time Setup

1. Open your deployed app
2. Enter your GitHub PAT when prompted
3. Create an encryption password (minimum 8 characters)
   - **Important**: Remember this password! You'll need it to access your data
4. Start tracking your wheel of life!

## 📖 How to Use

### Creating an Entry

1. Click **"New Entry"** in the navigation
2. Rate each of the 9 areas from 0-10 using the sliders
3. Add optional notes about your current state
4. Click **"Save Entry"**
5. Your data is automatically encrypted and saved to GitHub

### Viewing Progress

- **Dashboard**: See your latest wheel-of-life visualization
- **History**: View all past entries with timestamps
- **Chart**: Visual radar chart shows balance across all areas

### Multi-Device Access

1. Open the app on any device
2. Enter your GitHub PAT (first time per device)
3. Enter your encryption password
4. Your data loads from GitHub!

## 🛠️ Technical Details

### Technologies Used

- **Web Crypto API**: AES-GCM encryption with PBKDF2 key derivation
- **GitHub API**: Repository contents read/write
- **Chart.js**: Radar chart visualization
- **Pure JavaScript**: No build process or dependencies

### Project Structure

```
wheel-of-life/
├── index.html              # Main application UI
├── css/
│   └── style.css          # Styling
├── js/
│   ├── app.js             # Main application logic
│   ├── crypto.js          # Encryption/decryption
│   ├── github.js          # GitHub API integration
│   └── visualization.js   # Chart rendering
├── data/
│   └── wheel-of-life.json.encrypted  # Your encrypted data
└── README.md
```

### Data Format

Data is stored as encrypted JSON with the following structure:

```json
{
  "entries": [
    {
      "id": "uuid",
      "timestamp": "2025-11-26T14:30:00Z",
      "ratings": {
        "body": 7,
        "mind": 8,
        "soul": 6,
        "friends": 8,
        "romance": 5,
        "family": 9,
        "mission": 7,
        "money": 6,
        "growth": 8
      },
      "notes": "Optional reflection"
    }
  ],
  "version": "1.0"
}
```

## 🔧 Configuration

You can customize the repository and branch in `js/github.js`:

```javascript
GitHubModule = {
    owner: 'your-username',     // Change to your username
    repo: 'wheel-of-life',      // Change if you renamed the repo
    branch: 'main',             // Change if using different branch
    dataPath: 'data/wheel-of-life.json.encrypted'
}
```

## ❓ FAQ

**Q: What if I forget my encryption password?**
A: Unfortunately, there's no way to recover your data without the password. The encryption is designed to be secure, which means no recovery mechanism. Choose a memorable password!

**Q: Can I use this with a private repository?**
A: Yes! The app works with both public and private repositories.

**Q: What happens when my PAT expires?**
A: You'll get an error when trying to save. Simply generate a new PAT with the same permissions and enter it in the app.

**Q: Is my data really private?**
A: Yes. The data in your repository is encrypted with your password using strong AES-GCM encryption. Without your password, the data is just meaningless encrypted bytes.

**Q: Can I export my data?**
A: Yes! The encrypted file is stored in `data/wheel-of-life.json.encrypted`. You can also manually decrypt it using the Web Crypto API if you have your password.

**Q: What if I want to change my encryption password?**
A: You'll need to:
1. Decrypt your current data with the old password
2. Re-encrypt it with the new password
3. Commit the new encrypted file
(Future version could include a "change password" feature)

## 🔐 Security Best Practices

1. **Use a strong encryption password** (12+ characters, mix of letters, numbers, symbols)
2. **Store your password securely** (password manager recommended)
3. **Set PAT expiration** (1 year maximum)
4. **Use fine-grained PAT** (not classic tokens)
5. **Revoke PAT** if you suspect it's compromised
6. **Don't share your encryption password** with anyone

## 📝 License

MIT License - feel free to modify and use for your personal tracking needs!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome! Open an issue or submit a pull request.

## 📮 Support

If you encounter issues:
1. Check browser console for errors
2. Verify your PAT has correct permissions
3. Ensure you're using a modern browser with Web Crypto API support
4. Try clearing localStorage and re-entering credentials

---

**Happy tracking! May your wheel of life be balanced and fulfilling!** 🎯✨
