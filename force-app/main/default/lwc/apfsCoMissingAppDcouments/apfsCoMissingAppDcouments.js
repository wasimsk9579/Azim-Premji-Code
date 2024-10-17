import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getMissingDocumentTypes from '@salesforce/apex/APFS_ContactDocumentsController.getMissingDocumentTypes';
import uploadFilesToServer from '@salesforce/apex/APFS_MyProfileDocumentsController.uploadFilesToServer';
import deleteFileByContentDocumentId from '@salesforce/apex/APFS_MyProfileDocumentsController.deleteFileByContentDocumentId';
import updateDocumentStatus from '@salesforce/apex/APFS_ContactDocumentsController.updateDocumentStatus';
import HELP_TEXT_FOR_UPLOAD_LABEL from '@salesforce/label/c.Help_Text_For_Upload';
import MORE_THAN_3_FILES_ERROR_LABEL from '@salesforce/label/c.More_Than_3_Files_Error_Label';	
import FILE_SIZE_ERROR from '@salesforce/label/c.File_Size_Error_CustomLabel';
import NO_INTERNET_CONNECTION_LABEL from '@salesforce/label/c.No_Internet_Connection_label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';
import DOCUMENTS_FULLY_REJECTED from '@salesforce/label/c.Documents_fully_rejected';
import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import MAX_3_FILE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Max_3_file_error_custom_label';
import COMPLETE_THIS_FIELD_LABEL from '@salesforce/label/c.Complete_this_field_Label';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import FILE_DELETED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Deleted_Successfully';
import YOU_CAN_ONLY_UPLOAD_1_FILE_FOR_PROFILE_PHOTO from '@salesforce/label/c.You_can_only_upload_1_file_for_Profile_Photo';
import DUPLICATE_FILE_FOUND_LABEL from '@salesforce/label/c.Duplicate_file_found';
import NEWLY_UPLOADED_DOCUMENT from '@salesforce/label/c.Newly_Uploaded_Document';
import FILE_UPLOADED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Uploaded_Successfully';


export default class ApfsCoMissingAppDocuments extends LightningElement {
    @api applicationId;
    @api missingDocType;
    @track missingDocumentsWithFiles = [];
    @track isLoading = false;
    fileUploadHelpText = HELP_TEXT_FOR_UPLOAD_LABEL;
    moreThan3FilesErrorLabel = MORE_THAN_3_FILES_ERROR_LABEL;
    documentFullyRejecetHeading = DOCUMENTS_FULLY_REJECTED;
    newlyUploadedLabel = NEWLY_UPLOADED_DOCUMENT;

    maxFiles = 3;
    maxFileSize = 1.5 * 1024 * 1024; // 1.5MB
    acceptedFormats = ['pdf', 'jpeg', 'jpg', 'png'];
    validMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    connectedCallback() {
        this.fetchMissingDocuments();
    }

