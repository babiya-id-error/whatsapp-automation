module.exports = {
    name: 'alive',
    execute: async (sock, msg) => {
        
        const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const jid = msg.key.remoteJid;

        if (textMessage.trim() === '.alive') {
            await sock.sendMessage(jid, { text: '*POWERED BY BABIYA MD* 🤖✨' }, { quoted: msg });
        }
    }
};
