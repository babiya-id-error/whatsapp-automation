sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

        
        if (textMessage.trim() === '.alive') {
            await sock.sendMessage(jid, { text: '*POWERED BY BABIYA MD* 🤖✨' }, { quoted: msg });
        }
