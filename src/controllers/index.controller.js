const indexCtrl = {};

indexCtrl.renderIndex = (req, res) => {
    res.render('partials/index')
};

indexCtrl.renderAnecdotas = (req, res) => {
    res.render('partials/anecdotas')
};

module.exports = indexCtrl;