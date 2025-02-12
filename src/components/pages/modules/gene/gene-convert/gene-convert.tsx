"use client";

import { ToolbarOpenFile } from "@components/toolbar/toolbar-open-files";

import { TabbedDataFrames } from "@components/table/tabbed-dataframes";

import { ToolbarFooter } from "@components/toolbar/toolbar-footer";

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from "@components/toolbar/toolbar";
import { ToolbarSeparator } from "@components/toolbar/toolbar-separator";
import { PlayIcon } from "@icons/play-icon";

import { ToolbarButton } from "@components/toolbar/toolbar-button";

import { DataFrameReader } from "@lib/dataframe/dataframe-reader";
import {
  downloadDataFrame,
  getFormattedShape,
} from "@lib/dataframe/dataframe-utils";

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from "@components/pages/open-files";

import { BasicAlertDialog } from "@components/dialog/basic-alert-dialog";
import { ToolbarTabGroup } from "@components/toolbar/toolbar-tab-group";

import { ToolbarTabButton } from "@components/toolbar/toolbar-tab-button";
import { ClockRotateLeftIcon } from "@icons/clock-rotate-left-icon";
import { OpenIcon } from "@icons/open-icon";
import { SaveIcon } from "@icons/save-icon";
import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from "@providers/history-provider";

import { useContext, useRef, useState } from "react";

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from "@/consts";

import { TabSlideBar } from "@/components/slide-bar/tab-slide-bar";
import { UploadIcon } from "@components/icons/upload-icon";
import { DropdownMenuItem } from "@components/shadcn/ui/themed/dropdown-menu";
import { UndoShortcuts } from "@components/toolbar/undo-shortcuts";
import { ShortcutLayout } from "@layouts/shortcut-layout";
import { makeRandId } from "@lib/utils";
import { createGeneConvTable } from "@modules/gene/geneconv";
import axios from "axios";

import { HistoryPanel } from "@components/pages/history-panel";

import { FileIcon } from "@/components/icons/file-icon";
import { ToolbarIconButton } from "@/components/toolbar/toolbar-icon-button";
import { textToLines } from "@/lib/text/lines";
import type { ITab } from "@components/tab-provider";
import {
  ToggleButtons,
  ToggleButtonTriggers,
} from "@components/toggle-buttons";
import { CoreProviders } from "@providers/core-providers";
import { useQueryClient } from "@tanstack/react-query";
import MODULE_INFO from "./module.json";

