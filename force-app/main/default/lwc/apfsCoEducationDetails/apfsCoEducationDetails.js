import { LightningElement,track } from 'lwc';
import EDUCATION_HEADING from '@salesforce/label/c.Education_Heading';


import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';

export default class ApfsCoEducationDetails extends LightningElement {
    @track class12Section=true;
    @track class10Section=true;
    @track class8Section=true;

    educationHeading = EDUCATION_HEADING;

}