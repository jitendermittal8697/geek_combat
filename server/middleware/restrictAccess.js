const redirectUserCallback = (req, res) => {
    if (req.session.userDetails) {
        res.redirect('/chats');
    }
    else {
        res.render('pages/signup');
    }
}

const checkSession = (req, res, next) => {
    if (!req.session.userDetails) {
        res.redirect('/geek-combat');
    }
    else {
        next()
    }
}

module.exports = {
    redirectUserCallback,
    checkSession,
}
