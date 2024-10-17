/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 10-01-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement, wire,track,api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import {updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import basePath from '@salesforce/community/basePath';

import getReSubmissionDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getReSubmissionDocuments';
import updateDocumentStatus from '@salesforce/apex/APFS_ContactDocumentsController.updateDocumentStatus';
import uploadFilesToServer from '@salesforce/apex/APFS_MyProfileDocumentsController.uploadFilesToServer';
import deleteFileByContentDocumentId from '@salesforce/apex/APFS_MyProfileDocumentsController.deleteFileByContentDocumentId';
import MissingOrRejectedDocumentCount from '@salesforce/apex/APFS_ContactDocumentsController.MissingOrRejectedDocumentCount';
import deleteFilesByContentDocumentIds from '@salesforce/apex/APFS_ContactDocumentsController.deleteFilesByContentDocumentIds';

import HELP_TEXT_FOR_UPLOAD_LABEL from '@salesforce/label/c.Help_Text_For_Upload';
import MORE_THAN_3_FILES_ERROR_LABEL from '@salesforce/label/c.More_Than_3_Files_Error_Label';	
import FILE_SIZE_ERROR from '@salesforce/label/c.File_Size_Error_CustomLabel';
import NO_INTERNET_CONNECTION_LABEL from '@salesforce/label/c.No_Internet_Connection_label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';
import DOCUMENTS_REJECTED from '@salesforce/label/c.Documents_Rejected';
import DOCUMENT_LABEL from '@salesforce/label/c.Document_label';
import REASON_FOR_REJECTION from '@salesforce/label/c.Reason_for_Rejection';
import PREVIOUSLY_UPLOADED_DOCUMENT_LABEL from '@salesforce/label/c.Previously_Uploaded_Document_label';
import NEWLY_UPLOADED_DOCUMENT from '@salesforce/label/c.Newly_Uploaded_Document';
import ONLY_ONE_FILE_CAN_BE_UPLOADED_ERROR_LABEL from '@salesforce/label/c.Only_One_file_can_be_uploaded_error_label';
import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import FILE_UPLOADED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Uploaded_Successfully';
import FILE_DELETED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Deleted_Successfully';
import COMPLETE_THIS_FIELD_LABEL from '@salesforce/label/c.Complete_this_field_Label';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import ALL_FILES_UPLOADED_SUCCESSFULLY from '@salesforce/label/c.All_files_uploaded_successfully';

export default class ApfsCoDcoumentsResubmission extends NavigationMixin(LightningElement) {
    @api recordId;
    @api missingDocType='applicationDoc';
    status;
    @track documents = [];
    @track fileList =[];
    @track allNewFiles = [];
    @track offerLetterDocuments = [];
    @track componentVisibilty = false;
    @track offerComponentVisibilty = false;
    @track isDocumentsFetchedCompleted = false;
    @track displaySaveButton = false;
    @track isLoading = false;
    fileUploadHelpText = HELP_TEXT_FOR_UPLOAD_LABEL;
    moreThan3FilesErrorLabel = MORE_THAN_3_FILES_ERROR_LABEL;
    documentRejectedHeading = DOCUMENTS_REJECTED;
    documentLabel = DOCUMENT_LABEL;
    rejectionLabel = REASON_FOR_REJECTION;
    previouslyUploadedlabel = PREVIOUSLY_UPLOADED_DOCUMENT_LABEL;
    newlyUploadedLabel = NEWLY_UPLOADED_DOCUMENT;
    
    maxFiles = 1;
    maxFileSize = 1.5 * 1024 * 1024; 
    acceptedFormats = ['pdf', 'jpeg', 'jpg', 'png'];
    validMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback() {
        this.boundHandleBeforeUnload = this.handleBeforeUnload.bind(this);
        window.addEventListener('beforeunload', this.boundHandleBeforeUnload);
        
        
        this.recordId = this.currentPageReference?.state?.Id || null;
        this.status = this.currentPageReference?.state?.status || null;        
        if (this.status === 'Application Document Needs Resubmission') {
            this.componentVisibilty = true;
        } else if(this.status === 'Offer Document Needs Resubmission') {
            this.offerComponentVisibilty = true;
        }
        if(this.recordId){
            this.fetchDocuments(this.recordId);
        }
    }
    disconnectedCallback() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        if (this.status === 'Application Document Needs Resubmission') {
            this.handleApplicationDocumentResubmission();
        } else if (this.status === 'Offer Document Needs Resubmission') {
            this.handleOfferDocumentResubmission();
        }
    }
    
    handleApplicationDocumentResubmission() {
        let contentDocumentIds = this.getApplicationContentDocumentIds();
        if (contentDocumentIds.length > 0) {
            this.deleteDocumentsList(contentDocumentIds)
                .then(() => this.handleCheckForMissingDocuments('applicationDoc'))
                .catch((error) => this.showToast('Error', error.body.message, 'error'));
        } else {
            this.handleCheckForMissingDocuments('applicationDoc');
        }
    }
    
    handleOfferDocumentResubmission() {
        const childComponent = this.template.querySelector('c-apfs-co-offer-doc-resubmission');  
        if (childComponent) {
            childComponent.collectContentDocumentIds()
                .then((contentDocumentIds) => {
                    if (contentDocumentIds.length > 0) {
                        this.deleteDocumentsList(contentDocumentIds)
                            .then(() => this.handleCheckForMissingDocuments('offerDoc'))
                            .catch((error) => this.showToast('Error', error.body.message, 'error'));
                    } else {
                        this.handleCheckForMissingDocuments('offerDoc');
                    }
                })
                .catch((error) => console.error('Error in child component:', error));
        } else {
            console.error('Child component not found');
        }
    }
    
    getApplicationContentDocumentIds() {
        let contentDocumentIds = [];
        this.documents.forEach((doc) => {
            if (doc.files.length !== 0) {
                contentDocumentIds.push(doc.contentDocumentId);
            }
        });
        return contentDocumentIds;
    }
    
    handleCheckForMissingDocuments(missingType) {
        this.handleCheck(this.recordId, missingType);
    }
    
    handleBeforeUnload(event) {
        if (this.status === 'Application Document Needs Resubmission') {
            this.handleApplicationDocumentResubmission();
        } else if (this.status === 'Offer Document Needs Resubmission') {
            this.handleOfferDocumentResubmission();
        }
    }


    handleCheck(applicationId,missingType) {
        MissingOrRejectedDocumentCount({ applicationId:applicationId, missingType: missingType })
            .then(() => {
            })
            .catch(error => {
                console.error('Error updating application status: ', error);
            });
    }

    fetchDocuments(applicationId) {
        this.isLoading = true;
        getReSubmissionDocuments({ applicationId: applicationId })
            .then(result => {
                this.documents = [];
                this.offerLetterDocuments = [];
                const offerLetterDocTypes = ['Signed Scholarship Agreement','Bank Proof'];
                if (result.documents) {
                    result.documents.forEach(file => {
                        let base64Prefix = '';                        
                        if (file.title.toLowerCase().endsWith('.pdf')) {
                            base64Prefix = 'data:application/pdf;base64,';
                        } else if (file.title.toLowerCase().endsWith('.png')) {
                            base64Prefix = 'data:image/png;base64,';
                        } else if (file.title.toLowerCase().endsWith('.jpg') || file.title.toLowerCase().endsWith('.jpeg')) {
                            base64Prefix = 'data:image/jpeg;base64,';
                        }
    
                        const fileDataUrl = base64Prefix + file.encodedVersionData;
    
                        const fileObject = {
                            title: file.title,
                            fileName: file.title,
                            fileType: file.docType,
                            base64: fileDataUrl,
                            fileUrls: fileDataUrl,
                            comment: file.comments,
                            contentDocumentId: file.contentDocumentId,
                            files: [] 
                        };
                        if (offerLetterDocTypes.includes(file.docType)) {
                            this.offerLetterDocuments.push(fileObject);
                        } else {
                            this.documents.push(fileObject);
                            this.displaySaveButton =true;
                        }
                    });
                } else {
                    this.showToast('Info', 'No documents found for resubmission.', 'info');
                }
                this.isDocumentsFetchedCompleted = true;
                this.isLoading = false;
            })
            .catch(error => {
                this.isLoading = false;
                this.showToast('Error', 'Error fetching documents: ' + error.body.message, 'error');
            });
    }
    

    handlePreviewFile(event) {
        const contentDocumentId = event.target.dataset.id;
        const name = event.target.name;
        let file;
        if(name==='oldFile'){
            file = this.documents.find(e => e.contentDocumentId === contentDocumentId);
        }else{
            file = this.allNewFiles.find(e => e.contentDocumentId === contentDocumentId);
        }
        if (!file || !file.fileUrls) {
            this.showToast(Error_Label, 'File URL not found', 'error');
            return;
        }
        try {
            const fileUrl = file.fileUrls;
            if (fileUrl.startsWith('data:image/jpeg;base64,') || fileUrl.startsWith('data:image/png;base64,') || fileUrl.startsWith('data:image/jpg;base64,')) {
                // Handle image 
                const imageUrl = fileUrl;
                const newTab = window.open();
                newTab.document.body.innerHTML = `<img src="${imageUrl}" style="width:100%;height:auto;">`;
            } else if (fileUrl.startsWith('data:application/pdf;base64,')) {
                // Handle PDF 
                const pdfData = atob(fileUrl.split('data:application/pdf;base64,')[1]);
                const arr = new Uint8Array(pdfData.length);
                for (let i = 0; i < pdfData.length; i++) {
                    arr[i] = pdfData.charCodeAt(i);
                }
                const pdfBlob = new Blob([arr], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const newTab = window.open(pdfUrl, '_blank');
                if (!newTab) {
                    throw new Error('Failed to open new tab');
                }
            } else {
                this.showToast(Error_Label, 'Unsupported file format for preview', 'error');
            }
        } catch (error) {
            this.showToast(Error_Label, 'Error opening file', 'error');
        }
    }
    handleUploadFile(event) {
        const files = event.target.files;
        const maxSizeBytes = this.maxFileSize;
        const fileType = event.target.name;
        const contentDocumentId = event.target.dataset.id;
        const title = event.target.dataset.title;
    
        event.target.setCustomValidity('');
        event.target.reportValidity();
    
        const oldFileName = title;
        const index = oldFileName.slice(oldFileName.lastIndexOf('.') - 1, oldFileName.lastIndexOf('.'));
    
        const documentItem = this.documents.find(doc => doc.contentDocumentId === contentDocumentId);
        
        // Check internet connectivity before proceeding
        if (!navigator.onLine) {
            const errorMessage = NO_INTERNET_CONNECTION_LABEL;
            this.showToast(ERROR_LABEL, errorMessage, 'error');
            return;
        }
        
        if (documentItem && documentItem.files && documentItem.files.length >= this.maxFiles) {
            this.showToast(ERROR_LABEL, ONLY_ONE_FILE_CAN_BE_UPLOADED_ERROR_LABEL, 'error');
            event.target.value = null; 
            return;
        }
    
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
    
            // Validate file size
            if (file.size > maxSizeBytes) {
                event.target.setCustomValidity(FILE_SIZE_ERROR);
                event.target.reportValidity();
                event.target.value = null;
                return;
            }
    
            // Validate file type
            if (['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                const fileExtension = file.name.split('.').pop();
                const baseFileName = file.name.split('.').slice(0, -1).join('.');
    
                const reader = new FileReader();
                reader.onload = () => {
                    const newFile = {
                        title: `${baseFileName}_${index}.${fileExtension}`,
                        fileName: `${baseFileName}_${index}.${fileExtension}`,
                        fileType: fileType,
                        fileBase64: reader.result.split(',')[1],
                        fileUrls: reader.result,
                        contentDocumentId:''
                    };
    
                    // If a document item exists, add the new file to its `files` array
                    if (documentItem) {
                        const updatedFiles = [...(documentItem.files || []), newFile];
                        const updatedDocument = { ...documentItem, files: updatedFiles };
                        this.documents = this.documents.map(doc => doc.contentDocumentId === contentDocumentId ? updatedDocument : doc);
                    } else {
                    }
                    this.uploadFiles(newFile, documentItem);
                };
    
                reader.readAsDataURL(file);
            } else {
                this.showToast(ERROR_LABEL, INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL, 'error');
                event.target.value = null;
                return;
            }
        }
    }

    async uploadFiles(file,oldDocumentItem) {
        try {
            const contentDocumentIds = await uploadFilesToServer({
                base64DataList: [file.fileBase64],
                fileNameList: [file.fileName],
                documentTypeList: [file.fileType] 
            });
    
            if (contentDocumentIds && contentDocumentIds.length > 0) {
                file.contentDocumentId = contentDocumentIds[0];
                //update the Status of content version to Reuploaded
                const status = 'Re Uploaded	';
                this.handleUpdateStatus(file.contentDocumentId,status);

                // Add the new file data to the `allNewFiles` list so that while deletion frm Ui we can use it ...
                this.allNewFiles = [...this.allNewFiles, file];
                if (oldDocumentItem) {
                    const updatedFiles = [...oldDocumentItem.files, file]; 
                    const updatedDocument = { ...oldDocumentItem, files: updatedFiles }; 
                    this.documents = this.documents.map(doc => 
                        doc.contentDocumentId === updatedDocument.contentDocumentId ? updatedDocument : doc
                    ); // Update the documents array
                    }
                this.showToast(SUCCESS_TOAST_LABEL, FILE_UPLOADED_SUCCESSFULLY_LABEL, 'success');
                // Now deleting old file----->>>>>
                if (oldDocumentItem && oldDocumentItem.contentDocumentId) {
                   //await this.deleteOldFile(oldDocumentItem.contentDocumentId);
                }
            } else {
                this.showToast('Error', `Failed to upload ${file.fileName}.`, 'error');
            }
        } catch (error) {
            this.showToast('Error', 'An error occurred while uploading the file.', 'error');
        }
    }
    async deleteOldFile(contentDocumentId) {
        try {
            await deleteFileByContentDocumentId({ contentDocumentId });
        } catch (error) {
        }
    }
    handleRemoveFile(event) {
        const contentDocumentId = event.target.dataset.id; 
        this.deleteOldFile(contentDocumentId);

        this.documents = this.documents.map(document => {
            const updatedFiles = document.files.filter(file => file.contentDocumentId !== contentDocumentId);
            return { ...document, files: updatedFiles };
        });
        
        this.showToast(SUCCESS_TOAST_LABEL, FILE_DELETED_SUCCESSFULLY_LABEL, 'success');
    }
    handleUpdateStatus(contentDocumentId, newStatus) {
        updateDocumentStatus({ contentDocumentId: contentDocumentId, newStatus: newStatus,applicationId:this.recordId })
            .then(() => {
            })
            .catch((error) => {
            });
    } 
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
    async handleCheckAndUpdate() {
        let allValid = true;
    
        // Validate parent component's fields
        this.documents.forEach(document => {
            const inputField = this.template.querySelector(`lightning-input[data-id="${document.contentDocumentId}"]`);
            
            if (!document.files || document.files.length === 0) {
                inputField.setCustomValidity(COMPLETE_THIS_FIELD_LABEL);
                allValid = false;
            } else {
                inputField.setCustomValidity('');
            }
            inputField.reportValidity();
        });
    
        const childComponent = this.template.querySelector('c-apfs-co-missing-app-dcouments');
        if (childComponent) {
            try {
                // Wait for child component validation
                const isValid = await childComponent.handleValidate();    
                if (!isValid) {
                    allValid = false; 
                }
            } catch (error) {
                this.showToast('Error', 'An error occurred while checking documents.', 'error');
                this.isLoading = false; 
                return;
            }
        } else {
            this.isLoading = false; 
            this.showToast('Error', 'Child component not found.', 'error');
            return; 
        }    
        if (allValid) {
            let contentDocumentIds = [];
            this.documents.forEach((doc) => {
                if (doc.files.length != 0) {
                    contentDocumentIds.push(doc.contentDocumentId);
                }
            });    
            if (contentDocumentIds.length > 0) {
                this.deleteDocumentsList(contentDocumentIds)
            }
            this.updateApplicantionStutus();
        }
        this.isLoading = false; 
    }
    deleteDocumentsList(contentDocumentIds) {
         return deleteFilesByContentDocumentIds({ contentDocumentIds: contentDocumentIds })
            .then(() => {
               // this.showToast('Success', 'Files deleted successfully', 'success');
            })
            .catch((error) => {
                this.showToast('Error', error.body.message, 'error');
            });
    }
    
    updateApplicantionStutus() {
        const fields = {};
        fields['Application_Internal_Status__c'] = 'Application Document Submitted';
        fields['Application_External_Status__c'] = 'Application Under Review';
        fields['Id'] = this.recordId; 
        
        const recordInput = { fields };        
        updateRecord(recordInput)
            .then(() => {
                this.isLoading=false;
                this.showToast(SUCCESS_TOAST_LABEL, ALL_FILES_UPLOADED_SUCCESSFULLY, 'success');
                this.navigateToHomePage();
            })
            .catch(error => {
                this.isLoading=false;
                this.showToast('Error', `Failed to update record: ${error.body.message}`, 'error');
            });
    }
    navigateToHomePage() {
       
        window.location.href = `${basePath}/`;
        
    }
    handleMissingDocumentsCheck(event) {
        const visiblity=!event.detail.isEmpty;
        if (visiblity===true){
            this.displaySaveButton =true;
        }
    }
    
}