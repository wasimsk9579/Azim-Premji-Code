/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-23-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement,wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecordsBatch } from 'lightning/uiRelatedListApi';
import { NavigationMixin,CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import basePath from '@salesforce/community/basePath';
import UpdateApplicationStatus from '@salesforce/apex/APFS_ApplicationSubmitController.UpdateApplicationStatus';

import consentLabel from '@salesforce/label/c.Consent_Label';
import consentLabelValue01 from '@salesforce/label/c.Custom_Label_0_1';
import consentLabelValue02 from '@salesforce/label/c.Custom_Label_0_2';
import consentLabelValue03 from '@salesforce/label/c.Custom_Label_0_3';
import consentLabelValue1 from '@salesforce/label/c.Consent_Label_Value_1';
import consentLabelValue2 from '@salesforce/label/c.Consent_Label_Value_2';
import consentLabelValue3 from '@salesforce/label/c.Consent_Label_Value_3';
import applicationSubmitnHeading from '@salesforce/label/c.Application_Submit_Label';
import Application_submit_toast_message from '@salesforce/label/c.Application_submit_toast_message';
import Complete_this_field_Label from '@salesforce/label/c.Complete_this_field_Label';
import Success_Label from '@salesforce/label/c.Success_Label';
import Confirmation_for_Popup from '@salesforce/label/c.Confirmation_for_Popup';
import Application_Submit_Pop_Up_Message from '@salesforce/label/c.Application_Submit_Pop_Up_Message';

import APPLICATION_CONSENT_CHECKED_FIELD from '@salesforce/schema/Application__c.Is_Consent_Given__c';
import SCHOLARSHIP_ROUND_ID_FIELD from '@salesforce/schema/Application__c.Scholarship_Round__c';
import SCHOLARSHIP_ROUND_TYPE_FIELD from '@salesforce/schema/Scholarship_Round__c.Round_Type__c';
import APPLICATION_EXTERNAL_STATUS_FIELD from '@salesforce/schema/Application__c.Application_External_Status__c';


import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import IS_EDUCATION_COMPLETED_FIELD from '@salesforce/schema/Contact.Is_Education_Details_Completed__c';
import IS_REFERRAL_COMPLETED_FIELD from '@salesforce/schema/Contact.Is_My_Referral_Details_Completed__c';


export default class ApfsCoApplicationSubmit extends NavigationMixin(LightningElement) {

     // Initialize custom labels for display
    consentLabel = consentLabel;
    consentLabelValue01 = consentLabelValue01;
    consentLabelValue02=consentLabelValue02;
    consentLabelValue03=consentLabelValue03;
    consentLabelValue1=consentLabelValue1;
    consentLabelValue2=consentLabelValue2;
    consentLabelValue3=consentLabelValue3;
    applicationSubmitnHeading=applicationSubmitnHeading;
    requiredfielderror=Complete_this_field_Label;
    modalHeadertitle=Confirmation_for_Popup;
    modalBodyMessage=Application_Submit_Pop_Up_Message;

     
     isSubmitDisabled = true;
     isConsentDisabled = false;
     isConsentGiven = false;
     showModal = false;

    contactId='';
    scholarshipRoundId='';
    applicationId='';
    applicationExternalStatus='';
    scholarshipRoundType='';

    isEducationCompleted=false;
    isReferralCompleted=false;
    admissionRecordsLength = 0;

    @wire(CurrentPageReference)
    currentPageReference;
    connectedCallback(){
       this.applicationId= this.currentPageReference?.attributes?.recordId || null;
       if (!this.applicationId) {
        this.showToast('Error', 'Application ID not provided.', 'error');
    }
    }

    /**
     * @description       : Fetch the current user's contact record.
     * @param {Object} data - Contains the current user's record details.
     * @param {Object} error - Contains any error that occurs while fetching the user data.
     */
      
      @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID_FIELD] })
      currentUserRecord({ error, data }) {
          if (data) {
              this.contactId = getFieldValue(data, CONTACT_ID_FIELD) ?? null;
          } else if (error) {
              this.showToast('Error', 'Failed to load user data.', 'error');
          }
      }

    /**
     * @description       : Fetch education and referral details from the contact record.
     * @param {Object} data - Contact data including education and referral completion status.
     * @param {Object} error - Contains any error that occurs while fetching contact details.
     */

      @wire(getRecord, { recordId: '$contactId', fields: [IS_EDUCATION_COMPLETED_FIELD, IS_REFERRAL_COMPLETED_FIELD] })
      fetchContactDetailsWire({ error, data }) {
          if (data) {
              this.isEducationCompleted = getFieldValue(data, IS_EDUCATION_COMPLETED_FIELD) ?? false;
              this.isReferralCompleted = getFieldValue(data, IS_REFERRAL_COMPLETED_FIELD) ?? false;
          } else if (error) {
              this.showToast('Error', 'Failed to load contact details.', 'error');
          }
      }

      /**
     * @description       : Fetch application details including consent and external status.
     * @param {Object} data - Contains application details like consent status and external status.
     * @param {Object} error - Contains any error that occurs while fetching application data.
     */
    @wire(getRecord, { recordId: '$applicationId', fields: [APPLICATION_CONSENT_CHECKED_FIELD,SCHOLARSHIP_ROUND_ID_FIELD,APPLICATION_EXTERNAL_STATUS_FIELD] })
    applicationRecord({ error, data }) {
        if (data) {

            this.isConsentGiven = getFieldValue(data, APPLICATION_CONSENT_CHECKED_FIELD) ?? false;
            this.scholarshipRoundId = getFieldValue(data, SCHOLARSHIP_ROUND_ID_FIELD) ?? null;
            this.applicationExternalStatus = getFieldValue(data, APPLICATION_EXTERNAL_STATUS_FIELD) ?? '';

            
             this.isConsentDisabled = this.applicationExternalStatus !== 'Draft';
             this.isSubmitDisabled = !this.isConsentGiven || this.applicationExternalStatus !== 'Draft';
        } else if (error) {
            this.showToast('Error', 'Failed to load application data.', 'error');
        }
    }

    /**
     * @description       : Fetch scholarship round type from the related scholarship round record.
     * @param {Object} data - Contains scholarship round type.
     * @param {Object} error - Contains any error that occurs while fetching scholarship round data.
     */
    @wire(getRecord, { recordId: '$scholarshipRoundId', fields: [SCHOLARSHIP_ROUND_TYPE_FIELD] })
    scholarshipRoundRecord({ error, data }) {
            
                if (data) {
                    this.scholarshipRoundType = getFieldValue(data, SCHOLARSHIP_ROUND_TYPE_FIELD) ?? null;
                    
                } else if (error) {
                    this.showToast('Error', 'Failed to load scholarship round data.', 'error');
                }
            
    }

     /**
     * @description       : Fetch related admission records for the application.
     * @param {Object} data - Contains the list of admission records related to the application.
     * @param {Object} error - Contains any error that occurs while fetching admission records.
     */

    @wire(getRelatedListRecordsBatch, {
        parentRecordId: '$applicationId',
        relatedListParameters: [{
            relatedListId: 'Admissions__r',
            fields: ['Admission__c.Name']
        }]
    })
    admissionRecords({ error, data }) {
        if (data) {
            this.admissionRecordsLength = data.results[0].result.records.length;
            
        } else if (error) {
            this.showToast('Error', 'Failed to load admission data.', 'error');
        }
    }
    

    /**
     * @description       : Handles changes to the consent checkbox.
     *                      Enables the "Submit" button if the consent checkbox is checked and application status is 'Draft'.
     *                      Displays the modal with a confirmation message when the checkbox is checked.
     * @param {Event} event - The change event from the checkbox.
     */
    handleCheckboxChange(event) {
        this.isConsentGiven = event.target.checked;
        this.isSubmitDisabled = !this.isConsentGiven || this.applicationExternalStatus !== 'Draft';

          // Show the modal if the checkbox is checked
          if (this.isConsentGiven) {
            this.showModal = true;
        }
    }


    /**
     * @description       : Closes the modal dialog when the user clicks the "Close" button.
     */
    closeModal() {
        this.showModal = false;
    }

      /**
     * @description       : Handle preview button click to open the application preview in a new tab.
     */
    handlePreviewApplication() {
        if (this.applicationId) {
           const vfPageUrl = `/apex/APFS_ApplicationPreview?Id=${this.applicationId}`;
            window.open(vfPageUrl, '_blank');
        } else {
            this.showToast('Error', 'Application ID is missing. Cannot preview the form.', 'error');
        }
    }


     /**
     * @description       : Handle submit button click.
     *                      Perform validation based on scholarship round type and initiate application submission.
     */

    handleSubmitApplication() {
               
    if (this.scholarshipRoundType === 'Provisional') {
        // Check only Education and Referral details for Provisional round
        if (!this.isReferralCompleted) {
            this.showToast('Error', 'Referral details are required before submitting the application.', 'error');
            return;
        }
        if (!this.isEducationCompleted) {
            this.showToast('Error', 'Education details are required before submitting the application.', 'error');
            return;
        }
       
    } else if (this.scholarshipRoundType === 'Regular') {
        // Check Education, Referral, and Admission details for Regular round
        if (!this.isReferralCompleted) {
            this.showToast('Error', 'Referral details are required before submitting the application.', 'error');
            return;
        }
        if (!this.isEducationCompleted) {
            this.showToast('Error', 'Education details are required before submitting the application.', 'error');
            return;
        }
       
        if (this.admissionRecordsLength === 0) {
            this.showToast('Error', 'Admission details are required before submitting the application.', 'error');
            return;
        }
    }
        // If all validations pass, update the Application record
        this.updateApplicationRecord();
        
    }


    /**
     * @description       : Update the application status after validation and handle errors.
     */
    
    updateApplicationRecord() {
        this.submitApplication();
    }

     /**
     * @description       : Call Apex method to update the application status and show toast notifications.
     */
    submitApplication(){
        UpdateApplicationStatus({applicationId:this.applicationId})
            .then(() => {
                this.showToast(Success_Label, Application_submit_toast_message, 'success');
                this.redirectToHomePage();
            })
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to submit the application.', 'error');
            });
    }

    /**
     * @description       : Redirect user to the home page after successful application submission.
     */
    redirectToHomePage() {
        window.location.href = `${basePath}/`;
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