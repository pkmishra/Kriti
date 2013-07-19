Collection = require 'models/collection'
Chapter = require 'models/chapter'
config = require 'config'

module.exports = class Chapters extends Collection
 model : Chapter
 initialize : (models, options)->
     super
     @book_id = options.book_id if options?.book_id?
