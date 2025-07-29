# Changelog

## 24.4 (Jul, 2025)

### Added

- Added loaded state to auth stores so we can understand if user is logged in, login failed, or we are waiting for data to hydrate.

### Changed

- Simplified core providers. Added fetchquery to some stores.
- Fixed SSR hydration of bottom bar using rand ids from sheets by only rendering on mount.
- Auth workflow with nexjs specific fixes.

### Fixed

- Bug fixes and updates.


## 24.3 (Jul, 2025)

### Added

- Help pages now partially render.

### Changed

- Removed export. Added redirects. Switched to Image.

### Fixed

- Bug fixes and updates.
- Added changelog page.
- Bug fixes and updates.


## 24.2 (Jul, 2025)

### Changed

- Single cell datasets now uses useQuery. Dataset selection moved to header.
- Modified axis clipping to be more consistent.
- Single cell now uses context for plot data so we can make plots with multiple datasets if desired.
- Fixed input size issue on dataframe and some UI fixes to axes.

### Fixed

- Bug fixes and updates.
- Fixed colormap button in umap not updating color scheme.
- Bug fixes and updates.


## 24.1 (Jul, 2025)

### Changed

- Switch to clsx from class-names.
- Refactored some code.
- Removed ripple for the moment.
- Support scripts use tsx to make them easier to manage.

### Fixed

- Bug fixes and updates.


## 24.0 (Jul, 2025)

### Added

- Toolbar UI now supports single ribbon view.
- Lollipop UI tweaks.
- Added support for porportional lollipops and counts.

### Changed

- Message bus now uses zustrand.
- Graph axis now based on d3 for ease of development.
- Zoom now uses provider model, virt dataframe can turn off zoom, changed more selected to checked for consistency.

### Fixed

- Bug fixes and updates.
- Lollipop features enforce end greater than start and stop svg rect with negative widths.
- Bug fixes and updates.


## 23.9 (Jul, 2025)

### Added

- Added single lollipop view to lollipop and more animations.
- Added logic for dealing with overlapping nodes for fixing layout issues.
- Autocomplete header for lollipop.

### Changed

- Removed space between switch prop rows.
- Lollipop now uses adjustable widths and heights.

### Fixed

- UI tweaks.
- Fixed lollipop tooltips out of sync.
- Added max variant view to lollipop. Settings tabs now uses zustrand store.
- Bug fixes and updates.


## 23.8 (Jul, 2025)

### Added

- Support for gene search of protein table and warnings for bad proteins in lollipop.
- Added padding to reduce lollipop size and improve visuals.
- Simplified lollipop. Custom AA colors menu.
- Added aa colors to lollipop.
- Lollipop context now serializable to session.
- Matcalc now supports lollipops.

### Changed

- Lollipop UI updated.
- Refined numerical input to add more display space.

### Fixed

- Bug fixes and updates.


## 23.7 (Jul, 2025)

### Added

- Lollipop legend revised.
- Lollipop features now have z-order.

### Changed

- Switch lollipop plot provider to zustrand lollipop store.
- Refined auth0 login. Csrf now uses zustrand store.
- Cleaned up three color menu.
- csrf uses localstorage.

### Fixed

- Change csrf token storage.


## 23.6 (Jul, 2025)

### Added

- Added position tooltip to lollipop sequence.

### Changed

- Changing lollipop features now uses tabs to manage setting multiple colors.
- Refined Auth0 workflow to cope with url redirects.
- Changed oauth2 to Auth0.
- Changed some aa colors and improved parsing of variants.
- Protein sequence and aa are not independent so lollipop is more flexible.
- Lots of UI fixes to lollipop.

### Fixed

- Lollipop UI fixes.
- Fixed feature display in Lollipop.


## 23.5 (Jun, 2025)

### Added

- Lollipop can save features.
- Added db filter to lollipop.

### Changed

- Revised uniprot search.
- Added border control to mutations in lollipop.
- Lollipop works and moved to prod.
- Redesigned lollipop app.

### Fixed

- Lollipop no longer tries to autoplot when table is loaded.
- Revised uniprot search.


## 23.4 (Jun, 2025)

### Added

- 404 with animated dinosaur easter egg.
- Custom 404 page.

### Changed

- Improvements to Auth0 login.

### Fixed

- Bug fixes and updates.


## 23.3 (Jun, 2025)

### Added

- Sessions now use CSRF protection. Refined account update page.
- Added more csrf checks.
- Update user now uses short lived update token.

### Changed

- UI fixes to sign in process.
- Refined sign in.
- Tweaks to sign in ui.
- Sign in menu and dialog UI tweaks.

### Fixed

- Bug fixes and updates.


## 23.2 (Jun, 2025)

### Added

- Added signedout page to complete signout process.

### Changed

- Sign in menu and dialog UI tweaks.
- Updated sign in menus and passwordless login.
- UI fixes.
- Auth workflow revised.

### Fixed

- Bug fixes and updates.


## 23.1 (Jun, 2025)

### Added

- Signin uses form validation.
- Added support for supabase login.
- Added support for supabase.
- Added more features to single cell for plotting gex in specific clusters.
- Added more customizable props to gene view in seq browser.

### Changed

- Sign in now uses zod for validation. Input placeholder works.

### Fixed

- Bug fixes and updates.
- Fixed canonical filter not working.


## 23.0 (Jun, 2025)

### Added

- Added more customizable props to gene view in seq browser.
- Added gene controls to seq browser toolbar.
- Added support for simple view and dense display for genes in seq browser.
- Added hide side bar option to menus.

### Changed

- Updated seq browser ui.
- Gex and cluster umaps now work together. More props moved to plot grid store and out of settings.

