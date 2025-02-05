import collections
import numpy as np
import pandas as pd
import os
import gzip

import re
import json
import os


motifs = []
files = []
with open("known.motifs", "rt") as f:
    for line in f:
        line = line.strip()
        tokens = line.split("\t")

        if ">" in line:
            print(line)
            matcher = re.search(r">([^ \t]+)", line)

            id = tokens[1]

            motifs.append(
                {
                    "name": id,
                    "file": f'/modules/motifs/db/{re.sub(r"_+", "_", re.sub(r"[^A-Za-z0-9]", "_", id.lower()))}.json.gz',
                    "bases": [],
                }
            )
        else:
            motifs[-1]["bases"].append([float(x) for x in tokens])


files = []

for motif in motifs:
    df = pd.DataFrame(motif["bases"]).T

    print(motif)

    files.append(
        {
            "name": motif["name"],
            "file": motif["file"],
        }
    )

    out = f'db/{os.path.basename(motif["file"])}'

    with gzip.open(out, "wt") as f:
        json.dump(df.values.tolist(), f)

out = "db.json.gz"
with gzip.open(out, "wt") as f:
    json.dump(files, f)
