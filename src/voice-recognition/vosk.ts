import { Model } from "vosk";
import path from "path";

const MODEL_PATH = path.join(
  __dirname,
  "../../vosk_models/vosk-model-small-es-0.42"
);

export const voskModel = new Model(MODEL_PATH);
export const MODEL_PATH_STRING = MODEL_PATH;
