import Builder from 'baileys-mbuilder'

const { AIRich } = Builder

export async function sendSocialMedia(conn, jid, quoted) {
    const pp = 'https://raw.githubusercontent.com/hamm-r/uploader/main/1781490591785-389.jpg'

    return await new AIRich(conn)
        .addPost([
            {
                username: 'Hamdan maulana',
                profile_url: pp,
                title: 'Hamdan maulana',
                subtitle: 'Facebook',
                caption: 'AYO BERTEMAN DI PESNUK',
                verified: true,
                url: 'https://www.facebook.com/share/1KsR3QQfJb/',
                thumbnail: pp,
                source: 'FACEBOOK',
                footer: 'Facebook',
                deeplink: 'https://www.facebook.com/share/1KsR3QQfJb/',
                icon: pp,
                orientation: 'LANDSCAPE',
                post_type: 'PHOTO',
                like: 0,
                comment: 0,
                share: 0
            },
            {
                username: 'rizfivemb06',
                profile_url: 'https://raw.githubusercontent.com/hamm-r/uploader/main/1781490623255-859.jpg',
                title: 'rizfivemb06',
                subtitle: 'Threads',
                caption: 'bukan threads ini tiktok follow tiktok mimin yh',
                verified: true,
                url: 'https://www.tiktok.com/@rizfivemb06',
                thumbnail: 'https://raw.githubusercontent.com/hamm-r/uploader/main/1781490623255-859.jpg',
                source: 'THREADS',
                footer: 'Threads',
                deeplink: 'https://www.tiktok.com/@rizfivemb06',
                icon: 'https://raw.githubusercontent.com/hamm-r/uploader/main/1781490623255-859.jpg',
                orientation: 'LANDSCAPE',
                post_type: 'PHOTO',
                like: 0,
                comment: 0,
                share: 0
            },
            {
                username: 'hamm_cik',
                profile_url: pp,
                title: 'hamm_cik',
                subtitle: 'Instagram',
                caption: 'yoo follow ig gw jga',
                verified: true,
                url: 'https://www.instagram.com/hamm_cik',
                thumbnail: pp,
                source: 'INSTAGRAM',
                footer: 'Instagram',
                deeplink: 'https://www.instagram.com/hamm_cik',
                icon: pp,
                orientation: 'LANDSCAPE',
                post_type: 'PHOTO',
                like: 0,
                comment: 0,
                share: 0
            }
        ])
        .send(jid, { quoted })
}