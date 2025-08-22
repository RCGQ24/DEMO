// Aplicación principal - Manejo de navegación entre pantallas
class App {
    constructor() {
        this.currentScreen = 'login-screen';
        this.screens = [
            'login-screen',
            'area-selection-screen', 
            'process-selection-screen',
            'description-screen',
            'result-screen'
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen(this.currentScreen);
    }

    setupEventListeners() {
        // Escuchar eventos de navegación desde otros módulos
        document.addEventListener('navigateTo', (e) => {
            this.navigateTo(e.detail.screen, e.detail.data);
        });

        // Manejar navegación con botones de retroceso
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.screen) {
                this.showScreen(e.state.screen);
            }
        });
    }

    navigateTo(screenId, data = {}) {
        // Validar que la pantalla existe
        if (!this.screens.includes(screenId)) {
            console.error(`Pantalla ${screenId} no encontrada`);
            return;
        }

        // Guardar datos en sessionStorage si se proporcionan
        if (Object.keys(data).length > 0) {
            sessionStorage.setItem('appData', JSON.stringify(data));
        }

        // Actualizar historial del navegador
        const state = { screen: screenId, data };
        const url = `#${screenId}`;
        history.pushState(state, '', url);

        this.showScreen(screenId);
    }

    showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar la pantalla actual
        const currentScreen = document.getElementById(screenId);
        if (currentScreen) {
            currentScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Disparar evento para que otros módulos sepan que cambió la pantalla
            document.dispatchEvent(new CustomEvent('screenChanged', {
                detail: { screenId, data: this.getStoredData() }
            }));
        }
    }

    getStoredData() {
        const data = sessionStorage.getItem('appData');
        return data ? JSON.parse(data) : {};
    }

    clearStoredData() {
        sessionStorage.removeItem('appData');
    }

    // Método para obtener datos de una pantalla específica
    getScreenData(screenId) {
        const allData = this.getStoredData();
        return allData[screenId] || {};
    }

    // Método para guardar datos de una pantalla específica
    saveScreenData(screenId, data) {
        const allData = this.getStoredData();
        allData[screenId] = { ...allData[screenId], ...data };
        sessionStorage.setItem('appData', JSON.stringify(allData));
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Utilidades globales
window.utils = {
    // Formatear tamaño de archivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validar email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos básicos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        // Colores según el tipo
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};
