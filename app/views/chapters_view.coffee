mediator = require 'mediator'
CollectionView = require 'views/collection_view'
ChapterView = require 'views/chapter_view'
template = require 'views/templates/chapters'
Chapter = require 'models/chapter'
BookTemplate = require 'models/bookTemplate'

module.exports = class ChaptersView extends CollectionView
  template: template
  id: 'book-chapters'
  className: 'well sidebar-nav'
  #containerSelector: '#dashboard-content'
  listSelector:'#chapter-list-container'
  # Fallback content selector
  fallbackSelector: '.fallback'
  # Loading indicator selector
  loadingSelector: '.loading'
  autoRender: false
  #animationDuration: 0
  initialize: (options)->
    console.debug 'ChaptersView#initialize'
    super
    @delegate 'click', '#add-chapter' , @createNewChapter
  render: ->
    console.log 'ChaptersView#render', this, @$el
    super
  # following needs to be fine tuned further
  createNewChapter: ->
     bookTemplate = new BookTemplate
     bookTemplate.fetch success: _.bind(->
         chapter = new Chapter {book_id: @collection.book_id}
         chapter.urlParams = ->
             { 
                 fromTemplate:1, 
                 templateId : bookTemplate.get('_id')
             }
         chapter.save({}, success: _.bind(->
             #clear the extra params added
             chapter.urlParams -> 
                 {}
             @collection.add chapter
         ,this))
     ,this)
  getView: (item) ->
      new ChapterView model:item, container: @$("#chapter-list-container") 

 
