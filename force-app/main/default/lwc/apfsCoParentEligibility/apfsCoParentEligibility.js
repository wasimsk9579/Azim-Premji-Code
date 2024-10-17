/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 07-24-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement ,track} from 'lwc';

export default class ApfsCoParentEligibility extends LightningElement {


    @track showModal = false;
    @track eligibilityStatus = false;

    connectedCallback(){
            this.openModal();     
    }
    openModal() {
        this.showModal = true;
    }

    handleModalClose(event) {
        this.showModal = false;
        this.eligibilityStatus = event.detail.eligibilityStatus;
        console.log('PArent Eligibility Status:', this.eligibilityStatus);
    }


}