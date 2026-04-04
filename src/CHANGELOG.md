# Changelog

## 62.8 (Apr, 2026)

### Fixed

- Bug fixes and updates.


## 62.6 (Apr, 2026)

### Added

- Added remove files to history to make it more obvious what is happening.

### Changed

- Changed history panel icon.
- Added more support for history sidebar. MAF plots can now set custom allele count.
- Resizable history layout and controls to reduce UI clutter.

### Fixed

- Bug fixes and updates.


## 62.4 (Apr, 2026)

### Added

- Added drawer component.

### Changed

- History now in drawer to save UI space.

### Fixed

- History is more refined.
- Bug fixes and updates.
- History can now change default selections sanely when sheets and plots are deleted.


## 62.2 (Mar, 2026)

### Changed

- Moved data out of history to reduce of patches.
- Flattened history and refactored.

### Fixed

- Bug fixes and updates.


## 62.0 (Mar, 2026)

### Changed

- More integrations of new history. httpfetch removed default withcredentials.
- Groups and genesets are now part of files.
- history openfile now makes path optional and defaults to adding to current app.

### Fixed

- Fixed motifs.
- Bug fixes and updates.


## 60.8 (Mar, 2026)

### Fixed

- A lot more support for new history.
- Bug fixes and updates.
- Added more capabilities to history.


## 60.6 (Mar, 2026)

### Fixed

- Bug fixes and updates.
- Fixing history.


## 60.4 (Mar, 2026)

### Changed

- Refined history hook.
- New history switched to using strings to represent current sheets and plots etc as immer does not seem to update current and array of elements so they get out of sync.

### Fixed

- Bug fixes and updates.
- Fixed colframe transpose.


## 60.2 (Mar, 2026)

### Added

- New simplified history removes steps and uses diffs to track changes.

### Changed

- Refined debounce functions.

### Fixed

- Colframes now handles 1d array correctly.
- Bug fixes and updates.


## 60.0 (Mar, 2026)

### Changed

- Further migration of scna queries to plot grid store.
- scrna now uses store rather than plot grid context.
- Matcalc heatmaps have improved tooltips.

### Fixed

- Tooltips in variants now have smoother transition between letters. Pileup in useMemo to reduce rendering.
- Bug fixes and updates.


## 58.8 (Mar, 2026)

### Added

- header menu grid now has animations.

### Changed

- Table viewer has updated UI.
- Remove colormap chooser from variants. Assume sort order implies colormap.

### Fixed

- UI tweaks.
- Bug fixes and updates.


## 58.6 (Mar, 2026)

### Changed

- Simplifying more of the seq browser api.
- Simplifying seqbrowser track groups.

### Fixed

- UI fixes to seqbrowser, replacable drag handle which can be turned into checkbox as necessary.
- Bug fixes and updates.
- Fixing seqbrowser dependencies in effects to improve performance.


## 58.4 (Mar, 2026)

### Added

- Added universal mouse handler to seqbrowser so multiple tracks can respond to a mouseevent, rather than each having to implement listener themselves.
- Added avatar support to login.

### Changed

- Refined tab system.

### Fixed

- Bug fixes and updates.


## 58.2 (Mar, 2026)

### Added

- Colframe now works are core to annotation dataframe.
- Added more featues to ColFrame.

### Changed

- Refined colframe to reduce mem and improve speed.

### Fixed

- Bug fixes and updates.


## 58.0 (Mar, 2026)

### Added

- Added col major variation of dataframe. Added iterators to indexes and simplified classes.
- Variant DNA now separate component for reuse.
- Variants store now handles caching dna sequence.

### Fixed

- Colframe now compile.
- Bug fixes and updates.
- Fixing MAF SVG output.


## 56.8 (Mar, 2026)

### Added

- Added props for adjusting maf plot.
- Motif and view support added to variant settings for persistence.
- Added MAF support to variants.
- Variants has more modular stores for getting variants, datasets, mafs etc.

### Fixed

- Bug fixes and updates.


## 56.6 (Mar, 2026)

### Added

