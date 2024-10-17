import { LightningElement, api, track } from 'lwc';
import getApplicationDetails from '@salesforce/apex/APFS_OfferApplications.getOfferApplicationAdmissionDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApfsOfferVerificationApplicationRelatedInfo extends LightningElement {
   
    @track applicantDetails;

    _applicationId;

    @api
    set applicationId(value) {
        this._applicationId = value;
        this.fetchApplicationDetails(); 
    }

    get applicationId() {
        return this._applicationId;
    }

    fetchApplicationDetails() {
        if (this.applicationId) {
            console.log(`Fetching details for Application ID: ${this.applicationId}`);
            getApplicationDetails({ applicationId: this.applicationId, offerId: this.offerId })
                .then(result => {
                    this.applicantDetails = result;
                    this.showToast('Success', 'Application details fetched successfully!', 'success');
                })
                .catch(error => {
                    this.applicantDetails = null;
                    console.error('Error fetching application details:', error);
                    this.showToast('Error', 'Failed to fetch application details.', 'error');
                });
        }
    }

    get applicantName() {
        return this.applicantDetails?.Contact__r?.Name || 'N/A';
    }

    get classTwelveYearOfPassing() {
        return this.applicantDetails?.Contact__r?.Class_Twelve_Year_Of_Passing__c || 'N/A';
    }

    get classTwelveExamCentreState() {
        return this.applicantDetails?.Contact__r?.Class_Twelve_Exam_Centre_State__c || 'N/A';
    }

    get classTwelveExamCentreDistrict() {
        return this.applicantDetails?.Contact__r?.Class_Twelve_Exam_Centre_District__c || 'N/A';
    }

    get classTenYearOfPassing() {
        return this.applicantDetails?.Contact__r?.Class_Ten_Year_Of_Passing__c || 'N/A';
    }

    get classTenExamCentreState() {
        return this.applicantDetails?.Contact__r?.Class_Ten_Exam_Centre_State__c || 'N/A';
    }

    get classTenExamCentreDistrict() {
        return this.applicantDetails?.Contact__r?.Class_Ten_Exam_Centre_District__c || 'N/A';
    }


    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}