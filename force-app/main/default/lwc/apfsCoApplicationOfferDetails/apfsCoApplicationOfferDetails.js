import { LightningElement, api,wire,track } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { publish,subscribe, createMessageContext } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCurrentUserProfileName from '@salesforce/apex/APFS_ContactDocumentsController.getCurrentUserProfileName';
import getBankDetail from '@salesforce/apex/APFS_ContactDocumentsController.getBankDetail';
import getMissingDocumentTypes from '@salesforce/apex/APFS_ContactDocumentsController.getMissingDocumentTypes';
import createApplicationStatusComment from '@salesforce/apex/APFS_ContactDocumentsController.createApplicationStatusComment';

import ApplicationEditPermissionProfiles from '@salesforce/label/c.Application_Edit_Permission';
import getUploadedDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getFilteredDocumentsForOffer';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";
const FIELDS =[
    'Offer__c.Application__c',
    'Offer__c.Application__r.Contact__c',
    'Offer__c.Application__r.Application_Internal_Status__c',
    'Offer__c.Offer_Start_Date__c',
    'Offer__c.Offer_End_Date__c',
    'Offer__c.Current_Offer__c',
    'Offer__c.Total_Scholarship_Amount__c',
    'Offer__c.Number_Of_Installments_Per_Year__c',
    'Offer__c.Total_Number_Of_Installments__c',
    'Offer__c.Net_Course_Duration__c',
    'Offer__c.Amount_Per_Installment__c',
    'Offer__c.Scholarship_Amount_Per_Annum__c'
];
export default class ApfsCoApplicationOfferDetails extends NavigationMixin(LightningElement) {
    @api recordId;
    @track applicationInternalStatusForFile;
    @api sObjectBank = 'Contact';
    missingDocType='offerDoc';
    applicationId;
    applicationInternalStatus;
    applicationExternalStatus;
    offerStartDate;
    offerEndDate;
    offerCurrentOffer;
    totalScholarshipAmount;
    noOfInstallment;
    totalNoOfInstallment;
    courseDuration;
    totalOfferAmount;
    amountPerInstallment;
    scholarshipAmountPerAnnum;
    contactId;
    commentValue;

    @track bankDetails = [];
    @track offerFiles = [];
    @track rejectedFiles = [];
    @track selectedFiles =[];
    @track unverifiedFiles =[];
    @track missingDocuments =[];

