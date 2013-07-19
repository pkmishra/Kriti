config = {api: {}}

production = false

config.api.root = if production
  'http://api.myapp.com'
else
  'http://127.0.0.1:8181'

config.api.versionRoot = config.api.root + '/v1'

module.exports = config
