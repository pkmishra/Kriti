Model = require 'models/model'
module.exports = class Chapter extends Model
    defaults:
        name: ''
        title: ''
        summary: ''
    initialize: (options) ->
        super
        book_id: options.book_id
    urlPath: ->
        "/books/#{@get('book_id')}/chapters/"
