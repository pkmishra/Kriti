mediator = require 'mediator'
View = require 'views/view'
template = require 'views/templates/section'

module.exports = class SectionView extends View
  template: template
  tagName: 'li'

  initialize: ->
    console.debug 'SectionView#initialize'
    super
  render: ->
      console.debug 'SectionView#render', this, @$el
      super
