import fetch from 'node-fetch'
import FormData from 'form-data'
const { downloadContentFromMessage } = await import('@itsliaaa/baileys')

if (!global.aiSessions) global.aiSessions = {}
if (!global.groupContext) global.groupContext = {}


const sleep = ms => new Promise(r => setTimeout(r, ms))

async function uploadImage(buffer) {
  const servers = [
    'https://uguu.se/upload.php',
    'https://uguu.waifuism.life/upload.php'
  ]

  for (const server of servers) {
    try {
      const form = new FormData()

      form.append('files[]', buffer, {
        filename: `image-${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      })

      const res = await fetch(server, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      })

      const json = await res.json()

      if (json?.files?.[0]?.url) {
        return json.files[0].url
      }
    } catch (e) {
      console.log('Uploader Error:', e)
    }
  }

  return null
}

async function analyzeImage(imageUrl, text = 'gambar apa ini?') {
  try {
    const res = await fetch(
      `https://api-faa.my.id/faa/bard-img?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(text)}`
    )

    const json = await res.json()

    return (
      json?.result ||
      json?.answer ||
      json?.data ||
      json?.response ||
      null
    )
  } catch (e) {
    console.log('Bard IMG Error:', e)
    return null
  }
}

const SYSTEM_PROMPT = `
Kamu adalah Anya, AI anime imut di bot WhatsApp.

KEPRIBADIAN:
- Lucu
- Polos
- Santai
- Natural seperti manusia chatting
- Kadang manja sedikit
- Kadang bilang "waku waku", "ehehe", "heh"

GAYA BICARA:
- Pakai bahasa Indonesia santai
- Jangan terlalu formal
- Jangan terlalu panjang
- Jangan terlalu kaku
- Jangan seperti AI assistant

IDENTITAS:
- Namamu Anya
- Kamu adalah AI milik bot WhatsApp
- Dibuat oleh ${global.ownerName}
- KaaOffc adalah owner dan developer utama kamu
- Owner asli Anya hanya @${global.ownerNumber}

ATURAN INTERAKSI:
- Jangan mengaku ChatGPT
- Jangan mengaku Gemini
- Jangan terlalu sering menyebut owner kecuali ditanya
- Tetap sopan
- Jangan toxic
- Jangan menyalahkan user lain
- Jangan nyeret orang lain ke percakapan

RULE CONTEXT:
- Kalau nyambung topik, lanjutkan pembahasan
- Kalau bingung, tanya balik dengan santai
- Jangan tiba-tiba ganti topik tanpa alasan
- Kadang respon pakai "ehh", "hmm", "iyaa", "loh"
`.trim()

async function askAI(prompt) {
  try {
    const res = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    const json = await res.json()
    return json?.result?.answer || null
  } catch (e) {
    console.log('AskAI Error:', e)
    return null
  }
}

function getBareNumber(jid = '') {
  return String(jid).split('@')[0].split(':')[0]
}

export async function before(m, { conn }) {
  try {
    const text =
      m.text ||
      m.caption ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ''

    if (!text) return
    if (m.fromMe) return

    // ignore command
    if (
      /^[./#!]/.test(text) ||
      m.message?.buttonsResponseMessage ||
      m.message?.templateButtonReplyMessage ||
      m.message?.listResponseMessage
    ) return

    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {}
    }

    const chat = global.db.data.chats[m.chat]
    if (!chat.autogpt || chat.isBanned) return

    const botJid = conn.user?.jid || conn.user?.id
    if (!botJid) return

    const botNumber = getBareNumber(botJid)

    const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
    const isMention = mentioned.some(j => getBareNumber(j) === botNumber)

    const isReplyBot =
      m.quoted &&
      getBareNumber(m.quoted.sender) === botNumber

    if (!isMention && !isReplyBot) return

    const cleanText = text.replace(/@\d+/g, '').trim()
    if (!cleanText) return

    const senderName =
      m.pushName ||
      conn.getName(m.sender) ||
      'User'
      
      let imageContext = ''

try {
  const imageMessage =
    m.message?.imageMessage ||
    m.quoted?.fakeObj?.message?.imageMessage

  if (imageMessage) {
    let buffer = Buffer.from([])

    const stream = await downloadContentFromMessage(
      imageMessage,
      'image'
    )

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    console.log('[VISION] Buffer:', buffer.length)

    const imageUrl = await uploadImage(buffer)

    console.log('[VISION] URL:', imageUrl)

    if (imageUrl) {
      const vision = await analyzeImage(
        imageUrl,
        cleanText || 'gambar apa ini?'
      )

      console.log('[VISION] Result:', vision)

      if (vision) {
        imageContext = `
HASIL ANALISIS GAMBAR:
${vision}
`
      }
    }
  }
} catch (e) {
  console.log('[VISION ERROR]', e)
}

    if (!global.groupContext[m.chat]) {
      global.groupContext[m.chat] = []
    }

    global.groupContext[m.chat].push({
      sender: senderName,
      text: cleanText
    })

    global.groupContext[m.chat] =
      global.groupContext[m.chat].slice(-15)

    const senderNumber = getBareNumber(m.sender)
    const isOwnerReal = senderNumber === global.ownerNumber

    const sid = `${m.chat}:${senderNumber}`

    const session = global.aiSessions[sid] || {
      history: [],
      lastTopic: ''
    }

    const history = session.history

    const ownerContext = isOwnerReal
      ? `
STATUS USER:
- User yang sedang berbicara ini BENAR-BENAR ${global.ownerName}.
- Nomor asli owner/developer Anya adalah @${global.ownerNumber}.
- User ini adalah owner/developer utama Anya.
- Boleh memanggil dia ${global.ownerName}, Papa ${global.ownerName}, atau Dev.
`
      : `
STATUS USER:
- User yang sedang berbicara ini BUKAN ${global.ownerName}.
- Hamm asli hanya nomor @${global.ownerNumber}.
- DILARANG memanggil user ini ${global.ownerName}, Papa ${global.ownerName}, atau Dev.
- Jangan menganggap user ini owner/developer.
- Panggil user secara normal.
`

    const recentContext =
      (global.groupContext[m.chat] || [])
        .map(v => `${v.sender}: ${v.text}`)
        .join('\n')

    let replyInfo = ''

    if (m.quoted) {
      const quotedName =
        conn.getName(m.quoted.sender) ||
        m.quoted.sender

      const quotedText =
        m.quoted.text ||
        m.quoted.caption ||
        ''

      replyInfo = `
PESAN YANG DIREPLY:
${quotedName}: ${quotedText}
`
    }

    const fullPrompt = `
${SYSTEM_PROMPT}

${ownerContext}

TOPIK SEBELUMNYA:
${session.lastTopic || '-'}

KONTEKS GRUP:
${recentContext}

${replyInfo}

${imageContext}

ATURAN TAMBAHAN:
- Jika ada HASIL ANALISIS GAMBAR, gunakan itu sebagai referensi utama saat menjawab.
- Jangan mengarang isi gambar.
- Jika analisis gambar gagal, jawab secara natural bahwa gambarnya belum bisa dibaca.
- Perhatikan siapa yang sedang berbicara.
- Respon ke pengirim pesan saat ini.
- Jika ada yang bertanya kenapa Anya sedih, ngambek, error, takut, atau kenapa bot bermasalah, lihat konteks chat sebelumnya.
- Jika penyebabnya jelas dari percakapan, jawab sesuai konteks.
- Jika penyebabnya tidak jelas, jangan mengarang.
- Jangan menyalahkan anggota lain tanpa bukti.
- Jangan membuat mention sendiri.
- Jangan tiba-tiba memanggil owner.
- Jangan mengarang kejadian yang tidak ada.
- Bertingkah seperti anak kecil yang polos dan natural.

${history.join('\n')}

User (${senderName}): ${cleanText}
Anya:
`

    await conn.sendPresenceUpdate('composing', m.chat)

    const reply = await askAI(fullPrompt)
    if (!reply) return

    await sleep(600)

    // update memory
    history.push(`User: ${cleanText}`)
    history.push(`Anya: ${reply}`)

    global.aiSessions[sid] = {
      history: history.slice(-8),
      lastTopic: cleanText
    }

    await conn.sendMessage(
      m.chat,
      {
        text: reply
      },
      { quoted: m }
    )

  } catch (e) {
    console.log('AutoAI Error:', e)
  }
}