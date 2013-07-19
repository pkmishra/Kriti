mediator = require 'mediator'
CollectionView = require 'views/collection_view'
TitleView = require 'views/title_view'
template = require 'views/templates/titles'

module.exports = class TitlesView extends CollectionView
  template: template
  id: 'titleTable'
  tagName: 'table'
  className: 'table table-bordered'
  #containerSelector: '#dashboard-content'
  listSelector:'#titleTableContent'
  # Fallback content selector
  fallbackSelector: '.fallback'
  # Loading indicator selector
  loadingSelector: '.loading'
  #animationDuration: 0

  initialize: ->
    console.debug 'TitlesView#initialize'
    super
    #@subscribeEvent 'loginStatus', @rende
    #@subscribeEvent 'startupController', @render
  render: ->
    console.log 'TitlesView#render', this, @$el
    super

  getView: (item) ->
      new TitleView model:item

 
