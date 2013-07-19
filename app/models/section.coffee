Model = require 'models/model'
module.exports = class Section extends Model
    defaults:
        name: ''
        title: ''
        order: 0
        content: ''
    initialize: (options) ->
        super
        book_id : options.book_id
        chapter_id : options.chapter_id
    urlPath: ->
        "/books/#{@get('book_id')}/chapters/#{@get('chapter_id')}/sections/"
