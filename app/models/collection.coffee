ChaplinCollection = require 'chaplin/models/collection'
Model = require 'models/model'

module.exports = class Collection extends ChaplinCollection
    model: Model

    initialize: (models, options)->
       if options?.url?
          @url = -> 
            options.url         
        super

