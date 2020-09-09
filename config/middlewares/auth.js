module.exports = {
    requiresLogin: (req, res, next) => {
        if (req.user) return next();
        //res.sendStatus(401);
        res.redirect('/403');
    },
};
