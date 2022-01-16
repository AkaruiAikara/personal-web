const express = require('express'),
      db = require('./connection/db'),
      hbs = require('hbs'),
      fs = require('fs'),
      path = require('path'),
      app = express(),
      formidable = require('formidable'),
      PORT = 5099;

let isLogin = true;

db.connect()

app.set('view engine', 'hbs')
app.engine('hbs', hbs.__express)

app.use('/public', express.static(__dirname + '/public'))
app.use('/storage', express.static(__dirname + '/storage'))
app.use(express.json()); 
app.use(express.urlencoded({
    extended: false
}))

app.get('/', (_, res) => {
    res.render('index')
})

app.get('/blog', (_, res) => {
    db.query('SELECT * FROM tb_blog', (err, result) => {
        if (err) throw err;
        res.render('blog', {datapost: result.rows, isLogin})
    })
})

app.get('/blog/:slug', (req, res) => {
    db.query(`SELECT * FROM tb_blog`, (err, result) => {
        if (err) throw err;
        res.render('blog-detail', {datapost: result.rows, slugurl: req.params.slug})
    })
})

app.post('/blog/delete/:slug', function (req, res) {
    let slug = req.params.slug
    db.query(`DELETE FROM tb_blog WHERE slug = '${slug}'`, (err, result) => {
        if (err) throw err;
        res.redirect('/blog')
    })
})

app.post('/', (req, res) => {
    const name = req.body.name,
          email = req.body.email,
          phone = req.body.phone,
          subject = req.body.subject,
          messages = req.body.messages;

    let skills = req.body.skills,
        alert = '',
        success = false;

    switch (true) {
        case (!name && !email && !phone && !messages):
            alert = 'All fields must be filled!'
            break
        case !name:
            alert = 'Name field must be provided!'
            break
        case !email:
            alert = 'Email field must be provided!'
            break
        case !phone:
            alert = 'Phone field must be provided!'
            break
        case !messages:
            alert = 'Messages field must be provided!'
            break
        case !skills:
            alert = 'Skills field must be provided!'
            break
        default:
            res.redirect(`mailto:fallahandyprakasa26@gmail.com?subject=${subject}&body=Dear Fallah%0A%0A${messages}%0A%0ASkill: ${skills.join(', ')}%0A%0AFeedback on%0AEmail: ${email}%0APhone: ${phone}%0A%0ARegards,%0A${name}`)
            alert = 'Redirected to your Email app'
            success = true
    }

    return res.render('index', {
        alert, success
    })
})

app.post('/blog', (req, res, next) => {
    const form = formidable({ multiples: true });
  
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const oldPath = files.imagefile.filepath,
              newPath = path.join(__dirname, 'storage') + '/' + files.imagefile.newFilename,
              rawData = fs.readFileSync(oldPath);
      
        fs.writeFile(newPath, rawData, (err) => {
            if(err) console.log(err)
        })
        let msg = '',
            status = false;


        if (fields.slug) {
            let slug = fields.slug
            let title = fields.title
            let content = fields.content
            if (files.imagefile.size) {
                let image = '../storage/' + files.imagefile.newFilename
                db.query(`UPDATE tb_blog SET title = $1, content = $2, image = $3 WHERE slug = $4`, [title, content, image, slug], (err, result) => {
                    if (err) throw err;
                    res.redirect('/blog')
                })
            } else {
                db.query(`UPDATE tb_blog SET title = $1, content = $2 WHERE slug = $3`, [title, content, slug], (err, result) => {
                    if (err) throw err;
                    res.redirect('/blog')
                })
            }
            // msg = 'Post has been updated'
            // status = true
            // res.redirect('/blog')
        } else {
            switch (true) {
                case (!fields.title && !fields.content && !files.imagefile.size):
                    msg = 'All fields are required!'
                    break;
                case !fields.title:
                    msg = 'Titles are required!'
                    break;
                case !fields.content:
                    msg = 'Content are required!'
                    break;
                case !files.imagefile.size:
                    msg = 'Image are required!'
                default:
                    let title = fields.title
                    let image = '../storage/' + files.imagefile.newFilename 
                    let content = fields.content
                    let slug = fields.title.toLowerCase()
                                .replace(/ /g, '-')
                                .replace(/[^\w-]+/g, '');
                    db.query(`INSERT INTO tb_blog("authorId", title, image, content, slug)
                        VALUES (2, '${title}', '${image}', '${content}', '${slug}')`)
                    msg = 'Post has been created'
                    status = true
                    res.redirect('blog')
            }
            // res.render('blog', {
            //     datapost, status, msg, isLogin
            // })
        }
    });
  });

const getFullTime = (time) => {
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
}

hbs.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})