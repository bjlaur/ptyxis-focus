import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const APP_ID = 'org.gnome.Ptyxis';
const DESKTOP_ID = `${APP_ID}.desktop`;

export default class PtyxisFocusExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._debug('enabling');
        this._debug(`focus-or-new setting: ${this._settings.get_strv('focus-or-new').join(', ')}`);
        this._debug(`new-window setting: ${this._settings.get_strv('new-window').join(', ')}`);

        this._addKeybinding('focus-or-new', this._focusOrOpenNew.bind(this));
        this._addKeybinding('new-window', this._openNewPtyxis.bind(this));
    }

    _addKeybinding(name, handler) {
        try {
            Main.wm.addKeybinding(
                name,
                this._settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.ALL,
                handler);
            this._debug(`registered ${name}`);
        } catch (error) {
            logError(error, `${this.uuid}: failed to register ${name}`);
        }
    }

    disable() {
        this._debug('disabling');

        Main.wm.removeKeybinding('focus-or-new');
        Main.wm.removeKeybinding('new-window');

        this._settings = null;
    }

    _focusOrOpenNew() {
        this._debug('focus-or-new invoked');

        const window = this._findPtyxisWindowOnCurrentWorkspace();

        if (window) {
            this._debug(`activating ${window.get_title()}`);
            Main.activateWindow(window);
            return;
        }

        this._debug('no Ptyxis window on current workspace');
        this._openNewPtyxis();
    }

    _findPtyxisWindowOnCurrentWorkspace() {
        const workspace = global.workspace_manager.get_active_workspace();
        const tracker = Shell.WindowTracker.get_default();

        return global.display
            .get_tab_list(Meta.TabList.NORMAL_ALL, workspace)
            .find(window => this._isPtyxisWindow(window, tracker)) ?? null;
    }

    _isPtyxisWindow(window, tracker) {
        const app = tracker.get_window_app(window);

        if (app) {
            const id = app.get_id();
            if (id === DESKTOP_ID || id === APP_ID)
                return true;
        }

        const wmClass = (window.get_wm_class() || '').toLowerCase();
        const gtkAppId = window.get_gtk_application_id
            ? (window.get_gtk_application_id() || '').toLowerCase()
            : '';

        return wmClass === 'org.gnome.ptyxis' ||
            wmClass === 'ptyxis' ||
            gtkAppId === 'org.gnome.ptyxis';
    }

    _openNewPtyxis() {
        this._debug('opening new Ptyxis window');

        const app = Shell.AppSystem.get_default().lookup_app(DESKTOP_ID);

        if (app?.can_open_new_window()) {
            app.open_new_window(-1);
            return;
        }

        try {
            Gio.Subprocess.new(
                ['ptyxis', '--new-window'],
                Gio.SubprocessFlags.NONE);
        } catch (error) {
            logError(error, 'Failed to launch Ptyxis');
        }
    }

    _debug(message) {
        log(`${this.uuid}: ${message}`);
        console.log(`${this.uuid}: ${message}`);
    }
}
