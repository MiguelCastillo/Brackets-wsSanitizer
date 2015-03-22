/**
 * White Space Sanitizer Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Based on https://github.com/dsbonev/whitespace-normalizer
 */

define(function (require /*, exports, module*/) {
  'use strict';

  var Commands           = brackets.getModule('command/Commands');
  var CommandManager     = brackets.getModule('command/CommandManager');
  var DocumentManager    = brackets.getModule('document/DocumentManager');
  var Menus              = brackets.getModule('command/Menus');
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var sanitize           = require('src/sanitize');
  var PREFERENCES_KEY    = 'brackets-wsSanitizer';
  var prefs              = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);

  var COMMAND_ID = PREFERENCES_KEY;
  var menu       = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  var command    = CommandManager.register('Whitespace Sanitizer', COMMAND_ID, cmdToggleEnabled);

  menu.addMenuDivider();
  menu.addMenuItem(COMMAND_ID);

  // Wire up preferences system
  prefs.definePreference("enabled", "boolean", "true").on("change", checkEnabled);
  command.setChecked(prefs.get('enabled'));
  checkEnabled();

  function cmdToggleEnabled() {
    prefs.set('enabled', !command.getChecked());
  }

  function checkEnabled() {
    var enabled = prefs.get('enabled');
    command.setChecked(enabled);
    DocumentManager[enabled ? 'on' : 'off']('documentSaved', runSanitizer);
  }

  function runSanitizer(evt, doc) {
    if (prefs.get('enabled')) {
      doc.batchOperation(function () {
        sanitize(doc);

        // We must publish the FILE_SAVE event in the same cycle as sanitization
        // completes to avoid incorrectly saving the document before it is sanitized,
        // which throws Brackets into an infinite saving loop.
        CommandManager.execute(Commands.FILE_SAVE, {doc: doc});
      });
    }
  }
});

