ChaplinCollectionView = require 'chaplin/views/collection_view'
require 'lib/view_helper'

module.exports = class CollectionView extends ChaplinCollectionView
    getTemplateFunction: ->
      @template
