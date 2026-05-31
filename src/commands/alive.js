module.exports = {
    name: 'alive',
    execute: async (sock, msg) => {
        // මැසේජ් එකේ තියෙන අකුරු ටික අඳුරගන්නවා
        const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const jid = msg.key.remoteJid;

        // මැසේජ් එක .alive නම් විතරක් මේක වැඩ කරනවා
        if (textMessage.trim() === '.alive') {
            await sock.sendMessage(jid, { text: '*POWERED BY BABIYA MD* 🤖✨' }, { quoted: msg });
        }
    }
};
