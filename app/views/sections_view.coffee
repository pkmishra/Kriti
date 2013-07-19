mediator = require 'mediator'
CollectionView = require 'views/collection_view'
SectionView = require 'views/section_view'
template = require 'views/templates/sections'
Section = require 'models/section'
BookTemplate = require 'models/bookTemplate'
module.exports = class SectionsView extends CollectionView
  template: template
  id: 'chapter-sections'
  className: 'well sidebar-nav'
  #containerSelector: '#dashboard-content'
  listSelector:'#section-list-container'
  # Fallback content selector
  fallbackSelector: '.fallback'
  # Loading indicator selector
  loadingSelector: '.loading'
  #animationDuration: 0
  initialize: (options)->
    console.debug 'SectionsView#initialize'
    super
    @delegate 'click', '#create-section', @createNewSection 
  render: ->
    console.log 'SectionsView#render', this, @$el
    super
  createNewSection: ->
     bookTemplate = new BookTemplate
     bookTemplate.fetch success: _.bind(->
         section = new Section {book_id: @collection.book_id , chapter_id: @collection.chapter_id}
         section.urlParams = ->
             { 
                 fromTemplate:1, 
                 templateId : bookTemplate.get('_id')
             }
         section.save({}, success: _.bind(->
             #clear the extra params added
             section.urlParams -> 
                 {}
             @collection.add section
         ,this))
     ,this)
  getView: (item) ->
      new SectionView model:item, container: @$("#section-list-container") 

 