- User can change sort order of variants.
- Improved sorting of WGS variants.

### Changed

- Sorting AZ now uses asc bool to specify direction. More sorting features in WGS. Switched to Astro font management.
- Colorpicker UI updated.

### Fixed

- Bug fixes and updates.


## 56.4 (Mar, 2026)

### Added

- WGS now checks if too many variants to display.
- WGS now supports custom sorting and more colormaps.
- WGS now does pileup within browser. Better support for mutation tables.

### Fixed

- Bug fixes and updates.


## 56.2 (Mar, 2026)

### Added

- Started to add caching times to useQuery in the 5 min range.

### Changed

- Removal of axios to make it optional. UI fixes. Removal of fetchQuery where it seems like overkill.

### Fixed

- Bug fixes and updates.

### Removed

- Removed rss feed as does not seem relevant to app.


## 56.0 (Mar, 2026)

### Added

- Added store to pathways to improve code layout.

### Fixed

- Bug fixes and updates.


## 54.8 (Mar, 2026)

### Added

- Theme now in its own hook. Theme redesigned to be more responsive.

### Changed

- httpfetch has cleaner API.

### Fixed

- Bug fixes and updates.


## 54.6 (Mar, 2026)

### Added

- Better csrf fetch.

### Fixed

- Bug fixes and updates.


## 54.4 (Mar, 2026)

### Changed

- UI refinements to collapsetree.

### Fixed

- ExtGsea now works with newer dataframe API.
- Collapsetree now has improved UI.
- Bug fixes and updates.


## 54.2 (Mar, 2026)

### Added

- Heatmap now supports filtering table for visible groups. UI updates.
- Matcalc groups have show/hide feature so they do not have be deleted.
- Oncoplot UI updates.

### Changed

- Oncoplot variants now uses dialog to edit rather than messy sortable item.

### Fixed

- Bug fixes and updates.


## 54.0 (Mar, 2026)

### Changed

- API route changes for Admin.

### Fixed

- Bug fixes and updates.


## 52.8 (Feb, 2026)

### Changed

- UI fixes.
- UI tweaks.

### Fixed

- Bug fixes and updates.


## 52.6 (Feb, 2026)

### Changed

- Mutations now supports more elegant handling of long deletions.

### Fixed

- Bug fixes and updates.


## 52.4 (Feb, 2026)

### Changed

- Mutations is now called Variants.

### Fixed

- Bug fixes and updates.


## 52.2 (Feb, 2026)

### Changed

- Lightened theme color. UI fixes.

### Fixed

- Bug fixes and updates.


## 52.0 (Feb, 2026)

### Changed

- Switching to unified slidebar with store control.

### Fixed

- Bug fixes and updates.
- UI fixes.


## 50.8 (Feb, 2026)

### Added

- New slidebar based on resizable panels and a custom store to control it.
- VScode like sidebar resize panels with drag and collapse.
- Peaks now supports default institution.

### Changed

- Accordion UI updated.
- CartItems converted to proper React component.

### Fixed

- Bug fixes and updates.


## 50.6 (Feb, 2026)

### Added

- Genomes now has store to manage info for assemblies such as which GTFs are available.

### Changed

- Updates for new Genome API.

### Fixed

- Bug fixes and updates.


## 50.4 (Feb, 2026)

### Added

- Added config.ts to supply consts within pages.
- Adding more standardized variants to make ui more consistent.

### Fixed

- Fixing textbox widths.
- Bug fixes and updates.


## 50.2 (Feb, 2026)

### Changed

- Lots of UI fixes. Use of BaseUI labels to auto wrap components in labels.

### Fixed

- Bug fixes and updates.


## 50.0 (Feb, 2026)

### Added

- Support for new genome API and added CDS and UTR display to seqbrowser.

### Changed

- UI improvements to Seqbrowser genes dialog.
- UI changes to seq browser.

### Fixed

- Lots of UI fixes to dialogs.
- Bug fixes and updates.


## 48.8 (Feb, 2026)

### Changed

- App resize based on component size.
- Removal of header button size and replaced with lg. Button selection UI more consistent.

