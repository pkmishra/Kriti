mediator = require 'mediator'
View = require 'views/view'
template = require 'views/templates/navigation'
eventDefinitions = require 'lib/eventDefinitions'

module.exports = class TopNavView extends View
  template: template
  containerSelector: '#navigation-container'
  autoRender: true

  initialize: ->
    console.log('TopNavView#initialized')
    super
    #following subscription rerenders the view
    @subscribeEvent eventDefinitions.loginStatus, @render


