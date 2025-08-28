// Funcionalidad de la pantalla de descripción y adjuntos
class DescriptionScreen {
    constructor() {
        this.form = document.getElementById('description-form');
        this.descriptionTextarea = document.getElementById('description');
        this.attachmentsList = document.getElementById('attachments-list');
        
        // Botones de acción para área nueva
        this.takePhotoBtn = document.getElementById('take-photo');
        this.uploadImageBtn = document.getElementById('upload-image');
        this.uploadFileBtn = document.getElementById('upload-file');
        this.recordAudioBtn = document.getElementById('record-audio');
        
        // Botones de acción para área existente
        this.existingTakePhotoBtn = document.getElementById('existing-take-photo');
        this.existingUploadImageBtn = document.getElementById('existing-upload-image');
        this.existingUploadFileBtn = document.getElementById('existing-upload-file');
        this.existingRecordAudioBtn = document.getElementById('existing-record-audio');
        
        // Inputs ocultos
        this.fileInput = document.getElementById('file-input');
        this.imageInput = document.getElementById('image-input');
        this.cameraInput = document.getElementById('camera-input');
        
        // Variables de estado
        this.attachments = [];
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        
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

        // Botones de acción para área nueva
        this.takePhotoBtn.addEventListener('click', () => this.takePhoto());
        this.uploadImageBtn.addEventListener('click', () => this.uploadImage());
        this.uploadFileBtn.addEventListener('click', () => this.uploadFile());
        this.recordAudioBtn.addEventListener('click', () => this.toggleAudioRecording());
        
        // Botones de acción para área existente
        this.existingTakePhotoBtn.addEventListener('click', () => this.takePhoto());
        this.existingUploadImageBtn.addEventListener('click', () => this.uploadImage());
        this.existingUploadFileBtn.addEventListener('click', () => this.uploadFile());
        this.existingRecordAudioBtn.addEventListener('click', () => this.toggleAudioRecording());

        // Inputs de archivo
        this.cameraInput.addEventListener('change', (e) => this.handleCameraFile(e));
        this.imageInput.addEventListener('change', (e) => this.handleImageFile(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'description-screen') {
                this.onScreenShow();
            }
        });

