let blogs = []

const addBlog = (e) => {
    e.preventDefault();
    
    let title = document.getElementById('input-blog-title').value
    let content = document.getElementById('input-blog-content').value
    let image = document.getElementById('input-blog-image').files
    let postAt = new Date()
    let author = 'Fallah Andy Prakasa'

    image = URL.createObjectURL(image[0])

    let blog = {
        title,
        content,
        image,
        postAt,
        author
    }

    blogs.push(blog)
    return renderBlog()
}

const renderBlog = () => {
    
    let contents = document.getElementById('contents')
    
    contents.innerHTML = ''
    if (blogs.length === 0) {
        contents.innerHTML = '<h1>No post found</h1>'
    }
    for (let i = 0; i < blogs.length; i++) {
        contents.innerHTML += `
                <div class="blog-list-item">
                <div class="blog-image">
                    <img src="${blogs[i].image}" alt="" />
                </div>
                <div class="blog-content">
                    <div class="btn-group">
                    <button class="btn-edit">Edit Post</button>
                    <button class="btn-post">Post Blog</button>
                    </div>
                    <h1>
                    <a href="blog-detail.html" target="_blank"
                        >${blogs[i].title}</a
                    >
                    </h1>
                    <div class="detail-blog-content">
                    ${getFullTime(blogs[i].postAt)} | ${blogs[i].author}
                    </div>
                    <div class="detail-blog-content" id="distance-time">
                    ${getDistanceTime(blogs[i].postAt)}
                    </div>
                    <p>
                    ${blogs[i].content}
                    </p>
                </div>
                </div>
            `
    }
}

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

const getDistanceTime = (time) => {
    const timepost = time
    const timenow = new Date()

    let distancetime = timenow - timepost
    distancetime = Math.floor(distancetime / 1000)

    if (distancetime < 10) {
        return `Recently posted`
    } 
    
    if (distancetime < 60) {
        return `${distancetime} second(s) ago`
    }

    if (distancetime > 60) {
        distancetime = Math.floor(distancetime / 60)
        return `${distancetime} minute(s) ago`
    }
    
    if (distancetime > 60) {
        distancetime = Math.floor(distancetime / 60)
        return `${distancetime} hour(s) ago`
    }
    
    if (distancetime > 24) {
        distancetime = Math.floor(distancetime / 24)
        return `${distancetime} day(s) ago`
    }

    if (distancetime > 30) {
        distancetime = Math.floor(distancetime / 30)
        return `${distancetime} month(s) ago`
    }

    if (distancetime > 12) {
        distancetime = Math.floor(distancetime / 12)
        return `${distancetime} year(s) ago`
    }

}

setInterval(() => {
    renderBlog()
    console.log('ok')
}, 1000)