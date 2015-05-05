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


  // Keeps track of current state information
  var lastUseTab;
  var lastEnabled;
  var lastOnOpen;
  var modalBar;

  var COMMAND_ID = PREFERENCES_KEY;
  var menu       = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  var command    = CommandManager.register('Whitespace Sanitizer', COMMAND_ID, cmdToggleEnabled);

  menu.addMenuDivider();
  menu.addMenuItem(COMMAND_ID);


  // Wire up preferences system
  prefs.definePreference("onopen",  "boolean", true);
  prefs.definePreference("enabled", "boolean", true);
  command.setChecked(getEnabledPreference());


  function cmdToggleEnabled() {
    setEnabledPreference(!command.getChecked());
  }


  function handleDocumentSave(evt, doc) {
    if (doc.__saving) {
      return;
    }

    doc.addRef();
    doc.__saving = true;
    doc.batchOperation(function() {
      var settings = getTabPreferences(doc);

      if (sanitize(doc, settings.useTab, settings.units)) {
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


  function handleDocumentOpen() {
    closeModalBar();

    var doc = getCurrentDocument();
    var onopen = getOnOpenPreference();
    if (!doc || !onopen) {
      return;
    }

    var settings = getTabPreferences();
    if (sanitize.verify(doc, settings.useTab, settings.units)) {
      return;
    }

    modalBar = new ModalBar(notificationTmpl, false);
    modalBar.getRoot()
      .on('click', '#yes-sanitize', function() {
        closeModalBar();
        doc.batchOperation(function() {
          sanitize(doc, settings.useTab, settings.units);
        });
      })
      .on('click', '#no-sanitize', function() {
        closeModalBar();
      })
      .on('click', '#disable-sanitize', function() {
        closeModalBar();
        setOnOpenPreference(false);
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
    var doc     = getCurrentDocument();
    var context = doc && _buildPreferencesContext(doc.file.fullPath);
    return PreferencesManager.get("brackets-wsSanitizer.enabled", context);
  }


  function setEnabledPreference(value) {
    var doc     = getCurrentDocument();
    var options = doc && {context: doc.file.fullPath};
    return PreferencesManager.set("brackets-wsSanitizer.enabled", value, options);
  }


  function getOnOpenPreference() {
    var doc     = getCurrentDocument();
    var context = doc && _buildPreferencesContext(doc.file.fullPath);
    return PreferencesManager.get("brackets-wsSanitizer.onopen", context);
  }


  function setOnOpenPreference(value) {
    var doc     = getCurrentDocument();
    var options = doc && {context: doc.file.fullPath};
    return PreferencesManager.set("brackets-wsSanitizer.onopen", value, options);
  }


  function getTabPreferences() {
    var doc       = getCurrentDocument();
    var context   = doc && _buildPreferencesContext(doc.file.fullPath);
    var useTab    = PreferencesManager.get(USE_TAB_CHAR, context);
    var tabSize   = PreferencesManager.get(TAB_SIZE,     context);
    var spaceUnit = PreferencesManager.get(SPACE_UNITS,  context);

    return {
      useTab: useTab,
      units: useTab ? tabSize : spaceUnit
    };
  }


  function _buildPreferencesContext(fullPath) {
    var languageId = fullPath ? LanguageManager.getLanguageForPath(fullPath).getId() : undefined;
    return PreferencesManager._buildContext(fullPath, languageId);
  }


  PreferencesManager.on('change', "brackets-wsSanitizer.enabled", function enabledChanged() {
    var enabled = getEnabledPreference();

    if (enabled !== lastEnabled) {
      lastEnabled = enabled;
      command.setChecked(enabled);
      DocumentManager[enabled ? 'on' : 'off']('documentSaved', handleDocumentSave);
    }
  });


  PreferencesManager.on('change', "brackets-wsSanitizer.onopen", function enabledChanged() {
    var onopen = getOnOpenPreference();

    if (onopen !== lastOnOpen) {
      lastOnOpen = onopen;
      handleDocumentOpen();
    }
  });


  PreferencesManager.on('change', USE_TAB_CHAR, function useTabsChcnaged() {
    var doc     = getCurrentDocument();
    var context = doc && _buildPreferencesContext(doc.file.fullPath);
    var useTabs = PreferencesManager.get(USE_TAB_CHAR, context);

    if (useTabs !== lastUseTab) {
      lastUseTab = useTabs;
      handleDocumentOpen();
    }
  });


  AppInit.appReady(function() {
    EditorManager.on("activeEditorChange.wsSanitizer", handleDocumentOpen);
    handleDocumentOpen();
  });
});
