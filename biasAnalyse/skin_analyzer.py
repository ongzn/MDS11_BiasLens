import os
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import mediapipe as mp  # COMMENT: using mediapipe for face detection and landmarks

class SkinAnalyzer:
    def __init__(self, job_id, base_tmp, hsv_thresh=(0, 179, 0, 255, 0, 255)):
        self.job_id = job_id
        self.base_tmp = base_tmp
        self.hsv_thresh = hsv_thresh
        # Directories
        self.orig_dir = os.path.join(base_tmp, job_id, "images/originals")
        self.trans_dir = os.path.join(base_tmp, job_id, "images/transforms")
        self.skin_root = os.path.join(base_tmp, job_id, "skin")
        os.makedirs(self.skin_root, exist_ok=True)
        # Load mediapipe FaceMesh
        self.mp_face = mp.solutions.face_mesh  # COMMENT
        self.face_mesh = self.mp_face.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )  # COMMENT
        # Precompute face oval landmark indices
        oval_conns = mp.solutions.face_mesh.FACEMESH_FACE_OVAL
        self.face_oval_idxs = sorted({i for i, j in oval_conns} | {j for i, j in oval_conns})  # COMMENT

    def _face_crop_dir(self, input_dir, out_subdir):
        out_dir = os.path.join(self.skin_root, out_subdir, "faceCrop")
        os.makedirs(out_dir, exist_ok=True)
        for fn in os.listdir(input_dir):
            if not fn.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            img = cv2.imread(os.path.join(input_dir, fn))
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb)
            if not results.multi_face_landmarks:
                continue
            lm = results.multi_face_landmarks[0].landmark
            h, w = img.shape[:2]
            pts = np.array([(int(p.x * w), int(p.y * h)) for p in lm], dtype=np.int32)
            # build convex hull of face oval for smooth region
            oval_pts = pts[self.face_oval_idxs]  # COMMENT
            hull = cv2.convexHull(oval_pts)    # COMMENT: compute convex hull for smooth mask
            # mask out eyes and mouth
            eye_idxs = sorted({i for conn in mp.solutions.face_mesh.FACEMESH_LEFT_EYE for i in conn}
                              | {i for conn in mp.solutions.face_mesh.FACEMESH_RIGHT_EYE for i in conn})
            lips_idxs = sorted({i for conn in mp.solutions.face_mesh.FACEMESH_LIPS for i in conn})
            eyes = pts[eye_idxs]
            mouth = pts[lips_idxs]
            mask = np.zeros(img.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [hull], 1)  # COMMENT: fill convex hull region
            cv2.fillPoly(mask, [eyes], 0) # COMMENT: carve out eyes
            cv2.fillPoly(mask, [mouth], 0) # COMMENT: carve out mouth
            cropped = cv2.bitwise_and(img, img, mask=mask)
            cv2.imwrite(os.path.join(out_dir, fn), cropped)
        return out_dir

    def _convert_hsv_dir(self, input_dir, out_subdir):
        hmin, hmax, smin, smax, vmin, vmax = self.hsv_thresh
        out_dir = os.path.join(self.skin_root, out_subdir, "HSV")
        os.makedirs(out_dir, exist_ok=True)
        for fn in os.listdir(input_dir):
            if not fn.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            img = cv2.imread(os.path.join(input_dir, fn))
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            mask = cv2.inRange(hsv, np.array([hmin, smin, vmin]), np.array([hmax, smax, vmax]))
            res = cv2.bitwise_and(img, img, mask=mask)
            cv2.imwrite(os.path.join(out_dir, fn), res)
        return out_dir

    def _compute_darkness(self, input_dir, original_dir, out_subdir):
        records = []
        # Determine reference image names from original_dir
        ref_files = [fn for fn in os.listdir(original_dir)
                     if fn.lower().endswith((".jpg", ".jpeg", ".png"))]
        hsv_files = {fn for fn in os.listdir(input_dir)
                     if fn.lower().endswith((".jpg", ".jpeg", ".png"))}
        for fn in ref_files:
            if fn not in hsv_files:
                # HSV version missing: record None
                records.append({"image_name": fn, "avg_darkness": None})
            else:
                # Compute darkness for available HSV image
                img_path = os.path.join(input_dir, fn)
                # print(f"Processing {fn} in {input_dir}")
                img = Image.open(img_path).convert("L")
                arr = np.array(img)
                # print(f"Processing {fn}: shape={arr.shape}, dtype={arr.dtype}, darkness={arr.mean()}")
                records.append({"image_name": fn, "avg_darkness": float(arr.mean())})
        out_csv_dir = os.path.join(self.skin_root, out_subdir)
        os.makedirs(out_csv_dir, exist_ok=True)
        out_csv = os.path.join(out_csv_dir, "avg_darkness.csv")
        pd.DataFrame(records).to_csv(out_csv, index=False)
        return out_csv

    def analyze(self):
        result = {}
        orig_fc = self._face_crop_dir(self.orig_dir, "originals")
        # If no faces detected for originals, set value to None
        if not os.listdir(orig_fc):
            result["originals"] = None
        else:
            orig_hsv = self._convert_hsv_dir(orig_fc, "originals")
            result["originals"] = self._compute_darkness(orig_hsv, self.orig_dir, "originals")
        for occ in os.listdir(self.trans_dir):
            occ_in = os.path.join(self.trans_dir, occ)
            if not os.path.isdir(occ_in):
                continue
            fc = self._face_crop_dir(occ_in, occ)
            # If no faces detected for this transform, set value to None
            if not os.listdir(fc):
                result[occ] = None
                continue
            hsv = self._convert_hsv_dir(fc, occ)
            result[occ] = self._compute_darkness(hsv, occ_in, occ)
        return result