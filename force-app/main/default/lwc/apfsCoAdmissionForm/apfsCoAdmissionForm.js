/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from "lightning/navigation";
import { CurrentPageReference } from 'lightning/navigation';
import { createRecord,getRecord, getFieldValue,updateRecord } from 'lightning/uiRecordApi';

import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
//fething contact data
import APPLICATION_PROGRESS_PERCENT from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c';
import IS_EDUCATION_DETAILS_COMPLETED from '@salesforce/schema/Contact.Is_Education_Details_Completed__c';
import IS_SOCIO_ECOMNOMICS_DETAILS_COMPLETED from '@salesforce/schema/Contact.Is_Socio_Economic_Details_Completed__c';
import IS_REFFERRED_BY_APF_OR_PARTNER from '@salesforce/schema/Contact.Referred_By_APF_Or_Partners__c';
import CLASS_TWELVE_YEAR_OF_PASSING from '@salesforce/schema/Contact.Class_Twelve_Year_Of_Passing__c';

//fetching admission data
import INSTITUTE_STATE from '@salesforce/schema/Admission__c.Institute_State__c';
import INSTITUTE_DISTRICT from '@salesforce/schema/Admission__c.Institute_District__c';
import COURSE_DURATION from '@salesforce/schema/Admission__c.Course_Duration_In_Years__c';
import COURSE_TYPES from '@salesforce/schema/Admission__c.Course_Type__c';
import COURSE_CATEGORY from '@salesforce/schema/Admission__c.Course_Category__c';
import COURSE_OTHER_CATEGORY from '@salesforce/schema/Admission__c.Other_Course_Category__c';
import COURSE_SYSTEM from '@salesforce/schema/Admission__c.Course_System__c';
import COURSE_YEAR from '@salesforce/schema/Admission__c.Course_Year_Of_Studying__c';
import ADMISSION from '@salesforce/schema/Admission__c';
import ADMISSION_ID_FIELD from '@salesforce/schema/Admission__c.Id';
import NAME_INSTITUE from '@salesforce/schema/Admission__c.Name_Of_The_Institute__c';
import OTHERS_NAME_INSTITUE from '@salesforce/schema/Admission__c.Other_Name_Of_Institute__c';
import COURSE__NAME from '@salesforce/schema/Admission__c.Course_Name__c';
import OTHER_COURSE_NAME_FIELD from '@salesforce/schema/Admission__c.Other_Course_Name__c';
import COURSE_STARTDATE from '@salesforce/schema/Admission__c.Course_Start_Date__c';
import COURSE_TYPE_FIELD from '@salesforce/schema/Admission__c.Course_Type__c';
import COURSE_DURATION_FIELD from '@salesforce/schema/Admission__c.Course_Duration_In_Years__c';
import COURSE_YEAR_OF_STUDYING_FIELD from '@salesforce/schema/Admission__c.Course_Year_Of_Studying__c';
import COLLEGE_STUDENT_ID_FIELD from '@salesforce/schema/Admission__c.College_Student_Id__c';

import APPLICATION_FIELD from '@salesforce/schema/Admission__c.Application__c';

//fetching application data
import EXTERNAL_APPLICATION_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';
//fetching data from apex
import uploadFileToServer from '@salesforce/apex/APFS_FilesAndAttachmentUtilityController.uploadFileToServer';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getStatePicklistValues';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getDistrictPicklistValues';
import getInstitutesBySearch from '@salesforce/apex/APFS_StateDistrictUtilityController.getInstitutesBySearch';
import deleteFileToServer from '@salesforce/apex/APFS_GetFileDynamicController.deleteFileToServer';
import getFilesForTypeOne from '@salesforce/apex/APFS_GetFileDynamicController.getFilesForTypes';
import getFilesForTypeTwo from '@salesforce/apex/APFS_GetFileDynamicController.getFilesForTypes';

//Custom Labels To be added
import STATE_LABEL from '@salesforce/label/c.State_Label';
import DISTRICT_LABEL from '@salesforce/label/c.District_Label';
import ADMISSION_DETAILS from '@salesforce/label/c.ADMISSION_DETAILS';
import NAME_OF_INSTITUTE from '@salesforce/label/c.Name_of_Institute';
import Admission_Name_of_Institute_Helptext from '@salesforce/label/c.Admission_Name_of_Institute_Helptext';
import PLEASE_MENTION_INSTITUTE_DETAILS from '@salesforce/label/c.Please_Mention_Institute_Details';
import COURSE_NAME from '@salesforce/label/c.Course_Name';
import YEAR_OF_ADMISSION from '@salesforce/label/c.Year_of_Admission';
import COURSE_TYPE from '@salesforce/label/c.Course_Type';
import COURSE_CATEGORY_LABEL from '@salesforce/label/c.Course_Category';
import OTHER_COURSE_CATEGORY_LABEL from '@salesforce/label/c.Please_mention_course_category_details';
import COURSE_SYSTEM_LABEL from '@salesforce/label/c.Course_System';
import Admission_Success_Toast_Message from '@salesforce/label/c.Admission_Success_Toast_Message';
import Form_error_custom_label from '@salesforce/label/c.Form_error_custom_label';
import Complete_this_field_Label from '@salesforce/label/c.Complete_this_field_Label';
import course_start_date_custom_label from '@salesforce/label/c.course_start_date_custom_label';
import Error_Label from '@salesforce/label/c.Error_Label';
import Course_Invalid_date_custom_label from '@salesforce/label/c.Course_Invalid_date_custom_label';
import Max_3_file_error_custom_label from '@salesforce/label/c.Max_3_file_error_custom_label';
import course_name_helptext_custom_label from '@salesforce/label/c.course_name_helptext_custom_label';
import SELECT_AN_OPTION_LABEL from '@salesforce/label/c.Select_an_Option_label';
import ENTER_IN_ENGLISH_LABEL from '@salesforce/label/c.Please_enter_the_text_in_English_helptext';
import Search_for_an_Institute_custom_label from '@salesforce/label/c.Search_for_an_Institute_custom_label';
import Enter_Institute_Name_custom_label from '@salesforce/label/c.Enter_Institute_Name_custom_label';
import Enter_Course_Category_custom_label from '@salesforce/label/c.Enter_Course_Category_custom_label';
import Enter_Course_Name_custom_label from '@salesforce/label/c.Enter_Course_Name_custom_label';
import Enter_College_Student_Id_custom_label from '@salesforce/label/c.Enter_College_Student_Id_custom_label';
import college_student_Id_error from '@salesforce/label/c.college_student_Id_error';
import Invalid_course_start_date_label from '@salesforce/label/c.Invalid_course_start_date_label';
import year_Of_Studying_Error_label from '@salesforce/label/c.year_Of_Studying_Error_label';
import COURSE_DURATION_IN_MONTHS from '@salesforce/label/c.Course_Duration_in_months';
import COURSE_START_DATE from '@salesforce/label/c.Course_Start_Date';
import WHICH_YEAR_OF_COURSE_YOU_ARE_STUDYING_NOW from '@salesforce/label/c.Which_Year_Of_Course_You_Are_Studying_Now';
import DAY_SCHOLAR_STAYING_IN_HOSTEL from '@salesforce/label/c.Day_Scholar_Staying_In_Hostel';
import PLEASE_MENTION_RESIDENCE_DETAILS from '@salesforce/label/c.Please_Mention_Residence_Details';
import Invalid_institute_data_custom_label from '@salesforce/label/c.Invalid_institute_data_custom_label';
import UPLOAD_PROOF_OF_ADMISSION from '@salesforce/label/c.Upload_Proof_of_Admission';
import Admission_File_Upload_Helptext from '@salesforce/label/c.Admission_File_Upload_Helptext';
import File_Size_Error_CustomLabel from '@salesforce/label/c.File_Size_Error_CustomLabel';
import Invalid_file_type_error_custom_label from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import UPLOAD_FEES_RECEIPT from '@salesforce/label/c.Upload_Fees_Receipt';
import COLLEGE_STUDENT_ID from '@salesforce/label/c.College_Student_ID';
import Success_Label from '@salesforce/label/c.Success_Label';
import Uploaded_File_Label from '@salesforce/label/c.Uploaded_File_Label';
import course_duration_error_label from '@salesforce/label/c.course_duration_error_label';



