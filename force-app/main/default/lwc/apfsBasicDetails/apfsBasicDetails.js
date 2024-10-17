/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-12-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,track,wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import USER_ID from '@salesforce/user/Id';
import { CurrentPageReference } from 'lightning/navigation';
import EXTERNAL_APPLICATION_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import REFERAL_OPTIONS from '@salesforce/schema/Contact.Referred_By_APF_Or_Partners__c';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { refreshApex } from "@salesforce/apex";
import { updateRecord } from "lightning/uiRecordApi";
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import REFERRED_BY_APF_OR_PARTNERS from '@salesforce/schema/Contact.Referred_By_APF_Or_Partners__c';
import REFERRAL_PARTNER_NAME from '@salesforce/schema/Contact.Referral_Partner_Name__c';
import REFERRAL_PARTNER_STATE from '@salesforce/schema/Contact.Referral_Partner_State__c' ;
import IS_MY_REFFERAL_DETAILS_COMPLETED from '@salesforce/schema/Contact.Is_My_Referral_Details_Completed__c' ;
import FORM_PROGRESS_UPDATE from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c' ;
import REFERRAL_FULL_NAME from '@salesforce/schema/Contact.Referral_Full_Name__c' ;  
import getStatePicklistValues from '@salesforce/apex/APFS_RefferalStatesandOrg.getStatePicklistValues';
import getOrganizationPicklistValues from '@salesforce/apex/APFS_RefferalStatesandOrg.getOrganizationPicklistValues';


import REFERAL_LABEL from '@salesforce/label/c.Referal';
import REFERAL_DETAILS_HEADING_LABEL from '@salesforce/label/c.Refferal_details_heading';
import REFERAL_YES_SHARE_LABEL from '@salesforce/label/c.Referal_Yes_Share';
import PARTNER_STATE from '@salesforce/label/c.Referral_State';
import NAME_OF_THE_PARTNER from '@salesforce/label/c.Name_of_the_Partner';
import REFFERAL_NAME_LABEL from '@salesforce/label/c.Referral_Name_Label';
import PLEASE_SELECT_AN_OPTION_LABEL from '@salesforce/label/c.Please_select_an_option_Label';
import REFERRAL_DETIALS_SAVED_LABEL from '@salesforce/label/c.Referral_details_saved_successfully_Label';
import COMPLETE_THIS_FIELD_LABEL from '@salesforce/label/c.Complete_this_field_Label';
import sucessLabel from '@salesforce/label/c.Success_Label';
import SELECT_AN_OPTION_LABEL from '@salesforce/label/c.Select_an_Option_label';
import ENTER_IN_ENGLISH_LABEL from '@salesforce/label/c.Please_enter_the_text_in_English_helptext';




const CONTACT_FIELDS = 
    ['Contact.Name','Contact.Referred_By_APF_Or_Partners__c','Contact.Referral_Partner_Name__c',
    'Contact.Referral_Partner_State__c','Contact.Referral_Full_Name__c','Contact.Is_My_Referral_Details_Completed__c','Contact.Application_Forms_Progress_Percent__c'];

export default class ApfsBasicDetails extends LightningElement {
    disableRadioButton = false;
    disableOrganisationName = true;
    disableReferralState = false;
    disableReferralName = false;
    isDisableSaveAndContinue = false;
    isReferred = false;
    isPending;
    referralname = '';
    @track conRecordId='';
    @track contactRecord;
    @track recordTypeId;
    @track isLoading=false;
    referralNameFieldVal ='';
    radioClassFieldVal ='';
    referalOptions;
    wiredAcademicDetails={};
    applicationId;
    externalApplicationStatus;

    @track stateOptions = [];
    @track organizationOptions = [];
    @track selectedState;
    @track selectedStateId;
    @track selectedOrganization;
    progressBarValue;
    isMyReferralDetailsCompleted;
    progressBar;

