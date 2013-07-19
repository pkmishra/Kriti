mediator = require 'mediator'
Controller = require 'controllers/controller'
HomeView = require 'views/home_view'
eventDefinitions = require 'lib/eventDefinitions'

module.exports = class HomeController extends Controller
  historyURL: 'home'

  initialize: ->
    console.debug "HomeController#initialize"
    super
  index: -> 
    console.log 'HomeController#index'
    @view = new HomeView()