    fetchMissingDocuments() {
        this.isLoading = true;
        getMissingDocumentTypes({ applicationId: this.applicationId,missingType:this.missingDocType })
            .then((result) => {
                this.missingDocumentsWithFiles = result.map((docType) => ({
                    docType,
                    files: []
                }));
                this.checkMissingDocuments();
            })
            .catch((error) => {
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    checkMissingDocuments() {
        const isEmpty = this.missingDocumentsWithFiles.length === 0;
        const event = new CustomEvent('missingdocumentscheck', {
            detail: { isEmpty }
        });
        this.dispatchEvent(event);
    }

    handleFileChange(event) {
        const docType = event.target.dataset.documentType;
        const files = Array.from(event.target.files);
        event.target.setCustomValidity('');
        event.target.reportValidity();    
        const docTypeObj = this.missingDocumentsWithFiles.find(doc => doc.docType === docType);

        // Check internet connectivity before proceeding
        if (!navigator.onLine) {
            const errorMessage = NO_INTERNET_CONNECTION_LABEL;
            this.showToast(ERROR_LABEL, errorMessage, 'error');
            return;
        }
    
        if (docType === 'Self Photo' && (docTypeObj.files.length + files.length > 1)) {
            this.showToast(ERROR_LABEL, YOU_CAN_ONLY_UPLOAD_1_FILE_FOR_PROFILE_PHOTO, 'error');
            return;
        }
    
        if (docTypeObj.files.length + files.length > this.maxFiles) {
            this.showToast(ERROR_LABEL, MAX_3_FILE_ERROR_CUSTOM_LABEL, 'error');
            return;
        }
        const validFiles = this.validateFiles(files, event);    
        if (validFiles.length > 0) {
            this.uploadFiles(validFiles, docTypeObj);
        }
    }
    

    validateFiles(files,event) {
        const existingFileNames = new Set(
            this.missingDocumentsWithFiles.flatMap(doc => doc.files.map(file => file.name.toLowerCase())));
        return files.filter((file) => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileSize = file.size;
            const fileName = file.name.toLowerCase();

            if (!this.acceptedFormats.includes(fileExtension)) {
                event.target.setCustomValidity(INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL);
                event.target.reportValidity();
                event.target.value = null; 
                return false;
                
            }

            if (fileSize > this.maxFileSize) {
                event.target.setCustomValidity(FILE_SIZE_ERROR);
                event.target.reportValidity();
                event.target.value = null; 
                return false;
            }
             // 4. Validate for duplicate uploads
             if (existingFileNames.has(fileName)) {
                const errorMessage = DUPLICATE_FILE_FOUND_LABEL +' : '+file.name;
                this.showToast(ERROR_LABEL, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return false; 
            }

            return true;
        });
    }

    async uploadFiles(files, docTypeObj) {
        this.isLoading = true;
        try {
            const base64Files = await Promise.all(files.map(file => this.readFileAsBase64(file)));

            const uploadResults = await uploadFilesToServer({
                base64DataList: base64Files,
                fileNameList: files.map(file => file.name),
                documentTypeList: docTypeObj.docType
            });

            if (uploadResults && uploadResults.length > 0) {
                const contentDocumentId = uploadResults[0];
                const status = 'Re Uploaded	';
                this.handleUpdateStatus(contentDocumentId,status);
                uploadResults.forEach((result, index) => {
                    docTypeObj.files.push({
                        contentDocumentId: contentDocumentId,
                        name: files[index].name
                    });
                });
            }
        } catch (error) {
            this.showToast('Error', 'Failed to upload files', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    handleUpdateStatus(contentDocumentId, newStatus) {
        updateDocumentStatus({ contentDocumentId: contentDocumentId, newStatus: newStatus,applicationId:this.applicationId })
            .then(() => {
                this.showToast(SUCCESS_TOAST_LABEL, FILE_UPLOADED_SUCCESSFULLY_LABEL, 'success');
            })
            .catch((error) => {
            });
    }
    async readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    handleDelete(event) {
        const contentDocumentId = event.target.dataset.id;
        this.isLoading = true;
        // Find the document type object that contains the file with the contentDocumentId
        let docTypeObj = null;
        this.missingDocumentsWithFiles.forEach((doc) => {
            if (doc.files.some((file) => file.contentDocumentId === contentDocumentId)) {
                docTypeObj = doc;
            }
        });
        if (!docTypeObj) {
            this.showToast('Error', 'Document type not found for the given contentDocumentId', 'error');
            return;
        }
        // Call the server-side method to delete the file by contentDocumentId
        deleteFileByContentDocumentId({ contentDocumentId })
            .then(() => {
                this.showToast(SUCCESS_TOAST_LABEL, FILE_DELETED_SUCCESSFULLY_LABEL, 'success');
                // Remove the file from the docTypeObj.files array
                docTypeObj.files = docTypeObj.files.filter(file => file.contentDocumentId !== contentDocumentId);
                this.isLoading = false;
            })
            .catch((error) => {
                this.showToast('Error', 'Failed to delete the file. Please try again.', 'error');
                this.isLoading = false;
            });
    }

    handlePreview(event) {
        const contentDocumentId = event.currentTarget.dataset.id;
        let docTypeObj = null;
        this.missingDocumentsWithFiles.forEach((doc) => {
            if (doc.files.some((file) => file.contentDocumentId === contentDocumentId)) {
                docTypeObj = doc;
            }
        });
    
        if (!docTypeObj) {
            this.showToast('Error', 'Document type not found for the given contentDocumentId', 'error');
            return;
        }
        const fileUrl = `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
    
        fetch(fileUrl)
            .then((response) => response.blob())
            .then((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            })
            .catch((error) => {
                this.showToast('Error', 'Failed to preview the file. Please try again.', 'error');
            });
    }
    @api
    handleValidate() {
        let isValid = true;
        return new Promise((resolve, reject) => {
            try {
                const allInputElements = this.template.querySelectorAll('lightning-input');
                allInputElements.forEach(inputElement => {
                    inputElement.setCustomValidity('');
                    inputElement.reportValidity(); 
                });
                const missingDocs = this.missingDocumentsWithFiles.filter(doc => doc.files.length === 0);
                if (missingDocs.length > 0) {
                    missingDocs.forEach(doc => {
                        const inputElement = this.template.querySelector(`[data-document-type="${doc.docType}"]`);
                        inputElement.setCustomValidity(COMPLETE_THIS_FIELD_LABEL);
                        inputElement.reportValidity();
                    });
                    isValid = false;
                }    
                resolve(isValid);
            } catch (error) {
                reject(error);
            }
        });
    }
    showToast(title, message, variant) {
        const event = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(event);
    }
}