    referalNameLabel = REFERAL_LABEL;
    refferalHeadingLabel = REFERAL_DETAILS_HEADING_LABEL;
    refferalYesShareLabel = REFERAL_YES_SHARE_LABEL;
    partnerState = PARTNER_STATE;
    nameOfThePartner = NAME_OF_THE_PARTNER;
    refferalNameLabel = REFFERAL_NAME_LABEL;
    requiredFieldError = COMPLETE_THIS_FIELD_LABEL;
    selectanoptionlabel=SELECT_AN_OPTION_LABEL;
    enterinenglishlabel=ENTER_IN_ENGLISH_LABEL;
    
    
    @wire(getRecord, { recordId: USER_ID, fields: CONTACT_ID_FIELD })
    wiredUser({ error, data }) {
        if (data) {
            this.conRecordId = getFieldValue(data, CONTACT_ID_FIELD); 
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
 
   @wire(getRecord, { recordId: '$conRecordId', fields: CONTACT_FIELDS })
    wiredContactRecord({ error, data }) {
        if (data) {
            this.isLoading=true;
            this.contactRecord = data;
            this.recordTypeId = data.recordTypeId;

            this.radioClassFieldVal = data.fields.Referred_By_APF_Or_Partners__c.value;
            this.isReferred = this.radioClassFieldVal === 'Yes';
            this.updateRadioGroupClass();

            this.selectedState = data?.fields?.Referral_Partner_State__c?.value ;
            if (this.selectedState !== undefined && this.selectedState !== null && this.selectedState !== '') {
            const stateOption = this.stateOptions.find(option => option.value === this.selectedState);
            this.selectedStateId = stateOption ? stateOption.Id : '';
            if (this.selectedStateId) {
                this.loadOrganizationPicklistValues(this.selectedStateId);
            }
            }

            this.selectedOrganization = data?.fields?.Referral_Partner_Name__c?.value;
            this.referralNameFieldVal = data?.fields?.Referral_Full_Name__c?.value;
            this.isMyReferralDetailsCompleted = data?.fields?.Is_My_Referral_Details_Completed__c?.value;
            this.progressBarValue = data?.fields?.Application_Forms_Progress_Percent__c?.value;
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
            this.isLoading=false;
        }
    }
      
    @wire(getPicklistValues, { recordTypeId:'$recordTypeId', fieldApiName: REFERAL_OPTIONS })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.referalOptions = data.values;
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
    @wire(CurrentPageReference)
    currentPageReference;
    connectedCallback(){
       this.applicationId= this.currentPageReference?.attributes?.recordId || null;
       if (!this.applicationId) {
        this.showToast('Error', 'Application ID not provided.', 'error');
    }
    }
 
    @wire(getRecord, { recordId: '$applicationId', fields: [EXTERNAL_APPLICATION_STATUS] })
    wiredApplicationId(result) {
        const { error, data } = result;
        if (data) {
            this.externalApplicationStatus = data?.fields?.Application_External_Status__c?.value;
            this.updateFieldAccessibility();
            } else if (error) {
                this.showToast('Error',error.body.message, 'error');
            }
        }

        updateFieldAccessibility() {
            this.isPending = this.externalApplicationStatus === 'Draft';
            this.disableRadioButton = !this.isPending;
            this.disableOrganisationName = !this.isPending;
            this.disableReferralState = !this.isPending;
            this.disableReferralName = !this.isPending;
            this.isDisableSaveAndContinue = !this.isPending;
        }

    @wire(getStatePicklistValues)
    wiredStatePicklistValues({ error, data }) {
        if (data) {
            this.stateOptions = Object.keys(data).map(key => ({
                Id:key,
                label: data[key],
                value: data[key]
            }));
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }

    handleStateChange(event) {      
        const selectedValue = event.detail.value;
        const selectedOption = this.stateOptions.find(option => option.value === selectedValue);        
        this.selectedState = selectedValue;
        this.selectedStateId = selectedOption.Id;
        this.selectedOrganization = ''; 
        this.disableOrganisationName = !this.selectedState;
        this.validateOthers(); 
       
      this.loadOrganizationPicklistValues(this.selectedStateId);
    }
    loadOrganizationPicklistValues(StateId) {
        getOrganizationPicklistValues({ stateId: StateId })
            .then(result => {
                this.organizationOptions = Object.keys(result).map(key => ({
                    Id:key,
                    label: result[key],
                    value: result[key]
                }));
                this.isLoading=false;
            })
            .catch(error => {
                this.isLoading=false;
            this.showToast('Error',error.body.message?error.body.message:'Error fetching organization picklist values', 'error');
            });
    }
    handleOrganizationChange(event) {
        this.selectedOrganization = event.detail.value;
        this.validateOthers(); 
    }

    handlebeforchangeReferralName(event){
        const pattern = /^[a-zA-Z\s]*$/; 
        let inputChar = event.data || '';
        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }
    handleReferralName(event){
        this.referralNameFieldVal = event.target.value.replace(/\s+/g,' ').trim();
    }
    
    handleRadio(event) {
        this.radioClassFieldVal = event.target.value;
        this.isReferred = this.radioClassFieldVal === 'Yes';
        this.disableOrganisationName = !this.selectedState;
        this.removeCustomClass();

        if(this.radioClassFieldVal ==='No'){
            this.selectedOrganization='';
            this.selectedState='';
            this.referralNameFieldVal=''; 
            this.disableOrganisationName = !this.selectedState;
            this.template.querySelector('lightning-radio-group').classList.add('radio-group-no');
        }
        this.validate(); 
    }
    removeCustomClass() {
        const radioGroup = this.template.querySelector('lightning-radio-group');
        if (radioGroup) {
            radioGroup.classList.remove('radio-group-no');
        }
    }
    updateRadioGroupClass() {
        const radioGroup = this.template.querySelector('lightning-radio-group');
        if (radioGroup) {
            if (this.radioClassFieldVal === 'No') {
                radioGroup.classList.add('radio-group-no');
                this.isLoading=false;
            } else {
                radioGroup.classList.remove('radio-group-no');
                this.isLoading=false;
            }
        }
        
    }
    validate() {
    const radioGroup = this.template.querySelector('.radioClass');
    const selectedValue = this.radioClassFieldVal;

    if (!selectedValue) {
        radioGroup.setCustomValidity(PLEASE_SELECT_AN_OPTION_LABEL);
    } else {
        radioGroup.setCustomValidity('');
    }
    radioGroup.reportValidity();
    }
    validateOthers(){
    const stateCombobox = this.template.querySelector('.state');
    const selectedStateValue = this.selectedState;
    if (!selectedStateValue) {
        stateCombobox.setCustomValidity(COMPLETE_THIS_FIELD_LABEL);   
    } else {
        stateCombobox.setCustomValidity('');
    }
    stateCombobox.reportValidity();
    const organizationCombobox = this.template.querySelector('.organization');
    const selectedOrgValue = this.selectedOrganization;
    if (!selectedOrgValue) {
        organizationCombobox.setCustomValidity(COMPLETE_THIS_FIELD_LABEL);
    } else {
        organizationCombobox.setCustomValidity('');
    }
    organizationCombobox.reportValidity();
    }
    handleSaveAndContinue() {
        this.validate();
        if (!this.template.querySelector('.radioClass').checkValidity()) {
            return;
        }
        if(this.isMyReferralDetailsCompleted === false){
            if (this.progressBarValue === null || this.progressBarValue === undefined) {
                this.progressBar = parseInt(25); 
            } else {
                this.progressBar = this.progressBarValue + parseInt(25); 
            }
        }else{
            this.progressBar = this.progressBarValue;
        }
        if (this.radioClassFieldVal === 'Yes') {
            this.validateOthers(); 
            const stateFieldValid = this.template.querySelector('.state').checkValidity();
            const organizationFieldValid = this.template.querySelector('.organization').checkValidity();
            if (stateFieldValid && !organizationFieldValid) {
                return;
            }
        }
        if (this.radioClassFieldVal === 'Yes') {
            if (this.selectedState && this.selectedOrganization) {
                this.updateContact();
                this.showToast(sucessLabel,REFERRAL_DETIALS_SAVED_LABEL, 'success');
                this.handleFormCompletionStatus();
                this.scrollToTop();
                return refreshApex(this.wiredAcademicDetails);
            }
            } else {
            this.updateContact();
            this.showToast(sucessLabel,REFERRAL_DETIALS_SAVED_LABEL, 'success');
            this.handleFormCompletionStatus();
            this.scrollToTop();
            return refreshApex(this.wiredAcademicDetails);
        }
    }
    async updateContact() {
        const field = {
            [CONTACT_ID.fieldApiName]: this.conRecordId,
            [REFERRED_BY_APF_OR_PARTNERS.fieldApiName]: this.radioClassFieldVal,
            [IS_MY_REFFERAL_DETAILS_COMPLETED.fieldApiName]: true,
            [REFERRAL_PARTNER_NAME.fieldApiName]:this.selectedOrganization !== undefined && this.selectedOrganization !== null ? this.selectedOrganization : '',
            [REFERRAL_PARTNER_STATE.fieldApiName]:this.selectedState !== undefined && this.selectedState !== null ? this.selectedState : '',
            [REFERRAL_FULL_NAME.fieldApiName]: this.referralNameFieldVal !== undefined && this.referralNameFieldVal !== null ? this.referralNameFieldVal : '',
            [FORM_PROGRESS_UPDATE.fieldApiName]:parseInt(this.progressBar)
        };
        const recordInput = { fields: field };    
        try {
            await updateRecord(recordInput).then((res) => {
                this.showToast(sucessLabel,REFERRAL_DETIALS_SAVED_LABEL,'success');
              return refreshApex(this.contactRecord);
            }) 
            .catch((error) => {
                this.showToast('Error', 'An error occurred while updating the record. Please try again.', 'error');
            });
        } catch (error) {
            this.showToast('Error', 'An error occurred while updating the record. Please try again.', 'error');    
        }
    }
    handleFormCompletionStatus() {
    const isCompleted = true;

    const event = new CustomEvent('formcompleted', {
        detail: { formName: 'referralDetails', isCompleted , selcetedItem:'academicDetails',isProvisional:'' }
    });
    this.dispatchEvent(event);
    }
    scrollToTop() {
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    
       
        const scrollableContainer = this.template.querySelector('.scrollable-container');
        if (scrollableContainer) {
            
            scrollableContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
     
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}