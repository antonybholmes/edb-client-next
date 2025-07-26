---
title: 'Gene Expression'
weight: 20
type: 'article'
authors:
  - 'Antony Holmes'
---

## Introduction

The Gene Expression app allows you to get formatted gene expression data for curated samples in the lab database. These can then be optionally plotted as a heatmap or exported for use in other tools.

## Getting expression data

1. Navigate to the <strong>Gene</strong> toolbar in MatCalc and click <strong>Gene Expression</strong>.
2. The Gene Expression dialog will open. On the left is a list of data sets available. You can change the species using the menu on the bottom left.
3. Select a gene set of interest.
4. On the right of the dialog is a text box where you can enter the list of genes you are interested in. Genes will be extracted in the order you enter them.
5. Choose <strong>Ok</strong> to create a gene expression table.

## Options

### Expression

You can choose to retrieve expression data as either raw counts, transcripts per million mapped reads (TPM) or Variance Stable Transform (VST). The latter 2 are normalized data forms suitable for comparative plotting and some analysis. If you want to run Deseq2 or other tools that require raw counts, choose the Counts option.

### Sample Info

Certain samples have extra information about them such as cell of origin and age. You can look through the list of available options and all that interest you. This information will be added to the output table as metadata.

### Add group

MatCalc supports adding groups to tables to label multiple samples. These groups can then be used to annotate heatmaps etc with extra data and colors. Choose this option to add groups to matcalc based on sample metadata, such as COO.

### Adding sample info to column names

This option will add the sample info from the <strong>sample info</strong> field to the column names of the table. This may be desirable to keep the table simplified with one header, but it will make the column names longer.

### Adding alternative names to columns

Certain samples may have multiple identifiers. You can add these to the column labels. Generally samples will have the latest, official name, so this option is usually unneccessary.
