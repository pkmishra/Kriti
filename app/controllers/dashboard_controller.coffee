mediator = require 'mediator'
AuthenticatedController = require 'controllers/authenticated_controller'
DashboardView = require 'views/dashboard_view'

module.exports = class DashboardController extends AuthenticatedController
  historyURL: 'dashboard'

  index: ->
          @view = new DashboardView()
      