function GeneConvPage() {
  const queryClient = useQueryClient();

  const [activeSideTab] = useState(0);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const { history, historyDispatch } = useContext(HistoryContext);

  //const [filesToOpen, setFilesToOpen] = useState<IFileOpen[]>([])

  const [fromSpecies, setFromSpecies] = useState("Human");
  const [toSpecies, setToSpecies] = useState("Mouse");
  const [exact] = useState(true);

  const [rightTab, setRightTab] = useState("Options");
  const [showSideBar, setShowSideBar] = useState(true);

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG });

  const [showFileMenu, setShowFileMenu] = useState(false);

  const speciesTabs = [{ id: "Human" }, { id: "Mouse" }];

  function openFiles(
    files: ITextFileOpen[],
    options: IParseOptions = DEFAULT_PARSE_OPTS
  ) {
    //filesToDataFrames(files, historyDispatch, options)

    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          historyDispatch({
            type: "open",
            description: `Load ${tables[0]!.name}`,
            sheets: tables,
          });
        }
      },
    });

    setShowFileMenu(false);
  }

  async function convertGenes() {
    const df = currentSheet(history)[0]!;

    console.log("from", fromSpecies, toSpecies);

    const dfa = await createGeneConvTable(
      queryClient,
      df,
      fromSpecies,
      toSpecies,
      exact
    );

    if (dfa) {
      historyDispatch({
        type: "add-step",
        description: `Gene Conversion`,
        sheets: [dfa],
      });
    }
  }

  function save(format: "txt" | "csv") {
    const df = currentSheet(history)[0]!;

    if (!df) {
      return;
    }

    const sep = format === "csv" ? "," : "\t";

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    });

    setShowFileMenu(false);
  }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ["test_data"],
      queryFn: () => axios.get("/data/test/geneconv.txt"),
    });

    try {
      const lines = textToLines(res.data);

      const table = new DataFrameReader().indexCols(0).read(lines);

      historyDispatch({
        type: "open",
        description: `Load Test`,
        sheets: [table.setName("Geneconv Test")],
      });
    } catch (error) {
      // do nothing
    }
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: "Home",
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: makeRandId("open"),
                  });
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              arial-label="Save table to local file"
              onClick={() => save("txt")}
              title="Save table"
            >
              <SaveIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Convert">
            <ToolbarButton
              aria-label="Convert"
              onClick={convertGenes}
              title="Convert"
            >
              <PlayIcon />
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="gap-x-2 mr-1" title="From">
            <ToggleButtons
              tabs={speciesTabs}
              value={fromSpecies}
              onTabChange={(selectedTab) => {
                setFromSpecies(selectedTab.tab.id);
              }}
              className="rounded-theme overflow-hidden"
            >
              <ToggleButtonTriggers defaultWidth={4.5} size="toolbar" />
            </ToggleButtons>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="gap-x-2 ml-1" title="To">
            <ToggleButtons
              tabs={speciesTabs}
              value={toSpecies}
              onTabChange={(selectedTab) => {
                setToSpecies(selectedTab.tab.id);
              }}
              className="rounded-theme overflow-hidden"
            >
              <ToggleButtonTriggers defaultWidth={4.5} size="toolbar" />
            </ToggleButtons>
          </ToolbarTabGroup>{" "}
          <ToolbarSeparator />
        </>
      ),
    },
  ];

  const rightTabs: ITab[] = [
    // {
    //   //id: nanoid(),
    //   icon: <SlidersIcon />,
    //   name: "Options",
    //   content: (
    //     <GeneConvertPropsPanel
    //       fromSpecies={fromSpecies}
    //       toSpecies={toSpecies}
    //       exact={exact}
    //       setFromSpecies={setFromSpecies}
    //       setToSpecies={setToSpecies}
    //       setExact={setExact}
    //     />
    //   ),
    // },
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: "History",
      content: <HistoryPanel />,
    },
  ];

  // const sidebar: ITab[] = [
  //   {
  //     icon: <TableIcon className={TOOLBAR_BUTTON_ICON_CLS} />,
  //     label: "Table View",
  //     content: (
  //       <ResizablePanelGroup direction="horizontal">
  //         <ResizablePanel
  //           id="tables"
  //           defaultSize={75}
  //           minSize={50}
  //           className="flex flex-col"
  //         >
  //           <TabbedDataFrames
  //             selectedSheet={history.step.sheetIndex}
  //             dataFrames={history.step.dataframes}
  //             onTabChange={(tab: number) => {
  //               historyDispatch({ type: "goto-sheet", index: tab })
  //             }}
  //             onSelectionChange={setSelection}
  //           />
  //         </ResizablePanel>
  //         <HResizeHandle />
  //         <ResizablePanel
  //           className="flex flex-col"
  //           id="right-tabs"
  //           defaultSize={25}
  //           minSize={10}
  //           collapsible={true}
  //         >
  //           <SideBar side="Right"
  //             tabs={rightTabs}
  //             activeTabIndex={selectedRightTab}
  //             onTabChange={setSelectedRightTab}
  //           />
  //         </ResizablePanel>
  //       </ResizablePanelGroup>

  //     ),
  //   },
  // ]

  // const fileMenuTabs: ITab[] = [
  //   {
  //     id: nanoid(),
  //     name: "Open",
  //     icon: <OpenIcon fill="" w="w-5" />,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Open</h1>

  //         <ul className="flex flex-col gap-y-2 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Open file on your computer"
  //               onClick={() =>
  //                 setShowDialog({ name: makeRandId("open"), params: {} })
  //               }
  //             >
  //               <OpenIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Open local file
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Open a local file on your computer.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     id: nanoid(),
  //     name: TEXT_SAVE_AS,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Save text file"
  //               onClick={() => save("txt")}
  //             >
  //               <FileLinesIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as TXT
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a tab-delimited text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Save CSV file"
  //               onClick={() => save("csv")}
  //             >
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as CSV
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a comma separated text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  // ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: "Open",
      icon: <OpenIcon stroke="" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: makeRandId("open"), params: {} })}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save("txt")}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save("csv")}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ];

  return (
    <>
      {showDialog.id === "alert" && (
        <BasicAlertDialog onReponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message}
        </BasicAlertDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} showSignInError={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                show={showSideBar}
                onClick={() => {
                  setShowSideBar(!showSideBar);
                }}
              />
            }
          />
        </Toolbar>

        <TabSlideBar
          side="Right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          {/* <Card
            variant="content"
            className="mx-2 pb-0"
            style={{ marginBottom: '-2px' }}
          > */}
          <TabbedDataFrames
            selectedSheet={currentSheetId(history)[0]!}
            dataFrames={currentSheets(history)[0]!}
            onTabChange={(selectedTab) => {
              historyDispatch({
                type: "goto-sheet",
                sheetId: selectedTab.index,
              });
            }}
            className="mx-2"
            style={{ marginBottom: "-2px" }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooter className="justify-end">
          <>
            {activeSideTab === 0 && (
              <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
            )}
          </>
          <></>
          <></>
        </ToolbarFooter>

        {showDialog.id.includes("open") && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => openFiles(files))
            }
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  );
}

export function GeneConvQueryPage() {
  return (
    <CoreProviders>
      <GeneConvPage />
    </CoreProviders>
  );
}
