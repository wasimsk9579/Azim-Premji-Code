import { LightningElement, api,wire,track } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getUploadedDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getFilteredDocumentsForOffer';
import { publish,subscribe,unsubscribe,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";

const FIELDS =[
    'Offer__c.Application__c'

];
export default class ApfsCoApplicationOfferDocuments extends NavigationMixin(LightningElement) {
    @api recordId;
    applicationId;

    @track offerFiles = [];
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

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredOffer(result) {
        if(result.data){
            this.applicationId = result.data?.fields?.Application__c?.value;
            if(this.applicationId){
                this.fetchUploadedDocuments();
            }
        }else if (result.error) {
            this.showToast('Error', error.body.message || 'Failed to retrieven offerDetails', 'error');
        }
    }
    async fetchUploadedDocuments() {
        try {
            const result = await getUploadedDocuments({ applicationId: this.applicationId });
            this.wiredDocumentsResult = result;
            if (result.documents) {
                const documentsList = result.documents;
                this.processFiles(documentsList);
            }
        } catch (error) {
            this.showToast('Error', error.body.message || 'Failed to retrieve documents.', 'error');
        }
    }
    processFiles(data) {
        this.offerFiles = [];
        const allfiles =[];
        data.forEach(file => {
            const isImage = this.isImage(file.FileExtension);
            const isPdf = this.isPdf(file.FileExtension);
            const eachfile = {
                contactId: file.Contact__c,
                contentVersionId: file.Id,
                fileName: file.Title,
                contentDocumentUrl: this.getContentDocumentUrl(file.ContentDocumentId),
                contentDocumentId: file.ContentDocumentId,
                comment: file.Application_Document_Comment__c,
                applicationId: file.Application__c,
                applicantDocumentStatus: file.Applicant_Document_Status__c,
                documentType: file.Applicant_Document_Type__c,
                fileExtension: file.FileExtension,
                isImage: isImage,
                isPdf: isPdf,
                filePreviewUrl: this.getContentDocumentUrl(file.ContentDocumentId)
            };
            allfiles.push(eachfile);
            const validDocumentTypes = ['Signed Scholarship Agreement', 'Bank Proof'];
            if (validDocumentTypes.includes(eachfile.documentType)) {
                this.offerFiles.push(eachfile);
            }
        });
        this.rejectedFiles = this.offerFiles.filter(file => file.applicantDocumentStatus === 'Rejected');
    }

    getContentDocumentUrl(contentDocumentId){
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/lightning/r/ContentDocument/${contentDocumentId}/view`;
        return url;
    }
    isImage(fileExtension) {
        return ['jpg', 'jpeg', 'png'].includes(fileExtension.toLowerCase());
    }
    isPdf(fileExtension) {
        return fileExtension.toLowerCase() === 'pdf';
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
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
                    this.fetchUploadedDocuments();
                }
        })
    }
}