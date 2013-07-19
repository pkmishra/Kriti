mediator = require 'mediator'
eventDefinitions = require 'lib/eventDefinitions'
utils = require 'lib/utils'
Twitter = require 'lib/services/twitter'
Facebook = require 'lib/services/facebook'
User = require 'models/user'
Controller = require 'controllers/controller'
LoginView = require 'views/login_view'
router = require 'lib/router'

module.exports = class SessionController extends Controller
  # Service provider instances as static properties
  # This just hardcoded here to avoid async loading of service providers.
  # In the end you might want to do this.
  historyUrl:'logout'
  @serviceProviders =
    twitter: new Twitter(),
    facebook: new Facebook()

  # Was the login status already determined?
  loginStatusDetermined: false

  # This controller governs the LoginView
  loginView: null

  # Current service provider
  serviceProviderName: null

  initialize: ->
    console.debug 'SessionController#initialize'

    # Login flow events
    @subscribeEvent eventDefinitions.loginAttempt, @loginAttempt
    @subscribeEvent eventDefinitions.serviceproviderSessionCreation ,@serviceProviderSession

    # Handle login
    @subscribeEvent eventDefinitions.logout, @logout
    @subscribeEvent eventDefinitions.userDataRetrieved, @userData

    # Handler events which trigger an action

    # Show the login dialog
    @subscribeEvent eventDefinitions.showLogin, @showLoginView
    # Try to login with a service provider
    @subscribeEvent eventDefinitions.loginGlobal, @triggerLogin
    # Initiate logout
    @subscribeEvent eventDefinitions.logoutGlobal, @triggerLogout

    # Determine the logged-in state
    @getSession()

  # Load the JavaScript SDKs of all service providers
  load: ->
    for name, serviceProvider of SessionController.serviceProviders
      serviceProvider.load()
  # Instantiate the user with the given data
  createUser: (userData) ->
    #console.debug 'SessinController#createUser', userData
    user = new User userData
    mediator.setUser user
  # Try to get an existing session from one of the login providers
  getSession: ->
    #console.debug 'SessionController#getSession'
    @load()
    for name, serviceProvider of SessionController.serviceProviders
      serviceProvider.done serviceProvider.getLoginStatus

  # Handler for the global !showLoginView event
  showLoginView: ->
    console.debug 'SessionController#showLoginView'
    #if loginview already exists use that
    if not @loginView
      @load()
      @loginView = new LoginView
        serviceProviders: SessionController.serviceProviders
    @loginView.showView()
  hideLoginView: ->
    #console.debug 'SessionController#hideLoginView'
    return unless @loginView
    @loginView.dispose()
    @loginView = null

  # Handler for the global !login event
  # Delegate the login to the selected service provider
  triggerLogin: (serviceProviderName) =>
    serviceProvider = SessionController.serviceProviders[serviceProviderName]
    #console.debug 'SessionController#triggerLogin', serviceProviderName, serviceProvider

    # Publish an event in case the provider SDK could not be loaded
    unless serviceProvider.isLoaded()
      mediator.publish eventDefinitions.serviceProviderMissing, serviceProviderName
      return

    # Publish a global loginAttempt event
    mediator.publish eventDefinitions.loginAttempt, serviceProviderName

    # Delegate to service provider
    serviceProvider.triggerLogin()

  # Handler for the global loginAttempt event
  loginAttempt: =>
    #console.debug 'SessionController#loginAttempt'

  # Handler for the global serviceProviderSession event
  serviceProviderSession: (session) =>
    # Save the session provider used for login
    @serviceProviderName = session.provider.name

    console.debug 'SessionController#serviceProviderSession', session, @serviceProviderName

    # Hide the login view
    @hideLoginView()

    # Transform session into user attributes and create a user
    session.id = session.userId
    delete session.userId
    @createUser session

    @publishLogin()

  # Publish an event to notify all application components of the login
  publishLogin: ->
    console.debug 'SessionController#publishLogin', mediator.user

    @loginStatusDetermined = true

    # Publish a global login event passing the user
    mediator.publish eventDefinitions.login, mediator.user
    mediator.publish eventDefinitions.loginStatus, true
    # Start Dashboard Controller
    mediator.publish eventDefinitions.changeRoute, '/#dashboard'
  # Logout
  # ------
  destroy : ->
      console.debug 'session#destroy:destroying the session & logging out from service provider'
      mediator.publish eventDefinitions.logoutGlobal
      ## Redirect user to home page
      mediator.publish eventDefinitions.changeRoute, '/#home'

  # Handler for the global !logout event
  triggerLogout: ->
    # Just publish a logout event for now
    mediator.publish eventDefinitions.logout

  # Handler for the global logout event
  logout: =>
    console.debug 'SessionController#logout'

    @loginStatusDetermined = true

    if mediator.user
      # Dispose the user model
      mediator.user.dispose()
      mediator.user.set null

    # Discard the login info
    @serviceProviderName = null

    # Show the login view again
    #@showLoginView()

    mediator.publish eventDefinitions.loginStatus, false
    #start login controller
    #mediator.publish eventDefinitions.startupController, 'home', 'index'
    #mediator.publish eventDefinitions.changeRoute, '/'
  # Handler for the global userData event
  # -------------------------------------

  userData: (data) ->
    #console.debug 'SessionController#userData', data
    mediator.user.set data

# This controller has no custom dispose method since we expect it to
# remain active during the whole application lifecycle. 
