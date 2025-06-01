import os
import json
import csv
from typing import Dict

class MetricCalculator:
    """
    Computes per-image metrics (ΔAge, gender flag, original_avg_darkness,
    and transformed_avg_darkness) by comparing Face++ JSON outputs
    and skin darkness CSVs.
    """
    def __init__(self, job_id: str, base_tmp: str = "/tmp", skin_map: Dict[str, str] = None):  # COMMENT: skin_map now includes 'originals' key
        self.job_dir    = os.path.join(base_tmp, job_id)
        self.facepp_dir = os.path.join(self.job_dir, "facepp")
        self.metrics_dir= os.path.join(self.job_dir, "metrics")
        os.makedirs(self.metrics_dir, exist_ok=True)
        self.skin_map   = skin_map or {}  # COMMENT: skin_map["originals"] ➞ original CSV; skin_map[occ] ➞ transformed CSV

    def compute(self) -> Dict[str, str]:
        orig_dir      = os.path.join(self.facepp_dir, "originals")
        transforms_dir= os.path.join(self.facepp_dir, "transforms")
        output_files  = {}

        # Pre-load original darkness lookup once
        orig_skin_csv    = self.skin_map.get("originals")                # COMMENT
        orig_dark_lookup = {}
        if orig_skin_csv and os.path.isfile(orig_skin_csv):            # COMMENT
            with open(orig_skin_csv) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    orig_dark_lookup[row["image_name"].split(".")[0]] = row["avg_darkness"]

        # For each occupation folder under transforms
        for occ in os.listdir(transforms_dir):
            occ_folder = os.path.join(transforms_dir, occ)
            csv_path   = os.path.join(self.metrics_dir, f"{occ}.csv")

            # Load transformed darkness lookup
            trans_skin_csv    = self.skin_map.get(occ)                   # COMMENT
            trans_dark_lookup = {}
            if trans_skin_csv and os.path.isfile(trans_skin_csv):      # COMMENT
                with open(trans_skin_csv) as f2:
                    reader2 = csv.DictReader(f2)
                    for row in reader2:
                        trans_dark_lookup[row["image_name"].split(".")[0]] = row["avg_darkness"]

            with open(csv_path, "w", newline="") as csvfile:
                writer = csv.writer(csvfile)
                # COMMENT: expanded header to include both darkness columns
                writer.writerow([
                    "image_name",
                    "original_avg_darkness",     # COMMENT
                    "transformed_avg_darkness",  # COMMENT
                    "original_age",
                    "transformed_age",
                    "age_delta",
                    "original_gender",
                    "transformed_gender",
                    "gender_flag"
                ])

                for fname in sorted(os.listdir(occ_folder)):
                    try:
                        # Load transformed JSON
                        with open(os.path.join(occ_folder, fname)) as f:
                            data_t = json.load(f)

                        # Derive image_name (e.g. "9568.jpg")
                        image_name = fname.split('-', 1)[1].rsplit('.json', 1)[0]
                        # print(f"data_t: {data_t}")
                        # print(f"orig_dark_lookup: {orig_dark_lookup}")
                        # print(f"trans_dark_lookup: {trans_dark_lookup}")

                        # Load original JSON
                        orig_json_path = os.path.join(orig_dir, f"orig-{image_name}.json")
                        with open(orig_json_path) as f:
                            data_o = json.load(f)

                        faces_o = data_o.get("faces", [])
                        faces_t = data_t.get("faces", [])
                        # skip if no face detected in original
                        if not faces_o:
                            continue
                        # always get original attributes
                        age_o = faces_o[0]["attributes"]["age"]["value"]
                        gen_o = faces_o[0]["attributes"]["gender"]["value"]
                        # assign None if no transformed face detected
                        if not faces_t:
                            age_t = None
                            gen_t = None
                        else:
                            age_t = faces_t[0]["attributes"]["age"]["value"]
                            gen_t = faces_t[0]["attributes"]["gender"]["value"]
                        # compute delta and flag, or None if missing
                        delta = None if age_t is None else age_t - age_o
                        flag = None if gen_t is None else (1 if gen_t != gen_o else 0)

                        # COMMENT: lookup darkness values
                        orig_dark = orig_dark_lookup.get(image_name, "")
                        trans_dark= trans_dark_lookup.get(image_name, "")

                        writer.writerow([
                            image_name,
                            orig_dark,     # COMMENT
                            trans_dark,    # COMMENT
                            age_o,
                            age_t,
                            delta,
                            gen_o,
                            gen_t,
                            flag
                        ])

                    except Exception as e:
                        print(f"Skipping {fname}: {e}")
                        continue

            output_files[occ] = csv_path

        return output_files