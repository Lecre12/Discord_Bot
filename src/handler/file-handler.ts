import fs from 'fs';
export async function deleteFile(filePath: string, guildId: string): Promise<void> {
    
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error al intentar borrar el archivo: ${err.message}`);
                return;
            }
            console.log(`Archivo ${filePath} borrado exitosamente.`);
        });
    }, 1000);
    
    /*try {
        fs.unlinkSync(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
    } catch (error) {
        console.error(`Error al eliminar el archivo: ${error}`);
    }*/
}