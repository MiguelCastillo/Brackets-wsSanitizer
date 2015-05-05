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
  var ModalBar           = brackets.getModule("widgets/ModalBar").ModalBar;
  var Menus              = brackets.getModule('command/Menus');
  var LanguageManager    = brackets.getModule('language/LanguageManager');
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var sanitize           = require('src/sanitize');
  var notificationTmpl   = require('text!html/notification.html');
  var PREFERENCES_KEY    = 'brackets-wsSanitizer';
  var prefs              = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);

  var SPACE_UNITS  = "spaceUnits";
  var TAB_SIZE     = "tabSize";
  var USE_TAB_CHAR = "useTabChar";

  var ENABLED      = PREFERENCES_KEY + "." + "enabled";
  var NOTIFICATION = PREFERENCES_KEY + "." + "notification";
  var NEWLINE      = PREFERENCES_KEY + "." + "newline";


  // Keeps track of current state information
  var lastUseTab;
  var lastEnabled;
  var lastNotification;
  var lastNewLine;
  var modalBar;

  var COMMAND_ID = PREFERENCES_KEY;
  var menu       = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  var command    = CommandManager.register('Whitespace Sanitizer', COMMAND_ID, cmdToggleEnabled);

  menu.addMenuDivider();
  menu.addMenuItem(COMMAND_ID);


  // Add default preferences
  prefs.definePreference("notification", "boolean", true);
  prefs.definePreference("enabled", "boolean", true);
  prefs.definePreference("newline", "boolean", true);
  command.setChecked(getEnabledPreference());


  function cmdToggleEnabled() {
    setEnabledPreference(!command.getChecked());
  }


  function handleDocumentSave(evt, doc) {
    if (doc.__saving) {
      return;
    }

    var enabled = getEnabledPreference();
    if (!enabled) {
      //
      // If we are saving the document, but sanitizing it on save is not
      // enabled we want to try to verify the document because:
      // 1. The document may have been manually fixed.
      // 2. The document may have been changed and made inconsistent.
      //
      verifyDocument();
      return;
    }

    // Before sanitizing the document, let's close the modal bar...
    // No need to show it if we are going to clean up the document
    closeModalBar();

    doc.addRef();
    doc.__saving = true;
    doc.batchOperation(function() {
      var settings = getSanitizePreferences(doc);

      if (sanitize(doc, settings)) {
        setTimeout(function() {
          CommandManager.execute(Commands.FILE_SAVE, {doc: doc})
            .always(function() {
              delete doc.__saving;
              doc.releaseRef();
            });
        });
      }
      else {
        delete doc.__saving;
        doc.releaseRef();
      }
    });
  }


  function verifyDocument() {
    closeModalBar();

    var doc = getCurrentDocument();
    var notification = getNotificationPreference();
    if (!doc || !notification) {
      return;
    }

    var settings = getSanitizePreferences();
    if (sanitize.verify(doc, settings)) {
      return;
    }

    modalBar = new ModalBar(notificationTmpl, false);
    modalBar.getRoot()
      .on('click', '#yes-sanitize', function() {
        closeModalBar();
        doc.batchOperation(function() {
          sanitize(doc, settings);
        });
      })
      .on('click', '#no-sanitize', function() {
        closeModalBar();
      })
      .on('click', '#disable-sanitize', function() {
        closeModalBar();
        setNotificationPreference(false);
      });
  }


  function closeModalBar() {
    if (modalBar) {
      modalBar.close();
      modalBar = null;
    }
  }


  function getCurrentDocument() {
    var editor = EditorManager.getCurrentFullEditor();
    return editor && editor.document;
  }


  function getEnabledPreference() {
    return getPreference(ENABLED);
  }


  function setEnabledPreference(value) {
    return setPreference(ENABLED, value);
  }


  function getNotificationPreference() {
    return getPreference(NOTIFICATION);
  }


  function setNotificationPreference(value) {
    return setPreference(NOTIFICATION, value);
  }


  function getNewLinePreference() {
    return getPreference(NEWLINE);
  }


  function getPreference(name) {
    var doc     = getCurrentDocument();
    var context = doc && _buildPreferencesContext(doc.file.fullPath);
    return PreferencesManager.get(name, context);
  }


  function setPreference(name, value) {
    var doc     = getCurrentDocument();
    var options = doc && {context: doc.file.fullPath};
    return PreferencesManager.set(name, value, options);
  }


  function getSanitizePreferences() {
    var doc        = getCurrentDocument();
    var context    = doc && _buildPreferencesContext(doc.file.fullPath);
    var useTab     = PreferencesManager.get(USE_TAB_CHAR, context);
    var tabSize    = PreferencesManager.get(TAB_SIZE,     context);
    var spaceUnit  = PreferencesManager.get(SPACE_UNITS,  context);
    var addNewLine = PreferencesManager.get(NEWLINE,      context);

    return {
      useTab: useTab,
      units: useTab ? tabSize : spaceUnit,
      addNewLine: addNewLine
    };
  }


  function _buildPreferencesContext(fullPath) {
    var languageId = fullPath ? LanguageManager.getLanguageForPath(fullPath).getId() : undefined;
    return PreferencesManager._buildContext(fullPath, languageId);
  }


  PreferencesManager.on('change', ENABLED, function enabledChanged() {
    var enabled = getEnabledPreference();

    if (enabled !== lastEnabled) {
      lastEnabled = enabled;
      command.setChecked(enabled);
    }
  });


  PreferencesManager.on('change', NOTIFICATION, function enabledChanged() {
    var notification = getNotificationPreference();

    if (notification !== lastNotification) {
      lastNotification = notification;
      verifyDocument();
    }
  });


  PreferencesManager.on('change', NEWLINE, function newlineChanged() {
    var newline = getNewLinePreference();

    if (newline !== lastNewLine) {
      lastNewLine = newline;
      verifyDocument();
    }
  });


  PreferencesManager.on('change', USE_TAB_CHAR, function useTabsChcnaged() {
    var useTabs = getPreference(USE_TAB_CHAR);

    if (useTabs !== lastUseTab) {
      lastUseTab = useTabs;
      verifyDocument();
    }
  });


  AppInit.appReady(function() {
    DocumentManager.on("documentSaved", handleDocumentSave);
    EditorManager.on("activeEditorChange.wsSanitizer", verifyDocument);
    verifyDocument();
  });
});
