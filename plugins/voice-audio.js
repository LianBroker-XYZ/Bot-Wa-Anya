import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

let handler = async (m, { conn, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/^audio\//.test(mime)) {
    return m.reply('Balas audio atau VN dengan command ini')
  }

  try {
    await m.react('🎵')

    let audio = await q.download()
    if (!audio) throw 'Gagal mengunduh audio'

    let set = ''

    if (/bass/i.test(command))
      set = '-af "equalizer=f=94:width_type=o:width=2:g=30"'

    else if (/blown/i.test(command))
      set = '-af "acrusher=.1:1:64:0:log"'

    else if (/deep/i.test(command))
      set = '-af "atempo=1,asetrate=44500*2/3"'

    else if (/earrape/i.test(command))
      set = '-af "volume=12"'

    else if (/fast/i.test(command))
      set = '-filter:a "atempo=1.63,asetrate=44100"'

    else if (/fat/i.test(command))
      set = '-filter:a "atempo=1.6,asetrate=22100"'

    else if (/nightcore/i.test(command))
      set = '-filter:a "atempo=1.06,asetrate=44100*1.25"'

    else if (/reverse/i.test(command))
      set = '-filter_complex "areverse"'

    else if (/robot/i.test(command))
      set =
        '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'

    else if (/slow/i.test(command))
      set = '-filter:a "atempo=0.7,asetrate=44100"'

    else if (/smooth/i.test(command))
      set = '-af "afftdn=nf=-25,volume=1.1"'

    else if (/tupai|squirrel|chipmunk/i.test(command))
      set = '-filter:a "atempo=0.5,asetrate=65100"'

    else if (/vibra/i.test(command))
      set = '-filter_complex "vibrato=f=15"'

    if (!set) return m.reply('Efek tidak dikenali')

    let tmp = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })

    const ext =
      mime.includes('ogg') ? 'ogg' :
      mime.includes('wav') ? 'wav' :
      mime.includes('flac') ? 'flac' :
      mime.includes('aac') ? 'aac' :
      mime.includes('mpeg') ? 'mp3' :
      mime.includes('mp4') ? 'm4a' :
      'audio'

    let input = path.join(tmp, `${Date.now()}.${ext}`)
    let output = path.join(tmp, `${Date.now()}_vn.ogg`)

    await fs.promises.writeFile(input, audio)

    let ffmpegCmd =
      `ffmpeg -y -i "${input}" ${set} -vn -map_metadata -1 -ar 48000 -ac 1 -c:a libopus -b:a 128k "${output}"`

    exec(ffmpegCmd, async (err) => {
      await fs.promises.unlink(input).catch(() => {})

      if (err) {
        console.error(err)
        return m.reply('Gagal memproses audio')
      }

      try {
        let buff = await fs.promises.readFile(output)

        await conn.sendMessage(
          m.chat,
          {
            audio: buff,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          },
          { quoted: m }
        )

        await fs.promises.unlink(output).catch(() => {})
        await m.react('✅')
      } catch (e) {
        console.error(e)
        m.reply('Gagal mengirim audio')
      }
    })
  } catch (e) {
    console.error(e)
    m.reply(String(e))
  }
}

handler.help = [
  'bass',
  'blown',
  'deep',
  'earrape',
  'fast',
  'fat',
  'nightcore',
  'reverse',
  'robot',
  'slow',
  'smooth',
  'tupai',
  'vibra'
]

handler.tags = ['voice']

handler.command = /^(bass|blown|deep|earrape|fast|fat|nightcore|reverse|robot|slow|smooth|tupai|squirrel|chipmunk|vibra)$/i

export default handler