### Fixed

- Bug fixes and updates.


## 48.6 (Feb, 2026)

### Changed

- Header UI tweaked to adding rounding and more space.
- UI fixes to resize handles.
- API fix for GEX. Can now control heatmap title.

### Fixed

- Bug fixes and updates.


## 48.4 (Feb, 2026)

### Added

- Added delete gene to oncoplot genes panel.

### Changed

- Fixes to API routes.
- Revising apis to simplify.

### Fixed

- Motifs working again. Added TruncateSpan to better deal with labels that should truncate in nested layouts.
- Update for API changes.
- Bug fixes and updates.


## 48.2 (Feb, 2026)

### Changed

- Table viewer now has module info. Gex now works with new API.

### Fixed

- Delete button on scrna plot items now visible.
- Bug fixes and updates.


## 48.0 (Feb, 2026)

### Changed

- Removed switch thumb changing size depending on state.
- Refined toolbar col component.
- Allow oncoplot to control sorting of rows and cols independently.

### Fixed

- Bug fixes and updates.


## 46.8 (Jan, 2026)

### Added

- Cleaned up UI elements. Revisions for permission based APIs.

### Fixed

- Added x-limit to volcano plot.
- Bug fixes and updates.


## 46.6 (Jan, 2026)

### Added

- Virtual table using tanstack.

### Fixed

- Fix layout issues in seq-edit-dialog.
- Virtual dataframe using tanstack virtual now working.


## 46.4 (Jan, 2026)

### Changed

- Switch TracksProvider to store.
- Virtual dataframe uses transform to move elements rather than top/left.
- Moved all nested components out to improve rendering.

### Fixed

- Stopped endless refresh in track store from useeffect being called on rerenderes, plus changed default tracks to consts to also prevent endless re-renders by giving them stable indentities.
- Bug fixes and updates.


## 46.2 (Jan, 2026)

### Changed

- Moved nested components out of parent to fix react re-renders.

### Fixed

- baseui fixes.
- seqbrowser search now sets first location, more inuitive. Sorting ui fixed.
- Moved location track item to own function as nested seems to cause refresh problems.
- Fixed seqbrowser not showing.


## 46.0 (Jan, 2026)

### Changed

- Changed popover to use flex box col layout and other UI tweaks.

### Fixed

- Fixed seqbrowser not showing.
- User signed in dialog has nicer looking avatar icon. Toggle groups now respond to being on.
- Bug fixes and updates.
- UI fixes to gex dialog.
- Fixed popover not showing when in dialog.


## 44.8 (Dec, 2025)

### Fixed

- Possible fix for auth0 login flow.
- Improved parsing of variants.
- Labels fixed for toolbar style select.
- Bug fixes and updates.
- Toast fixes.


## 44.6 (Dec, 2025)

### Changed

- Removed unused component files.

### Fixed

- Fixed toast display.
- Bug fixes and updates.
- Removal of unused code.
- UI fixes.


## 44.4 (Dec, 2025)

### Changed

- New sort by menu for motifs. Added 0.5 to prob yaxis. UI fixes.
- Switched to baseui context menu.
- Switched to baseui radio.
- Switched to baseui form.

### Fixed

- UI fixes.


## 44.2 (Dec, 2025)

### Added

- Added baseui toast.
- Added base ui menu. Fixed components using radix components instead of shadcn and messing up nesting.

### Changed

- Form simplified in prep for change to baseui.
- More integration of baseui.

### Fixed

- Fixed slider hierarchy.


## 44.0 (Dec, 2025)

### Added

- Added baseui slider.
- Added baseui radio-group.
- Added baseui dialog.
- Added baseui popover.

### Changed

- Simplified path aliases. CSS now in styles folder.


## 42.8 (Dec, 2025)

### Added

- Added baseui input.
- Added baseui accordion.
- Added baseui checkbox.
- Added baseui button.

### Fixed

- Fixed group toggles not inheriting from toggle group.


## 42.6 (Dec, 2025)

### Added

