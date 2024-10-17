import { LightningElement, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import APPLICATION_OBJECT from '@salesforce/schema/Application__c';
import APPLICATION_INTERNAL_STATUS from '@salesforce/schema/Application__c.Application_Internal_Status__c';
import getActiveScholarshipDetails from '@salesforce/apex/APFS_OfferApplications.getActiveScholarshipDetails';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.fetchSpecificStates';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues';
import fetchPrioritizeRecords from '@salesforce/apex/APFS_DisbursalApplication.fetchApplicationWithVerification';
import LightningAlert from 'lightning/alert';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class Apfs_DisbursalPaymentDetails extends NavigationMixin(LightningElement) {
    @track recordTypeId;
    @track contactRecordTypeId;
    internalPicklistValues;
    @track readOnlyInternalValue = 'Disbursement Complete';
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
    @track records = [];
    @track isLoading = false; 
    showDatatable = false;
    @track selectedRows = [];
    @track selectedRecord;
    @track applicationId;
    @track contactId
    @track offerId;

    isInfiniteLoadingEnabled = true;
    rowLimit =5;
    @track rowOffset=0;
    noRecordsMessageVisible = false;
    hasStateChanged = false;
    hasDistrictChanged = false;
    hasReferralChanged = false;
    //columnHeader = ['Application Id', 'Applicant Name', 'Total Scholarship Amount', 'Offer Name', 'Mobile Phone', 'Last Modified By', 'Internal Status', 'Bank Name', 'Branch Name', 'Account Number', 'IFSC Code'];

   @track columns = [
        {
            label: 'Application Id',
            fieldName: 'recordUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Application__r.Name' },
                target: '_self'
            }
        },
        { label: 'Applicant Name', fieldName: 'Contact__r.Name' },
        { label: 'Total Scholarship Amount', fieldName: 'Total_Scholarship_Amount__c' },
        { label: 'Balance Amount', fieldName: '', cellAttributes : {class : {fieldName : 'fontColor'}}  },
        { label: 'Bank Name', fieldName: 'Bank_Detail.Name', cellAttributes : {class : {fieldName : 'fontColor'}} },
        { label: 'Branch Name', fieldName: 'Bank_Detail.Branch_Name' , cellAttributes : {class : {fieldName : 'fontColor'}} },
        { label: 'Internal Status', fieldName: 'Application_Internal_Status__c' },  
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
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application Internal Status Values', 'error');
        }
    }
    @wire(getActiveScholarshipDetails,{scholarshipName: '$sendScholarshipName', editionName: '$sendEditionName', roundName: '$sendRoundName' })
    wiredScholarship({ error, data }) {
        if (data && data.length > 0) {
            const scholarship = data[0]; // Assuming only one active scholarship
            this.scholarshipName = scholarship.scholarshipName;
            this.editionName = scholarship.editionName;
            this.roundName = scholarship.roundName;
            this.scholarshipId = scholarship.scholarshipId;

        } else if (error) {
            this.showToast('Error---',error.body.message?error.body.message: 'Failed to fetch Active Scholarship Details', 'error');
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
    handleReferralChange(event) {
        this.referralValue = event.detail.value;
        this.hasReferralChanged = true;
    }
    async handleFetchRecords() {
        this.showDatatable = true;
        this.isLoading = true;
        this.noRecordsMessageVisible = false; 
        if (!this.readOnlyInternalValue) {
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Internal Status is required.',
                variant: 'error',
            });
            this.dispatchEvent(toastEvent);
            return;
        }
        if (this.hasStateChanged || this.hasDistrictChanged || this.hasReferralChanged) {
            this.rowOffset = 0; 
            this.records = []; 
            this.isInfiniteLoadingEnabled = true; 
            this.hasStateChanged = false; 
            this.hasDistrictChanged = false; 
            this.hasReferralChanged = false;
        }
        try {
            const result = await fetchPrioritizeRecords({
                scholarshipId:this.scholarshipId,
                applicationInternalValue:this.readOnlyInternalValue,
                state: this.stateValue,
                district: this.districtValue,
                referralValue: this.referralValue,
                limitSize: this.rowLimit, 
                offset: this.rowOffset  
            });
            if (result.length > 0) {
                const newRecords = result.map(record => 
                    ({
                   // isBankDetailsModified : record.bankDetail?.isModified,
                   // fontColor: record.bankDetail?.isModified ? 'slds-text-color_success' : '', // Kiruba Sankar /
                    recordUrl: `/lightning/r/Application__c/${record.application.Id}/view`,  
                    'contactId': record.application.Contact__r?.Id || null,  
                    'Offer_Name': record.application.Offers__r[0]?.Name || 'N/A', 
                    'Application__r.Name': record.application.Name,  
                    'Contact__r.Name': record.application.Contact__r?.Name || 'N/A', 
                    'Contact__r.MobilePhone': record.application.Contact__r?.MobilePhone || 'N/A', 
                    'Contact__r.Referral_Partner_Name__c': record.application.Contact__r?.Referral_Partner_Name__c || 'N/A',
                    'LastModifiedBy.Name': record.application.LastModifiedBy?.Name || 'N/A', 
                    'Total_Scholarship_Amount__c': record.application.Offers__r[0]?.Total_Scholarship_Amount__c || 'N/A', 
                    'Application_Internal_Status__c': record.application.Application_Internal_Status__c || 'N/A',
                    Application_Id: record.application.Id || null,
                    'Bank_Detail.Name': record.bankDetail?.name || 'N/A',  
                    'Bank_Detail.Branch_Name': record.bankDetail?.branchName || 'N/A', 
                    'Bank_Detail.Account_Number': record.bankDetail?.encryptedAccountNumber || 'N/A',
                    'Bank_Detail.IFSC_Code': record.bankDetail?.ifscCode || 'N/A'
                }));
                if (this.rowOffset === 0) {
                    this.records = newRecords; 
                } else {
                    this.records = [...this.records, ...newRecords]; 
                }
                this.rowOffset += this.rowLimit; 
            } else {
                if (this.rowOffset === 0) {
                    this.noRecordsMessageVisible = true; 
                }
                this.isInfiniteLoadingEnabled = false;
            }
        } catch (error) {
            this.showAlert(error.body.message ? error.body.message : 'Error fetching records.Please try again','error','Error');
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
        const selectedRows = event.detail.selectedRows;
        if (selectedRows.length > 0) {
            this.selectedRecord = selectedRows[0]; 
            this.applicationId = this.selectedRecord.Application_Id; 
            this.offerId = this.selectedRecord.Offer_Name;
            this.contactId = this.selectedRecord.contactId;
            this.accountNumber = this.selectedRecord['Bank_Detail.Account_Number'] ;
            this.ifscCode = this.selectedRecord['Bank_Detail.IFSC_Code'];
        } else {
            this.selectedRecord = null;
            this.applicationId = null;
            this.offerId = null;
        }
    }
    
    showSuccessAlert(message,theme,label){
        LightningAlert.open({
          message: message,
          theme: theme,
          label: label,
      }).then(() => {
        this.template.querySelector('lightning-datatable').selectedRows = [];
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