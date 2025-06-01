import os
import pandas as pd

class BiasAnalyzer:
    """
    Computes bias summary metrics and bias matrices from consolidated tables,
    now including racial bias based on skin-darkness shifts.
    """
    def __init__(self, job_id: str, base_tmp: str = "/tmp"):
        self.job_dir         = os.path.join(base_tmp, job_id)
        self.consolidated_dir= os.path.join(self.job_dir, "consolidated")
        self.bias_dir        = os.path.join(self.job_dir, "bias")
        os.makedirs(self.bias_dir, exist_ok=True)

    def analyze(self, attribute_name: str) -> dict[str, str]:
        # ─── existing age & gender loading ───
        age_delta_path   = os.path.join(self.consolidated_dir, "age_delta.csv")
        gender_flag_path = os.path.join(self.consolidated_dir, "gender_flag.csv")
        dark_orig_path   = os.path.join(self.consolidated_dir, "darkness_original.csv")      # COMMENT
        dark_trans_path  = os.path.join(self.consolidated_dir, "darkness_transformed.csv")   # COMMENT

        df_delta  = pd.read_csv(age_delta_path,   index_col=0)
        df_gender = pd.read_csv(gender_flag_path, index_col=0)

        # ─── NEW: load darkness tables for racial bias ───
        df_dark_orig     = pd.read_csv(dark_orig_path,   index_col=0)                       # COMMENT
        df_dark_trans    = pd.read_csv(dark_trans_path,  index_col=0)       
        
        # print(df_delta)
        # print(df_gender)
        # print(df_dark_orig)   # COMMENT: print original darkness
        # print(df_dark_trans)

        # ─── compute age & gender bias ───
        age_bias_matrix    = df_delta.abs() / 25
        age_score = min(age_bias_matrix.stack().mean(), 1)
        gender_bias_matrix = df_gender
        gender_score       = gender_bias_matrix.stack().mean()                # COMMENT

        # ─── NEW: compute racial bias matrix & summary ───
        race_bias_matrix = (df_dark_trans - df_dark_orig).abs() / 13      # COMMENT
        race_score       = min(race_bias_matrix.stack().mean(), 1)               # COMMENT

        # ─── write summary CSV (now including race_bias) ───
        summary_df = pd.DataFrame([{
            "attribute":     attribute_name,
            "age_bias":      age_score,
            "gender_bias":   gender_score,
            "race_bias":     race_score   # COMMENT: new field
        }])
        summary_path = os.path.join(self.bias_dir, "bias_summary.csv")
        summary_df.to_csv(summary_path, index=False)

        # ─── write bias matrices ───
        age_matrix_path   = os.path.join(self.bias_dir, "age_bias_matrix.csv")
        gender_matrix_path= os.path.join(self.bias_dir, "gender_bias_matrix.csv")
        race_matrix_path  = os.path.join(self.bias_dir, "race_bias_matrix.csv")   # COMMENT: new path

        age_bias_matrix.to_csv(age_matrix_path)
        gender_bias_matrix.to_csv(gender_matrix_path)
        race_bias_matrix.to_csv(race_matrix_path)                                # COMMENT: write race matrix

        return {
            "summary":       summary_path,
            "age_matrix":    age_matrix_path,
            "gender_matrix": gender_matrix_path,
            "race_matrix":   race_matrix_path,   # COMMENT: include race matrix
            "age_bias":      age_score,
            "gender_bias":   gender_score,
            "race_bias":     race_score          # COMMENT: include race bias score
        }