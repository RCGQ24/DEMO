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

        // Navegar a la siguiente pantalla con los datos
        document.dispatchEvent(new CustomEvent('navigateTo', {
            detail: {
                screen: 'process-selection-screen',
                data: {
                    'area-selection-screen': {
                        selectedArea: this.selectedArea,
                        areaName: areaName
                    }
                }
            }
        }));
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AreaSelectionScreen();
});