        // Contador de caracteres para descripción
        this.descriptionTextarea.addEventListener('input', () => {
            this.updateCharCounter();
        });
    }

    // ===== FUNCIONALIDADES DE CÁMARA =====
    async takePhoto() {
        try {
            // Verificar si el navegador soporta getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                // Fallback: usar input file con capture
                this.cameraInput.click();
                return;
            }

            // Solicitar acceso a la cámara
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Cámara trasera en móviles
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });

            // Crear elemento de video para capturar
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                background: black;
            `;

            // Botón para capturar
            const captureBtn = document.createElement('button');
            captureBtn.textContent = '📸 Capturar';
            captureBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                padding: 15px 30px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
            `;

            // Botón para cancelar
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '❌ Cancelar';
            cancelBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 10px 20px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 14px;
                cursor: pointer;
            `;

            document.body.appendChild(video);
            document.body.appendChild(captureBtn);
            document.body.appendChild(cancelBtn);

            // Manejar captura
            captureBtn.addEventListener('click', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);

                // Convertir a blob
                canvas.toBlob((blob) => {
                    const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    this.addAttachment(file, 'photo');
                }, 'image/jpeg', 0.8);

                this.cleanupCamera();
            });

            // Manejar cancelar
            cancelBtn.addEventListener('click', () => {
                this.cleanupCamera();
            });

        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            utils.showNotification('No se pudo acceder a la cámara. Usando selector de archivos.', 'warning');
            this.cameraInput.click();
        }
    }

    cleanupCamera() {
        // Detener stream de video
        const video = document.querySelector('video');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        // Remover elementos
        document.querySelectorAll('video, button').forEach(el => {
            if (el.style.position === 'fixed') {
                el.remove();
            }
        });
    }

    handleCameraFile(event) {
        const file = event.target.files[0];
        if (file) {
            this.addAttachment(file, 'photo');
        }
        event.target.value = ''; // Limpiar input
    }

    // ===== FUNCIONALIDADES DE ARCHIVOS =====
    uploadImage() {
        this.imageInput.click();
    }

    uploadFile() {
        this.fileInput.click();
    }

    handleImageFile(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                this.addAttachment(file, 'image');
            } else {
                utils.showNotification('Por favor, seleccione un archivo de imagen', 'error');
            }
        }
        event.target.value = '';
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.addAttachment(file, 'file');
        }
        event.target.value = '';
    }

    // ===== FUNCIONALIDADES DE AUDIO =====
    async toggleAudioRecording() {
        if (this.isRecording) {
            this.stopAudioRecording();
        } else {
            await this.startAudioRecording();
        }
    }

    async startAudioRecording() {
        try {
            // Verificar soporte
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                utils.showNotification('Tu navegador no soporta grabación de audio', 'error');
                return;
            }

            // Solicitar acceso al micrófono
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Crear MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            // Configurar eventos
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const file = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
                this.addAttachment(file, 'audio');
                
                // Detener stream
                stream.getTracks().forEach(track => track.stop());
            };

            // Iniciar grabación
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordAudioBtn.classList.add('recording');
            this.recordAudioBtn.querySelector('span').textContent = 'Detener grabación';

            utils.showNotification('Grabación iniciada. Toca nuevamente para detener.', 'info');

        } catch (error) {
            console.error('Error al iniciar grabación:', error);
            utils.showNotification('No se pudo acceder al micrófono', 'error');
        }
    }

    stopAudioRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordAudioBtn.classList.remove('recording');
            this.recordAudioBtn.querySelector('span').textContent = 'Grabar audio';
            
            utils.showNotification('Grabación detenida', 'success');
        }
    }

    // ===== MANEJO DE ADJUNTOS =====
    addAttachment(file, type) {
        const attachment = {
            id: utils.generateId(),
            file: file,
            type: type,
            name: file.name,
            size: file.size,
            date: new Date()
        };

        this.attachments.push(attachment);
        this.renderAttachment(attachment);
        this.updateAttachmentsCounter();
        this.saveAttachments();

        utils.showNotification(`Archivo agregado: ${file.name}`, 'success');
    }

    renderAttachment(attachment) {
        const attachmentElement = document.createElement('div');
        attachmentElement.className = 'attachment-item';
        attachmentElement.dataset.id = attachment.id;

        // Icono según tipo
        const icons = {
            'photo': '📷',
            'image': '🖼️',
            'file': '📄',
            'audio': '🎵'
        };

        attachmentElement.innerHTML = `
            <div class="icon">${icons[attachment.type] || '📎'}</div>
            <div class="info">
                <div class="name">${attachment.name}</div>
                <div class="size">${utils.formatFileSize(attachment.size)}</div>
            </div>
            <button class="remove" onclick="descriptionScreen.removeAttachment('${attachment.id}')">🗑️</button>
        `;

        this.attachmentsList.appendChild(attachmentElement);
    }

    removeAttachment(id) {
        const index = this.attachments.findIndex(att => att.id === id);
        if (index !== -1) {
            this.attachments.splice(index, 1);
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
            }
            this.updateAttachmentsCounter();
            this.saveAttachments();
            utils.showNotification('Archivo removido', 'info');
        }
    }

    // ===== MANEJO DE DATOS =====
    saveAttachments() {
        app.saveScreenData('description-screen', {
            attachments: this.attachments.map(att => ({
                id: att.id,
                name: att.name,
                size: att.size,
                type: att.type,
                date: att.date
            }))
        });
    }

    loadStoredData() {
        const storedData = app.getScreenData('description-screen');
        
        if (storedData.description) {
            this.descriptionTextarea.value = storedData.description;
            this.updateCharCounter();
        }

        // Los archivos no se pueden restaurar completamente por seguridad del navegador
        // pero podemos mostrar un mensaje
        if (storedData.attachments && storedData.attachments.length > 0) {
            utils.showNotification(`${storedData.attachments.length} archivo(s) adjunto(s) previamente`, 'info');
        }
    }

    updateCharCounter() {
        const maxLength = 1000;
        const currentLength = this.descriptionTextarea.value.length;
        
        // Remover contador previo
        const existingCounter = this.descriptionTextarea.parentNode.querySelector('.char-counter');
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
        }

        this.descriptionTextarea.parentNode.appendChild(counter);
    }

    updateAttachmentsCounter() {
        const counter = document.getElementById('attachments-counter');
        if (counter) {
            const current = this.attachments.length;
            const required = 2;
            counter.textContent = `${current}/${required}`;
            
            // Cambiar color según el progreso
            if (current >= required) {
                counter.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            } else if (current > 0) {
                counter.style.background = 'linear-gradient(135deg, #FFD700 0%, #F7931E 100%)';
            } else {
                counter.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)';
            }
        }
    }

    updateExistingAttachmentsCounter() {
        const counter = document.getElementById('existing-attachments-counter');
        if (counter) {
            counter.textContent = this.attachments.length;
        }
    }

    renderExistingAttachments() {
        const container = document.getElementById('existing-attachments-list');
        if (container) {
            container.innerHTML = '';
            this.attachments.forEach(attachment => {
                this.renderExistingAttachment(attachment);
            });
        }
    }

    renderExistingAttachment(attachment) {
        const container = document.getElementById('existing-attachments-list');
        if (!container) return;
        
        const attachmentElement = document.createElement('div');
        attachmentElement.className = 'attachment-item';
        attachmentElement.dataset.id = attachment.id;

        // Icono según tipo
        const icons = {
            'photo': '📷',
            'image': '🖼️',
            'file': '📄',
            'audio': '🎵'
        };

        attachmentElement.innerHTML = `
            <div class="icon">${icons[attachment.type] || '📎'}</div>
            <div class="info">
                <div class="name">${attachment.name}</div>
                <div class="size">${utils.formatFileSize(attachment.size)}</div>
            </div>
            <button class="remove" onclick="descriptionScreen.removeExistingAttachment('${attachment.id}')">🗑️</button>
        `;

        container.appendChild(attachmentElement);
    }

    removeExistingAttachment(id) {
        const index = this.attachments.findIndex(att => att.id === id);
        if (index !== -1) {
            this.attachments.splice(index, 1);
            this.updateExistingAttachmentsCounter();
            this.renderExistingAttachments();
            utils.showNotification('Archivo removido', 'info');
        }
    }

    async handleSubmit() {
        // Verificar si es área nueva o existente
        const areaData = app.getScreenData('area-selection-screen');
        const processData = app.getScreenData('process-selection-screen');
        
        let isNewArea = false;
        let formData = {};
        
        if (areaData && areaData.isNewArea) {
            // Es área nueva (vino directo de área-selection)
            isNewArea = true;
            
            const description = this.descriptionTextarea.value.trim();
            
            if (!description) {
                utils.showNotification('Por favor, ingrese el título de la nueva área', 'warning');
                return;
            }
            
            if (this.attachments.length < 2) {
                utils.showNotification('Debe adjuntar al menos 2 elementos (foto, imagen, archivo o audio)', 'warning');
                return;
            }
            
            formData = {
                description: description,
                attachments: this.attachments.length,
                isNewArea: true
            };
            
            app.saveScreenData('description-screen', formData);
            utils.showNotification('Nueva área creada exitosamente', 'success');
        } else {
            // Es área existente (vino de process-selection)
            isNewArea = false;
            
            formData = {
                isNewArea: false,
                existingArea: processData.area,
                additionalAttachments: this.attachments.length
            };
            
            app.saveScreenData('description-screen', formData);
            utils.showNotification('Archivos adicionales guardados exitosamente', 'success');
        }

        // Navegar a la siguiente pantalla
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('navigateTo', {
                detail: {
                    screen: 'result-screen',
                    data: {
                        'description-screen': formData
                    }
                }
            }));
        }, 1000);
    }

    onScreenShow() {
        this.loadStoredData();
        this.updateCharCounter();
        
        // Detener grabación si está activa
        if (this.isRecording) {
            this.stopAudioRecording();
        }
        
        // Determinar si es área nueva o existente
        this.determineAreaType();
        
        // Mostrar instrucciones según el tipo
        const processData = app.getScreenData('process-selection-screen');
        if (processData && processData.area === 'no-disponible') {
            utils.showNotification('Complete el título y adjunte al menos 2 elementos', 'info');
        } else {
            utils.showNotification('Revisando datos del área existente', 'info');
        }
    }

    determineAreaType() {
        // Verificar si viene directo de área-selection (área nueva) o de process-selection (área existente)
        const areaData = app.getScreenData('area-selection-screen');
        const processData = app.getScreenData('process-selection-screen');
        
        let isNewArea = false;
        let areaInfo = null;
        
        if (areaData && areaData.isNewArea) {
            // Viene directo de área-selection (área nueva)
            isNewArea = true;
            areaInfo = areaData;
        } else if (processData) {
            // Viene de process-selection (área existente)
            isNewArea = false;
            areaInfo = processData;
        }
        
        // Actualizar título de la pantalla
        const title = document.getElementById('description-title');
        if (isNewArea) {
            title.textContent = 'Crear Nueva Área';
        } else {
            title.textContent = 'Datos del Área Existente';
        }
        
        // Mostrar/ocultar secciones según el tipo
        const newAreaSection = document.getElementById('new-area-section');
        const existingAreaSection = document.getElementById('existing-area-section');
        
        if (isNewArea) {
            newAreaSection.style.display = 'block';
            existingAreaSection.style.display = 'none';
            this.setupNewAreaValidation();
        } else {
            newAreaSection.style.display = 'none';
            existingAreaSection.style.display = 'block';
            this.loadExistingAreaData();
        }
    }

    setupNewAreaValidation() {
        // Configurar validación para área nueva
        this.attachments = [];
        this.updateAttachmentsCounter();
        this.renderAttachments();
    }

    loadExistingAreaData() {
        // Obtener datos reales del área seleccionada
        const areaData = app.getScreenData('area-selection-screen');
        const processData = app.getScreenData('process-selection-screen');
        
        if (!areaData || !processData) return;
        
        // Simular datos existentes basados en el área seleccionada
        const areaNames = {
            'pequena-mineria': 'Pequeña Minería',
            'servicio-voladura': 'Servicio Voladura',
            'arrime': 'Arrime'
        };
        
        const existingData = {
            area: areaNames[areaData.selectedArea] || areaData.selectedArea,
            process: processData.process || 'Inspección',
            subprocess: processData.subprocess || 'Bla bla',
            description: 'Área de trabajo existente con datos previos',
            attachments: [
                { type: 'photo', name: 'foto_inspeccion_001.jpg', size: '2.3 MB' },
                { type: 'file', name: 'reporte_previo.pdf', size: '1.8 MB' }
            ],
            lastUpdate: '15/03/2024'
        };
        
        const infoContainer = document.getElementById('existing-area-info');
        infoContainer.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Área:</strong> ${existingData.area}<br>
                <strong>Proceso:</strong> ${existingData.process} - ${existingData.subprocess}<br>
                <strong>Descripción:</strong> ${existingData.description}<br>
                <strong>Última actualización:</strong> ${existingData.lastUpdate}
            </div>
            <div style="margin-top: 15px;">
                <strong>Adjuntos existentes:</strong><br>
                ${existingData.attachments.map(att => `• ${att.name} (${att.size})`).join('<br>')}
            </div>
        `;
        
        // Configurar para área existente
        this.attachments = [];
        this.updateExistingAttachmentsCounter();
        this.renderExistingAttachments();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.descriptionScreen = new DescriptionScreen();
});
