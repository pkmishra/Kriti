mediator = require 'mediator'
View = require 'views/view'
eventDefinitions = require 'lib/eventDefinitions'
module.exports = class AuthenticatedPageView extends View
  renderedSubviews: no
  containerSelector: '#main-container'

  initialize: ->
    super
    #we want the View to be initialized so things won't break but stop further execution therefore 
    #keeping the check after super
    if !mediator.isCurrentUserAuthenticated()
        return
    if @model or @collection
      rendered = no
      #if Model changes all the subviews must re-render therefore
      #passing 'yes' as parameter
      @modelBind 'change', =>
        @render(yes) unless rendered
        rendered = yes

  renderSubviews: ->
    return

  render: (option)->
    #we do not want anything to render if not authenticatd therefore putting the check before super
    if !mediator.isCurrentUserAuthenticated()
        return
    super
    unless @renderedSubviews and !option
      @renderSubviews()
      @renderedSubviews = yes
