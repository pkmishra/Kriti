mediator = require 'mediator'
eventDefinitions = require 'lib/eventDefinitions'
utils = require 'lib/utils'
AuthenticatedPageView = require 'views/authenticatedpage_view'
template = require 'views/templates/dashboard'
TitlesView = require 'views/titles_view'
Books = require 'models/books'
Book = require 'models/book'
BookTemplate = require 'models/bookTemplate'
module.exports = class DashboardView extends AuthenticatedPageView
  template: template
  id: 'dashboard-container'
  className: 'dashboard-container'
  containerSelector: '#main-container'
  containerMethod:'html'
  autoRender: true
  initialize: (options) ->
    console.debug "Dashboard#initialize"
    super
    @delegate 'click', '#create-new-book', @createNewBook
    
  renderSubviews:(options) ->
      console.log 'dashboard#renderSubViews', @$el
      super
      @collection = new Books null
      @collection.fetch()
      #explicitly passing container below so that html is appened to DOM.
      @subview 'titlesview', new TitlesView 
        collection: @collection,
        container: @$("#dashboard-content")
  createNewBook: ->
      bookTemplate = new BookTemplate
      #we meed to use bind method for callback
      #essentially unless we have templateId we can not create book and unless book is not saved
      #we cannot add it to collection
      bookTemplate.fetch success: _.bind(->
          book = new Book
          bookUrl = book.url '?fromTemplate=1&templateId='+bookTemplate.get '_id'
          book.url = bookUrl
          book.save {}, success: _.bind((book, resp)->
             @collection.push book
           ,this)
         ,this)  

