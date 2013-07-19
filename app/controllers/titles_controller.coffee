mediator = require 'mediator'
Controller = require 'controllers/controller'
TitlesView = require 'views/titles_view'
Titles = require 'models/titles'


module.exports = class TitleController extends Controller
  historyURL: 'titles'
  initialize: (options) ->
        super
        @collection = new Titles()
  index: ->
      if mediator.user && !mediator.user.disposed 
        @view = new TitlesView collection: @collection

