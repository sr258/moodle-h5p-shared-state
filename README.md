# Moodle H5P Shared State Microservice

This is a microservice that runs alongside a Moodle installation and allows
content types to have a shared state.

## Requirements

- NodeJS >= 16
- NPM >= 7

## Installation

- Configure you service with environment variables or .env (see example.env)
- Start the service (`npm ci && npm run build && npm start`)
- Configure Moodle by adding a library configuration in `config.php`
  (change the hostnames according to your setup):

  ```php
  $CFG->mod_hvp_library_config = [
    'H5P.ShareDBTest' => [
        'serverUrl' => 'ws://localhost:3000/shared-state',
        'auth' => $CFG->wwwroot . '/mod/hvp/get_token.php?id='
    ]
  ];
  ```

- Add this to `config.php` to allow multiple uploads of the same library
  version for testing purposes:

  ```php
  $CFG->mod_hvp_dev = true;
  $CFG->mod_hvp_aggregate_assets = true;
  ```

- Start Moodle. Make sure you've set MOODLE_LOGGED_IN_KEY and
  MOODLE_LOGGED_IN_SALT to the same value as used in this microservice!