- Added base-ui select element.
- Oncoplot can now order/hide genes.
- Improved variant parser for lollipop. Oncoplot can now hide genes.

### Changed

- UI fixes.

### Fixed

- Added Amino acid change parser that is more robust to the stupid HGVS annotation style.


## 42.4 (Dec, 2025)

### Added

- Oncoplot now allows mutation order to influence plot rendering.

### Changed

- Lollipop and oncoplot now in wgs/.

### Fixed

- Fixed matcalc not saving images and groups.
- Bug fixes and updates.


## 42.2 (Dec, 2025)

### Added

- Oncoplot now sub sorts by categories after combinations to improve look.

### Changed

- Omit csrf token from my account page in prod.

### Fixed

- Fixed lollipop legend resizing to be too small.
- Fixed lollipop resize and oncoplot sorting.
- Oncoplot and lollipop use vertical legends. Oncoplot now shows multi bars in cells.


## 42.0 (Dec, 2025)

### Changed

- Fixed lollipop ui. Removed sortable context.
- Lollipop now has better uniprot search.
- Motif plot now separate function with memoed features to make rendering faster.

### Fixed

- Motif names now properly truncate to width of col rather than fixed num of chars.
- Bug fixes and updates.


## 40.8 (Dec, 2025)

### Added

- Added debounce to motif db selection.
- Added animation to motif base colors.

### Changed

- Replacing sortable items with standardized sortableitem component where possible.

### Fixed

- Simplfied and standardized sortable item. Motif UI updated.


## 40.6 (Dec, 2025)

### Added

- Motif UI updated to add search results. Full search results saved in store so we can know number of records.

### Changed

- Motif store now persists. Search moved into motif store. Full support for boolean searching. Search debounce moved to motif page rather than buried in store. User can sort motifs.

### Fixed

- Bug fixes and updates.


## 40.4 (Dec, 2025)

### Added

- Motif searching now has paging and offers full text search of motifs and datasets.

### Changed

- Standardized uuid to uuidv7 across ui.
- Motif search now in settings so it remembers.
- Removed unused sortableitemcontexts.

### Fixed

- Bug fixes and updates.


## 40.2 (Dec, 2025)

### Changed

- Removed test data button from Motifs.
- Implemented Activity for tab controls to reduce panel refreshing.
- Motifs now uses simplified motif store instead of context. Rev comp done in client to reduce server requests.

### Fixed

- Added save button to motif toolbar.
- Remove animation on accordion to make ui smoother and stop layout animations when tabs change.


## 40.0 (Dec, 2025)

### Added

- Oncoplot now has reorderable clinical tracks.

### Changed

- Removed min-h-8 from auto row/col to save vertical space.
- Oncoplot fully renders all genes and samples. Changed loops to classic for for performance.

### Fixed

- Bug fixes and updates.


## 38.8 (Dec, 2025)

### Changed

- Added category type to oncoplot to simplify workflow. Revised header syntax fore creating oncoplot. Category colors are now managed by track rather than separate legend.
- UI cleanup.

### Fixed

- oncoplot tooltip does not block mouseevents.
- Oncoplot tracks now use map of props to update colors. Fixed clinical tab resetting accordion layout when property changed.


## 38.6 (Dec, 2025)

### Changed

- Moving oncoplot onto zustand store logic.

### Fixed

- Bug fixes and updates.
- Lollipop plot now works again.
- Fixed reorder tab highlighting not working.


## 38.4 (Dec, 2025)

### Added

- Fixing bugs in lollipop. Added card for managing public keys.

### Changed

- Making const arrays and objects immutable with deepFreeze where necessary.

### Fixed

- Bug fixes and updates.


## 38.2 (Dec, 2025)

### Changed

- nano id now uses nanoid12 function directly.
- Messaging now uses channels.

### Fixed

- Fixed messages causing infinite loops by creating readonly empty message array.
- Bug fixes and updates.


## 38.0 (Dec, 2025)

### Added

- Refined zoom store with resets.

### Changed

