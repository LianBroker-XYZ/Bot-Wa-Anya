let handler = async (m, { conn }) => {
  const ownerNumber = '6283132240763'
  const ownerJid = ownerNumber + '@s.whatsapp.net'

  const thumb = 'https://raw.githubusercontent.com/hamm-r/uploader/main/1780377319614-168.jpg'
  const groupLink = 'https://chat.whatsapp.com/Dz7bwckzEUlE8oMN5oFyXQ'

  const caption = `╭─❀「 *OWNER CENTER* 」❀─╮

Haiii @${m.sender.split('@')[0]} 🥜✨

Yoroshiku~!
Aku *KaaOffc*, developer dari *Anya MD* 🌸

Jika menemukan bug, ingin membeli
premium, sewa bot, atau request fitur,
silakan hubungi owner yaa~

👑 *Developer* : KaaOffc
🤖 *Bot Name* : Anya MD
⚡ *Runtime* : Multi Device
🧠 *AI System* : Active
📱 *WhatsApp* : wa.me/${ownerNumber}
💳 *Dana/Gopay* : 081991861685

╰────────────────❀`

  await conn.sendMessage(m.chat, {
    image: { url: thumb },
    caption,
    footer: '© Anya MD by KaaOffc',
    mentions: [m.sender, ownerJid],
    nativeFlow: [
      {
        text: '💌 Chat Owner',
        url: `https://wa.me/${ownerNumber}`
      },
      {
        text: '💳 Salin Dana',
        copy: '081991861685'
      },
      {
        text: '📢 Official Group',
        url: groupLink
      }
    ]
  }, { quoted: m })
}

handler.help = ['owner', 'infoowner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|infoowner|creator)$/i

export default handler