import { LightningElement,track,api,wire } from 'lwc';
import { getRecord, getFieldValue,updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import { getPicklistValues } from 'lightning/uiObjectInfoApi'
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
import getFilesForRecord from '@salesforce/apex/APFS_GetRecords.getFilesForRecord';

// Custom Apex class / Standard objects import 

import uploadEducationFiles from '@salesforce/apex/APFS_MultipleFileUploadUtilityController.uploadEducationFiles';
//import deleteDocument from '@salesforce/apex/APFS_MultipleFileUploadUtilityController.deleteDocument';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.fetchSpecificStates';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getDistrictPicklistValues';
import getBlockPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getBlockPicklistValues';
import getSchoolBySearch from '@salesforce/apex/APFS_StateDistrictUtilityController.getSchoolBySearch';
import getSchoolsOrBoard from '@salesforce/apex/APFS_StateDistrictUtilityController.getSchoolsOrBoard';


import deleteFileToServer from '@salesforce/apex/APFS_GetRecords.deleteFileToServer';
 
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import MODE_OF_EDUCATION_OPTIONS from '@salesforce/schema/Contact.Class_Eight_Education_Mode__c';
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import APPLICATION_PROGRESS_PERCENT from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c';
import IS_AADHAAAR from '@salesforce/schema/Contact.Is_Aadhaar_Available__c' ;
import EXTERNAL_APPLICATION_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';


import CLASS_TWELVE_BOARD_NAME from '@salesforce/schema/Contact.Class_Twelve_Board_Name__c' ;
import CLASS_TWELVE_EDUCATION_MODE from '@salesforce/schema/Contact.Class_Twelve_Education_Mode__c' ;
import CLASS_TWELVE_EXAM_CENTRE_DISTRICT from '@salesforce/schema/Contact.Class_Twelve_Exam_Centre_District__c' ;
import CLASS_TWELVE_EXAM_CENTRE_PINCODE from '@salesforce/schema/Contact.Class_Twelve_Exam_Centre_Pincode__c' ;
import CLASS_TWELVE_EXAM_CENTRE_STATE from '@salesforce/schema/Contact.Class_Twelve_Exam_Centre_State__c' ;
import CLASS_TWELVE_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Twelve_Name_Of_School__c' ;
import CLASS_TWELVE_OTHER_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Twelve_Other_Name_Of_School__c' ;
import CLASS_TWELVE_PASS_PERCENTAGE from '@salesforce/schema/Contact.Class_Twelve_Pass_Percentage__c' ;
import CLASS_TWELVE_YEAR_OF_PASSING from '@salesforce/schema/Contact.Class_Twelve_Year_Of_Passing__c' ;
import CLASS_TWELVE_EXAM_BLOCK from '@salesforce/schema/Contact.Class_Twelve_Exam_Center_Block__c';
import CLASS_TWELVE_OTHER_BOARD_NAME from '@salesforce/schema/Contact.Class_Twelve_Other_Board_Name__c' ;
import BIRTH_DATE from '@salesforce/schema/Contact.Birthdate' ;
import EDU_COMPLETED from '@salesforce/schema/Contact.Is_Education_Details_Completed__c' ;
import EDU_PROGRESS_STATUS from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c' ;

//custom labels for multi language
import EDUCATION_HEADING from '@salesforce/label/c.Education_Heading';
import YEAR_OF_PASSING_LABEL from '@salesforce/label/c.Year_of_Passing_Label';
import MODE_OF_EDUCATION_LABEL from '@salesforce/label/c.Mode_of_Education_Label';
import SELECT_STATE_OF_THE_EXAM_CENTER_LABEL from '@salesforce/label/c.Select_State_of_the_Exam_Center_Label';
import SELECT_DISTRICT_OF_THE_EXAM_CENTER_LABEL from '@salesforce/label/c.Select_District_of_the_Exam_Center_Label';
import SELECT_BLOCK_OF_THE_EXAM_CENTER_LABEL from '@salesforce/label/c.Select_Block_of_the_Exam_Center_label';
import PINCODE_LABEL from '@salesforce/label/c.Pincode_label';
import NAME_OF_THE_SCHOOL_LABEL from '@salesforce/label/c.Name_of_the_School_label';
import IS_OTHERS_PLEASE_ENTER_NAME_OF_THE_SCHOOL from '@salesforce/label/c.Is_other_s_Please_enter_name_of_the_school';
import BOARD_NAME_LABEL from '@salesforce/label/c.Board_Name_Label';
import IS_OTHERS_PLEASE_ENTER_BOARD_NAME from '@salesforce/label/c.Is_other_s_Please_enter_board_name';
import PERCENTAGE_LABEL from '@salesforce/label/c.Percentage_Label';

import CLASS_12_DETAILS_LABEL from '@salesforce/label/c.Class_12_details_Label';
import SCHOLARSHIP_TYPE_LABEL from '@salesforce/label/c.Scholarship_Type_Label';
import ATTACH_CLASS_12_MARKSHEET_LABEL from '@salesforce/label/c.Attach_Class_12_Marksheet_Label';

import Complete_This_Field_Label from '@salesforce/label/c.Complete_this_field_Label';
import Future_Year_Error_Label from '@salesforce/label/c.Future_Year_Error_Label';
import Less_Than_4_Digits_Error_Label from '@salesforce/label/c.Less_Than_4_Digits_Error_Label';

import Education_Success_Label from '@salesforce/label/c.Education_Success_Label';
import Success_Label from '@salesforce/label/c.Success_Label';
import Pin_code_should_be_exactly_6_digits_label from '@salesforce/label/c.Pin_code_should_be_exactly_6_digits_label';
import File_Size_Error_CustomLabel from '@salesforce/label/c.File_Size_Error_CustomLabel';
import More_Than_3_Files_Error_Label from '@salesforce/label/c.More_Than_3_Files_Error_Label';	
import Error_Label from '@salesforce/label/c.Error_Label';




import Less_Than_33_Error_Label from '@salesforce/label/c.Less_Than_33_Error_Label';
import Year_Help_Text_Errror_Label from '@salesforce/label/c.Year_Help_Text_Errror_Label';
import Percentage_Help_Text_Label from '@salesforce/label/c.Percentage_Help_Text_Label';
import Upload_Files_Label from '@salesforce/label/c.Upload_Files_Label';
import Uploaded_File_Label from '@salesforce/label/c.Uploaded_File_Label';
import File_Help_Test_Label from '@salesforce/label/c.File_Help_Test_Label';

// fields to fetch from Contact records
const CONTACT_FIELDS = [
    IS_AADHAAAR,
    EDU_COMPLETED,
    EDU_PROGRESS_STATUS,
    CLASS_TWELVE_YEAR_OF_PASSING,
    CLASS_TWELVE_OTHER_BOARD_NAME,
    CLASS_TWELVE_EDUCATION_MODE,
    CLASS_TWELVE_BOARD_NAME,
    CLASS_TWELVE_SCHOOL_NAME,
    CLASS_TWELVE_OTHER_SCHOOL_NAME,
    CLASS_TWELVE_EXAM_CENTRE_STATE,
    CLASS_TWELVE_EXAM_CENTRE_DISTRICT,
    CLASS_TWELVE_EXAM_CENTRE_PINCODE,
    CLASS_TWELVE_PASS_PERCENTAGE,
    APPLICATION_PROGRESS_PERCENT,
    CLASS_TWELVE_EXAM_BLOCK,
    BIRTH_DATE,
    
];

export default class ApfsCoEducationClass12 extends LightningElement {
     // Store imported labels in variables
     requiredFieldError = Complete_This_Field_Label;
     yearHelpText=Year_Help_Text_Errror_Label;
     Percentage_Help_Text_Label = Percentage_Help_Text_Label;
     Upload_Files_Label=Upload_Files_Label;
     Uploaded_File_Label=Uploaded_File_Label;
     File_Help_Test_Label=File_Help_Test_Label;
     More_Than_3_Files_Error_Label=More_Than_3_Files_Error_Label;
     Error_Label=Error_Label;

     educationHeading = EDUCATION_HEADING;
     class8Details = CLASS_8_DETAILS;
     yearOfPassingLabel = YEAR_OF_PASSING_LABEL;
     modeOfEducationLabel = MODE_OF_EDUCATION_LABEL;
     selectStateOfExamCenterLabel = SELECT_STATE_OF_THE_EXAM_CENTER_LABEL;
     selectDistrictOfExamCenterLabel = SELECT_DISTRICT_OF_THE_EXAM_CENTER_LABEL;
     selectBlockOfExamCenterLabel = SELECT_BLOCK_OF_THE_EXAM_CENTER_LABEL;
     pincodeLabel = PINCODE_LABEL;
     nameOfSchoolLabel = NAME_OF_THE_SCHOOL_LABEL;
     isOthersPleaseEnterNameOfSchool = IS_OTHERS_PLEASE_ENTER_NAME_OF_THE_SCHOOL;
     boardNameLabel = BOARD_NAME_LABEL;
     isOthersPleaseEnterBoardName = IS_OTHERS_PLEASE_ENTER_BOARD_NAME;
     percentageLabel = PERCENTAGE_LABEL;
     attachClass8MarksheetLabel = ATTACH_CLASS_8_MARKSHEET_LABEL;

     class12DetailsLabel = CLASS_12_DETAILS_LABEL;
     scholarshipTypeLabel = SCHOLARSHIP_TYPE_LABEL;
     attachClass12MarksheetLabel = ATTACH_CLASS_12_MARKSHEET_LABEL;

    boardNameOptions 
    recordTypeId;
    userContactId;
    accountId;
    contactRecord;
    contactDetails;
    progressPercent ;
    applicationId;
    externalApplicationStatus;
    isDisableAcademicAllFields = false;

    class8ExamDistrictLabel;
    class12ExamDistrictLabel

    modeOfEducationOptions;

    // Class 12 details
    class12YearOfPassing;
    class12ModeOfEducation;
    class12SchoolName;
    class12BoardName;
    class12PassPercentage;
    class12FileName;
    class12FileUrl;
    class12ExamState;
    class12ExamDistrict;
    class12Pincode;
    class12ExamBlock;
    class12otherSchoolName;
    otherClass12BoardName;
    class12MarksheetBase64;

    file;
    class12FileType;
    isAadhaar = false;
    isClass12FileName = true;
    isLoading = false;

    @track class12Files = [];
    @track class12FilesNew = [];


    contactDOB;
    // Variable used for conditional rendering
    isClass12ModeOfEducationRegular=false;
    isClass12ModeOfEducationDistance=false;
    isOtherClass12SchoolName =false;
    isOtherClass12BoardName =false;
    isState12Selected =true;
    isDistrict12Selected =true;
    isBlock12Selected = true;
    isPincode12Selected = true;
    isFileAvailable;
    wiredAcademicDetails={};



    districtsOptions12 = [];
    filteredSchoolNameOptions12 = [];
    filteredBlockOptions12 = []

    districtsOptions=[];
    blockOption=[];
    schoolNameOptions=[];
    fileList =[];
    fetchError;
    fileNames = [];
    fileUrls = [];
    statesOptions = []; 
    selectedStateId = [];
    selectedDistrictId = [];
    selectedExamBlockId = [];
    selectedState = [];

    isEductionalDetailsSubmitted;
    updateProgressbarStatus;
    progressValue;

    @wire(getRecord, { recordId: '$applicationId', fields: [EXTERNAL_APPLICATION_STATUS] })
    wiredApplicationId(result) {
        const { error, data } = result;
        if (data) {
            this.externalApplicationStatus = data?.fields?.Application_External_Status__c;
            if(this.externalApplicationStatus.value === 'Draft'){
                this.isDisableAcademicAllFields = false;
            }else{    
                this.isDisableAcademicAllFields = true;
            }

        } else if (error) {
            this.showToast(Error_Label,error.body.message, 'error');
        }
    }
    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
            this.progressPercent = getFieldValue(data, APPLICATION_PROGRESS_PERCENT)
        } else if (error) {
            this.showToast(Error_Label, error.body.message , 'error');
        }
    }
    
    wiredFilesResult; // To store the wire result for refresh

    @wire(getFilesForRecord, { contactId: '$userContactId' })
    wiredFiles(result) {
        this.wiredFilesResult = result;
        console.log('File date----'+JSON.stringify(this.wiredFilesResult));
        const { error, data } = result;
        if (data) {
            this.processFiles(data);
        } else if (error) {
            console.error('Error fetching files:', error);
            this.fetchError = error.body.message;
        }
    }

    processFiles(data) {
        this.class12Files = [];
  

        data.forEach((file) => {
            let base64Prefix = '';
            if (file.title.endsWith('.pdf')) {
                base64Prefix = 'data:application/pdf;base64,';
            } else if (file.title.endsWith('.png')) {
                base64Prefix = 'data:image/png;base64,';
            } else if (file.title.endsWith('.jpg') || file.title.endsWith('.jpeg')) {
                base64Prefix = 'data:image/jpeg;base64,';
            } else if (file.title.endsWith('.img')) {
                base64Prefix = 'data:image/img;base64,';
            }

            const fileDataUrl = base64Prefix + file.base64Data;
            console.log('file name '+file.title);
            console.log('file name '+file.name);
            const fileDetails = {
                title: file.title,
                fileName: file.title,
                fileType: file.docType,
                base64: fileDataUrl,
                fileUrls: fileDataUrl 
            };
           

            if (file.docType === 'Class Twelve Marks Card') {
                this.class12Files = [...this.class12Files, fileDetails];
            } 
        });

    }

    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredContactRecord({ error, data }) {
        this.wiredAcademicDetails = data;
        if (data) {
            this.contactRecord = data;
            this.recordTypeId = data?.recordTypeId;
            this.contactDOB = data?.fields?.Birthdate?.value;
            this.isEductionalDetailsSubmitted = data?.fields?.Is_Education_Details_Completed__c?.value;

            this.updateProgressbarStatus = data?.fields?.Application_Forms_Progress_Percent__c?.value;


            this.loadContactDetails(this.contactRecord);
            this.handleConditionalRendering();
        } else if (error) {
            this.showToast(Error_Label, error.body.message , 'error');
        }
    }
    @wire(getPicklistValues, { recordTypeId:'$recordTypeId', fieldApiName: MODE_OF_EDUCATION_OPTIONS })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.modeOfEducationOptions = data.values;
        } else if (error) {
            this.showToast(Error_Label, error.body.message , 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId:'$recordTypeId', fieldApiName: CLASS_TWELVE_BOARD_NAME })
    wiredBoardNamePicklistValues({ error, data }) {
        if (data) {
            this.boardNameOptions = data.values;
        } else if (error) {
            this.showToast(Error_Label, error.body.message , 'error');
        }
    }
  loadContactDetails(data) {
        this.class12BoardName = data?.fields?.Class_Twelve_Board_Name__c?.value;
        if(this.class12BoardName){
            if(this.isDisableAcademicAllFields === false){
                this.isBlock12Selected = false;
            }
        }
        
    
        this.otherClass12BoardName = data?.fields?.Class_Twelve_Other_Board_Name__c?.value;
        this.class12ModeOfEducation = data?.fields?.Class_Twelve_Education_Mode__c?.value;
        this.isClass12ModeOfEducationRegular = this.class12ModeOfEducation === 'Regular';
    
        this.class12ExamState = data?.fields?.Class_Twelve_Exam_Centre_State__c?.value;
        if (this.class12ExamState) {
            const stateOption = this.statesOptions.find(option => option.value === this.class12ExamState);
            this.selectedStateId = stateOption ? stateOption.Id : '';
            if (this.selectedStateId) {
                this.loadDistrictPicklistValues(this.selectedStateId, 12)
                    .then(() => {
                        this.class12ExamDistrict = data?.fields?.Class_Twelve_Exam_Centre_District__c?.value;
                        if (this.class12ExamDistrict) {
                            if(this.isDisableAcademicAllFields === false){
                                this.isState12Selected=false;
                            }
                            const distOption = this.districtsOptions12.find(option => option.value === this.class12ExamDistrict);
                            const selectedDistrictId = distOption ? distOption.Id : '';
                            if (selectedDistrictId) {
                                this.loadBlockPicklistValues(selectedDistrictId, 12)
                                    .then(() => {
                                        this.class12ExamBlock = data?.fields?.Class_Twelve_Exam_Center_Block__c?.value;
                                        this.class12SchoolName = data?.fields?.Class_Twelve_Name_Of_School__c?.value;
                                        if (this.class12SchoolName) {
                                            const classNumber = 12;
                                            this.loadSchoolPicklistValues(this.class12ExamState, this.class12ExamDistrict, this.class12ExamBlock, classNumber);
                                            if(this.isDisableAcademicAllFields === false){
                                                this.Isclass12SchoolName = false;
                                            }
                                            this.isOtherClass12SchoolName = this.class12SchoolName === 'Others';
                                        }
                                    });
                            }
                        }
                    });
            }
        }
    
        this.class12Pincode = data?.fields?.Class_Twelve_Exam_Centre_Pincode__c?.value;
        this.class12ExamBlock = data?.fields?.Class_Twelve_Exam_Center_Block__c?.value;
        if (this.class12ExamBlock) {
            this.filteredBlockOptions12 = [{ label: this.class12ExamBlock, value: this.class12ExamBlock }];
            if(this.isDisableAcademicAllFields === false){
                this.isDistrict12Selected = false;
            }
        }
        this.class12otherSchoolName = data?.fields?.Class_Twelve_Other_Name_Of_School__c?.value;
        this.class12Percentage = data?.fields?.Class_Twelve_Pass_Percentage__c?.value;
        this.class12YearOfPassing = data?.fields?.Class_Twelve_Year_Of_Passing__c?.value;
    
        if (this.fileNames.length > 0) {
            this.class12FileName = this.fileNames[2];
        }
    }
}