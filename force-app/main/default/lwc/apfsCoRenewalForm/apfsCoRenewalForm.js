import { LightningElement, track,wire } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import APPLICATION_NUMBER from '@salesforce/schema/Application__c.Name';
import ADMISSION from '@salesforce/schema/Admission__c';
import COURSE_DURATION from '@salesforce/schema/Admission__c.Course_Duration_In_Years__c';
import COURSE_TYPES from '@salesforce/schema/Admission__c.Course_Type__c';
import COURSE_CATEGORY from '@salesforce/schema/Admission__c.Course_Category__c';
import COURSE_YEAR from '@salesforce/schema/Admission__c.Course_Year_Of_Studying__c';
import COURSE_YEAR_OF_STUDYING_FIELD from '@salesforce/schema/Admission__c.Course_Year_Of_Studying__c';
import COURSE_OTHER_CATEGORY from '@salesforce/schema/Admission__c.Other_Course_Category__c';

//Label
import FIRST_NAME_LABEL from '@salesforce/label/c.First_Name_Label';
import LAST_NAME_LABEL from '@salesforce/label/c.Last_Name_Label';
import GENDER_LABEL from '@salesforce/label/c.Gender_Label';
import DATE_OF_BIRTH_LABEL from '@salesforce/label/c.Date_of_Birth_Label';
import MOBILE_NUMBER_LABEL from '@salesforce/label/c.Mobile_Number_Label';
import AADHAAR_NUMBER_LABEL from '@salesforce/label/c.Aadhaar_Number_Label';
import STATE_LABEL from '@salesforce/label/c.State_Label';
import DISTRICT_LABEL from '@salesforce/label/c.District_Label';
import ADDRESS_FOR_COMMUNICATION_LABEL from '@salesforce/label/c.Address_for_Communication_Label';
import PERSONAL_INFORMATION_HEADING from '@salesforce/label/c.Personal_Information_Heading';
import ADMISSION_DETAILS from '@salesforce/label/c.ADMISSION_DETAILS';
import NAME_OF_INSTITUTE from '@salesforce/label/c.Name_of_Institute';
import Admission_Name_of_Institute_Helptext from '@salesforce/label/c.Admission_Name_of_Institute_Helptext';
import PLEASE_MENTION_INSTITUTE_DETAILS from '@salesforce/label/c.Please_Mention_Institute_Details';
import course_name_helptext_custom_label from '@salesforce/label/c.course_name_helptext_custom_label';
import COURSE_NAME from '@salesforce/label/c.Course_Name';
import COURSE_TYPE from '@salesforce/label/c.Course_Type';
import COURSE_DURATION_IN_MONTHS from '@salesforce/label/c.Course_Duration_in_months';
import COURSE_START_DATE from '@salesforce/label/c.Course_Start_Date';
import WHICH_YEAR_OF_COURSE_YOU_ARE_STUDYING_NOW from '@salesforce/label/c.Which_Year_Of_Course_You_Are_Studying_Now';
import COURSE_CATEGORY_LABEL from '@salesforce/label/c.Course_Category';
import OTHER_COURSE_CATEGORY_LABEL from '@salesforce/label/c.Please_mention_course_category_details';
import Complete_this_field_Label from '@salesforce/label/c.Complete_this_field_Label';
import SELECT_AN_OPTION_LABEL from '@salesforce/label/c.Select_an_Option_label';


const APPLICATION_FIELD=[APPLICATION_NUMBER,];
const USER_FIELDS = [
    CONTACT_ID_FIELD,
    ];

const CONTACT_FIELDS =
    ['Contact.Id','Contact.FirstName',
        'Contact.LastName', 'Contact.GenderIdentity',
        'Contact.Aadhaar_Number__c','Contact.MobilePhone',
        'Contact.Birthdate','Contact.State__c',
        'Contact.District__c','Contact.Full_Address__c'];

