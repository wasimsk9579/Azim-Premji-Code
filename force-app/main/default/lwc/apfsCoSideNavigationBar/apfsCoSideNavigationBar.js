import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord, getFieldValue,updateRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import APPLICATION_PROGRESS_PERCENT from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c';
import {refreshApex} from '@salesforce/apex';

import SCHOLARSHIP_ROUND_ID_FIELD from '@salesforce/schema/Application__c.Scholarship_Round__c';
import SCHOLARSHIP_ROUND_TYPE_FIELD from '@salesforce/schema/Scholarship_Round__c.Round_Type__c';

import REFERAL_DETAILS_HEADING_LABEL from '@salesforce/label/c.Refferal_details_heading';
import EDUCATION_HEADING from '@salesforce/label/c.Education_Heading';
import SOCIO_HEADING_LABEL from '@salesforce/label/c.Socio_Economic_details_Label';
import ADMISSION_DETAILS from '@salesforce/label/c.ADMISSION_DETAILS';
import APPLICATION_SUBMIT_LABEL from '@salesforce/label/c.Application_Submit_Label';


const CONTACT_FIELDS = [APPLICATION_PROGRESS_PERCENT];

export default class ApfsCoSideNavigationBar extends LightningElement {
    @track progressPercentage = 0;

    contactRecord;
    userContactId;
    progresBarPercent;
    displayValue;

    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 

        } else if (error) {
            this.error = error;
        }
    }

    //  Academic details from contact object

    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredContactRecord({ error, data }) {
        if (data) {
            this.contactRecord = data;
            this.progressPercentage = getFieldValue(data, APPLICATION_PROGRESS_PERCENT); 
            this.displayValue = `${this.progressPercentage}% Complete`;
            this.progressPercent = this.progressPercentage;

    
        } else if (error) {
            this.error = error;
            console.error('Error fetching Contact record:', error);
        }
    }
    recordTypeId
    scholarshipRoundType
    applicationId
    scholarshipRoundId

    @wire(CurrentPageReference)
    currentPageReference;
    connectedCallback(){
       this.applicationId= this.currentPageReference?.attributes?.recordId || null;
       if (!this.applicationId) {
        this.showToast('Error', 'Application ID not provided.', 'error');
    }
    }


    @wire(getRecord, { recordId: '$applicationId', fields: ['Application__c.Scholarship_Round__c'] })
    wiredApplicationId(result) {
        const { error, data } = result;
        if (data) {

            this.scholarshipRoundId = getFieldValue(data, SCHOLARSHIP_ROUND_ID_FIELD) ?? null;

        } else if (error) {
            this.showToast('Error',error.body.message, 'error');

        }
    }

    @wire(getRecord, { recordId: '$scholarshipRoundId', fields: [SCHOLARSHIP_ROUND_TYPE_FIELD] })
    scholarshipRoundRecord({ error, data }) {
            
                if (data) {
                    this.scholarshipRoundType = getFieldValue(data, SCHOLARSHIP_ROUND_TYPE_FIELD) ?? null;

                if(this.scholarshipRoundType === 'Provisional'){
                    this.isProvisional = true;
                }else{
                    this.isProvisional = false;

                }    
                    
                } else if (error) {
                    this.showToast('Error', 'Failed to load scholarship round data.', 'error');
                }
            
    }
    isProvisional = false;


    @wire(CurrentPageReference)
    currentPageReference;

    @track completedForms = {
        referralDetails: false,
        academicDetails: false,
        socioEconomicDetails: false,
        admissionDetails: false,
        applicationSubmit:false
    };

    selectedItem = 'referralDetails';

    get applicationId() {
        return this.currentPageReference?.attributes?.recordId;
    }

    get isReferralDetails() {
        return this.selectedItem === 'referralDetails';
    }

    get isAcademicDetails() {
        return this.selectedItem === 'academicDetails';
    }

    get isSocioEconomicDetails() {
        return this.selectedItem === 'socioEconomicDetails';
    }

    get isAdmissionDetails() {
        return this.selectedItem === 'admissionDetails';
    }

    get isApplicationSubmit() {
        return this.selectedItem === 'applicationSubmit';
    }

    get navbarItemAttributeProvisional() {
        return [
            { 
                name: 'referralDetails', 
                iconName: this.getIconName('referralDetails'), 
                label: REFERAL_DETAILS_HEADING_LABEL, 
                Id: this.applicationId ? this.applicationId : '1'
            },
            { 
                name: 'academicDetails', 
                iconName: this.getIconName('academicDetails'), 
                label: EDUCATION_HEADING, 
                Id: this.applicationId ? this.applicationId : '2'
            },
            { 
                name: 'socioEconomicDetails', 
                iconName: this.getIconName('socioEconomicDetails'), 
                label: SOCIO_HEADING_LABEL, 
                Id: this.applicationId ? this.applicationId : '3'
            },
            { 
                name: 'applicationSubmit', 
                iconName: this.getIconName('applicationSubmit'), 
                label: APPLICATION_SUBMIT_LABEL, 
                Id: this.applicationId ? this.applicationId : '4'
            }
        ];

    }

    get navbarItemAttributeRegular() {
        return [
            { 
                name: 'referralDetails', 
                iconName: this.getIconName('referralDetails'), 
                label: REFERAL_DETAILS_HEADING_LABEL, 
                Id: this.applicationId ? this.applicationId : '1'
            },
            { 
                name: 'academicDetails', 
                iconName: this.getIconName('academicDetails'), 
                label: EDUCATION_HEADING, 
                Id: this.applicationId ? this.applicationId : '2'
            },
            { 
                name: 'socioEconomicDetails', 
                iconName: this.getIconName('socioEconomicDetails'), 
                label: SOCIO_HEADING_LABEL, 
                Id: this.applicationId ? this.applicationId : '3'
            },
            { 
                name: 'admissionDetails', 
                iconName: this.getIconName('admissionDetails'), 
                label: ADMISSION_DETAILS, 
                Id: this.applicationId ? this.applicationId : '5'
            },
            { 
                name: 'applicationSubmit', 
                iconName: this.getIconName('applicationSubmit'), 
                label: APPLICATION_SUBMIT_LABEL, 
                Id: this.applicationId ? this.applicationId : '4'
            }
        ];

    }


    handleNavigationSelect(event) {
        this.selectedItem = event.detail.name;
    }
    isSocioClicked= false;
    handleFormCompleted(event) {
        const { formName, isCompleted, selcetedItem , isProvisional} = event.detail;
       
        this.completedForms[formName] = isCompleted;
        this.selectedItem = selcetedItem;
        refreshApex(this.progressPercent);

    }

    getIconName(itemName) {
        if (this.selectedItem === itemName) {
            return 'action:defer';
        } else if (this.completedForms[itemName]) {
            return 'action:approval';
        } else {
            return 'action:new_task';
        }
    }
}