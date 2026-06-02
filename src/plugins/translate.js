module.exports = {
    name: 'translate',
    handleMessage: async (sock, msg) => {
        const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const jid = msg.key.remoteJid;
        if (!msg.key.fromMe) return;

        if (textMessage.startsWith('.en ')) {
            const textToTranslate = textMessage.replace('.en ', '').trim();
            if (textToTranslate) {
                try {
                    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(textToTranslate)}`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    const translatedText = data[0][0][0];

                    if (translatedText) {
                        // මැසේජ් එක Edit කරන කෑල්ල
                        await sock.sendMessage(jid, { text: translatedText, edit: msg.key });
                    }
                } catch (err) {
                    console.log('Translate Error:', err);
                }
            }
        }
    }
};
