module.exports = (match) ->
  match '', 'home#index'
  match 'home', 'home#index'
  match 'login', 'session#showLoginView'
  match 'dashboard', 'dashboard#index'
  match 'logout', 'session#destroy'
  match 'titles', 'titles#index'
  match 'books/:id/:title', 'press#index'
