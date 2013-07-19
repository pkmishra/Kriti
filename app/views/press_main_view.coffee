mediator = require 'mediator'
View = require 'views/view'
eventDefinitions = require 'lib/eventDefinitions'
template = require 'views/templates/press_main'

module.exports = class PressMainView extends View
    template:template
    autoRender:true #render event will be fired once sections are loaded
    editorRendered: false
    containerMethod:'html'
    initialize: (options) ->
        super
        mediator.subscribe eventDefinitions.tabChange, @tabChangeHandler
        #mediator.subscribe eventDefinitions.chapterLoad, @chapterLoadHandler
        mediator.subscribe eventDefinitions.sectionLoad, @sectionLoadHandler
        @delegate 'submit', (event) =>
            event.preventDefault()
            @saveHandler()


    tabChangeHandler : (target) ->
      console.log 'PressMainview#tabClickHandler'
     #following code is not required because data-toogle has been used in templates
     #event.currentTarget holds reference to the item clicked
     #$(event.currentTarget).tab 'show'
    render : ->
      console.log 'PressMainView#render', @$el
      super
    chapterLoadHandler : (chapter)->
      @model = chapter
      $("#book-editor").wysihtml5() unless @editorRendered
      $("#book-editor").val chapter.get "name"
      @editorRendered = true
    sectionLoadHandler : (section)->
        #@model = section
        #if !@editorRendered
        $("#book-editor").wysihtml5() 
        $("#book-editor").val section.get "name"
        #unsubscribe because we just care of first event
        mediator.unsubscribe eventDefinitions.sectionLoad
    saveHandler: ->
      @model.save name: @$("#book-editor").val()

