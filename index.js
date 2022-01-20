const express = require('express'),
      flash = require('express-flash'),
      session = require('express-session'),
      bcrypt = require('bcrypt'),
      db = require('./connection/db'),
      upload = require('./middlewares/fileUpload'),
      hbs = require('hbs'),
      fs = require('fs'),
      path = require('path'),
      app = express(),
      PORT = 5000;

db.connect()

app.set('view engine', 'hbs')
app.engine('hbs', hbs.__express)

app.use('/public', express.static(__dirname + '/public'))
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(flash())
app.use(express.json()); 
app.use(express.urlencoded({
    extended: false
}))
app.use(
    session({
        cookie: {
            maxAge: 2 * 60 * 60 * 1000, // 2 jam
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: 'secretValue'
    })
)


app.get('/', (req, res) => {
    db.query('SELECT * FROM tb_exp', (err, result) => {
        if (err) throw err;
        res.render('index', {experiences: result.rows, isLogin: req.session.isLogin, user: req.session.user})
    })
})

app.post('/', (req, res) => {
    if (!req.session.isLogin) {
        res.flash('danger', 'Login first to access this!')
        return res.redirect('/')
    }
    const {experience, year} = req.body
    if (!experience || !year) {
        req.flash('danger', 'Please fill all column!')
        return res.redirect('/')
    }
    db.query(`INSERT INTO tb_exp(experience, year) VALUES ($1, $2)`, [experience, year], (err, result) => {
        if (err) throw err;
        req.flash('success', 'An experience has been added')
        res.redirect('/')
    })
})

app.get('/login', (req, res) => {
    if (req.session.isLogin) {
        res.redirect('back')
    } else {
        res.render('login')
    }
})

app.get('/register', (req, res) => {
    if (req.session.isLogin) {
        res.redirect('back')
    } else {
        res.render('register')
    }
})

app.get('/logout', (req, res) => {
    req.session.isLogin = null, req.session.user = null;
    res.redirect('back')
})

app.post('/login', (req, res) => {
    const {email, password} = req.body
    db.query(`SELECT * FROM tb_user WHERE email = '${email}'`, (err, result) => {
        if (err) throw err;
        if (!result.rows[0]) {
            req.flash('danger', 'Email or password incorrect!')
            req.flash('email', email)
            return res.redirect('/login')
        }
        if (bcrypt.compareSync(password, result.rows[0].password)) {
            req.session.isLogin = true
            req.session.user = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email
            }
            req.flash('success', `Welcome back ${result.rows[0].name}!`)
            res.redirect('/blog')
        } else {
            req.flash('danger', 'Email or password incorrect!')
            req.flash('email', email)
            res.redirect('/login')
        }
    })
})

app.post('/register', (req, res) => {
    const {name, email, password} = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)
    db.query(`INSERT INTO tb_user(name, email, password) VALUES ('${name}', '${email}', '${hashedPassword}')`, (err, result) => {
        if (err) throw err;
        req.flash('success', `${name} has been registered! Try login`)
        res.redirect('/login')
    })
})

app.get('/blog', (req, res) => {
    const query = `SELECT tb_blog.id, tb_blog."authorId", tb_blog.title, tb_blog.image, tb_blog.content, tb_blog."postAt", tb_blog.slug, tb_user.name AS author FROM tb_blog LEFT JOIN tb_user ON tb_blog."authorId" = tb_user.id;`
    db.query(query, (err, result) => {
        if (err) throw err;
        res.render('blog', {
            datapost: result.rows,
            isLogin: req.session.isLogin,
            user: req.session.user
        })
    })
})

app.get('/blog/:slug', (req, res) => {
    const query = `SELECT tb_blog.id, tb_blog."authorId", tb_blog.title, tb_blog.image, tb_blog.content, tb_blog."postAt", tb_blog.slug, tb_user.name AS author FROM tb_blog LEFT JOIN tb_user ON tb_blog."authorId" = tb_user.id WHERE slug = '${req.params.slug}';`
    db.query(query, (err, result) => {
        if (err) throw err;
        
        res.render('blog-detail', {datapost: result.rows[0], isLogin: req.session.isLogin, user: req.session.user})
    })
})

app.post('/blog/delete', function (req, res) {
    const {slug, image} = req.body
    fs.unlink(path.join(__dirname, 'uploads') + '/' + image, (err) => {
        if (err) throw err;
    })
    db.query(`DELETE FROM tb_blog WHERE slug = '${slug}'`, (err, _) => {
        if (err) throw err;
        req.flash('success', 'Post has been deleted')
        res.redirect('/blog')
    })
})

