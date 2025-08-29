// Gestor de archivos por área específica
class FileManager {
    constructor() {
        this.storageKey = 'areaFiles';
    }

    // Guardar archivo para un área específica
    saveFileForArea(areaId, fileData) {
        const areaFiles = this.getAreaFiles(areaId);
        
        // Si fileData es un array, procesar múltiples archivos
        if (Array.isArray(fileData)) {
            const filesWithIds = fileData.map(file => ({
                ...file,
                id: utils.generateId(),
                savedAt: new Date().toISOString()
            }));
            
            areaFiles.push(...filesWithIds);
            this.saveAreaFiles(areaId, areaFiles);
            
            return filesWithIds;
        } else {
            // Procesar archivo individual
            const fileWithId = {
                ...fileData,
                id: utils.generateId(),
                savedAt: new Date().toISOString()
            };
            
            areaFiles.push(fileWithId);
            this.saveAreaFiles(areaId, areaFiles);
            
            return fileWithId;
        }
    }

    // Guardar datos completos del área (descripción, resultado, observación)
    saveAreaData(areaId, data) {
        const allAreaData = this.getAllAreaData();
        if (!allAreaData[areaId]) {
            allAreaData[areaId] = {};
        }
        
        // Preservar datos existentes y solo actualizar los nuevos
        allAreaData[areaId] = {
            ...allAreaData[areaId],
            ...data,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('areaData', JSON.stringify(allAreaData));
        console.log(`Datos guardados para área ${areaId}:`, allAreaData[areaId]);
        return allAreaData[areaId];
    }

    // Obtener datos completos del área
    getAreaData(areaId) {
        const allAreaData = this.getAllAreaData();
        return allAreaData[areaId] || {};
    }

    // Obtener todos los datos de todas las áreas
    getAllAreaData() {
        const stored = localStorage.getItem('areaData');
        return stored ? JSON.parse(stored) : {};
    }

    // Obtener todos los archivos de un área específica
    getAreaFiles(areaId) {
        const allAreaFiles = this.getAllAreaFiles();
        return allAreaFiles[areaId] || [];
    }

    // Guardar archivos de un área específica
    saveAreaFiles(areaId, files) {
        const allAreaFiles = this.getAllAreaFiles();
        allAreaFiles[areaId] = files;
        localStorage.setItem(this.storageKey, JSON.stringify(allAreaFiles));
    }

    // Obtener todos los archivos de todas las áreas
    getAllAreaFiles() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    }

    // Eliminar archivo específico de un área
    removeFileFromArea(areaId, fileId) {
        const areaFiles = this.getAreaFiles(areaId);
        const updatedFiles = areaFiles.filter(file => file.id !== fileId);
        this.saveAreaFiles(areaId, updatedFiles);
    }

    // Obtener información de archivos (sin el blob por seguridad)
    getFileInfo(areaId) {
        const files = this.getAreaFiles(areaId);
        return files.map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            savedAt: file.savedAt
        }));
    }

    // Limpiar archivos de un área específica
    clearAreaFiles(areaId) {
        const allAreaFiles = this.getAllAreaFiles();
        delete allAreaFiles[areaId];
        localStorage.setItem(this.storageKey, JSON.stringify(allAreaFiles));
    }

    // Obtener estadísticas de archivos por área
    getAreaFileStats(areaId) {
        const files = this.getAreaFiles(areaId);
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        
        return {
            count: files.length,
            totalSize: totalSize,
            byType: files.reduce((acc, file) => {
                acc[file.type] = (acc[file.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Instancia global del gestor de archivos
window.fileManager = new FileManager();
