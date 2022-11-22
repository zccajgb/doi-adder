# Change Log

## [0.0.1]

- Initial release

## [0.0.2]

- Fixed issue with authors being separated with commas instead of 'and'
- Changed info setter to find specific bits of info, to avoid unnecessary data being added

## [1.0.0]

- Major refactor to use accept headers instead of parsing publisher website. This should massively increase the reliablility of the code, which should now work for all valid DOIs
- Reference will now not be added if bib file contains the doi in question.

## [1.0.1]

- Added `DOI: Insert entry` command.
- Added config option to switch between `doi` and `authorYYYY` citekey format.

# [1.0.2]
- fixed bug when bibtex response includes html