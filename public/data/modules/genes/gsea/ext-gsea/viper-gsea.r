# global gene ranking from VIPER analysis
# this should contain all genes from expression matrix
# that were used e.g. a few thousand
sig = mrs_limma$signature

# a list of the transcription factors of interest to
# extract
genes = c("MYC", "XBP1")

# make a table where row names are genes and first column
# is the ranking score used by VIPER i.e its SNR like score
df_tf <- data.frame(row.names = rownames(sig), score=sig[,1])

# every subsequent column is a transcription factor of interest
for (gene in genes) {
  print(gene)
  
  # we want the positive or negative score for the targets
  # of each tf which will probably be a few hundred genes
  tfdata = mrs_limma$regulon[[gene]]$tfmode

  # we make a vector of length equal to the number of genes in the signature
  # and use -1000 as a placeholder for genes not in the tfdata
  d = rep(-1000, length(mrs_limma$signature))

  # assign names to the vector so we can easily match genes with tfdata
  names(d)=rownames(sig)

  # for the genes present in the tfdata, we replace the placeholder 
  # with the actual score so these are the GSEA hits
  d[names(tfdata)] = as.vector(tfdata)
  
  # add the vector as a new column in the data frame for this transcription factor
  df_tf[[gene]] = d
}

# write the table to a file for use in ExtGSEA
write.table(df_tf, "viper_gsea.tsv", sep="\t", quote=F, col.names = NA)