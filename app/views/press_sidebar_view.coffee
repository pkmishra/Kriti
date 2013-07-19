mediator = require 'mediator'
View = require 'views/view'
eventDefinitions = require 'lib/eventDefinitions'
template = require 'views/templates/press_sidebar'

module.exports = class PressSidebarView extends View
    template:template
    autoRender:true
    fallbackSelector: '.fallback'
    loadingSelector: '.loading'
    initialize: (options) ->
        super
        mediator.subscribe eventDefinitions.tabChange, @tabChangeHandler
    tabChangeHandler : (target) ->
       console.log 'PressSidebarView#tabClickHandler'
     #following code is not required because data-toogle has been used in templates
     #event.currentTarget holds reference to the item clicked
     #$(event.currentTarget).tab 'show'
    render : ->
      console.log 'PressSidebarView#render', @$el
      super


