Collection = require 'models/collection'
Section = require 'models/section'
config = require 'config'

module.exports = class Sections extends Collection
  model : Section 
  initialize : (models, options)->
     super
     @book_id = options.book_id if options?.book_id?
     @chapter_id = options.chapter_id if options?.chapter_id?
