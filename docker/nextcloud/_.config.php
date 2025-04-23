<?php
$CONFIG = [
  'trusted_domains' => [
    'localhost',
    '*.localhost',
    # Make Nextcloud accessible to itself in the docker network.
    'caddy',
    $_ENV['HOSTNAME'],
  ],

  /*
   * The start of the 4-hour maintenance window
   * 22-02 UTC -> 01-05 MSK
   */
  'maintenance_window_start' => 22,

  'default_timezone' => 'MSK',
  'reduce_to_languages' => ['en', 'ru'],
  'default_phone_region' => 'RU',

  'check_for_working_wellknown_setup' => false,

  'profile.enabled' => false,
  'allow_user_to_change_display_name' => false,
  'enforce_theme' => 'default',
  'defaultapp' => 'files',
  'skeletondirectory' => '/var/empty/',

  'user_backends' => array(
    array(
        'class' => '\OCA\UserExternal\BasicAuth',
        'arguments' => array($_ENV['NEXTCLOUD_CHALLENGE_URL']),
    ),
  ),
  # 'hide_login_form' => true,
  'remember_login_cookie_lifetime' => 60 * 60,
  'session_lifetime' => 60 * 60,

  # Temporary
  'auth.bruteforce.protection.enabled' => false,

  'overwritewebroot' => $_ENV['NEXTCLOUD_PREFIX'],

  'upgrade.disable-web' => true,
];
