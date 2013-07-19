mediator = require 'mediator'
AuthenticatedController = require 'controllers/authenticated_controller'
PressView = require 'views/press_view'
Book = require 'models/book'

module.exports = class PressController extends AuthenticatedController
    historyUrl: 'books'
    initialize: (options) ->
        console.log "PressController#initialize"
        super
    index: (data)->
        console.log "PressController#index"
        @model = new Book {_id:data.id}
        @view = new PressView model:@model
        @model.fetch()
