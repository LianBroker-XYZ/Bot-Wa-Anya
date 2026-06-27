setInterval(async () => {
  if (!global.db?.sewa) return

  const now = Date.now()

  for (const [jid, data] of Object.entries(global.db.sewa)) {
    if (!data?.expired) continue

    const sisa = data.expired - now

    try {
      // WARNING 24 JAM
      if (sisa <= 86400000 && !data.warned['24h'] && sisa > 3600000) {
        await global.conn.sendMessage(jid, {
          text: '📢 Sewa bot akan habis dalam 24 jam!'
        })
        data.warned['24h'] = true
      }

      // WARNING 1 JAM
      if (sisa <= 3600000 && !data.warned['1h'] && sisa > 600000) {
        await global.conn.sendMessage(jid, {
          text: '⚠️ Sewa bot akan habis dalam 1 jam!'
        })
        data.warned['1h'] = true
      }

      // EXPIRED → AUTO LEAVE
      if (sisa <= 0) {
        await global.conn.sendMessage(jid, {
          text: '❌ Masa sewa habis. Bot keluar dari grup.'
        })

        await global.conn.groupLeave(jid)

        delete global.db.sewa[jid]
      }

    } catch (e) {
      console.log(e)
    }
  }
}, 60000)