const ADMISSION_FIELDS = [INSTITUTE_STATE,INSTITUTE_DISTRICT,NAME_INSTITUE,OTHERS_NAME_INSTITUE,COURSE_DURATION,COURSE_DURATION_FIELD,COURSE_TYPES,COURSE_SYSTEM,COURSE_OTHER_CATEGORY,COURSE_CATEGORY,COURSE_YEAR,
    ADMISSION_ID_FIELD,COURSE__NAME, OTHER_COURSE_NAME_FIELD, 
    COURSE_TYPE_FIELD, COURSE_YEAR_OF_STUDYING_FIELD,
    COLLEGE_STUDENT_ID_FIELD,
    APPLICATION_FIELD,COURSE_STARTDATE
];

const CONTACT_FIELD=[IS_EDUCATION_DETAILS_COMPLETED,APPLICATION_PROGRESS_PERCENT,IS_SOCIO_ECOMNOMICS_DETAILS_COMPLETED,IS_REFFERRED_BY_APF_OR_PARTNER,CLASS_TWELVE_YEAR_OF_PASSING];

export default class ApfsCoAdmissionForm extends NavigationMixin(LightningElement)  {
    isadmissionidavaialble=true;

    @track selectedCollege = '';
    @track showCollegeDetails = false;
    @track collegeDetails = '';
    @track selectedCourse = '';
    @track yearOfAdmission = '';
    @track courseType = '';
    @track coursecategory='';
    @track coursesystem='';
    @track courseDuration = '';
    @track currentYear = '';
    @track residenceType = '';
    @track collegeStudentId = '';
    @track modifiedData = [];
    @track residenceType = '';
    @track residenceDetails = '';
    coursecaategoryDetails;
    @track showResidenceDetails = false;
    @track prooffileerror = false;
    @track feefileerror = false;
    @track minDate;
    @track maxDate;
    @track admissionFileName = '';
    @track admissionFileUrl = '';
    @track feeFileName = '';
    @track feeFileUrl = '';
    @track courseStartDate;
    @track yearOfAdmission;
    @track contId;
    @track admission;
    @track admissionId;
    @track fileType;
    @track fileDataList = [];
    @track courseDurationOptions;
    @track courseTypeOptions;
    coursecategoryOptions;
    coursesystemOptions;
    @track courseYearOptions;
    @track accommodationTypeOptions;
    @track recordTypeId;
    @track documentLinks = [];
    @track contentVersion;
    contentDataUrl;
    progressPercent;
    wiredAdmissionDetails = {};
    uploadfilename=[];
    externalApplicationStatus;
    isDisableAdmissionAllFields=false;
    isDisablecourseyearAllFields=false;
    displayedFileName = '';
    applicationId =null;
    files = []; 
    file;
    ishidebutton=true;
    allowedExtensions = ['pdf', 'jpeg', 'jpg', 'png'];
   
    allCollegeOptions = [];
    classtwelveyearofpassing;
    showCategoryDetails=false;
    selectedInstitute;
   handleLoadFiles;
   fetchError;
   fileList;
   fileNames;
   fileUrls;
   filedata;

   iseducationcompleted;
   issocioeconomiccompleted;
   isreffredbyapforpartner;
   filteredInstitutes=false;
   isDisableDistrict=true;
   isDisableInstituteName=true;
   isLoading=false;
   wireFileApex;

   docAdmissionprooftype=['College Admission Proof'];
   docFeetype=['College Fee Receipt'];
   @track stateOptions = [];
   @track districtOptions = [];
   @track selectedStateValue;
   @track selectedStateValueId;
   @track selectedDistrict;
   @track selectedDistrictId;

   @track filteredInstitutes = [];
   uploadfilename;

@track admissionFileUrls = [];
@track feeFileUrls = [];
admisionupdatefile=[]
feeupdatefile=[]
maxFiles =3;
instituteresult=[];
isLoading;
startcoursedate;

     // Store imported labels in variables
    stateLabel = STATE_LABEL;
    districtLabel = DISTRICT_LABEL;
     admissionDetails = ADMISSION_DETAILS;
     nameOfInstitute = NAME_OF_INSTITUTE;
     nameofinstitutehelptext = Admission_Name_of_Institute_Helptext;
    coursenamehelptext = course_name_helptext_custom_label;
     pleaseMentionInstituteDetails = PLEASE_MENTION_INSTITUTE_DETAILS;
     courseName = COURSE_NAME;
     yearOfAdmissions = YEAR_OF_ADMISSION;
     courseTypes = COURSE_TYPE;
     courseDurationInYear = COURSE_DURATION_IN_MONTHS;
     courseStartDates = COURSE_START_DATE;
     whichYearOfCourseYouAreStudyingNow = WHICH_YEAR_OF_COURSE_YOU_ARE_STUDYING_NOW;
     dayScholarStayingInHostel = DAY_SCHOLAR_STAYING_IN_HOSTEL;
     pleaseMentionResidenceDetails = PLEASE_MENTION_RESIDENCE_DETAILS;
     uploadProofOfAdmission = UPLOAD_PROOF_OF_ADMISSION;
     uploadFeesReceipt = UPLOAD_FEES_RECEIPT;
     admissionFileUploadHelptext=Admission_File_Upload_Helptext;
     collegeStudentIds = COLLEGE_STUDENT_ID;
     courseCategoryLabel=COURSE_CATEGORY_LABEL;
     otherCourseCategoryLabel=OTHER_COURSE_CATEGORY_LABEL;
     courseSystemLabel=COURSE_SYSTEM_LABEL;
     requiredfielderror=Complete_this_field_Label;
    coursestartdateinvalidinput=Course_Invalid_date_custom_label;
    selectanoptionlabel=SELECT_AN_OPTION_LABEL;
    searchinstituteplaceholder=Search_for_an_Institute_custom_label;
    enterinstitutenameplaceholder=Enter_Institute_Name_custom_label;
    entercoursecategoryplaceholder=Enter_Course_Category_custom_label;
    entercoursenameplaceholder=Enter_Course_Name_custom_label;
    entercollegeidplaceholder=Enter_College_Student_Id_custom_label;
    uploadfile=Uploaded_File_Label;
    enterinenglishlabel=ENTER_IN_ENGLISH_LABEL;
    invalidcoursestartdate=Invalid_course_start_date_label;

    isMonthSupported = false;
    courseStartDateinputType;
    courseStartDatePlaceholder;
    courseStartDateTextPattern;
    invalidcoursestartTextdate;
    browsername;
    

