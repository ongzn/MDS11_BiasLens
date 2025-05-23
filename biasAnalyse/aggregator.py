import os
from typing import Dict
import pandas as pd

class Aggregator:
    """
    Aggregates per-image metrics across occupations into consolidated tables.
    """
    def __init__(self, job_id: str, base_tmp: str = "/tmp"):
        self.job_dir     = os.path.join(base_tmp, job_id)
        self.metrics_dir = os.path.join(self.job_dir, "metrics")
        self.output_dir  = os.path.join(self.job_dir, "consolidated")
        os.makedirs(self.output_dir, exist_ok=True)

    def aggregate(self) -> Dict[str, str]:
        """
        Reads each occupation CSV, pivots into tables:
          - age_original
          - age_delta
          - gender_flag
          - darkness_original           # COMMENT: new
          - darkness_transformed        # COMMENT: new
        Saves each as CSV in output_dir and returns paths.
        """
        files = [f for f in os.listdir(self.metrics_dir) if f.endswith('.csv')]
        if not files:
            raise ValueError(f"No metric CSV files found in {self.metrics_dir}")

        # Read each, index by image_name
        data = {}
        for fname in files:
            occ = fname.rsplit('.', 1)[0]
            path = os.path.join(self.metrics_dir, fname)
            df = pd.read_csv(path).set_index('image_name')
            data[occ] = df

        # Build consolidated DataFrames
        df_orig    = pd.DataFrame({occ: df['original_age']                for occ, df in data.items()})
        df_delta   = pd.DataFrame({occ: df['age_delta']                   for occ, df in data.items()})
        df_gender  = pd.DataFrame({occ: df['gender_flag']                 for occ, df in data.items()})
        
        # COMMENT: skin‐darkness tables
        df_dark_o  = pd.DataFrame({occ: df['original_avg_darkness']      for occ, df in data.items()})
        df_dark_t  = pd.DataFrame({occ: df['transformed_avg_darkness']   for occ, df in data.items()})

        # Save outputs
        paths = {}
        for name, df in [
            ('age_original',     df_orig),
            ('age_delta',        df_delta),
            ('gender_flag',      df_gender),
            ('darkness_original',df_dark_o),     # COMMENT: new output
            ('darkness_transformed', df_dark_t)  # COMMENT: new output
        ]:
            out_path = os.path.join(self.output_dir, f"{name}.csv")
            df.to_csv(out_path)
            paths[name] = out_path

        return paths
