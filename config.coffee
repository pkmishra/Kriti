exports.config =
  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  files:
    javascripts:
      defaultExtension: 'coffee'
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
      order:
        before: [
          'vendor/scripts/console-helper.js',
          'vendor/scripts/jquery-1.7.2.js',
          'vendor/scripts/jquery.blockUI-2.4.2.js',
          'vendor/scripts/underscore-1.3.3.js',
          'vendor/scripts/backbone-0.9.2.js',
          'vendor/scripts/wysihtml5-0.3.0.js'
        ]
        after: [
         # Twitter Bootstrap jquery plugins
          'vendor/scripts/bootstrap/bootstrap-transition.js',
          'vendor/scripts/bootstrap/bootstrap-alert.js',
          'vendor/scripts/bootstrap/bootstrap-button.js',
          'vendor/scripts/bootstrap/bootstrap-carousel.js',
          'vendor/scripts/bootstrap/bootstrap-collapse.js',
          'vendor/scripts/bootstrap/bootstrap-dropdown.js',
          'vendor/scripts/bootstrap/bootstrap-modal.js',
          'vendor/scripts/bootstrap/bootstrap-tooltip.js',
          'vendor/scripts/bootstrap/bootstrap-popover.js',
          'vendor/scripts/bootstrap/bootstrap-scrollspy.js',
          'vendor/scripts/bootstrap/bootstrap-tab.js',
          'vendor/scripts/bootstrap/bootstrap-typeahed.js',
          'vendor/scripts/bootstrap-wysihtml5.js'
        ]

    stylesheets:
      defaultExtension: 'css'
      joinTo: 'stylesheets/app.css'
      order:
        before: [
            'vendor/styles/bootstrap/bootstrap-wysihtml5.css'
            'vendor/styles/bootstrap/bootstrap.css'
            'vendor/styles/bootstrap/bootstrap-responsive.css'
        ]

    templates:
      defaultExtension: 'hbs'
      joinTo: 'javascripts/app.js'

  framework: 'chaplin'