  // Wire to get the current page reference
    @wire(CurrentPageReference)
    currentPageReference;
    // Lifecycle hook to get application ID from URL
    connectedCallback(){

        this.isLoading=true;
       this.applicationId= this.currentPageReference?.attributes?.recordId || null;
   
      this.fetchadmissionprrofFiles();
      this.fetchFeeFiles();
       refreshApex(this.wireFileApex);
       this.filteredInstitutes=false;
      this.isDisableDistrict=true;
       this.isDisableInstituteName=true;
       this.scrollToTop();

   

       this.getBrowserInfo();

    }


    getBrowserInfo() {
        const userAgent = navigator.userAgent;
       
        let browserName = 'Unknown Browser';

        // Parse user agent to detect browser name
        if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
            browserName = 'Opera';
        } else if (userAgent.includes('Edg')) {
            browserName = 'Edge';
        } 
        else if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
            browserName = userAgent.includes('Mobile') ? 'Chrome Mobile' : 'Chrome';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = userAgent.includes('Mobile') ? 'Safari (iOS)' : 'Safari';
        } else if (userAgent.includes('Firefox')) {
            browserName = userAgent.includes('Mobile') ? 'Firefox Mobile' : 'Firefox';
        }
      
          // Set input type based on browser
        if (browserName === 'Firefox')
      
             {
            this.browsername=browserName;
            this.courseStartDateinputType = 'text'; // Firefox doesn't support 'month'
            this.courseStartDatePlaceholder = 'YYYY-MM';
            this.courseStartDateTextPattern = '\\d{4}-(0[1-9]|1[0-2])'; 
            this.invalidcoursestartTextdate=this.invalidcoursestartdate;
            
        } else {
            this.courseStartDateinputType = 'month'; // All other browsers
            this.courseStartDateTextPattern = ''; // No pattern for month input
            this.invalidcoursestartTextdate = ''; // No error message for pattern mismatch
            this.courseStartDatePlaceholder = '';
        }
    }


        // Wire to get the external application status
    @wire(getRecord, { recordId: '$applicationId', fields: [EXTERNAL_APPLICATION_STATUS] })
    wiredApplicationId(result) {
        const { error, data } = result;
        if (data) {
            this.externalApplicationStatus = data?.fields?.Application_External_Status__c;
       
            if(this.externalApplicationStatus.value === 'Draft'){
                this.isDisableAdmissionAllFields = false;
              
            }else{
                this.isDisableAdmissionAllFields = true;
                this.isDisableDistrict=true;
                this.isDisableInstituteName=true;
                this.isDisablecourseyearAllFields=true;

            }
        } else if (error) {
            this.showToast(Error_Label,error.body.message, 'error');
            
                    }        
    }


//Get contact Id
    @wire(getRecord, { recordId: USER_ID, fields: CONTACT_ID_FIELD })
    wiredUser({ error, data }) {
        if (data) {
            this.contId = getFieldValue(data, CONTACT_ID_FIELD);
        } 
    }


//get contact field data
    @wire(getRecord, { recordId: '$contId', fields: CONTACT_FIELD })
    wiredContact({ error, data }) {
        if (data) {

             this.classtwelveyearofpassing=getFieldValue(data,CLASS_TWELVE_YEAR_OF_PASSING)
            this.progressPercent = getFieldValue(data, APPLICATION_PROGRESS_PERCENT)
            this.iseducationcompleted = getFieldValue(data, IS_EDUCATION_DETAILS_COMPLETED)
            this.issocioeconomiccompleted =getFieldValue(data, IS_SOCIO_ECOMNOMICS_DETAILS_COMPLETED)
            this.isreffredbyapforpartner=getFieldValue(data,IS_REFFERRED_BY_APF_OR_PARTNER)
            
       
        // Check the value of isreffredbyapforpartner and set currentYear accordingly
        if (this.isreffredbyapforpartner === 'No') {
            this.currentYear = '1';
            this.isDisablecourseyearAllFields=true;
        }
      
        } 
    }



    // get admision object recordtype Id
    @wire(getObjectInfo, { objectApiName: ADMISSION })
    getAdmisiionDataRc({data,error}){
        if(data){
          this.recordTypeId =data.defaultRecordTypeId;
        }
     else if (error) {
           this.error = error;
    }
    }

