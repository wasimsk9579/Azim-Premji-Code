/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-04-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement,wire } from 'lwc';
import uploadFileToServer from '@salesforce/apex/APFS_FileUploaderController.uploadFileToServer';
import {CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class TestUploadOneFileOnly extends LightningElement {


    displayedFileName = '';
    applicationId =null;
    file;
    allowedExtensions = ['pdf', 'jpeg', 'jpg', 'png'];

    @wire(CurrentPageReference)
    currentPageReference;
    connectedCallback(){
       this.applicationId= this.currentPageReference?.attributes?.recordId || null;
       if (!this.applicationId) {
        this.showToast('Error', 'Application ID not provided.', 'error');
    }
    }

    get isUploadDisabled() {
        return !this.file || !this.applicationId;
    }


    handleFileChange(event) {
        const inputFile = event.target;
        const selectedFile = inputFile.files[0];
        const extension = this.getFileExtension(selectedFile.name);

        if (!this.isValidExtension(extension)) {
            this.setCustomValidity(inputFile, 'Invalid file type. Please upload a file with one of the following extensions: .pdf, .jpeg, .jpg, .png');
        } else if (this.isFileSizeExceeded(selectedFile.size)) {
            this.setCustomValidity(inputFile, 'File size must be less than 1.5 MB');
        } else {
            this.clearCustomValidity(inputFile);
            this.file = selectedFile;
            this.displayedFileName = this.getCustomFileName(inputFile.name, selectedFile.name);
        }
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    isValidExtension(extension) {
        return this.allowedExtensions.includes(extension);
    }

    isFileSizeExceeded(size) {
        return size > 1.5 * 1024 * 1024; // 1.5 MB in bytes
    }

    setCustomValidity(input, message) {
        input.setCustomValidity(message);
        input.reportValidity();
        this.file = null;
        this.displayedFileName = '';
    }

    clearCustomValidity(input) {
        input.setCustomValidity('');
        input.reportValidity();
    }

    getCustomFileName(inputName, originalFileName) {
        const extension = this.getFileExtension(originalFileName);
        const customName = inputName === 'college-addmission-proof-file-upload-input' ? 'College Admission Proof' : originalFileName.split('.').slice(0, -1).join('.');
        return `${customName}.${extension}`;
    }




   
    createUniqueIdentifier(applicationId, documentType) {
        if (!applicationId || !documentType) {
            throw new Error('Application ID and Document Type are required to create a unique identifier');
        }
        return `${applicationId}_${documentType.replace(/\s+/g, '_')}`;
    }

    uploadFile() {
        if (!this.file) {
            this.showToast('Error', 'No file selected.', 'error');
            return;
        }
        if (!this.applicationId) {
            this.showToast('Error', 'Application ID is missing.', 'error');
            return;
        }
        try {
            const uniqueIdentifier = this.createUniqueIdentifier(this.applicationId,'College Admission Proof');
            console.log('UniqeIdentifier',uniqueIdentifier);
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                const base64 = fileReader.result.split(',')[1];
                uploadFileToServer({
                    base64Data: base64,
                    fileName: this.displayedFileName,
                    documentType: 'College Admission Proof',
                    fileUniqueIdentifier:uniqueIdentifier
                }).then(() => {
                    this.showToast('Success', 'File uploaded successfully', 'success');
                    this.file = null;
                    this.displayedFileName = '';
                })
                .then(() => {
                    this.showToast('Success', 'File uploaded successfully', 'success');
                    this.displayedFileName = 'File uploaded successfully';
                })
                .catch(error => {
                    this.showToast('Error', `Error uploading file: ${error.body.message}`, 'error');
                });
            };
            fileReader.readAsDataURL(this.file);
        } catch (error) {
            this.showToast('Error', error.message, 'error');
        }
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(toastEvent);
    }

}