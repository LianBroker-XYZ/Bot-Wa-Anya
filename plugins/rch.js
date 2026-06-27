import axios from 'axios'

const tokens = [
  '2977998a1e03b24c9421c8220cc8d9ad7fa56a757e00d0a8c98bbec207e0c4c7'
]

let currentTokenIndex = 0

async function reactToPost(postUrl, emojis) {
  let attempts = 0
  const maxAttempts = tokens.length

  while (attempts < maxAttempts) {
    const apiKey = tokens[currentTokenIndex]

    try {
      const { data } = await axios({
        method: 'POST',
        url: `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post?apiKey=${apiKey}`,
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json',
          origin: 'https://asitha.top',
          referer: 'https://asitha.top/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
        },
        data: {
          post_link: postUrl,
          reacts: Array.isArray(emojis) ? emojis : [emojis]
        }
      })

      return {
        success: true,
        data
      }
    } catch (e) {
      const err = e.response?.data || e.message

      if (
        e.response?.status === 402 ||
        String(err?.message || '').toLowerCase().includes('limit')
      ) {
        currentTokenIndex = (currentTokenIndex + 1) % tokens.length
        attempts++
        continue
      }

      return {
        success: false,
        error: err
      }
    }
  }

  return {
    success: false,
    error: 'All tokens are limited'
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Contoh:\n${usedPrefix + command} https://whatsapp.com/channel/xxxx 😀\n\n${usedPrefix + command} https://whatsapp.com/channel/xxxx 😀 😂 ❤️`
    )
  }

  const args = text.trim().split(/\s+/)

  const url = args.shift()

  if (!/^https?:\/\/(www\.)?whatsapp\.com\/channel\//i.test(url)) {
    return m.reply('❌ Link channel WhatsApp tidak valid.')
  }

  const emojis = args.length ? args : ['👍']

  await m.reply('⏳ Sedang mengirim reaction...')

  const result = await reactToPost(url, emojis)

  if (!result.success) {
    return m.reply(
      `❌ Gagal mengirim reaction.\n\n${JSON.stringify(result.error, null, 2)}`
    )
  }

  const res = result.data

  await conn.reply(
    m.chat,
    `✅ Reaction berhasil dikirim!

🔗 URL:
${url}

🎭 Emoji:
${emojis.join(' ')}

📦 Response:
${JSON.stringify(res, null, 2)}`,
    m
  )
}

handler.help = ['reactch', 'rch']
handler.tags = ['tools']

handler.command = /^(reactch|rch)$/i

handler.limit = true

export default handler