// Funcionalidad de la pantalla de selección de proceso
class ProcessSelectionScreen {
    constructor() {
        this.form = document.getElementById('process-form');
        this.areaSelect = document.getElementById('process-area-select');
        this.processSelect = document.getElementById('process-select');
        this.subprocessSelect = document.getElementById('subprocess-select');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredData();
        this.setupDefaultOptions();
    }

    setupEventListeners() {
        // Manejar envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'process-selection-screen') {
                this.onScreenShow();
            }
        });
    }

    setupDefaultOptions() {
        // Configurar todas las opciones de área (para mostrar la seleccionada)
        this.areaSelect.innerHTML = '';
        const areaOptions = [
            { value: 'pequena-mineria', text: 'Pequeña Minería' },
            { value: 'servicio-voladura', text: 'Servicio Voladura' },
            { value: 'arrime', text: 'Arrime' },
            { value: 'no-disponible', text: 'No disponible' }
        ];
        
        areaOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this.areaSelect.appendChild(optionElement);
        });

        // Configurar proceso único: Inspección
        this.processSelect.innerHTML = '';
        const processOption = document.createElement('option');
        processOption.value = 'inspeccion';
        processOption.textContent = 'Inspección';
        this.processSelect.appendChild(processOption);

        // Configurar subproceso único: Bla bla
        this.subprocessSelect.innerHTML = '';
        const subprocessOption = document.createElement('option');
        subprocessOption.value = 'bla-bla';
        subprocessOption.textContent = 'Bla bla';
        this.subprocessSelect.appendChild(subprocessOption);
    }

    async handleSubmit() {
        const formData = {
            area: this.areaSelect.value,
            process: this.processSelect.value,
            subprocess: this.subprocessSelect.value
        };

        // Validar que todos los campos estén seleccionados
        if (!formData.area || !formData.process || !formData.subprocess) {
            utils.showNotification('Por favor, complete todos los campos', 'warning');
            return;
        }

        // Mostrar indicador de carga
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;

        try {
            // Simular guardado
            await this.simulateSave(formData);
            
            // Guardar datos
            this.saveData(formData);
            
            // Mostrar mensaje de éxito
            utils.showNotification('Proceso guardado exitosamente', 'success');
            
            // Navegar a la siguiente pantalla
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('navigateTo', {
                    detail: {
                        screen: 'description-screen',
                        data: {
                            'process-selection-screen': formData
                        }
                    }
                }));
            }, 1000);

        } catch (error) {
            utils.showNotification('Error al guardar: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateSave(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular éxito 95% de las veces
                if (Math.random() > 0.05) {
                    resolve({ success: true, id: Date.now() });
                } else {
                    reject(new Error('Error de conexión'));
                }
            }, 1500);
        });
    }

    saveData(data) {
        app.saveScreenData('process-selection-screen', data);
    }

    loadStoredData() {
        // Cargar datos de la pantalla anterior (área seleccionada)
        const areaData = app.getScreenData('area-selection-screen');
        if (areaData && areaData.selectedArea) {
            this.areaSelect.value = areaData.selectedArea;
        }

        // Cargar datos guardados de esta pantalla
        const storedData = app.getScreenData('process-selection-screen');
        if (storedData) {
            if (storedData.area) {
                this.areaSelect.value = storedData.area;
            }
            if (storedData.process) {
                this.processSelect.value = storedData.process;
            }
            if (storedData.subprocess) {
                this.subprocessSelect.value = storedData.subprocess;
            }
        }
    }

    onScreenShow() {
        this.loadStoredData();
        
        // Mostrar instrucciones
        utils.showNotification('Complete la configuración del proceso', 'info');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProcessSelectionScreen();
});
