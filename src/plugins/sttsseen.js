module.exports = {
    name: 'autoStatusSeen',
    execute: async (sock, msg) => {
        // WhatsApp Status එන්නේ 'status@broadcast' කියන විශේෂ ID එකෙන්
        if (msg.key.remoteJid === 'status@broadcast') {
            try {
                // Status එක බැලුවා කියලා (Read Receipt) යවනවා
                await sock.readMessages([msg.key]);
            } catch (err) {
                console.error('Auto Status Seen Error:', err);
            }
        }
    }
};
