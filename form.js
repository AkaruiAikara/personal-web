const submitData = () => {
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const phone = document.getElementById('phone').value
    const subject = document.getElementById('subject').value
    const message = document.getElementById('message').value
    let skill = ""
    if (document.getElementById('html').checked) {
        skill += document.getElementById('html').value
        skill += " "
    }
    if (document.getElementById('css').checked) {
        skill += document.getElementById('css').value
        skill += " "
    }
    if (document.getElementById('js').checked) {
        skill += document.getElementById('js').value
    }

    switch (true) {
        case (!name && !email && !phone && !message):
            return alert('Semua field wajib diisi')
        case !name:
            return alert('Nama tidak boleh kosong')
        case !email:
            return alert('Email tidak boleh kosong')
        case !phone:
            return alert('Nomor telepon tidak boleh kosong')
        case !message:
            return alert('Pesan tidak boleh kosong')
        case !skill:
            return alert('Skill tidak boleh kosong')
        default:
            let a = document.createElement('a')
            a.href = `mailto:fallahandyprakasa26@gmail.com?subject=${subject}&body=Dear Fallah%0A%0A${message}%0A%0ASkill: ${skill}%0A%0AFeedback on%0AEmail: ${email}%0APhone: ${phone}%0A%0ARegards,%0A${name}`
            return a.click()
            // return alert(`Nama: ${name}\nEmail: ${email}\nTelepon: ${phone}\nSubject: ${subject}\nMessage: ${message}\nSkill ${skill}`)
    }

    // window.location.href = `mailto:fallahandyprakasa26@gmail.com?subject=${subject}&body=Dear Fallah%0A%0A${message}%0A%0AContact Me:%0AEmail: ${email}%0APhone: ${phone}%0A%0ARegards,%0A${name}`
}