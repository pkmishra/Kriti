Model = require 'models/model'
mediator = require 'mediator'
module.exports = class User extends Model
    isAuthenticated :->
        return mediator.user && !mediator.user.disposed
