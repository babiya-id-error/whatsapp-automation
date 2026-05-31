// මෙතන තියෙන්නේ ප්‍රෑන්ක් එකට අදාළ මතකයන් තියාගන්න තැන් දෙකක්
const myTypingState = new Map();
const killSwitches = new Map();

module.exports = {
    name: 'typingPrank',
    execute: async (sock, update) => {
        const { id, presences } = update;
        
        const myJid = sock.user?.id?.split(':')[0];
        if (myJid && id.includes(myJid)) return;

        if ((id.endsWith('@s.whatsapp.net') || id.endsWith('@lid')) && presences) {
            const participantData = Object.values(presences)[0];
            const status = participantData?.lastKnownPresence;
            
            if (!status) return;

            try {
                if (status === 'composing') {
                    if (killSwitches.has(id)) {
                        clearTimeout(killSwitches.get(id));
                    }

                    if (myTypingState.get(id) !== 'composing') {
                        myTypingState.set(id, 'composing');
                        await sock.sendPresenceUpdate('composing', id);
                    }

                    const timer = setTimeout(async () => {
                        if (myTypingState.get(id) === 'composing') {
                            myTypingState.set(id, 'paused');
                            await sock.sendPresenceUpdate('paused', id);
                            killSwitches.delete(id);
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
                    }
                }
            } catch (err) {
                console.error('Typing Prank Error:', err);
            }
        }
    }
};