- Apps now use zoom channels to control zoom of elements like plots so each can set its own zoom and it will be remembered between refreshes. Zoomprovider removed from core providers.
- Supabase login with SSO works. Updates to match newer EDB user  format. Simplified redirects.

### Fixed

- Bug fixes and updates.


## 36.8 (Dec, 2025)

### Added

- Added support for Clerk signin.

### Changed

- Supabase refined but supabase is not oidc compliant.
- Mutations now supports uuidv7 ids and arbitrary sample metadata.
- Simplified sign in/out workflow with fewer redirects.

### Fixed

- saferedirect on callbacks now handles errors.
- Bug fixes and updates.


## 36.6 (Dec, 2025)

### Added

- Redirects using Oauth2 now support titles to give links a friendly name.

### Changed

- Standardizing callback workflow for signing out.
- Removed signin pages since most methods require a redirect and do not require a dedicated signin page.
- Updated sign in menus.

### Fixed

- Fixed signin/signout pipeline to support redirects with title.
- Bug fixes and updates.


## 36.4 (Dec, 2025)

### Added

- Added support for cognito OAuth2 login.

### Changed

- Standardized login flow for different methods.

### Fixed

- Cognito signin now works.
- Bug fixes and updates.


## 36.2 (Nov, 2025)

### Fixed

- Fixed some table headers not appearing in text output.
- Saving tables now adds row metadata heading names.
- Fixed saving table in matcalc and gex.
- Bug fixes and updates.


## 36.0 (Nov, 2025)

### Changed

- Revised permission systems using id as uuid to get rid of public id.

### Fixed

- Fixed track items showing double outlines.
- Bug fixes and updates.


## 34.8 (Nov, 2025)

### Changed

- Switched to loglevel for logging using wrapper.

### Fixed

- Bug fixes and updates.
- Updated for RBAC changes.
- Ext GSEA required genesets extracted from IHistoryGeneSet.


## 34.6 (Nov, 2025)

### Changed

- Dot plot now checks for table being too large to plot. History uses node map for o(1) lookups.
- Changelog format updates.
- UI tweaks.
- Removed node map from history and changed to simpler tree structure.

### Fixed

- Bug fixes and updates.


## 34.4 (Nov, 2025)

### Changed

- Removed unnecessary immer use in history.

### Fixed

- Fixed settings vertical tabs UI.
- Fixing type errors.
- Switch to using nanoids to reduce space for data structures. Fixed dot plot rendering twice.
- Fixed history path using wrong id for root of path.


## 34.2 (Nov, 2025)

### Added

- About page is now Info module.

### Changed

- About module updated.

### Fixed

- Bug fixes and updates.
- Header portals now have useeffect to cope with async rendering. Portal code moved outside layout so that headers render even on pages requiring sign in.
- Fixed bugs in history. Collapse tree in matcalc now works.


## 34.0 (Nov, 2025)

### Changed

- History now uses patches and diffs to record changes to reduce complexity of tracking changes.
- More refinements to history, but still requires fixing deletion.
- Revised history to be able to quickly jump back to previous step when step is deleted.

### Fixed

- Bug fixes and updates.
- Undo and redo now work correctly.


## 32.8 (Oct, 2025)

### Fixed

- Bug fixes and updates.


## 32.6 (Oct, 2025)

### Changed

- Use of path to affect history.
- Fixed some tailwind props.
- Modified history app tree useeffect to reduce renders.
- Removed const default table so that default tables are created with new ids each time.

### Fixed

- Bug fixes and updates.


## 32.4 (Oct, 2025)

### Added

- History now supports paths.

### Changed

- History now uses central id to node map for quicker lookup of nodes. history api now wraps all components in nodes so codebase updated to extract data from history nodes.

### Fixed

- Can now use path to set what is selected in history.
- Fixing more Isheet issues.


## 32.2 (Oct, 2025)

### Changed

- Removed csrf store and replaced with fetch method to be more reliable.

### Fixed

- Fixed my account page errors with csrf.
- Bug fixes and updates.
- Single cell auto complete now adds genes to plots.


## 32.0 (Oct, 2025)

