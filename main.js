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

  function runSanitizer(evt, doc) {
    console.log("====> Skip save", doc.__saving);
    if (doc.__saving) {
      return;
    }

    doc.__saving = true;
    doc.batchOperation(function () {
      var settings = getPreferences(doc);
      var oldText = doc.getText();
      sanitize(doc, settings.useTabChar, settings.size);
      var newText = doc.getText();

      console.log("====> Trigger save", oldText === newText, doc.__saving);

      setTimeout(function() {
        CommandManager.execute(Commands.FILE_SAVE, {doc: doc})
          .always(function() {
            delete doc.__saving;
          });
      });
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
