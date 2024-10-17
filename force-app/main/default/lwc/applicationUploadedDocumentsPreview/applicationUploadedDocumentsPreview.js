import { LightningElement, api,track } from 'lwc';
import approveDocument from '@salesforce/apex/APFS_ContactDocumentsController.approveDocument';
import createPendingTask from '@salesforce/apex/APFS_ContactDocumentsController.createPendingTask';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApplicationUploadedDocumentsPreview extends LightningElement {
   @api filePreviewUrl;
    @api contentVersionId;
    @api contentDocumentId;
    @api contactId;
    @api applicationId;
    @api documentType;
    @api fileExtension;
    @api fileName;

    @track zoomLevel = 1; // Initial zoom level
    @track showComments = false; 
    @track comments = ''; 

    get iframeStyle() {
        return `transform: scale(${this.zoomLevel}); transform-origin: 0 0;`;
        //return `transform: scale(${this.zoomLevel}); transform-origin: 0 0; width: 100%; height: 100%;`;
    }
    get isPdfFile() {
        console.log('Checking if PDF file:',this.fileExtension);
        return this.fileExtension === 'pdf';
    }

    get isImageFile() {
        console.log('Checking if Image file:',this.fileExtension);
        return ['jpeg', 'jpg', 'png'].includes(this.fileExtension);
    }
    get isOtherFile() {
        return !this.isPdfFile && !this.isImageFile;
    }
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
    handleZoomIn() {
        this.zoomLevel += 0.1; // Increment zoom level
    }
    handleZoomOut() {
        this.zoomLevel = Math.max(0.1, this.zoomLevel - 0.1); // Decrement zoom level, but don't go below 0.1
    }
     handleReject() {
        // Show comments section when rejecting
        this.showComments = true;
    }
    handleCommentsChange(event) {
        this.comments = event.target.value;
    }
    handleApprove() {
        console.log(`Approving document with Content Version ID: ${this.contentVersionId} and Content Document ID: ${this.contentDocumentId}`);
        this.showComments = false;
        approveDocument({ contentVersionId: this.contentVersionId, contentDocumentId: this.contentDocumentId })
            .then(() => {
                console.log('Document approved successfully');
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Document approved successfully.',
                    variant: 'success',
                }));
                this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
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

    handleSubmitReject() {
        console.log(`Rejecting document with Content Version ID: ${this.contentVersionId}`);
        console.log(`Contact ID: ${this.contactId}`);
        console.log(`Application ID: ${this.applicationId}`);
        console.log(`Document Type: ${this.documentType}`);
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
            })
            .catch(error => {
                console.error('Error creating pending task:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred while creating the pending task.',
                    variant: 'error',
                }));
            });
    }
}
//-----------apex class--------
// public without sharing class APFS_ContactDocumentsController {
//     @AuraEnabled(cacheable=true)
//     public static List<ContentVersion> getUploadedDocuments(Id applicationId) {
//         system.debug('applicationI'+applicationId);
//          Id contactId = [SELECT Id, Name, 
//                 (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
//                 FROM Contact 
//                 WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)
//                ][0].Id;
        
//         system.debug('contactId'+contactId);
//         List<ContentDocumentLink> contentDocumentLinks = [
//             SELECT ContentDocumentId
//             FROM ContentDocumentLink
//             WHERE LinkedEntityId = :contactId
//         ];

//         Set<Id> contentDocumentIds = new Set<Id>();
//         for (ContentDocumentLink link : contentDocumentLinks) {
//             contentDocumentIds.add(link.ContentDocumentId);
//         }
// 		system.debug('Content Document Ids'+contentDocumentIds);
//         system.debug('Content Document Ids Size'+contentDocumentIds.size());

        
// 		  List<ContentVersion> documents = [
//             SELECT Id,Contact__c, Title,Applicant_Document_Type__c,Applicant_Document_Status__c,Application__c, FileType, FileExtension, ContentDocumentId, 
//             ContentUrl,VersionNumber,VersionDataUrl
//             FROM ContentVersion
//             WHERE ContentDocumentId IN :contentDocumentIds
//             AND IsLatest = true
//         ];
        
// 		system.debug('Content version documents'+documents);
//         system.debug('Content version documents size'+documents.size());
//         return documents;
//     }

