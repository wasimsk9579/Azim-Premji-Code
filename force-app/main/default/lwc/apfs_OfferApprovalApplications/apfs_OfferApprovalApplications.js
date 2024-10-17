import { LightningElement, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import APPLICATION_OBJECT from '@salesforce/schema/Application__c';
import APPLICATION_INTERNAL_STATUS from '@salesforce/schema/Application__c.Application_Internal_Status__c';
import getActiveScholarshipDetails from '@salesforce/apex/APFS_PrioritizeApplications.getActiveScholarshipDetails';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.fetchSpecificStates';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues';
import fetchRecords from '@salesforce/apex/APFS_PrioritizeApplications.fetchOfferApprovedRecords';
import updateApplicationStatus from '@salesforce/apex/APFS_PrioritizeApplications.updateApplicationStatus';
import LightningAlert from 'lightning/alert';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class Apfs_OfferApprovalApplications extends LightningElement {
    @track recordTypeId;
    @track contactRecordTypeId;
    internalPicklistValues;
    @track readOnlyInternalValue = 'Verification Cleared';
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
    hasStateChanged = false;
    hasDistrictChanged = false;
    hasReferralChanged = false;
    noRecordsMessageVisible = false;

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
        { label: 'Total Scholarship Amount', fieldName: 'Scholarship_Round__r.Scholarship_Edition__r.Total_Amount_Per_Installment__c' },

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
            this.internalReadOnlyPicklistValues = data.values;
            const desiredValues = ['Offer Letter Approved'];
            this.internalPicklistValues = data.values.filter(value => desiredValues.includes(value.label));
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application Internal Status Values', 'error');
        }
    }
    @wire(getActiveScholarshipDetails,{scholarshipName: '$sendScholarshipName', editionName: '$sendEditionName', roundName: '$sendRoundName'})
    wiredScholarship({ error, data }) {
        if (data && data.length > 0) {
            const scholarship = data[0]; // Assuming only one active scholarship
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
   
    handleReferralChange(event){
        this.referralValue = event.detail.value;
        this.hasReferralChanged = true;
    }
    async handleFetchRecords() {
        this.isLoading = true;
        this.noRecordsMessageVisible = false; 
        if (this.hasStateChanged || this.hasDistrictChanged || this.hasReferralChanged) {
            this.lastApplicationId = null; 
            this.records = []; 
            this.isInfiniteLoadingEnabled = true; 
            this.hasStateChanged = false; 
            this.hasDistrictChanged = false; 
            this.hasReferralChanged = false;
        }
        try {
            const result = await fetchRecords({
                scholarshipId:this.scholarshipId,
                applicationInternalValue:this.readOnlyInternalValue,
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
                    'Contact__r.Name': record.Contact__r ? record.Contact__r.Name : 'N/A', // Default value if undefined
                    'Contact__r.MobilePhone': record.Contact__r ? record.Contact__r.MobilePhone : 'N/A', // Handle potential null values
                    'Contact__r.Referral_Partner_Name__c': record.Contact__r ? record.Contact__r.Referral_Partner_Name__c : 'N/A', // Handle potential null values
                    'Scholarship_Round__r.Scholarship_Edition__r.Total_Amount_Per_Installment__c': record.Scholarship_Round__r && record.Scholarship_Round__r.Scholarship_Edition__r
                    ? record.Scholarship_Round__r.Scholarship_Edition__r.Total_Amount_Per_Installment__c 
                    : 'N/A', // Handle potential null values
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
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch application records', 'error');
            this.noRecordsMessageVisible = true; 
        } finally {
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
        this.updateInternalValue ='';
        let selectedRows = event.detail.selectedRows;
    
        if (selectedRows.length > 4500) { //4500
            this.showAlert('You cannot select more than 4500 records. Only 4500 records have been selected.','warning','Warning');
        }
        this.selectedRows = selectedRows.map(row => row.Id);
    }
    handleInternalUpdateChange(event) {
        this.updateInternalValue = event.detail.value;
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
                internalStatus: this.updateInternalValue 
            });
            await this.showSuccessAlert('Records updated successfully.','success','Success');
        } catch (error) {
            await this.showAlert(error.body.message ? error.body.message : 'There was an error updating the records.Please try again','error','Error');
        } finally {
            this.isLoading = false;
            this.updateInternalValue = ''; 
            this.selectedRows = [];
        }
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