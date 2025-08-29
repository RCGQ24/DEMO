// Funcionalidad de la pantalla de resultado y observación
class ResultScreen {
    constructor() {
        this.form = document.getElementById('result-form');
        this.resultTextarea = document.getElementById('result');
        this.observationTextarea = document.getElementById('observation');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredData();
    }

    setupEventListeners() {
        // Manejar envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Contadores de caracteres
        this.resultTextarea.addEventListener('input', () => {
            this.updateCharCounter(this.resultTextarea, 'result');
        });

        this.observationTextarea.addEventListener('input', () => {
            this.updateCharCounter(this.observationTextarea, 'observation');
        });

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'result-screen') {
                this.onScreenShow();
            }
        });

        // Auto-guardar cada 30 segundos
        setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    updateCharCounter(textarea, fieldName) {
        const maxLength = 500;
        const currentLength = textarea.value.length;
        
        // Remover contador previo
        const existingCounter = textarea.parentNode.querySelector('.char-counter');
        if (existingCounter) {
            existingCounter.remove();
        }

        // Crear nuevo contador
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.textContent = `${currentLength}/${maxLength}`;

        if (currentLength > maxLength * 0.9) {
            counter.classList.add('warning');
        }
        if (currentLength > maxLength) {
            counter.classList.add('error');
            // Truncar texto si excede el límite
            textarea.value = textarea.value.substring(0, maxLength);
        }

        textarea.parentNode.appendChild(counter);
    }

    autoSave() {
        const result = this.resultTextarea.value.trim();
        const observation = this.observationTextarea.value.trim();
        
        if (result || observation) {
            this.saveData({ result, observation });
            console.log('Auto-guardado realizado');
        }
    }

    saveData(data) {
        app.saveScreenData('result-screen', data);
    }

    loadStoredData() {
        // Obtener datos del área actual
        const areaData = app.getScreenData('area-selection-screen');
        const processData = app.getScreenData('process-selection-screen');
        const descriptionData = app.getScreenData('description-screen');
        
        let areaId = null;
        
        if (areaData && areaData.isNewArea) {
            // Es área nueva
            areaId = descriptionData?.newAreaId;
        } else if (processData && processData.area) {
            // Es área existente
            areaId = processData.area;
        }
        
        // Cargar datos específicos del área si existe
        if (areaId) {
            const areaSpecificData = fileManager.getAreaData(areaId);
            console.log('Datos del área cargados:', areaSpecificData);
            
            if (areaSpecificData.result) {
                this.resultTextarea.value = areaSpecificData.result;
                this.updateCharCounter(this.resultTextarea, 'result');
            }

            if (areaSpecificData.observation) {
                this.observationTextarea.value = areaSpecificData.observation;
                this.updateCharCounter(this.observationTextarea, 'observation');
            }
        } else {
            // Fallback a datos de sessionStorage
            const storedData = app.getScreenData('result-screen');
            
            if (storedData.result) {
                this.resultTextarea.value = storedData.result;
                this.updateCharCounter(this.resultTextarea, 'result');
            }

            if (storedData.observation) {
                this.observationTextarea.value = storedData.observation;
                this.updateCharCounter(this.observationTextarea, 'observation');
            }
        }
    }

    async handleSubmit() {
        const result = this.resultTextarea.value.trim();
        const observation = this.observationTextarea.value.trim();
        
        if (!result && !observation) {
            utils.showNotification('Por favor, ingrese al menos un resultado o una observación', 'warning');
            return;
        }

        // Obtener información del área actual
        const areaData = app.getScreenData('area-selection-screen');
        const processData = app.getScreenData('process-selection-screen');
        const descriptionData = app.getScreenData('description-screen');
        
        // Debug: mostrar qué datos tenemos
        console.log('Debug - areaData:', areaData);
        console.log('Debug - processData:', processData);
        console.log('Debug - descriptionData:', descriptionData);
        
        let areaId = null;
        let areaName = '';
        
        if (areaData && areaData.isNewArea) {
            // Es área nueva
            areaId = descriptionData?.newAreaId;
            areaName = descriptionData?.description || 'Nueva Área';
        } else if (processData && processData.area) {
            // Es área existente
            areaId = processData.area;
            if (areaId && areaId.startsWith('dynamic-')) {
                const dynamicAreas = JSON.parse(localStorage.getItem('dynamicAreas') || '[]');
                const dynamicArea = dynamicAreas.find(area => area.id === areaId);
                areaName = dynamicArea ? dynamicArea.name : areaId;
            } else if (areaId) {
                const areaNames = {
                    'pequena-mineria': 'Pequeña Minería',
                    'servicio-voladura': 'Servicio Voladura',
                    'arrime': 'Arrime'
                };
                areaName = areaNames[areaId] || areaId;
            }
        }

        // Mostrar indicador de carga
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;

        try {
            // Guardar datos del área
            if (areaId && areaId.trim()) {
                const areaDataToSave = {
                    result: result,
                    observation: observation,
                    lastUpdated: new Date().toISOString()
                };
                fileManager.saveAreaData(areaId, areaDataToSave);
            }
            
            // Simular envío a servidor
            await this.simulateServerSubmission({ result, observation });
            
            // Guardar datos localmente
            this.saveData({ result, observation });
            
            // Mostrar resumen completo
            this.showCompleteSummary(areaId, areaName);
            
        } catch (error) {
            utils.showNotification('Error al guardar: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateServerSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular éxito 95% de las veces
                if (Math.random() > 0.05) {
                    resolve({ success: true, id: Date.now() });
                } else {
                    reject(new Error('Error de conexión'));
                }
            }, 2000);
        });
    }

    showCompleteSummary(areaId, areaName) {
        // Obtener todos los datos del flujo
        const allData = app.getStoredData();
        
        // Obtener datos específicos del área si existe
        let areaSpecificData = {};
        if (areaId && areaId.trim()) {
            areaSpecificData = fileManager.getAreaData(areaId);
        }
        
        // Crear modal de resumen
        const modal = document.createElement('div');
        modal.className = 'summary-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 90%;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        // Construir contenido del resumen
        let summaryHTML = `
            <h2 style="color: #4CAF50; margin-bottom: 20px;">✅ Proceso Completado</h2>
            <div style="margin-bottom: 20px;">
                <h3>Resumen del proceso:</h3>
        `;

        // Datos de login
        if (allData['login-screen']) {
            summaryHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong>Usuario:</strong> ${allData['login-screen'].username || 'N/A'}
                </div>
            `;
        }

        // Datos de selección de área
        if (allData['area-selection-screen']) {
            summaryHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong>Área seleccionada:</strong> ${allData['area-selection-screen'].areaName || 'N/A'}
                </div>
            `;
        }

        // Datos de descripción y área
        if (areaName) {
            summaryHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong>Área:</strong> ${areaName}
                    ${areaSpecificData.description ? `<br><strong>Descripción:</strong> ${areaSpecificData.description}` : ''}
                    ${areaSpecificData.attachments ? `<br><strong>Archivos adjuntos:</strong> ${areaSpecificData.attachments}` : ''}
                </div>
            `;
        } else if (allData['description-screen']) {
            summaryHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong>Descripción:</strong> ${allData['description-screen'].description || 'N/A'}
                    <br><strong>Archivos adjuntos:</strong> ${allData['description-screen'].attachments || 0}
                </div>
            `;
        }

        // Datos de resultado
        if (allData['result-screen']) {
            summaryHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong>Resultado:</strong> ${allData['result-screen'].result || 'N/A'}
                    <br><strong>Observación:</strong> ${allData['result-screen'].observation || 'N/A'}
                </div>
            `;
        }

        summaryHTML += `
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="restart-btn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Reiniciar Proceso</button>
                <button id="close-btn" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                ">Cerrar</button>
            </div>
        `;

        modalContent.innerHTML = summaryHTML;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Event listeners para botones
        modal.querySelector('#restart-btn').addEventListener('click', () => {
            this.restartProcess();
            modal.remove();
        });

        modal.querySelector('#close-btn').addEventListener('click', () => {
            modal.remove();
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });

        utils.showNotification('Proceso completado exitosamente', 'success');
    }

    restartProcess() {
        // Limpiar todos los datos
        app.clearStoredData();
        localStorage.removeItem('currentUser');
        
        // Navegar al inicio
        document.dispatchEvent(new CustomEvent('navigateTo', {
            detail: {
                screen: 'login-screen',
                data: {}
            }
        }));

        utils.showNotification('Proceso reiniciado', 'info');
    }

    onScreenShow() {
        this.loadStoredData();
        
        // Mostrar instrucciones
        utils.showNotification('Complete el resultado y observación para finalizar', 'info');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ResultScreen();
});
