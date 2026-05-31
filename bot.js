const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startStatusBot() {
    // 1. Session එක සේව් වෙන තැන
    const { state, saveCreds } = await useMultiFileAuthState('status_auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // 2. Pairing Code ඉල්ලන කොටස
    if (!sock.authState.creds.me) {
        let phoneNumber = await question('\n[?] WhatsApp අංකය (947xxxxxxxxx): ');
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (phoneNumber) {
            setTimeout(async () => {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n[!] Pairing Code: => ${code}\n`);
            }, 6000); 
        } else {
            process.exit();
        }
    }

    sock.ev.on('creds.update', saveCreds);

    // 3. Connection එක පාලනය කිරීම සහ Error ආවොත් Reconnect වීම
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            console.log('\n[!] Connection Closed. Reconnecting...\n');
            if (shouldReconnect) startStatusBot();
        } else if (connection === 'open') {
            console.log('\n[SUCCESS] Bot Active! Babiya MD is online.\n');
            await sock.sendPresenceUpdate('available');
        }
    });

    // --- 🟢 4. Commands කියවන කොටස (The Command Loader) 🟢 ---
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // src/commands ෆෝල්ඩර් එක ඇතුළේ තියෙන ෆයිල්ස් ඔක්කොම Auto කියවනවා
        const commandsPath = path.join(__dirname, 'src', 'commands');
        if (fs.existsSync(commandsPath)) {
            fs.readdirSync(commandsPath).forEach(file => {
                if (file.endsWith('.js')) {
                    const command = require(path.join(commandsPath, file));
                    // අදාළ ෆයිල් එකේ තියෙන වැඩේ මෙතනින් රන් කරනවා
                    command.execute(sock, msg); 
                }
            });
        }
        
        // Status Auto-read කෑල්ල පොදු දෙයක් නිසා මෙතනම තියමු
        const jid = msg.key.remoteJid;
        if (jid === 'status@broadcast') {
            await sock.readMessages([msg.key]);
        }
    });

    // --- 😈 5. Background වැඩ (Pranks/Plugins) කියවන කොටස 😈 ---
    sock.ev.on('presence.update', async (update) => {
        // src/plugins ෆෝල්ඩර් එක ඇතුළේ තියෙන ෆයිල්ස් Auto කියවනවා
        const pluginsPath = path.join(__dirname, 'src', 'plugins');
        if (fs.existsSync(pluginsPath)) {
            fs.readdirSync(pluginsPath).forEach(file => {
                if (file.endsWith('.js')) {
                    const plugin = require(path.join(pluginsPath, file));
                    // Typing Prank එක වගේ දේවල් මෙතනින් රන් වෙනවා
                    plugin.execute(sock, update); 
                }
            });
        }
    });
}

startStatusBot();
