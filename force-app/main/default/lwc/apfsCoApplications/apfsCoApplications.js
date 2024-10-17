/**
 * @description       : Component to display the user's scholarship applications and allow actions such as viewing, downloading, and checking offers.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 10-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 */
import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

import hasAppliedForScholarship from '@salesforce/apex/APFS_ApplicationController.hasAppliedForScholarship';
import createApplication from '@salesforce/apex/APFS_ApplicationController.createApplication';
import hasActiveOffer from '@salesforce/apex/APFS_ApplicationController.hasActiveOffer';
import USER_ID from '@salesforce/user/Id';
import USER_LANGUAGE_FIELD from '@salesforce/schema/User.LanguageLocaleKey';

import APPLICATION_DASHBOARD_LABEL from '@salesforce/label/c.Application_Dashboard_Label';
import APPLICATION_NUMBER_LABEL from '@salesforce/label/c.Application_Number_Label';
import CURRENT_STATUS_LABEL from '@salesforce/label/c.Current_Status_Label';
import ACTION_REQUIRED_BY_APPLICANT_LABEL from '@salesforce/label/c.Action_required_by_applicant_Label';
import DOWNLOAD_LABEL from '@salesforce/label/c.Download_Label';

export default class ApfsCoApplications extends NavigationMixin(LightningElement) {
    // Public properties
    @api scholarshipRoundId;

    // Reactive variables to track UI state
    @track isLoading = false;
    @track applications = [];
    @track hasAppliedForScholarship = false;
    @track selectedLanguage = '';
    isCreateApplicationButtonDisabled=false;

    // Label assignments
    applicationDashboardLabel = APPLICATION_DASHBOARD_LABEL;
    applicationNumberLabel = APPLICATION_NUMBER_LABEL;
    currentStatusLabel = CURRENT_STATUS_LABEL;
    actionRequiredByApplicantLabel = ACTION_REQUIRED_BY_APPLICANT_LABEL;
    downloadLabel = DOWNLOAD_LABEL;

    /**
     * @description Fetches whether the user has applied for a specific scholarship round and if there are any active offers for the applications.
     * @param {Object} result - The response from the Apex method.
     */
    @wire(hasAppliedForScholarship, { userId: USER_ID, scholarshipRoundId: '$scholarshipRoundId' })
    wiredApplication({ error, data }) {
        if (data) {
            this.hasAppliedForScholarship = true;
            this.applications = Array.isArray(data) ? data : [data];
            
        // Check external status and fetch offer details for each application
        this.applications = this.applications.map(app => {
            // Set external status flag
            const isNotInDraft = app.Application_External_Status__c !== 'Draft';
            
            // Fetch offer details for each application and add a placeholder flag (will update later)
            this.getOfferDetails(app.Id);
            
            return { ...app, isNotInDraft }; // Update the app with the new `isNotInDraft` flag
        });
             
        } else if (error) {
            this.resetApplicationState();
            this.showToast('Error', error.body?.message ||'Something went wrong while fetching application details.', 'error');
        }
    }



 /**
 * @description       : Fetches the offer details for each application and updates the application array.
 * @param {String} applicationId - The ID of the application for which to check the active offer.
 */
getOfferDetails(applicationId) {
    hasActiveOffer({ applicationId })
        .then(result => {
           
            this.applications = this.applications.map(app => {
              
                if (app.Id === applicationId) {
                    return { ...app, hasActiveOffer: result };
                }
                return app;
            });
        })
        .catch(error => {
            this.showToast('Error', error.body?.message || 'Something went wrong while fetching offer details.', 'error');
        });
}
    /**
     * @description Fetches the user's selected language for displaying offer letters in the correct language.
     * @param {Object} result - The result from lightning/uiRecordApi to fetch the user language.
     */
    @wire(getRecord, { recordId: USER_ID, fields: [USER_LANGUAGE_FIELD] })
    wiredlanguageUser({ error, data }) {
        if (data) {
            this.selectedLanguage = data.fields.LanguageLocaleKey.value || 'en_US';
        } else if (error) {
        
            this.showToast('Error', error.body?.message ||'Something went wrong while fetching user language.', 'error');

        }
    }

    /**
     * @description Handles the creation of a new scholarship application if the user has not already applied.
     */
    handleCreateScholarshipApplication() {
        this.isLoading = true;
        createApplication({ userId: USER_ID, scholarshipRoundId: this.scholarshipRoundId })
            .then(result => {
                this.isCreateApplicationButtonDisabled=true;
                this.applications = Array.isArray(result) ? result : [result];
                this.navigateToApplicationDetail(this.applications[0].Id);
                
            })
            .catch(error => {
                this.isLoading = false;
                this.isCreateApplicationButtonDisabled=false;
             
                this.showToast('Error', error.body?.message ||'Something went wrong while creating application.', 'error');
            });
    }

    /**
     * @description Handles the navigation to the application detail page.
     * @param {Event} event - The click event from the application link.
     */
    handleApplicationClick(event) {
        const applicationId = event.target.dataset.id;
        this.navigateToApplicationDetail(applicationId);
    }

    /**
     * @description Navigates the user to the application detail page.
     * @param {String} applicationId - The ID of the application to navigate to.
     */
    navigateToApplicationDetail(applicationId) {
       
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: applicationId,
                objectApiName: 'Application__c',
                actionName: 'view'
            }
        }).then(url => {
            window.location.href = url;
            this.isLoading = false;
        });
    }

    /**
     * @description Downloads the application in PDF format.
     * @param {Event} event - The click event from the download link.
     */
    handleApplicationDownload(event) {
        const applicationId = event.target.dataset.id;
        if (!applicationId) {
            this.showToast('Error', 'Application details  missing. Cannot download the application.', 'error');
            return;
        }
        const vfPageUrl = `/apex/APFS_ApplicationPreview?Id=${applicationId}`;
        window.open(vfPageUrl, '_blank');
    }

    /**
     * @description Downloads the offer letter based on the user's language.
     * @param {Event} event - The click event from the download offer button.
     */
    handleOfferDownload(event) {
        const applicationId = event.target.dataset.id;

        if (!applicationId) {
            this.showToast('Error', 'Application details  missing. Cannot download the offer letter.', 'error');
            return;
        }

        const vfPageUrl = this.selectedLanguage === 'hi'
            ? `/apex/Scholarship_Offer_Letter_Hindi?Id=${applicationId}`
            : `/apex/Scholarship_Offer_Letter?Id=${applicationId}`;

        window.open(vfPageUrl, '_blank');
    }

    /**
     * @description Shows a toast notification for errors or informational messages.
     * @param {String} title - The title of the toast message.
     * @param {String} message - The body message of the toast.
     * @param {String} variant - The variant of the toast (e.g., 'success', 'error', 'info').
     */
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }


    /**
     * @description Resets the application state when no data is found.
     */
    resetApplicationState() {
        this.hasAppliedForScholarship = false;
        this.applications = undefined;
    }
}