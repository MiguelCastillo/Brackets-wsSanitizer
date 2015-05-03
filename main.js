/**
 * White Space Sanitizer Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Based on https://github.com/dsbonev/whitespace-normalizer
 */

define(function (require) {
  'use strict';

  var AppInit            = brackets.getModule("utils/AppInit");
  var EditorManager      = brackets.getModule("editor/EditorManager");
  var Commands           = brackets.getModule('command/Commands');
  var CommandManager     = brackets.getModule('command/CommandManager');
  var DocumentManager    = brackets.getModule('document/DocumentManager');
  var Menus              = brackets.getModule('command/Menus');
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var sanitize           = require('src/sanitize');
  var PREFERENCES_KEY    = 'brackets-wsSanitizer';
  var prefs              = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);

  var SPACE_UNITS        = "spaceUnits";
  var TAB_SIZE           = "tabSize";
  var USE_TAB_CHAR       = "useTabChar";


  var COMMAND_ID = PREFERENCES_KEY;
  var menu       = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  var command    = CommandManager.register('Whitespace Sanitizer', COMMAND_ID, cmdToggleEnabled);

  menu.addMenuDivider();
  menu.addMenuItem(COMMAND_ID);

  // Wire up preferences system
  prefs.definePreference("onopen",  "boolean", false);
  prefs.definePreference("enabled", "boolean", true).on("change", checkEnabled);
  command.setChecked(prefs.get('enabled'));
  checkEnabled();

  function cmdToggleEnabled() {
    prefs.set('enabled', !command.getChecked());
  }

  var lastEnabled;
  function checkEnabled() {
    var enabled = prefs.get('enabled');
    if (enabled !== lastEnabled) {
      lastEnabled = enabled;
      command.setChecked(enabled);
      DocumentManager[enabled ? 'on' : 'off']('documentSaved', runSanitizer);
    }
  }


  var currentTime;
  function runSanitizer(evt, doc) {
    var rnd = Math.floor(Math.random() * 1000);
    console.log("1. ====> Skip save", rnd, doc.__saving);
    if (doc.__saving) {
      console.log("1.5 =====> Returning early...", rnd);
      return;
    }
    console.log("2. =====> Still running", rnd, doc.__saving);
    doc.__saving = true;
    console.log("3. =====> Saving now set to ", rnd, doc.__saving);
    doc.batchOperation(function () {
      console.log("4. =====> Saving in batch set to ", rnd, doc.__saving);
      var oldText = doc.getText();
      sanitize(doc);
      var newText = doc.getText();
      console.log("5. ====> Trigger save", rnd, oldText === newText, doc.__saving);

      currentTime = (new Date()).getTime();
      console.log("6. ====> Setting timeout", rnd);
      setTimeout(function() {
        console.log("7. ====> Timeout triggered", rnd, (new Date()).getTime() - currentTime);
        CommandManager.execute(Commands.FILE_SAVE, {doc: doc})
          .always(function() {
            setTimeout(function() {
              console.log("8. =====> Deleting 'saving' flag", rnd);
              delete doc.__saving;
            });
          });
      }, 2000);
    });
  }


  function setDocument(evt, editor) {
    if (editor && prefs.get("onopen") === true) {
      var doc = editor.document;
      doc.batchOperation(function () {
        var settings = getPreferences(doc);
        sanitize(doc, settings.useTabChar, settings.size);
      });
    }
  }


  function getPreferences(doc) {
    var preferencesContext = doc.file.fullPath;
    var useTabChar         = PreferencesManager.get(USE_TAB_CHAR, preferencesContext);
    var tabSize            = PreferencesManager.get(TAB_SIZE, preferencesContext);
    var spaceUnit          = PreferencesManager.get(SPACE_UNITS, preferencesContext);
    return {
      useTabChar: useTabChar,
      size: useTabChar ? tabSize : spaceUnit
    };
  }


  AppInit.appReady(function() {
    EditorManager.on("activeEditorChange.wsSanitizer", setDocument);
    setDocument(null, EditorManager.getActiveEditor());
  });
});
