const redirectUserCallback = (req, res) => {
    if (req.session.userDetails) {
        res.redirect('/chats');
    }
    else {
        res.render('pages/signup');
    }
}


module.exports = {
    redirectUserCallback
}
