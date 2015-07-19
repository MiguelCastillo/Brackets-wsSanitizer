/**
 * White Space Sanitizer Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Based on https://github.com/dsbonev/whitespace-normalizer
 */

define(function (require) {
  'use strict';

  var AppInit            = brackets.getModule('utils/AppInit');
  var EditorManager      = brackets.getModule('editor/EditorManager');
  var Commands           = brackets.getModule('command/Commands');
  var CommandManager     = brackets.getModule('command/CommandManager');
  var DocumentManager    = brackets.getModule('document/DocumentManager');
  var ModalBar           = brackets.getModule('widgets/ModalBar').ModalBar;
  var Menus              = brackets.getModule('command/Menus');
  var LanguageManager    = brackets.getModule('language/LanguageManager');
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var sanitize           = require('src/sanitize');
  var notificationTmpl   = require('text!html/notification.html');
  var PREFERENCES_KEY    = 'brackets-wsSanitizer';
  var prefs              = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);

  var SPACE_UNITS  = 'spaceUnits';
  var TAB_SIZE     = 'tabSize';
  var USE_TAB_CHAR = 'useTabChar';

  var AUTO_SAVE    = PREFERENCES_KEY + '.autosave';
  var ENABLED      = PREFERENCES_KEY + '.enabled';
  var NOTIFICATION = PREFERENCES_KEY + '.notification';
  var NEWLINE      = PREFERENCES_KEY + '.newline';


  // Keeps track of current state information
  var lastUseTab;
  var lastEnabled;
  var lastNotification;
  var lastNewLine;
  var lastAutosave;
  var modalBar;

  var COMMAND_ID = PREFERENCES_KEY;
  var menu       = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  var command    = CommandManager.register('Whitespace Sanitizer', COMMAND_ID, cmdToggleEnabled);

  menu.addMenuDivider();
  menu.addMenuItem(COMMAND_ID);


  // Add default preferences
  prefs.definePreference('autosave', 'boolean', true);
  prefs.definePreference('notification', 'boolean', true);
  prefs.definePreference('enabled', 'boolean', true);
  prefs.definePreference('newline', 'boolean', true);
  command.setChecked(getEnabledPreference());


  function cmdToggleEnabled() {
    setEnabledPreference(!command.getChecked());
    showNotification();
  }


  function sanitizeDocument(doc) {
    doc = doc || getCurrentDocument();

    if (!getAutosavePreference()) {
      showNotification(doc);
      return;
    }

    // Close notification... We are just about to fix any inconsistencies
    // anyways...
    closeNotification();

    if (!doc.__saving && !isDocumentConsistent(doc)) {
      doc.__saving = true;
      doc.addRef();
      doc.batchOperation(function() {
        if (sanitize(doc, getSanitizePreferences(doc))) {
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
  }


  /**
   * Method that checks if the document needs to be sanitized.
   * A document can only be sanitized if sanitizer is enabled
   * and there are white space inconsistencies in the document.
   */
  function isDocumentConsistent(doc) {
    var settings;
    var consistent = false;

    if (!getEnabledPreference()) {
      return true;
    }

    doc = doc || getCurrentDocument();

    if (doc) {
      settings = getSanitizePreferences(doc);

      doc.addRef();
      consistent = sanitize.verify(doc, settings);
      doc.releaseRef();
    }

    return consistent;
  }


  function showNotification(doc) {
    closeNotification();

    doc = doc || getCurrentDocument();

    if (isDocumentConsistent(doc)) {
      return false;
    }

    if (!doc || !getNotificationPreference()) {
      return false;
    }

    // Prompt to fix the document
    modalBar = new ModalBar(notificationTmpl, false);
    modalBar.getRoot()
      .on('click', '#yes-sanitize', function() {
        var settings = getSanitizePreferences(doc);

        closeNotification();

        doc.addRef();
        doc.batchOperation(function() {
          sanitize(doc, settings);
          doc.releaseRef();
        });
      })
      .on('click', '#no-sanitize', function() {
        closeNotification();
      })
      .on('click', '#disable-sanitize', function() {
        closeNotification();
        setNotificationPreference(false);
      });

    return true;
  }


  function closeNotification() {
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


  function getAutosavePreference() {
    return getPreference(AUTO_SAVE);
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


  function getSanitizePreferences(doc) {
    doc = doc || getCurrentDocument();
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
      showNotification();
    }
  });


  PreferencesManager.on('change', NEWLINE, function newlineChanged() {
    var newline = getNewLinePreference();

    if (newline !== lastNewLine) {
      lastNewLine = newline;
      showNotification();
    }
  });


  PreferencesManager.on('change', AUTO_SAVE, function autosaveChanged() {
    var autosave = getAutosavePreference();

    if (autosave !== lastAutosave) {
      lastAutosave = autosave;
    }
  });


  PreferencesManager.on('change', USE_TAB_CHAR, function useTabsChcnaged() {
    var useTabs = getPreference(USE_TAB_CHAR);

    if (useTabs !== lastUseTab) {
      lastUseTab = useTabs;
      showNotification();
    }
  });


  AppInit.appReady(function() {
    DocumentManager.on('documentSaved', function(evt, doc) {
      sanitizeDocument(doc);
    });

    EditorManager.on('activeEditorChange.wsSanitizer', function(evt, editor) {
      if (editor) {
        showNotification(editor.document);
      }
    });

    showNotification();
  });
});
