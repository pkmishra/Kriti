Collection = require 'models/collection'
Book = require 'models/book'
config = require 'config'

module.exports = class Books extends Collection
 url : -> 
     config.api.root + '/books/'
 model : Book
