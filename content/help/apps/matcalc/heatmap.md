---
title: 'Heatmap'
weight: 10
type: 'article'
authors:
  - 'Antony Holmes'
---

## Introduction

Heatmaps allow you to represent tabular data graphically with color.

## Creating a heatmap

1. Load some tabular data. Make sure that you have a header and row names (i.e. the first row and column) and indicate this when loading the table so that MatCalc can separate the metadata from the numerical data.
2. From the <strong>Home</strong> toolbar, choose <strong>Heatmap</strong>.
3. Once the heatmap is created, there is a toolbox on the right hand side that can customize the plot.

## Groups

Groups are powerful way to label groups of rows or columns. This is useful when creating heat maps for example and you want to highlight multiple groups of samples. Alternatively analysis tools can use the groups to extract sub tables from your main table without you having to manually edit the table.

1. While still in <strong>sheet</strong> view, select <strong>Labels</strong> from the pane on the right of the table. Under the <strong>Groups</strong> tab, click the <strong>Add group</strong> button.
2. Enter the name of the group.
3. In match add a comma separated list of the names of samples you want to belong to the group. Use <strong>exact match</strong> to only pick exact matches, otherwise partial matches are used.
4. Use the color circle at the top left of the dialog to assign a color to the group.

## Heatmap Dialog Options

### Filter

You can choose to just plot the top x rows of your table. The default is 200 by standard deviation across the whole row. This is to plot the subset likely to be of most interest since it has the most variance. This can be used as a quick alternative to manually filtering the table before plotting

### Transforms

These are some classic transforms you might want to apply to your data to improve the visualization.

- Log2 - add 1 to the data (since we cannot take the log of 0) and log2 the whole table.
- Z-score - convert rows to z-scores (typically you will plot -3 to +3) to make data scale invariant.
- Transpose - transpose the table, i.e. rows become columns and vice versa.

### Clustering

You can cluster by either rows, columns or both. This can help to show patterns in the data.

- Linkage - defines how distance between clusters is calculated. <strong>Average</strong> calculates the pairwise distance between all points in a pair of clusters and returns the average distance. <strong>Single</strong> calculates the pairwise distance between all points in a pair of clusters and returns the shortest distance. <strong>Complete</strong> calculates the pairwise distance between all points in a pair of clusters and returns the longest distance.
- Distance - the function to calculate distances between a pair of samples. <strong>Correlation</strong> is the Pearson correlation between samples measured as 1 - correlation so that the score is a number between 0 and 2 with 2 being fully correlated. <strong>Euclidean</strong> is the Euclidean distance between two samples.