// 	@AuraEnabled
//     public static void approveDocument(Id contentVersionId,Id contentDocumentId) {
        
//         // Check if there is an existing pending task for this content document
//         Integer existingTasks = [
//             SELECT COUNT() 
//             FROM Applicant_Pending_Task__c 
//             WHERE Content_Document_Id__c = :contentDocumentId
//             AND Status__c = 'Pending'
//         ];

//         if (existingTasks > 0) {
//             throw new APFS_CustomException('Cannot approve because a pending task exists for this document.');
//         }
        
//         ContentVersion contentVersion = [SELECT Id, Applicant_Document_Status__c FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];
//         if (contentVersion != null) {
//             contentVersion.Applicant_Document_Status__c = 'Approved';
//             update contentVersion;
//         }
//     }

// 	 @AuraEnabled
//     public static void createPendingTask(Id contactId, Id contentVersionId, Id contentDocumentId,Id applicationId, String documentType, String comments) {
//          // Check if there is already a pending task for this content document ID
//         Integer existingTasks = [
//             SELECT COUNT() 
//             FROM Applicant_Pending_Task__c 
//             WHERE Content_Document_Id__c = :contentDocumentId  AND
//             Status__c = 'Pending'
			
//         ];

//         if (existingTasks > 0) {
//             throw new APFS_CustomException('A pending task already exists for this document.');
//         }
//         // Create the pending task
//         Applicant_Pending_Task__c pendingTask = new Applicant_Pending_Task__c();
//         pendingTask.Contact__c = contactId;
//         pendingTask.Application__c=applicationId;
//         pendingTask.Applicant_Document_Type__c = documentType;
//         pendingTask.Comments__c = comments;
//         pendingTask.Content_Document_Id__c = contentDocumentId;
//         pendingTask.Status__c = 'Pending';
//         pendingTask.Task_Type__c = 'Document Re-Upload';
//         insert pendingTask;
        
//         // Update the ContentVersion status to Rejected
//         ContentVersion contentVersion = [SELECT Id, Applicant_Document_Status__c FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];
//         if (contentVersion != null) {
//             contentVersion.Applicant_Document_Status__c = 'Rejected';
//             update contentVersion;
//         }
//     }
    
//     @AuraEnabled(Cacheable=true)
//     public static String getFileData(Id contentVersionId) {
//         ContentVersion cv = [
//             SELECT VersionData, FileExtension
//             FROM ContentVersion
//             WHERE Id = :contentVersionId
//             LIMIT 1
//         ];

//         // Convert the binary VersionData to a base64 string
//         Blob fileBlob = cv.VersionData;
//         String base64Data = EncodingUtil.base64Encode(fileBlob);

//         // Return the base64 encoded data and file extension
//         return JSON.serialize(new Map<String, Object>{
//             'base64Data' => base64Data,
//             'fileExtension' => cv.FileExtension
//         });
//     }

// }



//------------------------------------js-----------------------------------------------
// import { LightningElement, api, track } from 'lwc';

// export default class ApplicationUploadedDocumentsPreview extends LightningElement {
//     @api isOpen = false;
//     @api contentVersionId;
//     @api contentDocumentId;
//     @api documentType;
//     @api filePreviewUrl;
//     @api fileExtension;
//     @track comments = '';

//     get isImage() {
//         const imageTypes = ['jpg', 'jpeg', 'png'];
//         return imageTypes.includes(this.fileExtension.toLowerCase());
//     }

//     get isPdf() {
//         return this.fileExtension.toLowerCase() === 'pdf';
//     }

//     handleCancel() {
//         this.dispatchEvent(new CustomEvent('cancel'));
//     }

//     handleReject() {
//         const commentsField = this.template.querySelector('.reject-comments');
//         commentsField.setCustomValidity('');
        
//         if (commentsField.value.trim() === '') {
//             commentsField.setCustomValidity('Comments are required');
//         }
        
//         commentsField.reportValidity();

//         if (commentsField.checkValidity()) {
//             const comments = commentsField.value;
//             this.dispatchEvent(new CustomEvent('reject', {
//                 detail: {
//                     contentVersionId: this.contentVersionId,
//                     contentDocumentId: this.contentDocumentId,
//                     filePreviewUrl: this.filePreviewUrl,
//                     documentType: this.documentType,
//                     comments
//                 }
//             }));
//         }
//     }
// }