//Get picklist value for course duration
    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_DURATION })
    wiredCourseDuration({ error, data }) {
        if (data) {
            this.courseDurationOptions = data.values;
        } 
    }

    //Get picklist value for course type
    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_TYPES })
    wiredCourseType({ error, data }) {
        if (data) {
            this.courseTypeOptions = data.values;
           

        } 
    }
    //Get picklist value for course category
    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_CATEGORY })
    wiredCourseCategory({ error, data }) {
        if (data) {
            this.coursecategoryOptions = data.values;
        } 
    }


        //Get picklist value for course system
        @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_SYSTEM })
        wiredCourseSystem({ error, data }) {
            if (data) {
                this.coursesystemOptions = data.values;
    
            } 
        }









    //Get picklist value for course year
    @wire(getPicklistValues, {recordTypeId: '$recordTypeId', fieldApiName: COURSE_YEAR })
    wiredCourseYear({ error, data }) {
        if (data) {
            this.courseYearOptions = data.values;
        } 
    }




    // get admission id by getRelatedListRecords method
    @wire(getRelatedListRecords, {
        parentRecordId: '$contId',
        relatedListId: 'Admissions__r',
        fields: ['Admission__c.Name', 'Admission__c.Id'],
        sortBy: ['Admission__c.Name']
    })
    wiredAdmissions({ error, data }) {
        this.wiredAdmissionDetails=data;
        if (data) {
            if (data.records.length > 0) {
                this.admissionId = data.records[0].fields.Id.value;
                
            } 
        } 
    }



    // Wire getRecord function to fetch the admission record
    @wire(getRecord, { recordId: '$admissionId', fields: ADMISSION_FIELDS })
    wiredRecord({ error, data }) {
        if (data) { 
            refreshApex(this.progressPercent);
            this.isadmissionidavaialble=false;
            this.admission = data;
            this.selectedStateValue = this.admission.fields.Institute_State__c.value;
            if (this.selectedStateValue !== undefined && this.selectedStateValue !== null && this.selectedStateValue !== '') {
                const stateOption = this.stateOptions.find(option => option.value === this.selectedStateValue);
                this.selectedStateId = stateOption ? stateOption.Id : '';
                if (this.selectedStateId) {
                    this.loadDistrictPicklistValues(this.selectedStateId);
                    
                }
            }
            this.selectedDistrict = this.admission.fields.Institute_District__c.value;
            this.selectedColleges  = getFieldValue(this.admission,NAME_INSTITUE);
            this.selectedCollege = getFieldValue(this.admission,NAME_INSTITUE);
            this.selectedInstitute = getFieldValue(this.admission,NAME_INSTITUE);
            if (this.selectedCollege === 'Others')
            {
                this.showCollegeDetails=true;
            }
            this.collegeDetails = this.admission.fields.Other_Name_Of_Institute__c.value;
            this.selectedCourse = this.admission.fields.Course_Name__c.value;
            this.courseType = this.admission.fields.Course_Type__c.value;
            this.coursecategory = this.admission.fields.Course_Category__c.value;
            if(this.coursecategory=='Others')
                {
                    this.showCategoryDetails=true;
                }
            this.coursecaategoryDetails = this.admission.fields.Other_Course_Category__c.value;
            this.coursesystem = this.admission.fields.Course_System__c.value;
            this.courseDuration = this.admission.fields.Course_Duration_In_Years__c.value;
            this.courseStartDate = this.admission?.fields?.Course_Start_Date__c?.value;
            this.startcoursedate = this.admission?.fields?.Course_Start_Date__c?.value;
            this.currentYear = this.admission.fields.Course_Year_Of_Studying__c.value;

            if(this.externalApplicationStatus.value === 'Draft')
                {
                    this.isDisableInstituteName=false;
                }
          
        } 
    }


    //get all institute account record data
    @wire(getStatePicklistValues)
    wiredStatePicklistValues({ error, data }) {
        if (data) {
            this.stateOptions = Object.keys(data).map(key => ({
                Id:key,
                label: data[key],
                value: data[key]
            }));
        } else if (error) {
this.showToast(Error_Label,error.body.message, 'error');
        }
    }

    handleStateChange(event) {   
       

        const selectedValue = event.detail.value;
        const selectedOption = this.stateOptions.find(option => option.value === selectedValue);        
      this.selectedStateValue = selectedValue;
        this.selectedStateValueId = selectedOption.Id;
       this.selectedDistrict = '';
       this.noResults=false;
        this.selectedCollege = '';
        this.filteredInstitutes = [];


        event.target.setCustomValidity('');
        event.target.reportValidity();
   // Clear any previous validation error on the college input field
   const collegeInput = this.template.querySelector('[data-id="college-input"]');
   if (collegeInput) {
                  
    collegeInput.required = false;
       collegeInput.setCustomValidity('');   // Clear any custom validity message
       collegeInput.reportValidity(); 
       collegeInput.required = true; 
       this.isDisableInstituteName=true;      // Update the validity state to reflect the change
   }

      
      this.loadDistrictPicklistValues(this.selectedStateValueId);
    }
    loadDistrictPicklistValues(StateId) {
        getDistrictPicklistValues({ stateId: StateId })
            .then(result => {
                this.districtOptions = Object.keys(result).map(key => ({
                    Id:key,
                    label: result[key],
                    value: result[key]
                }));
                if(this.externalApplicationStatus.value === 'Draft')
                {
                    this.isDisableDistrict=false;
                }
              
            })
            .catch(error => {
this.showToast(Error_Label,error.body.message?error.body.message:'Error fetching District picklist values', 'error');
            });

            this.collegeDetails='';
            this.showCollegeDetails=false;
    }

    handleDistrictChange(event) {
        const selectedDistrictValue = event.detail.value;
        const selectedDistrictOption = this.districtOptions.find(option => option.value === selectedDistrictValue);        
        this.selectedDistrict = selectedDistrictValue;
        this.selectedDistrictId = selectedDistrictOption.Id;
        // Reset institute selection when district changes
        this.selectedCollege = '';
        this.noResults=false;
           // Clear any previous validation error on the college input field
   // Clear any previous validation error on the college input field
   const collegeInput = this.template.querySelector('[data-id="college-input"]');
   if (collegeInput) {
                  
    collegeInput.required = false;
       collegeInput.setCustomValidity('');   // Clear any custom validity message
       collegeInput.reportValidity(); 
       collegeInput.required = true; 
       this.showCollegeDetails=false;
   }

        event.target.setCustomValidity('');
        event.target.reportValidity();
        this.selectedColleges='';
        this.filteredInstitutes = [];
        if(this.externalApplicationStatus.value === 'Draft')
            {
                this.isDisableInstituteName=false;
            }
       
        this.collegeDetails='';

        this.showCollegeDetails=false;
    }


    
    
    
   
   
    handleCollegeChange(event) {
       this.selectedInstitute=''
        this.selectedCollege = event.target.value.replace(/\s+/g, ' ').trim().toLowerCase(); 
        this.selectedColleges = event.target.value.replace(/\s+/g, ' ').trim().toLowerCase(); 
         this.collegeDetails='';
                if (this.selectedCollege.length > 2) {
                this.getInstitutesBySearch(this.selectedStateValue, this.selectedDistrict, this.selectedCollege)
                                .then(result => {
                                
                                    this.instituteresult=result;
                    
                if ((this.selectedCollege.length > 2) && (result && result.length > 0)) {
                        // Filter the institutes based on the search key
                        this.filteredInstitutes = result.filter(inst => 
                        inst.Institute_Name__c.toLowerCase().includes(this.selectedCollege)
                        
                        );
                        this.noResults=false;
                    } 
                        else if(this.selectedCollege.length > 2) 
                     {

                        // No results returned from Apex method
                        if (this.selectedCollege.includes('ot')) {
                     
                            // If the user types something similar to "Other", suggest "Others"
                            this.filteredInstitutes = [{ Id: 'Other', Institute_Name__c: 'Others' }];
                            this.noResults = false; // Show "Others" option
                           
                        } else {
                          
                            // No results found and input does not include "other"
                            this.filteredInstitutes = [{Institute_Name__c: 'Others' }];
                            this.noResults = true; // Show "No Results" message
                         
                        }
                      
                    }
                    else{
                        this.noResults=false;
                        this.filteredInstitutes=false;
                    }
                })
                .catch(error => {
                         this.error=error;
                  
                });
        } else {
            // When the input length is less than or equal to 3
            this.filteredInstitutes=false;
            this.noResults = false; // Reset noResults when clearing or entering less than 3 characters
            this.showCollegeDetails=false;
          
        }
        event.target.setCustomValidity('');
        event.target.reportValidity();
    }





    getInstitutesBySearch(state,district,searchKey) {
        return getInstitutesBySearch({state,district,searchKey})
            .then(result => {
                return result;
            })
            .catch(error => {
                throw error; // Rethrow the error if you want it to be handled elsewhere
            });
    }

 

   

selectInstitute(event) {
    const newValue = event.currentTarget.dataset.value;


    // Temporarily reset the selectedCollege to trigger the change event even if the same value is selected
    this.selectedCollege = '';
    
    // Use setTimeout to ensure the UI gets updated
    setTimeout(() => {
        this.selectedCollege = newValue;
        this.selectedInstitute=newValue;
        this.filteredInstitutes = false;
        this.noResults = false; 
        this.showCollegeDetails = (this.selectedCollege === 'Others');
    }, 0);
}


    