export default class apfsCoRenewalForm extends LightningElement {
    @track recordTypeId;
    @track applicationrecordTypeId;
    @track userContactId;
    @track applicationId;
    @track applicationNumber;
    @track contactRecord;
    @track courseYearOptions;

    @track isQualified = false;
    @track isContinuingSameCollege = false;
    @track isnotContinuingSameCollege = false;
    @track isContinuingSameCourse=false;
    @track qualification;
    @track ContinuingCourse;
    @track continuingCollege;
    @track isnotContinuingSameCourse=false;

    YesorNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
    
    //custom labels
    firstNameLabel = FIRST_NAME_LABEL;
    lastNameLabel = LAST_NAME_LABEL;
    genderLabel = GENDER_LABEL;
    dateOfBirthLabel = DATE_OF_BIRTH_LABEL;
    mobileNumberLabel = MOBILE_NUMBER_LABEL;
    aadhaarNumberLabel = AADHAAR_NUMBER_LABEL;
    stateLabel = STATE_LABEL;
    districtLabel = DISTRICT_LABEL;
    addressForCommunicationLabel = ADDRESS_FOR_COMMUNICATION_LABEL;
    personalInformationHeading = PERSONAL_INFORMATION_HEADING;
    admissionDetails = ADMISSION_DETAILS;
    nameOfInstitute = NAME_OF_INSTITUTE;
    nameofinstitutehelptext = Admission_Name_of_Institute_Helptext;
   coursenamehelptext = course_name_helptext_custom_label;
    pleaseMentionInstituteDetails = PLEASE_MENTION_INSTITUTE_DETAILS;
    courseName = COURSE_NAME;
    courseTypes = COURSE_TYPE;
    courseDurationInYear = COURSE_DURATION_IN_MONTHS;
    courseStartDates = COURSE_START_DATE;
    whichYearOfCourseYouAreStudyingNow = WHICH_YEAR_OF_COURSE_YOU_ARE_STUDYING_NOW;
    courseCategoryLabel=COURSE_CATEGORY_LABEL;
    otherCourseCategoryLabel=OTHER_COURSE_CATEGORY_LABEL;
    selectanoptionlabel=SELECT_AN_OPTION_LABEL;
    requiredfielderror=Complete_this_field_Label;

    
    @wire(getRecord, { recordId: USER_ID, fields:USER_FIELDS})
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
             
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }
    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredContactRecord({ error, data }) {
        if (data) {
            this.contactRecord = data; 
            this.recordTypeId = data?.recordTypeId;
            console.log('Record Type ID-->',this.recordTypeId);
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }
    
    get firstName() {
        return getFieldValue(this.contactRecord, 'Contact.FirstName');
    }
    get lastName() {
        return getFieldValue(this.contactRecord, 'Contact.LastName');
    }

    get aadhaar(){
        return getFieldValue(this.contactRecord, 'Contact.Aadhaar_Number__c');
    
    }
    get gender() {
        return getFieldValue(this.contactRecord, 'Contact.GenderIdentity');
    }

    get PhoneNumber() {
        return getFieldValue(this.contactRecord, 'Contact.MobilePhone');
    }

    get birthDate() {
        return getFieldValue(this.contactRecord, 'Contact.Birthdate');
    }

    get state() {
        return getFieldValue(this.contactRecord, 'Contact.State__c');
        
    }

    get district() {
        return getFieldValue(this.contactRecord, 'Contact.District__c');
    }

    get fulladdress() {
        return getFieldValue(this.contactRecord, 'Contact.Full_Address__c');
 
 
   }
   @wire(getRelatedListRecords, {
    parentRecordId: '$userContactId',
    relatedListId: 'Applications__r', 
    fields: ['Application__c.Id']
    })
    wiredApplications({ error, data }) {
    if (data && data.records.length > 0) {
        this.applicationId = data.records[0].fields.Id.value;
    } else if (error) {
        this.showErrorToast(error.body.message);
    } 
    }

    @wire(getRecord, { recordId: '$applicationId', fields: APPLICATION_FIELD })
    wiredApplicationNumber({ error, data }) {
        if (data) {
            this.applicationNumber= getFieldValue(data, APPLICATION_NUMBER); 
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }

    @wire(getObjectInfo, { objectApiName: ADMISSION })
    getAdmissionRecordId({data,error}){
        if(data){
          this.applicationrecordTypeId =data.defaultRecordTypeId;
          console.log('applicationrecordTypeId',this.applicationrecordTypeId);
        }
     else if (error) {
           this.error = error;
    }
    }

    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_DURATION })
    wiredCourseDuration({ error, data }) {
        if (data) {
            this.courseDurationOptions = data.values;
        } else if (error) {
            this.error = error;
            console.error('Error fetching Course Duration picklist values:', error);
        }
    }

    //Get picklist value for course type
    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_TYPES })
    wiredCourseType({ error, data }) {
        if (data) {
            this.courseTypeOptions = data.values;
            console.log('courseTypeOptions',this.courseTypeOptions);

        } else if (error) {
            this.error = error;
            console.error('Error fetching Course Type picklist values:', error);
        }
    }
    //Get picklist value for course category
    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_CATEGORY })
    wiredCourseCategory({ error, data }) {
        if (data) {
            this.coursecategoryOptions = data.values;
            console.log('coursecategoryOptions',this.coursecategoryOptions);

        } else if (error) {
            this.error = error;
            console.error('Error fetching Course Type picklist values:', error);
        }
    }

    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_YEAR })
    wiredCourseYear({ error, data }) {
        if (data) {
            this.courseYearOptions = data.values;
        } else if (error) {
            this.error = error;
            console.error('Error fetching Course Year picklist values:', error);
        }
    }


    handlePreviousExamChange(event) {
        this.qualification = event.detail.value;
        if(this.qualification === 'Yes'){
            this.isQualified=true;
        }
        else{
            this.isQualified=false;
            this.isContinuingSameCollege=false;
            
        }
        this.continuingCollege='';
        this.ContinuingCourse='';
        this.isnotContinuingSameCollege = false;
        this.isContinuingSameCourse=false;
        this.isnotContinuingSameCourse=false;
    }
    handleContinuingCollegeChange(event) {
        this.continuingCollege = event.detail.value;
        if(this.continuingCollege === 'Yes')
            {
                this.isContinuingSameCollege=true;
            }
        else{
            this.isContinuingSameCollege=false;
        }
        if(this.continuingCollege === 'No')
            {
                this.isnotContinuingSameCollege=true;
            }
        else{
            this.isnotContinuingSameCollege=false;
        }

            this.continuingCollege='';
            this.ContinuingCourse='';
            this.isContinuingSameCourse=false;
            this.isnotContinuingSameCourse=false;
    }

    handleContinuingCourseChange(event) {
        this.ContinuingCourse=event.detail.value;
        if(this.ContinuingCourse === 'No')
        {
            this.isnotContinuingSameCourse=true;
        }
        else{
            this.isnotContinuingSameCourse=false;
        }
       
    }

    handleCourseChange(event) {
        this.selectedCourse = event.target.value.replace(/\s+/g,' ').trim();
        console.log('selectedCourse',this.selectedCourse);
    }
    handlecourseinput(event)
    {
        let inputChar = event.data || '';

        // Regular expressions to match emojis and numbers
        let emojiPattern = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
        let numberPattern = /\d/;
    
        // Prevent default behavior if inputChar matches either pattern
        if (emojiPattern.test(inputChar) || numberPattern.test(inputChar)) {
            event.preventDefault();
        }
    

    }

    handleDecelarationclick()
    {
   
            if (this.applicationId) {
                const vfPageUrl = `/apex/Azim_Premji_Scholarship_Declaration_Form?Id=${this.applicationId}`;
                 window.open(vfPageUrl, '_blank');
             } else {
                 this.showToast('Error', 'Application ID is missing. Cannot preview the form.', 'error');
             }
}
}