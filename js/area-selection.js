// Funcionalidad de la pantalla de selección de área
class AreaSelectionScreen {
    constructor() {
        this.form = document.getElementById('area-form');
        this.areaSelect = document.getElementById('area-select');
        this.selectedArea = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredSelection();
        this.loadDynamicAreas();
    }

    setupEventListeners() {
        // Manejar envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'area-selection-screen') {
                this.onScreenShow();
            }
        });
    }

    handleSubmit() {
        const selectedArea = this.areaSelect.value;
        
        if (!selectedArea) {
            utils.showNotification('Por favor, seleccione un área', 'warning');
            return;
        }

        this.selectedArea = selectedArea;
        const areaName = this.areaSelect.options[this.areaSelect.selectedIndex].text;

        // Guardar selección
        this.saveSelection();

        // Mostrar confirmación visual
        utils.showNotification(`Área seleccionada: ${areaName}`, 'success');

        // Si es "No disponible", ir directo a descripción
        if (this.selectedArea === 'no-disponible') {
            document.dispatchEvent(new CustomEvent('navigateTo', {
                detail: {
                    screen: 'description-screen',
                    data: {
                        'area-selection-screen': {
                            selectedArea: this.selectedArea,
                            areaName: areaName,
                            isNewArea: true
                        }
                    }
                }
            }));
        } else {
            // Si es área existente, ir a proceso
            document.dispatchEvent(new CustomEvent('navigateTo', {
                detail: {
                    screen: 'process-selection-screen',
                    data: {
                        'area-selection-screen': {
                            selectedArea: this.selectedArea,
                            areaName: areaName,
                            isNewArea: false
                        }
                    }
                }
            }));
        }
    }

    saveSelection() {
        if (this.selectedArea) {
            app.saveScreenData('area-selection-screen', {
                selectedArea: this.selectedArea
            });
        }
    }

    loadStoredSelection() {
        const storedData = app.getScreenData('area-selection-screen');
        if (storedData.selectedArea) {
            this.areaSelect.value = storedData.selectedArea;
            this.selectedArea = storedData.selectedArea;
        }
    }

    onScreenShow() {
        // Cargar datos guardados
        this.loadStoredSelection();
        
        // Mostrar instrucciones
        if (!this.selectedArea) {
            utils.showNotification('Seleccione un área para continuar', 'info');
        }
    }

    // Método para obtener el área seleccionada
    getSelectedArea() {
        return this.selectedArea;
    }

    // Método para verificar si un área está disponible
    isAreaAvailable(areaId) {
        return areaId !== 'no-disponible';
    }

    // Cargar áreas dinámicas desde localStorage
    loadDynamicAreas() {
        const dynamicAreas = this.getDynamicAreas();
        
        // Limpiar opciones existentes (mantener solo las básicas)
        this.areaSelect.innerHTML = '';
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Seleccione un área --';
        this.areaSelect.appendChild(defaultOption);
        
        // Agregar áreas básicas
        const basicAreas = [
            { value: 'pequena-mineria', text: 'Pequeña Minería' },
            { value: 'servicio-voladura', text: 'Servicio Voladura' },
            { value: 'arrime', text: 'Arrime' },
            { value: 'no-disponible', text: 'No disponible' }
        ];
        
        basicAreas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.value;
            option.textContent = area.text;
            this.areaSelect.appendChild(option);
        });
        
        // Agregar áreas dinámicas
        dynamicAreas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.name;
            this.areaSelect.appendChild(option);
        });
    }

    // Obtener áreas dinámicas desde localStorage
    getDynamicAreas() {
        const stored = localStorage.getItem('dynamicAreas');
        return stored ? JSON.parse(stored) : [];
    }

    // Agregar nueva área dinámica
    addDynamicArea(areaName) {
        const dynamicAreas = this.getDynamicAreas();
        const newArea = {
            id: `dynamic-${Date.now()}`,
            name: areaName,
            createdAt: new Date().toISOString()
        };
        
        dynamicAreas.push(newArea);
        localStorage.setItem('dynamicAreas', JSON.stringify(dynamicAreas));
        
        // Recargar la lista de áreas
        this.loadDynamicAreas();
        
        return newArea;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.areaSelectionScreen = new AreaSelectionScreen();
});