// Handle input changes to prevent emojis in the admission field
 
    handleadmissioninput(event) {
        let inputChar = event.data || '';
    
        // Regular expression to prevent emojis
        let emojiPattern = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    
        // Prevent default behavior if inputChar matches the emoji pattern
        if (emojiPattern.test(inputChar)) {
            event.preventDefault();
            return;
        }
    
        // Regular expression to allow alphabet, numbers, and specific special characters
        let allowedPattern = /^[a-zA-Z0-9\s.,'()\/#]*$/;
    
        let newValue = event.target.value + inputChar;
    
        // Prevent default behavior if newValue does not match the allowed pattern
        if (!allowedPattern.test(newValue)) {
            event.preventDefault();
        }
    }
    

    handlecoursecategoryinput(event)
    {
        let inputChar = event.data || '';

        // Regular expression to match emojis
        let emojiPattern = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
        
        // Regular expression to match any character that is not a letter or space
        let nonAlphabeticPattern = /[^a-zA-Z\s]/;
    
        // Prevent default behavior if inputChar matches the pattern (non-alphabetic, emoji, or special characters)
        if (emojiPattern.test(inputChar) || nonAlphabeticPattern.test(inputChar)) {
            event.preventDefault();
        }
    }


    
     // Handle changes in college details input
     handleCollegeDetailsChange(event) {
    
        this.collegeDetails =event.target.value.replace(/\s+/g,' ').trim();
        event.target.setCustomValidity('');
        event.target.reportValidity();
        
    }

    // handle before input of other course name
    handlecourseinput(event) {
        let inputChar = event.data || '';
    
        // Regular expression to prevent emojis
        let emojiPattern = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    
        // Prevent default behavior if inputChar matches the emoji pattern
        if (emojiPattern.test(inputChar)) {
            event.preventDefault();
            return;
        }
    
        // Regular expression to allow alphabet, numbers, and the specified special characters: .,'/&()- and spaces
        let allowedPattern = /^[a-zA-Z\s.,'&()/-]*$/;
    
        let newValue = event.target.value + inputChar;
    
        // Prevent default behavior if newValue does not match the allowed pattern
        if (!allowedPattern.test(newValue)) {
            event.preventDefault();
        }
    }
    

       // Handle changes in course dropdown
    handleCourseChange(event) {
        this.selectedCourse = event.target.value.replace(/\s+/g,' ').trim();
      
        event.target.setCustomValidity('');
        event.target.reportValidity();
    }


// Handle changes in the year of admission field
    handleYearOfAdmissionChange(event) {
        const currentYear = new Date().getFullYear().toString();
        const previousYear = (parseInt(currentYear) - 1).toString();
        this.yearOfAdmission = event.detail.value.replace(/\s+/g,' ').trim();
        
        // Clear previous validation messages
        event.target.setCustomValidity('');
    
        if (!this.yearOfAdmission || isNaN(this.yearOfAdmission)) {
            event.target.setCustomValidity(Complete_this_field_Label);
        } 
        else if (this.yearOfAdmission.length !== 4) {
            event.target.setCustomValidity('Year of Admission must be exactly 4 digits.');
        } 
        else {
            let isValidYear = true;
            for (let i = 0; i  < this.yearOfAdmission.length; i++) {
                if (this.yearOfAdmission[i] !== currentYear[i] && this.yearOfAdmission[i] !== previousYear[i]) {
                    isValidYear = false;
                    break;
                }
            }
            if (!isValidYear) {
                event.target.setCustomValidity('Year of Admission should be the current or previous year.');
            }
        }
    
        // Report validity to show any error messages
        event.target.reportValidity();
    }
    
    
    
      // Restricts input to numbers only for the admission year
 handladmisionyearinput(event) {
            const pattern = /^[0-9]*$/; // Allow only numbers
    
            let inputChar = event.data || '';
            if (!pattern.test(inputChar)) {
                event.preventDefault();
                }
        }

   // Prevent paste operation in year of admission
   preventPaste(event) {
    event.preventDefault();
}
        
  
 // Handle changes in course type dropdown
    handleCourseTypeChange(event) {
        this.courseType = event.detail.value;
        event.target.setCustomValidity('');
        event.target.reportValidity();
    }
 // Handle changes in course category dropdown
 handlecoursecategoryChange(event) {
        this.coursecategory = event.detail.value;
        this.coursecaategoryDetails='';
        this.showCategoryDetails = (this.coursecategory === 'Others');
        event.target.setCustomValidity('');
        event.target.reportValidity();
    }
 // Handle changes in course system dropdown
 handlecoursesystemChange(event) {
        this.coursesystem = event.detail.value;
        event.target.setCustomValidity('');
        event.target.reportValidity();
    }



    handlecoursecategoryDetailsChange(event) {
        this.coursecaategoryDetails = event.target.value.replace(/\s+/g,' ').trim();
        event.target.setCustomValidity('');
        event.target.reportValidity();
    }


      // Handle changes in course duration input
handleCourseDurationChange(event) {
    this.courseDuration = event.target.value;

    const currentcourseyear = this.template.querySelector('[data-id="course-year"]');
    if(!this.courseDuration || this.courseDuration=='' || this.courseDuration==null)
   {
        event.target.setCustomValidity(Complete_this_field_Label);
                 
   }
   else if(this.currentYear <= this.courseDuration)
   {
   if (currentcourseyear) {
    currentcourseyear.setCustomValidity(''); 
   currentcourseyear.reportValidity(); 
}
   }
   else if(this.currentYear > this.courseDuration)
    {
    if (currentcourseyear) {
        console.log('898');
     currentcourseyear.setCustomValidity(course_duration_error_label); 
     currentcourseyear.reportValidity(); 
 }
    }
  
        event.target.setCustomValidity('');
        event.target.reportValidity(); 
    
    }

    // Set the min and max dates for the course start date input
onclickcoursedate(event) {
        const currentYear = new Date().getFullYear();
        const tweleyear = this.classtwelveyearofpassing;
    
        // Set minimum and maximum date based on the provided values
        this.minDate = `${tweleyear}-01`;
        this.maxDate = `${currentYear}-12`;
    
        const selectedDate = event.target.value || this.courseStartDate;
    
        // 1. Check if courseStartDate is empty
        if (!this.courseStartDate || this.courseStartDate.trim() === '' || this.courseStartDate == null) {
            event.target.setCustomValidity(Complete_this_field_Label);
        }
        // 2. Check if 'classtwelveyearofpassing' is empty or null
        else if (tweleyear === '' || tweleyear === null) {
            event.target.setCustomValidity(course_start_date_custom_label);
        }
     
        else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(this.courseStartDate)) {
            // Check if the browser is Firefox
            if (this.browsername === 'Firefox') {
                event.target.setCustomValidity(Invalid_course_start_date_label);
            } 
        }
        // 4. Check if the selected date is within the minDate and maxDate range
        else if (selectedDate < this.minDate || selectedDate > this.maxDate) {
            event.target.setCustomValidity(Course_Invalid_date_custom_label);
        }
        // 5. If everything is valid, clear any existing error
        else {
            event.target.setCustomValidity(''); // Clear any error
        }
    
        // Force the field to show any error message
        event.target.reportValidity();
    }
    

  
    
    handleCourseStartDateChange(event) {
        // Get the selected course start date
        this.courseStartDate = event.target.value;
    
        // Clear any previous custom validity message
        event.target.setCustomValidity('');
    
        // Convert dates to Date objects for comparison
        const selectedDate = new Date(this.courseStartDate);
        const minDate = new Date(this.minDate);
        const maxDate = new Date(this.maxDate);
    
        const tweleyear = this.classtwelveyearofpassing;
    
        // 1. Check if courseStartDate is empty
        if (!this.courseStartDate || this.courseStartDate.trim() === '' || this.courseStartDate == null) {
            event.target.setCustomValidity(Complete_this_field_Label);
        }
        // 2. Check if 'classtwelveyearofpassing' (tweleyear) is empty or null
        else if (tweleyear === '' || tweleyear === null) {
            event.target.setCustomValidity(course_start_date_custom_label);
        }
     
        else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(this.courseStartDate)) {
            // Check if the browser is Firefox
            if (this.browsername === 'Firefox') {
                event.target.setCustomValidity(Invalid_course_start_date_label);
            } 
        }
        // 4. Check if the selected date falls outside the min and max date range
        else if (selectedDate < minDate || selectedDate > maxDate) {
            event.target.setCustomValidity(Course_Invalid_date_custom_label);
        }
        // 5. Clear the error message if all conditions are met
        else {
            event.target.setCustomValidity(''); // Clear any error
        }
    
        // Report the validity of the input field
        event.target.reportValidity();
    }
    
    handleCurrentYearChange(event) {
        this.currentYear = event.detail.value;
        const courseyear = this.isreffredbyapforpartner;
  
        if (courseyear === '' || courseyear === null) {
            event.target.setCustomValidity(year_Of_Studying_Error_label);
        } 
        // else if((this.courseDuration) && this.currentYear > this.courseDuration)

        else if (this.courseDuration && this.courseDuration.trim() !== '' && this.currentYear > this.courseDuration) 
        {
            console.log('this.courseDuration',this.courseDuration);
            event.target.setCustomValidity(course_duration_error_label);
        }
        else {
            event.target.setCustomValidity('');
        }
        event.target.reportValidity();
    }
    


