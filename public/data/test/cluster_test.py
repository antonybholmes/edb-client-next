import seaborn as sns
import pandas as pd

df = pd.read_csv("z_table.txt", sep="\t", header=0, index_col=0)


g = sns.clustermap(df, method="average", metric="correlation", z_score=False)

# Save the figure
g.savefig("clustermap.png")