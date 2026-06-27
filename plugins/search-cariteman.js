const handler = async (m, { conn }) => {
    const users = Object.entries(global.db.data.users || {})
        .filter(([jid]) => jid.endsWith('@s.whatsapp.net'))

    if (!users.length) {
        return m.reply('Tidak ada pengguna yang ditemukan.')
    }

    const [jid, data] = users[Math.floor(Math.random() * users.length)]

    const nomor = jid.split('@')[0]
    const nama = data.name || data.registeredName || 'Teman Baru'

    await m.reply('🔎 Sedang mencari teman...')

    setTimeout(() => {
        m.reply('✅ Berhasil mendapatkan satu orang!')
    }, 3000)

    setTimeout(async () => {
        await conn.sendContact(
            m.chat,
            [[nomor, nama]], // <- format yang diminta sendContact
            m
        )
    }, 5000)
}

handler.help = ['cariteman', 'caridoi']
handler.tags = ['search']
handler.command = /^(cariteman|caridoi)$/i

export default handler