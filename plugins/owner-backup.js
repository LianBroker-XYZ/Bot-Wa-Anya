import fs from 'fs'
import archiver from 'archiver'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const root = process.cwd()
    const tmpDir = path.join(root, 'tmp')
    const tmpFile = path.join(tmpDir, 'file')

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(tmpFile)) fs.writeFileSync(tmpFile, 'tmp active')

    await m.reply(`
🌸 *Anya sedang menyiapkan backup...* 📦

Tunggu sebentar yaa~
Waku waku~ ✨
`.trim())

    const date = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })

    const backupName = `Anya-MD-${date}.zip`

    const output = fs.createWriteStream(backupName)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    archive.pipe(output)

    archive.glob('**/*', {
      cwd: root,
      ignore: [
        'node_modules/**',
        'sessions/**',
        '.npm/**',
        backupName
      ]
    })

    archive.directory(tmpDir, 'tmp')

    output.on('close', async () => {
      try {
        const groupLink = global.backupGroupLink // 🔥 pakai link grup

        if (!groupLink) {
          return m.reply('❌ Belum ada global.backupGroupLink')
        }

        // ambil kode invite dari link
        const code = groupLink.split('/').pop()

        // ambil info grup dari invite link
        const data = await conn.groupGetInviteInfo(code)
        const groupJid = data.id

        const size = (archive.pointer() / 1024 / 1024).toFixed(2)

        const caption = `
🌸 *ANYA MD BACKUP*

Waku waku~! 👀✨

📁 *File* : ${backupName}
📦 *Ukuran* : ${size} MB
📅 *Tanggal* : ${date}

Backup berhasil dibuat oleh Anya! 🥜💕
`.trim()

        await conn.sendFile(
          groupJid,
          backupName,
          backupName,
          caption
        )

        await m.reply(`
✅ *Backup berhasil dikirim ke grup!*

🌸 Anya sudah selesai~ ✨
`.trim())

        fs.existsSync(backupName) && fs.unlinkSync(backupName)
      } catch (e) {
        console.error(e)
        m.reply('❌ Gagal kirim ke grup dari link invite')
      }
    })

    archive.finalize()

  } catch (e) {
    console.error(e)
    m.reply(`
❌ *Backup gagal!*

📄 Error:
${e.message}

Anya sedih... 🥺
`.trim())
  }
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^backup$/i
handler.owner = true

export default handler