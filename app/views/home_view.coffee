template = require 'views/templates/home'
View = require 'views/view'

module.exports = class HomeView extends View
  template: template
  containerSelector: '#main-container'
  containerMethod: 'html'
  autoRender: yes

  initialize: ->
    super
