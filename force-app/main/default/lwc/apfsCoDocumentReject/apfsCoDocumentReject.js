import { LightningElement, api, track,wire } from 'lwc';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";
import approveDocument from '@salesforce/apex/APFS_ContactDocumentsController.approveDocument';
import createPendingTask from '@salesforce/apex/APFS_ContactDocumentsController.createPendingTask';
import { subscribe,createMessageContext, publish } from 'lightning/messageService';
import getFileData from '@salesforce/apex/APFS_ContactDocumentsController.getFileData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {NavigationMixin} from 'lightning/navigation'
export default class ApfsCoDocumentReject extends NavigationMixin(LightningElement) {
    @api isOpen = false;
    @api contentVersionId;
    @api contentDocumentId;
    @api documentType;
    @api filePreviewUrl;
    @api fileExtension;
    applicationId;
    contactId;
    comments;
    showComments;
    documentType;
    messageContext = createMessageContext();

   /* @wire(getFileData, { contentVersionId: '$contentVersionId' })
    wiredFileData({ error, data }) {
        if (data) {
            let fileData = JSON.parse(data);
            this.fileExtension = fileData.fileExtension;
            this.filePreviewUrl = 'data:application/' + this.fileExtension + ';base64,' + fileData.base64Data;
        } else if (error) {
            console.error('Error retrieving file data:', error);
        }
    }
*/
    get isImage() {
        return this.fileExtension === 'jpg' || this.fileExtension === 'jpeg' || this.fileExtension === 'png';
    }

    get iframeStyle() {
        return `transform: scale(${this.zoomLevel}); transform-origin: 0 0;`;
        //return `transform: scale(${this.zoomLevel}); transform-origin: 0 0; width: 100%; height: 100%;`;
    }

    // Check if the document is a PDF
    get isPdf() {
        console.log('this.documentType=> '+this.fileExtension);
        return this.fileExtension == 'pdf';
    }

    connectedCallback() {
        this.subscribeMessage();
      }

    subscribeMessage() {
       
        this.subscription = subscribe(this.messageContext, apfsCoDocMessagingChannel, (message) => {
            if(message!=undefined || message!=null)
            {
            console.log('Received message from channel: ', message);
            this.filePreviewUrl = message.filePreviewUrl;
            this.fileExtension = message.FileExtension;
            this.isOpen = message.isOpen;
            this.contentVersionId = message.contentVersionId;
            this.contentDocumentId = message.contentDocumentId;
            this.applicationId = message.applicationId;
            this.contactId = message.contactId;
            this.documentType = message.documentType;
        //    this.previewHandler();

            }
        });
        
     }

   /*  previewHandler(){
        console.log('this.contentVersionId=> '+this.contentVersionId)
        this[NavigationMixin.Navigate]({ 
            type:'standard__namedPage',
            attributes:{ 
                pageName:'filePreview',
            },
            state:{ 
                selectedRecordId: this.contentVersionId
            },
        })
    }*/

        handleCommentsChange(event) {
            this.comments = event.target.value;
        }

    handleCancel() {
        this.showComments = false
        this.isOpen = false
        console.log(this.contentVersionId);
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    handleApprove() {
        console.log(`Approving document with Content Version ID: ${this.contentVersionId} and Content Document ID: ${this.contentDocumentId}`);
        this.showComments = false;
        approveDocument({ contentVersionId: this.contentVersionId, contentDocumentId: this.contentDocumentId })
            .then(() => {
                console.log('Document approved successfully');
                this.isOpen = false;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Document approved successfully.',
                    variant: 'success',
                }));
                this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                const message = {
                    RefreshApex:true
                };
                console.log('Message=> '+JSON.stringify(message));
                publish(this.messageContext, apfsCoDocMessagingChannel, message);
            })
            .catch(error => {
                console.error('Error approving document:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred while approving the document.',
                    variant: 'error',
                }));
            });
    }

    handleReject() {
        // Show comments section when rejecting
        this.showComments = true;
    }

    handleSubmitReject() {
        console.log('Rejecting document with Content Version ID: '+this.contentVersionId);
        console.log('Contact ID: '+this.contactId);
        console.log('Application ID: '+this.applicationId);
        console.log('Document Type: '+this.documentType);
        console.log(`Comments: ${this.comments}`);

        createPendingTask({
            contactId: this.contactId,
            contentVersionId: this.contentVersionId,
            contentDocumentId: this.contentDocumentId,
            applicationId: this.applicationId,
            documentType: this.documentType,
            comments: this.comments
        })
            .then(() => {
                console.log('Pending task created successfully');
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Pending task created successfully.',
                    variant: 'success',
                }));
                this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));

                const message = {
                    RefreshApex:true
                };
                console.log('Message=> '+JSON.stringify(message));
                publish(this.messageContext, apfsCoDocMessagingChannel, message);
            })
            .catch(error => {
                console.error('Error creating pending task:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred while creating the pending task.',
                    variant: 'error',
                }));
                const message = {
                    RefreshApex:true
                };
                console.log('Message=> '+JSON.stringify(message));
                publish(this.messageContext, apfsCoDocMessagingChannel, message);
            });
    }
}