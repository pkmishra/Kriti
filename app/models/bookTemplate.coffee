Model = require 'models/model'
module.exports = class BookTemplate extends Model
    urlPath: ->
        "/templates/book/?default=1&username=admin"
