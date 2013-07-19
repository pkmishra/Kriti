Model = require 'models/model'
config = require 'config'
Chapters = require 'models/chapters'
Sections = require 'models/sections'
module.exports = class Book extends Model
    defaults:
        title: 'Sample Title'
        subtitle: 'Sample Subtitle'
        author: ''
        status: 'in-progress'
        toc: {}
        cover: {}
        version: '0.0.1'
        metadata: {}
        
    urlPath: ->
        "/books/"