app.post('/contact', (req, res) => {
    const {name, email, phone, subject, messages, skills} = req.body;

    switch (true) {
        case (!name && !email && !phone && !messages):
            req.flash('danger', 'All fields must be filled!')
            res.redirect('back')
            break
        case !name:
            req.flash('danger', 'Name field must be provided!')
            res.redirect('back')
            break
        case !email:
            req.flash('danger', 'Email field must be provided!')
            res.redirect('back')
            break
        case !phone:
            req.flash('danger', 'Phone field must be provided!')
            res.redirect('back')
            break
        case !messages:
            req.flash('danger', 'Messages field must be provided!')
            res.redirect('back')
            break
        default:
            req.flash('success', 'Redirected to your Email app')
            res.redirect(`mailto:fallahandyprakasa26@gmail.com?subject=${subject}&body=Dear Fallah%0A%0A${messages}%0A%0ASkill: ${skills.join(', ')}%0A%0AFeedback on%0AEmail: ${email}%0APhone: ${phone}%0A%0ARegards,%0A${name}`)
    }
})

app.post('/blog', upload.single('imagefile'), (req, res) => {
    const {title, content} = req.body
    if (!title || !content) {
        req.flash('danger', 'Please fill all fields!')
        return res.redirect('/blog')
    }
    if (!req.file) {
        req.flash('danger', 'Please choose a image!')
        return res.redirect('/blog')
    }
    const slug = title.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '');
    const authorId =  req.session.user.id
    const image = req.file.filename

    const query = `INSERT INTO tb_blog(title, content, image, "authorId", slug) 
    VALUES ('${title}', '${content}', '${image}', '${authorId}', '${slug}')`

    db.query(query, (err, _) => {
        if (err) throw err;
        req.flash('success', 'Post has been created')
        res.redirect('/blog')
    })
});

app.post('/blog/edit', upload.single('imagefile'), (req, res) => {
    const {slug, title, content, image} = req.body
    if (!title || !content) {
        req.flash('danger', 'Please fill all fields!')
        return res.redirect('/blog')
    }
    let query = ''
    if (req.file) {
        const newimage = req.file.filename
        fs.unlink(path.join(__dirname, 'uploads') + '/' + image, (err) => {
            if (err) throw err;
        })
        query = `UPDATE tb_blog SET title = '${title}', content = '${content}', image = '${newimage}' WHERE slug = '${slug}'`
    } else {
        query = `UPDATE tb_blog SET title = '${title}', content = '${content}' WHERE slug = '${slug}'`
    }

    db.query(query, (err, _) => {
        if (err) throw err;
        req.flash('success', 'Post has been updated')
        res.redirect('/blog')
    })
})

hbs.registerHelper('getFullTime', (time) => {
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des']
    const date = time.getDate()
    const month = monthName[time.getMonth()]
    const year = time.getFullYear()
    const hour = time.getHours()
    let minute = `${time.getMinutes()}`
    if (minute.length < 2) {
        minute = `0${minute}`
    }
    return `${date} ${month} ${year} ${hour}:${minute} WIB`
});

hbs.registerHelper('getDistanceTime', (time) => {
    const timepost = time
    const timenow = new Date()

    let result = ''
    let distancetime = timenow - timepost
    distancetime = Math.floor(distancetime / 1000)

    if (distancetime < 10) {
        result = `Recently posted`
    }
    if (distancetime < 60) {
        result = `${distancetime} second(s) ago`
    }
    if (distancetime > 60) {
        distancetime = Math.floor(distancetime / 60)
        result = `${distancetime} minute(s) ago`
        if (distancetime > 60) {
            distancetime = Math.floor(distancetime / 60)
            result = `${distancetime} hour(s) ago`
            if (distancetime > 24) {
                distancetime = Math.floor(distancetime / 24)
                result = `${distancetime} day(s) ago`
                if (distancetime > 30) {
                    distancetime = Math.floor(distancetime / 30)
                    result = `${distancetime} month(s) ago`
                    if (distancetime > 12) {
                        distancetime = Math.floor(distancetime / 12)
                        result = `${distancetime} year(s) ago`
                    }
                }
            }
        }
    }
    return result;

})

hbs.registerHelper('ifCond', (v1, v2, options) => {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})