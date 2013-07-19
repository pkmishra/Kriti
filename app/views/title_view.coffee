mediator = require 'mediator'
View = require 'views/view'
template = require 'views/templates/title'

module.exports = class TitleView extends View
  template: template
  tagName: 'tr'
  #id: 'title-content'
  #containerSelector:'#titleTableContent'
  #autoRender: true
  #containerMethod: 'append'

  initialize: ->
    console.debug 'TitleView#initialize'
    super
    #@subscribeEvent 'loginStatus', @render
    #@subscribeEvent 'startupController', @render
  render: ->
      console.debug 'TitleView#render', this, @$el
      super
