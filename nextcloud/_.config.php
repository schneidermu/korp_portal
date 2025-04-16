<?php
$CONFIG = [
  'trusted_domains' => [
    'localhost',
    '*.localhost',
    # Make Nextcloud accessible to itself in the docker network.
    'web',
  ],

  /* The start of the 4-hour maintenance window
   * 22-02 UTC -> 01-05 MSK
   */
  'maintenance_window_start' => 22,

  'default_timezone' => 'MSK',
  'reduce_to_languages' => ['en', 'ru'],
  'default_phone_region' => 'RU',

  'profile.enabled' => false,

  'user_backends' => array(
    array(
        'class' => '\OCA\UserExternal\BasicAuth',
        'arguments' => array('http://loggy:8080'),
    ),
  ),
];