### Added

- Added hidden labels to fix a number of accessibility issues without affect layout.
- Added are you sure dialog to reset single cell settings workflow.
- Added more prop ui comps that respond to size.

### Changed

- Numerical input how has more consistent updating when using buttons and arrow keys and uses debounce to stop spamming UI with updates until user stops changing the value.

### Fixed

- Bug fixes and updates.


## 30.8 (Oct, 2025)

### Added

- Users can control default dot color on UMAP.
- Single cell now copes with hidden clusters on both cluster and gene plots.
- Added cluster edit dialog to scrna.

### Changed

- Changed header settings button size.


## 30.6 (Oct, 2025)

### Added

- Single cell now has a clearer way to and and remove gene and cluster plots.

### Changed

- UI icon tweaks.
- Toolbar ui fixes.
- Simplified header and header portals.

### Fixed

- UI fixes.


## 30.4 (Oct, 2025)

### Added

- new right header portal. simplified toolbar ui.
- Added grid padding to scrna.

### Fixed

- Bug fixes and updates.
- scrna now has working app.
- Bug fixes and updates.


## 30.2 (Oct, 2025)

### Changed

- Simplified scrna.
- scrna updated to match api and ui tweaks.

### Fixed

- UI tweaks.
- Bug fixes and updates.


## 30.0 (Oct, 2025)

### Changed

- Removal sample alt names from gex.
- History plots are more strongly typed.
- Expression changed to expr in gex module. UI fixes.

### Fixed

- UI fixes to animated tabs.
- Bug fixes and updates.


## 28.8 (Oct, 2025)

### Changed

- Adjust gex column order so gene symbol first which looks better in heatmap.

### Fixed

- Bug fixes and updates.
- Fixing lighthouse score issues.
- Rollout refined gex.
- Bug fixes and updates.


## 28.6 (Oct, 2025)

### Added

- Added groups name to history so we can label groups.
- Added more about links.
- Added animations to collapse tree.

### Fixed

- Bug fixes and updates.
- Revised gex dialog.


## 28.4 (Oct, 2025)

### Changed

- Removing unused variables.
- Removed expand icon from collapse tree for leaf nodes.
- Simplified collapse tree. Lots of UI tweaks.

### Fixed

- Bug fixes and updates.
- UI tweaks.


## 28.2 (Oct, 2025)

### Changed

- openbranch now requires tables. Gex supports new API.
- Module version update modified to reduce increments.
- History tree now only shows the current app in use.


## 28.0 (Oct, 2025)

### Changed

- More simplification of history. Made it more robust to removing items and ensuring there is always a default.
- Consolidated more methods in history to simplify. Prevent removal of default app and default branch.
- Font tweaks.

### Fixed

- Bug fixes and updates.


## 26.6 (Oct, 2025)

### Fixed

- Bug fixes and updates.


## 26.4 (Oct, 2025)

### Changed

- Side tabs now uses tab store.
- Pages now use streamlined toolbar menu.
- UI tweaks to file menu.

### Fixed

- Revised tabs with reduced re-renders, animations and keyboard focus working.
- Tab animation fixes.


## 26.2 (Oct, 2025)

### Fixed

- Bug fixes and updates.
- UI tweaks.


## 26.0 (Oct, 2025)

### Changed

- Refined tabs UI.

### Fixed

- Bug fixes and updates.


## 24.9 (Oct, 2025)

### Added

- Added filetree comp and revised history dev panel.
- Added dev layout to expose dev properties, which can be disabled in prod.

### Changed

- Fix dot plot sizes for group sizes.

### Fixed

- Bug fixes and updates.


## 24.7 (Oct, 2025)

### Fixed

- Bug fixes and updates.
- Fixed colors in gex not showing.
- Bug fixes and updates.


## 24.5 (Oct, 2025)

### Added

- Adding core providers to pages.
- Added all of the nextjs changes.

### Fixed

- Fixed show original values in dot plot to scale correctly with log.
- Build finishes.
- Got to a working state.


## 24.3 (Jul, 2025)

### Fixed

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
