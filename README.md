# Ptyxis Focus

A small GNOME Shell extension for people who use Ptyxis as their main terminal
and do not want a new terminal window every time they hit their launcher
shortcut.

## What It Does

`Ptyxis Focus` adds two GNOME Shell shortcuts:

- `Super+Enter`: focus the most recently used Ptyxis window on the current
  workspace and monitor. If there is no Ptyxis window there, open one.
- `Super+Shift+Enter`: always open a new Ptyxis window.

The first shortcut intentionally ignores Ptyxis windows on other workspaces.
It also ignores Ptyxis windows on other monitors, keeping each workspace and
display self-contained.

## Requirements

- GNOME Shell 50
- Wayland or X11 GNOME session
- Ptyxis installed as `org.gnome.Ptyxis`

This was built for a personal GNOME/CachyOS/Wayland setup.

## Build

```bash
make package
```

That compiles the bundled GSettings schema and creates:

```text
ptyxis-focus@nullstring.local.shell-extension.zip
```

Useful targets:

```bash
make check
make clean
make logs
make follow-logs
make status
```

## Install

Install the generated extension bundle:

```bash
gnome-extensions install --force ./ptyxis-focus@nullstring.local.shell-extension.zip
gnome-extensions enable ptyxis-focus@nullstring.local
```

On GNOME Wayland, a brand-new local extension may not be visible until you log
out and back in. After GNOME has seen the extension once, disable/enable is
usually enough for normal testing.

## Debugging

Follow extension logs:

```bash
make follow-logs
```

Expected logs when enabling:

```text
ptyxis-focus@nullstring.local: enabling
ptyxis-focus@nullstring.local: registered focus-or-new
ptyxis-focus@nullstring.local: registered new-window
```

Expected log when pressing `Super+Enter`:

```text
ptyxis-focus@nullstring.local: focus-or-new invoked
```

## Why An Extension?

On Wayland, normal shell scripts cannot reliably inspect and focus arbitrary
windows. GNOME Shell owns that state, so this is implemented as a tiny extension
instead of relying on `xdotool` or temporarily enabling GNOME Shell unsafe mode.
