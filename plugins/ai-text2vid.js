import axios from 'axios'

let handler = async (m, {
    conn,
    text
}) => {
    if (!text) {
        return m.reply(
            'Contoh:\n.text2vid cewe cantik sedang masak'
        )
    }

    try {
        await m.react('🕒')

        const {
            data
        } = await axios.get(
            'https://api.theresav.biz.id/ai/text2vid', {
                params: {
                    prompt: text,
                    apikey: 'qKdov'
                }
            }
        )

        if (!data?.status || !data?.result?.video_url) {
            throw new Error('Video gagal dibuat')
        }

        const caption = [
            '🎬 Text To Video',
            '',
            `📝 Prompt: ${data.result.prompt}`,
            `🔞 Safe: ${data.result.safe ? 'Yes' : 'No'}`
        ].join('\n')

        await conn.sendMessage(
            m.chat, {
                video: {
                    url: data.result.video_url
                },
                caption
            }, {
                quoted: m
            }
        )

        await m.react('✅')
    } catch (e) {
        console.log(JSON.stringify(e?.response?.data || e))

        await m.react('❌')
        await m.reply(
            e?.response?.data?.message ||
            e?.message ||
            'Terjadi kesalahan'
        )
    }
}

handler.help = ['text2vid <prompt>']
handler.tags = ['ai']
handler.command = ['text2vid', 't2v']
handler.limit = true

export default handler