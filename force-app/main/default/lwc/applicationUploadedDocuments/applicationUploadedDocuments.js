import { LightningElement, api, track, wire } from 'lwc';
import getUploadedDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getUploadedDocuments';
import { refreshApex } from '@salesforce/apex';

export default class ApplicationUploadedDocuments extends LightningElement {
    @api recordId;
    @track documents = [];
    @track isPreviewOpen = false;
    @track selectedDocument = null; // Ensure this is used or remove if not needed
    wiredDocumentsResult;

    @wire(getUploadedDocuments, { applicationId: '$recordId' })
    wiredDocuments(result) {
        this.wiredDocumentsResult = result;
        console.log('Wired Documents Result:', result); // Log the result object
        if (result.data) {
            this.documents = result.data.map(doc => ({
                    contentVersionId: doc.Id,
                    fileName: doc.Title,
                    contentDocumentId: doc.ContentDocumentId,
                    fileExtension: doc.FileExtension,
                    contactId:doc.Contact__c,
                    applicationId:doc.Application__c,
                    applicantDocumentStatus: doc.Applicant_Document_Status__c,
                    documentType: doc.Applicant_Document_Type__c,
                    contentDocumentUrl: this.getContentDocumentUrl(doc.ContentDocumentId)// Set the constructed URL here
            }));
            console.log('Processed Documents:', JSON.stringify(this.documents)); // Log the processed documents
        } else if (result.error) {
            console.error('Error retrieving uploaded documents:', result.error); // Log errors
        }
    }

    getContentDocumentUrl(contentDocumentId) {
        const url = `${window.location.origin}/lightning/r/ContentDocument/${contentDocumentId}/view`;
        console.log('Generated Content Document URL:', url); // Log the generated URL
        return url;
    }

    get columns() {
        return [
            { label: 'File Name', fieldName: 'contentDocumentUrl', type: 'url', typeAttributes: { label: { fieldName: 'fileName' }, target: '_blank' } },
            { label: 'Document Type', fieldName: 'documentType', type: 'text' },
            { label: 'Status', fieldName: 'applicantDocumentStatus', type: 'text' },
            { type: 'action', typeAttributes: { rowActions: [{ label: 'Preview', name: 'preview' }] } }
        ];
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log('Row Action:', JSON.stringify(actionName)); // Log the action name
        console.log('Row Data:',JSON.stringify( row)); // Log the row data
        if (actionName === 'preview') {
            this.selectedDocument = {
                contentVersionId: row.contentVersionId,
                fileName:row.fileName,
                contentDocumentId: row.contentDocumentId,
                documentType: row.documentType,
                contactId: row.contactId,
                applicationId:row.applicationId,
                filePreviewUrl:'/sfc/servlet.shepherd/document/download/'+row.contentDocumentId,
                fileExtension: row.fileExtension
            };
            console.log('Selected Document for Preview:', JSON.stringify(this.selectedDocument)); // Log the selected document data
            this.isPreviewOpen = true;
        }
    }
    handlePreviewCancel(event) {
        console.log('Preview Cancelled'); // Log when preview is cancelled
        this.isPreviewOpen = false;
        //this.selectedDocument = null;

        if (event.detail.refresh) {
            this.refreshDocuments();
        }
    }

    refreshDocuments() {
        return refreshApex(this.wiredDocumentsResult);
    }
}