fetchadmissionprrofFiles() {
 getFilesForTypeOne({documentTypes:this.docAdmissionprooftype,appId:this.applicationId  })
       .then(data => {
           this.wireFileApex = data;
          

           if (data) {
           
               // Reset file data arrays
               this.filedata = data;
               this.admissionFileUrls = [];
           
               this.uploadfilename = [];

               // Process each file
               data.forEach((file) => {
                  

                   let base64Prefix = this.getBase64Prefix(file.title);
                  
                   // Construct the full base64 data URL
                   const fileDataUrl = base64Prefix + file.base64Data;

                   // Create an object to store file details
                   const fileDetails = {
                       id: file.title, // Assuming file title serves as a unique identifier
                       filename: file.title,
                       fileType: file.docType,
                       base64: fileDataUrl
                   };

                       this.admissionFileUrls.push(fileDetails);
                       this.uploadfilename.push(file.title);
                       this.isLoading=false;
         
               });             

           } else if (error) {
            this.isLoading=false;
               this.fetchError = error.body.message;

        
           }
          
         
       })
       .catch(error => {
          
           this.fetchError = error.body.message;
        this.isLoading=false;
         
       });
     this.isLoading=false;
}


fetchFeeFiles() {
    getFilesForTypeTwo({ documentTypes:this.docFeetype,appId:this.applicationId  })
       .then(data => {
           this.wireFileApex = data;

           if (data.length>0) {
             
               // Reset file data arrays
               this.filedata = data;
               this.feeFileUrls = [];
           
               

               // Process each file
               data.forEach((file) => {
                  

                   let base64Prefix = this.getBase64Prefix(file.title);
                  
                   // Construct the full base64 data URL
                   const fileDataUrl = base64Prefix + file.base64Data;

                   // Create an object to store file details
                   const fileDetails = {
                       id: file.title, // Assuming file title serves as a unique identifier
                       filename: file.title,
                       fileType: file.docType,
                       base64: fileDataUrl
                   };

                       this.feeFileUrls.push(fileDetails);
                       this.isLoading=false;
                       
                   
               });             

           } else if (error) {
               
               this.fetchError = error.body.message;
                this.isLoading=false;
           } 
       })
       .catch(error => {
          
           this.fetchError = error.body.message;
          this.isLoading=false;
         
       });
    this.isLoading=false;
}
 
// Helper method to get the correct base64 prefix
getBase64Prefix(filename) {
    if (filename.endsWith('.pdf')) {
        return 'data:application/pdf;base64,';
    } else if (filename.endsWith('.png')) {
        return 'data:image/png;base64,';
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
        return 'data:image/jpeg;base64,';
    } else if (filename.endsWith('.img')) {
        return 'data:image/img;base64,';
    }
    return ''; // Return empty string if no match
}


handleadmissionFileUpload(event) {
    const filename = event.target.name;
    const inputFile = event.target;
    const files = Array.from(inputFile.files);
    const fileType = filename === 'college-addmission-proof-file-upload-input' ? 'College Admission Proof' : '';
    const existingFiles = fileType === 'College Admission Proof' ? this.admissionFileUrls : [];

    // Maximum number of files allowed
    const maxFiles = 3;

    // Check if the limit of files is reached
    if (existingFiles.length >= maxFiles) {
        this.dispatchEvent(new ShowToastEvent({
            title: Error_Label,
            message:Max_3_file_error_custom_label,
            variant: 'error'
        }));
        return;
    }

    const maxFilesToUpload = maxFiles - existingFiles.length;
    const filesToUpload = files.slice(0, maxFilesToUpload);

    // Determine the next available sequence number
    const getNextAvailableSequenceNumber = (files) => {
        const usedNumbers = new Set(files.map(file => {
            const match = file.filename.match(/_(\d+)\./); // Match the sequence number before the extension
            return match ? parseInt(match[1], 10) : null;
        }).filter(num => num !== null));

        let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }
        return nextNumber;
    };

    filesToUpload.forEach(file => {
        const extension = this.getFileExtension(file.name);
        const fileExtension = extension ? `.${extension}` : '';

        if (!this.isValidExtension(extension)) {
            this.setCustomValidity(inputFile, Invalid_file_type_error_custom_label);
            this.showToast(Error_Label, Invalid_file_type_error_custom_label, 'error');
            return;
        }

        if (this.isFileSizeExceeded(file.size)) {
            this.setCustomValidity(inputFile, File_Size_Error_CustomLabel);
            return;
        }

        this.clearCustomValidity(inputFile);

        const baseFilename = file.name.substring(0, file.name.lastIndexOf('.')); // Remove the extension
        const getNextSequenceNumber = getNextAvailableSequenceNumber(existingFiles);
        const newFilename = `${baseFilename}_${getNextSequenceNumber}${fileExtension}`;

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            const fileData = {
                id: Date.now() + getNextSequenceNumber, // Unique ID with sequence number
                filename: newFilename,
                base64: reader.result,
                fileType: fileType
            };

            // Update the file list
            if (fileType === 'College Admission Proof') {
                this.admissionFileUrls = [...this.admissionFileUrls, fileData];
                this.admisionupdatefile = [...(this.admisionupdatefile || []), fileData];
                this.uploadfilename = [...(this.uploadfilename || []), newFilename];
            }
        };

        reader.readAsDataURL(file);
    });

    // Clear the input value to allow re-uploading the same file if needed
    inputFile.value = '';
}



