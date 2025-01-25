import { spawn, ChildProcessWithoutNullStreams } from "child_process";

let ffmpeg: ChildProcessWithoutNullStreams | null = null;

/**
 * Reproduce un archivo WAV en el dispositivo CABLE Output (VB-Audio Virtual Cable).
 * @param filePath Ruta del archivo WAV.
 */
export function playAudio(filePath: string) {
  stopAudio(); // Detener cualquier reproducción activa

  const deviceName = "CABLE Output (VB-Audio Virtual Cable)"; // Nombre del dispositivo
  ffmpeg = spawn("ffmpeg", [
    "-i", filePath,         // Archivo de entrada
    "-f", "dshow",          // Usar DirectShow
    `audio=${deviceName}`,  // Especificar el dispositivo de salida
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.error("FFmpeg stderr:", data.toString());
  });

  ffmpeg.on("close", (code) => {
    console.log(`Reproducción detenida. FFmpeg salió con código ${code}.`);
  });

  console.log(`Reproduciendo: ${filePath}`);
}

/**
 * Detiene la reproducción de audio.
 */
export function stopAudio() {
  if (ffmpeg) {
    ffmpeg.kill("SIGTERM"); // Detener la reproducción
    ffmpeg = null;
    console.log("Reproducción detenida.");
  }
}
