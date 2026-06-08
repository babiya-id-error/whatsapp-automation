const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));


const myTypingState = new Map();
const killSwitches = new Map(); 
const subscribedJids = new Set(); 

async function startStatusBot() {
    const { state, saveCreds } = await useMultiFileAuthState('status_auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.me) {
        let phoneNumber = await question('\n[?] WhatsApp අකය (947xxxxxxxxx): ');
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

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            
            myTypingState.clear();
            subscribedJids.clear();
            for (let timer of killSwitches.values()) clearTimeout(timer);
            killSwitches.clear();

            if (shouldReconnect) startStatusBot();
        } else if (connection === 'open') {
            console.log('\n[SUCCESS] Bot Active! Debug logs on.\n');
            await sock.sendPresenceUpdate('available');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

        
        if (textMessage.trim() === '.alive') {
            await sock.sendMessage(jid, { text: '*POWERED BY BABIYA MD* 🤖✨' }, { quoted: msg });
        }

        if (textMessage.startsWith('.en ')) {
            const textToTranslate = textMessage.replace('.en ', '').trim();
            if (textToTranslate) {
                try {
                    
                    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(textToTranslate)}`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    const translatedText = data[0][0][0];

                    if (translatedText) {
                        
                        await sock.sendMessage(jid, { text: translatedText, edit: msg.key });
                    }
                } catch (err) {
                    console.log('Translate Error:', err);
                }
            }
        }
        

        if (msg.key.fromMe) return; 

        if (jid === 'status@broadcast') {
            await sock.readMessages([msg.key]);
            return;
        }

        if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid')) {
            if (!subscribedJids.has(jid)) {
                await sock.presenceSubscribe(jid);
                subscribedJids.add(jid);
            }
        }
    });
    sock.ev.on('presence.update', async (update) => {
        const { id, presences } = update;
        
        const myJid = sock.user?.id?.split(':')[0];
        if (myJid && id.includes(myJid)) return;

        if ((id.endsWith('@s.whatsapp.net') || id.endsWith('@lid')) && presences) {
            const participantData = Object.values(presences)[0];
            const status = participantData?.lastKnownPresence;
            
            if (!status) return;

            console.log(`[STATUS CHECK] User ${id.split('@')[0]} is now: ${status}`);

            try {
                if (status === 'composing') {
                    
                    if (killSwitches.has(id)) {
                        clearTimeout(killSwitches.get(id));
                    }

                    
                    if (myTypingState.get(id) !== 'composing') {
                        myTypingState.set(id, 'composing');
                        await sock.sendPresenceUpdate('composing', id);
                        console.log(`[PRANK ACTIVE] -> Sent 'composing' to ${id.split('@')[0]}`);
                    }

                    
                    const timer = setTimeout(async () => {
                        if (myTypingState.get(id) === 'composing') {
                            myTypingState.set(id, 'paused');
                            await sock.sendPresenceUpdate('paused', id);
                            killSwitches.delete(id);
                            console.log(`[KILL SWITCH] -> Auto-Stopped typing for ${id.split('@')[0]} (Timeout)`);
                        }
                    }, 4000); 
                    
                    killSwitches.set(id, timer);

                } else if (status === 'paused') {
                    
                    if (killSwitches.has(id)) {
                        clearTimeout(killSwitches.get(id));
                        killSwitches.delete(id);
                    }

                    if (myTypingState.get(id) === 'composing') {
                        myTypingState.set(id, 'paused');
                        await sock.sendPresenceUpdate('paused', id);
                        console.log(`[PRANK PAUSED] -> Normal Stop for ${id.split('@')[0]}`);
                    }
                }
            } catch (err) {
                console.error('Typing Prank Error:', err);
            }
        }
    });
}

startStatusBot();