handlefeeFileUpload(event)
{
    
    const filename = event.target.name;
    const inputFile = event.target;
    const files = Array.from(inputFile.files);
    const fileType = filename === 'college-fees-receipt-file-upload-input' ? 'College Fee Receipt' : '';
    const existingFiles = fileType ==='College Fee Receipt' ? this.feeFileUrls : [];

    // Maximum number of files allowed
    const maxFiles = 3;

    // Check if the limit of files is reached
    if (existingFiles.length >= maxFiles) {
        this.dispatchEvent(new ShowToastEvent({
            title: Error_Label,
            message: Max_3_file_error_custom_label,
            variant: 'error'
        }));
        return;
    }

    const maxFilesToUpload = maxFiles - existingFiles.length;
    const filesToUpload = files.slice(0, maxFilesToUpload);

    // Determine the next available sequence number
    const getNextAvailableSequenceNumber = (files) => {
        const usedNumbers = new Set(files.map(file => {
            const match = file.filename.match(/_(\d+)\./); // Match the sequence number before the extension
            return match ? parseInt(match[1], 10) : null;
        }).filter(num => num !== null));

        let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }
        return nextNumber;
    };

    filesToUpload.forEach(file => {
        const extension = this.getFileExtension(file.name);
        const fileExtension = extension ? `.${extension}` : '';

        if (!this.isValidExtension(extension)) {
            this.setCustomValidity(inputFile, Invalid_file_type_error_custom_label);
            this.showToast(Error_Label, Invalid_file_type_error_custom_label, 'error');
            return;
        }

        if (this.isFileSizeExceeded(file.size)) {
            this.setCustomValidity(inputFile, File_Size_Error_CustomLabel);
            return;
        }

        this.clearCustomValidity(inputFile);

        const baseFilename = file.name.substring(0, file.name.lastIndexOf('.')); // Remove the extension
        const getNextSequenceNumber = getNextAvailableSequenceNumber(existingFiles);
        const newFilename = `${baseFilename}_${getNextSequenceNumber}${fileExtension}`;

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            const fileData = {
                id: Date.now() + getNextSequenceNumber, // Unique ID with sequence number
                filename: newFilename,
                base64: reader.result,
                fileType: fileType
            };

            // Update the file list
            if (fileType === 'College Fee Receipt') {
                this.feeFileUrls = [...this.feeFileUrls, fileData];
                this.feeupdatefile = [...(this.feeupdatefile || []), fileData];
            
            }
        };

        reader.readAsDataURL(file);
    });

    // Clear the input value to allow re-uploading the same file if needed
    inputFile.value = '';
}


getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
}

isValidExtension(extension) {
    const validExtensions = ['pdf', 'jpeg', 'jpg', 'png'];
    return validExtensions.includes(extension);
}

isFileSizeExceeded(fileSize) {
    // Size is in bytes; 1.5 MB = 1,500,000 bytes
    return fileSize > 1500000;
}

setCustomValidity(inputFile, message) {
    inputFile.setCustomValidity(message);
    inputFile.reportValidity();
}

clearCustomValidity(inputFile) {
    inputFile.setCustomValidity('');
    inputFile.reportValidity();
}


handleFilePreview(event) {
    const fileId = event.target.dataset.id;


    // Find the file in the appropriate array
    let file = this.admissionFileUrls.find(file => String(file.id) === String(fileId));
    let fileUrl = file ? file.base64 : '';

    if (!file) {
        file = this.feeFileUrls.find(file => String(file.id) === String(fileId));
        fileUrl = file ? file.base64 : '';
    }

    if (file && fileUrl) {
        const fileName = file.filename;
        const newWindow = window.open();
        if (fileUrl.startsWith('data:image/')) {
            newWindow.document.body.innerHTML = `<img src="${fileUrl}" style="width:100%; height:100%;">`;
        } else if (fileUrl.startsWith('data:application/pdf;base64,')) {
            const pdfData = atob(fileUrl.split('data:application/pdf;base64,')[1]);
            const arr = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {
                arr[i] = pdfData.charCodeAt(i);
            }
            const pdfBlob = new Blob([arr], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            newWindow.location.href = pdfUrl;
        } else {
            alert('Unsupported file format for preview.');
        }
    } else {
        alert('No file to preview or invalid file URL.');
    }
}

 //Removed file

handleFileRemove(event) {
     // Start the spinner
     this.isLoading = true;
    const fileType = event.target.name;
    const fileId = event.target.dataset.id;


    let fileToDelete;

    if (fileType === 'prooffile') {
        fileToDelete = this.admissionFileUrls.find(file => String(file.id) === String(fileId));
       
        this.admissionFileUrls = this.admissionFileUrls.filter(item => String(item.id) !== String(fileId));

        this.admisionupdatefile = this.admisionupdatefile.filter(item => String(item.id) !== String(fileId));

  

    } else if (fileType === 'feefile') {
        fileToDelete = this.feeFileUrls.find(file => String(file.id) === String(fileId));
     
        this.feeFileUrls = this.feeFileUrls.filter(item => String(item.id) !== String(fileId));
     
        this.feeupdatefile = this.feeupdatefile.filter(item => String(item.id) !== String(fileId));

    }

    if (fileToDelete) {
  
        this.handledeletefile(fileToDelete.id, fileToDelete.filename,fileToDelete.fileType,this.applicationId);
    } 
}


handleDragOver(event)
{
event.dataTransfer.dropEffect = 'none';
}


handledeletefile(fileId, filename, fileType, applicationId) {
    deleteFileToServer({ deletefilename: filename, fileType: fileType, applicationId: applicationId })
        .then(() => {
             // Stop the spinner after the file is deleted successfully
       
          

            if (fileType === 'College Admission Proof') {
                this.uploadfilename = this.uploadfilename.filter(file => file !== filename);
            
            }
               // Stop the spinner after the file is deleted successfully
               this.isLoading = false;
        })
        .catch((error) => {
             // Stop the spinner even if there's an error
           
            if (fileType === 'College Admission Proof') {
                this.uploadfilename = this.uploadfilename.filter(file => file !== filename);
               
            }
      
              // Stop the spinner even if there's an error
              this.isLoading = false;
        });
        
}



handleSave() {
    try {
        // Show the spinner when the save operation starts
        this.scrollToTop();
        if (this.validateForm()) {
            const courseStartDateString = this.courseStartDate ? this.courseStartDate : '';
            const fields = {
                'Institute_State__c': this.selectedStateValue,
                'Institute_District__c': this.selectedDistrict,
                'Name_Of_The_Institute__c': this.selectedCollege,
                'Other_Name_Of_Institute__c': this.collegeDetails,
                'Course_Name__c': this.selectedCourse,
                'Course_Type__c': this.courseType,
                'Course_Duration_In_Years__c': this.courseDuration,
                'Course_Start_Date__c': courseStartDateString,
                'Course_Year_Of_Studying__c': this.currentYear,
                'College_Student_Id__c': this.collegeStudentId,
                'Course_Category__c':this.coursecategory,
                'Other_Course_Category__c':this.coursecaategoryDetails,
                'Course_System__c': this.coursesystem,
                'Application__c': this.applicationId,
                'Contact__c': this.contId,
                'Is_Active__c': true
            };

            if (!this.admissionId) {
                this.isLoading = true;
                // Create new record
                const recordInput = { apiName: 'Admission__c', fields };

                createRecord(recordInput)
                    .then(admissionRecord => {
                        this.admissionId = admissionRecord.id;

                        let contactFields;
                        if (this.issocioeconomiccompleted) {
                            contactFields = {
                                Id: this.contId,
                                Application_Forms_Progress_Percent__c: this.progressPercent + 25
                            };
                        } else {
                            contactFields = {
                                Id: this.contId,
                                Application_Forms_Progress_Percent__c: this.progressPercent + 50,
                                Is_Socio_Economic_Details_Completed__c: true
                            };
                        }

                        const contactRecordInput = { fields: contactFields };

                        return updateRecord(contactRecordInput);
                    })
                    .then(() => {
                        this.showToast(Success_Label, Admission_Success_Toast_Message, 'success');
                       

                        const allFiles = [...this.admissionFileUrls, ...this.feeFileUrls];
                       

                        if (allFiles.length === 0) {
                            return Promise.resolve(); // No files to upload, so resolve immediately
                        }

                        const uploadPromises = allFiles.map(file => {
                            const base64Data = file.base64.split(',')[1];
                            return uploadFileToServer({
                                base64Data: base64Data,
                                fileName: file.filename,
                                documentType: file.fileType,
                                applicationId: this.applicationId
                            });
                        });

                        refreshApex(this.admission);
                        refreshApex(this.filedata);
                    
                        refreshApex(this.wireFileApex);
                        return Promise.all(uploadPromises);

                    })
                    .then(results => {
                        this.allFiles = [];
                        this.handleFormCompletionStatus();
                        this.scrollToTop();
                        refreshApex(this.wireFileApex);
                        this.isLoading = false;
                    })
                    .catch(error => {
                        this.handleFormCompletionStatus();
                        this.scrollToTop();
                        this.isLoading = false;
                    })
                    .finally(() => {
                        // Hide the spinner when the operation is complete
                        this.isLoading = false;
                        refreshApex(this.wireFileApex);
                    });

            } else {
                this.isLoading = true;
                const recordInput = {
                    fields: {
                        ...fields,
                        Id: this.admissionId
                    }
                };

                updateRecord(recordInput)
                    .then(() => {
                        this.showToast(Success_Label, Admission_Success_Toast_Message, 'success');

                        const allupdateFiles = [...this.admisionupdatefile, ...this.feeupdatefile];

                        if (allupdateFiles.length === 0) {
                            return Promise.resolve();
                        }

                        const uploadPromises = allupdateFiles.map(file => {
                            const base64Data = file.base64.split(',')[1];
                            return uploadFileToServer({
                                base64Data: base64Data,
                                fileName: file.filename,
                                documentType: file.fileType,
                                applicationId: this.applicationId
                            });
                        });
                        refreshApex(this.admission);
                        refreshApex(this.filedata);
                        
                        
                        refreshApex(this.wireFileApex);
                        return Promise.all(uploadPromises);
                    })
                    .then(results => {
                        this.handleFormCompletionStatus();
                        this.scrollToTop();
                        refreshApex(this.wireFileApex);

                     
                        this.admissionFileUrls=[];
                        this.feeFileUrl=[];
                        this.admisionupdatefile=[];
                        this.feeupdatefile=[];
                    })
                    .catch(error => {
                        this.handleFormCompletionStatus();
                        this.scrollToTop();
                        this.isLoading = false;
                        
                    })
                    .finally(() => {
                        // Hide the spinner when the operation is complete
                        this.isLoading = false;
                        refreshApex(this.wireFileApex);
                    });
            }
        } else {

this.showToast(Error_Label,Form_error_custom_label, 'error');
          
            this.isLoading = false; // Hide the spinner if validation fails
            refreshApex(this.wireFileApex);
        }
    } catch (error) {

this.showToast(Error_Label, Form_error_custom_label, 'error');
        this.isLoading = false; // Hide the spinner if an error occurs
    }
}

showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    });
    this.dispatchEvent(toastEvent);
}


