mediator = require 'mediator'
AuthenticatedPageView = require 'views/authenticatedpage_view'
template = require 'views/templates/chapter'
SectionsView = require 'views/sections_view'
Sections = require 'models/sections'
eventDefinitions = require 'lib/eventDefinitions'
module.exports = class ChapterView extends AuthenticatedPageView
  template: template
  className: 'accordion-group'
  autoRender: false #because model change binding event will automatically fire render
  render : ->
      console.log 'ChapterView#render'
      super
  initialize: ->
    console.debug 'ChapterView#initialize'
    super
  renderSubviews:(options) ->
    console.log 'chapter#renderSubViews', @$el
    @sectionCollection = new Sections null, {chapter_id: @model.get('_id'), book_id: @model.get('book_id'), url: @model.url '/sections/'}
    @sectionCollection.fetch success: _.bind(->
        mediator.publish eventDefinitions.sectionLoad, @sectionCollection.first() if @sectionCollection.length > 0
    , this)
    chapterid = @model.get('_id')
    @subview 'sectionsview', new SectionsView
      container: @$('#section-container-' + chapterid)
      collection: @sectionCollection


