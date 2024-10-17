/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-12-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,api,wire } from 'lwc';
import { publish,subscribe,unsubscribe,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import getUploadedDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getUploadedDocuments';
import approveDocument from '@salesforce/apex/APFS_ContactDocumentsController.approveDocument';
import createPendingTask from '@salesforce/apex/APFS_ContactDocumentsController.createPendingTask';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const actions = [
  //  { label: 'Approve', name: 'approve' },
    { label: 'Preview', name: 'preview' },
  //  { label: 'Preview', name: 'preview' }
];
export default class ApfsCoShowUploadedDocuments extends LightningElement {
    @api recordId;
    documents;
    error;
    showModal = false;
    selectedContentVersionId='';
    selectedContentDocumentId = '';
    selectedApplicationId='';
    selectedDocumentType = '';
    imagePreviewURL='';
    fileExtension='';
    contactId;
    messageContext = createMessageContext();

    connectedCallback(){
        this.subscribeMessage();
    }

     get columns() {
        return [
            // {
            //     label: 'Content Version Id',
            //     fieldName: 'contentVersionId',
            //     type: 'text',
            //     typeAttributes: { alternativeText: 'Id' }
            // },
            // {
            //     label: 'Content Document Id',
            //     fieldName: 'contentDocumentId',
            //     type: 'text',
            //     typeAttributes: { alternativeText: 'Id' }
            // },
            // {
            //     label: 'Application Id',
            //     fieldName: 'applicationId',
            //     type: 'text',
            //     typeAttributes: { alternativeText: 'Id' }
            // },
            { 
                label: 'File Name', 
                fieldName: 'contentDocumentUrl', 
                type: 'url', 
                typeAttributes: { label: { fieldName: 'fileName' }, target: '_blank' } 
            },
            { label: 'Document Type', fieldName: 'documentType', type: 'text' },
            { label: 'Status', fieldName: 'applicantDocumentStatus', type: 'text' },
            { label: 'Comments', fieldName: 'comment', type: 'text' },
            {
                type: 'action',
                typeAttributes: { rowActions: actions }
            }
        ];
    }

    @wire(getUploadedDocuments, { applicationId: '$recordId' })
    wiredDocuments(result) {
        this.wiredDocumentsResult = result;
        if (result.data) {
            console.log('Data=> '+JSON.stringify(result.data))
            this.documents = result.data.map(doc => ({
                contactId: doc.Contact__c,
                contentVersionId: doc.Id,
                fileName: doc.Title,
                contentDocumentUrl: this.getContentDocumentUrl(doc.ContentDocumentId),
                contentDocumentId: doc.ContentDocumentId,
                applicationId:doc.Application__c,
                applicantDocumentStatus: doc.Applicant_Document_Status__c,
                documentType: doc.Applicant_Document_Type__c,
                fileExtension:doc.FileExtension,
                comment: doc.Application_Document_Comment__c
            }));
            this.error = undefined;
            console.log('Documents=> '+JSON.stringify(this.documents));
        } else if (result.error) {
            this.error = result.error;
            this.documents = undefined;
            this.showToast('Error', this.error.body.message?this.error.body.message:'Failed to retrive uploaded documents.', 'error');
        }
    }

    getContentDocumentUrl(contentDocumentId){
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/lightning/r/ContentDocument/${contentDocumentId}/view`;
        return url;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
       console.log('fileExtension=> '+row.fileExtension)
               this.selectedContentVersionId=row.contentVersionId;
                this.selectedContentDocumentId = row.contentDocumentId;
                console.log( this.selectedContentVersionId);
                this.imagePreviewURL='/sfc/servlet.shepherd/document/download/' + this.selectedContentDocumentId;
                this.selectedApplicationId=row.applicationId;
                this.selectedDocumentType = row.documentType;
                this.showModal = true;
                this.fileExtension = row.fileExtension;
                this.contactId = row.contactId; 
                console.log('AppId=> '+row.applicationId+'contactId=> '+row.contactId)
                this.publishMessage();     
        }

    publishMessage() {
        const message = {
            FileExtension: this.fileExtension,
            isOpen: this.showModal,
            filePreviewUrl:this.imagePreviewURL,
            contentVersionId:this.selectedContentVersionId,
            contentDocumentId:this.selectedContentDocumentId,
            contactId:this.contactId,
            applicationId:this.selectedApplicationId,
            documentType:this.selectedDocumentType
        };
        console.log('Message=> '+message);
        publish(this.messageContext, apfsCoDocMessagingChannel, message);
    }

    subscribeMessage(){
        this.subscription = subscribe(this.messageContext, apfsCoDocMessagingChannel, (message) => {
            console.log('ParentCmp=> '+JSON.stringify(message));

            if(message!=undefined || message!=null)
                {
                    refreshApex(this.wiredDocumentsResult);
                }
        })
    }

    handlePreview(contentDocumentId) {
        const baseUrl = window.location.origin;
        const previewUrl = `${baseUrl}/lightning/r/ContentDocument/${contentDocumentId}/view`;
        window.open(previewUrl, '_blank');
    }

    handleApprove(row) {
        approveDocument({ contentVersionId: row.contentVersionId,contentDocumentId:row.contentDocumentId })
            .then(() => {
                this.showToast('Success', `Document ${row.title} approved successfully`, 'success');
                return refreshApex(this.wiredDocumentsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message?error.body.message:'Something went wrong!', 'error');
            });
    }
 
    handleReject(event) {
        const { contentVersionId, contentDocumentId, applicationId, documentType, comments } = event.detail;
        createPendingTask({
            contactId: this.recordId,
            contentVersionId: contentVersionId,
            contentDocumentId: contentDocumentId,
            applicationId:applicationId,
            documentType: documentType,
            comments:comments
        })
            .then(() => {
                this.showToast('Success', 'Task created and document rejected successfully', 'success');
                this.showModal = false;
                return refreshApex(this.wiredDocumentsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    closeModal() {
        this.showModal = false;
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