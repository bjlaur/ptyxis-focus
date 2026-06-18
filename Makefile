UUID := ptyxis-focus@nullstring.local
SCHEMA_ID := org.gnome.shell.extensions.ptyxis-focus
SCHEMA_DIR := schemas
ZIP := $(UUID).shell-extension.zip

.PHONY: all package schemas check clean status logs follow-logs help

all: package

package: schemas
	gnome-extensions pack --force .

schemas:
	glib-compile-schemas $(SCHEMA_DIR)

check: schemas
	test -f metadata.json
	test -f extension.js
	test -f $(SCHEMA_DIR)/$(SCHEMA_ID).gschema.xml
	GSETTINGS_SCHEMA_DIR=$(SCHEMA_DIR) gsettings list-keys $(SCHEMA_ID) >/dev/null
	gnome-extensions pack --force .
	unzip -t $(ZIP)

clean:
	rm -f $(ZIP)
	rm -f $(SCHEMA_DIR)/gschemas.compiled

status:
	gnome-extensions info $(UUID)

logs:
	journalctl --user -b -n 200 -o cat | grep '$(UUID)' || true

follow-logs:
	journalctl --user -b -n 0 -f -o cat | grep --line-buffered '$(UUID)'

help:
	@printf 'Targets:\n'
	@printf '  make package      Compile schemas and build %s\n' '$(ZIP)'
	@printf '  make check        Validate files, schema, and zip\n'
	@printf '  make clean        Remove generated project-local artifacts\n'
	@printf '  make status       Show installed extension status\n'
	@printf '  make logs         Show recent GNOME Shell logs for this extension\n'
	@printf '  make follow-logs  Follow GNOME Shell logs for this extension\n'
