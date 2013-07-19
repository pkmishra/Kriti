Model = require 'models/model'
mediator = require 'mediator'
eventDefinitions = require 'lib/eventDefinitions'

module.exports = class Navigation extends Model
  defaults:
    items: [
      {href: 'https://github.com/', title: 'Github'},
      {href: 'http://twitter.com', title: 'Twitter'},
    ],
    projectname: 'Kriti'
  initialize: ->
    console.debug 'NavigationModel#initialize'
    super
