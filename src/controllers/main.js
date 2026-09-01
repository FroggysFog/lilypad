const mainController = {}

mainController.index = function (req, res) {
  return res.redirect('/login.html')
}

module.exports = mainController