### Fixed

- Bug fixes and updates.
- Gene search working again.
- Bug fixes and updates.


## 22.9 (Jun, 2025)

### Added

- Added reds colormap.
- More support for multiple scrna gene plots.
- Added plot store for scrna to control multiple plots on grid.

### Changed

- Saving image now more robust by declaring min size.
- Tranfer more props related to plot at runtime p plot-props-panel.
- Use kebab-case for type literals.

### Fixed

- Bug fixes and updates.
- Move scrna plots to plot store model.
- Bug fixes and updates.


## 22.8 (Jun, 2025)

### Added

- UMAP supports grid mode.
- More color maps and improved colormap UI.
- Support for scrna gex with adjustments and lots of UI fixes.
- Added colormap generator and new gray red color map.
- UMAP can now show legend.
- Added genes module to single cell.

### Changed

- UMAP image now without useless white border.

### Fixed

- Added support for loading clusters and colors from db.


## 22.7 (Jun, 2025)

### Added

- Ability to customize cluster colors on UMAP.
- Single cell now supports clusters, gex and cluster labels and improved rendering.

### Changed

- Moved clusters to their own panel.
- More standardized svg creation.
- further standardized svg creation.
- Standardized svg creation.
- Revised saving system that auto creates and destroys links as necessary.
- Changed EnsemblId to geneId so it is less specific and more universal.
- UMAP renamed to Single Cell.


## 22.6 (Jun, 2025)

### Added

- UMAP now supports gene exp umaps.
- UMAP now has better colormap support.

### Changed

- Simplified UMAP gene search.
- Added autocomplete for genes to UMAP.
- Revised some core search functions.
- Added persistent umap settings.

### Fixed

- RGB hex conversion.
- Improved canvas scaling.


## 22.5 (May, 2025)

### Added

- Added features to UMAP module.

### Changed

- Dot plot auto color now has threshold control. Numerical spinners respond to long press mouse and keyboard events.
- Heatmap groups now pinned to plot so modification of groups do not force plot updates.

### Fixed

- UMAP now displays umaps from database.
- Fixed row/col addressing in annotation data frame.
- Moved color consts to lib colors.
- Dot plot properly ignores zero values when threshold filter on.


## 22.4 (May, 2025)

### Added

- Dot plot legends and cells have lots more configuration options and ability to set titles.
- Added border controls for dot plot cells.

### Changed

- UI tweaks.
- Revised plot toolbar UI.
- UI fixes.
- Dot plot value render can ignore zeros.

### Fixed

- Colormap icon rendering updated.
- Textarea not appearing.
- Removal of log statements.


## 22.3 (May, 2025)

### Added

- Changelog has cache mode.
- Improved changelog.
- Plot dot plots with log2 data, but show original data.

### Changed

- Cell decimal place UI for dot plot made clearer.
- Dot legend decimal places match cells.
- Z-scores check for std zero.

### Fixed

- UI fixes.
- Dot plot reset now works.
- Dot plot legend shows unadjusted counts.
- Option to trim whitespace when opening files.
- Removed glass UI from open file.


## 22.2 (May, 2025)

### Added

- Support for reading BigBed files.
- Support for dot plots using table data as dot size.

### Changed

- Lots of UI tweaks to fix inconsistent labels, colors, sizes, corner roundings etc.


## 21.6 (May, 2025)

### Added

- Seq browser supports loading BigWig files.

### Changed

- Group and gene set colors can now be set from the side pane as well as the edit dialog.
- Multiple locations are supported in the seq browser using the Locations tab.


## 21.3 (Mar, 2025)

### Added

- Added hubs module for viewing data in the UCSC Genome browser.
- Added GEX module to Matcalc.
- Added hubs module for viewing data in the UCSC Genome browser.
- Table viewer app for displaying arbitrary tables in second window.

### Changed

- Table view now supports multiple column indices.
- Save as dialogs now allow name to be changed.
- Modules renamed to apps. Existing modules will continue to work at the old urls.
- Header menu reorganized.
- Motifs now has persistent settings.
- UI refreshes to fix inconsistencies.
- Revised sign in dialog.


## 20.7 (Jan, 2025)

### Added

- Added ruler component to seq browser.
- Seq browser supports showing multiple locations.
- Ability to perform genomic multiway and one way overlaps.

### Changed

- Refreshed UI.


## 20.4 (Dec, 2024)

### Added

- Genesets grouping to MatCalc.
- Sequence browser for NGS data.
- Option to show only canonical genes in Seq Browser.
- Ability to save seq browser tracks for later reuse.

### Changed

- More properties added to My Account.
- New settings dialog for altering dark mode.
- Sign in now uses Auth0 workflow.


## 19.8 (Dec, 2024)

### Added

- General purpose gene set storage in MatCalc UI.
- Extended GSEA module in MatCalc.
- More properties to the GSEA plots tool.

### Changed

- Groups in the groups side panel are now accented by their primary color rather than a gray selection rectangle.
- Loading a file through drag and drop now prompts users with options for opening the file.


## 19.6 (Dec, 2024)

### Added

- Lots of extra properties for customizing heatmaps.

### Changed

-  Heatmap trees now use paths for line rendering to improve appearance.
- Tiles are now drawn with use tag for efficiency.
- Heatmap side bar reorganized to cope with more properties..
- Row Filter feature renamed to Top Rows to better reflect what it does.

### Fixed

-  Plots are fully removed from UI when deleted.
- Groups no longer have scaling animation when loading.

### Removed

- Separate cluster button on MatCalc toolbar. Now the heatmap button does both heatmaps and clustergrams.
