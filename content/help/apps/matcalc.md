---
title: 'Matcalc'
weight: 10
type: 'article'
description: 'Tools for analyzing and plotting gene expression and other biological data.'
authors:
  - 'Antony Holmes'
---

## Introduction

Matcalc allows you to analyse tabular data with a focus on utilities for the biological sciences. It is designed to complement work you might do in Excel by offering features normally reserved for programming languages such as Python or R.

The user interface is divided into two main parts: a side bar on the left that lists all of the tables you have open as well as any plots you create from these tables, and the main content view, which changes depending on what type of data you are looking at.

- **Data View**: A view of the tabular data in a spreadsheet view. A side bar on the right contains features for labelling, grouping and filtering the table.
- **Plot View**: A view of a plot. A side bar on the right contains features for adjusting the plot.

## Prepare data

1. Create a table of gene sets you wish to investigate. Each column of a table/spreadsheet is a gene set where each row is a gene symbol. Gene sets can be of different lengths. The first row of each column is treated as the gene set name. If you accidently leave a gene symbol in the first row, it will be ignored.
2. Save the table as a tab delimited text file.

## Loading Data

1. Use the <strong>Open</strong> button to upload your text file of gene sets. Alternatively, drag the file onto the table and when you see the option to drop the file to open, release the mouse button to load the file(s).

2. You will be prompted with a dialog asking how to read the table. Unlike Excel, a table is divided into headers, indices and data. Headers allow for multiple labels for each column, indices allow multiple labels for each row and data is the (normally numeric) content of your table that you wish to process. Headers and indices are meta data for organising and describing a table. A typical table will contain 1 row header (e.g. sample names) and 1 index (e.g. gene names). The headers and indices will be colored light gray in the data view to indicate they will not be used in any analysis, for example taking the log2 of the table.

## Groups

Groups are powerful way to label groups of rows or columns. This is useful when creating heat maps for example and you want to highlight multiple groups of samples. Alternatively analysis tools can use the groups to extract sub tables from your main table without you having to manually edit the table.

## Filtering

Filtering allows you to subset the table by rows and columns, again without having to create the table manually. This can used to extract lists of genes from a full table and to re-order rows and columns to match feature lists you are interested in.
