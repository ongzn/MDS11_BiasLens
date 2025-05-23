import os
import time
import logging
import requests
from typing import Dict, List, Tuple  # COMMENT: Dict, List imported for new method

logger = logging.getLogger(__name__)
FACEPP_URL = "https://api-us.faceplusplus.com/facepp/v3/detect"
MAX_RETRY = 5
RETRY_DELAY = 1  # seconds

class FaceppClient:
    def __init__(self):
        self.api_key = os.getenv("FACEPP_KEY")
        self.api_secret = os.getenv("FACEPP_SECRET")
        if not self.api_key or not self.api_secret:
            raise ValueError("FACEPP_KEY and FACEPP_SECRET must be set in env")

    def detect_batch(
        self, 
        images: List[Tuple[str, str]]
        # list of (context_tag, image_url)
    ) -> Dict[str, dict]:
        """
        Call Face++ detect on each image URL, with retries.
        Returns a mapping from context_tag to parsed JSON response.
        """
        results = {}
        for tag, url in images:
            last_err = None
            for attempt in range(1, MAX_RETRY + 1):
                try:
                    resp = requests.post(
                        FACEPP_URL,
                        data={
                            "api_key": self.api_key,
                            "api_secret": self.api_secret,
                            "return_landmark": 0,
                            "return_attributes": "age,gender,ethnicity"
                        },
                        files={"image_url": (None, url)},
                        timeout=10
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    logger.info(f"[FaceppClient] fetched tag={tag}, faces={len(data.get('faces', []))}")
                    results[tag] = data
                    break
                except requests.HTTPError as e:
                    last_err = e
                    logger.warning(f"[FaceppClient] HTTPError on {tag} (attempt {attempt}): {e}")
                except requests.RequestException as e:
                    last_err = e
                    logger.warning(f"[FaceppClient] RequestException on {tag} (attempt {attempt}): {e}")
                time.sleep(RETRY_DELAY)
            else:
                logger.error(f"[FaceppClient] Failed to fetch {tag} after {MAX_RETRY} attempts")
                results[tag] = {"error": str(last_err)}
        return results

    def check_faces(
        self,
        urls: List[str]
    ) -> Dict[str, bool]:
        """
        CHANGED: New method to validate that each URL contains at least one face.
        Takes a list of image URLs and returns a mapping URL -> has_face (True/False).
        """
        # Prepare batch using the URL itself as the context_tag
        batch = [(url, url) for url in urls]  # COMMENT: create list of (tag, url) tuples
        results = self.detect_batch(batch)
        presence: Dict[str, bool] = {}
        for url, data in results.items():
            # If Face++ returned a 'faces' list, mark True if non-empty
            faces = data.get("faces", [])
            presence[url] = len(faces) > 0  # COMMENT: True if at least one face detected
        return presence  # COMMENT: return simple URL -> boolean map
