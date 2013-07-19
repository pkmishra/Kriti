Controller = require 'controllers/controller'
mediator = require 'mediator'
eventDefinitions = require 'lib/eventDefinitions'

module.exports = class AuthenticatedController extends Controller
    initialize: (options) ->
        super
        if !mediator.isCurrentUserAuthenticated()
              mediator.publish eventDefinitions.changeRoute, '/home'
