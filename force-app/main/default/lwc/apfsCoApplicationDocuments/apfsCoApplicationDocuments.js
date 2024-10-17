import { LightningElement,api,wire } from 'lwc';
import { publish,subscribe,unsubscribe,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import getUploadedDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getFilteredDocuments';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
export default class ApfsCoApplicationDocuments extends LightningElement {
@api recordId;
error;
showModal = false;
selectedContentVersionId='';
selectedContentDocumentId = '';
selectedApplicationId='';
selectedDocumentType = '';
imagePreviewURL='';
fileExtension='';
contactId;
documents=[];
selectedFiles = [];
messageContext = createMessageContext();

get columns() {
    return [
        { 
            label: 'File Name', 
            fieldName: 'contentDocumentUrl', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'fileName' }, target: '_blank' } 
        },
        { label: 'Document Type', fieldName: 'documentType', type: 'text' },
        { label: 'Status', fieldName: 'applicantDocumentStatus', type: 'text' },
        { label: 'Comments', fieldName: 'comment', type: 'text' }
    ];
}
connectedCallback(){
    this.subscribeMessage();
}

@wire(getUploadedDocuments, { applicationId: '$recordId' })
    wiredDocuments(result) {
    this.wiredDocumentsResult = result;
        if (result.data) {
            const documentsList = result.data.documents;
            this.documents = documentsList.map(doc => ({
                contactId: doc.Contact__c,
                contentVersionId: doc.Id,
                fileName: doc.Title,
                contentDocumentUrl: this.getContentDocumentUrl(doc.ContentDocumentId),
                contentDocumentId: doc.ContentDocumentId,
                applicationId: doc.Application__c,
                applicantDocumentStatus: doc.Applicant_Document_Status__c,
                documentType: doc.Applicant_Document_Type__c,
                fileExtension: doc.FileExtension,
                comment: doc.Application_Document_Comment__c
            }));
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.documents = undefined;
            this.showToast('Error', this.error.body.message ? this.error.body.message : 'Failed to retrieve uploaded documents.', 'error');
        }
}

getContentDocumentUrl(contentDocumentId){
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/lightning/r/ContentDocument/${contentDocumentId}/view`;
    return url;
}
handleRowAction(event) {
    const row = event.detail.row;
            this.selectedFiles = [{
                contentVersionId: row.contentVersionId,
                contentDocumentId: row.contentDocumentId,
                contactId: row.contactId,
                applicationId: row.applicationId,
                documentType: row.documentType,
                fileExtension: row.fileExtension,
                filePreviewUrl: this.getContentDocumentUrl(row.contentDocumentId),
                applicantDocumentStatus: row.applicantDocumentStatus
            }];
            this.publishMessage();     
    }
publishMessage() {
    const message = {
        isOpen: true,
        files: this.selectedFiles 
    };
    publish(this.messageContext, apfsCoDocMessagingChannel, message);
}

subscribeMessage(){
    this.subscription = subscribe(this.messageContext, apfsCoDocMessagingChannel, (message) => {
        if(message!=undefined || message!=null)
            {
                refreshApex(this.wiredDocumentsResult);
            }
    })
}
showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
        title,
        message,
        variant
    });
    this.dispatchEvent(toastEvent);
    }

}