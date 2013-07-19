Collection = require 'models/collection'
Title = require 'models/title'
config = require 'config'
module.exports = class Titles extends Collection
 @model = Title
 initialize: ->
     super
     @add new Title id:1
     @add new Title id:2
