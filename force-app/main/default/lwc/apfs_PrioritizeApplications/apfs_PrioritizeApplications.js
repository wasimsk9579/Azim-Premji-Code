/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-26-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import APPLICATION_OBJECT from '@salesforce/schema/Application__c';
import APPLICATION_INTERNAL_STATUS from '@salesforce/schema/Application__c.Application_Internal_Status__c';
import APPLICATION_STATUS_COMMENT_OBJECT from '@salesforce/schema/Application_Status_Comment__c';
import APPLICATION_REJECTED_STATUS from '@salesforce/schema/Application_Status_Comment__c.Rejected_Reason__c';
import getActiveScholarshipDetails from '@salesforce/apex/APFS_PrioritizeApplications.getActiveScholarshipDetails';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.fetchSpecificStates';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues';
import fetchPrioritizeRecords from '@salesforce/apex/APFS_PrioritizeApplications.fetchPrioritizeRecords';
import updateApplicationStatus from '@salesforce/apex/APFS_PrioritizeApplications.updateApplicationStatus';
import LightningAlert from 'lightning/alert';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Apfs_PrioritizeApplications extends LightningElement {
    @track recordTypeId;
    @track contactRecordTypeId;
    @track applicationStatusRecordTypeId;
    internalPicklistValues;
    @track readOnlyInternalValue = '';
    internalReadOnlyPicklistValues;
    @track referralPicklistValues = [
        { label: 'All', value: 'All' },
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
    disableDistrictValue = true;
    @track sendScholarshipName = 'Azim Premji Scholarship'; 
    @track sendEditionName = 'SCH-ED-000001';
    @track sendRoundName = 'SCH-RND-000001';
    @track scholarshipName;
    @track editionName;
    @track roundName;
    @track scholarshipId;
    @track stateValue = '';
    @track districtValue = '';
    @track blockValue = '';
    @track referralValue = '';
    @track updateInternalValue = '';
    @track stateValueOptions = [];
    @track districtValueOptions = [];
    @track blockValueOptions = [];
    @track selectedStateId; 
    @track selectedDistrictId;
    @track selectedBlockId;
    @track records=[];
    @track isLoading = false;
    @track selectedRows = [];
    @track lastApplicationId = null;
    @track maxRecordsPerFetch = 200; 

    isInfiniteLoadingEnabled = true;
    hasInternalValueChanged = false;
    hasStateChanged = false;
    hasDistrictChanged = false;
    hasReferralChanged = false;
    noRecordsMessageVisible = false;

    commentVisibilityPopup = false;
    displayRejectedReason = false;
    commentInputVisibility = false;
    picklistOptions;
    selectedRejectedReasonValue;
    commentValue;
    validSelectedRejectedReasonValue;
    validCommentValue;

   
    @track columns = [
        {
            label: 'Application Id',
            fieldName: 'recordUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_self'
            }
        },
        { label: 'Applicant Name', fieldName: 'Contact__r.Name' },
        { label: 'Mobile Number', fieldName: 'Contact__r.MobilePhone' },
        { label: 'Partner Name', fieldName: 'Contact__r.Referral_Partner_Name__c' },
        { label: 'Assigned To', fieldName: 'LastModifiedBy.Name' },
        { label: 'Application Internal Status', fieldName: 'Application_Internal_Status__c' }, 

    ];
    @wire(getObjectInfo, { objectApiName: APPLICATION_OBJECT })
    objectInternalInfo({ error, data }) {
        if (data) {
            this.recordTypeId =data.defaultRecordTypeId;           
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application record type', 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: APPLICATION_INTERNAL_STATUS })
    wiredInternalPicklistValues({ error, data }) {
        if (data) {
            const selectedValues = ['Submitted','Not Selected Draft'];
            this.internalReadOnlyPicklistValues = data.values.filter(value => selectedValues.includes(value.label));;
            const desiredValues = ['To Be Reviewed','Not Selected'];
            this.internalPicklistValues = data.values.filter(value => desiredValues.includes(value.label));
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application Internal Status Values', 'error');
        }
    }

    @wire(getObjectInfo, { objectApiName: APPLICATION_STATUS_COMMENT_OBJECT })
    objectStatusInfo({ error, data }) {
        if (data) {
            this.applicationStatusRecordTypeId =data.defaultRecordTypeId;    
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application Status Record Type', 'error');
        }
    }
 
    @wire(getPicklistValues, { recordTypeId: '$applicationStatusRecordTypeId', fieldApiName: APPLICATION_REJECTED_STATUS })
    wiredRejectedPicklistValues({ error, data }) {
        if (data) {
            this.picklistOptions = data.values;
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application Status Rejected Values', 'error');
        }
    }
    @wire(getActiveScholarshipDetails,{scholarshipName: '$sendScholarshipName', editionName: '$sendEditionName', roundName: '$sendRoundName'})
    wiredScholarship({ error, data }) {
        if (data && data.length > 0) {
            const scholarship = data[0]; 
            this.scholarshipName = scholarship.scholarshipName;
            this.editionName = scholarship.editionName;
            this.roundName = scholarship.roundName;
            this.scholarshipId = scholarship.scholarshipId;

        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Active Scholarship Details', 'error');
        }
    }
   
    
    @wire(getStatePicklistValues)
    wiredStatePicklistValues({ error, data }) {
        if (data) {
            this.stateValueOptions = Object.keys(data).map(key => ({
                Id: key,
                label: data[key],
                value: data[key]
            }));
            this.stateValueOptions.unshift({ label: 'None', value: 'None' });
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch state values', 'error');
        }
    }
    handleInternalStatusChange(event) {
        this.readOnlyInternalValue = event.detail.value;
        this.hasInternalValueChanged = true;
    }
    handleStateChange(event) {
        const selectedValue = event.detail.value;
        const selectedOption = this.stateValueOptions.find(option => option.value === selectedValue);        
        this.stateValue = selectedValue; 
        this.selectedStateId = selectedOption.Id;
        if (selectedValue === 'None' || !selectedValue) {
            this.districtValue = ''; 
            this.disableDistrictValue = true; 
        } else {
            this.districtValue = ''; 
            this.disableDistrictValue = false; 
            this.loadDistrictPicklistValues(this.selectedStateId);
        }
        this.hasStateChanged = true;
    }
    loadDistrictPicklistValues(StateId) {
        return getDistrictPicklistValues({ stateId: StateId })  // Return the promise
            .then(result => {
                this.districtValueOptions = Object.keys(result).map(key => ({
                    Id: key,
                    label: result[key],
                    value: result[key]
                }));
                this.districtValueOptions.unshift({ label: 'None', value: 'None' });
            })
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch district values', 'error');
            });
    }
    
    handleDistrictChange(event) {
        const selectedValue = event.detail.value;
        const selectedOption = this.districtValueOptions.find(option => option.value === selectedValue);
        this.districtValue = selectedValue;
        this.selectedDistrictId = selectedOption.Id;
        this.hasDistrictChanged = true;
    }
   
    handleReferralChange(event) {
        this.referralValue = event.detail.value;
        this.hasReferralChanged = true;
    }
   
    async handleFetchRecords() { 
        if (!this.readOnlyInternalValue) {
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Internal Status is required.',
                variant: 'error',
            });
            this.dispatchEvent(toastEvent);
            return;
        }
        this.isLoading = true;
        this.noRecordsMessageVisible = false; 
        if (this.hasInternalValueChanged || this.hasStateChanged || this.hasDistrictChanged || this.hasReferralChanged) {
            this.lastApplicationId = null;
            this.records = []; 
            this.isInfiniteLoadingEnabled = true;
            this.hasInternalValueChanged = false; 
            this.hasStateChanged = false; 
            this.hasDistrictChanged = false; 
            this.hasReferralChanged = false;
        }
        try {
            const result = await fetchPrioritizeRecords({
                scholarshipId: this.scholarshipId,
                applicationInternalValue: this.readOnlyInternalValue,
                state: this.stateValue,
                district: this.districtValue,
                referralValue: this.referralValue,
                limitSize: this.maxRecordsPerFetch,
                lastApplicationId: this.lastApplicationId
            });
               
            if (result.length > 0) {
                const newRecords = result.map(record => ({
                    ...record,
                    recordUrl: `/lightning/r/Application__c/${record.Id}/view`,
                    'Contact__r.Name': record.Contact__r ? record.Contact__r.Name : 'N/A',
                    'Contact__r.MobilePhone': record.Contact__r ? record.Contact__r.MobilePhone : 'N/A',
                    'Contact__r.Referral_Partner_Name__c': record.Contact__r ? record.Contact__r.Referral_Partner_Name__c : 'N/A',
                    'LastModifiedBy.Name': record.LastModifiedBy?.Name || 'N/A',
                }));
                this.records = [...this.records, ...newRecords]; 

                this.lastApplicationId = this.records[this.records.length - 1].Id;
 
            } else {
                if (this.records.length === 0) {
                    this.noRecordsMessageVisible = true; 
                }
                this.isInfiniteLoadingEnabled = false;
            }
    
        } catch (error) {
            this.showToast('Error', error.body.message ? error.body.message : 'Failed to fetch application records', 'error');
            this.noRecordsMessageVisible = true; 
        } 
        finally {
            this.isLoading = false;
        }
    }
    
    loadMoreData(event) {
        const { target } = event;
        target.isLoading = true; 
    
        this.handleFetchRecords()
        .then(() => {
            target.isLoading = false; 
        })
        .catch(() => {
            target.isLoading = false; 
        });
    }
    async handleRowSelection(event) {
        let selectedRows = event.detail.selectedRows;
        if (selectedRows.length > 9500) {  //9500
            this.showAlert('You cannot select more than 9500 records. Only 9500 records have been selected.','warning','Warning');
        }
        this.selectedRows = selectedRows.map(row => row.Id);  
    }
    handleInternalUpdateChange(event) {
        this.updateInternalValue = event.detail.value; 
        if (this.updateInternalValue === 'Not Selected') {
            this.commentVisibilityPopup = true;
            this.selectedRejectedReasonValue = '';
            this.commentValue = '';
            this.displayRejectedReason = true;

            if (this.selectedRows.length > 4500) { //4500
                this.showAlert('You can only select up to 4500 records for the "Not Selected" option.', 'warning', 'Warning');
            }
        } else {
            this.commentVisibilityPopup = false; 
        }
    }
    handleCloseButton(event){
        this.commentVisibilityPopup = false;
        this.commentInputVisibility = false;
        this.displayRejectedReason =false;
        this.selectedRejectedReasonValue = '';
        this.commentValue = '';
        this.updateInternalValue = '';
        this.template.querySelector('lightning-datatable').selectedRows = [];
        this.selectedRows =[];
    }
    handleRejectedReason(event){
        this.selectedRejectedReasonValue = event.detail.value;
        this.commentValue ='';
            if(this.selectedRejectedReasonValue==='Others'){
                this.commentInputVisibility = true;
            }else{
                this.commentInputVisibility = false;
            }
    }
    handleCommentChange(event){
        this.commentValue = event.target.value;
        
    }
    handleSaveModal() {     
        if (this.checkCommentValidityForNotSelected()) {
            this.validSelectedRejectedReasonValue = this.selectedRejectedReasonValue;
            this.validCommentValue = this.commentValue;
            this.commentVisibilityPopup = false; // Close the modal if valid
            this.handleUpdateRecords();
        }
    }
    
    checkCommentValidityForNotSelected() {
        const combobox = this.template.querySelector('.rejectedReason');
        const textarea = this.template.querySelector('.commentInput');
        let isValid = true;
        // Validate combobox
        if (!this.selectedRejectedReasonValue) {
            combobox.setCustomValidity('This field is required.');
            isValid = false;
        } else {
            combobox.setCustomValidity('');
        }
        combobox.reportValidity();
    
        // Validate comment if "Others" is selected
        if (this.selectedRejectedReasonValue === 'Others') {
            if (!this.commentValue) {
                textarea.setCustomValidity('Comment is required when "Others" is selected.');
                isValid = false;
            } else {  
                textarea.setCustomValidity('');
            }
            textarea.reportValidity();
        }           
        return isValid; // Return the validity status
    }
    
    async handleUpdateRecords() {
        if (!this.updateInternalValue) {
            await this.showAlert('No value has been selected for the Application Internal Status.','warning','Warning');
            return;
        } 
        this.isLoading = true; 
        try {
            await updateApplicationStatus({ 
                recordIds: this.selectedRows, 
                internalStatus: this.updateInternalValue,
                rejectedReason: this.validSelectedRejectedReasonValue,
                comment: this.validCommentValue
            });
            await this.showSuccessAlert('Records updated successfully.','success','Success');
        } catch (error) {
            
            await this.showAlert(error.body.message ? error.body.message : 'There was an error updating the records.Please try again','error','Error');
        } finally {
            this.isLoading = false;
            this.updateInternalValue = ''; 
            this.selectedRows = [];
            this.selectedRejectedReasonValue = '';
            this.commentValue = '';
            this.validSelectedRejectedReasonValue ='';
            this.validCommentValue='';
            this.commentInputVisibility = false;
           
        }
    }
    get getTotalAllowedSelectedRows(){
        return this.updateInternalValue==='Not Selected'?4500:9500;   //4500:9500
    }
    showSuccessAlert(message,theme,label){
        LightningAlert.open({
          message: message,
          theme: theme,
          label: label,
      }).then(() => {
        this.template.querySelector('lightning-datatable').selectedRows = [];
        this.lastApplicationId = null;
        this.isInfiniteLoadingEnabled = true; 
        this.selectedRows = [];
        this.records = []; 
        this.handleFetchRecords(); 
      });
      }
      showAlert(message,theme,label){
        LightningAlert.open({
          message: message,
          theme: theme,
          label: label,
      })
      }

      /**
     * @description       : Utility function to show toast notifications.
     * @param {String} title - The title of the toast notification.
     * @param {String} message - The message of the toast notification.
     * @param {String} variant - The type of toast notification ('success', 'error', 'warning', 'info').
     */
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(toastEvent);
    }
}