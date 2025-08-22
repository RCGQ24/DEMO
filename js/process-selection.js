// Funcionalidad de la pantalla de selección de proceso
class ProcessSelectionScreen {
    constructor() {
        this.form = document.getElementById('process-form');
        this.areaSelect = document.getElementById('area-select');
        this.processSelect = document.getElementById('process-select');
        this.subprocessSelect = document.getElementById('subprocess-select');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredData();
        this.updateProcessOptions();
    }

    setupEventListeners() {
        // Manejar envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Actualizar opciones cuando cambie el área
        this.areaSelect.addEventListener('change', () => {
            this.updateProcessOptions();
        });

        // Actualizar sub-procesos cuando cambie el proceso
        this.processSelect.addEventListener('change', () => {
            this.updateSubprocessOptions();
        });

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'process-selection-screen') {
                this.onScreenShow();
            }
        });
    }

    updateProcessOptions() {
        const selectedArea = this.areaSelect.value;
        
        // Limpiar opciones actuales
        this.processSelect.innerHTML = '';
        
        // Definir procesos según el área
        const processOptions = {
            'arrime': [
                { value: 'inspeccion', text: 'Inspección' },
                { value: 'mantenimiento', text: 'Mantenimiento' },
                { value: 'control', text: 'Control' }
            ],
            'pequena-mineria': [
                { value: 'extraccion', text: 'Extracción' },
                { value: 'procesamiento', text: 'Procesamiento' },
                { value: 'transporte', text: 'Transporte' }
            ],
            'servicio-voladura': [
                { value: 'perforacion', text: 'Perforación' },
                { value: 'carga', text: 'Carga' },
                { value: 'voladura', text: 'Voladura' }
            ]
        };

        const options = processOptions[selectedArea] || [
            { value: 'inspeccion', text: 'Inspección' },
            { value: 'mantenimiento', text: 'Mantenimiento' },
            { value: 'control', text: 'Control' }
        ];

        // Agregar opciones
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this.processSelect.appendChild(optionElement);
        });

        // Actualizar sub-procesos
        this.updateSubprocessOptions();
    }

    updateSubprocessOptions() {
        const selectedProcess = this.processSelect.value;
        
        // Limpiar opciones actuales
        this.subprocessSelect.innerHTML = '';
        
        // Definir sub-procesos según el proceso
        const subprocessOptions = {
            'inspeccion': [
                { value: 'bla-bla', text: 'Bla bla' },
                { value: 'revision', text: 'Revisión' },
                { value: 'verificacion', text: 'Verificación' }
            ],
            'mantenimiento': [
                { value: 'preventivo', text: 'Preventivo' },
                { value: 'correctivo', text: 'Correctivo' },
                { value: 'predictivo', text: 'Predictivo' }
            ],
            'control': [
                { value: 'calidad', text: 'Control de Calidad' },
                { value: 'seguridad', text: 'Control de Seguridad' },
                { value: 'no-disponible', text: 'No disponible' }
            ]
        };

        const options = subprocessOptions[selectedProcess] || [
            { value: 'bla-bla', text: 'Bla bla' },
            { value: 'no-disponible', text: 'No disponible' }
        ];

        // Agregar opciones
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this.subprocessSelect.appendChild(optionElement);
        });
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
        const storedData = app.getScreenData('process-selection-screen');
        
        if (storedData.area) {
            this.areaSelect.value = storedData.area;
            this.updateProcessOptions();
        }
        
        if (storedData.process) {
            this.processSelect.value = storedData.process;
            this.updateSubprocessOptions();
        }
        
        if (storedData.subprocess) {
            this.subprocessSelect.value = storedData.subprocess;
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
