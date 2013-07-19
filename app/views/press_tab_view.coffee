mediator = require 'mediator'
View = require 'views/view'
eventDefinitions = require 'lib/eventDefinitions'
template = require 'views/templates/press_tab'

module.exports = class PressTabView extends View
  template:template
  autoRender:true
  containerSelector: '#press-tabs-container'
  initialize: (options) ->
    super
    @delegate 'click', '.nav-tabs li', @tabClickHandler
  render : ->
      console.log 'PressTabView#render', @$el
      super
  tabClickHandler: (event) ->
    mediator.publish eventDefinitions.tabChange, event.currentTarget
