mediator = require 'mediator'
AuthenticatedPageView = require 'views/authenticatedpage_view'
TabView = require 'views/press_tab_view'
SidebarView = require 'views/press_sidebar_view'
ChaptersView = require 'views/chapters_view'
MainView = require 'views/press_main_view'
template = require 'views/templates/press'
Book = require 'models/book'
Chapters = require 'models/chapters'
Section = require 'models/section'
eventDefinitions= require 'lib/eventDefinitions'

module.exports = class PressView extends AuthenticatedPageView
  template: template
  containerSelector:'#main-container'
  autoRender: false #because model change binding event will automatically fire render
  render : ->
      console.log 'PressView#render'
      super
  initialize: (options) ->
      super
    
  renderSubviews:(options) ->
    console.log 'press#renderSubViews', @$el
    #super
    #explicitly passing container below so that html is appened to DOM.###
    @subview 'tabview', new TabView
      container: @$('#press-tabs-container')
      model:null
    @subview 'sidebarview', new SidebarView
      container: @$('#press-sidebar-container')
      model: @model
    @chapterCollection = new Chapters null, {book_id:@model.id, url:@model.url '/chapters/'}
    @chapterCollection.fetch success: _.bind(->
           mediator.publish eventDefinitions.chapterLoad, @chapterCollection.first() if @chapterCollection.length > 0
          ,this)  
    @subview 'chaptersview', new ChaptersView
      container: @$('#press-sidebar-container')
      collection: @chapterCollection
    @subview 'mainview', new MainView
      container: @$("#press-main-container")
      model: new Section null

 
