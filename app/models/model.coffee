ChaplinModel = require 'chaplin/models/model'
config = require 'config'
module.exports = class Model extends ChaplinModel
  idAttribute: '_id'
  apiRoot: config.api.root
  urlKey: '_id'
  urlPath: ->
        ''
  urlParams: ->
        
  urlRoot: ->
        urlPath = @urlPath()
        if urlPath
            @apiRoot + urlPath
        else if @collection
            @collection.url()
        else
            throw new Error('Model must redefine urlPath')
    
  url: (data = '') ->
    base = @urlRoot()
    full = if @get(@urlKey)?
      base + encodeURIComponent(@get(@urlKey)) + data
    else
      base + data
    sep = if full.indexOf('?') >= 0 then '&' else '?'
    params = @urlParams()
    if params
      payload = _.keys(params)
          .map (key) ->
            [key, params[key]]
          .filter (pair) ->
            pair[1]?
          .map (pair) ->
            pair.join('=')
          .join('&')
    url = if payload
      full + sep + payload
    else
      full
    url

  fetch: (options) ->
      #@trigger 'loadStart'
      #(options ?= {}).success = =>
      #@trigger 'load'
    super 
