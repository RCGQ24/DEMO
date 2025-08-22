// Funcionalidad de la pantalla de selección de área
class AreaSelectionScreen {
    constructor() {
        this.areaList = document.querySelector('.area-list');
        this.selectedArea = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredSelection();
    }

    setupEventListeners() {
        // Manejar clics en elementos de área
        this.areaList.addEventListener('click', (e) => {
            const areaItem = e.target.closest('.area-item');
            if (areaItem && !areaItem.classList.contains('disabled')) {
                this.selectArea(areaItem);
            }
        });

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'area-selection-screen') {
                this.onScreenShow();
            }
        });

        // Doble clic para confirmar selección
        this.areaList.addEventListener('dblclick', (e) => {
            const areaItem = e.target.closest('.area-item');
            if (areaItem && !areaItem.classList.contains('disabled') && this.selectedArea) {
                this.confirmSelection();
            }
        });
    }

    selectArea(areaItem) {
        // Remover selección previa
        document.querySelectorAll('.area-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Seleccionar nuevo elemento
        areaItem.classList.add('selected');
        this.selectedArea = areaItem.dataset.area;

        // Guardar selección
        this.saveSelection();

        // Mostrar confirmación visual
        utils.showNotification(`Área seleccionada: ${areaItem.querySelector('span').textContent}`, 'success');

        // Auto-navegar después de un breve delay
        setTimeout(() => {
            this.confirmSelection();
        }, 1500);
    }

    confirmSelection() {
        if (!this.selectedArea) {
            utils.showNotification('Por favor, seleccione un área', 'warning');
            return;
        }

        // Obtener el nombre del área seleccionada
        const selectedItem = document.querySelector('.area-item.selected');
        const areaName = selectedItem ? selectedItem.querySelector('span').textContent : this.selectedArea;

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
            const areaItem = document.querySelector(`[data-area="${storedData.selectedArea}"]`);
            if (areaItem && !areaItem.classList.contains('disabled')) {
                this.selectArea(areaItem);
            }
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
        const areaItem = document.querySelector(`[data-area="${areaId}"]`);
        return areaItem && !areaItem.classList.contains('disabled');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AreaSelectionScreen();
});
