Model = require 'models/model'
config = require 'config'
module.exports = class Title extends Model
    defaults:
        id: 100110
        title: "First Book Title"
        status: 'In Progress'
        lastModifiedDtTm: '06-04-2012'
        stats: []

