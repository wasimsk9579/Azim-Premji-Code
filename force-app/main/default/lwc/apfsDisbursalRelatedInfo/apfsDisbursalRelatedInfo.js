import { LightningElement, api, track } from 'lwc';
import getBankDetail from '@salesforce/apex/APFS_ContactDocumentsController.getBankDetail';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApfsDisbursalRelatedInfo extends LightningElement {
   
    @track contactDetails;

    _contactId;

    @api
    set contactId(value) {
        this._contactId = value;
        this.fetchApplicationDetails(); 
    }

    get contactId() {
        return this._contactId;
    }

    fetchApplicationDetails() {
        if (this.contactId) {
            getBankDetail({ contactId: this.contactId})
                .then(result => {
                    this.contactDetails = result;
                    this.showToast('Success', 'Application details fetched successfully!', 'success');
                })
                .catch(error => {
                    this.contactDetails = null;
                    console.error('Error fetching application details:', error);
                    this.showToast('Error', 'Failed to fetch application details.', 'error');
                });
        }
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