mediator = require 'mediator'
utils = require 'lib/utils'
eventDefinitions = require 'lib/eventDefinitions'
ServiceProvider = require 'lib/services/service_provider'

module.exports = class Twitter extends ServiceProvider
  consumerKey = 'w0uohox9lTgpKETJmscYIQ'
  name: 'twitter'

  constructor: ->
    super
    @subscribeEvent eventDefinitions.logoutGlobal, @logoutFromTwitter

  load: ->
    return if @state() is 'resolved' or @loading
    @loading = true

    utils.loadLib "http://platform.twitter.com/anywhere.js?id=#{consumerKey}&v=1", @sdkLoadHandler, @reject

  sdkLoadHandler: =>
    @loading = false
    # Init the SDK, then resolve
    twttr.anywhere (T) =>
      mediator.publish eventDefinitions.serviceProviderSDKLoaded
      @T = T
      @resolve()

  isLoaded: ->
    # Return a Boolean
    Boolean window.twttr

  publish: (event, callback) ->
    @T.trigger event, callback

  subscribe: (event, callback) ->
    @T.bind event, callback

  unsubscribe: (event) ->
    @T.unbind event

  # Trigger login popup
  triggerLogin: (loginContext) ->
    callback = _(@loginHandler).bind(this, loginContext)
    @T.signIn()
    @subscribe eventDefinitions.serviceProviderAuthComplete, (event, currentUser, accessToken) ->
      callback {currentUser, accessToken}
    @subscribe eventDefinitions.serviceProviderSignOut, ->
      console.log 'SIGNOUT EVENT'
      callback()

  # Publish session & userData events and
  # add all twttr api methods to @api.
  publishSession: (response) ->
    user = response.currentUser

    mediator.publish eventDefinitions.serviceproviderSessionCreation,
      provider: this
      userId: user.id
      accessToken: response.accessToken or twttr.anywhere.token
    mediator.publish eventDefinitions.userDataRetrieved, user.attributes

  # Callback for the login popup
  loginHandler: (loginContext, response) =>
    console.debug 'Twitter#loginHandler', loginContext, response
    if response
      # Publish successful login
      mediator.publish eventDefinitions.serviceProviderSuccessfulLogin,
        provider: this, loginContext: loginContext

      # Publish the session
      @publishSession response
    else
      mediator.publish eventDefinitions.serviceProviderFailedLogin, provider: this, loginContext: loginContext

  getLoginStatus: (callback = @loginStatusHandler, force = false) ->
    console.debug 'Twitter#getLoginStatus'
    callback @T

  loginStatusHandler: (response) =>
    console.debug 'Twitter#loginStatusHandler', response
    if response.currentUser
      @publishSession response
    else
      mediator.publish eventDefinitions.logout

  # Handler for the global logout event
  logoutFromTwitter: ->
    console.log 'Twitter#logout'
    twttr?.anywhere?.signOut?()