    @track updatedBank ={};
    @track componentVisibility = true;
    @track isRecordEditMode = false;
    @track recordEditPermission = false;
    @track varificationButtonVisibilty = true;
    @track isRequiredFieldMissing =false;
    @track commentVisibilityPopup = false;
    @track documentsVisibilityPopup = false;
    @track bankDetailsSection = false;
    @track resumbisionComment = false;
    messageContext = createMessageContext();
    columns = [
        { label: 'File Name', fieldName: 'fileName', type: 'text' },
        { label: 'Document Type', fieldName: 'documentType', type: 'text' },
        { label: 'Status', fieldName: 'applicantDocumentStatus', type: 'text' },
        { label: 'Comments', fieldName: 'comment', type: 'text' }
        ];
    @track columnsMissingDoc = [
        { label: 'Document Type', fieldName: 'documentType', type: 'text' }
    ];
    connectedCallback(){
        this.subscribeMessage();
    }
    @wire(getCurrentUserProfileName)
    wiredProfileName({ error, data }) {
        if (data) {
            this.userProfileName = data;
            const adminProfilesArray = ApplicationEditPermissionProfiles.split(',');
            if (adminProfilesArray.includes(this.userProfileName.trim())) { 
                this.recordEditPermission = true;}
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredOffer(result) {
        if(result.data){
            this.applicationId = result.data?.fields?.Application__c?.value;
            if(this.applicationId){
                this.fetchUploadedDocuments();
                this.loadMissingDocuments();
            }
            this.offerStartDate = result.data?.fields?.Offer_Start_Date__c?.value;
            this.offerEndDate = result.data?.fields?.Offer_End_Date__c?.value;
            this.offerCurrentOffer = result.data?.fields?.Current_Offer__c?.value;
            this.totalScholarshipAmount = result.data?.fields?.Total_Scholarship_Amount__c?.value;
            this.noOfInstallment = result.data?.fields?.Number_Of_Installments_Per_Year__c?.value;
            this.totalNoOfInstallment = result.data?.fields?.Total_Number_Of_Installments__c?.value;
            this.amountPerInstallment = result.data?.fields?.Amount_Per_Installment__c?.value;
            this.scholarshipAmountPerAnnum = result.data?.fields?.Scholarship_Amount_Per_Annum__c?.value;

            this.courseDuration = result.data?.fields?.Net_Course_Duration__c?.value;
            this.applicationInternalStatus = result.data?.fields?.Application__r?.value?.fields?.Application_Internal_Status__c	?.value;
            this.applicationInternalStatusForFile = this.applicationInternalStatus;
            this.contactId = result.data?.fields?.Application__r?.value?.fields?.Contact__c?.value;
            if(this.contactId){
                this.fetchBankDetails();
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

    getContentDocumentUrl(contentDocumentId) {
        return `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
    }
    isImage(fileExtension) {
        return ['jpg', 'jpeg', 'png'].includes(fileExtension.toLowerCase());
    }
    isPdf(fileExtension) {
        return fileExtension.toLowerCase() === 'pdf';
    }
    fetchBankDetails() {
        this.bankDetails=[];
        getBankDetail({ contactId: this.contactId })
            .then(result => {
                this.bankDetails = result;
                this.bankDetailsSection = true;
                this.bankName = this.bankDetails.Name;
            })
            .catch(error => {
                this.bankDetails = undefined;
                this.showToast('Error', error.body.message || 'Failed to retrieve bank details.', 'error');
            });
    }
    loadMissingDocuments() {
        getMissingDocumentTypes({ applicationId: this.applicationId, missingType: this.missingDocType })
            .then(result => {
                if (result && result.length > 0) {
                    this.missingDocuments = result.map(docType => {
                        return { documentType: docType };
                    });
                } else {
                    this.missingDocuments = [];
                }
            })
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load Missing documents', 'error');
            });
    }
    toggleEditMode() {
        this.isRecordEditMode = !this.isRecordEditMode;
        this.varificationButtonVisibilty = false;
    }
    get getOfferStartDate() {
        if (this.offerStartDate) {
            let dateObj = new Date(this.offerStartDate);
            let day = String(dateObj.getDate()).padStart(2, '0');
            let month = String(dateObj.getMonth() + 1).padStart(2, '0');
            let year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return null;
    }
    get getOfferEndDate() {
        if (this.offerEndDate) {
            let dateObj = new Date(this.offerEndDate);
            let day = String(dateObj.getDate()).padStart(2, '0');
            let month = String(dateObj.getMonth() + 1).padStart(2, '0');
            let year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return null;
    }
    
    cancelEdit() {
        this.isRecordEditMode = false;
        this.varificationButtonVisibilty = true;
    }
    handleFieldChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
        if (event.target.dataset.type === 'bank') {
            const closestElement = event.target.closest('[data-key]');
            const bankId = closestElement.dataset.key;  
            if (!this.updatedBank[bankId]) {
                this.updatedBank[bankId] = { Id: bankId };
            }
            this.updatedBank[bankId][field] = this[field];
        }
    }
    handleClick(event) {
        const clickedLinkName = event.target.name;
        const applicationId = this.applicationId;
        const isSpecialCase = clickedLinkName === 'Bank Proof';
        const matchingFiles = this.offerFiles.filter(f => 
            (isSpecialCase ? f.documentType === clickedLinkName : f.documentType === clickedLinkName && f.applicationId === applicationId)
        );
        if (matchingFiles.length > 0) {
            this.selectedFiles = matchingFiles.map(file => ({
                contentVersionId: file.contentVersionId,
                contentDocumentId: file.contentDocumentId,
                contactId: file.contactId,
                applicationId: file.applicationId,
                documentType: file.documentType,
                fileExtension: file.fileExtension,
                filePreviewUrl: file.contentDocumentUrl,
                applicantDocumentStatus: file.applicantDocumentStatus,
                applicationInternalStatus: this.applicationInternalStatusForFile
            }));
            this.publishMessage();
        } else {
            this.showToast('Error', `${clickedLinkName} file not found.`, 'error');
        }
    }
    publishMessage() {
        const message = {
            isOpen: true,
            files: this.selectedFiles,
            operationType: 'ApfsCoApplicationVerifier'
        };
        publish(this.messageContext, apfsCoDocMessagingChannel, message);
    }
    async saveRecord() {
        const isBankUpdateValid = await this.handleBankUpdate();
        if (isBankUpdateValid) {
            this.fetchBankDetails();
            this.isRecordEditMode = false;
            this.varificationButtonVisibilty = true;
        }
    }
    updateRecord(fields) {
        const recordInput = { fields };
        return updateRecord(recordInput)
            .then(() => {
            })
            .catch(error => {
                this.varificationButtonVisibilty = true;
                this.showToast('Error',error.body.message?error.body.message: 'Failed to update', 'error');
            });
    }
    handleBankUpdate() {
        const recordsToUpdate = Object.values(this.updatedBank);
        let isValid = true;    
        this.template.querySelectorAll('lightning-input[data-type="bank"]').forEach(input => {
            if (!input.value) {
                input.setCustomValidity('Please complete this field.');
                isValid = false;
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        });
    
        if (!isValid) {
            return Promise.resolve(false); 
        }
    
        if (recordsToUpdate.length > 0) {
            const promises = recordsToUpdate.map(record => {
                const recordInput = { fields: record };
                return updateRecord(recordInput);
            });
    
            return Promise.all(promises)
                .then(() => {
                    this.bankDetails = [];
                    this.updatedBank = {};
                    return true; 
                })
                .catch(error => {
                    this.showToast('error', 'An error occurred while updating bank', 'error');
                    return false;
                });
        } else {
            return Promise.resolve(true);
        }
    }
    
        
    handleCommentChange(event){
        this.commentValue  = event.target.value;
    }
    handleClickButton(event){
        const clickedButtonName = event.target.name;
        if(clickedButtonName === 'Offer Verification Cleared'){
            const isFormValid = this.validateRequiredFields();
            if (isFormValid) {
                this.unverifiedFiles = this.offerFiles.filter(file => file.applicantDocumentStatus !== 'Verified');
                if (this.unverifiedFiles.length > 0) {
                    this.showToast('Error', 'A few documents are still not verified.', 'error');
                }else if (this.missingDocuments.length>0) {
                    this.showToast('Error', 'A few documents are fully rejected.', 'error');
                } else {
                    this.applicationInternalStatus = 'Offer Verification Cleared';
                    this.commentVisibilityPopup = true;

                }

            }
        }else if(clickedButtonName === 'Offer Document Needs Resubmission'){
            const isFormValid = this.validateRequiredFields();
            if (isFormValid) {
                this.applicationInternalStatus = 'Offer Document Needs Resubmission';
                this.applicationExternalStatus = 'Offer Document Needs Resubmission';
                this.documentsVisibilityPopup=true;
            }
        }else if(clickedButtonName === 'closeRequireFieldPopup'){
            this.isRequiredFieldMissing = false;
        }else if(clickedButtonName === 'cancelComment'){
            this.commentVisibilityPopup = false;
            this.commentValue = '';
        }else if(clickedButtonName === 'cancelDocumentsVisibilityPopup'){
            this.documentsVisibilityPopup = false;
            this.resumbisionComment = false;
            this.commentValue = '';
        }else if(clickedButtonName === 'saveComment'){
            if(this.applicationInternalStatus === 'Offer Verification Cleared'){
                if (this.checkCommentValidity()) {
                    const fields = {
                        Id: this.applicationId,
                        Application_Internal_Status__c: this.applicationInternalStatus
                    };
                    this.updateRecord(fields);
                    this.createApplicationCommentRecord();
                    this.commentVisibilityPopup = false;
                    this.navigateToOfferPage();
                }
            }
        }else if(clickedButtonName === 'createAction'){
            this.rejectedFiles = this.offerFiles.filter(file => file.applicantDocumentStatus === 'Rejected');
            const unverifiedOrRejectedFiles = this.offerFiles.filter(file => file.applicantDocumentStatus !== 'Verified' && file.applicantDocumentStatus !== 'Rejected');
            if(unverifiedOrRejectedFiles.length > 0 ){
               this.showToast('Error', 'A few documents are still not verified or rejected.', 'error');
            }else if (this.rejectedFiles.length > 0 || this.missingDocuments.length > 0) {
                this.resumbisionComment = true;
                if (this.checkCommentValidity()) {
                    const fields = {
                        Id: this.applicationId,
                        Application_Internal_Status__c: this.applicationInternalStatus,
                        Application_External_Status__c: this.applicationExternalStatus
                    };
                    this.updateRecord(fields);
                    this.createApplicationCommentRecord();
                    this.documentsVisibilityPopup = false;
                    this.navigateToOfferPage();
                }
           } else {
               this.showToast('Error', 'No documents are fully rejected or have been rejected.', 'error');
           }
       }else{

        }
    }
    validateRequiredFields() {
        if (!this.courseDuration) missingFields.push('Net Course Duration');
        const missingFields = [];
        if(this.bankDetails.length===0){
            missingFields.push('Bank Details');
        }else{
            if (!this.bankDetails[0].Encrypted_Bank_Account_Number__c) missingFields.push('Bank Account Number');
            if (!this.bankDetails[0].Bank_Ifsc_Code__c) missingFields.push('Bank IFSC Code');
            if (!this.bankDetails[0].Name) missingFields.push('Bank Name');
            if (!this.bankDetails[0].Branch_Name__c) missingFields.push('Branch Name');
        }
        this.isValid = missingFields.length === 0;
        if (!this.isValid) {
            this.popupMessage = `The following fields are missing: ${missingFields.join(', ')}`;
            this.isRequiredFieldMissing=true;
        } 
        return this.isValid;
    }
    checkCommentValidity() {
        const textareaElement = this.template.querySelector('lightning-textarea');
        if (!this.commentValue || this.commentValue.trim() === '') {
            textareaElement.setCustomValidity('Complete this field.');
            textareaElement.reportValidity();
            return false; 
        } else {
            textareaElement.setCustomValidity('');
            textareaElement.reportValidity();
            return true; 
        }
    }
    createApplicationCommentRecord() {
        createApplicationStatusComment({ 
            applicationId: this.applicationId, 
            internalStatus: this.applicationInternalStatus, 
            comment: this.commentValue,
            rejectedResason: '' 
        })
        .then(result => {
            this.showToast('Success', this.applicationInternalStatus, 'Success');
        })
        .catch(error => {
            this.showToast(error.body.message?error.body.message:'Failed to update.', 'error','Error');
        });
    }
    subscribeMessage(){
        this.subscription = subscribe(this.messageContext, apfsCoDocMessagingChannel, (message) => {
            if(message!=undefined || message!=null)
                {
                    this.fetchUploadedDocuments();
                }
        })
    }
    navigateToOfferPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Offer_Lightning'             
            }
        });
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}