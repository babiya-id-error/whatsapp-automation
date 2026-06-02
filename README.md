# 🤖 BABIYA-MD WHATSAPP BOT

![Uploading ec89c5d1-ddcf-4498-a9f7-3dd95b0bb3ed.jpeg…]()


<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  <img src="https://img.shields.io/badge/Bot%20Status-Active-brightgreen" />
  <img src="https://img.shields.io/github/languages/top/babiya-id-error/whatsapp-automation" />
</p>

A modular and high-speed WhatsApp automation bot built using **Node.js** and the **Baileys** library. This bot allows you to automate tasks and use advanced features like auto-translation directly through your WhatsApp.

---

## ✨ Features & Commands

| Command | Description | Usage |
| :--- | :--- | :--- |
| `.alive` | Check if the bot is responsive and online. | `.alive` |
| `.en` | **Auto-Translate & Edit:** Translates your message to English and automatically replaces the original text. | `.en කොහොමද මචං` |
| **Auto-Presence** | Automatically sends a "Recording..." status to the chat for a sleek prank effect. | (Automated) |

---

## 🛠️ Deployment (How to host on VPS)

Follow these steps to get your bot up and running on your VPS:

### 1. Install Node.js
Ensure you have Node.js (v18+) installed on your server.

curl -fsSL [https://deb.nodesource.com/setup_18.x](https://deb.nodesource.com/setup_18.x) | sudo -E bash -
sudo apt-get install -y nodejs


# Clone the repository
git clone [https://github.com/babiya-id-error/whatsapp-automation.git](https://github.com/babiya-id-error/whatsapp-automation.git)

# Enter the directory
cd whatsapp-automation

# Install dependencies
npm install

# Start the bot
node bot.js

whatsapp-automation/
├── src/
│   └── plugins/        # Custom features and commands
│       ├── alive.js
│       ├── translate.js
│       └── tp.js
├── status_auth_info/   # Authentication and session data
├── bot.js              # Main entry point
└── package.json        # Dependencies and scripts

