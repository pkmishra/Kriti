Controller = require 'controllers/controller'
mediator = require 'mediator'
Navigation = require 'models/navigation'
NavigationView = require 'views/navigation_view'
User = require 'models/user'

module.exports = class NavigationController extends Controller
    historyURL: ''
    initialize: ->
      console.debug 'NavigationController#initialize'
      super
      @model = new Navigation
      @view = new NavigationView model: @model
