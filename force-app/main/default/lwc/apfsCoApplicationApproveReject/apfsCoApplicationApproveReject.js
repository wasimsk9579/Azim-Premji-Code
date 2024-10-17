import { LightningElement, api, track } from 'lwc';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";
import { subscribe, createMessageContext, publish } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateFileStatus from '@salesforce/apex/APFS_ContactDocumentsController.updateFileStatus';
import deleteAllProcessedFiles from '@salesforce/apex/APFS_ContactDocumentsController.deleteAllProcessedFiles';
export default class ApfsCoApplicationApproveReject extends LightningElement {
@api isOpen = false;
@track files = [];
@track isButtonDisabled = false;
@track isDeleteConfirmationOpen = false;
@track processedFiles = [];
@track deleteButtonLabel; 
@track comment ='';
messageContext = createMessageContext();
@track OtherThanCastAndDisability = true;

connectedCallback() {
    this.subscribeMessage();
}

subscribeMessage() {
    this.subscription = subscribe(this.messageContext, apfsCoDocMessagingChannel, (message) => {
        if((message!=undefined || message!=null) && message.operationType === 'ApfsCoApplicationVerifier'){
            this.files = message.files || [];
            this.isOpen = message.isOpen;
            this.processFiles(); 
        }
    });
}

processFiles() {
    this.OtherThanCastAndDisability=true;
    this.processedFiles = this.files.map(file => {
        let isButtonDisabled;
        if(file.documentType==='Bank Proof' || file.documentType==='Signed Scholarship Agreement'){
            isButtonDisabled = (file.applicationInternalStatus !== 'Offer Acceptance Document Submitted') ? true : false;
        }else{
            isButtonDisabled = (file.applicationInternalStatus !== 'Submitted' && file.applicationInternalStatus !== 'To Be Reviewed' && file.applicationInternalStatus !== 'Application Document Submitted') ? true : false;
        }

        return {
            ...file,
            isImage: this.isImage(file.fileExtension),
            isPdf: this.isPdf(file.fileExtension),
            status:file.applicantDocumentStatus,
            rotation: 0,
            showCommentSection: false, 
            comment: '',
            isCommentRequired: false,
            approveReject : true, 
            showSaveCancelButtons: false,
            applicationInternalStatus: file.applicationInternalStatus,
            isButtonDisabled   
        };
    });
    const docType = this.processedFiles[0].documentType;
    if (docType === 'Disability Certificate' || docType === 'Caste Certificate' || docType === 'College Fee Receipt'){
        this.OtherThanCastAndDisability=false;
    }
    if (this.processedFiles.length===1){
        this.deleteButtonLabel = `Reject ${docType} File`;
    }else{
        this.deleteButtonLabel = `Reject All ${docType} Files`;
    }
}

isImage(fileExtension) {
    return ['jpg', 'jpeg', 'png'].includes(fileExtension.toLowerCase());
}

isPdf(fileExtension) {
    return fileExtension.toLowerCase() === 'pdf';
}

handleCommentChange(event) {
    const fileId = event.target.dataset.id;
    this.comment = event.target.value;

    this.processedFiles = this.processedFiles.map(file => {
        if (file.contentVersionId === fileId) {
            return { ...file, comment: this.comment };
        }
        return file;
    });
}
handleRotateImage(event) {
    const contentVersionId = event.currentTarget.dataset.id; 
    const fileIndex = this.processedFiles.findIndex(file => file.contentVersionId === contentVersionId);

    if (fileIndex !== -1) {
        const currentRotation = this.processedFiles[fileIndex].rotation || 0;
        const newRotation = (currentRotation + 90) % 360;
        this.processedFiles[fileIndex].rotation = newRotation;

        const imgElement = this.template.querySelector(`img[data-id="${contentVersionId}"]`);
        if (imgElement) {
            imgElement.style.transform = `rotate(${newRotation}deg)`;
            imgElement.style.transformOrigin = 'center center';
            //this.fitImageToContainer(imgElement);
        }
        this.processedFiles = [...this.processedFiles];
    }
}

fitImageToContainer(imgElement) {
    const container = imgElement.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    imgElement.style.width = 'auto';
    imgElement.style.height = 'auto';

    const imgWidth = imgElement.offsetWidth;
    const imgHeight = imgElement.offsetHeight;

    const widthScale = containerWidth / imgWidth;
    const heightScale = containerHeight / imgHeight;
    const scale = Math.min(widthScale, heightScale);

    imgElement.style.width = `${imgWidth * scale}px`;
    imgElement.style.height = `${imgHeight * scale}px`;
}

handleApprove(event) {
    this.comment='';
    const fileId = event.currentTarget.dataset.id;
    
    this.processedFiles = this.processedFiles.map(file => {
        if (file.contentVersionId === fileId) {
            return {
                ...file,
                comment: '',
                showCommentSection: false,
            };
        }
        return file;
    });
    this.handleSave(event);
}

handleReject(event) {
    this.comment='';
    const fileId = event.currentTarget.dataset.id;

    this.processedFiles = this.processedFiles.map(file => {
        if (file.contentVersionId === fileId) {
            return {
                ...file,
                showCommentSection: true, 
                comment: file.comment || '', 
                isCommentRequired: true,
                approveReject:false, 
                showSaveCancelButtons: true, 
            };
        }
        return file;
    });
}

handleSave(event) {
    const fileId = event.currentTarget.dataset.id;
    const updatedFile = this.processedFiles.find(file => file.contentVersionId === fileId);
    if (updatedFile) {
        if (updatedFile.isCommentRequired && !updatedFile.comment) {
            const textareaElement = this.template.querySelector(`lightning-textarea[data-id="${fileId}"]`);
            if (textareaElement) {
                textareaElement.setCustomValidity('Comment is required for rejection.');
                textareaElement.reportValidity();
            }
            return; 
        }
        const textareaElement = this.template.querySelector(`lightning-textarea[data-id="${fileId}"]`);
        if (textareaElement) {
            textareaElement.setCustomValidity(''); 
            textareaElement.reportValidity();
        }
        this.updateFileStatusInOrg(fileId, updatedFile.isCommentRequired ? 'Rejected' : 'Verified', updatedFile.comment)
            .then(() => {
                const updatedStatus = updatedFile.isCommentRequired ? 'Rejected' : 'Verified';
                this.processedFiles = this.processedFiles.map(file => {
                    if (file.contentVersionId === fileId) {
                        let isButtonDisabled;
                        if(file.documentType==='Bank Proof' || file.documentType==='Signed Scholarship Agreement'){
                            isButtonDisabled = (file.applicationInternalStatus !== 'Offer Acceptance Document Submitted') ? true : false;
                        }else{
                            isButtonDisabled = (file.applicationInternalStatus !== 'Submitted' && file.applicationInternalStatus !== 'To Be Reviewed' && file.applicationInternalStatus !== 'Application Document Submitted') ? true : false;
                        }
                        return {
                            ...file,
                            status:updatedStatus,
                            showCommentSection: false,
                            isCommentRequired: false,
                            approveReject: true, 
                            showSaveCancelButtons: false,
                            isButtonDisabled
                        };
                    }
                    return file;
                });
            })
            .catch(error => {
            });
    }
    this.comment='';
}

handleCancel(event) {
    const fileId = event.currentTarget.dataset.id;
    
    this.processedFiles = this.processedFiles.map(file => {
        if (file.contentVersionId === fileId) {
            return {
                ...file,
                showCommentSection: false, 
                isCommentRequired: false,
                approveReject:true, 
                showSaveCancelButtons: false, 
            };
        }
        return file;
    });
}

updateFileStatusInOrg(fileId, status, comment) {
    return updateFileStatus({ contentVersionId: fileId, status: status, comment: comment })
        .then(() => {
            this.showToast('Success', 'File ' + status + '.', 'success');
            const message = {
                RefreshApex:true,
                 operationType: 'ApfsCoApplicationApproveReject'
            };
            publish(this.messageContext, apfsCoDocMessagingChannel, message);
        })
        .catch(error => {
            this.showToast('Error', 'Error updating file status: ' + error.body.message, 'error');
        });
}
handleCloseWindow() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('cancel'));
}
handleDeleteAllFilesPopUp(){
    this.isDeleteConfirmationOpen = true;
}
handleCloseConfirmation(){
    this.isDeleteConfirmationOpen = false;
}
handleDeleteAllFiles() {
    const contentVersionIds = this.processedFiles.map(file => file.contentVersionId);
    if (contentVersionIds.length === 0) {
        this.showToast('No files to delete', 'Please upload files before attempting to delete.', 'warning');
        return;
    }
    deleteAllProcessedFiles({ contentVersionIds })
        .then(() => {
            this.showToast('Success', 'All files have been rejected successfully.', 'success');
            this.processedFiles = [];
            this.handleCloseWindow();
            window.location.reload();
        })
        .catch(error => {
            this.showToast('Error deleting files', error.body.message, 'error');
        });
}

showToast(title, message, variant) {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    });
    this.dispatchEvent(event);
}
}