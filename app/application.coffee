mediator = require 'mediator'
ChaplinApplication = require 'chaplin/application'
NavigationController = require 'controllers/navigation_controller'
SessionController = require 'controllers/session_controller'
HomeController = require 'controllers/home_controller'
routes = require 'routes'

# The application bootstrapper.
module.exports = class Application extends ChaplinApplication
  title: 'Example brunch application'

  initialize: ->
    console.debug 'KritiApplication#initialize'

    super # This creates the AppController and AppView

    # Instantiate common controllers
    # ------------------------------

    new SessionController()
    new NavigationController()
    # Initialize the router
    # ---------------------

    # This creates the mediator.router property and
    # starts the Backbone history.
    @initRouter routes, pushState: no

    # Finish
    # ------

    # Freeze the application instance to prevent further changes
    Object.freeze? this