validateForm() {
   
    const inputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
    let allValid = true;

   


    inputs.forEach( input => {
        // Skip validation for file inputs
        if (input.name === 'college-fees-receipt-file-upload-input') {
            return;
        }

   

        
        if (input.name === 'courseStartDate') {
    
            const currentYear = new Date().getFullYear();
            const tweleyear = this.classtwelveyearofpassing;
        
            this.minDate = `${tweleyear}-01`;
            this.maxDate = `${currentYear}-12`; 
          
            if (!this.courseStartDate || this.courseStartDate.trim() === '' || this.courseStartDate == null)
  
                {
                  
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                }

              else  if (tweleyear === '' || tweleyear === null) {
                    input.setCustomValidity(course_start_date_custom_label);
                    }// Check if there is a value entered

                    else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(this.courseStartDate)) {
                        // Check if the browser is Firefox
                        if (this.browsername === 'Firefox') {
                            input.setCustomValidity(Invalid_course_start_date_label);
                        } 
                    }
                    else if (this.courseStartDate < this.minDate || this.courseStartDate > this.maxDate) {
                  
                        input.setCustomValidity(Course_Invalid_date_custom_label); 
                } else {
                    input.setCustomValidity(''); // Clear any error if the date is valid
                }
            } else {
                input.setCustomValidity(''); // Clear any error if the input is empty
            }
        
 
        




      // Specific validation for college ID input
      if (input.name === 'clgid') {
        if (input.value.length > 0 && input.value.length < 4) {
            input.setCustomValidity(college_student_Id_error);
            allValid = false;
        } else {
            input.setCustomValidity('');
        }
    }
      

        // Specific validation for admission proof file upload input
if (input.name === 'college-addmission-proof-file-upload-input') {
   
    if (!Array.isArray(this.uploadfilename) || this.uploadfilename.length === 0) {
       
       input.setCustomValidity(Complete_this_field_Label);
        allValid = false;
    } else {
        input.setCustomValidity('');
    }
}





if (input.name === 'collegeDropdown') {
   
if (!this.selectedCollege || this.selectedCollege.trim() === '' || this.selectedCollege == null)
  
     {
       
         input.setCustomValidity(Complete_this_field_Label);
        allValid = false;
        this.filteredInstitutes = false;
        this.noResults = false;
    }

   else if (this.selectedCollege.length <=3)
        {
            this.filteredInstitutes = false;
            this.noResults = false;
           input.setCustomValidity(Invalid_institute_data_custom_label);
         
           allValid = false;
          
       }

else if (!this.admissionId&&(this.selectedCollege || this.selectedCollege.trim() !== '' || this.selectedCollege !== null) && this.instituteresult.length === 0 && this.selectedCollege !== 'Others') {
        input.setCustomValidity(Invalid_institute_data_custom_label);
        allValid = false;
        this.filteredInstitutes = false;
        this.noResults = false;
        this.showCollegeDetails = false;
        


} else if ((this.selectedColleges && (!this.selectedInstitute || this.selectedInstitute.trim() === '' || this.selectedInstitute == null))) {
    input.setCustomValidity(Invalid_institute_data_custom_label);
    allValid = false;
    this.filteredInstitutes = false;
    this.noResults = false;
} 
    
    
    else {
        input.setCustomValidity('');
    }
}



        // Specific validation for institute name input
        if (input.name === 'residence') {
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_this_field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }

        if (input.name === 'courseName') {
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_this_field_Label);
               
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }

        if (input.name === 'institutedetail') {
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_this_field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }
        if (input.name === 'currentYear') {
            const courseyear=this.isreffredbyapforpartner;
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_this_field_Label);
                allValid = false;
            }
           
          else if(this.isreffredbyapforpartner==='' || this.isreffredbyapforpartner===null)
            {
                input.setCustomValidity(year_Of_Studying_Error_label);
            }
            else if(this.currentYear > this.courseDuration)
                {
                    input.setCustomValidity(course_duration_error_label);
                }
            
            else {
                input.setCustomValidity('');
            }
        }
       
        // Check general validity of the input field
        if (!input.checkValidity()) {
            allValid = false;
        }

        input.reportValidity();
    });

    return allValid;
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

handleFormCompletionStatus() {
    const isCompleted = true;
    const event = new CustomEvent('formcompleted', {
        detail: { formName: 'admissionDetails', isCompleted, selcetedItem: 'applicationSubmit' }
    });
    this.dispatchEvent(event);
}

}